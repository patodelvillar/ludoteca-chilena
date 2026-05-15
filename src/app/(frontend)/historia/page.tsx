import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { decadeOf, getDecadeContext } from "@/lib/decadeContext";
import { formatYear } from "@/lib/year";

export const metadata: Metadata = {
  title: "Línea de Tiempo | Ludoteca Chilena",
  description:
    "Recorrido cronológico por el juego de mesa chileno: hitos históricos y publicaciones desde los primeros registros hasta la actualidad.",
};

type GameRow = Awaited<ReturnType<typeof fetchGames>>[number];
type EventRow = Awaited<ReturnType<typeof fetchEvents>>[number];

interface BaseItem {
  id: string;
  year: number | null;
  year_certainty: string;
  year_display: string | null;
}
interface GameItem extends BaseItem {
  kind: "game";
  game: GameRow;
}
interface EventItem extends BaseItem {
  kind: "event";
  event: EventRow;
}
type TimelineItem = GameItem | EventItem;

async function fetchGames(withYear: boolean) {
  return prisma.game.findMany({
    where: {
      content_status: "published",
      year_published: withYear ? { not: null } : null,
    },
    include: {
      publisher: true,
      media: { where: { is_primary: true }, take: 1 },
    },
    orderBy: withYear ? { year_published: "asc" } : { title: "asc" },
  });
}

async function fetchEvents(withYear: boolean) {
  return prisma.timelineEvent.findMany({
    where: {
      content_status: "published",
      year: withYear ? { not: null } : null,
    },
    include: {
      game: true,
      person: true,
      publisher: true,
    },
    orderBy: withYear ? { year: "asc" } : { title: "asc" },
  });
}

