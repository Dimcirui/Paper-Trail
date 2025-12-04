"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { purgePaperAction } from "../manage/[id]/actions";

export default function PurgeButton({ id }: { id: number }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const handlePurge = async () => {
        if (!confirm("WARNING: This will PERMANENTLY delete the paper and all its history.\n\nThis action cannot be undone.\n\nAre you sure?")) {
            return;
        }

        startTransition(async () => {
            const result = await purgePaperAction(id);
            if (result.error) {
                alert(result.error);
            } else {
                router.refresh();
            }
        });
    };

    return (
        <button
            onClick={handlePurge}
            disabled={isPending}
            className={`
                px-3 py-1.5 text-xs font-medium text-white rounded-md shadow transition-colors flex items-center gap-1
                ${isPending ? 'bg-red-900 cursor-not-allowed' : 'bg-red-800 hover:bg-red-950'}
            `}
            title="Permanently Delete (Hard Delete)"
        >
            {isPending ? "Purging..." : "Purge"}
        </button>
    );
}