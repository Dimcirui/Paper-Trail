/**
 * One-time backfill script: generates embeddings for all papers that don't have one.
 *
 * Run with:
 *   npx ts-node --project tsconfig.json -r tsconfig-paths/register scripts/backfill-embeddings.ts
 *
 * Processes papers sequentially to respect OpenAI rate limits.
 * Skips and logs any paper that fails — does not abort the whole run.
 */

import * as dotenv from "dotenv";
import * as path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

import OpenAI from "openai";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const DELAY_MS = 100; // ~600 RPM, well within the 3000 RPM limit

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const papers = await prisma.$queryRaw<{ id: number; title: string; abstract: string | null }[]>`
    SELECT id, title, abstract FROM "Paper" WHERE embedding IS NULL AND "isDeleted" = false
  `;

  console.log(`Found ${papers.length} papers without embeddings.`);

  let succeeded = 0;
  let failed = 0;

  for (const paper of papers) {
    try {
      const input = paper.abstract ? `${paper.title}. ${paper.abstract}` : paper.title;
      const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input,
      });

      const vector = response.data[0].embedding;
      const vectorString = `[${vector.join(",")}]`;

      await prisma.$executeRaw`
        UPDATE "Paper" SET embedding = ${vectorString}::vector WHERE id = ${paper.id}
      `;

      succeeded++;
      console.log(`[${succeeded + failed}/${papers.length}] Paper ${paper.id} — OK`);
    } catch (error) {
      failed++;
      console.error(`[${succeeded + failed}/${papers.length}] Paper ${paper.id} — FAILED`, error);
    }

    await sleep(DELAY_MS);
  }

  console.log(`\nDone. ${succeeded} succeeded, ${failed} failed.`);
}

main()
  .catch((error) => {
    console.error("Backfill script crashed:", error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
