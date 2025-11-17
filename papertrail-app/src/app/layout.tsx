import type { Metadata } from "next";
import "./globals.css";
import { ClientProviders } from "./ClientProviders";

export const metadata: Metadata = {
  title: "PaperTrail",
  description: "Research-publication management and collaboration platform.",
};

/**
 * Provides the application's root HTML structure and global font/antialiasing classes.
 *
 * @param children - The React nodes to render inside the document body.
 * @returns The root HTML element containing the provided `children`.
 */
export default function RootLayout({
  children,
// }: Readonly<{
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-zinc-50 font-sans text-zinc-900 antialiased">
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}