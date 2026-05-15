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
  const person = await prisma.person.findUnique({
    where: { slug },
  });
  if (!person) return { title: "Persona no encontrada" };

  return {
    title: `${person.display_name} | Ludoteca Chilena`,
    description: person.biography || `Conoce los juegos de mesa chilenos creados por ${person.display_name}.`,
  };
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

export default async function PersonDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const person = await prisma.person.findUnique({
    where: { slug },
    include: {
      games: {
        include: {
          game: {
            include: {
              publisher: true,
              mechanics: { include: { mechanic: true } },
              categories: { include: { category: true } },
              media: { where: { is_primary: true }, take: 1 },
            }
          }
        }
      },
      media: true,
    },
  });

  if (!person) notFound();

  // Filtrar solo juegos publicados y deduplicar por si tiene más de un rol en el mismo juego
  const publishedGames = person.games.filter(g => g.game.content_status === "published");
  const uniqueGamesMap = new Map();
  
  publishedGames.forEach(g => {
    if (!uniqueGamesMap.has(g.game.id)) {
      uniqueGamesMap.set(g.game.id, {
        ...g.game,
        personRoles: [roleMap[g.role] || g.role]
      });
    } else {
      const existing = uniqueGamesMap.get(g.game.id);
      existing.personRoles.push(roleMap[g.role] || g.role);
    }
  });

  const uniqueGames = Array.from(uniqueGamesMap.values());
  const allRoles = Array.from(new Set(publishedGames.map(g => roleMap[g.role] || g.role)));
  const imageUrl = person.photo_url || person.media[0]?.url;

  return (
    <div className="py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav className="mb-8 flex items-center gap-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
          <Link href="/" className="hover:text-[var(--color-brand-blue)] transition-colors">
            Inicio
          </Link>
          <span>/</span>
          <Link href="/personas" className="hover:text-[var(--color-brand-blue)] transition-colors">
            Creadores
          </Link>
          <span>/</span>
          <span style={{ color: "var(--color-brand-blue)" }}>{person.display_name}</span>
        </nav>

        <div className="mb-12 flex flex-col md:flex-row gap-8 items-start">
          <div
            className="w-32 h-32 md:w-48 md:h-48 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center"
            style={{
              background: "var(--color-brand-blue-pale)",
              border: "4px solid var(--color-brand-blue-light)",
            }}
          >
            {imageUrl ? (
              <img src={imageUrl} alt={person.display_name} className="w-full h-full object-cover" />
            ) : (
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand-blue-light)" strokeWidth="1">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            )}
          </div>

          <div className="flex-1">
            <h1
              className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3"
              style={{
                fontFamily: "var(--font-heading)",
                color: "var(--color-brand-blue)",
              }}
            >
              {person.display_name}
            </h1>
            
            <div className="flex flex-wrap gap-2 mb-6">
              {allRoles.map(role => (
                <span key={role} className="px-3 py-1 bg-gray-100 text-sm font-semibold rounded-full" style={{ color: "var(--color-brand-red)" }}>
                  {role}
                </span>
              ))}
            </div>

            {person.biography && (
              <div className="prose-ludoteca max-w-3xl">
                <p>{person.biography}</p>
              </div>
            )}
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
            Juegos publicados ({uniqueGames.length})
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {uniqueGames.map((game) => (
              <div key={game.id} className="relative">
                <GameCard
                  slug={game.slug}
                  title={game.title}
                  year={game.year_published}
                  yearCertainty={game.year_certainty}
                  publisherName={game.publisher?.name}
                  isSelfPublished={game.is_self_published}
                  mechanics={game.mechanics.map((m: any) => m.mechanic.name)}
                  categories={game.categories.map((c: any) => c.category.name)}
                  status={game.status}
                  imageUrl={game.media[0]?.url}
                />
                <div className="absolute -top-3 -right-3 z-10 px-3 py-1 text-xs font-bold text-white shadow-md rounded-full" style={{ background: "var(--color-brand-red)" }}>
                  {game.personRoles.join(", ")}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
