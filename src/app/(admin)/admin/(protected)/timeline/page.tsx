import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { AdminSectionHeader } from "@/components/admin/AdminSectionHeader";
import { deleteTimelineEvent } from "./actions";
import { TimelineEventForm } from "./TimelineEventForm";

export const metadata: Metadata = {
  title: "Historia | Admin",
};

export default async function AdminTimelinePage() {
  const events = await prisma.timelineEvent.findMany({
    orderBy: [{ year: "desc" }, { created_at: "desc" }],
    take: 100,
  });

  return (
    <div className="mx-auto max-w-7xl">
      <AdminSectionHeader
        eyebrow="Narrativa histórica"
        title="Hitos de línea de tiempo"
        description="Eventos que enriquecen la página de historia y conectan juegos, editoriales y personas."
      />

      <section className="mb-6 rounded-md border border-[var(--color-border)] bg-white p-5">
        <h3
          className="mb-4 text-lg font-bold text-[var(--color-brand-blue)]"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Nuevo hito
        </h3>
        <TimelineEventForm mode="create" />
      </section>

      <section className="rounded-md border border-[var(--color-border)] bg-white">
        <div className="divide-y divide-[var(--color-border)]">
          {events.length > 0 ? (
            events.map((event) => (
              <article key={event.id} className="px-5 py-5">
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-[var(--color-brand-blue)]">
                        {event.title}
                      </h3>
                      <span
                        className="rounded-full px-2 py-0.5 text-xs font-bold"
                        style={{
                          background:
                            event.content_status === "published"
                              ? "var(--color-brand-blue-pale)"
                              : "#fff0f0",
                          color:
                            event.content_status === "published"
                              ? "var(--color-brand-blue)"
                              : "var(--color-brand-red-dark)",
                        }}
                      >
                        {event.content_status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                      {event.year_display || event.year || "Sin fecha"}
                    </p>
                  </div>
                  <form action={deleteTimelineEvent}>
                    <input type="hidden" name="id" value={event.id} />
                    <button
                      type="submit"
                      className="rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 transition hover:bg-red-100"
                    >
                      Eliminar
                    </button>
                  </form>
                </div>
                <TimelineEventForm mode="edit" event={event} />
              </article>
            ))
          ) : (
            <p className="px-5 py-10 text-sm text-[var(--color-text-muted)]">
              Todavía no hay hitos históricos registrados.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
