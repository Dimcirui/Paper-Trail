import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getEmbedding } from "@/lib/embeddings";
import { askLLM } from "@/lib/llm";
import { authorizeRequest } from "../auth";

const askSchema = z.object({
  question: z.string().min(3),
});

type PaperSummary = {
  id: number;
  title: string;
  abstract: string | null;
  status: string;
  authors: string[];
};

export async function POST(req: NextRequest) {
  const auth = authorizeRequest(req);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.message }, { status: 401 });
  }

  const body = askSchema.safeParse(await req.json().catch(() => ({})));
  if (!body.success) {
    return NextResponse.json(
      { error: "question must be at least 3 characters." },
      { status: 400 },
    );
  }

  const { question } = body.data;
  const role = auth.role ?? "viewer";
  const isRestrictedRole = role === "admin" || role === "principal_investigator";

  let queryVector: number[];
  try {
    queryVector = await getEmbedding(question);
  } catch (error) {
    console.error("Failed to generate embedding for question", error);
    return NextResponse.json(
      { error: "Failed to process question embedding." },
      { status: 500 },
    );
  }

  const vectorString = `[${queryVector.join(",")}]`;

  type RagRow = { id: number };
  let rows: RagRow[];

  if (!isRestrictedRole) {
    rows = await prisma.$queryRaw<RagRow[]>`
      SELECT id FROM "Paper"
      WHERE "isDeleted" = false
        AND status = 'Published'
        AND embedding IS NOT NULL
      ORDER BY embedding <-> ${vectorString}::vector
      LIMIT 5
    `;
  } else {
    rows = await prisma.$queryRaw<RagRow[]>`
      SELECT id FROM "Paper"
      WHERE "isDeleted" = false
        AND embedding IS NOT NULL
      ORDER BY embedding <-> ${vectorString}::vector
      LIMIT 5
    `;
  }

  const ids = rows.map((r) => r.id);

  const papers = await prisma.paper.findMany({
    where: { id: { in: ids } },
    select: {
      id: true,
      title: true,
      abstract: true,
      status: true,
      authors: {
        select: { user: { select: { userName: true } } },
        orderBy: { authorOrder: "asc" },
      },
    },
  });

  const orderedPapers = ids
    .map((id) => papers.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => p !== undefined);

  const sources: PaperSummary[] = orderedPapers.map((p) => ({
    id: p.id,
    title: p.title,
    abstract: p.abstract,
    status: p.status,
    authors: p.authors.map((a) => a.user.userName),
  }));

  let systemPrompt: string;
  if (sources.length === 0) {
    systemPrompt =
      "你是 PaperTrail 研究助手。当前没有找到与问题相关的论文，请如实告知用户未找到相关论文。";
  } else {
    const paperList = sources
      .map(
        (p, i) =>
          `[${i + 1}] 《${p.title}》 | 状态: ${p.status}${p.abstract ? ` | 摘要: ${p.abstract}` : ""}`,
      )
      .join("\n");
    systemPrompt = `你是 PaperTrail 研究助手。根据以下论文信息回答用户问题，回答简洁，引用具体论文时注明标题。

【相关论文】
${paperList}

若检索到的论文无法回答问题，请如实告知。`;
  }

  let answer: string;
  try {
    answer = await askLLM(systemPrompt, question);
  } catch (error) {
    console.error("DeepSeek LLM call failed", error);
    return NextResponse.json(
      { error: "Failed to generate answer from LLM." },
      { status: 500 },
    );
  }

  return NextResponse.json({ answer, sources });
}
