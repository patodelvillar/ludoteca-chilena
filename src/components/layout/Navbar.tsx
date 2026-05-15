"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

const navLinks = [
  { href: "/juegos", label: "Juegos" },
  { href: "/personas", label: "Personas" },
  { href: "/editoriales", label: "Editoriales" },
  { href: "/historia", label: "Historia" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-50"
      style={{
        background: "var(--color-brand-blue)",
        boxShadow: "var(--shadow-nav)",
      }}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <img
            src="/logo-original.png"
            alt="Ludoteca Chilena"
            className="h-10 w-auto transition-transform group-hover:scale-105"
          />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="nav-link text-white/90 hover:text-white text-sm font-medium tracking-wide uppercase"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden flex flex-col gap-1.5 p-2"
          aria-label="Menú"
        >
          <span
            className={`block h-0.5 w-6 bg-white transition-transform duration-300 ${
              mobileOpen ? "rotate-45 translate-y-2" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-6 bg-white transition-opacity duration-300 ${
              mobileOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-6 bg-white transition-transform duration-300 ${
              mobileOpen ? "-rotate-45 -translate-y-2" : ""
            }`}
          />
        </button>
      </nav>

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          mobileOpen ? "max-h-64" : "max-h-0"
        }`}
        style={{ background: "var(--color-brand-blue-dark)" }}
      >
        <div className="flex flex-col px-4 py-3 gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="text-white/90 hover:text-white hover:bg-white/10 rounded-lg px-4 py-3 text-sm font-medium tracking-wide uppercase transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
