'use client';

import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
);

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

type AnalyticsChartsProps = {
  statusData: StatusSummary[];
  yearData: YearSummary[];
  venueData: VenueSummary[];
};

export function AnalyticsCharts({
  statusData,
  yearData,
  venueData,
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

  const venueChartHeight = Math.max(venueData.length * 48, 240);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Papers per status
            </h3>
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
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Publications per year
            </h3>
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
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm lg:col-span-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Top venues by submissions
            </h3>
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
    </div>
  );
}
