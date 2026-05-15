import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import GameTabs from "@/components/game/GameTabs";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const game = await prisma.game.findUnique({
    where: { slug },
  });
  if (!game) return { title: "Juego no encontrado" };

  return {
    title: game.title,
    description: game.description || `${game.title} — juego de mesa chileno en Ludoteca Chilena`,
  };
}

function formatYear(year: number | null | undefined, certainty: string | null | undefined): string {
  if (!year) return "Año desconocido";
  switch (certainty) {
    case "exact": return year.toString();
    case "circa": return `~${year}`;
    case "decade": return `Años ${Math.floor(year / 10) * 10}`;
    default: return year.toString();
  }
}

function formatPlayersShort(min: number | null, max: number | null): string {
  if (!min && !max) return "—";
  if (min && max && min === max) return `${min}`;
  if (min && max) return `${min}–${max}`;
  if (min) return `${min}+`;
  return `≤${max}`;
}

function formatPlaytime(min: number | null, max: number | null): string {
  if (!min && !max) return "—";
  if (min && max && min === max) return `${min} min`;
  if (min && max) return `${min}–${max} min`;
  if (min) return `${min}+ min`;
  return `≤${max} min`;
}

const designerRoles = new Set(["author", "designer", "developer"]);
const artistRoles = new Set(["artist", "illustrator", "graphic_designer", "sculptor"]);

const originTypeLabels: Record<string, string> = {
  original: "Original chileno",
  localization: "Localización",
  adaptation: "Adaptación",
};

