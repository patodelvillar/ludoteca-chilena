import type { Metadata } from "next";
import { SuggestionForm } from "./SuggestionForm";

export const metadata: Metadata = {
  title: "Sugerir un juego | Ludoteca Chilena",
  description: "Ayúdanos a hacer crecer el catálogo sugiriendo juegos de mesa chilenos que falten.",
};

export default function SugerirPage() {
  return (
    <div className="py-10 sm:py-16">
      <div className="mx-auto max-w-3xl px-4 text-center">
        <h1 className="text-3xl sm:text-5xl font-bold mb-4 text-[var(--color-brand-blue)]" style={{ fontFamily: "var(--font-heading)" }}>
          Sugiere un Juego
        </h1>
        <p className="text-[var(--color-text-secondary)] text-lg mb-10">
          ¿Conoces algún juego de mesa chileno que no esté en nuestro catálogo? 
          ¡Ayúdanos a preservar el patrimonio lúdico completando este formulario! 
          Todas las sugerencias son revisadas por nuestro equipo antes de ser publicadas.
        </p>

        <SuggestionForm />
      </div>
    </div>
  );
}
