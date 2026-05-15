import Link from "next/link";

interface GameCardProps {
  slug: string;
  title: string;
  year?: number | null;
  yearCertainty?: string | null;
  publisherName?: string | null;
  isSelfPublished?: boolean;
  mechanics?: string[];
  categories?: string[];
  imageUrl?: string | null;
  status?: string | null;
}

function formatYear(year: number | null | undefined, certainty: string | null | undefined): string {
  if (!year) return "Año desconocido";
  switch (certainty) {
    case "exact": return year.toString();
    case "circa": return `~${year}`;
    case "decade": return `Años ${Math.floor(year / 10) * 10}`;
    default: return year.toString();
  }
}

export function GameCard({
  slug,
  title,
  year,
  yearCertainty,
  publisherName,
  isSelfPublished,
  mechanics = [],
  categories = [],
  imageUrl,
  status,
}: GameCardProps) {
  const yearText = formatYear(year, yearCertainty);
  const publisher = isSelfPublished ? "Autopublicado" : publisherName;

  return (
    <Link href={`/juegos/${slug}`} className="block group">
      <article
        className="card-hover rounded-xl overflow-hidden h-full flex flex-col"
        style={{
          background: "var(--color-white)",
          boxShadow: "var(--shadow-card)",
          border: "1px solid var(--color-border)",
        }}
      >
        {/* Image area */}
        <div
          className="relative h-48 overflow-hidden"
          style={{ background: "var(--color-brand-blue-pale)" }}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--color-brand-blue-light)"
                strokeWidth="1"
                className="opacity-40"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M3 15l6-6 4 4 2-2 6 6" />
                <circle cx="15" cy="8" r="2" />
              </svg>
            </div>
          )}

          {/* Year badge */}
          <div
            className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold text-white"
            style={{ background: "var(--color-brand-blue)" }}
          >
            {yearText}
          </div>

          {/* Status badge */}
          {status && status !== "unknown" && (
            <div
              className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold text-white"
              style={{
                background:
                  status === "available"
                    ? "#22c55e"
                    : status === "out_of_print"
                    ? "var(--color-brand-red)"
                    : "var(--color-text-muted)",
              }}
            >
              {status === "available"
                ? "Disponible"
                : status === "out_of_print"
                ? "Agotado"
                : status === "lost"
                ? "Perdido"
                : status}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col p-4">
          <h3
            className="text-lg font-bold mb-1 line-clamp-2 group-hover:text-[var(--color-brand-red)] transition-colors"
            style={{
              fontFamily: "var(--font-heading)",
              color: "var(--color-brand-blue)",
            }}
          >
            {title}
          </h3>

          {publisher && (
            <p
              className="text-sm mb-3"
              style={{ color: "var(--color-text-muted)" }}
            >
              {publisher}
            </p>
          )}

          {/* Tags */}
          <div className="mt-auto flex flex-wrap gap-1.5 pt-3">
            {mechanics.slice(0, 2).map((m) => (
              <span key={m} className="tag-mechanic text-xs">
                {m}
              </span>
            ))}
            {categories.slice(0, 1).map((c) => (
              <span key={c} className="tag-category text-xs">
                {c}
              </span>
            ))}
            {mechanics.length + categories.length > 3 && (
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{
                  background: "var(--color-cream)",
                  color: "var(--color-text-muted)",
                }}
              >
                +{mechanics.length + categories.length - 3}
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
