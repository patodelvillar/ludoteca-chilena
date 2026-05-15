import { prisma } from "@/lib/prisma";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Categorías | Ludoteca Chilena",
  description: "Explora juegos de mesa chilenos por categoría.",
};

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    include: {
      _count: { select: { games: true } }
    },
    orderBy: { name: "asc" }
  });

  return (
    <div className="py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-[var(--color-brand-blue)]" style={{ fontFamily: "var(--font-heading)" }}>Categorías</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link key={cat.id} href={`/categorias/${cat.slug}`} className="block p-4 bg-white border border-[var(--color-border)] rounded-xl hover:border-[var(--color-brand-blue)] hover:shadow-md transition-all">
              <h2 className="text-lg font-bold text-[var(--color-brand-blue)]">{cat.name}</h2>
              <p className="text-sm text-[var(--color-text-secondary)] mt-1">{cat._count.games} {cat._count.games === 1 ? 'juego' : 'juegos'}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
