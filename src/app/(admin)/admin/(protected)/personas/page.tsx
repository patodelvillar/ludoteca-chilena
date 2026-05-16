import type { Metadata } from "next";
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { AdminSectionHeader } from "@/components/admin/AdminSectionHeader";
import { AdminSearchInput } from "@/components/admin/AdminSearchInput";

export const metadata: Metadata = {
  title: "Personas | Admin",
};

interface AdminPeoplePageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function AdminPeoplePage({
  searchParams,
}: AdminPeoplePageProps) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  const where: Prisma.PersonWhereInput = query
    ? {
        OR: [
          { display_name: { contains: query, mode: "insensitive" } },
          { first_name: { contains: query, mode: "insensitive" } },
          { last_name: { contains: query, mode: "insensitive" } },
          { nickname: { contains: query, mode: "insensitive" } },
          { nationality: { contains: query, mode: "insensitive" } },
        ],
      }
    : {};

  const people = await prisma.person.findMany({
    where,
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

      <div className="mb-6">
        <AdminSearchInput placeholder="Buscar por nombre o nacionalidad…" />
      </div>

      <p className="mb-4 text-sm text-[var(--color-text-muted)]">
        {query
          ? `${people.length} resultado${people.length === 1 ? "" : "s"} para “${query}”.`
          : `Mostrando ${people.length} personas.`}
      </p>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {people.map((person) => (
          <Link
            key={person.id}
            href={`/admin/personas/${person.id}`}
            className="rounded-md border border-[var(--color-border)] bg-white p-4 transition hover:border-[var(--color-brand-blue)] hover:shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate font-bold text-[var(--color-brand-blue)]">
                  {person.display_name}
                </h3>
                <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                  {person.nationality || "Nacionalidad desconocida"} ·{" "}
                  {person.content_status}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-[var(--color-brand-blue-pale)] px-2 py-1 text-xs font-bold text-[var(--color-brand-blue)]">
                {person._count.games}
              </span>
            </div>
          </Link>
        ))}
        {people.length === 0 && (
          <p className="col-span-full px-4 py-8 text-sm text-[var(--color-text-muted)]">
            No se encontraron personas para “{query}”.
          </p>
        )}
      </section>
    </div>
  );
}
