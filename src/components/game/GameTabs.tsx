"use client";

import { useState } from "react";
import Link from "next/link";
import { buildEmbedUrl, platformLabels, type VideoPlatform } from "@/lib/video";
import { safeExternalUrl, trustedMediaHosts, trustedVideoHosts } from "@/lib/url";

type TabKey = "descripcion" | "galeria" | "videos" | "archivos" | "ediciones" | "fuentes";

interface PersonRef {
  person: { slug: string; display_name: string };
  role: string;
}
interface MechanicRef {
  mechanic: { slug: string; name: string };
}
interface CategoryRef {
  category: { slug: string; name: string };
}
interface MediaItem {
  id: string;
  url: string;
  type: string;
  alt_text: string | null;
  filename: string | null;
  circa_year: string | null;
  source_description: string | null;
  copyright_notes: string | null;
}
interface VideoItem {
  id: string;
  url: string;
  platform: VideoPlatform;
  video_id: string | null;
  title: string | null;
  description: string | null;
  thumbnail: string | null;
}
interface EditionItem {
  id: string;
  edition_name: string | null;
  year: number | null;
  year_certainty: string;
  publisher: { slug: string; name: string } | null;
  first_print_run: number | null;
  total_print_run: number | null;
  edition_number: number | null;
  languages: string[];
  notes: string | null;
}
interface SourceItem {
  notes: string | null;
  source: {
    id: string;
    type: string;
    title: string;
    author: string | null;
    year: number | null;
    publisher_name: string | null;
    url: string | null;
    page_reference: string | null;
    archive_location: string | null;
  };
}

interface GameTabsProps {
  description: string | null;
  people: PersonRef[];
  mechanics: MechanicRef[];
  categories: CategoryRef[];
  galleryMedia: MediaItem[];
  videos: VideoItem[];
  rulebookMedia: MediaItem[];
  editions: EditionItem[];
  sources: SourceItem[];
}

const roleMap: Record<string, string> = {
  author: "Autor",
  designer: "Diseñador",
  artist: "Artista",
  illustrator: "Ilustrador",
  developer: "Desarrollador",
  graphic_designer: "Diseñador Gráfico",
  sculptor: "Escultor",
  editor: "Editor",
  writer: "Escritor",
  insert_designer: "Diseñador de insertos",
};

const sourceTypeMap: Record<string, string> = {
  book: "Libro",
  article: "Artículo",
  newspaper: "Diario",
  interview: "Entrevista",
  archive: "Archivo",
  website: "Sitio web",
  other: "Otro",
};

const mediaTypeMap: Record<string, string> = {
  cover: "Portada",
  board: "Tablero",
  pieces: "Componentes",
  card: "Cartas",
  advertisement: "Aviso publicitario",
  other: "Otro",
};

function formatEditionYear(year: number | null, certainty: string): string {
  if (!year) return "Año desconocido";
  switch (certainty) {
    case "circa": return `~${year}`;
    case "decade": return `Años ${Math.floor(year / 10) * 10}`;
    default: return year.toString();
  }
}

