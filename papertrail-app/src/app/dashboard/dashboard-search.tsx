"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useTransition, useState } from "react";

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "Draft", label: "Draft" },
  { value: "Submitted", label: "Submitted" },
  { value: "UnderReview", label: "Under Review" },
  { value: "Accepted", label: "Accepted" },
  { value: "Published", label: "Published" },
  { value: "Rejected", label: "Rejected" },
  { value: "Withdrawn", label: "Withdrawn" },
];

export function DashboardSearch() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const [term, setTerm] = useState(() => searchParams.get("search") ?? "");
  const [isPending, startTransition] = useTransition();
  const activeStatus = searchParams.get("status") ?? "";

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextTerm = new FormData(event.currentTarget).get("search")?.toString();
    const params = new URLSearchParams(searchParams);

    if (nextTerm) {
      params.set("search", nextTerm);
    } else {
      params.delete("search");
    }

    if (activeStatus) {
      params.set("status", activeStatus);
    } else {
      params.delete("status");
    }

    params.set("page", "1");

    startTransition(() => {
      replace(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-3 mb-6">
      <div className="flex-grow relative">
        <input
          name="search"
          placeholder="Search title or abstract..."
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none pl-10"
        />
        <svg className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="px-5 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-70"
      >
        {isPending ? "Searching..." : "Search"}
      </button>
    </form>
  );
}

export function DashboardStatusFilter() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const [isPending, startTransition] = useTransition();
  const activeStatus = searchParams.get("status") ?? "";

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nextStatus = event.target.value;
    startTransition(() => {
      const params = new URLSearchParams(searchParams);
      if (nextStatus) {
        params.set("status", nextStatus);
      } else {
        params.delete("status");
      }
      params.set("page", "1");
      replace(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <label className="flex flex-col gap-1 text-xs uppercase tracking-widest text-slate-500">
      <span>Status filter</span>
      <select
        value={activeStatus}
        onChange={handleChange}
        disabled={isPending}
        className="w-48 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none cursor-pointer"
      >
        {STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
