"use server";

import { z } from "zod";
import { postPaper } from "@/lib/server-api";

const createSchema = z.object({
  title: z.string().min(3),
  abstract: z.string().optional(),
  status: z.string().optional(),
  venueId: z.string().optional(),
  primaryContactId: z.string(),
});

type FormState =
  | { success: false; paperId?: undefined; error?: string }
  | { success: true; paperId: number; error?: undefined };

export async function createPaperAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const parseResult = createSchema.safeParse({
    title: formData.get("title"),
    abstract: formData.get("abstract") ?? "",
    status: formData.get("status"),
    venueId: formData.get("venueId"),
    primaryContactId: formData.get("primaryContactId"),
  });

  if (!parseResult.success) {
    return { success: false, error: "Please complete all required fields." };
  }

  const payload = parseResult.data;

  try {
    const response = await postPaper({
      title: payload.title,
      abstract: payload.abstract,
      status: payload.status,
      venueId: payload.venueId ? Number(payload.venueId) : undefined,
      primaryContactId: Number(payload.primaryContactId),
    });

    return { success: true, paperId: response.paper.id };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unable to create paper. Try again.",
    };
  }
}
