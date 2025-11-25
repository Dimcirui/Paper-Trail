"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { patchPaper } from "@/lib/server-api";
import { PAPER_STATUSES } from "@/lib/papers";

const linkGrantSchema = z.object({
  paperId: z.number(),
  grantId: z.number(),
});

export async function linkGrantAction(input: unknown) {
  const parsed = linkGrantSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Invalid grant payload." };
  }

  try {
    const actorId = await resolveActorId();
    await prisma.$executeRaw`CALL sp_link_grant_to_paper(${parsed.data.paperId}, ${parsed.data.grantId}, ${actorId})`;

    revalidatePath(`/dashboard/manage/${parsed.data.paperId}`);
    return { success: true };
  } catch (error) {
    console.error("Link grant error:", error);
    return {
      error: "Unable to link grant. It might already be linked.",
    };
  }
}

export async function unlinkGrantAction(input: unknown) {
  const parsed = linkGrantSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Invalid grant payload." };
  }

  try {
    await prisma.paperGrant.delete({
      where: {
        paperId_grantId: {
          paperId: parsed.data.paperId,
          grantId: parsed.data.grantId,
        },
      },
    });

    revalidatePath(`/dashboard/manage/${parsed.data.paperId}`);
    return { success: true };
  } catch (error) {
    console.error("Unlink grant error:", error);
    return {
      error: "Unable to remove grant.",
    };
  }
}

const CONFIGURED_ACTOR_ID = Number(
  process.env.NEXT_PUBLIC_DEFAULT_ACTOR_ID ?? 1,
);

async function resolveActorId(): Promise<number | null> {
  if (Number.isFinite(CONFIGURED_ACTOR_ID)) {
    const exists = await prisma.user.count({
      where: { id: CONFIGURED_ACTOR_ID },
    });
    if (exists) {
      return CONFIGURED_ACTOR_ID;
    }
  }

  const fallback = await prisma.user.findFirst({
    where: { roleId: 1 },
    select: { id: true },
  });
  return fallback?.id ?? null;
}

const updatePaperSchema = z.object({
  id: z.number(),
  title: z.string().min(3),
  abstract: z.string().optional(),
  status: z.string(),
});

export async function updatePaperDetailsAction(input: unknown) {
  const parsed = updatePaperSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Invalid fields." };
  }

  if (!PAPER_STATUSES.includes(parsed.data.status as (typeof PAPER_STATUSES)[number])) {
    return { error: "Unsupported status." };
  }

  try {
    await patchPaper(parsed.data.id, {
      title: parsed.data.title,
      abstract: parsed.data.abstract ?? "",
      status: parsed.data.status,
    });
    revalidatePath(`/dashboard/manage/${parsed.data.id}`);
    return { success: true };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Unable to update paper.",
    };
  }
}

const addAuthorSchema = z.object({
  paperId: z.number(),
  userId: z.number(),
  authorOrder: z.number().optional(),
});

export async function addAuthorAction(input: unknown) {
  const parsed = addAuthorSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Invalid author payload." };
  }

  try {
    const actorId = await resolveActorId();
    await prisma.$executeRaw`CALL sp_assign_author(${parsed.data.paperId}, ${parsed.data.userId}, ${parsed.data.authorOrder ?? null}, ${null}, ${actorId})`;
    revalidatePath(`/dashboard/manage/${parsed.data.paperId}`);
    return { success: true };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Unable to link author right now.",
    };
  }
}

const removeAuthorSchema = z.object({
  paperId: z.number(),
  authorshipId: z.number(),
});

export async function removeAuthorAction(input: unknown) {
  const parsed = removeAuthorSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Invalid authorship identifier." };
  }

  try {
    await prisma.authorship.delete({
      where: { id: parsed.data.authorshipId },
    });
    revalidatePath(`/dashboard/manage/${parsed.data.paperId}`);
    return { success: true };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Unable to remove author right now.",
    };
  }
}

const reorderSchema = z.object({
  paperId: z.number(),
  authorshipId: z.number(),
  authorOrder: z.number().min(1),
});

export async function reorderAuthorAction(input: unknown) {
  const parsed = reorderSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Invalid author order payload." };
  }

  try {
    await prisma.authorship.update({
      where: { id: parsed.data.authorshipId },
      data: { authorOrder: parsed.data.authorOrder },
    });
    revalidatePath(`/dashboard/manage/${parsed.data.paperId}`);
    return { success: true };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Unable to update author order.",
    };
  }
}