export default async function TimelinePage() {
  const [gamesWithYear, gamesNoYear, eventsWithYear, eventsNoYear] = await Promise.all([
    fetchGames(true),
    fetchGames(false),
    fetchEvents(true),
    fetchEvents(false),
  ]);

  const items: TimelineItem[] = [
    ...gamesWithYear.map<GameItem>((g) => ({
      kind: "game",
      id: g.id,
      year: g.year_published,
      year_certainty: g.year_certainty,
      year_display: g.year_display,
      game: g,
    })),
    ...eventsWithYear.map<EventItem>((e) => ({
      kind: "event",
      id: e.id,
      year: e.year,
      year_certainty: "exact",
      year_display: e.year_display,
      event: e,
    })),
  ];

  // Group by decade
  const byDecade = new Map<number, TimelineItem[]>();
  for (const item of items) {
    if (item.year == null) continue;
    const d = decadeOf(item.year);
    if (!byDecade.has(d)) byDecade.set(d, []);
    byDecade.get(d)!.push(item);
  }

  // Sort within each decade
  for (const arr of byDecade.values()) {
    arr.sort((a, b) => {
      const ay = a.year ?? 0;
      const by = b.year ?? 0;
      if (ay !== by) return ay - by;
      // mismo año: TimelineEvent antes que Game
      if (a.kind === "event" && b.kind === "game") return -1;
      if (a.kind === "game" && b.kind === "event") return 1;
      return 0;
    });
  }

  // Decades descending (más reciente primero)
  const decades = [...byDecade.keys()].sort((a, b) => b - a);

  const totalDocumented = items.length;
  const totalEvents = eventsWithYear.length + eventsNoYear.length;
  const totalGames = gamesWithYear.length + gamesNoYear.length;

  return (
    <div className="py-10 sm:py-14">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <header className="mb-10 sm:mb-14 text-center">
          <p
            className="text-xs sm:text-sm uppercase tracking-[0.2em] font-semibold mb-3"
            style={{ color: "var(--color-brand-red)" }}
          >
            Archivo histórico
          </p>
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 leading-tight"
            style={{
              fontFamily: "var(--font-heading)",
              color: "var(--color-brand-blue)",
            }}
          >
            Línea de tiempo
          </h1>
          <p
            className="text-lg max-w-2xl mx-auto leading-relaxed"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Un recorrido por la historia del juego de mesa chileno: editoriales, diseñadores, hitos y publicaciones documentadas, agrupados por década.
          </p>
          <div
            className="mt-5 inline-flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-sm font-semibold"
            style={{ color: "var(--color-text-muted)" }}
          >
            <span>
              <span style={{ color: "var(--color-brand-blue)" }}>{totalGames}</span> juegos
            </span>
            {totalEvents > 0 && (
              <span>
                <span style={{ color: "var(--color-brand-red)" }}>{totalEvents}</span> hitos
              </span>
            )}
            <span>
              <span style={{ color: "var(--color-brand-blue)" }}>{decades.length}</span>{" "}
              décadas documentadas
            </span>
          </div>
        </header>

        {/* Sticky decade nav */}
        {decades.length > 0 && (
          <nav
            className="sticky top-0 z-10 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 mb-10 border-b backdrop-blur"
            style={{
              background: "color-mix(in srgb, var(--color-cream) 90%, transparent)",
              borderColor: "var(--color-border)",
            }}
            aria-label="Navegación por década"
          >
            <ul className="flex gap-2 overflow-x-auto scrollbar-thin">
              {decades.map((d) => (
                <li key={d}>
                  <a
                    href={`#decade-${d}`}
                    className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors hover:bg-[var(--color-brand-blue-pale)]"
                    style={{ color: "var(--color-brand-blue)" }}
                  >
                    {d}s
                  </a>
                </li>
              ))}
              {(gamesNoYear.length > 0 || eventsNoYear.length > 0) && (
                <li>
                  <a
                    href="#sin-fecha"
                    className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors hover:bg-[var(--color-brand-blue-pale)]"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    Sin fecha
                  </a>
                </li>
              )}
            </ul>
          </nav>
        )}

        {/* Decades */}
        <div className="space-y-20">
          {decades.map((decade) => (
            <DecadeSection
              key={decade}
              decade={decade}
              items={byDecade.get(decade) ?? []}
            />
          ))}
        </div>

        {/* Unknown year section */}
        {(gamesNoYear.length > 0 || eventsNoYear.length > 0) && (
          <UnknownYearSection
            id="sin-fecha"
            games={gamesNoYear}
            events={eventsNoYear}
          />
        )}

        {totalDocumented === 0 && (
          <div
            className="rounded-2xl border p-10 text-center"
            style={{
              background: "var(--color-brand-blue-pale)",
              borderColor: "var(--color-border)",
              color: "var(--color-text-muted)",
            }}
          >
            <p>Aún no hay contenido publicado para mostrar en la línea de tiempo.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function DecadeSection({ decade, items }: { decade: number; items: TimelineItem[] }) {
  const ctx = getDecadeContext(decade);

  // Separar items con year_certainty === 'decade' (sin año específico) del resto
  const decadeOnly = items.filter((i) => i.year_certainty === "decade");
  const dated = items.filter((i) => i.year_certainty !== "decade");

  // Agrupar items con año exacto/circa por year
  const byYear = new Map<number, TimelineItem[]>();
  for (const item of dated) {
    if (item.year == null) continue;
    if (!byYear.has(item.year)) byYear.set(item.year, []);
    byYear.get(item.year)!.push(item);
  }
  const years = [...byYear.keys()].sort((a, b) => a - b);

  return (
    <section
      id={`decade-${decade}`}
      className="scroll-mt-20"
      aria-labelledby={`decade-${decade}-heading`}
    >
      <header className="mb-8 pb-4 border-b" style={{ borderColor: "var(--color-border)" }}>
        <p
          className="text-xs uppercase tracking-[0.2em] font-semibold mb-2"
          style={{ color: "var(--color-brand-red)" }}
        >
          {decade}–{decade + 9}
        </p>
        <h2
          id={`decade-${decade}-heading`}
          className="text-3xl sm:text-4xl font-bold mb-3"
          style={{
            fontFamily: "var(--font-heading)",
            color: "var(--color-brand-blue)",
          }}
        >
          {ctx.label}
        </h2>
        {ctx.intro && (
          <p
            className="text-base leading-relaxed max-w-3xl"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {ctx.intro}
          </p>
        )}
      </header>

      <div className="relative pl-8 sm:pl-10 border-l-2 space-y-12" style={{ borderColor: "var(--color-brand-blue-pale)" }}>
        {decadeOnly.length > 0 && (
          <YearGroup
            label={`Años ${decade}`}
            subtitle="Sin año específico"
            items={decadeOnly}
            muted
          />
        )}

        {years.map((y) => (
          <YearGroup key={y} label={y.toString()} items={byYear.get(y) ?? []} />
        ))}
      </div>
    </section>
  );
}

function YearGroup({
  label,
  subtitle,
  items,
  muted = false,
}: {
  label: string;
  subtitle?: string;
  items: TimelineItem[];
  muted?: boolean;
}) {
  return (
    <div className="relative">
      <span
        className="absolute -left-[42px] sm:-left-[50px] top-1 w-5 h-5 rounded-full ring-4 ring-[var(--color-cream)]"
        style={{
          background: muted ? "var(--color-brand-blue-light)" : "var(--color-brand-red)",
        }}
        aria-hidden
      />
      <div className="mb-4">
        <h3
          className="text-xl sm:text-2xl font-bold"
          style={{
            fontFamily: "var(--font-heading)",
            color: muted ? "var(--color-text-muted)" : "var(--color-brand-blue)",
          }}
        >
          {label}
        </h3>
        {subtitle && (
          <p className="text-xs uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
            {subtitle}
          </p>
        )}
      </div>

      <ul className="space-y-3">
        {items.map((item) =>
          item.kind === "event" ? (
            <EventCard key={item.id} item={item} />
          ) : (
            <GameCard key={item.id} item={item} />
          ),
        )}
      </ul>
    </div>
  );
}

function EventCard({ item }: { item: EventItem }) {
  const { event } = item;
  return (
    <li
      className="rounded-2xl p-5 border-l-4"
      style={{
        background: "var(--color-brand-blue-pale)",
        borderColor: "var(--color-brand-red)",
      }}
    >
      <p
        className="text-xs uppercase tracking-[0.15em] font-semibold mb-1"
        style={{ color: "var(--color-brand-red)" }}
      >
        Hito
      </p>
      <h4
        className="text-lg font-bold mb-2"
        style={{
          fontFamily: "var(--font-heading)",
          color: "var(--color-brand-blue)",
        }}
      >
        {event.title}
      </h4>
      {event.description && (
        <p
          className="text-sm leading-relaxed"
          style={{ color: "var(--color-text-secondary)" }}
        >
          {event.description}
        </p>
      )}
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs">
        {event.game && (
          <Link
            href={`/juegos/${event.game.slug}`}
            className="font-semibold hover:underline"
            style={{ color: "var(--color-brand-red)" }}
          >
            → {event.game.title}
          </Link>
        )}
        {event.publisher && (
          <Link
            href={`/editoriales/${event.publisher.slug}`}
            className="font-semibold hover:underline"
            style={{ color: "var(--color-brand-red)" }}
          >
            → {event.publisher.name}
          </Link>
        )}
        {event.person && (
          <Link
            href={`/personas/${event.person.slug}`}
            className="font-semibold hover:underline"
            style={{ color: "var(--color-brand-red)" }}
          >
            → {event.person.display_name}
          </Link>
        )}
      </div>
    </li>
  );
}

function GameCard({ item }: { item: GameItem }) {
  const { game } = item;
  const yearLabel = formatYear(item.year, item.year_certainty, item.year_display);
  const isApprox = item.year_certainty === "circa" || item.year_certainty === "decade";

  return (
    <li>
      <Link
        href={`/juegos/${game.slug}`}
        className="group flex items-center gap-4 p-3 rounded-2xl border bg-white hover:border-[var(--color-brand-blue)] hover:shadow-sm transition-all"
        style={{ borderColor: "var(--color-border)" }}
      >
        <div
          className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0"
          style={{ background: "var(--color-brand-blue-pale)" }}
        >
          {game.media[0]?.url ? (
            <img
              src={game.media[0].url}
              alt={game.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--color-brand-blue-light)"
                strokeWidth="1.5"
                className="opacity-40"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4
            className="font-bold leading-tight transition-colors line-clamp-2"
            style={{ color: "var(--color-brand-blue)", fontFamily: "var(--font-heading)" }}
          >
            {game.title}
          </h4>
          <div
            className="flex flex-wrap gap-x-2 gap-y-0.5 text-xs mt-0.5"
            style={{ color: "var(--color-text-muted)" }}
          >
            {isApprox && <span>{yearLabel}</span>}
            {game.publisher && !game.is_self_published && (
              <span className="truncate">{game.publisher.name}</span>
            )}
            {game.is_self_published && <span>Autopublicado</span>}
          </div>
        </div>
      </Link>
    </li>
  );
}

function UnknownYearSection({
  id,
  games,
  events,
}: {
  id: string;
  games: GameRow[];
  events: EventRow[];
}) {
  return (
    <section
      id={id}
      className="mt-20 pt-12 border-t border-dashed scroll-mt-20"
      style={{ borderColor: "var(--color-border)" }}
    >
      <header className="mb-8">
        <p
          className="text-xs uppercase tracking-[0.2em] font-semibold mb-2"
          style={{ color: "var(--color-text-muted)" }}
        >
          Sin fecha conocida
        </p>
        <h2
          className="text-2xl sm:text-3xl font-bold mb-2"
          style={{
            fontFamily: "var(--font-heading)",
            color: "var(--color-text-muted)",
          }}
        >
          Año por documentar
        </h2>
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
          Registros cuya fecha de publicación o aparición aún no ha sido establecida.
        </p>
      </header>

      {events.length > 0 && (
        <ul className="space-y-3 mb-6">
          {events.map((e) => (
            <EventCard
              key={e.id}
              item={{
                kind: "event",
                id: e.id,
                year: null,
                year_certainty: "unknown",
                year_display: e.year_display,
                event: e,
              }}
            />
          ))}
        </ul>
      )}

      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 opacity-90">
        {games.map((g) => (
          <GameCard
            key={g.id}
            item={{
              kind: "game",
              id: g.id,
              year: null,
              year_certainty: "unknown",
              year_display: g.year_display,
              game: g,
            }}
          />
        ))}
      </ul>
    </section>
  );
}
