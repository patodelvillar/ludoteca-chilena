"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsPending(true);

    const formData = new FormData(event.currentTarget);
    const result = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });

    setIsPending(false);

    if (!result?.ok) {
      setError("Credenciales inválidas o usuario sin permiso de administración.");
      return;
    }

    router.push(searchParams.get("callbackUrl") || "/admin");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <h2
          className="text-xl font-bold text-[var(--color-brand-blue)]"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Iniciar sesión
        </h2>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          Usa tu cuenta de administración.
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-[var(--color-text-secondary)]">
          Email
        </span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-cream)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-brand-blue)] focus:ring-2 focus:ring-[var(--color-brand-blue-pale)]"
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-[var(--color-text-secondary)]">
          Password
        </span>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-cream)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-brand-blue)] focus:ring-2 focus:ring-[var(--color-brand-blue-pale)]"
        />
      </label>

      <button
        type="submit"
        disabled={isPending}
        className="admin-button-primary w-full px-4 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Ingresando..." : "Entrar al panel"}
      </button>
    </form>
  );
}
