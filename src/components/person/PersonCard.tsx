import Link from "next/link";
import { safeExternalUrl, trustedMediaHosts } from "@/lib/url";

interface PersonCardProps {
  slug: string;
  displayName: string;
  roles?: string[];
  gameCount: number;
  imageUrl?: string | null;
}

export function PersonCard({
  slug,
  displayName,
  roles = [],
  gameCount,
  imageUrl,
}: PersonCardProps) {
  // Deduplicar y tomar solo hasta 3 roles para mostrar
  const uniqueRoles = Array.from(new Set(roles)).slice(0, 3);
  const safeImageUrl = safeExternalUrl(imageUrl, { allowedHosts: trustedMediaHosts });

  return (
    <Link href={`/personas/${slug}`} className="block group">
      <article
        className="card-hover rounded-xl overflow-hidden h-full flex flex-col p-4 sm:p-6"
        style={{
          background: "var(--color-white)",
          boxShadow: "var(--shadow-card)",
          border: "1px solid var(--color-border)",
        }}
      >
        <div className="flex items-start gap-4">
          <div
            className="w-16 h-16 rounded-full flex-shrink-0 overflow-hidden flex items-center justify-center"
            style={{
              background: "var(--color-brand-blue-pale)",
              border: "2px solid var(--color-brand-blue-light)",
            }}
          >
            {safeImageUrl ? (
              <img
                src={safeImageUrl}
                alt={displayName}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--color-brand-blue-light)"
                strokeWidth="1.5"
                className="opacity-70"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            )}
          </div>

          <div className="flex-1">
            <h3
              className="text-lg font-bold mb-1 group-hover:text-[var(--color-brand-red)] transition-colors"
              style={{
                fontFamily: "var(--font-heading)",
                color: "var(--color-brand-blue)",
              }}
            >
              {displayName}
            </h3>

            {uniqueRoles.length > 0 && (
              <p
                className="text-xs font-medium mb-3 uppercase tracking-wide"
                style={{ color: "var(--color-brand-red)" }}
              >
                {uniqueRoles.join(" • ")}
              </p>
            )}

            <div
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold"
              style={{
                background: "var(--color-cream)",
                color: "var(--color-text-secondary)",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <circle cx="15.5" cy="15.5" r="1.5" />
              </svg>
              {gameCount} {gameCount === 1 ? "juego" : "juegos"}
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
