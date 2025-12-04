import { NextRequest } from "next/server";
import { GET, POST, DELETE } from "../route";
import { prisma } from "@/lib/prisma";
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from "@prisma/client/runtime/library";

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

jest.mock("@/lib/prisma", () => ({
  prisma: {
    paper: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    user: {
      count: jest.fn(),
    },
    venue: {
      count: jest.fn(),
    },
    $executeRaw: jest.fn(),
  },
}));

const mockFindMany = prisma.paper
  .findMany as jest.MockedFunction<typeof prisma.paper.findMany>;
const mockPaperCreate = prisma.paper
  .create as jest.MockedFunction<typeof prisma.paper.create>;
const mockUserCount = prisma.user
  .count as jest.MockedFunction<typeof prisma.user.count>;
const mockVenueCount = prisma.venue
  .count as jest.MockedFunction<typeof prisma.venue.count>;
const mockExecuteRaw = prisma.$executeRaw as jest.MockedFunction<
  typeof prisma.$executeRaw
>;

describe("/api/papers route handlers", () => {
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

  const createRequest = (
    url: string,
    init?: RequestInit,
    role = "viewer",
  ) => {
    const headers = new Headers(init?.headers);
    headers.set("authorization", "Bearer test-token");
    headers.set("x-user-role", role);
    if (init?.body) {
      headers.set("content-type", "application/json");
    }
    return new NextRequest(url, {
      ...init,
      headers,
    });
  };

  describe("GET", () => {
    it("rejects missing authorization header", async () => {
      const request = new NextRequest("http://localhost/api/papers");
      const response = await GET(request);
      const payload = await response.json();

      expect(response.status).toBe(401);
      expect(payload.error).toMatch(/Missing Authorization/i);
      expect(mockFindMany).not.toHaveBeenCalled();
    });

    it("returns papers using minimal contact info for viewer role", async () => {
      const request = createRequest("http://localhost/api/papers");
      const mockResult = [
        {
          id: 1,
          title: "Draft paper",
          primaryContact: { userName: "Viewer" },
          venue: null,
          topics: [],
        },
      ];
      mockFindMany.mockResolvedValue(mockResult);

      const response = await GET(request);
      const payload = await response.json();

      expect(response.status).toBe(200);
      expect(payload.papers).toEqual(mockResult);
      expect(mockFindMany).toHaveBeenCalledWith({
        take: 20,
        where: { isDeleted: false, status: "Published" },
        orderBy: { updatedAt: "desc" },
        include: {
          venue: true,
          primaryContact: {
            select: { userName: true, email: false },
          },
          topics: { select: { topic: true } },
        },
      });
    });

    it("includes email info for admin role", async () => {
      const request = createRequest(
        "http://localhost/api/papers",
        undefined,
        "admin",
      );

      mockFindMany.mockResolvedValue([]);

      await GET(request);

      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 20,
          where: expect.objectContaining({ isDeleted: false }),
          include: expect.objectContaining({
            primaryContact: {
              select: { userName: true, email: true },
            },
          }),
        }),
      );
    });

    it("returns 500 when Prisma query fails", async () => {
      const request = createRequest("http://localhost/api/papers", undefined);
      mockFindMany.mockRejectedValue(new Error("db down"));

      const response = await GET(request);
      const payload = await response.json();

      expect(response.status).toBe(500);
      expect(payload.error).toMatch(/Database not ready/i);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Failed to fetch papers",
        expect.any(Error),
      );
    });
  });

  it("rejects deleted listings for viewers", async () => {
    mockFindMany.mockClear();
    const request = createRequest("http://localhost/api/papers?deleted=true");
    const response = await GET(request);
    const payload = await response.json();

    expect(response.status).toBe(403);
    expect(payload.error).toMatch(/permission to view deleted/i);
    expect(mockFindMany).not.toHaveBeenCalled();
  });

  it("allows admins to fetch deleted papers", async () => {
    mockFindMany.mockClear();
    mockFindMany.mockResolvedValue([]);
    const request = createRequest(
      "http://localhost/api/papers?deleted=true",
      undefined,
      "admin",
    );
    const response = await GET(request);

    expect(response.status).toBe(200);
    const whereClause = mockFindMany.mock.calls.pop()![0].where;
    expect(whereClause).toMatchObject({ isDeleted: true });
  });

  it("honors status filters and search terms", async () => {
    mockFindMany.mockClear();
    mockFindMany.mockResolvedValue([]);
    const request = createRequest(
      "http://localhost/api/papers?status=Draft&search=climate",
      undefined,
      "admin",
    );

    await GET(request);

    const whereClause = mockFindMany.mock.calls.pop()![0].where;
    expect(whereClause.status).toBe("Draft");
    expect(whereClause.OR).toEqual([
      { title: { contains: "climate" } },
      { abstract: { contains: "climate" } },
    ]);
  });
  

