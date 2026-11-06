"use client";

import { Moon, Sun } from "lucide-react";

export const THEME_KEY = "pathora-theme";

/**
 * Stateless by design. The inline script in the root layout sets
 * `data-theme` on <html> before first paint, and CSS keys the two icons off
 * that attribute (see `.theme-icon-*` in globals.css). So there is no React
 * state to hydrate, no mismatch to reconcile, and no flash of the wrong icon.
 *
 * The label stays neutral ("Toggle theme") because a label that named the
 * target theme would be wrong until JS measured the current one.
 */
export function ThemeToggle({ className = "" }: { className?: string }) {
  function toggle() {
    const root = document.documentElement;
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      // Private mode or blocked storage: the theme still applies to this page.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle light or dark theme"
      title="Toggle light or dark theme"
      className={`group relative grid size-11 shrink-0 place-items-center overflow-hidden rounded-full border border-midnight/10 bg-surface text-midnight transition active:scale-95 md:size-10 ${className}`}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-orange/0 transition-colors group-hover:bg-orange/10"
      />
      <Sun aria-hidden="true" className="theme-icon-sun absolute size-[1.05rem]" />
      <Moon aria-hidden="true" className="theme-icon-moon absolute size-[1.05rem]" />
    </button>
  );
}
