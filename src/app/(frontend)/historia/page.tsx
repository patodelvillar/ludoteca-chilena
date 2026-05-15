import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Línea de Tiempo | Ludoteca Chilena",
  description: "Explora la historia del diseño de juegos de mesa en Chile ordenados cronológicamente desde los primeros registros hasta la actualidad.",
};

export default async function TimelinePage() {
  // 1. Extraer los juegos con año de publicación definido
  const gamesWithYear = await prisma.game.findMany({
    where: { 
      content_status: "published",
      year_published: { not: null }
    },
    include: {
      publisher: true,
      media: { where: { is_primary: true }, take: 1 },
    },
    orderBy: { year_published: "asc" },
  });

  // 2. Extraer juegos sin año para agrupar al final
  const gamesUnknownYear = await prisma.game.findMany({
    where: { 
      content_status: "published",
      year_published: null
    },
    include: {
      publisher: true,
      media: { where: { is_primary: true }, take: 1 },
    },
    orderBy: { title: "asc" },
  });

  // Agrupar juegos por año
  const gamesByYear: Record<number, typeof gamesWithYear> = {};
  gamesWithYear.forEach(game => {
    const year = game.year_published!;
    if (!gamesByYear[year]) gamesByYear[year] = [];
    gamesByYear[year].push(game);
  });

  // Ordenar años de forma descendente (más reciente arriba) o ascendente (antiguos arriba)
  // Como es un timeline histórico, los más antiguos arriba suele ser más didáctico, pero para
  // evitar hacer tanto scroll hacia lo actual, pondremos los más recientes arriba.
  const sortedYears = Object.keys(gamesByYear).map(Number).sort((a, b) => b - a);

  return (
    <div className="py-10 sm:py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        
        {/* Encabezado */}
        <div className="text-center mb-16">
          <h1
            className="text-4xl sm:text-5xl font-bold mb-4"
            style={{
              fontFamily: "var(--font-heading)",
              color: "var(--color-brand-blue)",
            }}
          >
            Línea de Tiempo
          </h1>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: "var(--color-text-secondary)" }}>
            Un viaje por la historia del juego de mesa chileno, agrupando todos los títulos documentados según su año de publicación.
          </p>
        </div>

        {/* Timeline Container */}
        <div className="relative border-l-4 border-[var(--color-brand-blue-pale)] ml-3 md:ml-6 space-y-12 pb-12">
          
          {sortedYears.map((year) => (
            <div key={year} className="relative pl-8 md:pl-12">
              {/* Dot */}
              <div 
                className="absolute w-6 h-6 rounded-full -left-[14px] top-1"
                style={{ 
                  background: "var(--color-brand-red)",
                  border: "4px solid var(--color-white)"
                }} 
              />
              
              {/* Year Marker */}
              <h2 
                className="text-3xl font-black mb-6"
                style={{ 
                  fontFamily: "var(--font-heading)",
                  color: "var(--color-brand-blue)" 
                }}
              >
                {year}
              </h2>

              {/* Games in this year */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {gamesByYear[year].map(game => (
                  <Link 
                    key={game.id} 
                    href={`/juegos/${game.slug}`}
                    className="group bg-white rounded-xl overflow-hidden border border-[var(--color-border)] shadow-sm hover:shadow-md transition-shadow flex items-center p-3 gap-3"
                  >
                    <div className="w-16 h-16 rounded-md overflow-hidden bg-[var(--color-brand-blue-pale)] flex-shrink-0">
                      {game.media[0]?.url ? (
                        <img 
                          src={game.media[0].url} 
                          alt={game.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                        />
                      ) : (
                         <div className="w-full h-full flex items-center justify-center">
                           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand-blue-light)" strokeWidth="1.5" className="opacity-40">
                             <rect x="3" y="3" width="18" height="18" rx="2" />
                             <circle cx="8.5" cy="8.5" r="1.5" />
                             <path d="M21 15l-5-5L5 21" />
                           </svg>
                         </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm leading-tight text-[var(--color-brand-blue)] group-hover:text-[var(--color-brand-red)] transition-colors line-clamp-2">
                        {game.title}
                      </h3>
                      {game.publisher && !game.is_self_published && (
                        <p className="text-xs text-[var(--color-text-muted)] truncate mt-1">
                          {game.publisher.name}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}

          {/* Unknown Year Section */}
          {gamesUnknownYear.length > 0 && (
             <div className="relative pl-8 md:pl-12 mt-16 pt-8 border-t border-dashed border-[var(--color-border)]">
               <div 
                 className="absolute w-6 h-6 rounded-full -left-[14px] top-[36px]"
                 style={{ 
                   background: "var(--color-text-muted)",
                   border: "4px solid var(--color-white)"
                 }} 
               />
               <h2 
                 className="text-2xl font-bold mb-6 text-[var(--color-text-muted)]"
                 style={{ fontFamily: "var(--font-heading)" }}
               >
                 Año desconocido
               </h2>
               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 opacity-80">
                 {gamesUnknownYear.map(game => (
                    <Link 
                      key={game.id} 
                      href={`/juegos/${game.slug}`}
                      className="group bg-white rounded-xl overflow-hidden border border-[var(--color-border)] shadow-sm hover:shadow-md transition-shadow flex items-center p-3 gap-3"
                    >
                      <div className="w-12 h-12 rounded-md overflow-hidden bg-[var(--color-brand-blue-pale)] flex-shrink-0">
                        {game.media[0]?.url && (
                          <img 
                            src={game.media[0].url} 
                            alt={game.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                          />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-xs leading-tight text-[var(--color-brand-blue)] line-clamp-2">
                          {game.title}
                        </h3>
                      </div>
                    </Link>
                 ))}
               </div>
             </div>
          )}

        </div>
      </div>
    </div>
  );
}
