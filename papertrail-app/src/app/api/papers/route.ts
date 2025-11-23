import { NextRequest, NextResponse } from "next/server";
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from "@prisma/client/runtime/library";
import { prisma } from "@/lib/prisma";
import { PAPER_STATUSES, type PaperStatus } from "@/lib/papers";
import {
  authorizeRequest,
  canIncludeEmails,
  hasWritePermission,
} from "./auth";

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

const DEFAULT_PAPER_STATUS: PaperStatus = "Draft";

const isPaperStatus = (value: unknown): value is PaperStatus => {
  if (typeof value !== "string") {
    console.error("Invalid status type received.", { value });
    return false;
  }
  return PAPER_STATUSES.includes(value as PaperStatus);
};

/**
 * Retrieve up to 10 most recently updated non-deleted papers, including venue, primary contact, and topics.
 */
export async function GET(req: NextRequest) {
  const auth = authorizeRequest(req);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.message }, { status: 401 });
  }

  const includeEmail = canIncludeEmails(auth.role);

  try {
    const papers = await prisma.paper.findMany({
      take: 20,
      where: whereClause,
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
 */
export async function POST(req: NextRequest) {
  const auth = authorizeRequest(req);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.message }, { status: 401 });
  }
  if (!hasWritePermission(auth.role)) {
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

  if (!payload || !payload.title || !payload.primaryContactId) {
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

/**
 * Update paper details (Title, Abstract) OR Status.
 * - Status changes trigger `sp_update_paper_status` (for audit logging).
 * - Metadata changes use standard Prisma update.
 */
export async function PATCH(req: NextRequest) {
  const auth = authorizeRequest(req);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.message }, { status: 401 });
  }

  if (!["admin", "principal_investigator", "contributor"].includes(auth.role ?? "")) {
    return NextResponse.json(
      { error: "Insufficient permissions." },
      { status: 403 },
    );
  }

  let payload;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON in request body." },
      { status: 400 },
    );
  }

  if (payload.isDeleted === false) {
    try {
      await prisma.paper.update({
        where: { id: payload.id },
        data: { 
          isDeleted: false,
          status: 'Draft'
        },
    });

    return NextResponse.json(
      { message: `Paper with id ${payload.id} has been restored successfully.` },
      { status: 200 },
    );
    } catch (error) {
      console.error("Failed to restore paper", error);
      return NextResponse.json(
        { error: "Unable to restore paper. Check database connection." },
        { status: 500 },
      );
    }
  }

  if (!payload.id) {
    return NextResponse.json(
      { error: "Paper id is required for update." },
      { status: 400 },
    );
  }

  try {
    if (payload.status) {
      const actorId = 1; // Hardcoded for demo; replace with authenticated user ID in real app

      await prisma.$executeRaw`CALL sp_update_paper_status(${payload.id}, ${payload.status}, ${actorId})`;
  }

  if (payload.title || payload.abstract) {
      await prisma.paper.update({
        where: { id: payload.id },
        data: {
          ...(payload.title && { title: payload.title }),
          ...(payload.abstract && { abstract: payload.abstract }),
        },
      });
    }

    return NextResponse.json(
      { message: `Paper with id ${payload.id} has been updated successfully.` },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("Failed to update paper", error);
    return NextResponse.json(
      { error: "Unable to update paper. Check database connection." },
      { status: 500 },
    );
  }
}