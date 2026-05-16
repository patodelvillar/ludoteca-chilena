"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { z } from "zod";
import type { ContentStatus, GameStatus, MediaType, OriginType, PersonRole, YearCertainty } from "@prisma/client";
import { authOptions, isAdminRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadToR2 } from "@/lib/r2";
import { slugify } from "@/lib/utils";
import { parseVideoUrl } from "@/lib/video";

export type GameActionState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[] | undefined>;
};

const contentStatusSchema = z.enum(["draft", "published", "archived"]);
const gameStatusSchema = z.enum(["available", "out_of_print", "lost", "unknown"]);
const yearCertaintySchema = z.enum(["exact", "circa", "decade", "unknown"]);
const originTypeSchema = z.enum(["original", "localization", "adaptation"]);
const mediaTypeSchema = z.enum(["board", "pieces", "card", "rulebook", "advertisement", "other"]);
const personRoleSchema = z.enum([
  "author",
  "designer",
  "artist",
  "illustrator",
  "developer",
  "graphic_designer",
  "sculptor",
  "editor",
  "writer",
  "insert_designer",
]);

function optionalString(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function optionalNumber(value: unknown) {
  if (typeof value !== "string" || value.trim() === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : Number.NaN;
}

const gameFormSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(2, "El título es obligatorio").max(180),
  slug: z.preprocess(optionalString, z.string().max(220).nullable()),
  year_published: z.preprocess(optionalNumber, z.number().int().min(1800).max(new Date().getFullYear() + 5).nullable()),
  year_certainty: yearCertaintySchema,
  year_display: z.preprocess(optionalString, z.string().max(80).nullable()),
  min_players: z.preprocess(optionalNumber, z.number().int().min(1).max(99).nullable()),
  max_players: z.preprocess(optionalNumber, z.number().int().min(1).max(999).nullable()),
  min_playtime: z.preprocess(optionalNumber, z.number().int().min(1).max(10000).nullable()),
  max_playtime: z.preprocess(optionalNumber, z.number().int().min(1).max(10000).nullable()),
  min_age: z.preprocess(optionalNumber, z.number().int().min(0).max(99).nullable()),
  description: z.preprocess(optionalString, z.string().max(20000).nullable()),
  historical_context: z.preprocess(optionalString, z.string().max(20000).nullable()),
  bgg_url: z.preprocess(optionalString, z.string().url().max(500).nullable()),
  content_status: contentStatusSchema,
  status: gameStatusSchema,
  origin_type: z.preprocess(optionalString, originTypeSchema.nullable()),
  origin_country: z.preprocess(optionalString, z.string().max(120).nullable()),
  publisher_id: z.preprocess(optionalString, z.string().uuid().nullable()),
  is_self_published: z.preprocess((value) => value === "on", z.boolean()),
  is_verified: z.preprocess((value) => value === "on", z.boolean()),
});

const uploadSchema = z.object({
  gameId: z.string().uuid(),
  altText: z.preprocess(optionalString, z.string().max(240).nullable()),
  sourceDescription: z.preprocess(optionalString, z.string().max(240).nullable()),
});

const galleryUploadSchema = uploadSchema.extend({
  type: mediaTypeSchema,
  circaYear: z.preprocess(optionalString, z.string().max(80).nullable()),
  copyrightNotes: z.preprocess(optionalString, z.string().max(500).nullable()),
});

const videoSchema = z.object({
  gameId: z.string().uuid(),
  url: z.string().trim().url("Debe ser una URL válida").max(500),
  title: z.preprocess(optionalString, z.string().max(180).nullable()),
  description: z.preprocess(optionalString, z.string().max(1000).nullable()),
});

const idSchema = z.object({
  id: z.string().uuid(),
  gameId: z.string().uuid(),
});

const taxonomySchema = z.object({
  gameId: z.string().uuid(),
  mechanicIds: z.array(z.string().uuid()),
  categoryIds: z.array(z.string().uuid()),
});

const gamePersonSchema = z.object({
  gameId: z.string().uuid(),
  personId: z.string().uuid(),
  role: personRoleSchema,
});

async function assertAdmin() {
  const session = await getServerSession(authOptions);
  if (!isAdminRole(session?.user?.role)) {
    throw new Error("No autorizado");
  }
}

