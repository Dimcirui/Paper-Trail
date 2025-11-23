import React from 'react';
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
        <div className="min-h-screen bg-zinc-50 p-8 font-sans">
            {/* 1. Header Area */}
            <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-zinc-900">My Papers</h1>
                    <p className="text-zinc-500 text-sm mt-1">
                        Manage your drafts, submissions, and revisions.
                    </p>
                </div>
                
                <div className="flex items-center gap-3">
                    <Link 
                        href="/dashboard" 
                        className="px-4 py-2 text-sm font-medium text-zinc-600 bg-white border border-zinc-300 rounded-lg hover:bg-zinc-50 transition-colors"
                    >
                        Back to Hub
                    </Link>
                    <Link 
                        href="/dashboard/manage/new" 
                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm flex items-center gap-2 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                        Create Paper
                    </Link>
                </div>
            </div>

            {/* 2. Empty State */}
            {papers.length === 0 ? (
                <div className="max-w-2xl mx-auto text-center py-20 bg-white rounded-xl border border-dashed border-zinc-300">
                    <div className="mx-auto h-12 w-12 text-zinc-400 mb-4">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    </div>
                    <h3 className="text-lg font-medium text-zinc-900">No papers yet</h3>
                    <p className="mt-1 text-sm text-zinc-500">Get started by creating a new research paper.</p>
                    <div className="mt-6">
                        <Link href="/dashboard/manage/new" className="text-indigo-600 hover:text-indigo-500 font-medium text-sm">
                            Create new paper &rarr;
                        </Link>
                    </div>
                </div>
            ) : (
                /* 3. Cards Grid Layout (Original Dashboard Style) */
                <div className="max-w-7xl mx-auto grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {papers.map((paper) => (
                        <div 
                            key={paper.id} 
                            className="group bg-white p-6 rounded-xl shadow-sm border border-zinc-200 hover:shadow-md hover:border-indigo-200 transition-all duration-200 flex flex-col h-full"
                        >
                            {/* Card Header: Status + ID */}
                            <div className="flex justify-between items-start mb-4">
                                <StatusBadge status={paper.status} />
                                <span className="text-xs font-mono text-zinc-400">#{paper.id}</span>
                            </div>

                            {/* Card Content: Title + Abstract */}
                            <div className="mb-4 flex-grow">
                                <h2 className="text-lg font-semibold text-zinc-900 mb-2 leading-tight group-hover:text-indigo-700 transition-colors line-clamp-2">
                                    {paper.title}
                                </h2>
                                <p className="text-sm text-zinc-500 line-clamp-3">
                                    {paper.abstract || <span className="italic text-zinc-300">No abstract provided...</span>}
                                </p>
                            </div>

                            {/* Card Footer: Metadata + Actions */}
                            <div className="pt-4 border-t border-zinc-100 mt-auto">
                                <div className="flex flex-col gap-1 mb-4 text-xs text-zinc-500">
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
                                        className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-zinc-700 bg-zinc-100 rounded-md hover:bg-zinc-200 transition-colors"
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
        Draft: "bg-zinc-100 text-zinc-600",
        Submitted: "bg-blue-100 text-blue-700",
        UnderReview: "bg-amber-100 text-amber-800",
        Accepted: "bg-emerald-100 text-emerald-700",
        Published: "bg-green-100 text-green-800",
        Rejected: "bg-red-100 text-red-700",
        Withdrawn: "bg-gray-100 text-gray-500 line-through decoration-zinc-400",
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || "bg-zinc-100"}`}>
            {status}
        </span>
    );
}