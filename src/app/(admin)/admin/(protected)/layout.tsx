import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions, isAdminRole } from "@/lib/auth";
import { SignOutButton } from "@/components/admin/SignOutButton";

const navItems = [
  { href: "/admin", label: "Bandeja" },
  { href: "/admin/juegos", label: "Juegos" },
  { href: "/admin/editoriales", label: "Editoriales" },
  { href: "/admin/personas", label: "Personas" },
  { href: "/admin/timeline", label: "Historia" },
  { href: "/admin/sugerencias", label: "Sugerencias" },
];

export default async function AdminProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!isAdminRole(session?.user?.role)) {
    redirect("/admin/login");
  }

  const adminLabel = session?.user?.name || session?.user?.email || "Administrador";

  return (
    <div className="min-h-screen bg-[var(--color-cream)] text-[var(--color-text)]">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-[var(--color-border)] bg-[var(--color-cream)] px-4 py-5 lg:block">
        <Link href="/admin" className="block px-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-brand-red)]">
            Ludoteca
          </p>
          <h1
            className="mt-1 text-xl font-bold text-[var(--color-brand-blue)]"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Archivo Admin
          </h1>
        </Link>

        <nav className="mt-8 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-md px-3 py-2 text-sm font-semibold text-[var(--color-text-secondary)] transition hover:bg-white hover:text-[var(--color-brand-blue)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-[var(--color-border)] bg-white/90 px-4 py-3 backdrop-blur sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                Panel de administración
              </p>
              <p className="text-sm font-semibold text-[var(--color-brand-blue)]">
                {adminLabel}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="rounded-md border border-[var(--color-border)] px-3 py-2 text-xs font-semibold text-[var(--color-text-secondary)] transition hover:border-[var(--color-brand-blue)] hover:text-[var(--color-brand-blue)]"
              >
                Ver sitio
              </Link>
              <SignOutButton />
            </div>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
