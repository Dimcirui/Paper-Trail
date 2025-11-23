import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getPaperOverview } from "@/lib/server-api";
import { canEditContent, getCurrentUserRole } from "@/lib/user";

type OverviewParams = {
  params: { id: string };
};

export async function generateMetadata({
  params,
}: OverviewParams): Promise<Metadata> {
  return {
    title: `Paper #${params.id} | PaperTrail`,
  };
}

export default async function PaperOverview({ params }: OverviewParams) {
  const role = getCurrentUserRole();
  const editable = canEditContent(role);

  const data = await getPaperOverview(params.id);
  if (!data.paper) {
    notFound();
  }

  const paper = data.paper;

    return (
      <div className="space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
              Paper #{paper.id}
            </p>
            <h2 className="text-3xl font-semibold text-slate-900">
              {paper.title}
            </h2>
            <p className="text-sm text-slate-500">
              Venue: {paper.venueName ?? "Unassigned"} · Owner:{" "}
              {paper.primaryContactName ?? "Unassigned"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700">
              {paper.status}
            </span>
            {editable && (
              <Link
                href={`/dashboard/manage/${paper.id}`}
                className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
              >
                Manage Paper
              </Link>
            )}
          </div>
        </div>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-widest text-slate-500">
              Submission
            </p>
            <p className="mt-2 text-lg font-semibold text-slate-900">
              {paper.submissionDate
                ? new Date(paper.submissionDate).toLocaleDateString()
                : "Not submitted"}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-widest text-slate-500">
              Publication
            </p>
            <p className="mt-2 text-lg font-semibold text-slate-900">
              {paper.publicationDate
                ? new Date(paper.publicationDate).toLocaleDateString()
                : "Pending"}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-widest text-slate-500">
              Venue
            </p>
            <p className="mt-2 text-lg font-semibold text-slate-900">
              {paper.venueName ?? "Not assigned"}
            </p>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Authors</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              {data.authors.map((author, idx) => (
                <li
                  key={`${author.userName}-${idx}`}
                  className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2"
                >
                  <div>
                    <p className="font-medium text-slate-900">
                      #{author.authorOrder} · {author.userName}
                    </p>
                    <p className="text-xs text-slate-500">{author.email}</p>
                  </div>
                  {author.contributionNotes && (
                    <span className="text-xs text-slate-500">
                      {author.contributionNotes}
                    </span>
                  )}
                </li>
              ))}
              {data.authors.length === 0 && (
                <p className="text-sm italic text-slate-400">
                  No authors linked yet.
                </p>
              )}
            </ul>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Revisions</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              {data.revisions.map((revision, idx) => (
                <li key={`${revision.versionLabel}-${idx}`}>
                  <p className="font-medium text-slate-900">
                    {revision.versionLabel}
                  </p>
                  <p className="text-xs text-slate-500">
                    {revision.notes ?? "No notes"} ·{" "}
                    {revision.createdAt
                      ? new Date(revision.createdAt).toLocaleDateString()
                      : "—"}
                  </p>
                </li>
              ))}
              {data.revisions.length === 0 && (
                <p className="text-sm italic text-slate-400">
                  No revision history recorded.
                </p>
              )}
            </ul>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Audit log
              </h3>
              <p className="text-sm text-slate-500">
                Captures stored-procedure events and application actions.
              </p>
            </div>
          </div>
          <div className="mt-4 divide-y divide-slate-100">
            {data.activityLog.map((entry, idx) => (
              <div key={`${entry.timestamp}-${idx}`} className="py-3 text-sm">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="font-medium">{entry.actionType}</span>
                  <span className="text-xs">
                    {entry.timestamp
                      ? new Date(entry.timestamp).toLocaleString()
                      : ""}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {entry.actionDetail ?? "No detail"} · Actor:{" "}
                  {entry.userName ?? "System"}
                </p>
              </div>
            ))}
            {data.activityLog.length === 0 && (
              <p className="py-6 text-sm italic text-slate-400">
                No actions logged yet.
              </p>
            )}
          </div>
        </section>
      </div>
    );
}
