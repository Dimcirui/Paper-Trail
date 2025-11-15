import { NextResponse } from "next/server";

/**
 * Provide a health payload describing service name, database configuration status, timestamp, and guidance message for the PaperTrail API.
 *
 * @returns A JSON object containing:
 * - `service`: the service name `"PaperTrail API"`.
 * - `databaseConfigured`: `true` if the `DATABASE_URL` environment variable is set, `false` otherwise.
 * - `timestamp`: the current time as an ISO 8601 string.
 * - `message`: a human-readable instruction — if `DATABASE_URL` is set, guidance to run Prisma migrations after schema changes; otherwise instructions to copy `.env.example` to `.env.local` and update credentials.
 */
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