import Link from "next/link";

interface PublisherCardProps {
  slug: string;
  name: string;
  status: string;
  gameCount: number;
  logoUrl?: string | null;
}

export function PublisherCard({
  slug,
  name,
  status,
  gameCount,
  logoUrl,
}: PublisherCardProps) {
  const isInactive = status === "inactive";

  return (
    <Link href={`/editoriales/${slug}`} className="block group h-full">
      <article
        className="card-hover rounded-xl overflow-hidden h-full flex flex-col p-6"
        style={{
          background: "var(--color-white)",
          boxShadow: "var(--shadow-card)",
          border: "1px solid var(--color-border)",
          opacity: isInactive ? 0.8 : 1,
        }}
      >
        <div className="flex items-start justify-between mb-4">
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden"
            style={{
              background: "var(--color-brand-blue-pale)",
              color: "var(--color-brand-blue)",
            }}
          >
            {logoUrl ? (
              <img src={logoUrl} alt={`Logo de ${name}`} className="h-full w-full object-contain bg-white p-1.5" />
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
              </svg>
            )}
          </div>

          <span
            className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full"
            style={{
              background: isInactive ? "var(--color-cream)" : "#dcfce7",
              color: isInactive ? "var(--color-text-muted)" : "#166534",
            }}
          >
            {status === "active" ? "Activa" : status === "inactive" ? "Inactiva" : "Estado desconocido"}
          </span>
        </div>

        <h3
          className="text-xl font-bold mb-4 group-hover:text-[var(--color-brand-red)] transition-colors"
          style={{
            fontFamily: "var(--font-heading)",
            color: "var(--color-brand-blue)",
          }}
        >
          {name}
        </h3>

        <div className="mt-auto">
          <div
            className="flex items-center gap-2 text-sm font-medium"
            style={{ color: "var(--color-text-secondary)" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18" />
            </svg>
            {gameCount} {gameCount === 1 ? "título publicado" : "títulos publicados"}
          </div>
        </div>
      </article>
    </Link>
  );
}
