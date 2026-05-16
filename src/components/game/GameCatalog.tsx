"use client";

import { useState } from "react";
import { GameCard } from "./GameCard";

// Definimos el tipo basado en lo que devuelve Prisma en la página principal
type GameCatalogItem = {
  id: string;
  slug: string;
  title: string;
  year_published: number | null;
  year_certainty: string;
  publisher?: { name: string } | null;
  is_self_published: boolean;
  mechanics: string[];
  categories: string[];
  status: string;
  imageUrl?: string;
};

interface GameCatalogProps {
  initialGames: GameCatalogItem[];
}

export function GameCatalog({ initialGames }: GameCatalogProps) {
  const [searchTerm, setSearchTerm] = useState("");

  // Filtrado simple por título (puede expandirse a autor/editorial luego)
  const filteredGames = initialGames.filter((game) => {
    if (!searchTerm) return true;
    const lowerSearch = searchTerm.toLowerCase();
    
    // Busca en título
    if (game.title.toLowerCase().includes(lowerSearch)) return true;
    
    // Busca en editorial
    if (game.publisher && game.publisher.name.toLowerCase().includes(lowerSearch)) return true;
    
    return false;
  });

  return (
    <>
      {/* Filters and Search */}
      <div
        className="mb-8 p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center"
        style={{
          background: "var(--color-white)",
          border: "1px solid var(--color-border)",
        }}
      >
        <div className="flex items-center gap-2 w-full md:w-auto">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
          <span className="text-sm font-medium whitespace-nowrap" style={{ color: "var(--color-text-muted)" }}>
            Buscar:
          </span>
        </div>

        {/* Search Input */}
        <div className="flex-1 w-full relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-text-muted)"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Escribe el nombre de un juego o editorial..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm outline-none transition-colors"
            style={{
              background: "var(--color-cream)",
              border: "1px solid var(--color-border)",
              color: "var(--color-text)",
            }}
          />
        </div>
      </div>

      {/* Results indicator */}
      {searchTerm && (
        <div className="mb-6 text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
          Mostrando {filteredGames.length} {filteredGames.length === 1 ? "resultado" : "resultados"} para &ldquo;{searchTerm}&rdquo;
        </div>
      )}

      {/* Games Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredGames.map((game) => (
          <GameCard
            key={game.id}
            slug={game.slug}
            title={game.title}
            year={game.year_published}
            yearCertainty={game.year_certainty}
            publisherName={game.publisher?.name}
            isSelfPublished={game.is_self_published}
            mechanics={game.mechanics}
            categories={game.categories}
            status={game.status}
            imageUrl={game.imageUrl}
          />
        ))}
      </div>

      {/* Empty state */}
      {filteredGames.length === 0 && (
        <div className="text-center py-20">
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-text-muted)"
            strokeWidth="1"
            className="mx-auto mb-4 opacity-40"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <p className="text-lg font-medium" style={{ color: "var(--color-text-muted)" }}>
            No se encontraron juegos
          </p>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
            Intenta con otra búsqueda
          </p>
        </div>
      )}
    </>
  );
}
