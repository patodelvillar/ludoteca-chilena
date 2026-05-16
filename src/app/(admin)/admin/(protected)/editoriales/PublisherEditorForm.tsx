"use client";

import { useActionState } from "react";
import type { ContentStatus, PublisherStatus } from "@prisma/client";
import { updatePublisher, uploadPublisherLogo, type PublisherActionState } from "./actions";

const initialState: PublisherActionState = { success: false, message: "" };

interface PublisherEditorFormProps {
  publisher: {
    id: string;
    name: string;
    slug: string;
    nickname: string | null;
    country: string | null;
    city: string | null;
    website: string | null;
    founded_year: number | null;
    closed_year: number | null;
    status: PublisherStatus;
    content_status: ContentStatus;
    former_name: string | null;
    historical_notes: string | null;
    internal_notes: string | null;
    was_contacted: boolean | null;
    media: {
      id: string;
      url: string;
      alt_text: string | null;
      is_primary: boolean;
    }[];
  };
}

export function PublisherEditorForm({ publisher }: PublisherEditorFormProps) {
  const [state, formAction, isPending] = useActionState(updatePublisher, initialState);
  const [logoState, logoAction, isUploadingLogo] = useActionState(uploadPublisherLogo, initialState);
  const primaryLogo = publisher.media.find((item) => item.is_primary)?.url || publisher.media[0]?.url;

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <form action={formAction} className="space-y-6 rounded-md border border-[var(--color-border)] bg-white p-5">
        <input type="hidden" name="id" value={publisher.id} />

      <div className="grid gap-4 md:grid-cols-[1fr_0.8fr]">
        <Field label="Nombre" error={state.errors?.name?.[0]}>
          <input name="name" required defaultValue={publisher.name} className={inputClass} />
        </Field>
        <Field label="Slug">
          <input name="slug" defaultValue={publisher.slug} className={inputClass} />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Nickname">
          <input name="nickname" defaultValue={publisher.nickname || ""} className={inputClass} />
        </Field>
        <Field label="País">
          <input name="country" defaultValue={publisher.country || ""} className={inputClass} />
        </Field>
        <Field label="Ciudad">
          <input name="city" defaultValue={publisher.city || ""} className={inputClass} />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Field label="Fundación">
          <input name="founded_year" type="number" defaultValue={publisher.founded_year ?? ""} className={inputClass} />
        </Field>
        <Field label="Cierre">
          <input name="closed_year" type="number" defaultValue={publisher.closed_year ?? ""} className={inputClass} />
        </Field>
        <Field label="Estado">
          <select name="status" defaultValue={publisher.status} className={inputClass}>
            <option value="active">Activa</option>
            <option value="inactive">Inactiva</option>
            <option value="unknown">Desconocido</option>
          </select>
        </Field>
        <Field label="Publicación">
          <select name="content_status" defaultValue={publisher.content_status} className={inputClass}>
            <option value="draft">Borrador</option>
            <option value="published">Publicado</option>
            <option value="archived">Archivado</option>
          </select>
        </Field>
      </div>

      <Field label="Sitio web" error={state.errors?.website?.[0]}>
        <input name="website" type="url" defaultValue={publisher.website || ""} className={inputClass} />
      </Field>

      <Field label="Nombre anterior">
        <input name="former_name" defaultValue={publisher.former_name || ""} className={inputClass} />
      </Field>

      <Field label="Notas históricas">
        <textarea name="historical_notes" rows={6} defaultValue={publisher.historical_notes || ""} className={textareaClass} />
      </Field>

      <Field label="Notas internas">
        <textarea name="internal_notes" rows={4} defaultValue={publisher.internal_notes || ""} className={textareaClass} />
      </Field>

      <label className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text-secondary)]">
        <input name="was_contacted" type="checkbox" defaultChecked={Boolean(publisher.was_contacted)} />
        Contactada por el equipo
      </label>

        <div className="flex items-center gap-3">
          <button disabled={isPending} className="admin-button-primary px-4 py-2.5 text-sm disabled:opacity-60">
            {isPending ? "Guardando..." : "Guardar editorial"}
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
            Logo principal
          </h3>
          <div className="mb-4 overflow-hidden rounded-md border border-[var(--color-border)] bg-[var(--color-brand-blue-pale)]">
            {primaryLogo ? (
              <img src={primaryLogo} alt={`Logo de ${publisher.name}`} className="aspect-square h-auto w-full object-contain bg-white p-4" />
            ) : (
              <div className="flex aspect-square items-center justify-center text-sm text-[var(--color-brand-blue-light)]">
                Sin logo
              </div>
            )}
          </div>
          <form action={logoAction} className="space-y-3">
            <input type="hidden" name="publisherId" value={publisher.id} />
            <Field label="Archivo">
              <input name="logo" type="file" accept="image/*" required className="w-full text-xs" />
            </Field>
            <Field label="Alt text">
              <input name="altText" defaultValue={`Logo de ${publisher.name}`} className={inputClass} />
            </Field>
            <Field label="Fuente">
              <input name="sourceDescription" placeholder="Sitio oficial, archivo propio, prensa..." className={inputClass} />
            </Field>
            <button disabled={isUploadingLogo} className="admin-button-danger w-full px-4 py-2.5 text-sm disabled:opacity-60">
              {isUploadingLogo ? "Subiendo..." : "Subir logo"}
            </button>
            {logoState.message && (
              <p className={`text-xs font-bold ${logoState.success ? "text-[var(--color-brand-blue)]" : "text-[var(--color-brand-red)]"}`}>
                {logoState.message}
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
