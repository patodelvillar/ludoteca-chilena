"use server"

import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"
import { z } from "zod"

export type SuggestionFormState = {
  success: boolean
  message: string
  errors?: Record<string, string[] | undefined>
}

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000
const RATE_LIMIT_MAX = 5

type RateLimitEntry = {
  count: number
  resetAt: number
}

const globalForRateLimit = globalThis as unknown as {
  suggestionRateLimit?: Map<string, RateLimitEntry>
}

const suggestionRateLimit =
  globalForRateLimit.suggestionRateLimit ?? new Map<string, RateLimitEntry>()

globalForRateLimit.suggestionRateLimit = suggestionRateLimit

function normalizeOptionalString(value: unknown) {
  if (typeof value !== "string") return undefined
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

function parseOptionalYear(value: unknown) {
  if (typeof value !== "string" || value.trim() === "") return null
  const year = Number(value)
  return Number.isInteger(year) ? year : Number.NaN
}

const suggestionSchema = z.object({
  title: z.string().trim().min(2, "El título debe tener al menos 2 caracteres").max(160, "El título es demasiado largo"),
  submitter_name: z.string().trim().min(2, "Tu nombre debe tener al menos 2 caracteres").max(120, "El nombre es demasiado largo"),
  submitter_email: z.string().trim().email("Debe ser un email válido").max(254, "El email es demasiado largo"),
  year: z.preprocess(
    parseOptionalYear,
    z.number().int().min(1800, "El año parece demasiado antiguo").max(new Date().getFullYear() + 1, "El año parece demasiado futuro").nullable(),
  ),
  author_name: z.preprocess(normalizeOptionalString, z.string().max(160, "El nombre de autor es demasiado largo").optional()),
  publisher_name: z.preprocess(normalizeOptionalString, z.string().max(160, "La editorial es demasiado larga").optional()),
  bgg_url: z.preprocess(
    normalizeOptionalString,
    z.string().url("Debe ser una URL válida si se proporciona").max(500, "La URL es demasiado larga").optional(),
  ),
  notes: z.preprocess(normalizeOptionalString, z.string().max(2000, "Las notas son demasiado largas").optional()),
  website: z.preprocess(normalizeOptionalString, z.string().max(500).optional()),
})

function isRateLimited(key: string) {
  const now = Date.now()
  const current = suggestionRateLimit.get(key)

  if (!current || current.resetAt <= now) {
    suggestionRateLimit.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return false
  }

  current.count += 1
  return current.count > RATE_LIMIT_MAX
}

function getClientKey(headersList: Headers, email: string) {
  const forwardedFor = headersList.get("x-forwarded-for")?.split(",")[0]?.trim()
  const realIp = headersList.get("x-real-ip")?.trim()
  return `${forwardedFor || realIp || "unknown"}:${email.toLowerCase()}`
}

export async function submitGameSuggestion(
  _prevState: SuggestionFormState,
  formData: FormData,
): Promise<SuggestionFormState> {
  try {
    const rawData = Object.fromEntries(formData.entries())
    const validatedData = suggestionSchema.parse(rawData)

    if (validatedData.website) {
      return { success: true, message: "¡Sugerencia enviada con éxito! La revisaremos pronto." }
    }

    const headersList = await headers()
    if (isRateLimited(getClientKey(headersList, validatedData.submitter_email))) {
      return {
        success: false,
        message: "Recibimos varias sugerencias seguidas. Inténtalo nuevamente más tarde.",
      }
    }

    const recentDuplicate = await prisma.gameSuggestion.findFirst({
      where: {
        title: { equals: validatedData.title, mode: "insensitive" },
        submitter_email: { equals: validatedData.submitter_email, mode: "insensitive" },
        created_at: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
      select: { id: true },
    })

    if (recentDuplicate) {
      return {
        success: true,
        message: "Ya recibimos esta sugerencia recientemente. La revisaremos pronto.",
      }
    }

    await prisma.gameSuggestion.create({
      data: {
        title: validatedData.title,
        submitter_name: validatedData.submitter_name,
        submitter_email: validatedData.submitter_email,
        year: validatedData.year,
        author_name: validatedData.author_name,
        publisher_name: validatedData.publisher_name,
        bgg_url: validatedData.bgg_url || null,
        notes: validatedData.notes,
        is_reviewed: false,
        is_approved: false,
      }
    })

    return { success: true, message: "¡Sugerencia enviada con éxito! La revisaremos pronto." }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error.flatten().fieldErrors, message: "Hay errores en el formulario." }
    }
    console.error("Error saving suggestion:", error)
    return { success: false, message: "Ocurrió un error inesperado al guardar la sugerencia." }
  }
}
