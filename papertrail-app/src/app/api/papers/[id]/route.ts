import { NextRequest, NextResponse } from "next/server";
import { mysqlPool } from "@/lib/mysql";
import { prisma } from "@/lib/prisma";
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

type StoredProcedureRow = Record<string, unknown>;

export async function GET(
  req: NextRequest,
  { params }: { params: { id?: string } },
) {
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
    const [rows] = await mysqlPool.query(
      "CALL sp_get_paper_overview(?);",
      [parsed.data.id],
    );

    if (!Array.isArray(rows)) {
      console.error("Stored procedure returned invalid format.", { rows });
      return NextResponse.json(
        { error: "Stored procedure returned invalid format." },
        { status: 500 },
      );
    }

    const resultGroups = (rows as unknown[])
      .filter((group) => Array.isArray(group))
      .map((group) => group as StoredProcedureRow[]);

    const [paperGroup = [], authors = [], revisions = [], activityLog = []] =
      resultGroups;

    const paper = paperGroup[0];
    if (!paper) {
      return NextResponse.json(
        { error: "Paper not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      paper,
      authors,
      revisions,
      activityLog,
    });
  } catch (error) {
    console.error("Failed to fetch paper overview", error);
    return NextResponse.json(
      { error: "Unable to fetch paper details at this time." },
      { status: 500 },
    );
  }
}

const updateSchema = z.object({
  title: z.string().min(3).optional(),
  abstract: z.string().optional(),
  status: z.string().optional(),
});

const isPaperStatus = (value: unknown): value is PaperStatus =>
  typeof value === "string" &&
  PAPER_STATUSES.includes(value as PaperStatus);

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id?: string } },
) {
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
    updateData.abstract = payload.data.abstract;
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
