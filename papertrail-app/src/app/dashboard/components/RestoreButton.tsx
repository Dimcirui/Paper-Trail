"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RestoreButton({ id, token }: { id: number; token: string }) {
    const router = useRouter();
    const [isRestoring, setIsRestoring] = useState(false);

    const handleRestore = async () => {
        if (!confirm("Are you sure you want to restore this paper?")) return;

        setIsRestoring(true);
        try {
            const response = await fetch(`/api/papers/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                    "x-user-role": "admin" // hardcoded for admin role
                },
                body: JSON.stringify({
                    id: id,
                    isDeleted: false
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error("Restore failed:", errorData);
                alert(`Failed to restore paper: ${errorData.error || response.statusText}`);
                return;
            }

            router.refresh();
        } catch (error) {
            console.error("Error restoring paper:", error);
            alert("An unexpected error occurred.");
        } finally {
            setIsRestoring(false);
        }
    };

    return (
        <button
            onClick={handleRestore}
            disabled={isRestoring}
            className={`
                px-3 py-1.5 text-xs font-medium text-white rounded-md shadow transition-colors flex items-center gap-1
                ${isRestoring ? 'bg-green-300 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}
            `}
        >
            {isRestoring ? "Restoring..." : "Restore"}
        </button>
    );
}