export default async function GameDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const game = await prisma.game.findUnique({
    where: { slug },
    include: {
      publisher: true,
      distributor: true,
      people: { include: { person: true } },
      mechanics: { include: { mechanic: true } },
      categories: { include: { category: true } },
      media: { orderBy: [{ is_primary: "desc" }, { created_at: "asc" }] },
      videos: { orderBy: { created_at: "asc" } },
      editions: {
        include: { publisher: true },
        orderBy: [{ year: "asc" }, { edition_number: "asc" }],
      },
      sources: { include: { source: true } },
    },
  });

  if (!game) notFound();

  const primaryImage = game.media.find((m) => m.is_primary) || game.media[0];
  const galleryMedia = game.media.filter((m) => m.type !== "rulebook");
  const rulebookMedia = game.media.filter((m) => m.type === "rulebook");

  const designers = game.people
    .filter((p) => designerRoles.has(p.role))
    .map((p) => ({
      slug: p.person.slug,
      name: p.person.display_name,
      href: `/personas/${p.person.slug}`,
    }))
    .filter((p, idx, arr) => arr.findIndex((x) => x.slug === p.slug) === idx);

  const artists = game.people
    .filter((p) => artistRoles.has(p.role))
    .map((p) => ({
      slug: p.person.slug,
      name: p.person.display_name,
      href: `/personas/${p.person.slug}`,
    }))
    .filter((p, idx, arr) => arr.findIndex((x) => x.slug === p.slug) === idx);

  const yearText = formatYear(game.year_published, game.year_certainty);

  const statusLabel =
    game.status === "available"
      ? "Disponible"
      : game.status === "out_of_print"
      ? "Agotado"
      : game.status === "lost"
      ? "Perdido"
      : "Desconocido";

  const statusColor =
    game.status === "available"
      ? "#22c55e"
      : game.status === "out_of_print"
      ? "var(--color-brand-red)"
      : game.status === "lost"
      ? "var(--color-text-muted)"
      : "var(--color-text-muted)";

  return (
    <div className="py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
          <Link href="/" className="hover:text-[var(--color-brand-blue)] transition-colors">
            Inicio
          </Link>
          <span>/</span>
          <Link href="/juegos" className="hover:text-[var(--color-brand-blue)] transition-colors">
            Juegos
          </Link>
          <span>/</span>
          <span style={{ color: "var(--color-brand-blue)" }}>{game.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left column — Image */}
          <div className="lg:col-span-1">
            {primaryImage?.url ? (
              <div
                className="rounded-2xl overflow-hidden"
                style={{
                  background: "var(--color-brand-blue-pale)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <img
                  src={primaryImage.url}
                  alt={game.title}
                  className="w-full h-auto block"
                />
              </div>
            ) : (
              <div
                className="aspect-square rounded-2xl overflow-hidden flex items-center justify-center"
                style={{
                  background: "var(--color-brand-blue-pale)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <div className="text-center p-8">
                  <svg
                    width="80"
                    height="80"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--color-brand-blue-light)"
                    strokeWidth="1"
                    className="mx-auto mb-4 opacity-40"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M3 15l6-6 4 4 2-2 6 6" />
                    <circle cx="15" cy="8" r="2" />
                  </svg>
                  <p className="text-sm" style={{ color: "var(--color-brand-blue-light)" }}>
                    Imagen no disponible
                  </p>
                </div>
              </div>
            )}

            {/* Status badge */}
            <div className="mt-4 flex items-center gap-2">
              <span
                className="inline-block w-3 h-3 rounded-full"
                style={{ background: statusColor }}
              />
              <span className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
                {statusLabel}
              </span>
            </div>
          </div>

          {/* Right column — Header details (BGG-style) */}
          <div className="lg:col-span-2 flex flex-col">
            {/* Top meta row: origin + awards + funding */}
            {(game.origin_type || game.awards || game.funding_source) && (
              <div
                className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-5 text-xs uppercase tracking-wider font-semibold"
                style={{ color: "var(--color-text-muted)" }}
              >
                {game.origin_type && (
                  <span className="inline-flex items-center gap-1.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand-red)" strokeWidth="2.5">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span>Origen: <span style={{ color: "var(--color-brand-blue)" }}>{originTypeLabels[game.origin_type] || game.origin_type}</span></span>
                  </span>
                )}
                {game.funding_source && (
                  <span className="inline-flex items-center gap-1.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand-red)" strokeWidth="2.5">
                      <path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z" />
                    </svg>
                    <span>Financiamiento: <span style={{ color: "var(--color-brand-blue)" }}>{game.funding_source}</span></span>
                  </span>
                )}
                {game.awards && (
                  <span className="inline-flex items-center gap-1.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand-red)" strokeWidth="2.5">
                      <circle cx="12" cy="8" r="6" />
                      <path d="M15.5 13l1.5 8L12 18l-5 3 1.5-8" />
                    </svg>
                    <span style={{ color: "var(--color-brand-blue)" }}>{game.awards}</span>
                  </span>
                )}
              </div>
            )}

            {/* Title */}
            <div className="mb-3">
              <h1
                className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight"
                style={{
                  fontFamily: "var(--font-heading)",
                  color: "var(--color-brand-blue)",
                }}
              >
                {game.title}{" "}
                <span
                  className="font-normal whitespace-nowrap"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  ({yearText})
                </span>
              </h1>

              {/* Tagline — primera línea de la descripción */}
              {game.description && (
                <p
                  className="mt-3 text-base leading-relaxed line-clamp-2"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {game.description}
                </p>
              )}
            </div>

            {/* Stats bar — 4 columnas con separadores */}
            <div
              className="grid grid-cols-2 sm:grid-cols-4 mt-6 mb-6 rounded-2xl overflow-hidden divide-y sm:divide-y-0 sm:divide-x"
              style={{
                background: "var(--color-bg-card)",
                border: "1px solid var(--color-border)",
                borderColor: "var(--color-border)",
              }}
            >
              <StatBlock
                label="Jugadores"
                value={formatPlayersShort(game.min_players, game.max_players)}
                sub={game.min_players || game.max_players ? "jugadores" : undefined}
              />
              <StatBlock
                label="Tiempo de juego"
                value={formatPlaytime(game.min_playtime, game.max_playtime)}
              />
              <StatBlock
                label="Edad"
                value={game.min_age ? `${game.min_age}+` : "—"}
                sub={game.min_age ? "años" : undefined}
              />
              <StatBlock
                label="Peso"
                value={game.bgg_weight ? `${game.bgg_weight.toFixed(2)}` : "—"}
                sub={game.bgg_weight ? "/ 5 complejidad" : undefined}
              />
            </div>

            {/* Credits list */}
            <dl className="text-sm space-y-2">
              {game.alternate_titles && game.alternate_titles.length > 0 && (
                <CreditRow
                  label="Nombres alternativos"
                  value={game.alternate_titles.join(", ")}
                />
              )}

              {designers.length > 0 && (
                <CreditRow
                  label={designers.length === 1 ? "Diseñador" : "Diseñadores"}
                  links={designers}
                />
              )}

              {artists.length > 0 && (
                <CreditRow
                  label={artists.length === 1 ? "Artista" : "Artistas"}
                  links={artists}
                />
              )}

              <CreditRow
                label="Editorial"
                links={
                  game.publisher && !game.is_self_published
                    ? [{ slug: game.publisher.slug, name: game.publisher.name, href: `/editoriales/${game.publisher.slug}` }]
                    : undefined
                }
                value={game.is_self_published ? "Autopublicado" : !game.publisher ? "Editorial desconocida" : undefined}
              />

              {game.distributor && game.distributor_id !== game.publisher_id && (
                <CreditRow
                  label="Publicado por"
                  links={[{ slug: game.distributor.slug, name: game.distributor.name, href: `/editoriales/${game.distributor.slug}` }]}
                />
              )}

              {game.origin_country && (
                <CreditRow label="País de origen" value={game.origin_country} />
              )}

              {game.bgg_url && (
                <CreditRow
                  label="BoardGameGeek"
                  externalLink={{ url: game.bgg_url, label: "Ver en BGG" }}
                />
              )}
            </dl>
          </div>
        </div>

        {/* Tabs */}
        <GameTabs
          description={game.description}
          people={game.people.map((p) => ({
            person: { slug: p.person.slug, display_name: p.person.display_name },
            role: p.role,
          }))}
          mechanics={game.mechanics.map((m) => ({
            mechanic: { slug: m.mechanic.slug, name: m.mechanic.name },
          }))}
          categories={game.categories.map((c) => ({
            category: { slug: c.category.slug, name: c.category.name },
          }))}
          galleryMedia={galleryMedia.map((m) => ({
            id: m.id,
            url: m.url,
            type: m.type,
            alt_text: m.alt_text,
            filename: m.filename,
            circa_year: m.circa_year,
            source_description: m.source_description,
            copyright_notes: m.copyright_notes,
          }))}
          videos={game.videos.map((v) => ({
            id: v.id,
            url: v.url,
            platform: v.platform,
            video_id: v.video_id,
            title: v.title,
            description: v.description,
            thumbnail: v.thumbnail,
          }))}
          rulebookMedia={rulebookMedia.map((m) => ({
            id: m.id,
            url: m.url,
            type: m.type,
            alt_text: m.alt_text,
            filename: m.filename,
            circa_year: m.circa_year,
            source_description: m.source_description,
            copyright_notes: m.copyright_notes,
          }))}
          editions={game.editions.map((e) => ({
            id: e.id,
            edition_name: e.edition_name,
            year: e.year,
            year_certainty: e.year_certainty,
            publisher: e.publisher
              ? { slug: e.publisher.slug, name: e.publisher.name }
              : null,
            first_print_run: e.first_print_run,
            total_print_run: e.total_print_run,
            edition_number: e.edition_number,
            languages: e.languages,
            notes: e.notes,
          }))}
          sources={game.sources.map((s) => ({
            notes: s.notes,
            source: {
              id: s.source.id,
              type: s.source.type,
              title: s.source.title,
              author: s.source.author,
              year: s.source.year,
              publisher_name: s.source.publisher_name,
              url: s.source.url,
              page_reference: s.source.page_reference,
              archive_location: s.source.archive_location,
            },
          }))}
        />
      </div>
    </div>
  );
}

function StatBlock({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div
      className="px-4 py-5 text-center"
      style={{ borderColor: "var(--color-border)" }}
    >
      <p
        className="text-xs uppercase tracking-wider font-semibold mb-1"
        style={{ color: "var(--color-brand-blue-light)" }}
      >
        {label}
      </p>
      <p
        className="text-2xl font-bold leading-none"
        style={{
          fontFamily: "var(--font-heading)",
          color: "var(--color-brand-blue)",
        }}
      >
        {value}
      </p>
      {sub && (
        <p
          className="text-xs mt-1"
          style={{ color: "var(--color-text-muted)" }}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

interface CreditLink {
  slug: string;
  name: string;
  href: string;
}

function CreditRow({
  label,
  value,
  links,
  externalLink,
}: {
  label: string;
  value?: string;
  links?: CreditLink[];
  externalLink?: { url: string; label: string };
}) {
  if (!value && (!links || links.length === 0) && !externalLink) return null;
  return (
    <div className="flex flex-wrap items-baseline gap-x-2">
      <dt
        className="font-bold whitespace-nowrap"
        style={{ color: "var(--color-text)" }}
      >
        {label}:
      </dt>
      <dd style={{ color: "var(--color-text-secondary)" }}>
        {externalLink ? (
          <a
            href={externalLink.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold hover:underline inline-flex items-center gap-1"
            style={{ color: "var(--color-brand-red)" }}
          >
            {externalLink.label}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M7 17L17 7M17 7H8M17 7v9" />
            </svg>
          </a>
        ) : links && links.length > 0 ? (
          <span className="flex flex-wrap gap-x-1">
            {links.map((l, i) => (
              <span key={l.slug}>
                <Link
                  href={l.href}
                  className="font-semibold hover:underline"
                  style={{ color: "var(--color-brand-red)" }}
                >
                  {l.name}
                </Link>
                {i < links.length - 1 && <span>,</span>}
              </span>
            ))}
          </span>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}
