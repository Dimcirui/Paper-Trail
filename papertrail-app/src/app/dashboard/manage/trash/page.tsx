import Link from 'next/link';
import RestoreButton from '../../components/RestoreButton';
import LogoutButton from '../../components/LogoutButton';

type Paper = {
    id: number;
    title: string;
    status: string;
    updatedAt: string;
    venue?: { venueName: string };
    primaryContact?: { userName: string };
};

export default async function TrashPage() {
    const authToken = process.env.API_AUTH_TOKEN || '';
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

    const response = await fetch(`${apiBaseUrl}/api/papers?deleted=true`, {
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
            {/* HEADER */}
            <div className="max-w-6xl mx-auto mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-zinc-900 flex items-center gap-2">
                        🗑️ Trash Can
                    </h1>
                    <p className="text-zinc-500 text-sm mt-1">
                        Recover deleted papers. Restored papers will return to &apos;Draft&apos; status.
                    </p>
                </div>
                {/* <Link 
                    href="/dashboard/manage" 
                    className="px-4 py-2 text-sm font-medium text-zinc-600 bg-white border border-zinc-300 rounded-lg hover:bg-zinc-50"
                >
                    Back to Manage
                </Link> */}

                {/* <div className="w-px h-6 bg-zinc-300 hidden md:block"></div>
                    
                <LogoutButton /> */}
            </div>

            {/* LIST */}
            <div className="max-w-6xl mx-auto grid gap-4">
                {papers.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl border border-dashed border-zinc-300">
                        <p className="text-zinc-400">Trash is empty.</p>
                    </div>
                ) : (
                    papers.map((paper) => (
                        <div key={paper.id} className="bg-white p-4 rounded-lg shadow-sm border border-red-100 flex justify-between items-center opacity-75 hover:opacity-100 transition-opacity">
                            <div className="flex-grow">
                                <h3 className="text-md font-semibold text-zinc-700 line-through decoration-red-400 decoration-2">
                                    {paper.title}
                                </h3>
                                <p className="text-xs text-zinc-400 mt-1">
                                    Deleted: {new Date(paper.updatedAt).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                <RestoreButton id={paper.id} token={authToken} />
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
