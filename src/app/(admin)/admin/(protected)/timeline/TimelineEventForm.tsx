"use client";

import { useActionState } from "react";
import type { ContentStatus } from "@prisma/client";
import {
  createTimelineEvent,
  updateTimelineEvent,
  type TimelineActionState,
} from "./actions";

const initialState: TimelineActionState = {
  success: false,
  message: "",
};

interface TimelineEventFormProps {
  mode: "create" | "edit";
  event?: {
    id: string;
    title: string;
    year: number | null;
    year_display: string | null;
    description: string | null;
    content_status: ContentStatus;
  };
}

export function TimelineEventForm({ mode, event }: TimelineEventFormProps) {
  const action = mode === "create" ? createTimelineEvent : updateTimelineEvent;
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-4">
      {event?.id && <input type="hidden" name="id" value={event.id} />}

      <div className="grid gap-3 md:grid-cols-[1fr_120px_160px_140px]">
        <label className="block">
          <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
            Título
          </span>
          <input
            name="title"
            required
            defaultValue={event?.title || ""}
            className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-cream)] px-3 py-2 text-sm outline-none focus:border-[var(--color-brand-blue)] focus:ring-2 focus:ring-[var(--color-brand-blue-pale)]"
          />
          {state.errors?.title && (
            <p className="mt-1 text-xs text-red-600">{state.errors.title[0]}</p>
          )}
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
            Año
          </span>
          <input
            name="year"
            type="number"
            defaultValue={event?.year ?? ""}
            className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-cream)] px-3 py-2 text-sm outline-none focus:border-[var(--color-brand-blue)] focus:ring-2 focus:ring-[var(--color-brand-blue-pale)]"
          />
          {state.errors?.year && (
            <p className="mt-1 text-xs text-red-600">{state.errors.year[0]}</p>
          )}
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
            Fecha visible
          </span>
          <input
            name="year_display"
            defaultValue={event?.year_display || ""}
            placeholder="circa 1985"
            className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-cream)] px-3 py-2 text-sm outline-none focus:border-[var(--color-brand-blue)] focus:ring-2 focus:ring-[var(--color-brand-blue-pale)]"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
            Estado
          </span>
          <select
            name="content_status"
            defaultValue={event?.content_status || "draft"}
            className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-cream)] px-3 py-2 text-sm outline-none focus:border-[var(--color-brand-blue)] focus:ring-2 focus:ring-[var(--color-brand-blue-pale)]"
          >
            <option value="draft">Borrador</option>
            <option value="published">Publicado</option>
            <option value="archived">Archivado</option>
          </select>
        </label>
      </div>

      <label className="block">
        <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
          Descripción
        </span>
        <textarea
          name="description"
          rows={mode === "create" ? 4 : 3}
          defaultValue={event?.description || ""}
          className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-cream)] px-3 py-2 text-sm leading-6 outline-none focus:border-[var(--color-brand-blue)] focus:ring-2 focus:ring-[var(--color-brand-blue-pale)]"
        />
        {state.errors?.description && (
          <p className="mt-1 text-xs text-red-600">{state.errors.description[0]}</p>
        )}
      </label>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="admin-button-primary px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending
            ? "Guardando..."
            : mode === "create"
            ? "Crear hito"
            : "Guardar cambios"}
        </button>
        {state.message && (
          <p
            className="text-xs font-semibold"
            style={{
              color: state.success
                ? "var(--color-brand-blue)"
                : "var(--color-brand-red)",
            }}
          >
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}
