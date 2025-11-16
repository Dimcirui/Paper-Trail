
import React from 'react';

export default async function DashboardPage() {
    const response = await fetch('http://localhost:3000/api/papers', {
        cache: 'no-store',
        headers: {
            'Authorization': `Bearer ${process.env.API_AUTH_TOKEN}`,
            'x-user-role': 'admin'
        }
    });

    if (!response.ok) {
        throw new Error('Failed to fetch papers');
    }

    const data = await response.json();
    const papers = data.papers || [];

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

                {papers.length === 0 ? (
                    <p className="text-gray-600">No papers available.</p>
                ) : (
                    papers.map((paper: any) => (
                        <div key={paper.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                            <div className="flex justify-between items-start">
                                <span className="inline-block px-2 py-1 test-xs font-semibold text-blue-600 bg-blue-100 rounded-full mb-2">
                                    {paper.status}
                                </span>
                                <span className="text-xs text-gray-400">#{paper.id}</span>
                            </div>

                            <h2 className="text-xl font-semibold mb-2">{paper.title}</h2>

                            <p className="text-gray-700 mb-4">
                                {paper.abstract || 'No abstract provided.'}
                            </p>

                            <div className="text-sm text-gray-600">
                                <p> {paper.venue?.venueName || "Unassigned Venue"} </p>
                                <p> {paper.primaryContact?.userName}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}