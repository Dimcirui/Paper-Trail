import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";
import { POST } from "../route";
import { NextRequest } from "next/server";
process.env.JWT_SECRET = "test-secret-key";

jest.mock("@/lib/prisma", () => ({
    prisma: {
        user: {
            findFirst: jest.fn(),
        },
    },
}));

const mockFindFirst = prisma.user.findFirst as jest.MockedFunction<typeof prisma.user.findFirst>;

const mockBaseUser = {
    affiliation: null,
    orcid: null,
    createdAt: new Date(),
    updatedAt: new Date(),
};

const mockAdminUser = {
    id: 1,
    userName: "adminUser",
    email: "admin@example.com",
    password: "pass",
    roleId: 1,
    role: { roleName: "Research Admin" },
    ...mockBaseUser,
};

const mockPIUser = {
    id: 5,
    userName: "piUser",
    email: "pi@example.com",
    password: "pass",
    roleId: 2,
    role: { roleName: "Principal Investigator" },
    ...mockBaseUser,
};

const createRequest = (
  body: Record<string, unknown> | null,
  url: string = "http://localhost/api/auth/login",
) => {
  const headers = new Headers();
  headers.set("content-type", "application/json");

  return new NextRequest(url, {
    method: "POST",
    body: JSON.stringify(body),
    headers,
  });
};

