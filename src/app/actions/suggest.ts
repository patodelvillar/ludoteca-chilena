"use server"

import { prisma } from "@/lib/prisma"
import { z } from "zod"

const suggestionSchema = z.object({
  title: z.string().min(2, "El título debe tener al menos 2 caracteres"),
  submitter_name: z.string().min(2, "Tu nombre debe tener al menos 2 caracteres"),
  submitter_email: z.string().email("Debe ser un email válido"),
  year: z.string().transform(val => val ? parseInt(val, 10) : null).nullable().optional(),
  author_name: z.string().optional(),
  publisher_name: z.string().optional(),
  bgg_url: z.string().url("Debe ser una URL válida si se proporciona").or(z.literal("")).optional(),
  notes: z.string().optional(),
})

export async function submitGameSuggestion(prevState: any, formData: FormData) {
  try {
    const rawData = Object.fromEntries(formData.entries())
    const validatedData = suggestionSchema.parse(rawData)

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
        is_approved: false
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
