import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions, isAdminRole } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Ingreso admin | Ludoteca Chilena",
};

export default async function AdminLoginPage() {
  const session = await getServerSession(authOptions);

  if (isAdminRole(session?.user?.role)) {
    redirect("/admin");
  }

  return (
    <main className="min-h-screen bg-[var(--color-cream)] px-4 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-5xl items-center">
        <section className="grid w-full overflow-hidden rounded-lg border border-[var(--color-border)] bg-white shadow-[var(--shadow-card)] md:grid-cols-[1fr_0.9fr]">
          <div className="border-b border-[var(--color-border)] p-8 md:border-b-0 md:border-r lg:p-10">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-brand-red)]">
              Mesa de curatoría
            </p>
            <h1
              className="mb-4 text-3xl font-bold leading-tight text-[var(--color-brand-blue)] sm:text-4xl"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Administrar el archivo histórico
            </h1>
            <p className="max-w-prose text-sm leading-6 text-[var(--color-text-secondary)]">
              Acceso reservado para revisar sugerencias, completar fichas,
              publicar hallazgos y mantener trazabilidad del patrimonio lúdico
              chileno.
            </p>
            <div className="mt-8 grid gap-3 text-sm text-[var(--color-text-secondary)]">
              {["Revisión editorial", "Fuentes y evidencia", "Publicación controlada"].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-[var(--color-brand-red)]" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="p-6 sm:p-8 lg:p-10">
            <LoginForm />
          </div>
        </section>
      </div>
    </main>
  );
}
