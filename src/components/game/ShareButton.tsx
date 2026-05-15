"use client";

import { useEffect, useRef, useState } from "react";

interface ShareButtonProps {
  title: string;
  path: string; // ej: "/juegos/baby-dragon-baby"
}

type Network = "copy" | "facebook" | "twitter" | "instagram" | "reddit";

export default function ShareButton({ title, path }: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  const getFullUrl = (): string => {
    if (typeof window === "undefined") return path;
    return `${window.location.origin}${path}`;
  };

  const flashCopied = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleAction = async (network: Network) => {
    const url = getFullUrl();
    const u = encodeURIComponent(url);
    const t = encodeURIComponent(title);

    if (network === "copy") {
      try {
        await navigator.clipboard.writeText(url);
        flashCopied();
      } catch {
        // best-effort fallback
      }
      return;
    }

    if (network === "instagram") {
      // Instagram no soporta share por URL; copiamos el enlace y avisamos.
      try {
        await navigator.clipboard.writeText(url);
        flashCopied();
      } catch {}
      return;
    }

    let shareUrl = "";
    if (network === "facebook") {
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${u}`;
    } else if (network === "twitter") {
      shareUrl = `https://twitter.com/intent/tweet?url=${u}&text=${t}`;
    } else if (network === "reddit") {
      shareUrl = `https://www.reddit.com/submit?url=${u}&title=${t}`;
    }
    window.open(
      shareUrl,
      "_blank",
      "noopener,noreferrer,width=600,height=550",
    );
  };

  const networks: {
    id: Network;
    label: string;
    bg: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: "copy",
      label: "Copiar enlace",
      bg: "var(--color-brand-blue-light)",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5" />
          <path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5" />
        </svg>
      ),
    },
    {
      id: "facebook",
      label: "Facebook",
      bg: "#1877F2",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M13.5 21v-7.5h2.5l.4-3h-2.9V8.5c0-.87.24-1.47 1.5-1.47H16.5V4.3c-.26-.04-1.14-.13-2.16-.13-2.14 0-3.6 1.3-3.6 3.7v2.1H8v3h2.74V21h2.76z" />
        </svg>
      ),
    },
    {
      id: "twitter",
      label: "X (Twitter)",
      bg: "#000000",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.25 2.25H8.08l4.713 6.231L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644z" />
        </svg>
      ),
    },
    {
      id: "instagram",
      label: "Instagram (copia el enlace)",
      bg: "linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none" />
        </svg>
      ),
    },
    {
      id: "reddit",
      label: "Reddit",
      bg: "#FF4500",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M22 12.07c0-1.21-.98-2.19-2.18-2.19-.59 0-1.13.23-1.52.61-1.5-1.04-3.55-1.71-5.82-1.79l.99-4.66 3.24.69a1.56 1.56 0 1 0 .15-.86l-3.62-.77a.43.43 0 0 0-.51.33L11.65 8.7c-2.31.06-4.4.74-5.92 1.79a2.18 2.18 0 0 0-3.16 2.91 4.4 4.4 0 0 0-.05.62c0 3.18 3.7 5.77 8.26 5.77s8.26-2.59 8.26-5.77c0-.21-.02-.42-.05-.63.6-.4 1.01-1.08 1.01-1.86zM7.04 13.59a1.43 1.43 0 1 1 2.86 0 1.43 1.43 0 0 1-2.86 0zm8.05 3.95c-1.04 1.04-3.03 1.12-3.61 1.12-.58 0-2.57-.08-3.61-1.12a.4.4 0 0 1 .56-.56c.66.66 2.08.9 3.05.9.97 0 2.39-.24 3.05-.9a.4.4 0 0 1 .56.56zm-.23-2.52a1.43 1.43 0 1 1 0-2.86 1.43 1.43 0 0 1 0 2.86z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Compartir esta página"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border transition-colors hover:bg-[var(--color-brand-blue-pale)]"
        style={{
          color: "var(--color-brand-blue)",
          borderColor: "var(--color-border)",
          background: open ? "var(--color-brand-blue-pale)" : "var(--color-white)",
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
        Compartir
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 z-30 rounded-2xl shadow-xl p-3 min-w-[260px]"
          style={{
            background: "var(--color-bg-card)",
            border: "1px solid var(--color-border)",
          }}
        >
          <p
            className="text-xs uppercase tracking-wider font-semibold mb-2 px-1"
            style={{ color: "var(--color-text-muted)" }}
          >
            Compartir en
          </p>
          <div className="grid grid-cols-5 gap-2">
            {networks.map((n) => (
              <button
                key={n.id}
                role="menuitem"
                type="button"
                onClick={() => handleAction(n.id)}
                title={n.label}
                aria-label={n.label}
                className="aspect-square rounded-xl flex items-center justify-center text-white transition-transform hover:scale-105 active:scale-95"
                style={{ background: n.bg }}
              >
                {n.icon}
              </button>
            ))}
          </div>
          <div className="mt-2 h-5 text-center">
            {copied && (
              <p className="text-xs font-semibold" style={{ color: "var(--color-brand-blue)" }}>
                ✓ Enlace copiado al portapapeles
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
