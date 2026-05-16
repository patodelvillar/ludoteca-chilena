import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminSectionHeader } from "@/components/admin/AdminSectionHeader";
import { PersonEditorForm } from "../PersonEditorForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = { title: "Editar persona | Admin" };

export default async function EditPersonPage({ params }: PageProps) {
  const { id } = await params;
  const person = await prisma.person.findUnique({
    where: { id },
    include: {
      media: {
        orderBy: [{ is_primary: "desc" }, { created_at: "desc" }],
        select: {
          id: true,
          url: true,
          alt_text: true,
          is_primary: true,
        },
      },
    },
  });
  if (!person) notFound();

  return (
    <div className="mx-auto max-w-6xl">
      <AdminSectionHeader
        eyebrow="Créditos"
        title={person.display_name}
        description="Datos biográficos y estado editorial de la persona."
        action={
          <Link href={`/personas/${person.slug}`} className="rounded-md border border-[var(--color-border)] px-4 py-2.5 text-sm font-bold text-[var(--color-text-secondary)] transition hover:border-[var(--color-brand-blue)] hover:text-[var(--color-brand-blue)]">
            Ver pública
          </Link>
        }
      />
      <PersonEditorForm person={person} />
    </div>
  );
}
