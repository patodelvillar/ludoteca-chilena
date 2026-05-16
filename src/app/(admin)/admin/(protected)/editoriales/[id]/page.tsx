import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminSectionHeader } from "@/components/admin/AdminSectionHeader";
import { PublisherEditorForm } from "../PublisherEditorForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = { title: "Editar editorial | Admin" };

export default async function EditPublisherPage({ params }: PageProps) {
  const { id } = await params;
  const publisher = await prisma.publisher.findUnique({
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
  if (!publisher) notFound();

  return (
    <div className="mx-auto max-w-6xl">
      <AdminSectionHeader
        eyebrow="Editorial"
        title={publisher.name}
        description="Datos públicos e internos de ciclo de vida editorial."
        action={
          <Link href={`/editoriales/${publisher.slug}`} className="rounded-md border border-[var(--color-border)] px-4 py-2.5 text-sm font-bold text-[var(--color-text-secondary)] transition hover:border-[var(--color-brand-blue)] hover:text-[var(--color-brand-blue)]">
            Ver pública
          </Link>
        }
      />
      <PublisherEditorForm publisher={publisher} />
    </div>
  );
}
