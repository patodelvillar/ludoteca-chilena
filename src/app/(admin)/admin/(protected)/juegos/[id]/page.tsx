import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminSectionHeader } from "@/components/admin/AdminSectionHeader";
import { GameEditorForm } from "../GameEditorForm";
import { GameRelationsManager } from "../GameRelationsManager";
import { GameVideoManager } from "../GameVideoManager";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Editar juego | Admin",
};

export default async function EditGamePage({ params }: PageProps) {
  const { id } = await params;

  const [game, publishers, mechanics, categories, peopleOptions] = await Promise.all([
    prisma.game.findUnique({
      where: { id },
      include: {
        mechanics: {
          select: { mechanic_id: true },
        },
        categories: {
          select: { category_id: true },
        },
        people: {
          orderBy: [{ role: "asc" }],
          select: {
            id: true,
            role: true,
            person: {
              select: {
                id: true,
                display_name: true,
              },
            },
          },
        },
        media: {
          orderBy: [{ is_primary: "desc" }, { created_at: "desc" }],
          select: {
            id: true,
            url: true,
            type: true,
            filename: true,
            alt_text: true,
            source_description: true,
            circa_year: true,
            is_primary: true,
          },
        },
        videos: {
          orderBy: { created_at: "desc" },
          select: {
            id: true,
            url: true,
            platform: true,
            video_id: true,
            title: true,
            description: true,
          },
        },
      },
    }),
    prisma.publisher.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.mechanic.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.person.findMany({
      orderBy: { display_name: "asc" },
      select: { id: true, display_name: true },
    }),
  ]);

  if (!game) notFound();

  return (
    <div className="mx-auto max-w-7xl">
      <AdminSectionHeader
        eyebrow="Edición de ficha"
        title={game.title}
        description="Campos principales de publicación, datos editoriales y portada primaria."
        action={
          <Link
            href={`/juegos/${game.slug}`}
            className="rounded-md border border-[var(--color-border)] px-4 py-2.5 text-sm font-bold text-[var(--color-text-secondary)] transition hover:border-[var(--color-brand-blue)] hover:text-[var(--color-brand-blue)]"
          >
            Ver ficha pública
          </Link>
        }
      />

      <GameEditorForm game={game} publishers={publishers} />
      <GameRelationsManager
        gameId={game.id}
        selectedMechanicIds={game.mechanics.map((item) => item.mechanic_id)}
        selectedCategoryIds={game.categories.map((item) => item.category_id)}
        mechanics={mechanics}
        categories={categories}
        peopleOptions={peopleOptions}
        people={game.people}
      />
      <GameVideoManager gameId={game.id} videos={game.videos} />
    </div>
  );
}
