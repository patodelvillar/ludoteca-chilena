"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { z } from "zod";
import type { ContentStatus, PublisherStatus } from "@prisma/client";
import { authOptions, isAdminRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadToR2 } from "@/lib/r2";
import { slugify } from "@/lib/utils";

export type PublisherActionState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[] | undefined>;
};

function optionalString(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function optionalNumber(value: unknown) {
  if (typeof value !== "string" || value.trim() === "") return null;
  const number = Number(value);
  return Number.isInteger(number) ? number : Number.NaN;
}

const publisherSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(2, "El nombre es obligatorio").max(180),
  slug: z.preprocess(optionalString, z.string().max(220).nullable()),
  nickname: z.preprocess(optionalString, z.string().max(120).nullable()),
  country: z.preprocess(optionalString, z.string().max(120).nullable()),
  city: z.preprocess(optionalString, z.string().max(120).nullable()),
  website: z.preprocess(optionalString, z.string().url().max(500).nullable()),
  founded_year: z.preprocess(optionalNumber, z.number().int().min(1800).max(new Date().getFullYear() + 1).nullable()),
  closed_year: z.preprocess(optionalNumber, z.number().int().min(1800).max(new Date().getFullYear() + 1).nullable()),
  status: z.enum(["active", "inactive", "unknown"]),
  content_status: z.enum(["draft", "published", "archived"]),
  former_name: z.preprocess(optionalString, z.string().max(180).nullable()),
  historical_notes: z.preprocess(optionalString, z.string().max(20000).nullable()),
  internal_notes: z.preprocess(optionalString, z.string().max(20000).nullable()),
  was_contacted: z.preprocess((value) => value === "on", z.boolean()),
});

const logoUploadSchema = z.object({
  publisherId: z.string().uuid(),
  altText: z.preprocess(optionalString, z.string().max(240).nullable()),
  sourceDescription: z.preprocess(optionalString, z.string().max(240).nullable()),
});

async function assertAdmin() {
  const session = await getServerSession(authOptions);
  if (!isAdminRole(session?.user?.role)) throw new Error("No autorizado");
}

function parsePublisher(formData: FormData) {
  return publisherSchema.parse({
    id: formData.get("id") || undefined,
    name: formData.get("name"),
    slug: formData.get("slug"),
    nickname: formData.get("nickname"),
    country: formData.get("country"),
    city: formData.get("city"),
    website: formData.get("website"),
    founded_year: formData.get("founded_year"),
    closed_year: formData.get("closed_year"),
    status: formData.get("status"),
    content_status: formData.get("content_status"),
    former_name: formData.get("former_name"),
    historical_notes: formData.get("historical_notes"),
    internal_notes: formData.get("internal_notes"),
    was_contacted: formData.get("was_contacted"),
  });
}

async function uniqueSlug(baseText: string, currentId?: string) {
  const base = slugify(baseText) || "editorial";
  let candidate = base;
  let suffix = 2;

  while (true) {
    const existing = await prisma.publisher.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!existing || existing.id === currentId) return candidate;
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
}

function toPublisherData(data: z.infer<typeof publisherSchema>, slug: string) {
  return {
    name: data.name,
    slug,
    nickname: data.nickname,
    country: data.country,
    city: data.city,
    website: data.website,
    founded_year: data.founded_year,
    closed_year: data.closed_year,
    status: data.status as PublisherStatus,
    content_status: data.content_status as ContentStatus,
    former_name: data.former_name,
    historical_notes: data.historical_notes,
    internal_notes: data.internal_notes,
    was_contacted: data.was_contacted,
  };
}

function revalidatePublisher(slug?: string) {
  revalidatePath("/admin/editoriales");
  revalidatePath("/editoriales");
  if (slug) revalidatePath(`/editoriales/${slug}`);
}

export async function createPublisher(formData: FormData) {
  await assertAdmin();
  const data = parsePublisher(formData);
  const slug = await uniqueSlug(data.slug || data.name);
  const publisher = await prisma.publisher.create({
    data: toPublisherData(data, slug),
    select: { id: true, slug: true },
  });
  revalidatePublisher(publisher.slug);
  redirect(`/admin/editoriales/${publisher.id}`);
}

export async function updatePublisher(
  _prevState: PublisherActionState,
  formData: FormData,
): Promise<PublisherActionState> {
  try {
    await assertAdmin();
    const data = parsePublisher(formData);
    if (!data.id) return { success: false, message: "Falta el ID de la editorial." };
    const slug = await uniqueSlug(data.slug || data.name, data.id);
    const publisher = await prisma.publisher.update({
      where: { id: data.id },
      data: toPublisherData(data, slug),
      select: { slug: true },
    });
    revalidatePublisher(publisher.slug);
    return { success: true, message: "Editorial actualizada." };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, message: "Hay errores en el formulario.", errors: error.flatten().fieldErrors };
    }
    console.error(error);
    return { success: false, message: "No se pudo actualizar la editorial." };
  }
}

export async function uploadPublisherLogo(
  _prevState: PublisherActionState,
  formData: FormData,
): Promise<PublisherActionState> {
  try {
    await assertAdmin();
    const data = logoUploadSchema.parse({
      publisherId: formData.get("publisherId"),
      altText: formData.get("altText"),
      sourceDescription: formData.get("sourceDescription"),
    });

    const file = formData.get("logo");
    if (!(file instanceof File) || file.size === 0) {
      return { success: false, message: "Selecciona un logo." };
    }

    if (!file.type.startsWith("image/")) {
      return { success: false, message: "El archivo debe ser una imagen." };
    }

    if (file.size > 8 * 1024 * 1024) {
      return { success: false, message: "La imagen debe pesar 8 MB o menos." };
    }

    const publisher = await prisma.publisher.findUnique({
      where: { id: data.publisherId },
      select: { id: true, name: true, slug: true },
    });

    if (!publisher) return { success: false, message: "La editorial no existe." };

    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const key = `publishers/${publisher.slug}-${Date.now()}.${extension}`;
    const bytes = new Uint8Array(await file.arrayBuffer());
    const url = await uploadToR2({
      key,
      body: bytes,
      contentType: file.type || "image/jpeg",
    });

    await prisma.$transaction([
      prisma.mediaAsset.updateMany({
        where: { publisher_id: publisher.id, is_primary: true },
        data: { is_primary: false },
      }),
      prisma.mediaAsset.create({
        data: {
          publisher_id: publisher.id,
          type: "other",
          url,
          filename: file.name,
          alt_text: data.altText || `Logo de ${publisher.name}`,
          source_description: data.sourceDescription,
          is_primary: true,
        },
      }),
    ]);

    revalidatePublisher(publisher.slug);
    return { success: true, message: "Logo subido y marcado como principal." };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, message: "Hay errores en el formulario.", errors: error.flatten().fieldErrors };
    }
    console.error(error);
    return { success: false, message: "No se pudo subir el logo." };
  }
}
