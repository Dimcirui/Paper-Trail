"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Analytics", href: "/dashboard/analytics" },
];

const manageItems = [{ label: "Create Paper", href: "/dashboard/manage/new" }];

type DashboardNavProps = {
  editable: boolean;
};

export default function DashboardNav({ editable }: DashboardNavProps) {
  const pathname = usePathname() ?? "";

  const getNavClass = (href: string) => {
    const isActive = pathname === href;
    return [
      "rounded-full border px-4 py-2 text-sm font-medium transition-shadow",
      isActive
        ? "border-slate-300 bg-slate-200 text-slate-900 shadow-sm"
        : "border-transparent bg-slate-100 text-slate-600 hover:border-indigo-500 hover:text-indigo-600",
    ].join(" ");
  };

  const getManageClass = (href: string) => {
    const isActive = pathname === href;
    return [
      "rounded-full border px-4 py-2 text-sm font-medium transition-shadow",
      isActive
        ? "border-indigo-300 bg-indigo-100 text-indigo-900 shadow-sm"
        : "border-transparent bg-slate-100 text-slate-600 hover:border-indigo-500 hover:text-indigo-600",
    ].join(" ");
  };

  return (
    <nav className="flex flex-wrap gap-3 text-sm">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={getNavClass(item.href)}
          aria-current={
            pathname === item.href || pathname.startsWith(`${item.href}/`)
              ? "page"
              : undefined
          }
        >
          {item.label}
        </Link>
      ))}
      {editable &&
        manageItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={getManageClass(item.href)}
            aria-current={pathname === item.href ? "page" : undefined}
          >
            {item.label}
          </Link>
        ))}
    </nav>
  );
}
