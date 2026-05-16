import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PublisherTabs from "@/components/publisher/PublisherTabs";
import { safeExternalUrl, trustedMediaHosts } from "@/lib/url";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const publisher = await prisma.publisher.findFirst({
    where: {
      slug,
      content_status: "published",
      published_games: { some: { content_status: "published" } },
    },
  });
  if (!publisher) return { title: "Editorial no encontrada" };

  return {
    title: `${publisher.name} | Ludoteca Chilena`,
    description: `Catálogo de juegos publicados por la editorial chilena ${publisher.name}.`,
  };
}

export default async function PublisherDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const publisher = await prisma.publisher.findFirst({
    where: {
      slug,
      content_status: "published",
      published_games: { some: { content_status: "published" } },
    },
    include: {
      published_games: {
        where: { content_status: "published" },
        include: {
          mechanics: { include: { mechanic: true } },
          media: { where: { is_primary: true }, take: 1 },
          videos: { orderBy: { created_at: "asc" } },
        },
        orderBy: [{ year_published: "desc" }, { title: "asc" }],
      },
      media: {
        orderBy: [{ is_primary: "desc" }, { created_at: "desc" }],
      },
    },
  });

  if (!publisher) notFound();

  // Si el former_name coincide con otra editorial en BD, generamos link interno
  let formerNameHref: string | null = null;
  if (publisher.former_name) {
    const formerPublisher = await prisma.publisher.findFirst({
      where: {
        name: { equals: publisher.former_name, mode: "insensitive" },
        content_status: "published",
        published_games: { some: { content_status: "published" } },
      },
      select: { slug: true },
    });
    if (formerPublisher) {
      formerNameHref = `/editoriales/${formerPublisher.slug}`;
    }
  }

  const isInactive = publisher.status === "inactive";
  const yearsActive = publisher.founded_year
    ? `${publisher.founded_year} — ${publisher.closed_year || "Presente"}`
    : "Año de fundación desconocido";

  const primaryLogo = publisher.media.find((m) => m.is_primary) || null;
  const logoUrl = safeExternalUrl(primaryLogo?.url, {
    allowedHosts: trustedMediaHosts,
  });

  // Imágenes adicionales (no primarias)
  const additionalImages = publisher.media
    .filter((m) => !m.is_primary)
    .map((m) => ({
      id: m.id,
      url: safeExternalUrl(m.url, { allowedHosts: trustedMediaHosts }) ?? m.url,
      altText: m.alt_text,
      caption: null,
      circaYear: m.circa_year,
    }));

  // Juegos vinculados con datos para la tabla BGG-style
  const linkedGames = publisher.published_games.map((g) => ({
    id: g.id,
    slug: g.slug,
    title: g.title,
    year: g.year_published,
    avgRating: g.avg_rating,
    ratingCount: g.rating_count,
    bggWeight: g.bgg_weight,
    minPlayers: g.min_players,
    maxPlayers: g.max_players,
    minPlaytime: g.min_playtime,
    maxPlaytime: g.max_playtime,
    minAge: g.min_age,
    coverUrl:
      safeExternalUrl(g.media[0]?.url, { allowedHosts: trustedMediaHosts }) ??
      null,
  }));

  // Agregar todos los videos de los juegos del publisher
  const aggregatedVideos = publisher.published_games.flatMap((g) =>
    g.videos.map((v) => ({
      id: v.id,
      url: v.url,
      platform: v.platform,
      videoId: v.video_id,
      title: v.title,
      description: v.description,
      gameSlug: g.slug,
      gameTitle: g.title,
    })),
  );

  return (
    <div className="py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav
          className="mb-8 flex items-center gap-2 text-sm"
          style={{ color: "var(--color-text-muted)" }}
        >
          <Link
            href="/"
            className="hover:text-[var(--color-brand-blue)] transition-colors"
          >
            Inicio
          </Link>
          <span>/</span>
          <Link
            href="/editoriales"
            className="hover:text-[var(--color-brand-blue)] transition-colors"
          >
            Editoriales
          </Link>
          <span>/</span>
          <span style={{ color: "var(--color-brand-blue)" }}>{publisher.name}</span>
        </nav>

        {/* Header */}
        <div
          className="mb-10 p-8 rounded-2xl"
          style={{
            border: "1px solid var(--color-border)",
            background: "var(--color-white)",
          }}
        >
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[var(--color-border)] bg-white">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={`Logo de ${publisher.name}`}
                    className="h-full w-full object-contain p-3"
                  />
                ) : (
                  <svg
                    width="34"
                    height="34"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--color-brand-blue-light)"
                    strokeWidth="2"
                  >
                    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                  </svg>
                )}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h1
                    className="text-3xl sm:text-4xl font-bold"
                    style={{
                      fontFamily: "var(--font-heading)",
                      color: "var(--color-brand-blue)",
                    }}
                  >
                    {publisher.name}
                  </h1>
                  <span
                    className="text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-full"
                    style={{
                      background: isInactive ? "var(--color-cream)" : "#dcfce7",
                      color: isInactive ? "var(--color-text-muted)" : "#166534",
                    }}
                  >
                    {publisher.status === "active"
                      ? "Activa"
                      : publisher.status === "inactive"
                      ? "Inactiva"
                      : "Desconocido"}
                  </span>
                </div>

                <div
                  className="flex items-center gap-2 text-sm"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  {yearsActive}
                </div>
              </div>
            </div>

            <div className="text-left md:text-right">
              <p
                className="text-3xl font-bold"
                style={{ color: "var(--color-brand-red)" }}
              >
                {publisher.published_games.length}
              </p>
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500">
                Juegos Publicados
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <PublisherTabs
          meta={{
            historicalNotes: publisher.historical_notes,
            country: publisher.country,
            city: publisher.city,
            foundedYear: publisher.founded_year,
            closedYear: publisher.closed_year,
            formerName: publisher.former_name,
            formerNameHref,
            website: publisher.website,
            bggUrl: publisher.bgg_url,
            status: publisher.status,
          }}
          games={linkedGames}
          images={additionalImages}
          videos={aggregatedVideos}
        />
      </div>
    </div>
  );
}
