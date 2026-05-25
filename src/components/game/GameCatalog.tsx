"use client";

import { useMemo, useState } from "react";
import { GameCard } from "./GameCard";

type GameCatalogItem = {
  id: string;
  slug: string;
  title: string;
  year_published: number | null;
  year_certainty: string;
  min_players: number | null;
  max_players: number | null;
  min_playtime: number | null;
  max_playtime: number | null;
  min_age: number | null;
  publisher?: { name: string } | null;
  is_self_published: boolean;
  is_verified: boolean;
  mechanics: string[];
  categories: string[];
  people: string[];
  status: string;
  imageUrl?: string | null;
};

interface GameCatalogProps {
  initialGames: GameCatalogItem[];
}

const statusAliases: Record<string, string> = {
  disponible: "available",
  available: "available",
  agotado: "out_of_print",
  descatalogado: "out_of_print",
  outofprint: "out_of_print",
  perdido: "lost",
  lost: "lost",
  desconocido: "unknown",
  unknown: "unknown",
};

function normalize(value: string | number | null | undefined) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function decadeForYear(year: number) {
  return Math.floor(year / 10) * 10;
}

function splitTerms(query: string) {
  return query
    .split(",")
    .map((term) => normalize(term))
    .filter(Boolean);
}

function numberFromTerm(term: string) {
  const match = term.match(/\d+/);
  return match ? Number(match[0]) : null;
}

function matchesRange(value: number, min: number | null, max: number | null) {
  if (min !== null && max !== null) return value >= min && value <= max;
  if (min !== null) return value === min;
  if (max !== null) return value === max;
  return false;
}

function matchesTerm(game: GameCatalogItem, term: string) {
  const number = numberFromTerm(term);
  const searchableText = [
    game.title,
    game.publisher?.name,
    game.year_published,
    game.year_published ? `anos ${decadeForYear(game.year_published)}` : null,
    game.is_self_published ? "autopublicado auto publicado independiente" : null,
    game.is_verified ? "verificado" : "no verificado",
    game.imageUrl ? "con portada" : "sin portada",
    statusLabel(game.status),
    ...game.mechanics,
    ...game.categories,
    ...game.people,
  ]
    .map(normalize)
    .join(" ");

  if (searchableText.includes(term)) return true;

  if (number !== null) {
    if (number >= 1800 && number <= new Date().getFullYear() + 5) {
      if (game.year_published === number) return true;
      if (game.year_published && decadeForYear(game.year_published) === number) return true;
    }

    if (/(jugador|jugadores|player|players)/.test(term)) {
      const min = game.min_players;
      const max = game.max_players;
      if ((min || max) && (!min || number >= min) && (!max || number <= max)) return true;
    }

    if (/(min|mins|minuto|minutos|duracion|duración|tiempo)/.test(term)) {
      if (matchesRange(number, game.min_playtime, game.max_playtime)) return true;
    }

    if (/(edad|anos|años|\\+|mayores)/.test(term) && game.min_age !== null && game.min_age <= number) {
      return true;
    }
  }

  const statusMatch = statusAliases[term.replaceAll(" ", "")] || statusAliases[term];
  if (statusMatch && game.status === statusMatch) return true;

  if ((term === "autopublicado" || term === "auto publicado" || term === "independiente") && game.is_self_published) {
    return true;
  }

  if ((term === "no autopublicado" || term === "editorial") && !game.is_self_published) {
    return true;
  }

  if (term === "verificado" && game.is_verified) return true;
  if ((term === "no verificado" || term === "sin verificar") && !game.is_verified) return true;
  if (term === "con portada" && Boolean(game.imageUrl)) return true;
  if (term === "sin portada" && !game.imageUrl) return true;

  return false;
}

function statusLabel(status: string) {
  switch (status) {
    case "available":
      return "Disponible";
    case "out_of_print":
      return "Agotado";
    case "lost":
      return "Perdido";
    case "unknown":
      return "Desconocido";
    default:
      return status;
  }
}

export function GameCatalog({ initialGames }: GameCatalogProps) {
  const [query, setQuery] = useState("");
  const terms = useMemo(() => splitTerms(query), [query]);

  const filteredGames = useMemo(() => {
    if (terms.length === 0) return initialGames;
    return initialGames.filter((game) => terms.every((term) => matchesTerm(game, term)));
  }, [initialGames, terms]);

  return (
    <>
      <section
        className="mb-8 rounded-xl p-4"
        style={{
          background: "var(--color-white)",
          border: "1px solid var(--color-border)",
        }}
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            <span className="text-sm font-bold" style={{ color: "var(--color-text-muted)" }}>
              Buscar
            </span>
          </div>

          <div className="relative flex-1">
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
              placeholder="Ej. 2025, estrategia, rodrigo, 4 jugadores, sin portada"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-full rounded-lg py-2.5 pl-10 pr-24 text-sm outline-none transition-colors"
              style={{
                background: "var(--color-cream)",
                border: "1px solid var(--color-border)",
                color: "var(--color-text)",
              }}
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-3 py-1.5 text-xs font-bold transition hover:bg-white"
                style={{ color: "var(--color-brand-blue)" }}
              >
                Limpiar
              </button>
            )}
          </div>
        </div>

        {terms.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {terms.map((term) => (
              <span
                key={term}
                className="rounded-full px-2.5 py-1 text-xs font-bold"
                style={{
                  background: "var(--color-brand-blue-pale)",
                  color: "var(--color-brand-blue)",
                }}
              >
                {term}
              </span>
            ))}
          </div>
        )}
      </section>

      <div className="mb-6 text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
        Mostrando {filteredGames.length} de {initialGames.length} juegos
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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

      {filteredGames.length === 0 && (
        <div className="py-20 text-center">
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
          <p className="mt-1 text-sm" style={{ color: "var(--color-text-muted)" }}>
            Prueba separando menos criterios por coma.
          </p>
        </div>
      )}
    </>
  );
}
