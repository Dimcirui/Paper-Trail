"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";

export function DashboardSearch() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSearch(formData: FormData) {
    const params = new URLSearchParams(searchParams);
    const term = formData.get('search')?.toString();
    const status = formData.get('status')?.toString();

    if (term) {
      params.set('search', term);
    } else {
      params.delete('search');
    }

    if (status && status !== 'All') {
      params.set('status', status);
    } else {
      params.delete('status');
    }

    params.set('page', '1');

    startTransition(() => {
      replace(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <form action={handleSearch} className="flex flex-col md:flex-row gap-3 mb-6">
      <div className="flex-grow relative">
        <input
          name="search"
          placeholder="Search title or abstract..."
          defaultValue={searchParams.get('search')?.toString()}
          className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none pl-10"
        />
        <svg className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
      </div>

      <div className="w-full md:w-48">
        <select
          name="status"
          defaultValue={searchParams.get('status')?.toString()}
          onChange={(e) => e.target.form?.requestSubmit()} // 选择后自动提交
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none cursor-pointer bg-white"
        >
          <option value="">All Statuses</option>
          <option value="Draft">Draft</option>
          <option value="Submitted">Submitted</option>
          <option value="UnderReview">Under Review</option>
          <option value="Accepted">Accepted</option>
          <option value="Published">Published</option>
          <option value="Rejected">Rejected</option>
          <option value="Withdrawn">Withdrawn</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="px-5 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-70"
      >
        {isPending ? 'Searching...' : 'Search'}
      </button>
      
      {(searchParams.get('search') || searchParams.get('status')) && (
        <button
            type="button"
            onClick={() => replace(pathname)}
            className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50"
        >
            Clear
        </button>
      )}
    </form>
  );
}