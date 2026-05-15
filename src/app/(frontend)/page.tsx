import Link from "next/link";
import { GameCard } from "@/components/game/GameCard";
import { StatCard } from "@/components/ui/StatCard";
import { prisma } from "@/lib/prisma";

// Página dinámica — los juegos destacados son aleatorios en cada request
export const dynamic = "force-dynamic";

// Icons for stats
function DiceIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand-blue)" strokeWidth="1.5">
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <circle cx="8.5" cy="8.5" r="1.5" fill="var(--color-brand-blue)" />
      <circle cx="15.5" cy="8.5" r="1.5" fill="var(--color-brand-blue)" />
      <circle cx="8.5" cy="15.5" r="1.5" fill="var(--color-brand-blue)" />
      <circle cx="15.5" cy="15.5" r="1.5" fill="var(--color-brand-blue)" />
    </svg>
  );
}

function PeopleIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand-blue)" strokeWidth="1.5">
      <circle cx="9" cy="7" r="3" />
      <path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M21 21v-1.5a3 3 0 00-3-3h-1" />
    </svg>
  );
}

function BuildingIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand-blue)" strokeWidth="1.5">
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <path d="M9 6h2M13 6h2M9 10h2M13 10h2M9 14h2M13 14h2" />
      <path d="M9 18h6v4H9z" />
    </svg>
  );
}

