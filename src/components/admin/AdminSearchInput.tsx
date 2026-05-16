"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface AdminSearchInputProps {
  placeholder?: string;
  paramName?: string;
}

export function AdminSearchInput({
  placeholder = "Buscar…",
  paramName = "q",
}: AdminSearchInputProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initial = searchParams.get(paramName) ?? "";
  const [value, setValue] = useState(initial);
  const [isPending, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setValue(searchParams.get(paramName) ?? "");
  }, [searchParams, paramName]);

  function pushQuery(next: string) {
    const params = new URLSearchParams(searchParams.toString());
    const trimmed = next.trim();
    if (trimmed) params.set(paramName, trimmed);
    else params.delete(paramName);
    const qs = params.toString();
    startTransition(() => {
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    });
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = e.target.value;
    setValue(next);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => pushQuery(next), 300);
  }

  function clear() {
    setValue("");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    pushQuery("");
  }

  return (
    <div className="relative w-full sm:max-w-sm">
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="M21 21l-4.3-4.3" />
      </svg>
      <input
        type="search"
        inputMode="search"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-md border border-[var(--color-border)] bg-white pl-9 pr-9 py-2 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-brand-blue)] focus:ring-2 focus:ring-[var(--color-brand-blue-pale)]"
      />
      {value && (
        <button
          type="button"
          onClick={clear}
          aria-label="Limpiar búsqueda"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-[var(--color-text-muted)] hover:text-[var(--color-brand-blue)]"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-4 w-4"
          >
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      )}
      {isPending && (
        <span className="absolute -bottom-5 left-1 text-xs text-[var(--color-text-muted)]">
          Buscando…
        </span>
      )}
    </div>
  );
}
