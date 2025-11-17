import { NextRequest, NextResponse } from "next/server";
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from "@prisma/client/runtime/library";
import { prisma } from "@/lib/prisma";

type PaperPayload = {
  title?: string;
  abstract?: string;
  status?: string;
  submissionDate?: string;
  publicationDate?: string;
  pdfUrl?: string;
  primaryContactId?: number;
  venueId?: number;
};

const PAPER_STATUSES = [
  "Draft",
  "Submitted",
  "UnderReview",
  "Accepted",
  "Published",
  "Rejected",
  "Withdrawn",
] as const;

type PaperStatus = (typeof PAPER_STATUSES)[number];
const DEFAULT_PAPER_STATUS: PaperStatus = "Draft";

const isPaperStatus = (value: unknown): value is PaperStatus =>
  typeof value === "string" &&
  PAPER_STATUSES.includes(value as PaperStatus);

const WRITE_ROLES = new Set(["admin", "principal_investigator"]);
const EMAIL_ROLES = new Set(["admin", "principal_investigator"]);

function authorizeRequest(req: NextRequest) {
  const token = process.env.API_AUTH_TOKEN;
  if (!token) {
    console.error("API_AUTH_TOKEN is not configured. Requests are denied.");
    return {
      authorized: false,
      message: "Server configuration error. Contact administrator.",
    };
  }
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return { authorized: false, message: "Missing Authorization header." };
  }
  if (authHeader !== `Bearer ${token}`) {
    return { authorized: false, message: "Invalid credentials." };
  }
  const role =
    req.headers.get("x-user-role")?.toLowerCase() ?? "viewer";
  return { authorized: true, role };
}

/**
 * Retrieve up to 10 most recently updated non-deleted papers, including venue, primary contact, and topics.
 */
export async function GET(req: NextRequest) {
  const auth = authorizeRequest(req);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.message }, { status: 401 });
  }

  const includeEmail = auth.role ? EMAIL_ROLES.has(auth.role) : false;

  try {
    const papers = await prisma.paper.findMany({
      take: 10,
      where: { isDeleted: false },
      orderBy: { updatedAt: "desc" },
      include: {
        venue: true,
        primaryContact: includeEmail
          ? {
              select: { userName: true, email: true },
            }
          : {
              select: { userName: true },
            },
        topics: {
          select: {
            topic: true,
          },
        },
      },
    });

    return NextResponse.json({ papers });
  } catch (error: unknown) {
    console.error("Failed to fetch papers", error);
    return NextResponse.json(
      { error: "Database not ready yet. Run migrations and try again." },
      { status: 500 },
    );
  }
}

/**
 * Create a new paper from the request JSON payload and return the created paper.
 *
 * Validates authorization and required fields (`title`, `primaryContactId`), verifies that the referenced primary contact (and venue, if provided) exist, and inserts the paper with sensible defaults for optional fields.
 *
 * @returns `NextResponse` containing `{ paper }` with status `201` on success. Returns JSON `{ error }` with status `401` for missing/invalid authorization, `400` for validation or bad input (including invalid JSON or non-existent referenced records), or `500` for unexpected server/database errors.
 */
export async function POST(req: NextRequest) {
  const auth = authorizeRequest(req);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.message }, { status: 401 });
  }
  if (!auth.role || !WRITE_ROLES.has(auth.role)) {
    return NextResponse.json(
      { error: "Insufficient permissions." },
      { status: 403 },
    );
  }

  let payload: PaperPayload;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON in request body." },
      { status: 400 },
    );
  }

  if (!payload?.title || !payload?.primaryContactId) {
    return NextResponse.json(
      { error: "title and primaryContactId are required" },
      { status: 400 },
    );
  }

  const [contactExists, venueExists] = await Promise.all([
    prisma.user.count({ where: { id: payload.primaryContactId } }),
    payload.venueId
      ? prisma.venue.count({ where: { id: payload.venueId } })
      : Promise.resolve(1),
  ]);

  if (!contactExists) {
    return NextResponse.json(
      { error: "primaryContactId does not exist." },
      { status: 400 },
    );
  }

  if (payload.venueId && !venueExists) {
    return NextResponse.json(
      { error: "venueId does not exist." },
      { status: 400 },
    );
  }

  try {
    const paper = await prisma.paper.create({
      data: {
        title: payload.title,
        abstract: payload.abstract ?? "",
        status: isPaperStatus(payload.status)
          ? payload.status
          : DEFAULT_PAPER_STATUS,
        submissionDate: payload.submissionDate
          ? new Date(payload.submissionDate)
          : null,
        publicationDate: payload.publicationDate
          ? new Date(payload.publicationDate)
          : null,
        pdfUrl: payload.pdfUrl,
        primaryContactId: payload.primaryContactId,
        venueId: payload.venueId,
      },
    });

    return NextResponse.json({ paper }, { status: 201 });
  } catch (error: unknown) {
    console.error("Failed to create paper", error);
    if (error instanceof PrismaClientKnownRequestError) {
      return NextResponse.json(
        { error: `Invalid data: ${error.message}` },
        { status: 400 },
      );
    }
    if (error instanceof PrismaClientValidationError) {
      return NextResponse.json(
        { error: "Invalid payload. Check field types and enums." },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Unable to create paper. Check database connection." },
      { status: 500 },
    );
  }
}

/**
 * Soft delete a paper by its ID, using a stored procedure.
 * Instead of Prisma.delete, we call a stored procedure `sp_soft_delete_paper`
 *   to enforce audit logging and business rules at the database level.
 */
export async function DELETE(req: NextRequest) {
  const auth = authorizeRequest(req);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.message }, { status: 401 });
  }

  if (auth.role !== "admin") {
    return NextResponse.json(
      { error: "Insufficient permissions. Only admins can delete papers." },
      { status: 403 },
    );
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Paper id is required for deletion." },
      { status: 400 },
    );
  }

  const paperId = parseInt(id, 10);
  if (isNaN(paperId)) {
    return NextResponse.json(
      { error: "Invalid paper id." },
      { status: 400 },
    );
  }

  try {
    // Use a stored procedure to soft delete the paper rather than direct deletion.

    // Actor ID is hardcoded for now; in a real app, this would come from the authenticated user context.
    const actorId = 1;

    await prisma.$executeRaw`CALL sp_soft_delete_paper(${paperId}, ${actorId})`;

    return NextResponse.json(
      { message: `Paper with id ${id} has been soft deleted successfully.` },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("Failed to delete paper", error);

    return NextResponse.json(
      { error: "Unable to delete paper. Check database connection." },
      { status: 500 },
    );
  }
}