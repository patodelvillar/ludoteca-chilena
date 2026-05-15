import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { GameCard } from "@/components/game/GameCard";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const publisher = await prisma.publisher.findUnique({
    where: { slug },
  });
  if (!publisher) return { title: "Editorial no encontrada" };

  return {
    title: `${publisher.name} | Ludoteca Chilena`,
    description: `Catálogo de juegos publicados por la editorial chilena ${publisher.name}.`,
  };
}

export default async function PublisherDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const publisher = await prisma.publisher.findUnique({
    where: { slug },
    include: {
      published_games: {
        where: { content_status: "published" },
        include: {
          mechanics: { include: { mechanic: true } },
          categories: { include: { category: true } },
          media: { where: { is_primary: true }, take: 1 },
        },
        orderBy: { year_published: "desc" },
      }
    },
  });

  if (!publisher) notFound();

  const isInactive = publisher.status === "inactive";
  const yearsActive = publisher.founded_year 
    ? `${publisher.founded_year} — ${publisher.closed_year || 'Presente'}`
    : "Año de fundación desconocido";

  return (
    <div className="py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav className="mb-8 flex items-center gap-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
          <Link href="/" className="hover:text-[var(--color-brand-blue)] transition-colors">
            Inicio
          </Link>
          <span>/</span>
          <Link href="/editoriales" className="hover:text-[var(--color-brand-blue)] transition-colors">
            Editoriales
          </Link>
          <span>/</span>
          <span style={{ color: "var(--color-brand-blue)" }}>{publisher.name}</span>
        </nav>

        <div className="mb-12 p-8 rounded-2xl" style={{ border: "1px solid var(--color-border)", background: "var(--color-white)" }}>
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-6 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
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
                  {publisher.status === "active" ? "Activa" : publisher.status === "inactive" ? "Inactiva" : "Desconocido"}
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                {yearsActive}
              </div>
            </div>

            <div className="text-left md:text-right">
              <p className="text-3xl font-bold" style={{ color: "var(--color-brand-red)" }}>{publisher.published_games.length}</p>
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500">Juegos Publicados</p>
            </div>
          </div>
        </div>

        <div>
          <h2
            className="text-2xl font-bold mb-6"
            style={{
              fontFamily: "var(--font-heading)",
              color: "var(--color-brand-blue)",
            }}
          >
            Catálogo
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {publisher.published_games.map((game) => (
              <GameCard
                key={game.id}
                slug={game.slug}
                title={game.title}
                year={game.year_published}
                yearCertainty={game.year_certainty}
                publisherName={publisher.name}
                isSelfPublished={game.is_self_published}
                mechanics={game.mechanics.map((m: any) => m.mechanic.name)}
                categories={game.categories.map((c: any) => c.category.name)}
                status={game.status}
                imageUrl={game.media[0]?.url}
              />
            ))}
          </div>

          {publisher.published_games.length === 0 && (
             <p className="text-gray-500 italic">No hay juegos publicados en el registro.</p>
          )}
        </div>
      </div>
    </div>
  );
}
