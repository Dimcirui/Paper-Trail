import Link from "next/link";

const spotlightFeatures = [
  {
    title: "Manuscript Browser",
    body: "Search, filter, and open consolidated paper records with metadata, authorship info, revisions, and audit logs.",
    href: "/dashboard/browser",
  },
  {
    title: "Author Management",
    body: "Assign contributors, reorder authorship, or remove collaborators directly from the paper management console.",
    href: "/dashboard/manage",
  },
  {
    title: "Analytics",
    body: "Visualize status distribution, publication velocity, and top venues to inform faculty reporting.",
    href: "/dashboard/analytics",
  },
];

const quickStarts = [
  {
    label: "Open Dashboard",
    description: "Jump into the research control room.",
    href: "/dashboard",
  },
  {
    label: "Register New Paper",
    description: "Capture a manuscript while it’s still a draft.",
    href: "/dashboard/manage/new",
  },
  {
    label: "View API Health",
    description: "Confirm database connection and stored-procedure wiring.",
    href: "/api/health",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 px-6 py-16 text-slate-900">
      <header className="mx-auto max-w-5xl">
        <p className="text-xs uppercase tracking-[0.5em] text-indigo-400">
          SunXHoC Research OS
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
          PaperTrail Academic Suite
        </h1>
        <p className="mt-4 text-lg text-slate-600">
          A professional-grade workspace for the full publication lifecycle:
          register manuscripts, orchestrate authorship, and monitor outcomes
          from one secure hub powered by Next.js 16, Prisma, and MySQL.
        </p>
        <div className="mt-8 flex flex-wrap gap-4 text-sm font-semibold text-slate-700">
          <span className="rounded-full bg-white px-4 py-2 shadow">
            Role-aware dashboard
          </span>
          <span className="rounded-full bg-white px-4 py-2 shadow">
            Stored-procedure backed CRUD
          </span>
          <span className="rounded-full bg-white px-4 py-2 shadow">
            Chart.js analytics
          </span>
        </div>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/dashboard"
            className="rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            Enter dashboard
          </Link>
          <Link
            href="/dashboard/manage/new"
            className="rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 hover:border-slate-400"
          >
            Create paper
          </Link>
        </div>
      </header>

      <section className="mx-auto mt-16 grid max-w-5xl gap-6 md:grid-cols-3">
        {spotlightFeatures.map((feature) => (
          <div
            key={feature.title}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <p className="text-xs uppercase tracking-widest text-slate-400">
              {feature.title}
            </p>
            <p className="mt-3 text-sm text-slate-600">{feature.body}</p>
            <Link
              href={feature.href}
              className="mt-4 inline-flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-500"
            >
              Explore →
            </Link>
          </div>
        ))}
      </section>

      <section className="mx-auto mt-16 grid max-w-5xl gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">
            Discipline-ready foundations
          </h2>
          <ul className="mt-4 list-disc space-y-3 pl-5 text-sm text-slate-600">
            <li>Normalized Prisma schema for users, papers, grants, and logs.</li>
            <li>
              Stored procedures enforcing paper creation, authorship linking,
              and audit history.
            </li>
            <li>Role-based API middleware with token + header guards.</li>
            <li>React Server Components with App Router layouts and routing.</li>
          </ul>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">
            Quick start actions
          </h2>
          <div className="mt-4 space-y-4">
            {quickStarts.map((entry) => (
              <Link
                key={entry.href}
                href={entry.href}
                className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3 text-sm text-slate-600 hover:border-indigo-200 hover:text-indigo-600"
              >
                <div>
                  <p className="font-semibold text-slate-900">
                    {entry.label}
                  </p>
                  <p className="text-xs">{entry.description}</p>
                </div>
                <span>→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-5xl rounded-2xl border border-indigo-100 bg-indigo-50 p-8 text-slate-900">
        <h2 className="text-xl font-semibold text-indigo-900">Operational tips</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm">
          <li>
            Use the dashboard navigation to switch between the browser,
            analytics, and manage views without losing context.
          </li>
          <li>
            For API testing, keep <code className="rounded bg-white px-1">API_AUTH_TOKEN</code> synced across `.env` files; server actions reuse this token.
          </li>
          <li>
            Record demos directly from the dashboard to highlight CRUD, analytics, and error handling behaviors.
          </li>
        </ul>
      </section>
    </div>
  );
}
