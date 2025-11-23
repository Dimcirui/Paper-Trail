import Link from "next/link";
import { ReactNode } from "react";
import LogoutButton from "./components/LogoutButton";
import LoginLink from "./components/LoginLink";
import { canEditContent, getAuthContext } from "@/lib/user";

const navItems = [
  { label: "Activity", href: "/dashboard" },
  { label: "Browser", href: "/dashboard/browser" },
  { label: "Analytics", href: "/dashboard/analytics" },
];

const manageItems = [
  { label: "Create Paper", href: "/dashboard/manage/new" },
];

type DashboardLayoutProps = {
  children: ReactNode;
};

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const { role, isAuthenticated, userName } = await getAuthContext();
  if (!isAuthenticated) {
    // Middleware should prevent unauthenticated access, but guard defensively.
    return null;
  }

  const editable = canEditContent(role);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-indigo-500">
              SunXHoC Research OS
            </p>
            <h1 className="text-2xl font-semibold text-slate-900">
              PaperTrail Control Room
            </h1>
            <p className="text-sm text-slate-500">
              {isAuthenticated ? (
                <>
                  User:{" "}
                  <span className="font-medium capitalize">
                    {userName ?? "Authenticated"}
                  </span>{" "}
                  · Role:{" "}
                  <span className="font-medium capitalize">{role}</span>
                </>
              ) : (
                <>
                  Role: <span className="font-medium capitalize">{role}</span>
                </>
              )}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <nav className="flex flex-wrap gap-3 text-sm font-medium text-slate-600">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full border border-transparent bg-slate-100 px-4 py-2 hover:border-indigo-500 hover:text-indigo-600"
                >
                  {item.label}
                </Link>
              ))}
              {editable &&
                manageItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-indigo-600 hover:border-indigo-500"
                  >
                    {item.label}
                  </Link>
                ))}
            </nav>
            <div className="flex items-center gap-2">
              {!isAuthenticated && <LoginLink />}
              {isAuthenticated && <LogoutButton showUserLabel={false} />}
              <Link
                href="/"
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-slate-600 hover:border-indigo-500 hover:text-indigo-700"
              >
                Home
              </Link>
            </div>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}
