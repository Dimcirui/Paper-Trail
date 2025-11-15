import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Retrieve up to 10 papers ordered by most recently updated, including each paper's venue, primary contact (username and email), and topics.
 *
 * @returns A NextResponse containing an object with a `papers` array of paper records on success; on failure, a 500-response object with an `error` message indicating the database issue.
 */
export async function GET() {
  try {
    const papers = await prisma.paper.findMany({
      take: 10,
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
  } catch (error) {
    console.error("Failed to fetch papers", error);
    return NextResponse.json(
      { error: "Database not ready yet. Run migrations and try again." },
      { status: 500 },
    );
  }
}

/**
 * Create a new paper from the JSON body of the request.
 *
 * Expects a JSON payload containing at minimum `title` and `primaryContactId`; other optional fields:
 * `abstract`, `status`, `submissionDate`, `publicationDate`, `pdfUrl`, and `venueId`.
 *
 * @param req - The incoming NextRequest whose JSON body is used to create the paper.
 * @returns A NextResponse containing `{ paper }` with status 201 on success, or an error object with status 400 (validation failure) or 500 (creation/database failure).
 */
export async function POST(req: NextRequest) {
  const payload = await req.json();

  if (!payload?.title || !payload?.primaryContactId) {
    return NextResponse.json(
      { error: "title and primaryContactId are required" },
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
  } catch (error) {
    console.error("Failed to create paper", error);
    return NextResponse.json(
      { error: "Unable to create paper. Check database connection." },
      { status: 500 },
    );
  }
}