export default function GameTabs({
  description,
  people,
  mechanics,
  categories,
  galleryMedia,
  videos,
  rulebookMedia,
  editions,
  sources,
}: GameTabsProps) {
  const [active, setActive] = useState<TabKey>("descripcion");

  const tabs: { key: TabKey; label: string; count?: number }[] = [
    { key: "descripcion", label: "Descripción" },
    { key: "galeria", label: "Galería", count: galleryMedia.length },
    { key: "videos", label: "Videos", count: videos.length },
    { key: "archivos", label: "Archivos", count: rulebookMedia.length },
    { key: "ediciones", label: "Ediciones", count: editions.length },
    { key: "fuentes", label: "Fuentes", count: sources.length },
  ];

  return (
    <div className="mt-12">
      {/* Tab bar */}
      <div
        className="flex flex-wrap gap-1 border-b mb-6 overflow-x-auto"
        style={{ borderColor: "var(--color-border)" }}
        role="tablist"
      >
        {tabs.map((tab) => {
          const isActive = active === tab.key;
          return (
            <button
              key={tab.key}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(tab.key)}
              className="px-4 py-3 text-sm font-semibold transition-colors whitespace-nowrap relative -mb-px border-b-2"
              style={{
                color: isActive ? "var(--color-brand-blue)" : "var(--color-text-muted)",
                borderColor: isActive ? "var(--color-brand-red)" : "transparent",
                fontFamily: "var(--font-heading)",
              }}
            >
              {tab.label}
              {typeof tab.count === "number" && tab.count > 0 && (
                <span
                  className="ml-2 inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 text-xs rounded-full"
                  style={{
                    background: isActive ? "var(--color-brand-red)" : "var(--color-brand-blue-pale)",
                    color: isActive ? "#fff" : "var(--color-brand-blue)",
                  }}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Panels */}
      <div role="tabpanel">
        {active === "descripcion" && (
          <DescripcionPanel
            description={description}
            people={people}
            mechanics={mechanics}
            categories={categories}
          />
        )}
        {active === "galeria" && <GaleriaPanel items={galleryMedia} />}
        {active === "videos" && <VideosPanel items={videos} />}
        {active === "archivos" && <ArchivosPanel items={rulebookMedia} />}
        {active === "ediciones" && <EdicionesPanel items={editions} />}
        {active === "fuentes" && <FuentesPanel items={sources} />}
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-lg font-bold mb-3"
      style={{
        fontFamily: "var(--font-heading)",
        color: "var(--color-brand-blue)",
      }}
    >
      {children}
    </h2>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div
      className="rounded-2xl border p-10 text-center"
      style={{
        background: "var(--color-brand-blue-pale)",
        borderColor: "var(--color-border)",
        color: "var(--color-text-muted)",
      }}
    >
      <p className="text-sm">{message}</p>
    </div>
  );
}

function DescripcionPanel({
  description,
  people,
  mechanics,
  categories,
}: {
  description: string | null;
  people: PersonRef[];
  mechanics: MechanicRef[];
  categories: CategoryRef[];
}) {
  return (
    <div className="space-y-8">
      {description ? (
        <div>
          <SectionTitle>Descripción</SectionTitle>
          <div
            className="prose-ludoteca space-y-4 leading-7 [&_a]:font-semibold [&_a]:text-[var(--color-brand-blue)] [&_a]:underline [&_h2]:text-2xl [&_h3]:text-xl [&_li]:ml-5 [&_ol]:list-decimal [&_ul]:list-disc"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        </div>
      ) : (
        <EmptyState message="Aún no hay una descripción para este juego." />
      )}

      {people.length > 0 && (
        <div>
          <SectionTitle>Creadores</SectionTitle>
          <div className="flex flex-wrap gap-2">
            {people.map((p) => (
              <Link
                key={`${p.person.slug}-${p.role}`}
                href={`/personas/${p.person.slug}`}
                className="px-3 py-1 bg-white border rounded-full text-sm font-semibold hover:border-[var(--color-brand-blue)] hover:text-[var(--color-brand-blue)] transition-colors"
                style={{ color: "var(--color-text-secondary)", borderColor: "var(--color-border)" }}
              >
                {p.person.display_name}{" "}
                <span className="opacity-50 font-normal">({roleMap[p.role] || p.role})</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {mechanics.length > 0 && (
        <div>
          <SectionTitle>Mecánicas</SectionTitle>
          <div className="flex flex-wrap gap-2">
            {mechanics.map((m) => (
              <Link
                key={m.mechanic.slug}
                href={`/mecanicas/${m.mechanic.slug}`}
                className="tag-mechanic hover:scale-105 transition-transform"
              >
                {m.mechanic.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {categories.length > 0 && (
        <div>
          <SectionTitle>Categorías</SectionTitle>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <Link
                key={c.category.slug}
                href={`/categorias/${c.category.slug}`}
                className="tag-category hover:scale-105 transition-transform"
              >
                {c.category.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function GaleriaPanel({ items }: { items: MediaItem[] }) {
  if (items.length === 0) {
    return <EmptyState message="Aún no hay imágenes históricas para este juego." />;
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((m) => (
        <GalleryItem key={m.id} item={m} />
      ))}
    </div>
  );
}

function GalleryItem({ item: m }: { item: MediaItem }) {
  const safeUrl = safeExternalUrl(m.url, { allowedHosts: trustedMediaHosts });

  return (
    <figure
      className="rounded-2xl overflow-hidden border bg-white"
      style={{ borderColor: "var(--color-border)" }}
    >
      <div
        className="aspect-square overflow-hidden flex items-center justify-center"
        style={{ background: "var(--color-brand-blue-pale)" }}
      >
        {safeUrl ? (
          <img
            src={safeUrl}
            alt={m.alt_text || mediaTypeMap[m.type] || "Imagen del juego"}
            className="w-full h-full object-cover"
          />
        ) : (
          <p className="text-sm" style={{ color: "var(--color-brand-blue-light)" }}>
            Imagen no disponible
          </p>
        )}
      </div>
      <figcaption className="p-4 text-sm">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span
            className="text-xs uppercase tracking-wider font-semibold"
            style={{ color: "var(--color-brand-blue-light)" }}
          >
            {mediaTypeMap[m.type] || m.type}
          </span>
          {m.circa_year && (
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    background: "var(--color-brand-blue-pale)",
                    color: "var(--color-brand-blue)",
                  }}
                >
                  {m.circa_year}
                </span>
          )}
        </div>
        {m.alt_text && (
          <p style={{ color: "var(--color-text-secondary)" }}>{m.alt_text}</p>
        )}
        {m.source_description && (
          <p className="mt-2 text-xs" style={{ color: "var(--color-text-muted)" }}>
            Fuente: {m.source_description}
          </p>
        )}
        {m.copyright_notes && (
          <p className="mt-1 text-xs italic" style={{ color: "var(--color-text-muted)" }}>
            {m.copyright_notes}
          </p>
        )}
      </figcaption>
    </figure>
  );
}

function VideosPanel({ items }: { items: VideoItem[] }) {
  if (items.length === 0) {
    return <EmptyState message="Aún no hay videos vinculados a este juego." />;
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {items.map((v) => {
        const embed = buildEmbedUrl(v.platform, v.video_id);
        const safeOriginalUrl = safeExternalUrl(v.url, { allowedHosts: trustedVideoHosts });
        const isVertical = v.platform === "tiktok" || v.platform === "instagram";
        const aspectClass = isVertical ? "aspect-[9/16]" : "aspect-video";
        return (
          <div
            key={v.id}
            className="rounded-2xl overflow-hidden border bg-white"
            style={{ borderColor: "var(--color-border)" }}
          >
            <div
              className={`${aspectClass} bg-black relative`}
            >
              {embed ? (
                <iframe
                  src={embed}
                  title={v.title || "Video"}
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-white text-sm">
                  Video no embebible
                </div>
              )}
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span
                  className="text-xs uppercase tracking-wider font-semibold"
                  style={{ color: "var(--color-brand-blue-light)" }}
                >
                  {platformLabels[v.platform]}
                </span>
                {safeOriginalUrl && (
                  <a
                    href={safeOriginalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs hover:underline"
                    style={{ color: "var(--color-brand-red)" }}
                  >
                    Ver original ↗
                  </a>
                )}
              </div>
              {v.title && (
                <p className="font-semibold" style={{ color: "var(--color-brand-blue)" }}>
                  {v.title}
                </p>
              )}
              {v.description && (
                <p
                  className="mt-1 text-sm"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {v.description}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ArchivosPanel({ items }: { items: MediaItem[] }) {
  if (items.length === 0) {
    return <EmptyState message="Aún no hay reglamentos ni archivos disponibles." />;
  }
  return (
    <ul className="space-y-3">
      {items.map((m) => (
        <ArchiveItem key={m.id} item={m} />
      ))}
    </ul>
  );
}

function ArchiveItem({ item: m }: { item: MediaItem }) {
  const safeUrl = safeExternalUrl(m.url, { allowedHosts: trustedMediaHosts });

  return (
    <li
      className="flex items-start gap-4 p-4 rounded-2xl border bg-white hover:border-[var(--color-brand-blue)] transition-colors"
      style={{ borderColor: "var(--color-border)" }}
    >
      <div
        className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
        style={{ background: "var(--color-brand-blue-pale)" }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--color-brand-blue)"
          strokeWidth="2"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        {safeUrl ? (
          <a
            href={safeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold hover:underline block"
            style={{ color: "var(--color-brand-blue)" }}
          >
            {m.filename || m.alt_text || "Reglamento"}
          </a>
        ) : (
          <p className="font-semibold" style={{ color: "var(--color-text-muted)" }}>
            {m.filename || m.alt_text || "Reglamento no disponible"}
          </p>
        )}
        <div
          className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs"
          style={{ color: "var(--color-text-muted)" }}
        >
          <span>Reglamento</span>
          {m.circa_year && <span>· {m.circa_year}</span>}
          {m.source_description && <span>· {m.source_description}</span>}
        </div>
      </div>
      {safeUrl && (
        <a
          href={safeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 text-sm font-semibold px-3 py-1.5 rounded-full"
          style={{
            background: "var(--color-brand-blue)",
            color: "#fff",
          }}
        >
          Descargar
        </a>
      )}
    </li>
  );
}

function EdicionesPanel({ items }: { items: EditionItem[] }) {
  if (items.length === 0) {
    return <EmptyState message="Aún no hay ediciones registradas para este juego." />;
  }
  return (
    <ul className="space-y-4">
      {items.map((e, idx) => (
        <li
          key={e.id}
          className="p-5 rounded-2xl border bg-white"
          style={{ borderColor: "var(--color-border)" }}
        >
          <div className="flex flex-wrap items-baseline gap-3 mb-2">
            <h3
              className="text-lg font-bold"
              style={{
                fontFamily: "var(--font-heading)",
                color: "var(--color-brand-blue)",
              }}
            >
              {e.edition_name || `Edición ${e.edition_number || idx + 1}`}
            </h3>
            <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              {formatEditionYear(e.year, e.year_certainty)}
            </span>
            {e.publisher && (
              <Link
                href={`/editoriales/${e.publisher.slug}`}
                className="text-sm font-semibold hover:underline"
                style={{ color: "var(--color-brand-red)" }}
              >
                {e.publisher.name}
              </Link>
            )}
          </div>

          <div
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 text-sm"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {e.edition_number !== null && (
              <Stat label="Nº de impresión" value={`${e.edition_number}ª`} />
            )}
            {e.first_print_run !== null && (
              <Stat label="Primer tiraje" value={e.first_print_run.toLocaleString("es-CL")} />
            )}
            {e.total_print_run !== null && (
              <Stat label="Tiraje total" value={e.total_print_run.toLocaleString("es-CL")} />
            )}
            {e.languages.length > 0 && (
              <Stat label="Idiomas" value={e.languages.join(", ")} />
            )}
          </div>

          {e.notes && (
            <p
              className="mt-3 pt-3 border-t text-sm"
              style={{
                borderColor: "var(--color-border)",
                color: "var(--color-text-secondary)",
              }}
            >
              {e.notes}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p
        className="text-xs uppercase tracking-wider mb-0.5"
        style={{ color: "var(--color-brand-blue-light)" }}
      >
        {label}
      </p>
      <p className="font-semibold" style={{ color: "var(--color-brand-blue)" }}>
        {value}
      </p>
    </div>
  );
}

function FuentesPanel({ items }: { items: SourceItem[] }) {
  if (items.length === 0) {
    return <EmptyState message="Aún no hay fuentes bibliográficas registradas." />;
  }
  return (
    <ol className="space-y-4">
      {items.map(({ source, notes }, idx) => (
        <SourceItemRow key={source.id} source={source} notes={notes} index={idx} />
      ))}
    </ol>
  );
}

function SourceItemRow({
  source,
  notes,
  index,
}: {
  source: SourceItem["source"];
  notes: string | null;
  index: number;
}) {
  const safeUrl = safeExternalUrl(source.url);

  return (
    <li
      className="p-5 rounded-2xl border bg-white flex gap-4"
      style={{ borderColor: "var(--color-border)" }}
    >
          <span
            className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
            style={{
              background: "var(--color-brand-blue-pale)",
              color: "var(--color-brand-blue)",
            }}
          >
        {index + 1}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-baseline gap-2 mb-1">
              <span
                className="text-xs uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full"
                style={{
                  background: "#fff0f0",
                  color: "var(--color-brand-red-dark)",
                }}
              >
                {sourceTypeMap[source.type] || source.type}
              </span>
              {source.year && (
                <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                  {source.year}
                </span>
              )}
            </div>
            <p
              className="font-semibold"
              style={{ color: "var(--color-brand-blue)" }}
            >
          {safeUrl ? (
                <a
              href={safeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {source.title}
                </a>
              ) : (
                source.title
              )}
            </p>
            {(source.author || source.publisher_name) && (
              <p
                className="text-sm mt-0.5"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {source.author}
                {source.author && source.publisher_name && " · "}
                {source.publisher_name}
              </p>
            )}
            <div
              className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs"
              style={{ color: "var(--color-text-muted)" }}
            >
              {source.page_reference && <span>{source.page_reference}</span>}
              {source.archive_location && <span>· {source.archive_location}</span>}
            </div>
            {notes && (
              <p
                className="mt-2 text-sm italic"
                style={{ color: "var(--color-text-secondary)" }}
              >
                &ldquo;{notes}&rdquo;
              </p>
            )}
          </div>
        </li>
  );
}
