"use client";

import { useActionState } from "react";
import type { VideoPlatform } from "@prisma/client";
import { createGameVideo, deleteGameVideo, type GameActionState } from "./actions";

const initialState: GameActionState = { success: false, message: "" };

interface GameVideoManagerProps {
  gameId: string;
  videos: {
    id: string;
    url: string;
    platform: VideoPlatform;
    video_id: string | null;
    title: string | null;
    description: string | null;
  }[];
}

export function GameVideoManager({ gameId, videos }: GameVideoManagerProps) {
  const [state, formAction, isPending] = useActionState(createGameVideo, initialState);

  return (
    <section className="mt-6 rounded-md border border-[var(--color-border)] bg-white p-5">
      <div className="mb-4">
        <h3
          className="text-lg font-bold text-[var(--color-brand-blue)]"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Videos
        </h3>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          Pega URLs de YouTube, Vimeo, TikTok o Instagram. La plataforma se detecta automáticamente.
        </p>
      </div>

      <form action={formAction} className="mb-5 grid gap-3 lg:grid-cols-[1fr_220px]">
        <input type="hidden" name="gameId" value={gameId} />
        <label className="block">
          <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-[var(--color-text-muted)]">URL</span>
          <input name="url" type="url" required className={inputClass} />
          {state.errors?.url && <p className="mt-1 text-xs text-red-600">{state.errors.url[0]}</p>}
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-[var(--color-text-muted)]">Título</span>
          <input name="title" className={inputClass} />
        </label>
        <label className="block lg:col-span-2">
          <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-[var(--color-text-muted)]">Descripción</span>
          <textarea name="description" rows={2} className={textareaClass} />
        </label>
        <div className="flex items-center gap-3 lg:col-span-2">
          <button disabled={isPending} className="admin-button-primary px-4 py-2.5 text-sm disabled:opacity-60">
            {isPending ? "Agregando..." : "Agregar video"}
          </button>
          {state.message && <p className={`text-xs font-bold ${state.success ? "text-[var(--color-brand-blue)]" : "text-[var(--color-brand-red)]"}`}>{state.message}</p>}
        </div>
      </form>

      <div className="divide-y divide-[var(--color-border)] rounded-md border border-[var(--color-border)]">
        {videos.length > 0 ? (
          videos.map((video) => (
            <article key={video.id} className="flex flex-col gap-3 px-4 py-3 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="font-semibold text-[var(--color-brand-blue)]">{video.title || video.url}</p>
                <p className="mt-1 text-xs text-[var(--color-text-muted)]">{video.platform}{video.video_id ? ` · ${video.video_id}` : ""}</p>
                {video.description && <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{video.description}</p>}
              </div>
              <form action={deleteGameVideo}>
                <input type="hidden" name="id" value={video.id} />
                <input type="hidden" name="gameId" value={gameId} />
                <button className="rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 transition hover:bg-red-100">
                  Eliminar
                </button>
              </form>
            </article>
          ))
        ) : (
          <p className="px-4 py-6 text-sm text-[var(--color-text-muted)]">No hay videos vinculados.</p>
        )}
      </div>
    </section>
  );
}

const inputClass = "w-full rounded-md border border-[var(--color-border)] bg-[var(--color-cream)] px-3 py-2 text-sm outline-none focus:border-[var(--color-brand-blue)] focus:ring-2 focus:ring-[var(--color-brand-blue-pale)]";
const textareaClass = "w-full rounded-md border border-[var(--color-border)] bg-[var(--color-cream)] px-3 py-2 text-sm leading-6 outline-none focus:border-[var(--color-brand-blue)] focus:ring-2 focus:ring-[var(--color-brand-blue-pale)]";
