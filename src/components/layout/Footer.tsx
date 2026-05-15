"use client";

import Link from "next/link";

const exploreLinks = [
  { href: "/juegos", label: "Juegos de Mesa" },
  { href: "/personas", label: "Personas" },
  { href: "/editoriales", label: "Editoriales" },
  { href: "/mecanicas", label: "Mecánicas" },
  { href: "/categorias", label: "Categorías" },
  { href: "/historia", label: "Historia" },
];

const aboutLinks = [
  { href: "/acerca", label: "Sobre el Proyecto" },
  { href: "/investigacion", label: "Investigación" },
  { href: "/contacto", label: "Contacto" },
];

export function Footer() {
  return (
    <footer
      className="mt-auto"
      style={{ background: "var(--color-brand-blue-dark)" }}
    >
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand column */}
          <div className="lg:col-span-1">
            <h3
              className="text-xl font-bold mb-3"
              style={{
                fontFamily: "var(--font-heading)",
                color: "white",
              }}
            >
              Ludoteca Chilena
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.7)" }}>
              Plataforma de archivo histórico digital dedicada a preservar el
              patrimonio lúdico de Chile.
            </p>
            {/* Star accent */}
            <div className="mt-4 flex items-center gap-2">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="var(--color-brand-red)"
                className="animate-star-pulse"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                ludotecachilena.cl
              </span>
            </div>
          </div>

          {/* Explore column */}
          <div>
            <h4
              className="text-sm font-semibold uppercase tracking-wider mb-4"
              style={{ color: "var(--color-brand-red-light)" }}
            >
              Explorar
            </h4>
            <ul className="space-y-2.5">
              {exploreLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors"
                    style={{ color: "rgba(255,255,255,0.7)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "rgba(255,255,255,0.7)")
                    }
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About column */}
          <div>
            <h4
              className="text-sm font-semibold uppercase tracking-wider mb-4"
              style={{ color: "var(--color-brand-red-light)" }}
            >
              Acerca de
            </h4>
            <ul className="space-y-2.5">
              {aboutLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors"
                    style={{ color: "rgba(255,255,255,0.7)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "rgba(255,255,255,0.7)")
                    }
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter / contact column */}
          <div>
            <h4
              className="text-sm font-semibold uppercase tracking-wider mb-4"
              style={{ color: "var(--color-brand-red-light)" }}
            >
              Contribuye
            </h4>
            <p className="text-sm mb-4" style={{ color: "rgba(255,255,255,0.7)" }}>
              ¿Conoces un juego de mesa chileno que no esté en nuestro archivo?
            </p>
            <Link
              href="/sugerir"
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all hover:scale-105"
              style={{ background: "var(--color-brand-red)", color: "white" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Sugerir un juego
            </Link>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4"
          style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}
        >
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
            © {new Date().getFullYear()} Ludoteca Chilena. Desarrollado por{" "}
            <a
              href="https://anatida.tech"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-white transition-colors"
              style={{ color: "rgba(255,255,255,0.6)" }}
            >
              Anatida.tech
            </a>
          </p>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
            Preservando el patrimonio lúdico de Chile 🇨🇱
          </p>
        </div>
      </div>
    </footer>
  );
}
