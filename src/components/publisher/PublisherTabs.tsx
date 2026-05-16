"use client";

import { useState } from "react";
import Link from "next/link";
import { buildEmbedUrl, platformLabels, type VideoPlatform } from "@/lib/video";

type TabKey = "descripcion" | "juegos" | "imagenes" | "videos";

interface PublisherMeta {
  historicalNotes: string | null;
  country: string | null;
  city: string | null;
  foundedYear: number | null;
  closedYear: number | null;
  formerName: string | null;
  formerNameHref: string | null;
  website: string | null;
  bggUrl: string | null;
  status: string;
}

interface LinkedGame {
  id: string;
  slug: string;
  title: string;
  year: number | null;
  avgRating: number | null;
  ratingCount: number;
  bggWeight: number | null;
  minPlayers: number | null;
  maxPlayers: number | null;
  minPlaytime: number | null;
  maxPlaytime: number | null;
  minAge: number | null;
  coverUrl: string | null;
}

function formatPlayers(min: number | null, max: number | null): string | null {
  if (!min && !max) return null;
  if (min && max && min === max) return `${min}`;
  if (min && max) return `${min}–${max}`;
  if (min) return `${min}+`;
  return `≤${max}`;
}

function formatPlaytime(min: number | null, max: number | null): string | null {
  if (!min && !max) return null;
  if (min && max && min === max) return `${min} min`;
  if (min && max) return `${min}–${max} min`;
  if (min) return `${min}+ min`;
  return `≤${max} min`;
}

interface ImageItem {
  id: string;
  url: string;
  altText: string | null;
  caption: string | null;
  circaYear: string | null;
}

interface VideoItem {
  id: string;
  url: string;
  platform: VideoPlatform;
  videoId: string | null;
  title: string | null;
  description: string | null;
  gameSlug: string;
  gameTitle: string;
}

interface Props {
  meta: PublisherMeta;
  games: LinkedGame[];
  images: ImageItem[];
  videos: VideoItem[];
}

const statusLabel: Record<string, string> = {
  active: "Activa",
  inactive: "Inactiva",
  unknown: "Desconocido",
};

