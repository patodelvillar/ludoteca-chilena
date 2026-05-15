import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Acerca del proyecto | Ludoteca Chilena",
};

export default function AcercaPage() {
  return (
    <div className="py-20 text-center">
      <div className="mx-auto max-w-2xl px-4">
        <span className="text-5xl mb-6 block">🚧</span>
        <h1 className="text-3xl font-bold mb-4 text-[var(--color-brand-blue)]" style={{ fontFamily: "var(--font-heading)" }}>
          Sección en Construcción
        </h1>
        <p className="text-[var(--color-text-secondary)] text-lg mb-8">
          Pronto subiremos la historia detallada de la Ludoteca Chilena, quiénes somos y cuál es nuestra misión de preservar el patrimonio lúdico.
        </p>
      </div>
    </div>
  );
}
