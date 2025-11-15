import { NextRequest, NextResponse } from "next/server";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
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

/**
 * Validates the request's Authorization header against the configured API_AUTH_TOKEN.
 *
 * @param req - The incoming NextRequest whose `Authorization` header will be checked.
 * @returns An object with `authorized: true` when the request is allowed; otherwise `authorized: false` and a `message` explaining the failure (e.g., missing header or invalid credentials). If `API_AUTH_TOKEN` is not set, authorization is treated as allowed and `authorized: true` is returned.
 */
function authorizeRequest(req: NextRequest) {
  const token = process.env.API_AUTH_TOKEN;
  if (!token) {
    console.warn("API_AUTH_TOKEN not set. Requests are temporarily allowed.");
    return { authorized: true };
  }
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return { authorized: false, message: "Missing Authorization header." };
  }
  if (authHeader !== `Bearer ${token}`) {
    return { authorized: false, message: "Invalid credentials." };
  }
  return { authorized: true };
}

/**
 * Retrieve up to 10 most recently updated non-deleted papers, including venue, primary contact (userName and email), and topics.
 *
 * @returns A NextResponse JSON object containing `{ papers: Paper[] }` on success; a 401 JSON error response when authorization fails; or a 500 JSON error response if a database error occurs.
export async function GET(req: NextRequest) {
  const auth = authorizeRequest(req);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.message }, { status: 401 });
  }

  try {
    const papers = await prisma.paper.findMany({
      take: 10,
      where: { isDeleted: false },
      orderBy: { updatedAt: "desc" },
      include: {
        venue: true,
        primaryContact: {
          select: { userName: true, email: true },
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
        status: payload.status ?? "Draft",
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
    return NextResponse.json(
      { error: "Unable to create paper. Check database connection." },
      { status: 500 },
    );
  }
}