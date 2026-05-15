import type { Metadata } from "next";
import { PublisherCard } from "@/components/publisher/PublisherCard";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Editoriales Chilenas | Ludoteca Chilena",
  description: "Directorio de editoriales de juegos de mesa en Chile.",
};

export default async function EditorialesPage() {
  const publishers = await prisma.publisher.findMany({
    include: {
      published_games: {
        select: {
          content_status: true,
        }
      }
    },
    orderBy: { name: "asc" },
  });

  const activePublishers = publishers
    .filter(pub => pub.published_games.some(g => g.content_status === "published"))
    .map(pub => {
      const publishedGamesCount = pub.published_games.filter(g => g.content_status === "published").length;
      return {
        ...pub,
        gameCount: publishedGamesCount,
      };
    });

  return (
    <div className="py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1
            className="text-3xl sm:text-4xl font-bold mb-2"
            style={{
              fontFamily: "var(--font-heading)",
              color: "var(--color-brand-blue)",
            }}
          >
            Directorio de Editoriales
          </h1>
          <p style={{ color: "var(--color-text-muted)" }}>
            {activePublishers.length} editoriales nacionales documentadas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {activePublishers.map((pub) => (
            <PublisherCard
              key={pub.id}
              slug={pub.slug}
              name={pub.name}
              status={pub.status}
              gameCount={pub.gameCount}
            />
          ))}
        </div>

        {activePublishers.length === 0 && (
          <div className="text-center py-20">
            <p className="text-lg font-medium" style={{ color: "var(--color-text-muted)" }}>
              Aún no hay editoriales registradas.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
