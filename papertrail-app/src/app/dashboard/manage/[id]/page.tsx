import { notFound } from "next/navigation";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { PAPER_STATUSES } from "@/lib/papers";
import { ManagePaperPanel } from "./manage-paper-panel";

type ManageParams = {
  params: { id: string };
};

export async function generateMetadata({
  params,
}: ManageParams): Promise<Metadata> {
  return {
    title: `Manage Paper #${params.id} | PaperTrail`,
  };
}

export default async function ManagePaperPage({ params }: ManageParams) {
  const id = Number(params.id);
  if (Number.isNaN(id)) {
    notFound();
  }

  const paper = await prisma.paper.findUnique({
    where: { id },
    include: {
      authors: {
        include: { user: true },
        orderBy: { authorOrder: "asc" },
      },
    },
  });

  if (!paper) {
    notFound();
  }

  const potentialAuthors = await prisma.user.findMany({
    orderBy: { userName: "asc" },
    take: 100,
  });
  const existingAuthorIds = new Set(paper.authors.map((author) => author.userId));

  return (
    <ManagePaperPanel
      paper={{
        id: paper.id,
        title: paper.title,
        abstract: paper.abstract ?? "",
        status: paper.status,
      }}
      authors={paper.authors.map((author) => ({
        id: author.id,
        userId: author.userId,
        name: author.user.userName,
        email: author.user.email,
        authorOrder: author.authorOrder,
        notes: author.contributionNotes ?? "",
      }))}
      availableAuthors={potentialAuthors
        .filter((user) => !existingAuthorIds.has(user.id))
        .map((user) => ({
          id: user.id,
          label: user.userName,
        }))}
      statuses={PAPER_STATUSES}
    />
  );
}
