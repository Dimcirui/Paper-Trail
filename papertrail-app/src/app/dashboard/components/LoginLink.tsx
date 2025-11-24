"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type LoginLinkProps = {
  className?: string;
};

export default function LoginLink({ className }: LoginLinkProps) {
  usePathname(); // ensure client navigation awareness; value not needed when linking to /login
  return (
    <Link
      href="/login"
      className={
        className ??
        "rounded-full border border-indigo-100 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-indigo-600 hover:border-indigo-500 hover:text-indigo-700"
      }
      prefetch={false}
    >
      Log In
    </Link>
  );
}