describe("/api/auth/login POST handler", () => {
    let consoleErrorSpy: jest.SpyInstance;

    beforeEach(() => {
        jest.clearAllMocks();
        consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
    });

    const verifyJwtPayload = async (token: string) => {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
        const { payload } = await jwtVerify(token, secret);
        return payload;
    };

    // ... Test cases for input validation ...
    it("reject missing JSON payload", async () => {
        const request = new NextRequest("http://localhost/api/auth/login", {
            method: "POST",
            body: "invalid-json",
        });

        const response = await POST(request);
        const payload = await response.json();

        expect(response.status).toBe(400);
        expect(payload.error).toBe("Invalid JSON format.");
        expect(mockFindFirst).not.toHaveBeenCalled();
    });

    it("rejects missing username/email or password", async () => {
        const request = createRequest({});

        const response = await POST(request);
        const payload = await response.json();

        expect(response.status).toBe(400);
        expect(payload.error).toBe("Email and password are required.");
    });

    // ... Test cases for user lookup and mapping ...
    it ("returns 404 if user is not found by identifier", async () => {
        mockFindFirst.mockResolvedValueOnce(null);

        const request = createRequest({ username: "nonexistent", password: "pass" });
        const response = await POST(request);
        const payload = await response.json();

        expect(response.status).toBe(404);
        expect(payload.error).toBe("User not found.");
        expect(mockFindFirst).toHaveBeenCalled();
    });

    it("performs case-insensitive lookup for email or username", async () => {
        mockFindFirst.mockResolvedValueOnce(mockAdminUser);
        const identifier = "ADMIN@EXAMPLE.COM";

        const request = createRequest({ email: identifier, password: "pass" });
        await POST(request);

        expect(mockFindFirst).toHaveBeenCalledWith(
            expect.objectContaining({
                where: {
                    OR: expect.arrayContaining([
                        { email: { equals: identifier } },
                        { userName: { equals: identifier } },
                        { email: { equals: identifier.toLowerCase() } },
                        { userName: { equals: identifier.toUpperCase() } },
                    ]),
                },
            }),
        );
    });

    // ... Test cases for authentication ...
    it("returns 401 on incorrect password", async () => {
        mockFindFirst.mockResolvedValue(mockAdminUser);

        const request = createRequest({ email: "admin@example.com", password: "wrongpass" });
        const response = await POST(request);
        const payload = await response.json();

        expect(response.status).toBe(401);
        expect(payload.error).toBe("Invalid password.");
    });

    it("returns 200 and set cookie on successful login as admin", async () => {
        mockFindFirst.mockResolvedValueOnce(mockAdminUser);

        const request = createRequest({ username: "adminUser", password: "pass" });
        const response = await POST(request);
        const payload = await response.json();

        expect(response.status).toBe(200);
        expect(payload.user.role).toBe("admin");
        expect(payload.user.id).toBe(1);

        const cookieHeader = response.headers.get("set-cookie");
        expect(cookieHeader).toMatch(/^auth_token=/);
        expect(cookieHeader).toContain("HttpOnly");

        const token = payload.token;
        const jwtPayload = await verifyJwtPayload(token);
        expect(jwtPayload.userId).toBe(1);
        expect(jwtPayload.role).toBe("admin");
        expect(jwtPayload.userName).toBe("adminUser");
    });

    it("returns 200 and maps PI role correctly", async () => {
        mockFindFirst.mockResolvedValue(mockPIUser);

        const request = createRequest({ email: "pi@example.com", password: "pass" });
        const response = await POST(request);
        const payload = await response.json();

        expect(response.status).toBe(200);
        expect(payload.user.role).toBe("principal_investigator");
        expect(payload.user.id).toBe(5);
    });

    it("returns external role names plus BigInt IDs when provided", async () => {
        const mockViewerUser = {
            ...mockBaseUser,
            id: BigInt(7),
            userName: "guestUser",
            email: "guest@example.com",
            password: "pass",
            roleId: 3,
            role: { roleName: "External Partner" },
        };
        mockFindFirst.mockResolvedValue(mockViewerUser);

        const request = createRequest({ username: "guestUser", password: "pass" });
        const response = await POST(request);
        const payload = await response.json();

        expect(response.status).toBe(200);
        expect(payload.user.role).toBe("external_partner");
        expect(payload.user.id).toBe(7);
    });

    it("defaults to viewer role when no known roleName exists", async () => {
        const fallbackUser = {
            ...mockBaseUser,
            id: 9,
            userName: "unknownRoleUser",
            email: "unknown@example.com",
            password: "pass",
            roleId: 4,
            role: { roleName: "" },
        };
        mockFindFirst.mockResolvedValue(fallbackUser);

        const request = createRequest({ username: "unknownRoleUser", password: "pass" });
        const response = await POST(request);
        const payload = await response.json();

        expect(response.status).toBe(200);
        expect(payload.user.role).toBe("viewer");
        expect(payload.user.id).toBe(9);
    });

    it("requires JWT_SECRET and surfaces internal error if missing", async () => {
        const originalSecret = process.env.JWT_SECRET;
        delete process.env.JWT_SECRET;
        mockFindFirst.mockResolvedValue(mockAdminUser);

        try {
            const request = createRequest({ username: "adminUser", password: "pass" });
            const response = await POST(request);
            const payload = await response.json();

            expect(response.status).toBe(500);
            expect(payload.error).toBe("Internal server error.");
            expect(consoleErrorSpy).toHaveBeenCalled();
        } finally {
            if (originalSecret) {
                process.env.JWT_SECRET = originalSecret;
            }
        }
    });

    it("sets Secure cookie in production mode", async () => {
        const originalEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = "production";
        mockFindFirst.mockResolvedValue(mockAdminUser);

        try {
            const request = createRequest({ username: "adminUser", password: "pass" });
            const response = await POST(request);
            const cookieHeader = response.headers.get("set-cookie");

        expect(cookieHeader).toContain("Secure");
        expect(cookieHeader.toLowerCase()).toContain("samesite=strict");
        } finally {
            process.env.NODE_ENV = originalEnv;
        }
    });

    // ... Test cases for error handling ...
    it("returns 500 for unexpected database errors", async () => {
        mockFindFirst.mockRejectedValue(new Error("Database connection failed"));

        const request = createRequest({ username: "adminUser", password: "pass" });
        const response = await POST(request);
        const payload = await response.json();

        expect(response.status).toBe(500);
        expect(payload.error).toBe("Internal server error.");
        expect(consoleErrorSpy).toHaveBeenCalled();
    });
});
