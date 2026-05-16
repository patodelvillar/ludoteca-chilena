import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AdminSectionHeader } from "@/components/admin/AdminSectionHeader";

export const metadata: Metadata = {
  title: "Editoriales | Admin",
};

export default async function AdminPublishersPage() {
  const publishers = await prisma.publisher.findMany({
    orderBy: { name: "asc" },
    take: 150,
    include: {
      _count: { select: { published_games: true } },
    },
  });

  return (
    <div className="mx-auto max-w-7xl">
      <AdminSectionHeader
        eyebrow="Catálogo"
        title="Editoriales"
        description="Directorio editorial para revisión de estados, años de actividad y notas históricas."
        action={
          <Link href="/admin/editoriales/nuevo" className="admin-button-primary px-4 py-2.5 text-sm">
            Nueva editorial
          </Link>
        }
      />

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {publishers.map((publisher) => (
          <Link
            key={publisher.id}
            href={`/admin/editoriales/${publisher.id}`}
            className="rounded-md border border-[var(--color-border)] bg-white p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-bold text-[var(--color-brand-blue)]">
                  {publisher.name}
                </h3>
                <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                  {publisher.city || "Ciudad desconocida"} · {publisher.status}
                </p>
              </div>
              <span className="rounded-full bg-[var(--color-brand-blue-pale)] px-2 py-1 text-xs font-bold text-[var(--color-brand-blue)]">
                {publisher._count.published_games}
              </span>
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
