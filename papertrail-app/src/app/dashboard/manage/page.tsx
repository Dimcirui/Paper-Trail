import Link from 'next/link';

export default function ManagePage() {
    return (
        <div className="p-12 text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Paper Management</h1>
            <p className="text-gray-600 mb-8">Create and Update functionality will be implemented here.</p>
            <Link href="/dashboard" className="text-blue-600 hover:underline">← Back to Hub</Link>
        </div>
    );
}