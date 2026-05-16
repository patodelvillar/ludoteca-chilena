import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { AdminSectionHeader } from "@/components/admin/AdminSectionHeader";
import { SuggestionModerationForm } from "./SuggestionModerationForm";

export const metadata: Metadata = {
  title: "Sugerencias | Admin",
};

export default async function AdminSuggestionsPage() {
  const suggestions = await prisma.gameSuggestion.findMany({
    orderBy: [{ is_reviewed: "asc" }, { created_at: "desc" }],
    take: 100,
  });

  const pendingCount = suggestions.filter((item) => !item.is_reviewed).length;

  return (
    <div className="mx-auto max-w-7xl">
      <AdminSectionHeader
        eyebrow="Bandeja pública"
        title="Sugerencias de juegos"
        description="Revisión de juegos enviados por la comunidad. Al aprobar, se crea una ficha de juego en borrador para completar desde el catálogo."
      />

      <div className="mb-4 flex items-center gap-3 text-sm text-[var(--color-text-muted)]">
        <span className="rounded-full bg-[var(--color-brand-blue-pale)] px-2.5 py-1 font-bold text-[var(--color-brand-blue)]">
          {pendingCount} pendientes
        </span>
        <span>{suggestions.length} sugerencias cargadas</span>
      </div>

      <section className="overflow-hidden rounded-md border border-[var(--color-border)] bg-white">
        <div className="grid grid-cols-[1.2fr_0.75fr_0.7fr_1.1fr] gap-4 border-b border-[var(--color-border)] bg-[var(--color-cream)] px-4 py-3 text-xs font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
          <span>Juego</span>
          <span>Persona</span>
          <span>Editorial / año</span>
          <span>Revisión</span>
        </div>
        <div className="divide-y divide-[var(--color-border)]">
          {suggestions.length > 0 ? (
            suggestions.map((suggestion) => (
              <article
                key={suggestion.id}
                className="grid grid-cols-1 gap-4 px-4 py-4 text-sm md:grid-cols-[1.2fr_0.75fr_0.7fr_1.1fr]"
              >
                <div>
                  <p className="font-semibold text-[var(--color-text)]">
                    {suggestion.title}
                  </p>
                  {suggestion.notes && (
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--color-text-muted)]">
                      {suggestion.notes}
                    </p>
                  )}
                </div>
                <div className="text-[var(--color-text-secondary)]">
                  <p>{suggestion.submitter_name || "Sin nombre"}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {suggestion.submitter_email || "Sin email"}
                  </p>
                </div>
                <div className="text-[var(--color-text-secondary)]">
                  <p>{suggestion.publisher_name || "Editorial desconocida"}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {suggestion.year || "Año desconocido"}
                  </p>
                </div>
                <div>
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span
                      className="inline-flex rounded-full px-2.5 py-1 text-xs font-bold"
                      style={{
                        background: suggestion.is_reviewed
                          ? "var(--color-brand-blue-pale)"
                          : "#fff0f0",
                        color: suggestion.is_reviewed
                          ? "var(--color-brand-blue)"
                          : "var(--color-brand-red-dark)",
                      }}
                    >
                      {suggestion.is_reviewed ? "Revisada" : "Pendiente"}
                    </span>
                    {suggestion.is_approved && (
                      <span className="inline-flex rounded-full bg-green-50 px-2.5 py-1 text-xs font-bold text-green-700">
                        Aprobada
                      </span>
                    )}
                  </div>
                  <SuggestionModerationForm
                    suggestionId={suggestion.id}
                    disabled={suggestion.is_reviewed}
                    reviewerNotes={suggestion.reviewer_notes}
                  />
                </div>
              </article>
            ))
          ) : (
            <p className="px-4 py-10 text-sm text-[var(--color-text-muted)]">
              No hay sugerencias registradas.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
