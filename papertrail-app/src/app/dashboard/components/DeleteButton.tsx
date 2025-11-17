"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/UserContext";

export default function DeleteButton( { id, token }: { id: number; token: string } ) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);
    const { user } = useUser();

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this paper?")) return;

        setIsDeleting(true);
        if (user?.role !== "admin") {
            alert("You do not have permission to delete this paper.");
            setIsDeleting(false);
            return;
        }

        try {
            const response = await fetch(`/api/papers?id=${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${process.env.NEXT_PUBLIC_API_AUTH_TOKEN}`,
                    "x-user-role": user.role
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                alert(`Failed to delete paper: ${errorData.error}`);
                return;
            }

            router.refresh();
        } catch (error) {
            console.error("Error deleting paper:", error);
            alert("An unexpected error occurred.");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <button onClick={handleDelete}
                disabled={isDeleting}
                className={
                    `px-3 py-1 text-xs font-medium text-white rounded shadow transition-colors
                    ${isDeleting ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'}
                `}
        >
            {isDeleting ? "Deleting..." : "Delete"}
        </button>
    );
}