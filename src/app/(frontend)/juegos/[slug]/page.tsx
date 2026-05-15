import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

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

function formatPlayers(min: number | null, max: number | null): string {
  if (!min && !max) return "";
  if (min && max && min === max) return `${min} jugadores`;
  if (min && max) return `${min}–${max} jugadores`;
  if (min) return `${min}+ jugadores`;
  return `Hasta ${max} jugadores`;
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

export default async function GameDetailPage({ params }: PageProps) {
  const { slug } = await params;
  
  const game = await prisma.game.findUnique({
    where: { slug },
    include: {
      publisher: true,
      people: { include: { person: true } },
      mechanics: { include: { mechanic: true } },
      categories: { include: { category: true } },
      media: { where: { is_primary: true }, take: 1 },
    },
  });

  if (!game) notFound();

  const yearText = formatYear(game.year_published, game.year_certainty);
  const playersText = formatPlayers(game.min_players, game.max_players);
  const publisher = game.is_self_published
    ? "Autopublicado"
    : game.publisher?.name || "Editorial desconocida";

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
            <div
              className="aspect-square rounded-2xl overflow-hidden flex items-center justify-center relative"
              style={{
                background: "var(--color-brand-blue-pale)",
                border: "1px solid var(--color-border)",
              }}
            >
              {game.media[0]?.url ? (
                <img
                  src={game.media[0].url}
                  alt={game.title}
                  className="w-full h-full object-cover"
                />
              ) : (
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
              )}
            </div>

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

          {/* Right column — Details */}
          <div className="lg:col-span-2">
            <h1
              className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4"
              style={{
                fontFamily: "var(--font-heading)",
                color: "var(--color-brand-blue)",
              }}
            >
              {game.title}
            </h1>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold text-white"
                style={{ background: "var(--color-brand-blue)" }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                {yearText}
              </span>

              {game.publisher && !game.is_self_published ? (
                <Link
                  href={`/editoriales/${game.publisher.slug}`}
                  className="text-sm font-semibold hover:underline"
                  style={{ color: "var(--color-brand-red)" }}
                >
                  {publisher}
                </Link>
              ) : (
                <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                  {publisher}
                </span>
              )}

              {playersText && (
                <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                  👥 {playersText}
                </span>
              )}

              {game.min_age && (
                <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                  {game.min_age}+ años
                </span>
              )}
            </div>

            {/* Description */}
            {game.description && (
              <div className="mb-8">
                <h2
                  className="text-lg font-bold mb-3"
                  style={{
                    fontFamily: "var(--font-heading)",
                    color: "var(--color-brand-blue)",
                  }}
                >
                  Descripción
                </h2>
                <div className="prose-ludoteca">
                  <p>{game.description}</p>
                </div>
              </div>
            )}

            {/* Info grid */}
            <div
              className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 p-6 rounded-2xl"
              style={{
                background: "var(--color-brand-blue-pale)",
                border: "1px solid var(--color-border)",
              }}
            >
              {[
                { label: "Jugadores", value: playersText || "—" },
                { label: "Edad mínima", value: game.min_age ? `${game.min_age}+` : "—" },
                { label: "Año", value: yearText },
                { label: "Estado", value: statusLabel },
              ].map((item) => (
                <div key={item.label} className="text-center">
                  <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "var(--color-brand-blue-light)" }}>
                    {item.label}
                  </p>
                  <p className="text-lg font-bold" style={{ color: "var(--color-brand-blue)" }}>
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Creators */}
            {game.people && game.people.length > 0 && (
              <div className="mb-6">
                <h2
                  className="text-lg font-bold mb-3"
                  style={{
                    fontFamily: "var(--font-heading)",
                    color: "var(--color-brand-blue)",
                  }}
                >
                  Creadores
                </h2>
                <div className="flex flex-wrap gap-2">
                  {game.people.map((p: any) => (
                    <Link
                      key={`${p.person.slug}-${p.role}`}
                      href={`/personas/${p.person.slug}`}
                      className="px-3 py-1 bg-white border rounded-full text-sm font-semibold hover:border-[var(--color-brand-blue)] hover:text-[var(--color-brand-blue)] transition-colors"
                      style={{ color: "var(--color-text-secondary)", borderColor: "var(--color-border)" }}
                    >
                      {p.person.display_name} <span className="opacity-50 font-normal">({roleMap[p.role] || p.role})</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Mechanics */}
            {game.mechanics.length > 0 && (
              <div className="mb-6">
                <h2
                  className="text-lg font-bold mb-3"
                  style={{
                    fontFamily: "var(--font-heading)",
                    color: "var(--color-brand-blue)",
                  }}
                >
                  Mecánicas
                </h2>
                <div className="flex flex-wrap gap-2">
                  {game.mechanics.map((m) => (
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

            {/* Categories */}
            {game.categories.length > 0 && (
              <div className="mb-6">
                <h2
                  className="text-lg font-bold mb-3"
                  style={{
                    fontFamily: "var(--font-heading)",
                    color: "var(--color-brand-blue)",
                  }}
                >
                  Categorías
                </h2>
                <div className="flex flex-wrap gap-2">
                  {game.categories.map((c) => (
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
        </div>
      </div>
    </div>
  );
}
