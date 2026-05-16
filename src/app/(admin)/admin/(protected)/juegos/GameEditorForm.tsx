"use client";

import { useActionState } from "react";
import type {
  ContentStatus,
  GameStatus,
  MediaType,
  OriginType,
  Publisher,
  YearCertainty,
} from "@prisma/client";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { deleteGameMedia, updateGame, uploadGameCover, uploadGameGalleryImage, type GameActionState } from "./actions";

const initialState: GameActionState = {
  success: false,
  message: "",
};

type PublisherOption = Pick<Publisher, "id" | "name">;

interface GameEditorFormProps {
  game: {
    id: string;
    title: string;
    slug: string;
    year_published: number | null;
    year_certainty: YearCertainty;
    year_display: string | null;
    min_players: number | null;
    max_players: number | null;
    min_playtime: number | null;
    max_playtime: number | null;
    min_age: number | null;
    description: string | null;
    historical_context: string | null;
    bgg_url: string | null;
    content_status: ContentStatus;
    status: GameStatus;
    origin_type: OriginType | null;
    origin_country: string | null;
    publisher_id: string | null;
    is_self_published: boolean;
    is_verified: boolean;
    media: {
      id: string;
      url: string;
      type: MediaType;
      filename: string | null;
      alt_text: string | null;
      source_description: string | null;
      circa_year: string | null;
      is_primary: boolean;
    }[];
  };
  publishers: PublisherOption[];
}

