"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions, isAdminRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type TimelineActionState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[] | undefined>;
};

const statusSchema = z.enum(["draft", "published", "archived"]);

const timelineFormSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(2, "El título es obligatorio").max(180, "Título demasiado largo"),
  year: z.preprocess((value) => {
    if (typeof value !== "string" || value.trim() === "") return null;
    const parsed = Number(value);
    return Number.isInteger(parsed) ? parsed : Number.NaN;
  }, z.number().int().min(1800, "Año demasiado antiguo").max(new Date().getFullYear() + 1, "Año demasiado futuro").nullable()),
  year_display: z.preprocess((value) => {
    if (typeof value !== "string") return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }, z.string().max(80, "Texto de fecha demasiado largo").nullable()),
  description: z.preprocess((value) => {
    if (typeof value !== "string") return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }, z.string().max(4000, "Descripción demasiado larga").nullable()),
  content_status: statusSchema,
});

const idSchema = z.object({
  id: z.string().uuid(),
});

async function assertAdmin() {
  const session = await getServerSession(authOptions);
  if (!isAdminRole(session?.user?.role)) {
    throw new Error("No autorizado");
  }
}

function parseTimelineForm(formData: FormData) {
  return timelineFormSchema.parse({
    id: formData.get("id") || undefined,
    title: formData.get("title"),
    year: formData.get("year"),
    year_display: formData.get("year_display"),
    description: formData.get("description"),
    content_status: formData.get("content_status"),
  });
}

function revalidateTimeline() {
  revalidatePath("/admin");
  revalidatePath("/admin/timeline");
  revalidatePath("/historia");
}

export async function createTimelineEvent(
  _prevState: TimelineActionState,
  formData: FormData,
): Promise<TimelineActionState> {
  try {
    await assertAdmin();
    const data = parseTimelineForm(formData);

    await prisma.timelineEvent.create({
      data: {
        title: data.title,
        year: data.year,
        year_display: data.year_display,
        description: data.description,
        content_status: data.content_status,
      },
    });

    revalidateTimeline();
    return { success: true, message: "Hito creado." };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: "Hay errores en el formulario.",
        errors: error.flatten().fieldErrors,
      };
    }
    console.error(error);
    return { success: false, message: "No se pudo crear el hito." };
  }
}

export async function updateTimelineEvent(
  _prevState: TimelineActionState,
  formData: FormData,
): Promise<TimelineActionState> {
  try {
    await assertAdmin();
    const data = parseTimelineForm(formData);

    if (!data.id) {
      return { success: false, message: "Falta el identificador del hito." };
    }

    await prisma.timelineEvent.update({
      where: { id: data.id },
      data: {
        title: data.title,
        year: data.year,
        year_display: data.year_display,
        description: data.description,
        content_status: data.content_status,
      },
    });

    revalidateTimeline();
    return { success: true, message: "Hito actualizado." };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: "Hay errores en el formulario.",
        errors: error.flatten().fieldErrors,
      };
    }
    console.error(error);
    return { success: false, message: "No se pudo actualizar el hito." };
  }
}

export async function deleteTimelineEvent(formData: FormData) {
  await assertAdmin();
  const { id } = idSchema.parse({ id: formData.get("id") });

  await prisma.timelineEvent.delete({
    where: { id },
  });

  revalidateTimeline();
}
