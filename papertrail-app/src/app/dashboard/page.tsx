import Link from "next/link";
import { text } from "stream/consumers";
import LogoutButton from "./components/LogoutButton";


const menuItems = [
    {
        title: "Paper Management",
        description: "Create new papers, update metadata, manage authors or track revisions.",
        href: "/dashboard/manage",
        icon: "📄",
        color: "bg-blue-50 border-blue-200 hover:border-blue-400",
        textColor: "text-blue-700"
    },
    {
        title: "Paper Broser",
        description: "Search, filter and browse all research papers in the repository.",
        href: "/dashboard/browser",
        icon: "🔍",
        color: "bg-indigo-50 border-indigo-200 hover:border-indigo-400",
        textColor: "text-indigo-700"
    },
    {
        title: "Analytics",
        description: "Visualize research output, funding trends and venue statistics.",
        href: "/dashboard/analytics",
        icon: "📊",
        color: "bg-purple-50 border-purple-200 hover:border-purple-400",
        textColor: "text-purple-700"
    }
];
    
export default function DashboardPage() {
    return (
        <div className="min-h-screen bg-zinc-50 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Research Dashboard</h1>
                    <p className="text-sm text-gray-500">Select a module to continue.</p>
                </div>
            </header>

            {/* Cards */}
            <main className="flex-grow p-8 max-w-7xl mx-auto w-full flex items-center justify-center">
                <div className="grid gap-8 md:grid-cols-3 w-full">
                    {menuItems.map((item) => (
                        <Link href={item.href} key={item.title} className="group">
                            <div className={`h-full p-8 rounded-2xl border-2 transition-all duration-200 ease-in-out transform group-hover:-translate-y-1 shadow-sm group-hover:shadow-md ${item.color}`}>
                                <div className="text-4xl mb-4">{item.icon}</div>
                                <h2 className={`text-xl font-bold mb-3 ${item.textColor}`}>{item.title}</h2>
                                <p className="text-gray-600 leading-relaxed">{item.description}</p>
                                <div className={`mt-6 font-medium flex items-center ${item.textColor} opacity-0 group-hover:opacity-100 transition-opacity`}>
                                    Access Module →
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </main>
        </div>
    );
}