function parseGameForm(formData: FormData) {
  return gameFormSchema.parse({
    id: formData.get("id") || undefined,
    title: formData.get("title"),
    slug: formData.get("slug"),
    year_published: formData.get("year_published"),
    year_certainty: formData.get("year_certainty"),
    year_display: formData.get("year_display"),
    min_players: formData.get("min_players"),
    max_players: formData.get("max_players"),
    min_playtime: formData.get("min_playtime"),
    max_playtime: formData.get("max_playtime"),
    min_age: formData.get("min_age"),
    description: formData.get("description"),
    historical_context: formData.get("historical_context"),
    bgg_url: formData.get("bgg_url"),
    content_status: formData.get("content_status"),
    status: formData.get("status"),
    origin_type: formData.get("origin_type"),
    origin_country: formData.get("origin_country"),
    publisher_id: formData.get("publisher_id"),
    is_self_published: formData.get("is_self_published"),
    is_verified: formData.get("is_verified"),
  });
}

async function uniqueSlug(baseText: string, currentGameId?: string) {
  const base = slugify(baseText) || "juego";
  let candidate = base;
  let suffix = 2;

  while (true) {
    const existing = await prisma.game.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });

    if (!existing || existing.id === currentGameId) return candidate;

    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
}

function revalidateGamePaths(slug?: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/juegos");
  if (slug) revalidatePath(`/juegos/${slug}`);
  revalidatePath("/juegos");
  revalidatePath("/");
}

function toGameData(data: z.infer<typeof gameFormSchema>, slug: string) {
  return {
    title: data.title,
    slug,
    year_published: data.year_published,
    year_certainty: data.year_certainty as YearCertainty,
    year_display: data.year_display,
    min_players: data.min_players,
    max_players: data.max_players,
    min_playtime: data.min_playtime,
    max_playtime: data.max_playtime,
    min_age: data.min_age,
    description: data.description,
    historical_context: data.historical_context,
    bgg_url: data.bgg_url,
    content_status: data.content_status as ContentStatus,
    status: data.status as GameStatus,
    origin_type: data.origin_type as OriginType | null,
    origin_country: data.origin_country,
    publisher_id: data.is_self_published ? null : data.publisher_id,
    is_self_published: data.is_self_published,
    is_verified: data.is_verified,
  };
}

export async function createGame(formData: FormData) {
  await assertAdmin();
  const data = parseGameForm(formData);
  const slug = await uniqueSlug(data.slug || data.title);

  const game = await prisma.game.create({
    data: toGameData(data, slug),
    select: { id: true, slug: true },
  });

  revalidateGamePaths(game.slug);
  redirect(`/admin/juegos/${game.id}`);
}

export async function updateGame(
  _prevState: GameActionState,
  formData: FormData,
): Promise<GameActionState> {
  try {
    await assertAdmin();
    const data = parseGameForm(formData);

    if (!data.id) return { success: false, message: "Falta el ID del juego." };

    const slug = await uniqueSlug(data.slug || data.title, data.id);
    const game = await prisma.game.update({
      where: { id: data.id },
      data: toGameData(data, slug),
      select: { slug: true },
    });

    revalidateGamePaths(game.slug);
    return { success: true, message: "Juego actualizado." };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: "Hay errores en el formulario.",
        errors: error.flatten().fieldErrors,
      };
    }
    console.error(error);
    return { success: false, message: "No se pudo actualizar el juego." };
  }
}

