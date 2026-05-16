"use client";

import { useActionState } from "react";
import type { ContentStatus } from "@prisma/client";
import { updatePerson, uploadPersonPhoto, type PersonActionState } from "./actions";

const initialState: PersonActionState = { success: false, message: "" };

interface PersonEditorFormProps {
  person: {
    id: string;
    display_name: string;
    slug: string;
    first_name: string | null;
    last_name: string | null;
    nickname: string | null;
    nationality: string | null;
    gender: string | null;
    field_of_study: string | null;
    birth_year: number | null;
    death_year: number | null;
    is_deceased: boolean;
    biography: string | null;
    photo_url: string | null;
    content_status: ContentStatus;
    media: {
      id: string;
      url: string;
      alt_text: string | null;
      is_primary: boolean;
    }[];
  };
}

export function PersonEditorForm({ person }: PersonEditorFormProps) {
  const [state, formAction, isPending] = useActionState(updatePerson, initialState);
  const [photoState, photoAction, isUploadingPhoto] = useActionState(uploadPersonPhoto, initialState);
  const primaryPhoto = person.media.find((item) => item.is_primary)?.url || person.photo_url || person.media[0]?.url;

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <form action={formAction} className="space-y-6 rounded-md border border-[var(--color-border)] bg-white p-5">
        <input type="hidden" name="id" value={person.id} />

        <div className="grid gap-4 md:grid-cols-[1fr_0.8fr]">
          <Field label="Nombre público" error={state.errors?.display_name?.[0]}>
            <input name="display_name" required defaultValue={person.display_name} className={inputClass} />
          </Field>
          <Field label="Slug">
            <input name="slug" defaultValue={person.slug} className={inputClass} />
          </Field>
        </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Nombre">
          <input name="first_name" defaultValue={person.first_name || ""} className={inputClass} />
        </Field>
        <Field label="Apellido">
          <input name="last_name" defaultValue={person.last_name || ""} className={inputClass} />
        </Field>
        <Field label="Apodo">
          <input name="nickname" defaultValue={person.nickname || ""} className={inputClass} />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Field label="Nacionalidad">
          <input name="nationality" defaultValue={person.nationality || ""} className={inputClass} />
        </Field>
        <Field label="Género">
          <input name="gender" defaultValue={person.gender || ""} className={inputClass} />
        </Field>
        <Field label="Nacimiento">
          <input name="birth_year" type="number" defaultValue={person.birth_year ?? ""} className={inputClass} />
        </Field>
        <Field label="Fallecimiento">
          <input name="death_year" type="number" defaultValue={person.death_year ?? ""} className={inputClass} />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_180px]">
        <Field label="Área de estudio">
          <input name="field_of_study" defaultValue={person.field_of_study || ""} className={inputClass} />
        </Field>
        <Field label="Publicación">
          <select name="content_status" defaultValue={person.content_status} className={inputClass}>
            <option value="draft">Borrador</option>
            <option value="published">Publicado</option>
            <option value="archived">Archivado</option>
          </select>
        </Field>
      </div>

      <Field label="Biografía">
        <textarea name="biography" rows={8} defaultValue={person.biography || ""} className={textareaClass} />
      </Field>

      <label className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text-secondary)]">
        <input name="is_deceased" type="checkbox" defaultChecked={person.is_deceased} />
        Persona fallecida
      </label>

        <div className="flex items-center gap-3">
          <button disabled={isPending} className="admin-button-primary px-4 py-2.5 text-sm disabled:opacity-60">
            {isPending ? "Guardando..." : "Guardar persona"}
          </button>
          {state.message && (
            <p className={`text-xs font-bold ${state.success ? "text-[var(--color-brand-blue)]" : "text-[var(--color-brand-red)]"}`}>
              {state.message}
            </p>
          )}
        </div>
      </form>

      <aside className="space-y-4">
        <section className="rounded-md border border-[var(--color-border)] bg-white p-5">
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
            Foto principal
          </h3>
          <div className="mb-4 overflow-hidden rounded-md border border-[var(--color-border)] bg-[var(--color-brand-blue-pale)]">
            {primaryPhoto ? (
              <img src={primaryPhoto} alt={person.display_name} className="aspect-square h-auto w-full object-cover" />
            ) : (
              <div className="flex aspect-square items-center justify-center text-sm text-[var(--color-brand-blue-light)]">
                Sin foto
              </div>
            )}
          </div>
          <form action={photoAction} className="space-y-3">
            <input type="hidden" name="personId" value={person.id} />
            <Field label="Archivo">
              <input name="photo" type="file" accept="image/*" required className="w-full text-xs" />
            </Field>
            <Field label="Alt text">
              <input name="altText" defaultValue={person.display_name} className={inputClass} />
            </Field>
            <Field label="Fuente">
              <input name="sourceDescription" placeholder="Archivo propio, prensa, autor..." className={inputClass} />
            </Field>
            <button disabled={isUploadingPhoto} className="admin-button-danger w-full px-4 py-2.5 text-sm disabled:opacity-60">
              {isUploadingPhoto ? "Subiendo..." : "Subir foto"}
            </button>
            {photoState.message && (
              <p className={`text-xs font-bold ${photoState.success ? "text-[var(--color-brand-blue)]" : "text-[var(--color-brand-red)]"}`}>
                {photoState.message}
              </p>
            )}
          </form>
        </section>
      </aside>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-[var(--color-text-muted)]">{label}</span>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </label>
  );
}

const inputClass = "w-full rounded-md border border-[var(--color-border)] bg-[var(--color-cream)] px-3 py-2 text-sm outline-none focus:border-[var(--color-brand-blue)] focus:ring-2 focus:ring-[var(--color-brand-blue-pale)]";
const textareaClass = "w-full rounded-md border border-[var(--color-border)] bg-[var(--color-cream)] px-3 py-2 text-sm leading-6 outline-none focus:border-[var(--color-brand-blue)] focus:ring-2 focus:ring-[var(--color-brand-blue-pale)]";
