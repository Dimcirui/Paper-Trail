const quickLinks = [
  { title: "Database Schema", body: "Review the Prisma schema before adding migrations or writing queries.", href: "/docs/data-model" },
  { title: "API Routes", body: "Use the app router /api folder to colocate backend logic with UI.", href: "/docs/apis" },
  { title: "Component Library", body: "Create shared UI building blocks in src/components to keep screens consistent.", href: "/docs/ui" },
];

const roadmap = [
  "Implement authentication (NextAuth or custom) tied to the Role/User tables.",
  "Build CRUD flows for Paper, Authorship, and Revision data in the dashboard.",
  "Add analytics queries (papers per year, grants, venues) that can run on cached API routes.",
];

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-16 font-sans text-zinc-900">
      <header className="mx-auto max-w-4xl text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-indigo-500">
          SunXHoC Research OS
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          PaperTrail Product Hub
        </h1>
        <p className="mt-4 text-lg text-zinc-600">
          Manage the entire research-publication lifecycle in one relational platform.
          This workspace wires up Next.js 14, Prisma, and MySQL so we can focus on
          building secure CRUD flows and analytics for faculty and graduate teams.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm font-semibold">
          <span className="rounded-full bg-white px-4 py-2 text-indigo-600 shadow">Next.js 14 App Router</span>
          <span className="rounded-full bg-white px-4 py-2 text-indigo-600 shadow">Prisma + MySQL</span>
          <span className="rounded-full bg-white px-4 py-2 text-indigo-600 shadow">Chart.js Analytics</span>
        </div>
      </header>

      <section className="mx-auto mt-16 grid max-w-5xl gap-8 md:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold">What&apos;s ready</h2>
          <ul className="mt-4 list-disc space-y-3 pl-5 text-zinc-600">
            <li>Base UI scaffolded with Tailwind and the App Router.</li>
            <li>API folder seeded with sample routes so backend logic can live server-side.</li>
            <li>Prisma schema expressing the 3NF data model (users, papers, grants, revisions, activity logs, etc.).</li>
            <li>Dockerized MySQL 8 instance for local + teammate parity.</li>
          </ul>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold">Immediate next steps</h2>
          <ol className="mt-4 list-decimal space-y-3 pl-5 text-zinc-600">
            {roadmap.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-5xl rounded-2xl border border-dashed border-indigo-200 bg-indigo-50 p-8">
        <h2 className="text-2xl font-semibold text-indigo-800">Workflow tips</h2>
        <p className="mt-2 text-indigo-900">
          Develop features inside feature folders (e.g., <code className="rounded bg-white px-1 py-0.5">src/app/(dashboard)/papers</code>),
          keep Prisma migrations in version control, and use the Docker MySQL instance so local data stays consistent.
        </p>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {quickLinks.map((link) => (
            <div key={link.title} className="rounded-xl bg-white p-4 shadow">
              <p className="text-sm uppercase text-zinc-500">{link.title}</p>
              <p className="mt-2 text-sm text-zinc-700">{link.body}</p>
              <p className="mt-4 text-xs font-semibold text-indigo-500">{link.href}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-4xl text-sm text-zinc-600">
        <p>
          Need to validate data flows quickly? Hit the <code className="rounded bg-zinc-100 px-1">/api/health</code> route once the dev server is
          running (<code className="rounded bg-zinc-100 px-1">npm run dev</code>). It confirms database env vars are wired and acts as a stub for future service tests.
        </p>
      </section>
    </div>
  );
}
