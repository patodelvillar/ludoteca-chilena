import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { AdminSectionHeader } from "@/components/admin/AdminSectionHeader";
import { AdminSearchInput } from "@/components/admin/AdminSearchInput";

export const metadata: Metadata = {
  title: "Editoriales | Admin",
};

interface AdminPublishersPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function AdminPublishersPage({
  searchParams,
}: AdminPublishersPageProps) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  const where: Prisma.PublisherWhereInput = query
    ? {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { nickname: { contains: query, mode: "insensitive" } },
          { city: { contains: query, mode: "insensitive" } },
          { former_name: { contains: query, mode: "insensitive" } },
        ],
      }
    : {};

  const publishers = await prisma.publisher.findMany({
    where,
    orderBy: { name: "asc" },
    take: 150,
    include: {
      _count: { select: { published_games: true } },
      media: {
        where: { is_primary: true },
        select: { url: true, alt_text: true },
        take: 1,
      },
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

      <div className="mb-6">
        <AdminSearchInput placeholder="Buscar por nombre, ciudad o alias…" />
      </div>

      <p className="mb-4 text-sm text-[var(--color-text-muted)]">
        {query
          ? `${publishers.length} resultado${publishers.length === 1 ? "" : "s"} para “${query}”.`
          : `Mostrando ${publishers.length} editoriales.`}
      </p>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {publishers.map((publisher) => {
          const logo = publisher.media[0];
          return (
            <Link
              key={publisher.id}
              href={`/admin/editoriales/${publisher.id}`}
              className="flex items-start gap-3 rounded-md border border-[var(--color-border)] bg-white p-4 transition hover:border-[var(--color-brand-blue)] hover:shadow-sm"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md border border-[var(--color-border)] bg-[var(--color-cream)]">
                {logo ? (
                  <Image
                    src={logo.url}
                    alt={logo.alt_text || publisher.name}
                    width={56}
                    height={56}
                    className="h-full w-full object-contain"
                    unoptimized
                  />
                ) : (
                  <span className="text-lg font-bold text-[var(--color-brand-blue-light)]">
                    {publisher.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex flex-1 items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate font-bold text-[var(--color-brand-blue)]">
                    {publisher.name}
                  </h3>
                  <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                    {publisher.city || "Ciudad desconocida"} · {publisher.status}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-[var(--color-brand-blue-pale)] px-2 py-1 text-xs font-bold text-[var(--color-brand-blue)]">
                  {publisher._count.published_games}
                </span>
              </div>
            </Link>
          );
        })}
        {publishers.length === 0 && (
          <p className="col-span-full px-4 py-8 text-sm text-[var(--color-text-muted)]">
            No se encontraron editoriales para “{query}”.
          </p>
        )}
      </section>
    </div>
  );
}
