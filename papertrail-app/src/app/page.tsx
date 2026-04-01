import Link from "next/link";

const features = [
  {
    title: "Unified paper feed",
    desc: "Browse every manuscript across all statuses from one table. Filter, search, and open in a click.",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6h16M4 10h16M4 14h10" />
      </svg>
    ),
  },
  {
    title: "Semantic search",
    desc: "Find papers by meaning, not just keywords. Powered by pgvector and OpenAI embeddings.",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
      </svg>
    ),
  },
  {
    title: "Analytics snapshot",
    desc: "Track submission pipelines, publication rates, venue rankings, and author productivity.",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    title: "Role-based access",
    desc: "Admin, Principal Investigator, Contributor, and Viewer roles with fine-grained permissions.",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 px-6 py-16 text-slate-900">
      <div className="mx-auto w-full max-w-4xl">
        {/* Hero */}
        <div className="space-y-6 text-center">
          <p className="text-xs uppercase tracking-[1em] text-indigo-400">SunXHoC Research OS</p>
          <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
            PaperTrail
          </h1>
          <p className="mx-auto max-w-xl text-base text-slate-500 sm:text-lg">
            Academic manuscript management for research teams. Track submissions,
            collaborators, venues, and publication timelines in one place.
          </p>
          <div className="flex items-center justify-center pt-2">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-10 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              Enter Dashboard
            </Link>
          </div>
        </div>

        {/* Feature grid */}
        <div className="mt-20 grid gap-4 sm:grid-cols-2">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="mb-3 inline-flex rounded-lg bg-indigo-50 p-2 text-indigo-600" aria-hidden="true">
                {f.icon}
              </div>
              <h3 className="text-sm font-semibold text-slate-900">{f.title}</h3>
              <p className="mt-1 text-sm text-slate-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
