import type { Metadata } from "next";
import { AdminSectionHeader } from "@/components/admin/AdminSectionHeader";
import { createPublisher } from "../actions";

export const metadata: Metadata = { title: "Nueva editorial | Admin" };

export default function NewPublisherPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <AdminSectionHeader
        eyebrow="Editorial"
        title="Nueva editorial"
        description="Crea un registro editorial base para asociarlo luego a juegos y ediciones."
      />
      <form action={createPublisher} className="space-y-6 rounded-md border border-[var(--color-border)] bg-white p-5">
        <div className="grid gap-4 md:grid-cols-[1fr_0.8fr]">
          <Field label="Nombre"><input name="name" required className={inputClass} /></Field>
          <Field label="Slug"><input name="slug" placeholder="Se genera si queda vacío" className={inputClass} /></Field>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="País"><input name="country" defaultValue="Chile" className={inputClass} /></Field>
          <Field label="Ciudad"><input name="city" className={inputClass} /></Field>
          <Field label="Estado"><select name="status" defaultValue="unknown" className={inputClass}><option value="active">Activa</option><option value="inactive">Inactiva</option><option value="unknown">Desconocido</option></select></Field>
        </div>
        <input type="hidden" name="nickname" value="" />
        <input type="hidden" name="website" value="" />
        <input type="hidden" name="founded_year" value="" />
        <input type="hidden" name="closed_year" value="" />
        <input type="hidden" name="former_name" value="" />
        <input type="hidden" name="historical_notes" value="" />
        <input type="hidden" name="internal_notes" value="" />
        <Field label="Publicación"><select name="content_status" defaultValue="draft" className={inputClass}><option value="draft">Borrador</option><option value="published">Publicado</option><option value="archived">Archivado</option></select></Field>
        <label className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text-secondary)]"><input name="was_contacted" type="checkbox" /> Contactada por el equipo</label>
        <button className="admin-button-primary px-4 py-2.5 text-sm">Crear editorial</button>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1 block text-xs font-bold uppercase tracking-wide text-[var(--color-text-muted)]">{label}</span>{children}</label>;
}

const inputClass = "w-full rounded-md border border-[var(--color-border)] bg-[var(--color-cream)] px-3 py-2 text-sm outline-none focus:border-[var(--color-brand-blue)] focus:ring-2 focus:ring-[var(--color-brand-blue-pale)]";
