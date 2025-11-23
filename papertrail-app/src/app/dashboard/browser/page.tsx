import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function BrowserPage() {
  const papers = await prisma.paper.findMany({
    take: 10,
    where: { isDeleted: false },
    orderBy: { updatedAt: "desc" },
    include: {
      venue: true,
      primaryContact: {
        select: { userName: true },
      },
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">
            Paper browser
          </h2>
          <p className="text-sm text-slate-500">
            Open a record to inspect metadata, authorship, revisions, and audit
            logs.
          </p>
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
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
                    <span className="font-medium text-slate-900">
                      {paper.title}
                    </span>
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
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
                    {paper.status}
                  </span>
                </td>
                <td className="px-4 py-4 text-slate-600">
                  {paper.primaryContact?.userName ?? "—"}
                </td>
                <td className="px-4 py-4 text-right">
                  <Link
                    href={`/dashboard/browser/${paper.id}`}
                    className="text-sm font-semibold text-indigo-600 hover:text-indigo-500"
                  >
                    Open →
                  </Link>
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
    </div>
  );
}
