import { NextRequest, NextResponse } from "next/server";
import { PaperStatus } from "@prisma/client";
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

const isPaperStatus = (value: unknown): value is PaperStatus =>
  typeof value === "string" &&
  (Object.values(PaperStatus) as string[]).includes(value);

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
        status: isPaperStatus(payload.status)
          ? payload.status
          : PaperStatus.Draft,
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
