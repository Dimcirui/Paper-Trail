import type { Metadata } from "next";
import "./globals.css";
import { ToasterProvider } from "@/components/providers/toaster-provider";
import { ClientProviders } from "./ClientProviders";

export const metadata: Metadata = {
  title: "PaperTrail Dashboard",
  description:
    "Academic workflow hub for managing research papers, authors, and analytics.",
};

export default function RootLayout({
  children,
// }: Readonly<{
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased">
        <ClientProviders>{children}</ClientProviders>
        <ToasterProvider />
      </body>
    </html>
  );
}
