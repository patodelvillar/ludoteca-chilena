import type { ReactNode } from "react";

interface AdminSectionHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}

export function AdminSectionHeader({
  eyebrow,
  title,
  description,
  action,
}: AdminSectionHeaderProps) {
  return (
    <header className="mb-6 flex flex-col justify-between gap-4 border-b border-[var(--color-border)] pb-5 md:flex-row md:items-end">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-brand-red)]">
          {eyebrow}
        </p>
        <h2
          className="text-2xl font-bold text-[var(--color-brand-blue)]"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {title}
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
          {description}
        </p>
      </div>
      {action}
    </header>
  );
}
