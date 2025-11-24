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

type DashboardHomeProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const PAGE_SIZE = 15;

export default async function DashboardHome({ searchParams }: DashboardHomeProps) {
  const role = await getCurrentUserRole();
  const displayRole = role.replace(/_/g, " ");
  const editable = canEditContent(role);

  const params = await searchParams;
  const rawPageParam = Array.isArray(params?.page) ? params.page[0] : params?.page;
  const parsedPage = Number.parseInt(rawPageParam ?? "1", 10);
  const page = Number.isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;
  const skip = (page - 1) * PAGE_SIZE;

  const [totalPapers, draftCount, papers] = await Promise.all([
    prisma.paper.count({ where: { isDeleted: false } }),
    prisma.paper.count({ where: { isDeleted: false, status: "Draft" } }),
    prisma.paper
      .findMany({
        where: { isDeleted: false },
        orderBy: { updatedAt: "desc" },
        skip,
        take: PAGE_SIZE,
        include: {
          venue: true,
          primaryContact: {
            select: { userName: true },
          },
        },
      })
      .then((rows) =>
        rows.map<PaperListItem>((paper) => ({
          id: paper.id,
          title: paper.title,
          status: paper.status,
          updatedAt: paper.updatedAt,
          venue: paper.venue ? { venueName: paper.venue.venueName } : null,
          primaryContact: paper.primaryContact
            ? { userName: paper.primaryContact.userName }
            : null,
        })),
      ),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalPapers / PAGE_SIZE));
  const startIndex = totalPapers === 0 ? 0 : skip + 1;
  const endIndex = skip + papers.length;

  return (
    <div className="space-y-6 pt-2">
      <section className="grid gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-widest text-slate-500">
            Recent Manuscripts
          </p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">
            {totalPapers}
          </p>
          <p className="text-sm text-slate-500">
            Total manuscripts currently in the system.
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-widest text-slate-500">
            Editorial Throughput
          </p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">
            {draftCount}
          </p>
          <p className="text-sm text-slate-500">
            Drafts awaiting submission or assignment.
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
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

      <section className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Unified paper feed
            </h2>
            <p className="text-sm text-slate-500">
              Browse, open, or manage any manuscript from a single view.
            </p>
          </div>
        </div>
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Venue</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Primary Contact</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {papers.map((paper) => (
                <tr key={paper.id} className="border-t border-slate-100">
                  <td className="px-4 py-4">
                    <div className="flex flex-col">
                      <Link
                        href={`/dashboard/browser/${paper.id}`}
                        className="font-semibold text-indigo-700 hover:text-indigo-500"
                      >
                        {paper.title}
                      </Link>
                      <span className="text-xs text-slate-500">
                        Updated{" "}
                        {new Date(paper.updatedAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {paper.venue?.venueName ?? "Unassigned"}
                  </td>
                  <td className="px-4 py-4">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
                      {paper.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {paper.primaryContact?.userName ?? "—"}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex flex-wrap items-center justify-end gap-3">
                      <Link
                        href={`/dashboard/browser/${paper.id}`}
                        className="text-xs font-semibold uppercase tracking-wide text-slate-600 hover:text-indigo-600"
                      >
                        Open
                      </Link>
                      {editable && (
                        <Link
                          href={`/dashboard/manage/${paper.id}`}
                          className="text-xs font-semibold uppercase tracking-wide text-indigo-600 hover:text-indigo-500"
                        >
                          Manage
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {papers.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-10 text-center text-sm text-slate-500"
                  >
                    No papers available yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
          <p>
            Showing{" "}
            <span className="font-semibold">
              {startIndex}–{endIndex}
            </span>{" "}
            of {totalPapers}
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={page - 1 === 1 ? "/dashboard" : `/dashboard?page=${page - 1}`}
                className="rounded-full border border-slate-200 px-4 py-2 font-semibold text-slate-700 hover:border-indigo-500 hover:text-indigo-600"
              >
                Previous
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/dashboard?page=${page + 1}`}
                className="rounded-full border border-indigo-100 bg-indigo-50 px-4 py-2 font-semibold text-indigo-700 hover:border-indigo-500"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