export function GameEditorForm({ game, publishers }: GameEditorFormProps) {
  const [state, formAction, isPending] = useActionState(updateGame, initialState);
  const [uploadState, uploadAction, isUploading] = useActionState(
    uploadGameCover,
    initialState,
  );
  const [galleryState, galleryAction, isUploadingGallery] = useActionState(
    uploadGameGalleryImage,
    initialState,
  );
  const primaryCover = game.media.find((item) => item.is_primary) || game.media[0];
  const galleryImages = game.media.filter((item) => !item.is_primary);

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <form action={formAction} className="space-y-6 rounded-md border border-[var(--color-border)] bg-white p-5">
        <input type="hidden" name="id" value={game.id} />

        <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
          <Field label="Título" error={state.errors?.title?.[0]}>
            <input name="title" required defaultValue={game.title} className={inputClass} />
          </Field>
          <Field label="Slug" error={state.errors?.slug?.[0]}>
            <input name="slug" defaultValue={game.slug} className={inputClass} />
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Field label="Año" error={state.errors?.year_published?.[0]}>
            <input name="year_published" type="number" defaultValue={game.year_published ?? ""} className={inputClass} />
          </Field>
          <Field label="Certeza">
            <select name="year_certainty" defaultValue={game.year_certainty} className={inputClass}>
              <option value="exact">Exacto</option>
              <option value="circa">Circa</option>
              <option value="decade">Década</option>
              <option value="unknown">Desconocido</option>
            </select>
          </Field>
          <Field label="Fecha visible">
            <input name="year_display" defaultValue={game.year_display || ""} placeholder="Años 80" className={inputClass} />
          </Field>
          <Field label="Estado público">
            <select name="content_status" defaultValue={game.content_status} className={inputClass}>
              <option value="draft">Borrador</option>
              <option value="published">Publicado</option>
              <option value="archived">Archivado</option>
            </select>
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Field label="Jugadores mín.">
            <input name="min_players" type="number" defaultValue={game.min_players ?? ""} className={inputClass} />
          </Field>
          <Field label="Jugadores máx.">
            <input name="max_players" type="number" defaultValue={game.max_players ?? ""} className={inputClass} />
          </Field>
          <Field label="Tiempo mín.">
            <input name="min_playtime" type="number" defaultValue={game.min_playtime ?? ""} className={inputClass} />
          </Field>
          <Field label="Tiempo máx.">
            <input name="max_playtime" type="number" defaultValue={game.max_playtime ?? ""} className={inputClass} />
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Field label="Edad mín.">
            <input name="min_age" type="number" defaultValue={game.min_age ?? ""} className={inputClass} />
          </Field>
          <Field label="Disponibilidad">
            <select name="status" defaultValue={game.status} className={inputClass}>
              <option value="available">Disponible</option>
              <option value="out_of_print">Agotado</option>
              <option value="lost">Perdido</option>
              <option value="unknown">Desconocido</option>
            </select>
          </Field>
          <Field label="Origen">
            <select name="origin_type" defaultValue={game.origin_type || ""} className={inputClass}>
              <option value="">Sin dato</option>
              <option value="original">Original</option>
              <option value="localization">Localización</option>
              <option value="adaptation">Adaptación</option>
            </select>
          </Field>
          <Field label="País">
            <input name="origin_country" defaultValue={game.origin_country || ""} className={inputClass} />
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-[1fr_220px]">
          <Field label="Editorial">
            <select name="publisher_id" defaultValue={game.publisher_id || ""} className={inputClass}>
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
              <input name="is_self_published" type="checkbox" defaultChecked={game.is_self_published} />
              Autopublicado
            </label>
            <label className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text-secondary)]">
              <input name="is_verified" type="checkbox" defaultChecked={game.is_verified} />
              Verificado
            </label>
          </div>
        </div>

        <Field label="BoardGameGeek URL" error={state.errors?.bgg_url?.[0]}>
          <input name="bgg_url" type="url" defaultValue={game.bgg_url || ""} className={inputClass} />
        </Field>

        <Field label="Descripción">
          <RichTextEditor
            name="description"
            initialContent={game.description}
            placeholder="Describe el juego, sus componentes, contexto de publicación o rasgos distintivos..."
          />
        </Field>

        <Field label="Contexto histórico">
          <textarea name="historical_context" rows={5} defaultValue={game.historical_context || ""} className={textareaClass} />
        </Field>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isPending}
            className="admin-button-primary px-4 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Guardando..." : "Guardar ficha"}
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
            Portada primaria
          </h3>
          <div className="mb-4 overflow-hidden rounded-md border border-[var(--color-border)] bg-[var(--color-brand-blue-pale)]">
            {primaryCover ? (
              <img src={primaryCover.url} alt={primaryCover.alt_text || game.title} className="h-auto w-full" />
            ) : (
              <div className="flex aspect-square items-center justify-center text-sm text-[var(--color-brand-blue-light)]">
                Sin portada
              </div>
            )}
          </div>
          <form action={uploadAction} className="space-y-3">
            <input type="hidden" name="gameId" value={game.id} />
            <Field label="Archivo">
              <input name="cover" type="file" accept="image/*" required className="w-full text-xs" />
            </Field>
            <Field label="Alt text">
              <input name="altText" defaultValue={primaryCover?.alt_text || `Portada de ${game.title}`} className={inputClass} />
            </Field>
            <Field label="Fuente">
              <input name="sourceDescription" placeholder="Archivo propio, BGG, editorial..." className={inputClass} />
            </Field>
            <button
              type="submit"
              disabled={isUploading}
              className="admin-button-danger w-full px-4 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isUploading ? "Subiendo..." : "Subir portada"}
            </button>
            {uploadState.message && (
              <p className={`text-xs font-bold ${uploadState.success ? "text-[var(--color-brand-blue)]" : "text-[var(--color-brand-red)]"}`}>
                {uploadState.message}
              </p>
            )}
          </form>
        </section>

        <section className="rounded-md border border-[var(--color-border)] bg-white p-5">
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
            Galería
          </h3>
          <form action={galleryAction} className="space-y-3">
            <input type="hidden" name="gameId" value={game.id} />
            <Field label="Archivo">
              <input name="galleryImage" type="file" accept="image/*" required className="w-full text-xs" />
            </Field>
            <Field label="Tipo">
              <select name="type" defaultValue="other" className={inputClass}>
                {mediaTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Alt text">
              <input name="altText" placeholder={`${game.title} - componente`} className={inputClass} />
            </Field>
            <Field label="Año / época">
              <input name="circaYear" placeholder="1980, ~1975, años 90..." className={inputClass} />
            </Field>
            <Field label="Fuente">
              <input name="sourceDescription" placeholder="Archivo propio, BGG, editorial..." className={inputClass} />
            </Field>
            <Field label="Derechos">
              <input name="copyrightNotes" placeholder="Uso autorizado, pendiente, dominio público..." className={inputClass} />
            </Field>
            <button
              type="submit"
              disabled={isUploadingGallery}
              className="admin-button-primary w-full px-4 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isUploadingGallery ? "Subiendo..." : "Subir a galería"}
            </button>
            {galleryState.message && (
              <p className={`text-xs font-bold ${galleryState.success ? "text-[var(--color-brand-blue)]" : "text-[var(--color-brand-red)]"}`}>
                {galleryState.message}
              </p>
            )}
          </form>

          <div className="mt-5 grid gap-3">
            {galleryImages.length > 0 ? (
              galleryImages.map((item) => (
                <article key={item.id} className="grid grid-cols-[84px_1fr] gap-3 rounded-md border border-[var(--color-border)] p-2">
                  <div className="overflow-hidden rounded bg-[var(--color-brand-blue-pale)]">
                    <img src={item.url} alt={item.alt_text || game.title} className="aspect-square h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-[var(--color-brand-blue)]">
                      {mediaTypeLabels[item.type] || item.type}
                    </p>
                    <p className="truncate text-xs text-[var(--color-text-muted)]">
                      {item.alt_text || item.filename || "Sin descripción"}
                    </p>
                    {(item.circa_year || item.source_description) && (
                      <p className="mt-1 line-clamp-2 text-xs text-[var(--color-text-muted)]">
                        {[item.circa_year, item.source_description].filter(Boolean).join(" · ")}
                      </p>
                    )}
                    <form action={deleteGameMedia} className="mt-2">
                      <input type="hidden" name="id" value={item.id} />
                      <input type="hidden" name="gameId" value={game.id} />
                      <button className="rounded-md border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700 transition hover:bg-red-100">
                        Quitar
                      </button>
                    </form>
                  </div>
                </article>
              ))
            ) : (
              <p className="rounded-md border border-dashed border-[var(--color-border)] px-3 py-4 text-sm text-[var(--color-text-muted)]">
                Todavía no hay imágenes en la galería.
              </p>
            )}
          </div>
        </section>
      </aside>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="block">
      <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
        {label}
      </span>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

const inputClass =
  "w-full rounded-md border border-[var(--color-border)] bg-[var(--color-cream)] px-3 py-2 text-sm outline-none focus:border-[var(--color-brand-blue)] focus:ring-2 focus:ring-[var(--color-brand-blue-pale)]";

const textareaClass =
  "w-full rounded-md border border-[var(--color-border)] bg-[var(--color-cream)] px-3 py-2 text-sm leading-6 outline-none focus:border-[var(--color-brand-blue)] focus:ring-2 focus:ring-[var(--color-brand-blue-pale)]";

const mediaTypeOptions: { value: Exclude<MediaType, "cover">; label: string }[] = [
  { value: "board", label: "Tablero" },
  { value: "pieces", label: "Piezas / componentes" },
  { value: "card", label: "Cartas" },
  { value: "rulebook", label: "Reglamento" },
  { value: "advertisement", label: "Publicidad" },
  { value: "other", label: "Otro" },
];

const mediaTypeLabels: Record<MediaType, string> = {
  cover: "Portada",
  board: "Tablero",
  pieces: "Piezas / componentes",
  card: "Cartas",
  rulebook: "Reglamento",
  advertisement: "Publicidad",
  other: "Otro",
};
