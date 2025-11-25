import { notFound } from "next/navigation";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { PAPER_STATUSES } from "@/lib/papers";
import { ManagePaperPanel } from "./manage-paper-panel";

type ManageParams = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: ManageParams): Promise<Metadata> {
  const resolved = await params;
  return {
    title: `Manage Paper #${resolved.id} | PaperTrail`,
  };
}

export default async function ManagePaperPage({ params }: ManageParams) {
  const resolved = await params;
  const id = Number(resolved.id);
  if (Number.isNaN(id)) {
    notFound();
  }

  const [paper, allGrants] = await Promise.all([
    prisma.paper.findUnique({
      where: { id },
      include: {
        authors: {
          include: { user: true },
          orderBy: { authorOrder: "asc" },
        },
        grants: {
          include: { grant: true },
        },
      },
    }),
    prisma.grant.findMany({
      orderBy: { grantName: "asc" },
    }),
  ]);

  if (!paper) {
    notFound();
  }

  const potentialAuthors = await prisma.user.findMany({
    orderBy: { userName: "asc" },
    take: 100,
  });
  const existingAuthorIds = new Set(paper.authors.map((author) => author.userId));

  const linkedGrantIds = new Set(paper.grants.map((pg) => pg.grantId));
  const availableGrants = allGrants.filter((g) => !linkedGrantIds.has(g.id));

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
      currentGrants={paper.grants.map((pg) => ({
        grantId: pg.grantId,
        grantName: pg.grant.grantName,
        sponsor: pg.grant.sponsor ?? "Unknown Sponsor",
      }))}
      availableGrants={availableGrants.map((grant) => ({
        id: grant.id,
        label: `${grant.grantName} (${grant.sponsor})`,
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
