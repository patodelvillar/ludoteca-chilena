"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { z } from "zod";
import type { ContentStatus } from "@prisma/client";
import { authOptions, isAdminRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadToR2 } from "@/lib/r2";
import { slugify } from "@/lib/utils";

export type PersonActionState = {
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

const personSchema = z.object({
  id: z.string().uuid().optional(),
  display_name: z.string().trim().min(2, "El nombre público es obligatorio").max(180),
  slug: z.preprocess(optionalString, z.string().max(220).nullable()),
  first_name: z.preprocess(optionalString, z.string().max(120).nullable()),
  last_name: z.preprocess(optionalString, z.string().max(120).nullable()),
  nickname: z.preprocess(optionalString, z.string().max(120).nullable()),
  nationality: z.preprocess(optionalString, z.string().max(120).nullable()),
  gender: z.preprocess(optionalString, z.string().max(80).nullable()),
  field_of_study: z.preprocess(optionalString, z.string().max(180).nullable()),
  birth_year: z.preprocess(optionalNumber, z.number().int().min(1800).max(new Date().getFullYear()).nullable()),
  death_year: z.preprocess(optionalNumber, z.number().int().min(1800).max(new Date().getFullYear()).nullable()),
  biography: z.preprocess(optionalString, z.string().max(20000).nullable()),
  content_status: z.enum(["draft", "published", "archived"]),
  is_deceased: z.preprocess((value) => value === "on", z.boolean()),
});

const photoUploadSchema = z.object({
  personId: z.string().uuid(),
  altText: z.preprocess(optionalString, z.string().max(240).nullable()),
  sourceDescription: z.preprocess(optionalString, z.string().max(240).nullable()),
});

async function assertAdmin() {
  const session = await getServerSession(authOptions);
  if (!isAdminRole(session?.user?.role)) throw new Error("No autorizado");
}

function parsePerson(formData: FormData) {
  return personSchema.parse({
    id: formData.get("id") || undefined,
    display_name: formData.get("display_name"),
    slug: formData.get("slug"),
    first_name: formData.get("first_name"),
    last_name: formData.get("last_name"),
    nickname: formData.get("nickname"),
    nationality: formData.get("nationality"),
    gender: formData.get("gender"),
    field_of_study: formData.get("field_of_study"),
    birth_year: formData.get("birth_year"),
    death_year: formData.get("death_year"),
    biography: formData.get("biography"),
    content_status: formData.get("content_status"),
    is_deceased: formData.get("is_deceased"),
  });
}

async function uniqueSlug(baseText: string, currentId?: string) {
  const base = slugify(baseText) || "persona";
  let candidate = base;
  let suffix = 2;

  while (true) {
    const existing = await prisma.person.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!existing || existing.id === currentId) return candidate;
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
}

function toPersonData(data: z.infer<typeof personSchema>, slug: string) {
  return {
    display_name: data.display_name,
    slug,
    first_name: data.first_name,
    last_name: data.last_name,
    nickname: data.nickname,
    nationality: data.nationality,
    gender: data.gender,
    field_of_study: data.field_of_study,
    birth_year: data.birth_year,
    death_year: data.death_year,
    is_deceased: data.is_deceased,
    biography: data.biography,
    content_status: data.content_status as ContentStatus,
  };
}

function revalidatePerson(slug?: string) {
  revalidatePath("/admin/personas");
  revalidatePath("/personas");
  if (slug) revalidatePath(`/personas/${slug}`);
}

export async function createPerson(formData: FormData) {
  await assertAdmin();
  const data = parsePerson(formData);
  const slug = await uniqueSlug(data.slug || data.display_name);
  const person = await prisma.person.create({
    data: toPersonData(data, slug),
    select: { id: true, slug: true },
  });
  revalidatePerson(person.slug);
  redirect(`/admin/personas/${person.id}`);
}

export async function updatePerson(
  _prevState: PersonActionState,
  formData: FormData,
): Promise<PersonActionState> {
  try {
    await assertAdmin();
    const data = parsePerson(formData);
    if (!data.id) return { success: false, message: "Falta el ID de la persona." };
    const slug = await uniqueSlug(data.slug || data.display_name, data.id);
    const person = await prisma.person.update({
      where: { id: data.id },
      data: toPersonData(data, slug),
      select: { slug: true },
    });
    revalidatePerson(person.slug);
    return { success: true, message: "Persona actualizada." };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, message: "Hay errores en el formulario.", errors: error.flatten().fieldErrors };
    }
    console.error(error);
    return { success: false, message: "No se pudo actualizar la persona." };
  }
}

export async function uploadPersonPhoto(
  _prevState: PersonActionState,
  formData: FormData,
): Promise<PersonActionState> {
  try {
    await assertAdmin();
    const data = photoUploadSchema.parse({
      personId: formData.get("personId"),
      altText: formData.get("altText"),
      sourceDescription: formData.get("sourceDescription"),
    });

    const file = formData.get("photo");
    if (!(file instanceof File) || file.size === 0) {
      return { success: false, message: "Selecciona una foto." };
    }

    if (!file.type.startsWith("image/")) {
      return { success: false, message: "El archivo debe ser una imagen." };
    }

    if (file.size > 8 * 1024 * 1024) {
      return { success: false, message: "La imagen debe pesar 8 MB o menos." };
    }

    const person = await prisma.person.findUnique({
      where: { id: data.personId },
      select: { id: true, display_name: true, slug: true },
    });

    if (!person) return { success: false, message: "La persona no existe." };

    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const key = `people/${person.slug}-${Date.now()}.${extension}`;
    const bytes = new Uint8Array(await file.arrayBuffer());
    const url = await uploadToR2({
      key,
      body: bytes,
      contentType: file.type || "image/jpeg",
    });

    await prisma.$transaction([
      prisma.mediaAsset.updateMany({
        where: { person_id: person.id, is_primary: true },
        data: { is_primary: false },
      }),
      prisma.mediaAsset.create({
        data: {
          person_id: person.id,
          type: "other",
          url,
          filename: file.name,
          alt_text: data.altText || person.display_name,
          source_description: data.sourceDescription,
          is_primary: true,
        },
      }),
      prisma.person.update({
        where: { id: person.id },
        data: { photo_url: url },
      }),
    ]);

    revalidatePerson(person.slug);
    return { success: true, message: "Foto subida y marcada como principal." };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, message: "Hay errores en el formulario.", errors: error.flatten().fieldErrors };
    }
    console.error(error);
    return { success: false, message: "No se pudo subir la foto." };
  }
}
