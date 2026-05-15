export type YearCertainty = "exact" | "circa" | "decade" | "unknown" | string;

export function formatYear(
  year: number | null | undefined,
  certainty: YearCertainty | null | undefined,
  yearDisplay?: string | null,
): string {
  if (yearDisplay && yearDisplay.trim().length > 0) return yearDisplay;
  if (!year) return "Año desconocido";
  switch (certainty) {
    case "exact":
      return year.toString();
    case "circa":
      return `~${year}`;
    case "decade":
      return `Años ${Math.floor(year / 10) * 10}`;
    case "unknown":
      return "Año desconocido";
    default:
      return year.toString();
  }
}
