import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Admin | Ludoteca Chilena",
};

export default async function AdminDashboardPage() {
  const [
    publishedGames,
    draftGames,
    publishers,
    people,
    pendingSuggestions,
    publishedTimelineEvents,
    gamesWithoutPrimaryMedia,
    unverifiedGames,
  ] = await Promise.all([
    prisma.game.count({ where: { content_status: "published" } }),
    prisma.game.count({ where: { content_status: "draft" } }),
    prisma.publisher.count({ where: { content_status: "published" } }),
    prisma.person.count({ where: { content_status: "published" } }),
    prisma.gameSuggestion.count({ where: { is_reviewed: false } }),
    prisma.timelineEvent.count({ where: { content_status: "published" } }),
    prisma.game.count({
      where: {
        content_status: "published",
        media: { none: { is_primary: true } },
      },
    }),
    prisma.game.count({
      where: {
        content_status: "published",
        is_verified: false,
      },
    }),
  ]);

  const recentSuggestions = await prisma.gameSuggestion.findMany({
    where: { is_reviewed: false },
    orderBy: { created_at: "desc" },
    take: 6,
  });

  const stats = [
    { label: "Juegos publicados", value: publishedGames, tone: "blue" },
    { label: "Borradores", value: draftGames, tone: "muted" },
    { label: "Editoriales", value: publishers, tone: "blue" },
    { label: "Creadores", value: people, tone: "blue" },
    { label: "Sugerencias pendientes", value: pendingSuggestions, tone: "red" },
    { label: "Hitos publicados", value: publishedTimelineEvents, tone: "blue" },
  ];

  const reviewQueue = [
    {
      label: "Juegos sin portada principal",
      value: gamesWithoutPrimaryMedia,
      href: "/admin/juegos?filtro=sin-portada",
    },
    {
      label: "Juegos publicados no verificados",
      value: unverifiedGames,
      href: "/admin/juegos?filtro=no-verificados",
    },
    {
      label: "Sugerencias por revisar",
      value: pendingSuggestions,
      href: "/admin/sugerencias",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section className="border-b border-[var(--color-border)] pb-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-brand-red)]">
          Bandeja de curatoría
        </p>
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h2
              className="text-3xl font-bold text-[var(--color-brand-blue)]"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Estado del archivo
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
              Vista de trabajo para priorizar publicaciones, revisar evidencia
              y mantener el catálogo listo para consulta pública.
            </p>
          </div>
          <Link
            href="/admin/sugerencias"
            className="admin-button-primary px-4 py-2.5 text-sm"
          >
            Revisar sugerencias
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-md border border-[var(--color-border)] bg-white p-4"
          >
            <p
              className="text-2xl font-bold"
              style={{
                fontFamily: "var(--font-heading)",
                color:
                  stat.tone === "red"
                    ? "var(--color-brand-red)"
                    : "var(--color-brand-blue)",
              }}
            >
              {stat.value}
            </p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
              {stat.label}
            </p>
          </div>
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-md border border-[var(--color-border)] bg-white">
          <div className="border-b border-[var(--color-border)] px-5 py-4">
            <h3
              className="text-lg font-bold text-[var(--color-brand-blue)]"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Prioridades editoriales
            </h3>
          </div>
          <div className="divide-y divide-[var(--color-border)]">
            {reviewQueue.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-[var(--color-cream)]"
              >
                <span className="text-sm font-semibold text-[var(--color-text-secondary)]">
                  {item.label}
                </span>
                <span className="rounded-full bg-[var(--color-brand-blue-pale)] px-2.5 py-1 text-sm font-bold text-[var(--color-brand-blue)]">
                  {item.value}
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-md border border-[var(--color-border)] bg-white">
          <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
            <h3
              className="text-lg font-bold text-[var(--color-brand-blue)]"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Sugerencias recientes
            </h3>
            <Link
              href="/admin/sugerencias"
              className="text-xs font-bold text-[var(--color-brand-red)] hover:underline"
            >
              Ver todas
            </Link>
          </div>
          <div className="divide-y divide-[var(--color-border)]">
            {recentSuggestions.length > 0 ? (
              recentSuggestions.map((suggestion) => (
                <div key={suggestion.id} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-[var(--color-text)]">
                        {suggestion.title}
                      </p>
                      <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                        {suggestion.submitter_name || "Sin nombre"} ·{" "}
                        {suggestion.year || "Año desconocido"}
                      </p>
                    </div>
                    <span className="rounded-full bg-[#fff0f0] px-2 py-1 text-xs font-bold text-[var(--color-brand-red-dark)]">
                      Pendiente
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="px-5 py-8 text-sm text-[var(--color-text-muted)]">
                No hay sugerencias pendientes.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
