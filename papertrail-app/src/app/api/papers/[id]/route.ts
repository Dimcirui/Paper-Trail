import { NextRequest, NextResponse } from "next/server";
import { mysqlPool } from "@/lib/mysql";
import { authorizeRequest } from "../auth";
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
