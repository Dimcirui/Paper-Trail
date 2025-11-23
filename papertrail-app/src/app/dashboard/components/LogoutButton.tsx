"use client";

import { useRouter } from "next/navigation";
import { useUser } from "@/lib/UserContext";

type LogoutButtonProps = {
  showUserLabel?: boolean;
};

export default function LogoutButton({ showUserLabel = true }: LogoutButtonProps) {
  const { setUser, user } = useUser();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    localStorage.removeItem("user");
    router.push("/");
  };

  if (!user) return null;

  return (
    <div className="flex items-center gap-3 text-sm">
      {showUserLabel && (
        <span className="text-gray-700 font-medium">
          Logged in as: {user.userName} ({user.role})
        </span>
      )}
      <button
        onClick={handleLogout}
        className="rounded-full border border-red-100 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-red-500 transition hover:border-red-300 hover:text-red-600"
      >
        Log Out
      </button>
    </div>
  );
}
