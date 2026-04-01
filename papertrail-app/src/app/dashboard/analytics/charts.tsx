'use client';

import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Doughnut, Line, Pie } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Filler,
  Tooltip,
  Legend,
);

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

type AnalyticsChartsProps = {
  statusData: StatusSummary[];
  yearData: YearSummary[];
  venueData: VenueSummary[];
  grantData: GrantSummary[];
  topicData: TopicSummary[];
  venueTierData: VenueTierSummary[];
  venueTypeData: VenueTypeSummary[];
  durationKpi: DurationKpi;
  durationTrend: DurationTrend[];
  authorData: AuthorSummary[];
  institutionData: InstitutionSummary[];
  funnelData: FunnelData;
};

export function AnalyticsCharts({
  statusData,
  yearData,
  venueData,
  grantData,
  topicData,
  venueTierData,
  venueTypeData,
  durationKpi,
  durationTrend,
  authorData,
  institutionData,
  funnelData,
}: AnalyticsChartsProps) {
  const statusChart = {
    labels: statusData.map((item) => item.status),
    datasets: [
      {
        label: "Papers",
        data: statusData.map((item) => item.count),
        backgroundColor: [
          "#4338CA",
          "#4C51BF",
          "#5A67D8",
          "#7C3AED",
          "#A78BFA",
          "#C4B5FD",
          "#DDD6FE",
        ],
      },
    ],
  };

  const yearChart = {
    labels: yearData.map((item) => item.year.toString()),
    datasets: [
      {
        label: "Publications",
        data: yearData.map((item) => item.count),
        backgroundColor: "#2b6cb0",
        borderRadius: 6,
      },
    ],
  };

  const venueChart = {
    labels: venueData.map((item) => item.label),
    datasets: [
      {
        label: "Submissions",
        data: venueData.map((item) => item.count),
        backgroundColor: [
          "#0f172a",
          "#1d4ed8",
          "#10b981",
          "#f59e0b",
          "#ef4444",
        ],
        borderRadius: 6,
      },
    ],
  };

  const grantChart = {
    labels: grantData.map((item) => item.label),
    datasets: [
      {
        label: "Funded Papers",
        data: grantData.map((item) => item.count),
        backgroundColor: "#6366F1",
        borderRadius: 6,
      },
    ],
  };

  const topicColors = [
    "#6366F1", "#8B5CF6", "#EC4899", "#F59E0B", "#10B981",
    "#3B82F6", "#EF4444", "#14B8A6", "#F97316", "#84CC16",
  ];

  const topicChart = {
    labels: topicData.map((item) => item.label),
    datasets: [
      {
        label: "Papers",
        data: topicData.map((item) => item.count),
        backgroundColor: topicData.map((_, i) => topicColors[i % topicColors.length]),
        borderWidth: 0,
      },
    ],
  };

  const tierColorMap: Record<string, string> = {
    "Q1": "#D97706", "A*": "#6B7280", "A": "#B45309", "Unranked": "#CBD5E1",
  };
  const venueTypeChart = {
    labels: venueTypeData.map((r) => r.label),
    datasets: [
      {
        data: venueTypeData.map((r) => r.count),
        backgroundColor: ["#4F46E5", "#10B981", "#94A3B8"],
        borderWidth: 0,
      },
    ],
  };
  const venueTierChart = {
    labels: venueTierData.map((r) => r.tier),
    datasets: [
      {
        label: "Papers",
        data: venueTierData.map((r) => r.count),
        backgroundColor: venueTierData.map((r) => tierColorMap[r.tier] ?? "#94A3B8"),
        borderRadius: 6,
      },
    ],
  };

  const durationTrendChart = {
    labels: durationTrend.map((r) => r.year.toString()),
    datasets: [
      {
        label: "Avg. days",
        data: durationTrend.map((r) => r.avg_days),
        borderColor: "#6366F1",
        backgroundColor: "rgba(99,102,241,0.1)",
        fill: true,
        tension: 0.3,
        pointRadius: 4,
        pointBackgroundColor: "#6366F1",
      },
    ],
  };

  const authorChart = {
    labels: authorData.map((r) => r.name),
    datasets: [
      {
        label: "Papers",
        data: authorData.map((r) => r.count),
        backgroundColor: "#4F46E5",
        borderRadius: 6,
      },
    ],
  };

  const institutionChart = {
    labels: institutionData.map((r) => r.label),
    datasets: [
      {
        label: "Papers",
        data: institutionData.map((r) => r.count),
        backgroundColor: "#0D9488",
        borderRadius: 6,
      },
    ],
  };

  const venueChartHeight = Math.max(venueData.length * 48, 240);
  const grantChartHeight = Math.max(grantData.length * 48, 240);
  const topicChartHeight = Math.max(topicData.length * 48, 240);
  const authorChartHeight = Math.max(authorData.length * 44, 240);
  const institutionChartHeight = Math.max(institutionData.length * 44, 240);

  const FUNNEL_STAGES: { key: keyof FunnelData; label: string; bar: string; text: string }[] = [
    { key: "draft",        label: "Draft",        bar: "bg-slate-300",   text: "text-slate-600" },
    { key: "submitted",    label: "Submitted",    bar: "bg-indigo-300",  text: "text-indigo-700" },
    { key: "under_review", label: "Under Review", bar: "bg-violet-400",  text: "text-violet-700" },
    { key: "accepted",     label: "Accepted",     bar: "bg-emerald-400", text: "text-emerald-700" },
    { key: "published",    label: "Published",    bar: "bg-teal-500",    text: "text-teal-700" },
  ];

  return (
    <div className="space-y-10">

      {/* Workflow */}
      <section>
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-400">Workflow</h3>
        <div className="grid gap-6 lg:grid-cols-2">

          {/* Phase 3.1 — Workflow funnel */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-semibold text-slate-900">Submission pipeline</h4>
                <p className="text-xs text-slate-500">
                  Cumulative papers at each workflow stage.
                </p>
              </div>
              <div className="text-right text-xs uppercase tracking-wide text-slate-400">Funnel</div>
            </div>

            <div className="mt-6 space-y-3">
              {FUNNEL_STAGES.map((stage, i) => {
                const count = funnelData[stage.key];
                const total = funnelData.draft || 1;
                const prev  = i === 0 ? total : funnelData[FUNNEL_STAGES[i - 1].key] || 1;
                const pct   = Math.round((count / total) * 100);
                const step  = i === 0 ? 100 : Math.round((count / prev) * 100);

                return (
                  <div key={stage.key} className="flex items-center gap-4">
                    <div className="w-28 shrink-0 text-right text-sm font-medium text-slate-600">
                      {stage.label}
                    </div>
                    <div className="relative flex-1 overflow-hidden rounded-full bg-slate-100 h-7">
                      <div
                        className={`h-full rounded-full transition-all ${stage.bar}`}
                        style={{ width: `${pct}%` }}
                      />
                      <span className={`absolute inset-0 flex items-center pl-3 text-xs font-semibold ${stage.text}`}>
                        {count.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-20 shrink-0 text-right text-xs text-slate-400">
                      {pct}%
                      {i > 0 && (
                        <span className={`ml-1 font-medium ${step >= 75 ? "text-emerald-600" : step >= 50 ? "text-amber-500" : "text-red-500"}`}>
                          ({step}%↓)
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 flex flex-wrap gap-4 border-t border-slate-100 pt-4 text-xs text-slate-400">
              <span>
                Rejection + Withdrawal:{" "}
                <span className="font-semibold text-slate-600">
                  {(funnelData.submitted - funnelData.accepted).toLocaleString()} papers
                </span>
              </span>
              <span>
                Overall yield (Draft → Published):{" "}
                <span className="font-semibold text-teal-600">
                  {funnelData.draft > 0 ? Math.round((funnelData.published / funnelData.draft) * 100) : 0}%
                </span>
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-semibold text-slate-900">
                  Papers per status
                </h4>
                <p className="text-xs text-slate-500">
                  Distribution across the active workflow.
                </p>
              </div>
              <div className="text-right text-xs uppercase tracking-wide text-slate-400">
                Current
              </div>
            </div>
            <div className="mt-6 h-80 w-full">
              <Pie
                data={statusChart}
                options={{
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "top",
                      labels: {
                        boxWidth: 12,
                        boxHeight: 12,
                        padding: 12,
                      },
                    },
                  },
                }}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-semibold text-slate-900">
                  Publications per year
                </h4>
                <p className="text-xs text-slate-500">
                  Accepted or camera-ready manuscripts.
                </p>
              </div>
              <div className="text-right text-xs uppercase tracking-wide text-slate-400">
                Last 5 years
              </div>
            </div>
            <div className="mt-6 h-80 w-full">
              <Bar
                data={yearChart}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: "bottom" as const },
                  },
                  scales: {
                    x: {
                      position: "bottom",
                      grid: { display: false },
                      ticks: { color: "#475569" },
                      border: { display: false },
                    },
                    y: {
                      beginAtZero: true,
                      grid: { color: "#e2e8f0" },
                      border: { display: false },
                      ticks: {
                        precision: 0,
                      },
                    },
                  },
                }}
              />
            </div>
          </div>

        </div>
      </section>

      {/* Venues */}
      <section>
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-400">Venues</h3>
        <div className="grid gap-6 lg:grid-cols-2">

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-semibold text-slate-900">
                  Top venues by submissions
                </h4>
                <p className="text-xs text-slate-500">
                  Snapshot of the busiest conferences and journals.
                </p>
              </div>
              <div className="text-right text-xs uppercase tracking-wide text-slate-400">
                Ranked
              </div>
            </div>
            <div className="mt-6 w-full" style={{ height: `${venueChartHeight}px` }}>
              <Bar
                data={venueChart}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: "bottom" as const },
                  },
                  scales: {
                    x: {
                      beginAtZero: true,
                      grid: { color: "#e2e8f0" },
                      border: { display: false },
                      ticks: { precision: 0 },
                    },
                    y: {
                      grid: { display: false },
                      border: { display: false },
                      ticks: {
                        color: "#475569",
                        callback: (value, index) =>
                          typeof index === "number" ? venueData[index]?.label ?? "" : `${value}`,
                      },
                    },
                  },
                  indexAxis: "y" as const,
                }}
              />
            </div>
          </div>

          {/* Phase 1.2 — Venue tier & type breakdown */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-semibold text-slate-900">
                  Journal vs Conference
                </h4>
                <p className="text-xs text-slate-500">
                  Venue type split across submissions.
                </p>
              </div>
            </div>
            <div className="mt-6 h-72 w-full">
              <Doughnut
                data={venueTypeChart}
                options={{
                  maintainAspectRatio: false,
                  cutout: "55%",
                  plugins: {
                    legend: {
                      position: "bottom",
                      labels: { boxWidth: 12, boxHeight: 12, padding: 12 },
                    },
                  },
                }}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-semibold text-slate-900">
                  Papers by venue ranking
                </h4>
                <p className="text-xs text-slate-500">
                  Quality tier distribution (Q1 / A* / A).
                </p>
              </div>
            </div>
            <div className="mt-6 h-72 w-full">
              <Bar
                data={venueTierChart}
                options={{
                  maintainAspectRatio: false,
                  responsive: true,
                  scales: {
                    x: { grid: { display: false }, border: { display: false } },
                    y: {
                      beginAtZero: true,
                      grid: { color: "#f1f5f9" },
                      border: { display: false },
                      ticks: { precision: 0 },
                    },
                  },
                  plugins: { legend: { display: false } },
                }}
              />
            </div>
          </div>

        </div>
      </section>

      {/* Publication Speed */}
      <section>
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-400">Publication Speed</h3>
        <div className="grid gap-6 lg:grid-cols-2">

          {/* Phase 1.3 — Submission-to-publication duration */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-semibold text-slate-900">
                  Time to publication
                </h4>
                <p className="text-xs text-slate-500">
                  Days between submission and publication ({durationKpi.total} papers with both dates).
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-4">
              <div className="rounded-2xl bg-indigo-50 px-5 py-4 text-center">
                <p className="text-3xl font-bold text-indigo-700">{durationKpi.avg_days}</p>
                <p className="mt-1 text-xs font-medium uppercase tracking-wide text-indigo-500">Avg days</p>
              </div>
              <div className="rounded-2xl bg-emerald-50 px-5 py-4 text-center">
                <p className="text-3xl font-bold text-emerald-700">{durationKpi.min_days}</p>
                <p className="mt-1 text-xs font-medium uppercase tracking-wide text-emerald-500">Fastest</p>
              </div>
              <div className="rounded-2xl bg-amber-50 px-5 py-4 text-center">
                <p className="text-3xl font-bold text-amber-700">{durationKpi.max_days}</p>
                <p className="mt-1 text-xs font-medium uppercase tracking-wide text-amber-500">Slowest</p>
              </div>
            </div>

            {durationTrend.length > 1 && (
              <div className="mt-6 h-64 w-full">
                <Line
                  data={durationTrendChart}
                  options={{
                    maintainAspectRatio: false,
                    responsive: true,
                    scales: {
                      x: {
                        grid: { display: false },
                        border: { display: false },
                        ticks: { color: "#475569" },
                      },
                      y: {
                        beginAtZero: true,
                        grid: { color: "#f1f5f9" },
                        border: { display: false },
                        ticks: { precision: 0 },
                        title: { display: true, text: "Days", color: "#94a3b8" },
                      },
                    },
                    plugins: {
                      legend: { display: false },
                    },
                  }}
                />
              </div>
            )}
          </div>

        </div>
      </section>

      {/* People */}
      <section>
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-400">People</h3>
        <div className="grid gap-6 lg:grid-cols-2">

          {/* Phase 2.1 — Top contributors */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-semibold text-slate-900">
                  Top contributors
                </h4>
                <p className="text-xs text-slate-500">
                  Most prolific authors by paper count.
                </p>
              </div>
              <div className="text-right text-xs uppercase tracking-wide text-slate-400">
                Top 10
              </div>
            </div>
            <div className="mt-6 w-full" style={{ height: `${authorChartHeight}px` }}>
              <Bar
                data={authorChart}
                options={{
                  indexAxis: "y",
                  maintainAspectRatio: false,
                  responsive: true,
                  scales: {
                    x: {
                      beginAtZero: true,
                      grid: { color: "#f1f5f9" },
                      border: { display: false },
                      ticks: { precision: 0 },
                    },
                    y: {
                      grid: { display: false },
                      border: { display: false },
                      ticks: { color: "#475569" },
                    },
                  },
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      callbacks: {
                        afterLabel: (ctx) => {
                          const aff = authorData[ctx.dataIndex]?.affiliation;
                          return aff ? `@ ${aff}` : "";
                        },
                      },
                    },
                  },
                }}
              />
            </div>
          </div>

          {/* Phase 2.2 — Institution distribution */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-semibold text-slate-900">
                  Papers by institution
                </h4>
                <p className="text-xs text-slate-500">
                  Affiliated organisations ranked by distinct paper count.
                </p>
              </div>
              <div className="text-right text-xs uppercase tracking-wide text-slate-400">
                Top 10
              </div>
            </div>
            <div className="mt-6 w-full" style={{ height: `${institutionChartHeight}px` }}>
              <Bar
                data={institutionChart}
                options={{
                  indexAxis: "y",
                  maintainAspectRatio: false,
                  responsive: true,
                  scales: {
                    x: {
                      beginAtZero: true,
                      grid: { color: "#f1f5f9" },
                      border: { display: false },
                      ticks: { precision: 0 },
                    },
                    y: {
                      grid: { display: false },
                      border: { display: false },
                      ticks: { color: "#475569" },
                    },
                  },
                  plugins: { legend: { display: false } },
                }}
              />
            </div>
          </div>

        </div>
      </section>

      {/* Funding & Topics */}
      <section>
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-400">Funding &amp; Topics</h3>
        <div className="grid gap-6 lg:grid-cols-2">

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-semibold text-slate-900"> Top Grants </h4>
                <p className="text-xs text-slate-500"> Most active funding sources. </p>
              </div>
            </div>
            <div className="mt-6 w-full" style={{ height: `${grantChartHeight}px` }}>
              <Bar
                data={grantChart}
                options={{
                    indexAxis: 'y',
                    maintainAspectRatio: false,
                    responsive: true,
                    scales: { x: { beginAtZero: true, grid: { color: "#f1f5f9" }, border: { display: false } }, y: { grid: { display: false }, border: { display: false } } },
                    plugins: { legend: { display: false } }
                }}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-semibold text-slate-900">
                  Papers by research topic
                </h4>
                <p className="text-xs text-slate-500">
                  Distribution across all active research areas.
                </p>
              </div>
              <div className="text-right text-xs uppercase tracking-wide text-slate-400">
                All topics
              </div>
            </div>
            <div className="mt-6 w-full" style={{ height: `${topicChartHeight}px` }}>
              <Bar
                data={topicChart}
                options={{
                  indexAxis: "y",
                  maintainAspectRatio: false,
                  responsive: true,
                  scales: {
                    x: {
                      beginAtZero: true,
                      grid: { color: "#f1f5f9" },
                      border: { display: false },
                      ticks: { precision: 0 },
                    },
                    y: {
                      grid: { display: false },
                      border: { display: false },
                      ticks: { color: "#475569" },
                    },
                  },
                  plugins: { legend: { display: false } },
                }}
              />
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
