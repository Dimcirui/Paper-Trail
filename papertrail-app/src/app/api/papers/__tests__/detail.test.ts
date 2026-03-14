import { NextRequest } from "next/server";
import { GET, PATCH } from "../[id]/route";
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from "@prisma/client/runtime/library";

const mockPaperFindUnique = jest.fn();
const mockPaperUpdate = jest.fn();

jest.mock("@/lib/prisma", () => ({
  prisma: {
    paper: {
      findUnique: (...args: unknown[]) => mockPaperFindUnique(...args),
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
    expect(mockPaperFindUnique).not.toHaveBeenCalled();
  });

  it("returns 404 when paper is not found", async () => {
    mockPaperFindUnique.mockResolvedValue(null);

    const response = await GET(createRequest(), { params: { id: "1" } });
    const payload = await response.json();

    expect(response.status).toBe(404);
    expect(payload.error).toMatch(/Paper not found/i);
  });

  it("returns paper overview when found", async () => {
    mockPaperFindUnique.mockResolvedValue({
      id: 1,
      title: "Test Paper",
      status: "Draft",
      submissionDate: null,
      publicationDate: null,
      isDeleted: false,
      primaryContact: { userName: "Alice" },
      venue: { venueName: "ICML" },
      authors: [
        {
          authorOrder: 1,
          contributionNotes: "Lead author",
          user: { userName: "Alice", email: "alice@example.com" },
        },
      ],
      revisions: [
        {
          versionLabel: "v1",
          notes: "Initial",
          createdAt: new Date("2024-01-01"),
          author: { userName: "Alice" },
        },
      ],
      activityLogs: [
        {
          actionType: "PAPER_CREATED",
          actionDetail: "Created",
          timestamp: new Date("2024-01-01"),
          user: { userName: "Alice" },
        },
      ],
    });

    const response = await GET(createRequest(), { params: { id: "1" } });
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.paper.id).toBe(1);
    expect(payload.paper.primaryContactName).toBe("Alice");
    expect(payload.paper.venueName).toBe("ICML");
    expect(payload.authors).toHaveLength(1);
    expect(payload.authors[0].userName).toBe("Alice");
    expect(payload.authors[0].email).toBe("alice@example.com");
    expect(payload.revisions).toHaveLength(1);
    expect(payload.revisions[0].authorName).toBe("Alice");
    expect(payload.activityLog).toHaveLength(1);
    expect(payload.activityLog[0].userName).toBe("Alice");
  });

  it("handles null venue and missing user references gracefully", async () => {
    mockPaperFindUnique.mockResolvedValue({
      id: 2,
      title: "No Venue Paper",
      status: "Draft",
      submissionDate: null,
      publicationDate: null,
      isDeleted: false,
      primaryContact: { userName: "Bob" },
      venue: null,
      authors: [],
      revisions: [
        {
          versionLabel: "v1",
          notes: null,
          createdAt: new Date("2024-01-01"),
          author: null,
        },
      ],
      activityLogs: [
        {
          actionType: "PAPER_CREATED",
          actionDetail: null,
          timestamp: new Date("2024-01-01"),
          user: null,
        },
      ],
    });

    const response = await GET(createRequest(), { params: { id: "2" } });
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.paper.venueName).toBeNull();
    expect(payload.revisions[0].authorName).toBeNull();
    expect(payload.activityLog[0].userName).toBeNull();
  });

  it("returns 500 when prisma query rejects", async () => {
    mockPaperFindUnique.mockRejectedValue(new Error("db unavailable"));

    const response = await GET(createRequest(), { params: { id: "1" } });
    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(payload.error).toMatch(/Unable to fetch paper details/i);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Failed to fetch paper overview",
      expect.any(Error),
    );
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
