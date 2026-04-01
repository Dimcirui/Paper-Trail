import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorizeRequest } from "../papers/auth";

type YearSummary = { year: number; count: number };
type VenueSummary = { label: string; count: number };
type GrantSummary = { label: string; count: number };
type TopicSummary = { label: string; count: number };
type VenueTierSummary = { tier: string; count: number };
type VenueTypeSummary = { label: string; count: number };
type DurationKpi = { total: number; avg_days: number; min_days: number; max_days: number };
type DurationTrend = { year: number; avg_days: number };
type AuthorSummary = { name: string; affiliation: string | null; count: number };
type InstitutionSummary = { label: string; count: number };
type FunnelData = { draft: number; submitted: number; under_review: number; accepted: number; published: number };

export async function GET(req: NextRequest) {
  const auth = authorizeRequest(req);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.message }, { status: 401 });
  }

  try {
    const [
      statusGroups, publishedPerYear, venueGroups, grantGroups, topicGroups,
      venueTierGroups, venueTypeGroups, durationKpiRows, durationTrendRows,
      authorRows, institutionRows, funnelRows,
    ] = await Promise.all([
        prisma.paper.groupBy({
          by: ["status"],
          where: { isDeleted: false },
          _count: { _all: true },
        }),
        prisma.$queryRaw<YearSummary[]>`
          SELECT EXTRACT(YEAR FROM "publicationDate")::int AS year, COUNT(*)::int AS count
          FROM "Paper"
          WHERE "publicationDate" IS NOT NULL AND "isDeleted" = false
          GROUP BY EXTRACT(YEAR FROM "publicationDate")
          ORDER BY year ASC
        `,
        prisma.$queryRaw<VenueSummary[]>`
          SELECT v."venueName" AS label, COUNT(p.id)::int AS count
          FROM "Paper" p
          INNER JOIN "Venue" v ON v.id = p."venueId"
          WHERE p."isDeleted" = false
          GROUP BY v.id, v."venueName"
          ORDER BY count DESC
          LIMIT 5
        `,
        prisma.$queryRaw<GrantSummary[]>`
          SELECT g."grantName" AS label, COUNT(pg."paperId")::int AS count
          FROM "Grant" g
          INNER JOIN "PaperGrant" pg ON pg."grantId" = g.id
          INNER JOIN "Paper" p ON p.id = pg."paperId"
          WHERE p."isDeleted" = false
          GROUP BY g.id, g."grantName"
          ORDER BY count DESC
          LIMIT 5
        `,
        prisma.$queryRaw<TopicSummary[]>`
          SELECT t."topicName" AS label, COUNT(pt."paperId")::int AS count
          FROM "Topic" t
          INNER JOIN "PaperTopic" pt ON pt."topicId" = t.id
          INNER JOIN "Paper" p ON p.id = pt."paperId"
          WHERE p."isDeleted" = false
          GROUP BY t.id, t."topicName"
          ORDER BY count DESC
        `,
        prisma.$queryRaw<VenueTierSummary[]>`
          SELECT COALESCE(v."ranking", 'Unranked') AS tier, COUNT(p.id)::int AS count
          FROM "Paper" p
          INNER JOIN "Venue" v ON v.id = p."venueId"
          WHERE p."isDeleted" = false
          GROUP BY v."ranking"
          ORDER BY count DESC
        `,
        prisma.$queryRaw<VenueTypeSummary[]>`
          SELECT COALESCE(v."type", 'Other') AS label, COUNT(p.id)::int AS count
          FROM "Paper" p
          INNER JOIN "Venue" v ON v.id = p."venueId"
          WHERE p."isDeleted" = false
          GROUP BY v."type"
        `,
        prisma.$queryRaw<DurationKpi[]>`
          SELECT
            COUNT(*)::int AS total,
            AVG(EXTRACT(DAY FROM ("publicationDate" - "submissionDate")))::int AS avg_days,
            MIN(EXTRACT(DAY FROM ("publicationDate" - "submissionDate")))::int AS min_days,
            MAX(EXTRACT(DAY FROM ("publicationDate" - "submissionDate")))::int AS max_days
          FROM "Paper"
          WHERE "publicationDate" IS NOT NULL
            AND "submissionDate" IS NOT NULL
            AND "isDeleted" = false
        `,
        prisma.$queryRaw<DurationTrend[]>`
          SELECT
            EXTRACT(YEAR FROM "publicationDate")::int AS year,
            AVG(EXTRACT(DAY FROM ("publicationDate" - "submissionDate")))::int AS avg_days
          FROM "Paper"
          WHERE "publicationDate" IS NOT NULL
            AND "submissionDate" IS NOT NULL
            AND "isDeleted" = false
          GROUP BY 1
          ORDER BY 1 ASC
        `,
        prisma.$queryRaw<AuthorSummary[]>`
          SELECT u."userName" AS name, u."affiliation", COUNT(a."paperId")::int AS count
          FROM "Authorship" a
          INNER JOIN "User" u ON u.id = a."userId"
          INNER JOIN "Paper" p ON p.id = a."paperId"
          WHERE p."isDeleted" = false
          GROUP BY u.id, u."userName", u."affiliation"
          ORDER BY count DESC
          LIMIT 10
        `,
        prisma.$queryRaw<InstitutionSummary[]>`
          SELECT u."affiliation" AS label, COUNT(DISTINCT p.id)::int AS count
          FROM "Authorship" a
          INNER JOIN "User" u ON u.id = a."userId"
          INNER JOIN "Paper" p ON p.id = a."paperId"
          WHERE p."isDeleted" = false AND u."affiliation" IS NOT NULL
          GROUP BY u."affiliation"
          ORDER BY count DESC
          LIMIT 10
        `,
        prisma.$queryRaw<FunnelData[]>`
          SELECT
            COUNT(*)::int AS draft,
            SUM(CASE WHEN status <> 'Draft' THEN 1 ELSE 0 END)::int AS submitted,
            SUM(CASE WHEN status IN ('UnderReview', 'Accepted', 'Published', 'Rejected', 'Withdrawn') THEN 1 ELSE 0 END)::int AS under_review,
            SUM(CASE WHEN status IN ('Accepted', 'Published') THEN 1 ELSE 0 END)::int AS accepted,
            SUM(CASE WHEN status = 'Published' THEN 1 ELSE 0 END)::int AS published
          FROM "Paper"
          WHERE "isDeleted" = false
        `,
      ]);

    const statusData = statusGroups.map((g) => ({
      status: g.status,
      count: Number(g._count._all),
    }));

    const yearData = (Array.isArray(publishedPerYear) ? publishedPerYear : [])
      .filter((r) => r.year !== null)
      .map((r) => ({ year: Number(r.year), count: Number(r.count) }));

    const venueData = (Array.isArray(venueGroups) ? venueGroups : []).map(
      (r) => ({ label: r.label, count: Number(r.count) }),
    );

    const grantData = (Array.isArray(grantGroups) ? grantGroups : []).map(
      (r) => ({ label: r.label, count: Number(r.count) }),
    );

    const topicData = (Array.isArray(topicGroups) ? topicGroups : []).map(
      (r) => ({ label: r.label, count: Number(r.count) }),
    );

    const venueTierData = (Array.isArray(venueTierGroups) ? venueTierGroups : []).map(
      (r) => ({ tier: r.tier, count: Number(r.count) }),
    );

    const venueTypeData = (Array.isArray(venueTypeGroups) ? venueTypeGroups : []).map(
      (r) => ({ label: r.label, count: Number(r.count) }),
    );

    const durationKpi = Array.isArray(durationKpiRows) && durationKpiRows.length > 0
      ? {
          total: Number(durationKpiRows[0].total),
          avg_days: Number(durationKpiRows[0].avg_days),
          min_days: Number(durationKpiRows[0].min_days),
          max_days: Number(durationKpiRows[0].max_days),
        }
      : { total: 0, avg_days: 0, min_days: 0, max_days: 0 };

    const durationTrend = (Array.isArray(durationTrendRows) ? durationTrendRows : []).map(
      (r) => ({ year: Number(r.year), avg_days: Number(r.avg_days) }),
    );

    const authorData = (Array.isArray(authorRows) ? authorRows : []).map(
      (r) => ({ name: r.name, affiliation: r.affiliation, count: Number(r.count) }),
    );

    const institutionData = (Array.isArray(institutionRows) ? institutionRows : []).map(
      (r) => ({ label: r.label, count: Number(r.count) }),
    );

    const funnelData = Array.isArray(funnelRows) && funnelRows.length > 0
      ? {
          draft:        Number(funnelRows[0].draft),
          submitted:    Number(funnelRows[0].submitted),
          under_review: Number(funnelRows[0].under_review),
          accepted:     Number(funnelRows[0].accepted),
          published:    Number(funnelRows[0].published),
        }
      : { draft: 0, submitted: 0, under_review: 0, accepted: 0, published: 0 };

    return NextResponse.json({
      statusData, yearData, venueData, grantData, topicData,
      venueTierData, venueTypeData, durationKpi, durationTrend,
      authorData, institutionData, funnelData,
    });
  } catch (err) {
    console.error("[GET /api/analytics]", err);
    return NextResponse.json(
      { error: "Failed to fetch analytics data." },
      { status: 500 },
    );
  }
}
