import { NextRequest } from "next/server";
import { GET } from "../[id]/route";

const mockQuery = jest.fn();

jest.mock("@/lib/mysql", () => ({
  mysqlPool: {
    query: (...args: unknown[]) => mockQuery(...args),
  },
}));

describe("GET /api/papers/[id]", () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  const createRequest = () =>
    new NextRequest("http://localhost/api/papers/1", {
      headers: new Headers({
        authorization: "Bearer test-token",
        "x-user-role": "viewer",
      }),
    });

  it("returns 401 when authorization header is missing", async () => {
    const unauthorizedRequest = new NextRequest(
      "http://localhost/api/papers/1",
    );
    const response = await GET(unauthorizedRequest, {
      params: { id: "1" },
    });
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(payload.error).toMatch(/Missing Authorization/i);
  });

  it("rejects invalid paper IDs", async () => {
    const response = await GET(createRequest(), { params: { id: "abc" } });
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toMatch(/Invalid paper ID/i);
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it("returns 404 when no paper row is found", async () => {
    mockQuery.mockResolvedValue([[[], [], [], []]]);

    const response = await GET(createRequest(), { params: { id: "1" } });
    const payload = await response.json();

    expect(response.status).toBe(404);
    expect(payload.error).toMatch(/Paper not found/i);
  });

  it("returns overview data when stored procedure succeeds", async () => {
    const rows = [
      [{ id: 1, title: "Paper" }],
      [{ authorOrder: 1, userName: "User" }],
      [{ versionLabel: "v1", notes: "note" }],
      [{ actionType: "PAPER_CREATED" }],
    ];
    mockQuery.mockResolvedValue([rows]);

    const response = await GET(createRequest(), { params: { id: "1" } });
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.paper).toEqual(rows[0][0]);
    expect(payload.authors).toEqual(rows[1]);
    expect(payload.revisions).toEqual(rows[2]);
    expect(payload.activityLog).toEqual(rows[3]);
    expect(mockQuery).toHaveBeenCalledWith(
      "CALL sp_get_paper_overview(?);",
      [1],
    );
  });

  it("returns specific error when stored procedure response lacks arrays", async () => {
    mockQuery.mockResolvedValue([{} as never]);

    const response = await GET(createRequest(), { params: { id: "1" } });
    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(payload.error).toBe("Stored procedure returned invalid format.");
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Stored procedure returned invalid format.",
      { rows: {} },
    );
  });

  it("returns 500 when mysql query rejects", async () => {
    mockQuery.mockRejectedValue(new Error("db unavailable"));

    const response = await GET(createRequest(), { params: { id: "1" } });
    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(payload.error).toMatch(/Unable to fetch paper details/i);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Failed to fetch paper overview",
      expect.any(Error),
    );
  });

  it("defaults nested groups to empty arrays when missing", async () => {
    mockQuery.mockResolvedValue([
      [[{ id: 1, title: "Paper" }]],
    ]);

    const response = await GET(createRequest(), { params: { id: "1" } });
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(payload.authors)).toBe(true);
    expect(Array.isArray(payload.revisions)).toBe(true);
    expect(Array.isArray(payload.activityLog)).toBe(true);
    expect(payload.authors).toHaveLength(0);
    expect(payload.revisions).toHaveLength(0);
    expect(payload.activityLog).toHaveLength(0);
  });

  it("ignores non-array groups from stored procedure output", async () => {
    const rows = [
      [{ id: 1, title: "Paper" }],
      { unexpected: true },
      [{ versionLabel: "v1" }],
      [{ actionType: "LOG" }],
      [{ authorOrder: 1, userName: "User" }],
    ];
    mockQuery.mockResolvedValue([rows]);

    const response = await GET(createRequest(), { params: { id: "1" } });
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(payload.authors)).toBe(true);
    expect(payload.authors).toHaveLength(1);
  });

  it("returns 404 when procedure output lacks any array groups", async () => {
    mockQuery.mockResolvedValue([[{ unexpected: true }]]);

    const response = await GET(createRequest(), { params: { id: "1" } });
    const payload = await response.json();

    expect(response.status).toBe(404);
    expect(payload.error).toMatch(/Paper not found/i);
  });
});
