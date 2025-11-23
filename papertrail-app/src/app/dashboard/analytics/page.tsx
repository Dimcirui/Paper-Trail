import Link from 'next/link';

export default function AnalyticsPage() {
    return (
        <div className="p-12 text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Research Analytics</h1>
            <p className="text-gray-600 mb-8">Charts and statistics will be displayed here.</p>
            <Link href="/dashboard" className="text-purple-600 hover:underline">← Back to Hub</Link>
        </div>
    );
}