import type { Metadata } from "next";
import { AdminSectionHeader } from "@/components/admin/AdminSectionHeader";
import { createPerson } from "../actions";

export const metadata: Metadata = { title: "Nueva persona | Admin" };

export default function NewPersonPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <AdminSectionHeader
        eyebrow="Créditos"
        title="Nueva persona"
        description="Crea una ficha base de autor, diseñador, ilustrador u otro colaborador."
      />
      <form action={createPerson} className="space-y-6 rounded-md border border-[var(--color-border)] bg-white p-5">
        <div className="grid gap-4 md:grid-cols-[1fr_0.8fr]">
          <Field label="Nombre público"><input name="display_name" required className={inputClass} /></Field>
          <Field label="Slug"><input name="slug" placeholder="Se genera si queda vacío" className={inputClass} /></Field>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Nombre"><input name="first_name" className={inputClass} /></Field>
          <Field label="Apellido"><input name="last_name" className={inputClass} /></Field>
          <Field label="Nacionalidad"><input name="nationality" defaultValue="Chile" className={inputClass} /></Field>
        </div>
        <input type="hidden" name="nickname" value="" />
        <input type="hidden" name="gender" value="" />
        <input type="hidden" name="field_of_study" value="" />
        <input type="hidden" name="birth_year" value="" />
        <input type="hidden" name="death_year" value="" />
        <Field label="Publicación"><select name="content_status" defaultValue="draft" className={inputClass}><option value="draft">Borrador</option><option value="published">Publicado</option><option value="archived">Archivado</option></select></Field>
        <Field label="Biografía"><textarea name="biography" rows={6} className={textareaClass} /></Field>
        <label className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text-secondary)]"><input name="is_deceased" type="checkbox" /> Persona fallecida</label>
        <button className="admin-button-primary px-4 py-2.5 text-sm">Crear persona</button>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1 block text-xs font-bold uppercase tracking-wide text-[var(--color-text-muted)]">{label}</span>{children}</label>;
}

const inputClass = "w-full rounded-md border border-[var(--color-border)] bg-[var(--color-cream)] px-3 py-2 text-sm outline-none focus:border-[var(--color-brand-blue)] focus:ring-2 focus:ring-[var(--color-brand-blue-pale)]";
const textareaClass = "w-full rounded-md border border-[var(--color-border)] bg-[var(--color-cream)] px-3 py-2 text-sm leading-6 outline-none focus:border-[var(--color-brand-blue)] focus:ring-2 focus:ring-[var(--color-brand-blue-pale)]";
