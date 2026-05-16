"use client"

import { useActionState } from "react"
import { submitGameSuggestion, type SuggestionFormState } from "@/app/actions/suggest"

const initialState: SuggestionFormState = {
  success: false,
  message: "",
  errors: {},
}

export function SuggestionForm() {
  const [state, formAction, isPending] = useActionState(submitGameSuggestion, initialState)

  if (state.success) {
    return (
      <div className="bg-green-50 border border-green-200 text-green-800 rounded-xl p-8 text-center shadow-sm">
        <span className="text-4xl mb-4 block">🎉</span>
        <h2 className="text-2xl font-bold mb-2">¡Sugerencia recibida!</h2>
        <p className="text-lg">{state.message}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-6 px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
        >
          Sugerir otro juego
        </button>
      </div>
    )
  }

  return (
    <form action={formAction} className="bg-white border border-[var(--color-border)] rounded-2xl p-6 sm:p-8 shadow-sm text-left">
      {state.message && !state.success && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">
          {state.message}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: "var(--color-brand-blue)" }}>Tu Nombre *</label>
          <input type="text" name="submitter_name" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--color-brand-blue)] focus:outline-none" placeholder="Juan Pérez" />
          {state?.errors?.submitter_name && <p className="text-red-500 text-xs mt-1">{state.errors.submitter_name[0]}</p>}
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: "var(--color-brand-blue)" }}>Tu Email *</label>
          <input type="email" name="submitter_email" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--color-brand-blue)] focus:outline-none" placeholder="juan@correo.cl" />
          {state?.errors?.submitter_email && <p className="text-red-500 text-xs mt-1">{state.errors.submitter_email[0]}</p>}
        </div>
      </div>

      <hr className="my-8 border-[var(--color-border)]" />

      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: "var(--color-brand-blue)" }}>Nombre del Juego *</label>
          <input type="text" name="title" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--color-brand-blue)] focus:outline-none" placeholder="El Asalto al Rey Marmota" />
          {state?.errors?.title && <p className="text-red-500 text-xs mt-1">{state.errors.title[0]}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "var(--color-text-secondary)" }}>Año de publicación</label>
            <input type="number" name="year" min="1900" max="2100" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--color-brand-blue)] focus:outline-none" placeholder="Ej: 2024" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "var(--color-text-secondary)" }}>Link BGG (opcional)</label>
            <input type="url" name="bgg_url" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--color-brand-blue)] focus:outline-none" placeholder="https://boardgamegeek.com/..." />
            {state?.errors?.bgg_url && <p className="text-red-500 text-xs mt-1">{state.errors.bgg_url[0]}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "var(--color-text-secondary)" }}>Autor/a (opcional)</label>
            <input type="text" name="author_name" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--color-brand-blue)] focus:outline-none" placeholder="Ej: Víctor Reyes" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "var(--color-text-secondary)" }}>Editorial (opcional)</label>
            <input type="text" name="publisher_name" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--color-brand-blue)] focus:outline-none" placeholder="Ej: Fractal Juegos" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: "var(--color-text-secondary)" }}>Notas adicionales</label>
          <textarea name="notes" rows={3} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--color-brand-blue)] focus:outline-none" placeholder="Algún dato curioso, mecánicas principales, o dónde conseguirlo..."></textarea>
        </div>
      </div>

      <button 
        type="submit" 
        disabled={isPending}
        className="mt-8 w-full py-4 rounded-xl text-white font-bold text-lg transition-all hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
        style={{ background: "var(--color-brand-red)" }}
      >
        {isPending ? "Enviando sugerencia..." : "Enviar Juego para Revisión"}
      </button>
    </form>
  )
}
