import type { Metadata } from "next";
import { GameCatalog } from "@/components/game/GameCatalog";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Catálogo de Juegos de Mesa Chilenos",
  description:
    "Explora el catálogo completo de juegos de mesa chilenos documentados en Ludoteca Chilena. Filtra por mecánica, categoría, año y estado.",
};

export default async function JuegosPage() {
  const games = await prisma.game.findMany({
    where: { content_status: "published" },
    include: {
      publisher: true,
      mechanics: { include: { mechanic: true } },
      categories: { include: { category: true } },
      media: { where: { is_primary: true }, take: 1 },
    },
    orderBy: { title: "asc" },
  });

  return (
    <div className="py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <h1
            className="text-3xl sm:text-4xl font-bold mb-2"
            style={{
              fontFamily: "var(--font-heading)",
              color: "var(--color-brand-blue)",
            }}
          >
            Juegos de Mesa Chilenos
          </h1>
          <p style={{ color: "var(--color-text-muted)" }}>
            {games.length} juegos documentados en el archivo
          </p>
        </div>

        <GameCatalog initialGames={games.map(game => ({
          id: game.id,
          slug: game.slug,
          title: game.title,
          year_published: game.year_published,
          year_certainty: game.year_certainty,
          publisher: game.publisher ? { name: game.publisher.name } : null,
          is_self_published: game.is_self_published,
          mechanics: game.mechanics.map(m => m.mechanic.name),
          categories: game.categories.map(c => c.category.name),
          status: game.status,
          imageUrl: game.media[0]?.url
        }))} />
      </div>
    </div>
  );
}
