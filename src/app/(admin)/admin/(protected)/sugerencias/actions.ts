"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions, isAdminRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

type ActionState = {
  success: boolean;
  message: string;
};

const suggestionActionSchema = z.object({
  suggestionId: z.string().uuid(),
  reviewerNotes: z.string().trim().max(2000).optional(),
});

async function assertAdmin() {
  const session = await getServerSession(authOptions);
  if (!isAdminRole(session?.user?.role)) {
    throw new Error("No autorizado");
  }
}

async function uniqueGameSlug(title: string) {
  const base = slugify(title) || "juego";
  let candidate = base;
  let suffix = 2;

  while (await prisma.game.findUnique({ where: { slug: candidate } })) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}

function parseForm(formData: FormData) {
  return suggestionActionSchema.parse({
    suggestionId: formData.get("suggestionId"),
    reviewerNotes: formData.get("reviewerNotes") || undefined,
  });
}

function refreshAdminSuggestions() {
  revalidatePath("/admin");
  revalidatePath("/admin/sugerencias");
  revalidatePath("/admin/juegos");
}

export async function approveSuggestion(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await assertAdmin();
    const { suggestionId, reviewerNotes } = parseForm(formData);

    const suggestion = await prisma.gameSuggestion.findUnique({
      where: { id: suggestionId },
    });

    if (!suggestion) {
      return { success: false, message: "La sugerencia no existe." };
    }

    if (suggestion.game_id) {
      return { success: true, message: "Esta sugerencia ya tiene un juego asociado." };
    }

    const slug = await uniqueGameSlug(suggestion.title);

    const game = await prisma.game.create({
      data: {
        slug,
        title: suggestion.title,
        year_published: suggestion.year,
        year_certainty: suggestion.year ? "exact" : "unknown",
        description: suggestion.description || suggestion.notes || null,
        bgg_url: suggestion.bgg_url || null,
        content_status: "draft",
        status: "unknown",
      },
      select: { id: true },
    });

    await prisma.gameSuggestion.update({
      where: { id: suggestion.id },
      data: {
        is_reviewed: true,
        is_approved: true,
        reviewer_notes: reviewerNotes || null,
        game_id: game.id,
      },
    });

    refreshAdminSuggestions();
    return { success: true, message: "Sugerencia aprobada y juego creado como borrador." };
  } catch (error) {
    console.error(error);
    return { success: false, message: "No se pudo aprobar la sugerencia." };
  }
}

export async function rejectSuggestion(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await assertAdmin();
    const { suggestionId, reviewerNotes } = parseForm(formData);

    await prisma.gameSuggestion.update({
      where: { id: suggestionId },
      data: {
        is_reviewed: true,
        is_approved: false,
        reviewer_notes: reviewerNotes || null,
      },
    });

    refreshAdminSuggestions();
    return { success: true, message: "Sugerencia rechazada." };
  } catch (error) {
    console.error(error);
    return { success: false, message: "No se pudo rechazar la sugerencia." };
  }
}

export async function markSuggestionReviewed(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await assertAdmin();
    const { suggestionId, reviewerNotes } = parseForm(formData);

    await prisma.gameSuggestion.update({
      where: { id: suggestionId },
      data: {
        is_reviewed: true,
        reviewer_notes: reviewerNotes || null,
      },
    });

    refreshAdminSuggestions();
    return { success: true, message: "Sugerencia marcada como revisada." };
  } catch (error) {
    console.error(error);
    return { success: false, message: "No se pudo marcar como revisada." };
  }
}
