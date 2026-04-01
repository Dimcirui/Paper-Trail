import { NextRequest } from "next/server";
import { GET } from "../route";
import { prisma } from "@/lib/prisma";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    paper: {
      groupBy: jest.fn(),
    },
    $queryRaw: jest.fn(),
  },
}));

jest.mock("../../papers/auth", () => ({
  authorizeRequest: jest.fn(),
}));

import { authorizeRequest } from "../../papers/auth";

const mockAuthorize = authorizeRequest as jest.MockedFunction<typeof authorizeRequest>;
const mockGroupBy = prisma.paper.groupBy as jest.MockedFunction<typeof prisma.paper.groupBy>;
const mockQueryRaw = prisma.$queryRaw as jest.MockedFunction<typeof prisma.$queryRaw>;

function makeReq(token = "Bearer test-token") {
  return new NextRequest("http://localhost/api/analytics", {
    headers: { Authorization: token },
  });
}

// Returns mocks for all 12 Promise.all slots in order:
// [groupBy, yearRaw, venueRaw, grantRaw, topicRaw, tierRaw, typeRaw,
//  durationKpiRaw, durationTrendRaw, authorRaw, institutionRaw, funnelRaw]
function setupSuccessMocks() {
  mockGroupBy.mockResolvedValue([
    { status: "Draft", _count: { _all: 3 } },
    { status: "Published", _count: { _all: 1 } },
  ] as never);

  let call = 0;
  mockQueryRaw.mockImplementation(() => {
    call++;
    switch (call) {
      case 1:  return Promise.resolve([{ year: 2024, count: 2 }]);                                           // year
      case 2:  return Promise.resolve([{ label: "CVPR", count: 3 }]);                                        // venue
      case 3:  return Promise.resolve([{ label: "NSF Grant", count: 2 }]);                                   // grant
      case 4:  return Promise.resolve([{ label: "NLP", count: 5 }]);                                         // topic
      case 5:  return Promise.resolve([{ tier: "A*", count: 2 }]);                                           // tier
      case 6:  return Promise.resolve([{ label: "Conference", count: 4 }]);                                  // type
      case 7:  return Promise.resolve([{ total: 4, avg_days: 120, min_days: 30, max_days: 200 }]);           // durationKpi
      case 8:  return Promise.resolve([{ year: 2024, avg_days: 120 }]);                                      // durationTrend
      case 9:  return Promise.resolve([{ name: "Alice", affiliation: "MIT", count: 3 }]);                    // author
      case 10: return Promise.resolve([{ label: "MIT", count: 5 }]);                                         // institution
      case 11: return Promise.resolve([{ draft: 3, submitted: 2, under_review: 1, accepted: 1, published: 1 }]); // funnel
      default: return Promise.resolve([]);
    }
  });
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("GET /api/analytics", () => {
  it("returns 401 when not authorized", async () => {
    mockAuthorize.mockReturnValue({ authorized: false, message: "Unauthorized" });

    const res = await GET(makeReq(""));
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Unauthorized");
  });

  it("returns 200 with all analytics fields when authorized", async () => {
    mockAuthorize.mockReturnValue({ authorized: true, role: "admin" });
    setupSuccessMocks();

    const res = await GET(makeReq());
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body).toHaveProperty("statusData");
    expect(body).toHaveProperty("yearData");
    expect(body).toHaveProperty("venueData");
    expect(body).toHaveProperty("grantData");
    expect(body).toHaveProperty("topicData");
    expect(body).toHaveProperty("venueTierData");
    expect(body).toHaveProperty("venueTypeData");
    expect(body).toHaveProperty("durationKpi");
    expect(body).toHaveProperty("durationTrend");
    expect(body).toHaveProperty("authorData");
    expect(body).toHaveProperty("institutionData");
    expect(body).toHaveProperty("funnelData");
  });

  it("maps statusData correctly", async () => {
    mockAuthorize.mockReturnValue({ authorized: true, role: "admin" });
    setupSuccessMocks();

    const res = await GET(makeReq());
    const { statusData } = await res.json();
    expect(statusData).toEqual([
      { status: "Draft", count: 3 },
      { status: "Published", count: 1 },
    ]);
  });

  it("uses empty durationKpi fallback when no rows returned", async () => {
    mockAuthorize.mockReturnValue({ authorized: true, role: "admin" });

    mockGroupBy.mockResolvedValue([] as never);
    let call = 0;
    mockQueryRaw.mockImplementation(() => {
      call++;
      if (call === 7) return Promise.resolve([]); // empty durationKpi
      if (call === 11) return Promise.resolve([]); // empty funnel
      return Promise.resolve([]);
    });

    const res = await GET(makeReq());
    const { durationKpi, funnelData } = await res.json();
    expect(durationKpi).toEqual({ total: 0, avg_days: 0, min_days: 0, max_days: 0 });
    expect(funnelData).toEqual({ draft: 0, submitted: 0, under_review: 0, accepted: 0, published: 0 });
  });

  it("returns 500 when prisma throws", async () => {
    mockAuthorize.mockReturnValue({ authorized: true, role: "admin" });
    mockGroupBy.mockRejectedValue(new Error("DB error"));

    const res = await GET(makeReq());
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("Failed to fetch analytics data.");
  });
});
