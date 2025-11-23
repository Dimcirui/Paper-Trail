import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-16 text-slate-900">
      <div className="w-full max-w-4xl space-y-10 text-center">
        <div className="space-y-6">
          <p className="text-xs uppercase tracking-[1em] text-indigo-400">
            SunXHoC Research OS
          </p>
          <h1 className="text-5xl font-semibold tracking-tight text-slate-900 sm:text-6xl lg:text-7xl">
            PaperTrail Academic Suite
          </h1>
          <p className="mx-auto max-w-2xl text-base text-slate-600 sm:text-lg">
            A focused launchpad for the dashboard. Jump straight into the
            activity hub to browse, analyze, or manage manuscripts with a
            single click.
          </p>
        </div>
        <div className="flex items-center justify-center">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-12 py-4 text-lg font-semibold text-white shadow-lg transition hover:bg-slate-800"
          >
            Enter Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
