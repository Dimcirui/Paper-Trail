import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { PAPER_STATUSES } from "@/lib/papers";
import { CreatePaperForm } from "./create-paper-form";

export const metadata: Metadata = {
  title: "Create Paper | PaperTrail",
};

export default async function NewPaperPage() {
  const [venues, contacts] = await Promise.all([
    prisma.venue.findMany({ orderBy: { venueName: "asc" } }),
    prisma.user.findMany({
      orderBy: { userName: "asc" },
      take: 50,
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-6">
        <h2 className="text-2xl font-semibold text-indigo-900">
          Paper intake
        </h2>
        <p className="mt-2 text-sm text-indigo-900/70">
          Capture manuscripts as soon as they are drafted, link the venue, and
          assign a primary contact to keep correspondence centralized.
        </p>
      </div>
      <CreatePaperForm
        venues={venues.map((venue) => ({
          id: venue.id,
          label: venue.venueName,
        }))}
        contacts={contacts.map((contact) => ({
          id: contact.id,
          label: contact.userName,
        }))}
        statuses={PAPER_STATUSES}
      />
    </div>
  );
}
