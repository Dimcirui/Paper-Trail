
import React from 'react';
import Link from 'next/link';
import LogoutButton from '../components/LogoutButton';

type Props = {
    searchParams: {
        search?: string;
        status?: string;
    }
}

type Paper = {
    id: number;
    title: string;
    status: string;
    updatedAt: string;
    primaryContact?: {
        userName: string;
    };
    venue?: {
        venueName: string;
    };
};

export default async function BrowserPage({ searchParams }: Props) {
    const query = searchParams.search || '';
    const statusFilter = searchParams.status || '';

    const authToken = process.env.API_AUTH_TOKEN || '';
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

    const fetchUrl = new URL(`${apiBaseUrl}/api/papers`);
    if (query) {
        fetchUrl.searchParams.append('search', query);
    }
    if (statusFilter) {
        fetchUrl.searchParams.append('status', statusFilter);
    }

    const response = await fetch(fetchUrl.toString(), {
        cache: 'no-store',
        headers: {
            'Authorization': `Bearer ${authToken}`,
            'x-user-role': 'viewer' // Browser does not need elevated permissions
        }
    });

    let papers: Paper[] = [];
    if (response.ok) {
        const data = await response.json();
        papers = data.papers || [];
    }


    return (
        <div className="min-h-screen bg-zinc-50 p-8 font-sans">
            {/* HEADER */}
            <div className="max-w-7xl mx-auto mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-zinc-900">Paper Browser</h1>
                    <p className="text-zinc-500 text-sm mt-1">Search and filter publication records.</p>
                </div>
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                        &larr; Back to Hub
                    </Link>
                    <LogoutButton />
                </div>
            </div>

            {/* SEARCH & FILTER */}
            <div className="max-w-7xl mx-auto bg-white p-4 rounded-lg shadow-sm border border-zinc-200 mb-6">
                <form className="flex flex-col md:flex-row gap-4">
                    {/* Search Input */}
                    <div className="flex-grow">
                        <label htmlFor="search" className="sr-only">Search</label>
                        <input
                            type="text"
                            name="search"
                            defaultValue={query}
                            placeholder="Search by title or abstract..."
                            className="w-full px-4 py-2 border border-zinc-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        />
                    </div>

                    {/* Status Select */}
                    <div className="w-full md:w-48">
                        <select 
                            name="status" 
                            defaultValue={statusFilter}
                            className="w-full px-4 py-2 border border-zinc-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                        >
                            <option value="">All Published</option>
                            <option value="Accepted">Accepted</option>
                            <option value="Published">Published</option>
                        </select>
                    </div>

                    {/* Submit Button */}
                    <button 
                        type="submit"
                        className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition-colors shadow-sm"
                    >
                        Search
                    </button>
                    
                    {/* Reset Link (Optional) */}
                    {(query || statusFilter) && (
                        <Link 
                            href="/dashboard/browser"
                            className="px-4 py-2 text-zinc-600 border border-zinc-300 rounded-md hover:bg-zinc-50 text-center"
                        >
                            Clear
                        </Link>
                    )}
                </form>
            </div>

            {/* DATA TABLE */}
            <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-sm border border-zinc-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-zinc-600">
                        <thead className="bg-zinc-100 text-zinc-900 uppercase font-semibold text-xs">
                            <tr>
                                <th className="px-6 py-3 w-16">ID</th>
                                <th className="px-6 py-3">Title</th>
                                <th className="px-6 py-3 w-48">Venue</th>
                                <th className="px-6 py-3 w-32">Status</th>
                                <th className="px-6 py-3 w-48">Primary Contact</th>
                                <th className="px-6 py-3 w-24 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {papers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-zinc-400">
                                        No papers found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                papers.map((paper) => (
                                    <tr key={paper.id} className="hover:bg-zinc-50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs text-zinc-400">#{paper.id}</td>
                                        <td className="px-6 py-4 font-medium text-zinc-900">
                                            {paper.title}
                                        </td>
                                        <td className="px-6 py-4 text-zinc-500">
                                            {paper.venue?.venueName || <span className="italic text-zinc-300">None</span>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={paper.status} />
                                        </td>
                                        <td className="px-6 py-4">
                                            {paper.primaryContact?.userName}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-indigo-600 hover:text-indigo-900 font-medium cursor-pointer">
                                                View
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-200 text-xs text-zinc-500 flex justify-between">
                    <span>Showing {papers.length} result(s)</span>
                    {/* Pagination could go here later */}
                </div>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    let colorClass = 'bg-gray-100 text-gray-800';

    switch (status) {
        case 'Published': colorClass = 'bg-green-100 text-green-800'; break;
        case 'Accepted': colorClass = 'bg-blue-100 text-blue-800'; break;
        case 'UnderReview': colorClass = 'bg-yellow-100 text-yellow-800'; break;
        case 'Submitted': colorClass = 'bg-purple-100 text-purple-800'; break;
        case 'Rejected': colorClass = 'bg-red-100 text-red-800'; break;
        case 'Withdrawn': colorClass = 'bg-gray-200 text-gray-800'; break;
        case 'Draft': colorClass = 'bg-gray-100 text-gray-800'; break;
    }

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
            {status}
        </span>
    );
}