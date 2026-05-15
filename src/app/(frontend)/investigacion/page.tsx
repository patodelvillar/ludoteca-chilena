import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Investigación | Ludoteca Chilena",
};

export default function InvestigacionPage() {
  return (
    <div className="py-20 text-center">
      <div className="mx-auto max-w-2xl px-4">
        <span className="text-5xl mb-6 block">🚧</span>
        <h1 className="text-3xl font-bold mb-4 text-[var(--color-brand-blue)]" style={{ fontFamily: "var(--font-heading)" }}>
          Investigación en Construcción
        </h1>
        <p className="text-[var(--color-text-secondary)] text-lg mb-8">
          Estamos recopilando toda la metodología de investigación y fuentes utilizadas para levantar este catálogo. Estará disponible muy pronto.
        </p>
      </div>
    </div>
  );
}
