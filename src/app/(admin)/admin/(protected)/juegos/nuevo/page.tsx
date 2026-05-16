import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { AdminSectionHeader } from "@/components/admin/AdminSectionHeader";
import { createGame } from "../actions";

export const metadata: Metadata = {
  title: "Nuevo juego | Admin",
};

export default async function NewGamePage() {
  const publishers = await prisma.publisher.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="mx-auto max-w-5xl">
      <AdminSectionHeader
        eyebrow="Catálogo"
        title="Nuevo juego"
        description="Crea una ficha base en borrador. Luego podrás completar relaciones, imágenes y fuentes desde la edición."
      />

      <form action={createGame} className="space-y-6 rounded-md border border-[var(--color-border)] bg-white p-5">
        <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
          <Field label="Título">
            <input name="title" required className={inputClass} />
          </Field>
          <Field label="Slug">
            <input name="slug" placeholder="Se genera si queda vacío" className={inputClass} />
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Field label="Año">
            <input name="year_published" type="number" className={inputClass} />
          </Field>
          <Field label="Certeza">
            <select name="year_certainty" defaultValue="exact" className={inputClass}>
              <option value="exact">Exacto</option>
              <option value="circa">Circa</option>
              <option value="decade">Década</option>
              <option value="unknown">Desconocido</option>
            </select>
          </Field>
          <Field label="Estado público">
            <select name="content_status" defaultValue="draft" className={inputClass}>
              <option value="draft">Borrador</option>
              <option value="published">Publicado</option>
              <option value="archived">Archivado</option>
            </select>
          </Field>
          <Field label="Disponibilidad">
            <select name="status" defaultValue="unknown" className={inputClass}>
              <option value="available">Disponible</option>
              <option value="out_of_print">Agotado</option>
              <option value="lost">Perdido</option>
              <option value="unknown">Desconocido</option>
            </select>
          </Field>
        </div>

        <input type="hidden" name="year_display" value="" />
        <input type="hidden" name="min_players" value="" />
        <input type="hidden" name="max_players" value="" />
        <input type="hidden" name="min_playtime" value="" />
        <input type="hidden" name="max_playtime" value="" />
        <input type="hidden" name="min_age" value="" />
        <input type="hidden" name="historical_context" value="" />
        <input type="hidden" name="origin_type" value="" />
        <input type="hidden" name="origin_country" value="" />

        <div className="grid gap-4 md:grid-cols-[1fr_220px]">
          <Field label="Editorial">
            <select name="publisher_id" defaultValue="" className={inputClass}>
              <option value="">Sin editorial</option>
              {publishers.map((publisher) => (
                <option key={publisher.id} value={publisher.id}>
                  {publisher.name}
                </option>
              ))}
            </select>
          </Field>
          <div className="flex items-end gap-4 pb-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text-secondary)]">
              <input name="is_self_published" type="checkbox" />
              Autopublicado
            </label>
            <label className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text-secondary)]">
              <input name="is_verified" type="checkbox" />
              Verificado
            </label>
          </div>
        </div>

        <Field label="BoardGameGeek URL">
          <input name="bgg_url" type="url" className={inputClass} />
        </Field>

        <Field label="Descripción">
          <textarea name="description" rows={6} className={textareaClass} />
        </Field>

        <button className="admin-button-primary px-4 py-2.5 text-sm">
          Crear ficha
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
        {label}
      </span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-md border border-[var(--color-border)] bg-[var(--color-cream)] px-3 py-2 text-sm outline-none focus:border-[var(--color-brand-blue)] focus:ring-2 focus:ring-[var(--color-brand-blue-pale)]";

const textareaClass =
  "w-full rounded-md border border-[var(--color-border)] bg-[var(--color-cream)] px-3 py-2 text-sm leading-6 outline-none focus:border-[var(--color-brand-blue)] focus:ring-2 focus:ring-[var(--color-brand-blue-pale)]";
