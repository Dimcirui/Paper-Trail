"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deletePaperAction } from "./actions";

export default function DeletePaperButton({ paperId }: { paperId: number }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to DELETE this paper?")) return;

    setIsDeleting(true);
    const result = await deletePaperAction(paperId);

    if (result.success) {
      router.push("/dashboard");
      router.refresh();
    } else {
      alert(result.error);
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
    >
      {isDeleting ? "Deleting..." : "Delete Paper"}
    </button>
  );
}