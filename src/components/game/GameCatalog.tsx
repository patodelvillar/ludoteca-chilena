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

type TriState = "all" | "yes" | "no";

const statusLabels: Record<string, string> = {
  available: "Disponible",
  out_of_print: "Agotado",
  lost: "Perdido",
  unknown: "Desconocido",
};

function uniqueSorted(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b, "es"));
}

function decadeForYear(year: number) {
  return Math.floor(year / 10) * 10;
}

export function GameCatalog({ initialGames }: GameCatalogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [mechanic, setMechanic] = useState("");
  const [category, setCategory] = useState("");
  const [person, setPerson] = useState("");
  const [status, setStatus] = useState("");
  const [period, setPeriod] = useState("");
  const [playerCount, setPlayerCount] = useState("");
  const [maxPlaytime, setMaxPlaytime] = useState("");
  const [maxAge, setMaxAge] = useState("");
  const [selfPublished, setSelfPublished] = useState<TriState>("all");
  const [verified, setVerified] = useState<TriState>("all");
  const [cover, setCover] = useState<TriState>("all");

  const filterOptions = useMemo(() => {
    const years = uniqueSorted(
      initialGames
        .map((game) => game.year_published)
        .filter((year): year is number => Boolean(year))
        .map(String),
    ).sort((a, b) => Number(b) - Number(a));

    const decades = uniqueSorted(
      initialGames
        .map((game) => game.year_published)
        .filter((year): year is number => Boolean(year))
        .map((year) => String(decadeForYear(year))),
    ).sort((a, b) => Number(b) - Number(a));

    return {
      mechanics: uniqueSorted(initialGames.flatMap((game) => game.mechanics)),
      categories: uniqueSorted(initialGames.flatMap((game) => game.categories)),
      people: uniqueSorted(initialGames.flatMap((game) => game.people)),
      statuses: uniqueSorted(initialGames.map((game) => game.status)),
      years,
      decades,
    };
  }, [initialGames]);

  const filteredGames = useMemo(() => {
    const lowerSearch = searchTerm.trim().toLowerCase();
    const requestedPlayers = playerCount ? Number(playerCount) : null;
    const requestedPlaytime = maxPlaytime ? Number(maxPlaytime) : null;
    const requestedAge = maxAge ? Number(maxAge) : null;

    return initialGames.filter((game) => {
      if (lowerSearch) {
        const searchable = [
          game.title,
          game.publisher?.name,
          game.year_published?.toString(),
          ...game.mechanics,
          ...game.categories,
          ...game.people,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!searchable.includes(lowerSearch)) return false;
      }

      if (mechanic && !game.mechanics.includes(mechanic)) return false;
      if (category && !game.categories.includes(category)) return false;
      if (person && !game.people.includes(person)) return false;
      if (status && game.status !== status) return false;

      if (period) {
        if (!game.year_published) return false;
        if (period.startsWith("year:") && game.year_published !== Number(period.replace("year:", ""))) return false;
        if (period.startsWith("decade:") && decadeForYear(game.year_published) !== Number(period.replace("decade:", ""))) return false;
      }

      if (requestedPlayers !== null) {
        if (game.min_players && requestedPlayers < game.min_players) return false;
        if (game.max_players && requestedPlayers > game.max_players) return false;
        if (!game.min_players && !game.max_players) return false;
      }

      if (requestedPlaytime !== null) {
        const shortestKnownTime = game.min_playtime ?? game.max_playtime;
        if (!shortestKnownTime || shortestKnownTime > requestedPlaytime) return false;
      }

      if (requestedAge !== null && (!game.min_age || game.min_age > requestedAge)) return false;
      if (selfPublished !== "all" && game.is_self_published !== (selfPublished === "yes")) return false;
      if (verified !== "all" && game.is_verified !== (verified === "yes")) return false;
      if (cover !== "all" && Boolean(game.imageUrl) !== (cover === "yes")) return false;

      return true;
    });
  }, [
    category,
    cover,
    initialGames,
    maxAge,
    maxPlaytime,
    mechanic,
    period,
    person,
    playerCount,
    searchTerm,
    selfPublished,
    status,
    verified,
  ]);

  const hasActiveFilters =
    searchTerm ||
    mechanic ||
    category ||
    person ||
    status ||
    period ||
    playerCount ||
    maxPlaytime ||
    maxAge ||
    selfPublished !== "all" ||
    verified !== "all" ||
    cover !== "all";

  function clearFilters() {
    setSearchTerm("");
    setMechanic("");
    setCategory("");
    setPerson("");
    setStatus("");
    setPeriod("");
    setPlayerCount("");
    setMaxPlaytime("");
    setMaxAge("");
    setSelfPublished("all");
    setVerified("all");
    setCover("all");
  }

  return (
    <>
      <section
        className="mb-8 rounded-xl p-4"
        style={{
          background: "var(--color-white)",
          border: "1px solid var(--color-border)",
        }}
      >
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            <span className="text-sm font-bold" style={{ color: "var(--color-text-muted)" }}>
              Buscar y filtrar
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
              placeholder="Título, editorial, persona, mecánica, categoría o año..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full rounded-lg py-2.5 pl-10 pr-4 text-sm outline-none transition-colors"
              style={{
                background: "var(--color-cream)",
                border: "1px solid var(--color-border)",
                color: "var(--color-text)",
              }}
            />
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <FilterSelect label="Mecánica" value={mechanic} onChange={setMechanic}>
            {filterOptions.mechanics.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </FilterSelect>
          <FilterSelect label="Categoría" value={category} onChange={setCategory}>
            {filterOptions.categories.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </FilterSelect>
          <FilterSelect label="Persona" value={person} onChange={setPerson}>
            {filterOptions.people.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </FilterSelect>
          <FilterSelect label="Estado" value={status} onChange={setStatus}>
            {filterOptions.statuses.map((item) => (
              <option key={item} value={item}>{statusLabels[item] || item}</option>
            ))}
          </FilterSelect>
          <FilterSelect label="Año o década" value={period} onChange={setPeriod}>
            <optgroup label="Décadas">
              {filterOptions.decades.map((item) => (
                <option key={`decade-${item}`} value={`decade:${item}`}>Años {item}</option>
              ))}
            </optgroup>
            <optgroup label="Años">
              {filterOptions.years.map((item) => (
                <option key={`year-${item}`} value={`year:${item}`}>{item}</option>
              ))}
            </optgroup>
          </FilterSelect>
          <FilterInput label="Jugadores" value={playerCount} onChange={setPlayerCount} placeholder="Ej. 4" />
          <FilterInput label="Duración máxima" value={maxPlaytime} onChange={setMaxPlaytime} placeholder="Minutos" />
          <FilterInput label="Edad máxima" value={maxAge} onChange={setMaxAge} placeholder="Ej. 12" />
          <FilterSelect label="Autopublicado" value={selfPublished} onChange={(value) => setSelfPublished(value as TriState)}>
            <option value="yes">Sí</option>
            <option value="no">No</option>
          </FilterSelect>
          <FilterSelect label="Verificado" value={verified} onChange={(value) => setVerified(value as TriState)}>
            <option value="yes">Sí</option>
            <option value="no">No</option>
          </FilterSelect>
          <FilterSelect label="Portada" value={cover} onChange={(value) => setCover(value as TriState)}>
            <option value="yes">Con portada</option>
            <option value="no">Sin portada</option>
          </FilterSelect>
          <div className="flex items-end">
            <button
              type="button"
              onClick={clearFilters}
              disabled={!hasActiveFilters}
              className="w-full rounded-lg border px-4 py-2.5 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-45"
              style={{
                borderColor: "var(--color-border)",
                color: "var(--color-brand-blue)",
                background: "var(--color-white)",
              }}
            >
              Limpiar filtros
            </button>
          </div>
        </div>
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
            Ajusta la búsqueda o limpia algunos filtros.
          </p>
        </div>
      )}
    </>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
        {label}
      </span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className={controlClass}>
        <option value="">Todos</option>
        {children}
      </select>
    </label>
  );
}

function FilterInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
        {label}
      </span>
      <input
        type="number"
        min="0"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={controlClass}
      />
    </label>
  );
}

const controlClass =
  "w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-cream)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-brand-blue)] focus:ring-2 focus:ring-[var(--color-brand-blue-pale)]";
