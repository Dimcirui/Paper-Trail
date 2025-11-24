import { NextResponse } from "next/server";
import { GET } from "../route";

describe("GET /api/health", () => {
  const originalEnv = process.env.DATABASE_URL;

  afterEach(() => {
    process.env.DATABASE_URL = originalEnv;
  });

  it("reports database configured when DATABASE_URL is set", async () => {
    process.env.DATABASE_URL = "mysql://user:pass@localhost:3306/papertrail";

    const response = (await GET()) as NextResponse;
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.service).toBe("PaperTrail API");
    expect(payload.databaseConfigured).toBe(true);
    expect(payload.message).toContain("Environment ready");
  });

  it("reports database misconfigured when DATABASE_URL is missing", async () => {
    delete process.env.DATABASE_URL;

    const response = (await GET()) as NextResponse;
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.service).toBe("PaperTrail API");
    expect(payload.databaseConfigured).toBe(false);
    expect(payload.message).toContain("DATABASE_URL is missing");
  });
});
