import type { Metadata } from "next";
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { AdminSectionHeader } from "@/components/admin/AdminSectionHeader";
import { AdminSearchInput } from "@/components/admin/AdminSearchInput";

export const metadata: Metadata = {
  title: "Juegos | Admin",
};

interface AdminGamesPageProps {
  searchParams: Promise<{ filtro?: string; q?: string }>;
}

const filterLabels: Record<string, string> = {
  "sin-portada": "Juegos sin portada principal",
  "no-verificados": "Juegos publicados no verificados",
};

export default async function AdminGamesPage({ searchParams }: AdminGamesPageProps) {
  const { filtro, q } = await searchParams;
  const query = q?.trim() ?? "";

  const filterWhere: Prisma.GameWhereInput =
    filtro === "sin-portada"
      ? { content_status: "published", media: { none: { is_primary: true } } }
      : filtro === "no-verificados"
        ? { content_status: "published", is_verified: false }
        : {};

  const searchWhere: Prisma.GameWhereInput = query
    ? {
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { publisher: { name: { contains: query, mode: "insensitive" } } },
          { distributor: { name: { contains: query, mode: "insensitive" } } },
        ],
      }
    : {};

  const where: Prisma.GameWhereInput =
    query && filtro ? { AND: [filterWhere, searchWhere] } : { ...filterWhere, ...searchWhere };

  const games = await prisma.game.findMany({
    where,
    orderBy: [{ content_status: "asc" }, { title: "asc" }],
    take: 150,
    include: {
      publisher: { select: { name: true } },
      media: {
        where: { is_primary: true },
        select: { id: true },
        take: 1,
      },
    },
  });
  const activeFilterLabel = filtro ? filterLabels[filtro] : null;

  return (
    <div className="mx-auto max-w-7xl">
      <AdminSectionHeader
        eyebrow="Catálogo"
        title="Juegos"
        description="Listado editorial para abrir fichas, corregir datos principales, publicar borradores y gestionar portadas."
        action={
          <Link
            href="/admin/juegos/nuevo"
            className="admin-button-primary px-4 py-2.5 text-sm"
          >
            Nuevo juego
          </Link>
        }
      />

      <div className="mb-6">
        <AdminSearchInput placeholder="Buscar por título o editorial…" />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {activeFilterLabel ? (
          <>
            <span className="rounded-full bg-[var(--color-brand-blue-pale)] px-3 py-1 text-xs font-bold text-[var(--color-brand-blue)]">
              {activeFilterLabel}: {games.length}
            </span>
            <Link
              href={query ? `/admin/juegos?q=${encodeURIComponent(query)}` : "/admin/juegos"}
              className="admin-button-secondary px-3 py-1.5 text-xs"
            >
              Limpiar filtro
            </Link>
          </>
        ) : query ? (
          <span className="text-sm text-[var(--color-text-muted)]">
            {games.length} resultado{games.length === 1 ? "" : "s"} para “{query}”.
          </span>
        ) : (
          <span className="text-sm text-[var(--color-text-muted)]">
            Mostrando los últimos {games.length} juegos.
          </span>
        )}
      </div>

      <section className="overflow-hidden rounded-md border border-[var(--color-border)] bg-white">
        <div className="grid grid-cols-[1.4fr_0.8fr_0.7fr_0.7fr_0.7fr] gap-4 border-b border-[var(--color-border)] bg-[var(--color-cream)] px-4 py-3 text-xs font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
          <span>Título</span>
          <span>Editorial</span>
          <span>Año</span>
          <span>Estado</span>
          <span>Revisión</span>
        </div>
        <div className="divide-y divide-[var(--color-border)]">
          {games.map((game) => (
            <article
              key={game.id}
              className="grid grid-cols-1 gap-3 px-4 py-3 text-sm md:grid-cols-[1.4fr_0.8fr_0.7fr_0.7fr_0.7fr]"
            >
              <Link
                href={`/admin/juegos/${game.id}`}
                className="font-semibold text-[var(--color-brand-blue)] hover:underline"
              >
                {game.title}
              </Link>
              <span className="text-[var(--color-text-secondary)]">
                {game.is_self_published
                  ? "Autopublicado"
                  : game.publisher?.name || "Sin editorial"}
              </span>
              <span className="text-[var(--color-text-muted)]">
                {game.year_display || game.year_published || "Sin año"}
              </span>
              <span className="text-[var(--color-text-secondary)]">
                {game.content_status}
              </span>
              <span className="flex flex-wrap gap-1.5">
                {game.media.length === 0 && (
                  <span className="rounded-full bg-[#fff0f0] px-2 py-0.5 text-xs font-bold text-[var(--color-brand-red-dark)]">
                    Sin portada
                  </span>
                )}
                {!game.is_verified && game.content_status === "published" && (
                  <span className="rounded-full bg-[var(--color-brand-blue-pale)] px-2 py-0.5 text-xs font-bold text-[var(--color-brand-blue)]">
                    No verificado
                  </span>
                )}
              </span>
            </article>
          ))}
          {games.length === 0 && (
            <p className="px-4 py-8 text-sm text-[var(--color-text-muted)]">
              {query
                ? `No se encontraron juegos para “${query}”.`
                : "No hay juegos para este filtro."}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
