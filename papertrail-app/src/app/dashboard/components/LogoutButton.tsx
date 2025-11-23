"use client";

import { useRouter } from "next/navigation";
import { useUser } from "@/lib/UserContext";

export default function LogoutButton() {
    const { setUser, user } = useUser();
    const router = useRouter();

    const handleLogout = async () => {
        // 1. Call the logout API
        await fetch('/api/auth/logout', { method: 'POST' });

        // 2. Clear user context and local storage
        setUser(null);
        localStorage.removeItem('user');

        // 3. Redirect to login page
        router.push('/login');
    };

    if (!user) return null; // Don't show logout button if not logged in

    return (
        <div className="flex items-center space-x-4 text-sm">
            <span className="text-gray-700 font-medium">
                Logged in as: {user.userName} ({user.role})
            </span>
            <button
                onClick={handleLogout}
                className="text-sm font-semibold text-red-500 hover:text-red-700 transition-colors"
            >
                Logout
                </button>
        </div>
    );
}