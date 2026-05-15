"use client";

import { useEffect, useRef, useState } from "react";

interface StatCardProps {
  value: number;
  label: string;
  icon: React.ReactNode;
  delay?: number;
}

export function StatCard({ value, label, icon, delay = 0 }: StatCardProps) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const timeout = setTimeout(() => {
      const duration = 1500;
      const steps = 40;
      const increment = value / steps;
      let current = 0;
      const interval = setInterval(() => {
        current += increment;
        if (current >= value) {
          setCount(value);
          clearInterval(interval);
        } else {
          setCount(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timeout);
  }, [isVisible, value, delay]);

  return (
    <div
      ref={ref}
      className={`flex flex-col items-center gap-3 p-6 rounded-2xl transition-all duration-500 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
      style={{
        background: "rgba(255,255,255,0.8)",
        backdropFilter: "blur(8px)",
        border: "1px solid var(--color-border)",
        transitionDelay: `${delay}ms`,
      }}
    >
      <div
        className="p-3 rounded-xl"
        style={{ background: "var(--color-brand-blue-pale)" }}
      >
        {icon}
      </div>
      <span
        className="text-4xl font-bold tabular-nums"
        style={{
          fontFamily: "var(--font-heading)",
          color: "var(--color-brand-blue)",
        }}
      >
        {count}
      </span>
      <span
        className="text-sm font-medium uppercase tracking-wider"
        style={{ color: "var(--color-text-muted)" }}
      >
        {label}
      </span>
    </div>
  );
}