export async function uploadGameCover(
  _prevState: GameActionState,
  formData: FormData,
): Promise<GameActionState> {
  try {
    await assertAdmin();
    const data = uploadSchema.parse({
      gameId: formData.get("gameId"),
      altText: formData.get("altText"),
      sourceDescription: formData.get("sourceDescription"),
    });

    const file = formData.get("cover");
    if (!(file instanceof File) || file.size === 0) {
      return { success: false, message: "Selecciona una imagen." };
    }

    if (!file.type.startsWith("image/")) {
      return { success: false, message: "El archivo debe ser una imagen." };
    }

    if (file.size > 8 * 1024 * 1024) {
      return { success: false, message: "La imagen debe pesar 8 MB o menos." };
    }

    const game = await prisma.game.findUnique({
      where: { id: data.gameId },
      select: { id: true, title: true, slug: true },
    });

    if (!game) return { success: false, message: "El juego no existe." };

    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const key = `covers/${game.slug}-${Date.now()}.${extension}`;
    const bytes = new Uint8Array(await file.arrayBuffer());
    const url = await uploadToR2({
      key,
      body: bytes,
      contentType: file.type || "image/jpeg",
    });

    await prisma.mediaAsset.updateMany({
      where: { game_id: game.id, is_primary: true },
      data: { is_primary: false },
    });

    await prisma.mediaAsset.create({
      data: {
        game_id: game.id,
        type: "cover",
        url,
        filename: file.name,
        alt_text: data.altText || `Portada de ${game.title}`,
        source_description: data.sourceDescription,
        is_primary: true,
      },
    });

    revalidateGamePaths(game.slug);
    return { success: true, message: "Portada subida y marcada como primaria." };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: "Hay errores en el formulario.",
        errors: error.flatten().fieldErrors,
      };
    }
    console.error(error);
    return { success: false, message: "No se pudo subir la portada." };
  }
}

export async function uploadGameGalleryImage(
  _prevState: GameActionState,
  formData: FormData,
): Promise<GameActionState> {
  try {
    await assertAdmin();
    const data = galleryUploadSchema.parse({
      gameId: formData.get("gameId"),
      type: formData.get("type"),
      altText: formData.get("altText"),
      sourceDescription: formData.get("sourceDescription"),
      circaYear: formData.get("circaYear"),
      copyrightNotes: formData.get("copyrightNotes"),
    });

    const file = formData.get("galleryImage");
    if (!(file instanceof File) || file.size === 0) {
      return { success: false, message: "Selecciona una imagen para la galería." };
    }

    if (!file.type.startsWith("image/")) {
      return { success: false, message: "El archivo debe ser una imagen." };
    }

    if (file.size > 8 * 1024 * 1024) {
      return { success: false, message: "La imagen debe pesar 8 MB o menos." };
    }

    const game = await prisma.game.findUnique({
      where: { id: data.gameId },
      select: { id: true, title: true, slug: true },
    });

    if (!game) return { success: false, message: "El juego no existe." };

    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const key = `gallery/games/${game.slug}-${Date.now()}.${extension}`;
    const bytes = new Uint8Array(await file.arrayBuffer());
    const url = await uploadToR2({
      key,
      body: bytes,
      contentType: file.type || "image/jpeg",
    });

    await prisma.mediaAsset.create({
      data: {
        game_id: game.id,
        type: data.type as MediaType,
        url,
        filename: file.name,
        alt_text: data.altText || `${game.title} - galería`,
        source_description: data.sourceDescription,
        circa_year: data.circaYear,
        copyright_notes: data.copyrightNotes,
        is_primary: false,
      },
    });

    revalidateGamePaths(game.slug);
    return { success: true, message: "Imagen agregada a la galería." };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: "Hay errores en el formulario.",
        errors: error.flatten().fieldErrors,
      };
    }
    console.error(error);
    return { success: false, message: "No se pudo subir la imagen de galería." };
  }
}

export async function deleteGameMedia(formData: FormData) {
  await assertAdmin();
  const { id, gameId } = idSchema.parse({
    id: formData.get("id"),
    gameId: formData.get("gameId"),
  });

  const game = await prisma.game.findUnique({
    where: { id: gameId },
    select: { slug: true },
  });

  await prisma.mediaAsset.deleteMany({
    where: { id, game_id: gameId, is_primary: false },
  });

  revalidateGamePaths(game?.slug);
}

