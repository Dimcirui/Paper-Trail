import { NextResponse } from "next/server";

/**
 * Provides a JSON health status for the PaperTrail API.
 *
 * @returns A `NextResponse` with a JSON payload containing:
 * - `service`: the service name,
 * - `databaseConfigured`: `true` if `DATABASE_URL` is set, `false` otherwise,
 * - `timestamp`: current time as an ISO string,
 * - `message`: a guidance string appropriate to the database configuration state.
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