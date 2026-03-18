import { NextRequest } from "next/server";
import { POST } from "../route";
import { prisma } from "@/lib/prisma";
import { getEmbedding } from "@/lib/embeddings";
import { askLLM } from "@/lib/llm";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    paper: { findMany: jest.fn() },
    $queryRaw: jest.fn(),
  },
}));

jest.mock("@/lib/embeddings", () => ({
  getEmbedding: jest.fn(),
}));

jest.mock("@/lib/llm", () => ({
  askLLM: jest.fn(),
}));

const mockQueryRaw = prisma.$queryRaw as jest.MockedFunction<typeof prisma.$queryRaw>;
const mockFindMany = prisma.paper.findMany as jest.MockedFunction<typeof prisma.paper.findMany>;
const mockGetEmbedding = getEmbedding as jest.MockedFunction<typeof getEmbedding>;
const mockAskLLM = askLLM as jest.MockedFunction<typeof askLLM>;

const AUTH_TOKEN = "test-token";

function makeRequest(body: unknown, role = "viewer") {
  return new NextRequest("http://localhost/api/papers/ask", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${AUTH_TOKEN}`,
      "x-user-role": role,
    },
    body: JSON.stringify(body),
  });
}

describe("POST /api/papers/ask", () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.API_AUTH_TOKEN = AUTH_TOKEN;
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it("returns 401 when no auth token provided", async () => {
    const req = new NextRequest("http://localhost/api/papers/ask", {
      method: "POST",
      body: JSON.stringify({ question: "neural networks" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 400 when question is too short", async () => {
    const req = makeRequest({ question: "ab" });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/3 characters/);
  });

  it("returns 400 when question is missing", async () => {
    const req = makeRequest({});
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 500 when embedding fails", async () => {
    mockGetEmbedding.mockRejectedValueOnce(new Error("OpenAI down"));
    const req = makeRequest({ question: "neural networks" });
    const res = await POST(req);
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toMatch(/embedding/);
  });

  it("returns answer and sources for viewer (only Published papers)", async () => {
    mockGetEmbedding.mockResolvedValueOnce([0.1, 0.2, 0.3]);
    mockQueryRaw.mockResolvedValueOnce([{ id: 1 }, { id: 2 }]);
    mockFindMany.mockResolvedValueOnce([
      {
        id: 1,
        title: "Deep Learning Survey",
        abstract: "A survey of deep learning techniques.",
        status: "Published",
        authors: [{ user: { userName: "alice" } }],
      },
      {
        id: 2,
        title: "Transformer Models",
        abstract: "Attention is all you need.",
        status: "Published",
        authors: [{ user: { userName: "bob" } }],
      },
    ] as never);
    mockAskLLM.mockResolvedValueOnce("Deep learning papers include Deep Learning Survey.");

    const req = makeRequest({ question: "deep learning papers" }, "viewer");
    const res = await POST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.answer).toBe("Deep learning papers include Deep Learning Survey.");
    expect(data.sources).toHaveLength(2);
    expect(data.sources[0].title).toBe("Deep Learning Survey");
    expect(data.sources[0].authors).toEqual(["alice"]);
  });

  it("returns answer with empty sources when no papers found", async () => {
    mockGetEmbedding.mockResolvedValueOnce([0.1, 0.2]);
    mockQueryRaw.mockResolvedValueOnce([]);
    mockFindMany.mockResolvedValueOnce([] as never);
    mockAskLLM.mockResolvedValueOnce("未找到相关论文。");

    const req = makeRequest({ question: "quantum computing" });
    const res = await POST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.answer).toBe("未找到相关论文。");
    expect(data.sources).toHaveLength(0);
  });

  it("returns 500 when LLM call fails", async () => {
    mockGetEmbedding.mockResolvedValueOnce([0.1, 0.2]);
    mockQueryRaw.mockResolvedValueOnce([{ id: 1 }]);
    mockFindMany.mockResolvedValueOnce([
      {
        id: 1,
        title: "Test Paper",
        abstract: null,
        status: "Published",
        authors: [],
      },
    ] as never);
    mockAskLLM.mockRejectedValueOnce(new Error("DeepSeek timeout"));

    const req = makeRequest({ question: "test question here" });
    const res = await POST(req);
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toMatch(/LLM/);
  });

  it("admin role sees all papers (not just Published)", async () => {
    mockGetEmbedding.mockResolvedValueOnce([0.1, 0.2]);
    mockQueryRaw.mockResolvedValueOnce([{ id: 3 }]);
    mockFindMany.mockResolvedValueOnce([
      {
        id: 3,
        title: "Draft Paper",
        abstract: "Draft abstract.",
        status: "Draft",
        authors: [],
      },
    ] as never);
    mockAskLLM.mockResolvedValueOnce("Found a draft paper.");

    const req = makeRequest({ question: "draft paper topic" }, "admin");
    const res = await POST(req);
    expect(res.status).toBe(200);

    // Verify the $queryRaw was NOT restricted to Published status
    const rawCall = mockQueryRaw.mock.calls[0];
    const sqlTemplate = rawCall[0] as TemplateStringsArray;
    const sqlString = sqlTemplate.join("?");
    expect(sqlString).not.toContain("Published");
  });
});