describe("POST", () => {
    it("rejects missing authorization header", async () => {
      const request = new NextRequest("http://localhost/api/papers", {
        method: "POST",
        body: JSON.stringify({}),
        headers: new Headers({
          "content-type": "application/json",
        }),
      });

      const response = await POST(request);
      const payload = await response.json();

      expect(response.status).toBe(401);
      expect(payload.error).toMatch(/Missing Authorization/i);
    });

    it("rejects when user lacks write permissions", async () => {
      const request = createRequest("http://localhost/api/papers", {
        method: "POST",
        body: JSON.stringify({ title: "Draft" }),
      });

      const response = await POST(request);
      const payload = await response.json();

      expect(response.status).toBe(403);
      expect(payload.error).toMatch(/Insufficient permissions/i);
      expect(mockPaperCreate).not.toHaveBeenCalled();
    });

    it("validates required fields", async () => {
      const request = createRequest(
        "http://localhost/api/papers",
        {
          method: "POST",
          body: JSON.stringify({ title: "Missing contact" }),
        },
        "admin",
      );

      const response = await POST(request);
      const payload = await response.json();

      expect(response.status).toBe(400);
      expect(payload.error).toMatch(/title and primaryContactId are required/i);
    });

    it("handles null JSON payloads gracefully", async () => {
      const request = createRequest(
        "http://localhost/api/papers",
        {
          method: "POST",
          body: "null",
        },
        "admin",
      );

      const response = await POST(request);
      const payload = await response.json();

      expect(response.status).toBe(400);
      expect(payload.error).toMatch(/title and primaryContactId are required/i);
    });

    it("rejects invalid JSON payloads", async () => {
      const request = new NextRequest("http://localhost/api/papers", {
        method: "POST",
        body: "invalid json",
        headers: new Headers({
          authorization: "Bearer test-token",
          "x-user-role": "admin",
        }),
      });

      const response = await POST(request);
      const payload = await response.json();

      expect(response.status).toBe(400);
      expect(payload.error).toMatch(/Invalid JSON/i);
    });

    it("returns 400 when primary contact does not exist", async () => {
      mockUserCount.mockResolvedValue(0);

      const request = createRequest(
        "http://localhost/api/papers",
        {
          method: "POST",
          body: JSON.stringify({
            title: "Valid Paper",
            primaryContactId: 10,
          }),
        },
        "admin",
      );

      const response = await POST(request);
      const payload = await response.json();

      expect(response.status).toBe(400);
      expect(payload.error).toMatch(/primaryContactId does not exist/i);
    });

    it("returns 400 when venue does not exist", async () => {
      mockUserCount.mockResolvedValue(1);
      mockVenueCount.mockResolvedValue(0);

      const request = createRequest(
        "http://localhost/api/papers",
        {
          method: "POST",
          body: JSON.stringify({
            title: "Valid Paper",
            primaryContactId: 10,
            venueId: 99,
          }),
        },
        "admin",
      );

      const response = await POST(request);
      const payload = await response.json();

      expect(response.status).toBe(400);
      expect(payload.error).toMatch(/venueId does not exist/i);
    });

    it("creates a paper when payload passes validation", async () => {
      mockUserCount.mockResolvedValue(1);
      mockVenueCount.mockResolvedValue(1);
      const createdPaper = { id: 42, title: "Valid Paper" };
      mockPaperCreate.mockResolvedValue(createdPaper);

      const request = createRequest(
        "http://localhost/api/papers",
        {
          method: "POST",
          body: JSON.stringify({
            title: "Valid Paper",
            primaryContactId: 10,
            venueId: 3,
            status: "Submitted",
          }),
        },
        "admin",
      );

      const response = await POST(request);
      const payload = await response.json();

      expect(response.status).toBe(201);
      expect(payload.paper).toEqual(createdPaper);
      expect(mockUserCount).toHaveBeenCalledWith({
        where: { id: 10 },
      });
      expect(mockVenueCount).toHaveBeenCalledWith({
        where: { id: 3 },
      });
      expect(mockPaperCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: "Valid Paper",
          abstract: "",
          primaryContactId: 10,
          venueId: 3,
          status: "Submitted",
        }),
      });
    });

    it("defaults to Draft status when none is provided", async () => {
      mockUserCount.mockResolvedValue(1);
      mockPaperCreate.mockResolvedValue({ id: 99 });

      const request = createRequest(
        "http://localhost/api/papers",
        {
          method: "POST",
          body: JSON.stringify({
            title: "No Status",
            primaryContactId: 5,
          }),
        },
        "admin",
      );

      await POST(request);

      expect(mockPaperCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          status: "Draft",
        }),
      });
    });

    it("falls back to Draft status when invalid status provided", async () => {
      mockUserCount.mockResolvedValue(1);
      mockPaperCreate.mockResolvedValue({ id: 100 });

      const request = createRequest(
        "http://localhost/api/papers",
        {
          method: "POST",
          body: JSON.stringify({
            title: "Invalid Status",
            primaryContactId: 5,
            status: "NotReal",
          }),
        },
        "admin",
      );

      await POST(request);

      expect(mockPaperCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          status: "Draft",
        }),
      });
    });

    it("logs and defaults when status is not a string", async () => {
      mockUserCount.mockResolvedValue(1);
      mockPaperCreate.mockResolvedValue({ id: 101 });

      const request = createRequest(
        "http://localhost/api/papers",
        {
          method: "POST",
          body: JSON.stringify({
            title: "Numeric Status",
            primaryContactId: 8,
            status: 123,
          }),
        },
        "admin",
      );

      await POST(request);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Invalid status type received.",
        { value: 123 },
      );
      expect(mockPaperCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          status: "Draft",
        }),
      });
    });

    it("maps Prisma known request errors to 400", async () => {
      mockUserCount.mockResolvedValue(1);
      mockVenueCount.mockResolvedValue(1);
      mockPaperCreate.mockRejectedValue(
        new PrismaClientKnownRequestError("bad known error"),
      );

      const request = createRequest(
        "http://localhost/api/papers",
        {
          method: "POST",
          body: JSON.stringify({
            title: "Valid Paper",
            primaryContactId: 10,
          }),
        },
        "admin",
      );

      const response = await POST(request);
      const payload = await response.json();

      expect(response.status).toBe(400);
      expect(payload.error).toMatch(/Invalid data/i);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Failed to create paper",
        expect.any(PrismaClientKnownRequestError),
      );
    });

    it("maps Prisma validation errors to 400", async () => {
      mockUserCount.mockResolvedValue(1);
      mockPaperCreate.mockRejectedValue(
        new PrismaClientValidationError("bad validation"),
      );

      const request = createRequest(
        "http://localhost/api/papers",
        {
          method: "POST",
          body: JSON.stringify({
            title: "Valid Paper",
            primaryContactId: 10,
          }),
        },
        "admin",
      );

      const response = await POST(request);
      const payload = await response.json();

      expect(response.status).toBe(400);
      expect(payload.error).toMatch(/Invalid payload/i);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Failed to create paper",
        expect.any(PrismaClientValidationError),
      );
    });

    it("falls back to 500 for unexpected errors", async () => {
      mockUserCount.mockResolvedValue(1);
      mockPaperCreate.mockRejectedValue(new Error("unexpected failure"));

      const request = createRequest(
        "http://localhost/api/papers",
        {
          method: "POST",
          body: JSON.stringify({
            title: "Valid Paper",
            primaryContactId: 10,
          }),
        },
        "admin",
      );

      const response = await POST(request);
      const payload = await response.json();

      expect(response.status).toBe(500);
      expect(payload.error).toMatch(/Unable to create paper/i);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Failed to create paper",
        expect.any(Error),
      );
    });
  });
  describe("DELETE", () => {
    it("calls soft delete when no hard parameter is provided", async () => {
      mockExecuteRaw.mockResolvedValue(undefined);
      const request = createRequest(
        "http://localhost/api/papers?id=12",
        { method: "DELETE" },
        "admin",
      );

      const response = await DELETE(request);
      const payload = await response.json();

      expect(response.status).toBe(200);
      expect(payload.message).toMatch(/soft deleted/i);
      expect(mockExecuteRaw).toHaveBeenCalled();
      const template = mockExecuteRaw.mock.calls[0][0];
      expect(template[0]).toContain("sp_soft_delete_paper");
    });

    it("calls hard delete when hard=true and caller is admin", async () => {
      mockExecuteRaw.mockResolvedValue(undefined);
      const request = createRequest(
        "http://localhost/api/papers?id=13&hard=true",
        { method: "DELETE" },
        "admin",
      );

      const response = await DELETE(request);
      const payload = await response.json();

      expect(response.status).toBe(200);
      expect(payload.message).toMatch(/hard deleted/i);
      expect(mockExecuteRaw).toHaveBeenCalled();
      const template = mockExecuteRaw.mock.calls[0][0];
      expect(template[0]).toContain("sp_hard_delete_paper");
    });

    it("rejects hard delete for non-admin roles", async () => {
      const request = createRequest(
        "http://localhost/api/papers?id=13&hard=true",
        { method: "DELETE" },
        "principal_investigator",
      );

      const response = await DELETE(request);
      const payload = await response.json();

      expect(response.status).toBe(403);
      expect(payload.error).toMatch(/hard deletes/i);
      expect(mockExecuteRaw).not.toHaveBeenCalled();
    });
  });
});
