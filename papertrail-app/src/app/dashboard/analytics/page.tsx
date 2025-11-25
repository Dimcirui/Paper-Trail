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

export default async function AnalyticsPage() {
  const [statusGroups, publishedPerYear, venueGroups, grantGroups] = await Promise.all([
    prisma.paper.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.$queryRaw<YearSummary[]>`
      SELECT YEAR(publicationDate) as year, COUNT(*) as count
      FROM Paper
      WHERE publicationDate IS NOT NULL
      GROUP BY YEAR(publicationDate)
      ORDER BY year ASC
    `,
    prisma.$queryRaw<VenueSummary[]>`
      SELECT v.venueName as label, COUNT(p.id) as count
      FROM Paper p
      INNER JOIN Venue v ON v.id = p.venueId
      GROUP BY v.id, v.venueName
      ORDER BY count DESC
      LIMIT 5
    `,
    prisma.$queryRaw<GrantSummary[]>`
      SELECT g.grantName as label, COUNT(pg.paperId) as count
      FROM \`Grant\` g
      INNER JOIN PaperGrant pg ON pg.grantId = g.id
      GROUP BY g.id, g.grantName
      ORDER BY count DESC
      LIMIT 5
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
      />
    </div>
  );
}
