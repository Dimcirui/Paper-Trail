import { NextRequest } from "next/server";
import { GET, PATCH } from "../[id]/route";
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from "@prisma/client/runtime/library";

const mockQuery = jest.fn();
const mockPaperUpdate = jest.fn();

jest.mock("@/lib/mysql", () => ({
  mysqlPool: {
    query: (...args: unknown[]) => mockQuery(...args),
  },
}));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    paper: {
      update: (...args: unknown[]) => mockPaperUpdate(...args),
    },
  },
}));

jest.mock("@prisma/client/runtime/library", () => {
  const actual = jest.requireActual(
    "@prisma/client/runtime/library",
  ) as Record<string, unknown>;
  class MockKnownRequestError extends Error {}
  class MockValidationError extends Error {}
  return {
    ...actual,
    PrismaClientKnownRequestError: MockKnownRequestError,
    PrismaClientValidationError: MockValidationError,
  };
});

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

describe("PATCH /api/papers/[id]", () => {
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

  const createRequest = (body?: Record<string, unknown>, role = "admin") =>
    new NextRequest("http://localhost/api/papers/1", {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
      headers: new Headers({
        authorization: "Bearer test-token",
        "x-user-role": role,
        "content-type": "application/json",
      }),
    });

  it("rejects unauthorized requests", async () => {
    const request = new NextRequest("http://localhost/api/papers/1", {
      method: "PATCH",
    });
    const response = await PATCH(request, { params: { id: "1" } });
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(payload.error).toMatch(/Missing Authorization/i);
  });

  it("rejects read-only roles", async () => {
    const request = createRequest({ title: "New" }, "viewer");
    const response = await PATCH(request, { params: { id: "1" } });
    const payload = await response.json();

    expect(response.status).toBe(403);
    expect(payload.error).toMatch(/Insufficient permissions/i);
  });

  it("validates payload fields", async () => {
    const request = createRequest({});
    const response = await PATCH(request, { params: { id: "1" } });
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toMatch(/Include at least one field/i);
  });

  it("updates paper metadata when payload is valid", async () => {
    mockPaperUpdate.mockResolvedValue({ id: 1 });
    const request = createRequest({
      title: "Updated",
      status: "Draft",
    });

    const response = await PATCH(request, { params: { id: "1" } });
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.paper).toEqual({ id: 1 });
    expect(mockPaperUpdate).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { title: "Updated", status: "Draft" },
    });
  });

  it("maps Prisma known request errors", async () => {
    mockPaperUpdate.mockRejectedValue(
      new PrismaClientKnownRequestError("bad", {
        code: "P2002",
        clientVersion: "1",
      }),
    );

    const request = createRequest({ title: "Updated", status: "Draft" });
    const response = await PATCH(request, { params: { id: "1" } });
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toMatch(/Database error/i);
  });

  it("maps validation errors", async () => {
    mockPaperUpdate.mockRejectedValue(
      new PrismaClientValidationError("invalid", { clientVersion: "1" }),
    );

    const request = createRequest({ title: "Updated", status: "Draft" });
    const response = await PATCH(request, { params: { id: "1" } });
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toMatch(/Validation error/i);
  });

  it("returns 400 when params are invalid", async () => {
    const request = createRequest({ title: "Updated", status: "Draft" });
    const response = await PATCH(request, { params: { id: "abc" } });
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toMatch(/Invalid paper ID/i);
  });

  it("rejects payloads that fail schema validation", async () => {
    const request = createRequest({ title: "ab" });
    const response = await PATCH(request, { params: { id: "1" } });
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toMatch(/Invalid payload/i);
  });

  it("rejects unsupported statuses", async () => {
    const request = createRequest({ status: "Unknown" });
    const response = await PATCH(request, { params: { id: "1" } });
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toMatch(/Unsupported status/i);
  });

  it("updates abstract when provided", async () => {
    mockPaperUpdate.mockResolvedValue({ id: 1 });
    const request = createRequest({ abstract: "Updated abstract" });
    const response = await PATCH(request, { params: { id: "1" } });

    expect(response.status).toBe(200);
    expect(mockPaperUpdate).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { abstract: "Updated abstract" },
    });
  });

  it("handles unexpected errors", async () => {
    mockPaperUpdate.mockRejectedValue(new Error("boom"));
    const request = createRequest({ title: "Updated", status: "Draft" });
    const response = await PATCH(request, { params: { id: "1" } });
    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(payload.error).toMatch(/Unable to update paper/i);
  });
});
