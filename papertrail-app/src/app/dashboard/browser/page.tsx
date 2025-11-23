
import React from 'react';
import DeleteButton from '../components/DeleteButton';
import LogoutButton from '../components/LogoutButton';

type Paper = {
    id: number;
    title: string;
    abstract: string | null;
    status: string;
    primaryContact?: {
        userName: string;
    };
    venue?: {
        venueName: string;
    };
};

export default async function BrowserPage() {
    const authToken = process.env.API_AUTH_TOKEN || '';
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

    const response = await fetch(`${apiBaseUrl}/api/papers`, {
        cache: 'no-store',
        headers: {
            'Authorization': `Bearer ${authToken}`,
            'x-user-role': 'admin' // hardcoded for demo purposes
        }
    });

    if (!response.ok) {
        throw new Error('Failed to fetch papers');
    }

    const data = await response.json();
    const papers: Paper[] = data.papers || [];

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Paper Browser</h1>
                <div className="flex gap-4">
                    <a href="/dashboard" className="text-indigo-600 hover:underline">← Back to Dashboard</a>
                    <LogoutButton />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {papers.length === 0 ? (
                    <p className="text-gray-600">No papers available.</p>
                ) : (
                    papers.map((paper: Paper) => (
                        <div key={paper.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                            <div className="flex justify-between items-start">
                                <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full mb-2 
                                    ${paper.status === 'Published' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                    {paper.status}
                                </span>
                                <span className="text-xs text-gray-400">#{paper.id}</span>
                            </div>

                            <h2 className="text-xl font-semibold mb-2">{paper.title}</h2>

                            <p className="text-gray-700 mb-4">
                                {paper.abstract || 'No abstract provided.'}
                            </p>

                            <div className="text-xs text-gray-500 mt-auto pt-4 border-t border-gray-100">
                                <p className="mb-1"><span className="font-medium">Venue:</span> {paper.venue?.venueName || "Unassigned"}</p>
                                <p><span className="font-medium">Contact:</span> {paper.primaryContact?.userName}</p>
                            </div>

                            <div className="mt-4 flex justify-end">
                                <DeleteButton id={paper.id} token={authToken} />
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}