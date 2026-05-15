export interface DecadeContext {
  label: string;
  intro: string;
}

export const decadeContexts: Record<number, DecadeContext> = {
  1950: {
    label: "Década de 1950",
    intro:
      "Período fundacional con escasos registros documentados. Predominan los juegos didácticos importados y producciones artesanales aisladas.",
  },
  1960: {
    label: "Década de 1960",
    intro:
      "Continúa la circulación de juegos importados, principalmente educativos y familiares, con producciones locales puntuales.",
  },
  1970: {
    label: "Década de 1970",
    intro:
      "Aparecen las primeras producciones locales sistemáticas en un mercado dominado por juegos importados de temáticas familiares y didácticas.",
  },
  1980: {
    label: "Década de 1980",
    intro:
      "Surgen editoriales locales pioneras. La oferta se mantiene mayoritariamente familiar y didáctica, con tiradas pequeñas y distribución acotada.",
  },
  1990: {
    label: "Década de 1990",
    intro:
      "Tras el retorno a la democracia se amplía la circulación editorial y crece la diversidad de títulos publicados en el país.",
  },
  2000: {
    label: "Década de 2000",
    intro:
      "La llegada masiva de juegos modernos transforma la afición. Surgen las primeras tiendas especializadas y comunidades de jugadores organizadas.",
  },
  2010: {
    label: "Década de 2010",
    intro:
      "Activación del diseño local impulsada por fondos públicos (Fondart) y por la autopublicación. Una nueva generación de diseñadores chilenos comienza a publicar de forma sostenida.",
  },
  2020: {
    label: "Década de 2020",
    intro:
      "Consolidación de la escena de diseño chileno contemporáneo, con mayor diversidad temática, presencia en Kickstarter y proyección internacional.",
  },
};

export function getDecadeContext(decade: number): DecadeContext {
  return (
    decadeContexts[decade] ?? {
      label: `Década de ${decade}`,
      intro: "",
    }
  );
}

export function decadeOf(year: number): number {
  return Math.floor(year / 10) * 10;
}
