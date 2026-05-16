import type { Metadata } from "next";
import { PersonCard } from "@/components/person/PersonCard";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Creadores Chilenos | Ludoteca Chilena",
  description: "Directorio de autores, ilustradores y diseñadores de juegos de mesa chilenos.",
};

// Mapa de roles en inglés a español para mostrar bonito
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

export default async function PersonasPage() {
  const people = await prisma.person.findMany({
    where: {
      content_status: "published",
      games: { some: { game: { content_status: "published" } } },
    },
    include: {
      games: {
        where: {
          game: { content_status: "published" },
        },
        select: {
          role: true,
          game: {
            select: { id: true, content_status: true }
          }
        }
      },
      media: {
        orderBy: [{ is_primary: "desc" }, { created_at: "desc" }],
        take: 1,
      }
    },
    orderBy: { display_name: "asc" },
  });

  // Mapear roles de juegos publicados.
  const activePeople = people
    .map((person) => {
      const allRoles = person.games
        .map((g) => roleMap[g.role] || g.role);
      
      const uniqueGamesCount = new Set(person.games.map((g) => g.game.id)).size;

      return {
        ...person,
        translatedRoles: allRoles,
        gameCount: uniqueGamesCount,
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
            Directorio de Creadores
          </h1>
          <p style={{ color: "var(--color-text-muted)" }}>
            {activePeople.length} personas involucradas en el diseño y arte de juegos chilenos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activePeople.map((person) => (
            <PersonCard
              key={person.id}
              slug={person.slug}
              displayName={person.display_name}
              roles={person.translatedRoles}
              gameCount={person.gameCount}
              imageUrl={person.photo_url || person.media[0]?.url}
            />
          ))}
        </div>

        {activePeople.length === 0 && (
          <div className="text-center py-20">
            <p className="text-lg font-medium" style={{ color: "var(--color-text-muted)" }}>
              Aún no hay creadores registrados.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
