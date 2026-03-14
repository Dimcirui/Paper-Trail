import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateAndSaveEmbedding } from "@/lib/embeddings";
import { PAPER_STATUSES, type PaperStatus } from "@/lib/papers";
import { authorizeRequest, hasWritePermission } from "../auth";
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from "@prisma/client/runtime/library";
import { z } from "zod";

const paramsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const params = await context.params;
  const auth = authorizeRequest(req);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.message }, { status: 401 });
  }

  const parsed = paramsSchema.safeParse(params);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid paper ID. Must be a positive integer." },
      { status: 400 },
    );
  }

  try {
    const result = await prisma.paper.findUnique({
      where: { id: parsed.data.id },
      include: {
        primaryContact: { select: { userName: true } },
        venue: { select: { venueName: true } },
        authors: {
          select: {
            authorOrder: true,
            contributionNotes: true,
            user: { select: { userName: true, email: true } },
          },
          orderBy: { authorOrder: "asc" },
        },
        revisions: {
          select: {
            versionLabel: true,
            notes: true,
            createdAt: true,
            author: { select: { userName: true } },
          },
          orderBy: { createdAt: "desc" },
        },
        activityLogs: {
          select: {
            actionType: true,
            actionDetail: true,
            timestamp: true,
            user: { select: { userName: true } },
          },
          orderBy: { timestamp: "desc" },
        },
      },
    });

    if (!result) {
      return NextResponse.json({ error: "Paper not found." }, { status: 404 });
    }

    const { primaryContact, venue, authors, revisions, activityLogs, ...paperData } = result;

    return NextResponse.json({
      paper: {
        ...paperData,
        primaryContactName: primaryContact.userName,
        venueName: venue?.venueName ?? null,
      },
      authors: authors.map((a) => ({
        authorOrder: a.authorOrder,
        userName: a.user.userName,
        email: a.user.email,
        contributionNotes: a.contributionNotes,
      })),
      revisions: revisions.map((r) => ({
        versionLabel: r.versionLabel,
        notes: r.notes,
        createdAt: r.createdAt,
        authorName: r.author?.userName ?? null,
      })),
      activityLog: activityLogs.map((log) => ({
        actionType: log.actionType,
        actionDetail: log.actionDetail,
        timestamp: log.timestamp,
        userName: log.user?.userName ?? null,
      })),
    });
  } catch (error) {
    console.error("Failed to fetch paper overview", error);
    return NextResponse.json(
      { error: "Unable to fetch paper details at this time." },
      { status: 500 },
    );
  }
}

const MAX_ABSTRACT_LENGTH = 191;
const abstractSchema = z.string().max(MAX_ABSTRACT_LENGTH);

const updateSchema = z.object({
  title: z.string().min(3).max(191).optional(),
  abstract: abstractSchema.optional(),
  status: z.string().optional(),
  isDeleted: z.boolean().optional(),
});

const isPaperStatus = (value: unknown): value is PaperStatus =>
  typeof value === "string" &&
  PAPER_STATUSES.includes(value as PaperStatus);

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const params = await context.params;
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

  const parsed = paramsSchema.safeParse(params);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid paper ID." },
      { status: 400 },
    );
  }

  const payload = updateSchema.safeParse(await req.json().catch(() => ({})));
  if (!payload.success) {
    return NextResponse.json(
      { error: "Invalid payload." },
      { status: 400 },
    );
  }

  const updateData: Record<string, unknown> = {};
  if (payload.data.title) {
    updateData.title = payload.data.title;
  }
  if (payload.data.abstract !== undefined) {
    const normalizedAbstract = abstractSchema.parse(payload.data.abstract);
    updateData.abstract = normalizedAbstract.slice(0, MAX_ABSTRACT_LENGTH);
  }
  if (payload.data.status) {
    if (!isPaperStatus(payload.data.status)) {
      return NextResponse.json(
        { error: "Unsupported status value." },
        { status: 400 },
      );
    }
    updateData.status = payload.data.status;
  }

  if (payload.data.isDeleted !== undefined) {
      updateData.isDeleted = payload.data.isDeleted;
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json(
      { error: "Include at least one field to update." },
      { status: 400 },
    );
  }

  try {
    const updated = await prisma.paper.update({
      where: { id: parsed.data.id },
      data: updateData,
    });

    if (payload.data.title || payload.data.abstract !== undefined) {
      void generateAndSaveEmbedding(updated.id, updated.title);
    }

    return NextResponse.json({ paper: updated });
  } catch (error) {
    console.error("Failed to update paper", error);
    if (error instanceof PrismaClientKnownRequestError) {
      return NextResponse.json(
        { error: `Database error: ${error.message}` },
        { status: 400 },
      );
    }
    if (error instanceof PrismaClientValidationError) {
      return NextResponse.json(
        { error: "Validation error while updating paper." },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Unable to update paper right now." },
      { status: 500 },
    );
  }
}
