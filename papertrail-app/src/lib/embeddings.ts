import OpenAI from "openai";
import { prisma } from "@/lib/prisma";

export async function generateAndSaveEmbedding(
  paperId: number,
  title: string,
): Promise<void> {
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: title,
    });

    const vector = response.data[0].embedding;
    const vectorString = `[${vector.join(",")}]`;

    await prisma.$executeRaw`
      UPDATE "Paper" SET embedding = ${vectorString}::vector WHERE id = ${paperId}
    `;
  } catch (error) {
    console.error(`Failed to generate embedding for paper ${paperId}`, error);
  }
}