export default function PublisherTabs({ meta, games, images, videos }: Props) {
  const [active, setActive] = useState<TabKey>("descripcion");

  const tabs: { key: TabKey; label: string; count?: number }[] = [
    { key: "descripcion", label: "Descripción" },
    { key: "juegos", label: "Juegos Vinculados", count: games.length },
    { key: "imagenes", label: "Imágenes", count: images.length },
    { key: "videos", label: "Videos", count: videos.length },
  ];

  return (
    <div>
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

      <div role="tabpanel">
        {active === "descripcion" && <DescripcionPanel meta={meta} />}
        {active === "juegos" && <JuegosPanel games={games} />}
        {active === "imagenes" && <ImagenesPanel images={images} />}
        {active === "videos" && <VideosPanel videos={videos} />}
      </div>
    </div>
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

function DescripcionPanel({ meta }: { meta: PublisherMeta }) {
  const yearsActive = meta.foundedYear
    ? `${meta.foundedYear}${meta.closedYear ? ` — ${meta.closedYear}` : " — Presente"}`
    : "Año de fundación desconocido";
  const location = [meta.city, meta.country].filter(Boolean).join(", ");

  const hasMeta =
    meta.country ||
    meta.city ||
    meta.foundedYear ||
    meta.closedYear ||
    meta.formerName ||
    meta.website ||
    meta.bggUrl;

  return (
    <div className="space-y-8">
      {meta.historicalNotes ? (
        <div>
          <h3
            className="text-lg font-bold mb-3"
            style={{ fontFamily: "var(--font-heading)", color: "var(--color-brand-blue)" }}
          >
            Historia
          </h3>
          <div className="prose-ludoteca">
            <p style={{ whiteSpace: "pre-line" }}>{meta.historicalNotes}</p>
          </div>
        </div>
      ) : (
        <EmptyState message="Aún no hay una reseña histórica de esta editorial." />
      )}

      {hasMeta && (
        <div>
          <h3
            className="text-lg font-bold mb-3"
            style={{ fontFamily: "var(--font-heading)", color: "var(--color-brand-blue)" }}
          >
            Datos
          </h3>
          <dl className="text-sm space-y-2">
            {meta.foundedYear && (
              <Row label="Años activa" value={yearsActive} />
            )}
            <Row label="Estado" value={statusLabel[meta.status] ?? meta.status} />
            {location && <Row label="Ubicación" value={location} />}
            {meta.formerName && (
              <Row
                label="Nombre anterior"
                value={meta.formerName}
                href={meta.formerNameHref ?? undefined}
              />
            )}
            {meta.website && (
              <Row
                label="Sitio web"
                value={meta.website}
                href={meta.website}
                external
              />
            )}
            {meta.bggUrl && (
              <Row
                label="BoardGameGeek"
                value="Ver en BGG"
                href={meta.bggUrl}
                external
              />
            )}
          </dl>
        </div>
      )}
    </div>
  );
}

function Row({
  label,
  value,
  href,
  external = false,
}: {
  label: string;
  value: string;
  href?: string;
  external?: boolean;
}) {
  const linkClass = "font-semibold hover:underline";
  const linkStyle = { color: "var(--color-brand-red)" };

  return (
    <div className="flex flex-wrap items-baseline gap-x-2">
      <dt className="font-bold whitespace-nowrap" style={{ color: "var(--color-text)" }}>
        {label}:
      </dt>
      <dd style={{ color: "var(--color-text-secondary)" }}>
        {href ? (
          external ? (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
              style={linkStyle}
            >
              {value}
              <svg
                className="inline-block ml-1"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M7 17L17 7M17 7H8M17 7v9" />
              </svg>
            </a>
          ) : (
            <Link href={href} className={linkClass} style={linkStyle}>
              {value}
            </Link>
          )
        ) : (
          value
        )}
      </dd>
    </div>
  );
}

function JuegosPanel({ games }: { games: LinkedGame[] }) {
  if (games.length === 0) {
    return <EmptyState message="Esta editorial no tiene juegos publicados registrados." />;
  }

  return (
    <div>
      <div
        className="text-sm mb-4 pb-3 border-b"
        style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}
      >
        Mostrando <strong style={{ color: "var(--color-brand-blue)" }}>{games.length}</strong>{" "}
        {games.length === 1 ? "juego" : "juegos"}
      </div>

      <ul className="divide-y" style={{ borderColor: "var(--color-border)" }}>
        {games.map((g) => {
          const playersText = formatPlayers(g.minPlayers, g.maxPlayers);
          const playtimeText = formatPlaytime(g.minPlaytime, g.maxPlaytime);
          return (
            <li key={g.id} className="py-4">
              <Link href={`/juegos/${g.slug}`} className="flex items-start gap-4 group">
                {/* Cover — imagen completa, sin recorte */}
                <div
                  className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center"
                  style={{ background: "var(--color-brand-blue-pale)" }}
                >
                  {g.coverUrl ? (
                    <img
                      src={g.coverUrl}
                      alt={g.title}
                      className="max-w-full max-h-full object-contain transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="var(--color-brand-blue-light)"
                      strokeWidth="1.5"
                      className="opacity-40"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <path d="M3 15l6-6 4 4 2-2 6 6" />
                    </svg>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h4
                    className="text-base font-bold leading-tight group-hover:underline"
                    style={{
                      fontFamily: "var(--font-heading)",
                      color: "var(--color-brand-red)",
                    }}
                  >
                    {g.title}
                    {g.year != null && (
                      <span
                        className="ml-1 font-normal"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        ({g.year})
                      </span>
                    )}
                  </h4>

                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                    {playersText && <Stat label="Jugadores" value={playersText} />}
                    {playtimeText && <Stat label="Tiempo" value={playtimeText} />}
                    {g.minAge != null && <Stat label="Edad" value={`${g.minAge}+`} />}
                    {g.ratingCount > 0 && (
                      <Stat
                        label="Valoraciones"
                        value={g.ratingCount.toLocaleString("es-CL")}
                      />
                    )}
                    {g.bggWeight != null && (
                      <Stat label="Peso" value={g.bggWeight.toFixed(2)} />
                    )}
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-baseline gap-1.5">
      <span
        className="text-xs font-semibold uppercase tracking-wide"
        style={{ color: "var(--color-text-muted)" }}
      >
        {label}
      </span>
      <span style={{ color: "var(--color-brand-blue)", fontWeight: 600 }}>
        {value}
      </span>
    </span>
  );
}

function ImagenesPanel({ images }: { images: ImageItem[] }) {
  if (images.length === 0) {
    return <EmptyState message="No hay imágenes adicionales registradas para esta editorial." />;
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {images.map((img) => (
        <figure
          key={img.id}
          className="rounded-2xl overflow-hidden border bg-white"
          style={{ borderColor: "var(--color-border)" }}
        >
          <div
            className="aspect-square overflow-hidden"
            style={{ background: "var(--color-brand-blue-pale)" }}
          >
            <img
              src={img.url}
              alt={img.altText || "Imagen"}
              className="w-full h-full object-contain p-2"
            />
          </div>
          {(img.altText || img.caption || img.circaYear) && (
            <figcaption className="p-4 text-sm">
              {img.altText && (
                <p
                  className="font-semibold"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {img.altText}
                </p>
              )}
              {img.caption && (
                <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
                  {img.caption}
                </p>
              )}
              {img.circaYear && (
                <span
                  className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full"
                  style={{
                    background: "var(--color-brand-blue-pale)",
                    color: "var(--color-brand-blue)",
                  }}
                >
                  {img.circaYear}
                </span>
              )}
            </figcaption>
          )}
        </figure>
      ))}
    </div>
  );
}

function VideosPanel({ videos }: { videos: VideoItem[] }) {
  if (videos.length === 0) {
    return <EmptyState message="No hay videos vinculados a los juegos de esta editorial." />;
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {videos.map((v) => {
        const embed = buildEmbedUrl(v.platform, v.videoId);
        const isVertical = v.platform === "tiktok" || v.platform === "instagram";
        const aspectClass = isVertical ? "aspect-[9/16]" : "aspect-video";
        return (
          <div
            key={v.id}
            className="rounded-2xl overflow-hidden border bg-white"
            style={{ borderColor: "var(--color-border)" }}
          >
            <div className={`${aspectClass} bg-black relative`}>
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
                <a
                  href={v.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs hover:underline"
                  style={{ color: "var(--color-brand-red)" }}
                >
                  Ver original ↗
                </a>
              </div>
              <Link
                href={`/juegos/${v.gameSlug}`}
                className="font-semibold hover:underline block"
                style={{ color: "var(--color-brand-blue)" }}
              >
                {v.title || v.gameTitle}
              </Link>
              <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                Juego: {v.gameTitle}
              </p>
              {v.description && (
                <p
                  className="mt-2 text-sm"
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
