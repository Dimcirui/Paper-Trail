import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { canEditContent, getCurrentUserRole } from "@/lib/user";

type PaperListItem = {
  id: number;
  title: string;
  status: string;
  updatedAt: Date;
  venue?: { venueName: string } | null;
  primaryContact?: { userName: string; email?: string } | null;
};

export default async function DashboardHome() {
  const role = await getCurrentUserRole();
  const displayRole = role.replace(/_/g, " ");
  console.log ("role",role,displayRole)
  const editable = canEditContent(role);
  const papers = (await prisma.paper.findMany({
    take: 10,
    where: { isDeleted: false },
    orderBy: { updatedAt: "desc" },
    include: {
      venue: true,
      primaryContact: {
        select: { userName: true },
      },
    },
  })).map<PaperListItem>((paper) => ({
    id: paper.id,
    title: paper.title,
    status: paper.status,
    updatedAt: paper.updatedAt,
    venue: paper.venue ? { venueName: paper.venue.venueName } : null,
    primaryContact: paper.primaryContact
      ? { userName: paper.primaryContact.userName }
      : null,
  }));

  return (
    <div className="space-y-10">
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs uppercase tracking-widest text-slate-500">
            Recent Manuscripts
          </p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">
            {papers.length}
          </p>
          <p className="text-sm text-slate-500">
            Last 10 updated records across all venues.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs uppercase tracking-widest text-slate-500">
            Editorial Throughput
          </p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">
            {papers.filter((item: PaperListItem) => item.status === "Draft")
              .length || 0}
          </p>
          <p className="text-sm text-slate-500">
            Drafts awaiting submission or assignment.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs uppercase tracking-widest text-slate-500">
            Role Permissions
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900 capitalize break-words">
            {displayRole}
          </p>
          <p className="text-sm text-slate-500">
            {editable ? "Full manuscript management enabled." : "Read-only."}
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Activity feed
            </h2>
            <p className="text-sm text-slate-500">
              Track the newest changes across papers.
            </p>
          </div>
          <Link
            href="/dashboard/browser"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            View browser →
          </Link>
        </div>
        <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white shadow-sm">
          {papers.map((paper: PaperListItem) => (
            <article key={paper.id} className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <Link
                    href={`/dashboard/browser/${paper.id}`}
                    className="text-lg font-semibold text-indigo-600"
                  >
                    {paper.title}
                  </Link>
                  <p className="text-sm text-slate-500">
                    {paper.venue?.venueName ?? "Unassigned venue"}
                  </p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
                  {paper.status}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-6 text-xs text-slate-500">
                <span>
                  Updated{" "}
                  {new Date(paper.updatedAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                {paper.primaryContact?.userName && (
                  <span>Owner: {paper.primaryContact.userName}</span>
                )}
              </div>
            </article>
          ))}
          {papers.length === 0 && (
            <div className="p-6 text-center text-sm text-slate-500">
              No papers available yet.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
