import { NextResponse } from "next/server";

export async function GET() {
  const dbUrl = process.env.DATABASE_URL;

  return NextResponse.json({
    service: "PaperTrail API",
    databaseConfigured: Boolean(dbUrl),
    timestamp: new Date().toISOString(),
    message: dbUrl
      ? "Environment ready. Run `npx prisma migrate dev` after updating schema."
      : "DATABASE_URL is missing. Copy .env.example to .env.local and adjust credentials.",
  });
}
