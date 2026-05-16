import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AdminSectionHeader } from "@/components/admin/AdminSectionHeader";

export const metadata: Metadata = {
  title: "Personas | Admin",
};

export default async function AdminPeoplePage() {
  const people = await prisma.person.findMany({
    orderBy: { display_name: "asc" },
    take: 150,
    include: {
      _count: { select: { games: true } },
    },
  });

  return (
    <div className="mx-auto max-w-7xl">
      <AdminSectionHeader
        eyebrow="Créditos"
        title="Personas"
        description="Autores, diseñadores, artistas y colaboradores conectados a fichas del archivo."
        action={
          <Link href="/admin/personas/nuevo" className="admin-button-primary px-4 py-2.5 text-sm">
            Nueva persona
          </Link>
        }
      />

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {people.map((person) => (
          <Link
            key={person.id}
            href={`/admin/personas/${person.id}`}
            className="rounded-md border border-[var(--color-border)] bg-white p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-bold text-[var(--color-brand-blue)]">
                  {person.display_name}
                </h3>
                <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                  {person.nationality || "Nacionalidad desconocida"} ·{" "}
                  {person.content_status}
                </p>
              </div>
              <span className="rounded-full bg-[var(--color-brand-blue-pale)] px-2 py-1 text-xs font-bold text-[var(--color-brand-blue)]">
                {person._count.games}
              </span>
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
