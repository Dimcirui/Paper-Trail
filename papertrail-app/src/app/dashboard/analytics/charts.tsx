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
          "#4c51bf",
          "#5a67d8",
          "#667eea",
          "#7f9cf5",
          "#a3bffa",
          "#c3dafe",
          "#e9d8fd",
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
      },
    ],
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">
          Papers per status
        </h3>
        <div className="mt-6">
          <Pie data={statusChart} />
        </div>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">
          Publications per year
        </h3>
        <div className="mt-6">
          <Bar data={yearChart} />
        </div>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
        <h3 className="text-lg font-semibold text-slate-900">
          Top venues by submissions
        </h3>
        <div className="mt-6">
          <Bar data={venueChart} />
        </div>
      </div>
    </div>
  );
}
