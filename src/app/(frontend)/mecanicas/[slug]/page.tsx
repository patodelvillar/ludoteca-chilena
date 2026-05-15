import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { GameCard } from "@/components/game/GameCard";
import Link from "next/link";

interface PageProps { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const mechanic = await prisma.mechanic.findUnique({ where: { slug } });
  if (!mechanic) return { title: "No encontrado" };
  return { title: `${mechanic.name} | Ludoteca Chilena` };
}

export default async function MechanicDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const mechanic = await prisma.mechanic.findUnique({
    where: { slug },
    include: {
      games: {
        include: {
          game: {
            include: {
              publisher: true,
              mechanics: { include: { mechanic: true } },
              categories: { include: { category: true } },
              media: { where: { is_primary: true }, take: 1 }
            }
          }
        }
      }
    }
  });

  if (!mechanic) notFound();

  const games = mechanic.games.map(g => g.game).sort((a, b) => a.title.localeCompare(b.title));

  return (
    <div className="py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav className="mb-6 flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
          <Link href="/" className="hover:text-[var(--color-brand-blue)] transition-colors">Inicio</Link>
          <span>/</span>
          <Link href="/mecanicas" className="hover:text-[var(--color-brand-blue)] transition-colors">Mecánicas</Link>
          <span>/</span>
          <span className="text-[var(--color-brand-blue)]">{mechanic.name}</span>
        </nav>
        
        <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-[var(--color-brand-blue)]" style={{ fontFamily: "var(--font-heading)" }}>
          {mechanic.name}
        </h1>
        <p className="text-[var(--color-text-secondary)] mb-8">
          {games.length} {games.length === 1 ? 'juego encontrado' : 'juegos encontrados'} con esta mecánica.
        </p>

        {games.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {games.map((game) => (
              <GameCard
                key={game.id}
                slug={game.slug}
                title={game.title}
                year={game.year_published}
                yearCertainty={game.year_certainty}
                publisherName={game.publisher?.name}
                isSelfPublished={game.is_self_published}
                mechanics={game.mechanics.map((m) => m.mechanic.name)}
                categories={game.categories.map((c) => c.category.name)}
                imageUrl={game.media[0]?.url}
                status={game.status}
              />
            ))}
          </div>
        ) : (
          <p className="text-[var(--color-text-muted)] italic">Aún no hay juegos registrados con esta mecánica.</p>
        )}
      </div>
    </div>
  );
}