export async function updateGameTaxonomy(
  _prevState: GameActionState,
  formData: FormData,
): Promise<GameActionState> {
  try {
    await assertAdmin();
    const data = taxonomySchema.parse({
      gameId: formData.get("gameId"),
      mechanicIds: formData.getAll("mechanicIds"),
      categoryIds: formData.getAll("categoryIds"),
    });

    const game = await prisma.game.findUnique({
      where: { id: data.gameId },
      select: { id: true, slug: true },
    });

    if (!game) return { success: false, message: "El juego no existe." };

    const relationWrites = [
      prisma.gameMechanic.deleteMany({ where: { game_id: game.id } }),
      prisma.gameCategory.deleteMany({ where: { game_id: game.id } }),
    ];

    if (data.mechanicIds.length > 0) {
      relationWrites.push(
        prisma.gameMechanic.createMany({
          data: data.mechanicIds.map((mechanicId) => ({
            game_id: game.id,
            mechanic_id: mechanicId,
          })),
          skipDuplicates: true,
        }),
      );
    }

    if (data.categoryIds.length > 0) {
      relationWrites.push(
        prisma.gameCategory.createMany({
          data: data.categoryIds.map((categoryId) => ({
            game_id: game.id,
            category_id: categoryId,
          })),
          skipDuplicates: true,
        }),
      );
    }

    await prisma.$transaction(relationWrites);

    revalidateGamePaths(game.slug);
    return { success: true, message: "Relaciones actualizadas." };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, message: "Hay errores en el formulario.", errors: error.flatten().fieldErrors };
    }
    console.error(error);
    return { success: false, message: "No se pudieron actualizar las relaciones." };
  }
}

export async function addGamePerson(
  _prevState: GameActionState,
  formData: FormData,
): Promise<GameActionState> {
  try {
    await assertAdmin();
    const data = gamePersonSchema.parse({
      gameId: formData.get("gameId"),
      personId: formData.get("personId"),
      role: formData.get("role"),
    });

    const game = await prisma.game.findUnique({
      where: { id: data.gameId },
      select: { id: true, slug: true },
    });

    if (!game) return { success: false, message: "El juego no existe." };

    await prisma.gamePerson.create({
      data: {
        game_id: game.id,
        person_id: data.personId,
        role: data.role as PersonRole,
      },
    });

    revalidateGamePaths(game.slug);
    return { success: true, message: "Persona agregada." };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, message: "Hay errores en el formulario.", errors: error.flatten().fieldErrors };
    }
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return { success: false, message: "Esa persona ya tiene ese rol en este juego." };
    }
    console.error(error);
    return { success: false, message: "No se pudo agregar la persona." };
  }
}

export async function deleteGamePerson(formData: FormData) {
  await assertAdmin();
  const { id, gameId } = idSchema.parse({
    id: formData.get("id"),
    gameId: formData.get("gameId"),
  });

  const game = await prisma.game.findUnique({
    where: { id: gameId },
    select: { slug: true },
  });

  await prisma.gamePerson.deleteMany({
    where: { id, game_id: gameId },
  });

  revalidateGamePaths(game?.slug);
}

export async function createGameVideo(
  _prevState: GameActionState,
  formData: FormData,
): Promise<GameActionState> {
  try {
    await assertAdmin();
    const data = videoSchema.parse({
      gameId: formData.get("gameId"),
      url: formData.get("url"),
      title: formData.get("title"),
      description: formData.get("description"),
    });

    const game = await prisma.game.findUnique({
      where: { id: data.gameId },
      select: { id: true, slug: true },
    });

    if (!game) return { success: false, message: "El juego no existe." };

    const parsed = parseVideoUrl(data.url);

    await prisma.gameVideo.create({
      data: {
        game_id: game.id,
        url: data.url,
        platform: parsed.platform,
        video_id: parsed.videoId,
        thumbnail: parsed.thumbnail,
        title: data.title,
        description: data.description,
      },
    });

    revalidateGamePaths(game.slug);
    return { success: true, message: "Video agregado." };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, message: "Hay errores en el formulario.", errors: error.flatten().fieldErrors };
    }
    console.error(error);
    return { success: false, message: "No se pudo agregar el video." };
  }
}

export async function deleteGameVideo(formData: FormData) {
  await assertAdmin();
  const { id, gameId } = idSchema.parse({
    id: formData.get("id"),
    gameId: formData.get("gameId"),
  });

  const game = await prisma.game.findUnique({
    where: { id: gameId },
    select: { slug: true },
  });

  await prisma.gameVideo.deleteMany({
    where: { id, game_id: gameId },
  });

  revalidateGamePaths(game?.slug);
}