export default async function HomePage() {
  const [gameCount, publisherCount, personCount] = await Promise.all([
    prisma.game.count({ where: { content_status: "published" } }),
    prisma.publisher.count(),
    prisma.person.count(),
  ]);

  // Selección aleatoria: 1ª query trae los IDs ordenados al azar (barata),
  // 2ª query trae los 6 con relaciones incluidas.
  const randomIds = await prisma.$queryRaw<{ id: string }[]>`
    SELECT id FROM "Game"
    WHERE content_status = 'published'
    ORDER BY RANDOM()
    LIMIT 6
  `;
  const ids = randomIds.map((r) => r.id);
  const fetched = await prisma.game.findMany({
    where: { id: { in: ids } },
    include: {
      publisher: true,
      mechanics: { include: { mechanic: true } },
      categories: { include: { category: true } },
      media: { where: { is_primary: true }, take: 1 },
    },
  });
  // Preservar el orden aleatorio (Prisma devuelve en orden de DB)
  const featuredGames = ids
    .map((id) => fetched.find((g) => g.id === id))
    .filter((g): g is (typeof fetched)[number] => Boolean(g));

  return (
    <div>
      {/* Hero Section */}
      <section
        className="relative overflow-hidden py-20 sm:py-28 lg:py-36"
        style={{ background: "var(--color-brand-blue)" }}
      >
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-10"
            style={{ background: "var(--color-brand-red)" }}
          />
          <div
            className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full opacity-5"
            style={{ background: "white" }}
          />
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          {/* Star accent */}
          <div className="flex justify-center mb-6">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="var(--color-brand-red)"
              className="animate-star-pulse"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>

          <h1
            className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight mb-6 animate-fade-in-up"
            style={{
              fontFamily: "var(--font-heading)",
              color: "white",
            }}
          >
            Ludoteca{" "}
            <span style={{ color: "var(--color-brand-red-light)" }}>
              Chilena
            </span>
          </h1>

          <p
            className="text-lg sm:text-xl max-w-2xl mx-auto mb-10 animate-fade-in-up stagger-1"
            style={{ color: "rgba(255,255,255,0.8)" }}
          >
            Archivo histórico digital del juego de mesa chileno. Preservando,
            organizando y difundiendo el patrimonio lúdico de Chile.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fade-in-up stagger-2">
            <Link
              href="/juegos"
              className="inline-flex items-center justify-center gap-2 rounded-xl px-8 py-4 text-base font-semibold transition-all hover:scale-105 hover:shadow-lg"
              style={{ background: "white", color: "var(--color-brand-blue)" }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              Explorar catálogo
            </Link>
            <Link
              href="/historia"
              className="inline-flex items-center justify-center gap-2 rounded-xl px-8 py-4 text-base font-semibold transition-all hover:scale-105 hover:bg-white/10"
              style={{
                color: "white",
                border: "2px solid rgba(255,255,255,0.8)",
                background: "transparent",
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              Línea de tiempo
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative -mt-12 z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            value={gameCount}
            label="Juegos documentados"
            icon={<DiceIcon />}
            delay={0}
          />
          <StatCard
            value={personCount}
            label="Creadores"
            icon={<PeopleIcon />}
            delay={150}
          />
          <StatCard
            value={publisherCount}
            label="Editoriales"
            icon={<BuildingIcon />}
            delay={300}
          />
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center mb-12">
            <h2
              className="text-3xl sm:text-4xl font-bold mb-4"
              style={{
                fontFamily: "var(--font-heading)",
                color: "var(--color-brand-blue)",
              }}
            >
              ¿Qué es Ludoteca Chilena?
            </h2>
            <p
              className="text-lg leading-relaxed"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Nace de una investigación académica con el objetivo de construir el
              primer archivo relacional profundo del juego de mesa chileno. Cada
              juego, persona, editorial y mecánica están interconectados, con
              trazabilidad a fuentes bibliográficas y galería documental
              histórica.
            </p>
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: "📚",
                title: "Archivo Histórico",
                desc: "Documentamos juegos desde los años 70 hasta hoy, con contexto histórico y fuentes verificables.",
              },
              {
                icon: "🔗",
                title: "Relacional",
                desc: "Cada juego conecta con sus creadores, editoriales, mecánicas y categorías en una red navegable.",
              },
              {
                icon: "🇨🇱",
                title: "100% Chileno",
                desc: "El primer esfuerzo sistemático por catalogar todo el patrimonio lúdico nacional.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="p-6 rounded-2xl text-center"
                style={{
                  background: "var(--color-white)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <span className="text-4xl mb-4 block">{feature.icon}</span>
                <h3
                  className="text-lg font-bold mb-2"
                  style={{
                    fontFamily: "var(--font-heading)",
                    color: "var(--color-brand-blue)",
                  }}
                >
                  {feature.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Games Section */}
      <section
        className="py-16 sm:py-20"
        style={{ background: "var(--color-white)" }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2
                className="text-3xl sm:text-4xl font-bold mb-2"
                style={{
                  fontFamily: "var(--font-heading)",
                  color: "var(--color-brand-blue)",
                }}
              >
                Juegos Destacados
              </h2>
              <p style={{ color: "var(--color-text-muted)" }}>
                Algunos de los juegos de mesa chilenos en nuestro archivo
              </p>
            </div>
            <Link
              href="/juegos"
              className="hidden sm:inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold transition-all hover:scale-105"
              style={{ background: "var(--color-brand-blue)", color: "white" }}
            >
              Ver todos
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredGames.map((game) => (
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
                status={game.status}
                imageUrl={game.media[0]?.url}
              />
            ))}
          </div>

          {/* Mobile CTA */}
          <div className="mt-8 text-center sm:hidden">
            <Link
              href="/juegos"
              className="inline-flex items-center gap-2 rounded-xl px-8 py-3 text-sm font-semibold text-white"
              style={{ background: "var(--color-brand-blue)" }}
            >
              Ver todos los juegos
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <div
            className="p-10 sm:p-14 rounded-3xl relative overflow-hidden"
            style={{ background: "var(--color-brand-blue)" }}
          >
            <div
              className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 -translate-y-1/2 translate-x-1/2"
              style={{ background: "var(--color-brand-red)" }}
            />
            <h2
              className="text-2xl sm:text-3xl font-bold mb-4 relative"
              style={{
                fontFamily: "var(--font-heading)",
                color: "white",
              }}
            >
              ¿Conoces un juego que no está aquí?
            </h2>
            <p
              className="text-base mb-8 max-w-xl mx-auto relative"
              style={{ color: "rgba(255,255,255,0.8)" }}
            >
              Nuestro archivo crece gracias a la comunidad. Si conoces un juego
              de mesa chileno que no hemos documentado, cuéntanos.
            </p>
            <Link
              href="/sugerir"
              className="inline-flex items-center gap-2 rounded-xl px-8 py-4 text-base font-semibold transition-all hover:scale-105 hover:shadow-lg relative"
              style={{ background: "white", color: "var(--color-brand-blue)" }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Sugerir un juego
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
