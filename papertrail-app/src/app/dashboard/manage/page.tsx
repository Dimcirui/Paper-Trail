import Link from 'next/link';
import DeleteButton from '../components/DeleteButton';

type Paper = {
    id: number;
    title: string;
    abstract: string | null;
    status: string;
    updatedAt: string;
    primaryContact?: { userName: string };
    venue?: { venueName: string };
};

export default async function ManagePage() {
    const authToken = process.env.API_AUTH_TOKEN || '';
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

    // Use admin role to fetch papers including non-public statuses (Draft, Rejected, etc.)
    const response = await fetch(`${apiBaseUrl}/api/papers?search=`, {
        cache: 'no-store',
        headers: {
            'Authorization': `Bearer ${authToken}`,
            'x-user-role': 'admin'
        }
    });

    let papers: Paper[] = [];
    if (response.ok) {
        const data = await response.json();
        papers = data.papers || [];
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-slate-900">Manage Papers</h2>
                    <p className="text-sm text-slate-500">Edit, delete, or create manuscripts.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        href="/dashboard/manage/trash"
                        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                        <span>🗑️</span>
                        <span>Trash</span>
                    </Link>
                    <Link
                        href="/dashboard/manage/new"
                        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
                    >
                        <svg aria-hidden="true" className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        Create Paper
                    </Link>
                </div>
            </div>

            {/* Empty State */}
            {papers.length === 0 ? (
                <div className="max-w-2xl mx-auto text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
                    <div className="mx-auto h-12 w-12 text-slate-400 mb-4">
                        <svg aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    </div>
                    <h3 className="text-lg font-medium text-slate-900">No papers yet</h3>
                    <p className="mt-1 text-sm text-slate-500">Get started by creating a new research paper.</p>
                    <div className="mt-6">
                        <Link href="/dashboard/manage/new" className="text-indigo-600 hover:text-indigo-500 font-medium text-sm">
                            Create new paper &rarr;
                        </Link>
                    </div>
                </div>
            ) : (
                /* Cards Grid Layout */
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {papers.map((paper) => (
                        <div
                            key={paper.id}
                            className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all flex flex-col h-full"
                        >
                            {/* Card Header: Status + ID */}
                            <div className="flex justify-between items-start mb-4">
                                <StatusBadge status={paper.status} />
                                <span className="text-xs font-mono text-slate-400">#{paper.id}</span>
                            </div>

                            {/* Card Content: Title + Abstract */}
                            <div className="mb-4 flex-grow">
                                <h2 className="text-lg font-semibold text-slate-900 mb-2 leading-tight group-hover:text-indigo-700 transition-colors line-clamp-2">
                                    {paper.title}
                                </h2>
                                <p className="text-sm text-slate-500 line-clamp-3">
                                    {paper.abstract || <span className="italic text-slate-300">No abstract provided...</span>}
                                </p>
                            </div>

                            {/* Card Footer: Metadata + Actions */}
                            <div className="pt-4 border-t border-slate-100 mt-auto">
                                <div className="flex flex-col gap-1 mb-4 text-xs text-slate-500">
                                    <div className="flex items-center gap-2">
                                        <span className="w-4 text-center">📍</span>
                                        <span className="truncate">{paper.venue?.venueName || "Unassigned Venue"}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="w-4 text-center">🕒</span>
                                        <span>{new Date(paper.updatedAt).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center">
                                    <Link
                                        href={`/dashboard/manage/${paper.id}`}
                                        className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors"
                                    >
                                        Edit Details
                                    </Link>
                                    <DeleteButton id={paper.id} token={authToken} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// StatusBadge Component
function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        Draft: "bg-slate-100 text-slate-700",
        Submitted: "bg-sky-50 text-sky-700",
        UnderReview: "bg-indigo-50 text-indigo-600",
        Accepted: "bg-emerald-50 text-emerald-700",
        Published: "bg-emerald-50 text-emerald-700 border border-emerald-100",
        Rejected: "bg-rose-50 text-rose-600 border border-rose-100",
        Withdrawn: "bg-slate-50 text-slate-700 border border-slate-200",
        "IN REVISION": "bg-purple-50 text-purple-700",
        OnHold: "bg-orange-50 text-orange-700",
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] ?? "bg-slate-100 text-slate-700"}`}>
            {status}
        </span>
    );
}
