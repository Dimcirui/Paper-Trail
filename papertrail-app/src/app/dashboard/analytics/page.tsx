import { prisma } from "@/lib/prisma";
import { AnalyticsCharts } from "./charts";

type GrantSummary = {
  label: string;
  count: number;
};

type StatusSummary = {
  status: string;
  count: number;
};

type YearSummary = {
  year: number;
  count: number;
};

type VenueSummary = {
  label: string;
  count: number;
};

type TopicSummary = {
  label: string;
  count: number;
};

type VenueTierSummary = {
  tier: string;
  count: number;
};

type VenueTypeSummary = {
  label: string;
  count: number;
};

type DurationKpi = {
  total: number;
  avg_days: number;
  min_days: number;
  max_days: number;
};

type DurationTrend = {
  year: number;
  avg_days: number;
};

type AuthorSummary = {
  name: string;
  affiliation: string | null;
  count: number;
};

type InstitutionSummary = {
  label: string;
  count: number;
};

type FunnelData = {
  draft: number;
  submitted: number;
  under_review: number;
  accepted: number;
  published: number;
};

export default async function AnalyticsPage() {
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
      SELECT EXTRACT(YEAR FROM "publicationDate")::int as year, COUNT(*)::int as count
      FROM "Paper"
      WHERE "publicationDate" IS NOT NULL AND "isDeleted" = false
      GROUP BY EXTRACT(YEAR FROM "publicationDate")
      ORDER BY year ASC
    `,
    prisma.$queryRaw<VenueSummary[]>`
      SELECT v."venueName" as label, COUNT(p.id)::int as count
      FROM "Paper" p
      INNER JOIN "Venue" v ON v.id = p."venueId"
      WHERE p."isDeleted" = false
      GROUP BY v.id, v."venueName"
      ORDER BY count DESC
      LIMIT 5
    `,
    prisma.$queryRaw<GrantSummary[]>`
      SELECT g."grantName" as label, COUNT(pg."paperId")::int as count
      FROM "Grant" g
      INNER JOIN "PaperGrant" pg ON pg."grantId" = g.id
      INNER JOIN "Paper" p ON p.id = pg."paperId"
      WHERE p."isDeleted" = false
      GROUP BY g.id, g."grantName"
      ORDER BY count DESC
      LIMIT 5
    `,
    prisma.$queryRaw<TopicSummary[]>`
      SELECT t."topicName" as label, COUNT(pt."paperId")::int as count
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

  const statusData: StatusSummary[] = statusGroups.map((group) => ({
    status: group.status,
    count: Number(group._count._all),
  }));

  const yearData: YearSummary[] = Array.isArray(publishedPerYear)
    ? publishedPerYear
        .filter((row) => row.year !== null)
        .map((row) => ({
          year: Number(row.year),
          count: Number(row.count),
        }))
    : [];

  const venueData: VenueSummary[] = Array.isArray(venueGroups)
    ? venueGroups.map((group) => ({
        label: group.label,
        count: Number(group.count),
      }))
    : [];

  const grantData: GrantSummary[] = Array.isArray(grantGroups)
    ? grantGroups.map((group) => ({
        label: group.label,
        count: Number(group.count),
      }))
    : [];

  const topicData: TopicSummary[] = Array.isArray(topicGroups)
    ? topicGroups.map((group) => ({
        label: group.label,
        count: Number(group.count),
      }))
    : [];

  const venueTierData: VenueTierSummary[] = Array.isArray(venueTierGroups)
    ? venueTierGroups.map((r) => ({ tier: r.tier, count: Number(r.count) }))
    : [];

  const venueTypeData: VenueTypeSummary[] = Array.isArray(venueTypeGroups)
    ? venueTypeGroups.map((r) => ({ label: r.label, count: Number(r.count) }))
    : [];

  const durationKpi: DurationKpi = Array.isArray(durationKpiRows) && durationKpiRows.length > 0
    ? {
        total: Number(durationKpiRows[0].total),
        avg_days: Number(durationKpiRows[0].avg_days),
        min_days: Number(durationKpiRows[0].min_days),
        max_days: Number(durationKpiRows[0].max_days),
      }
    : { total: 0, avg_days: 0, min_days: 0, max_days: 0 };

  const durationTrend: DurationTrend[] = Array.isArray(durationTrendRows)
    ? durationTrendRows.map((r) => ({ year: Number(r.year), avg_days: Number(r.avg_days) }))
    : [];

  const authorData: AuthorSummary[] = Array.isArray(authorRows)
    ? authorRows.map((r) => ({ name: r.name, affiliation: r.affiliation, count: Number(r.count) }))
    : [];

  const institutionData: InstitutionSummary[] = Array.isArray(institutionRows)
    ? institutionRows.map((r) => ({ label: r.label, count: Number(r.count) }))
    : [];

  const funnelData: FunnelData = Array.isArray(funnelRows) && funnelRows.length > 0
    ? {
        draft: Number(funnelRows[0].draft),
        submitted: Number(funnelRows[0].submitted),
        under_review: Number(funnelRows[0].under_review),
        accepted: Number(funnelRows[0].accepted),
        published: Number(funnelRows[0].published),
      }
    : { draft: 0, submitted: 0, under_review: 0, accepted: 0, published: 0 };

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-2xl font-semibold text-slate-900">
          Analytics snapshot
        </h2>
        <p className="text-sm text-slate-500">
          Visualize manuscript distribution across statuses, publication years,
          and venues.
        </p>
      </header>
      <AnalyticsCharts
        statusData={statusData}
        yearData={yearData}
        venueData={venueData}
        grantData={grantData}
        topicData={topicData}
        venueTierData={venueTierData}
        venueTypeData={venueTypeData}
        durationKpi={durationKpi}
        durationTrend={durationTrend}
        authorData={authorData}
        institutionData={institutionData}
        funnelData={funnelData}
      />
    </div>
  );
}
