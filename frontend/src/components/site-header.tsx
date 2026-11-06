"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Menu, X } from "lucide-react";
import { Suspense, useEffect, useRef, useState } from "react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/courses", label: "Courses" },
  { href: "/compare", label: "Compare" },
  { href: "/mentor", label: "Mentor" },
  { href: "/results", label: "My profile" },
  { href: "/admin", label: "For educators" },
];

export function SiteHeader() {
  return (
    <Suspense fallback={<div className="h-[72px] border-b border-midnight/[0.06] bg-arctic" />}>
      <SiteHeaderInner />
    </Suspense>
  );
}

function SiteHeaderInner() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const isAssessment = pathname?.startsWith("/assessment") || pathname?.startsWith("/analyzing");

  /**
   * While the sheet is up: lock the page behind it (otherwise iOS scrolls the
   * page under the scrim), close on Escape, and move focus into the panel so a
   * keyboard or screen-reader user lands inside the thing that just opened.
   */
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (isAssessment) return null;

  return (
    <>
      {/* The header carries `backdrop-blur`, which makes it the containing block
          for any `position: fixed` descendant — a scrim nested inside it covers
          only the 72px header strip. The scrim and sheet are therefore siblings
          of the header, and the header is lifted above the scrim while open so
          its close button stays reachable. */}
      <header
        className={cn(
          "sticky top-0 border-b border-midnight/[0.06] bg-arctic/85 backdrop-blur-xl",
          open ? "z-[63]" : "z-50",
        )}
      >
      <div className="mx-auto flex h-[72px] w-full max-w-6xl items-center justify-between gap-6 px-5 sm:px-8">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-full px-3.5 py-2 text-sm font-medium text-slate-ink transition-colors hover:bg-surface hover:text-midnight",
                  active && "bg-surface text-midnight shadow-sm",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="hidden items-center gap-2.5 md:flex">
          <ThemeToggle />
          <Link href="/discover" className="btn btn-primary !py-2.5 !text-[0.82rem]">
            Start my journey
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="grid size-11 place-items-center rounded-full border border-midnight/10 bg-surface text-midnight transition active:scale-95 md:hidden"
          aria-expanded={open}
          aria-controls="site-menu"
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
        </div>
      </div>

      </header>

      {open && (
        <>
          <button
            type="button"
            className="m-scrim md:hidden"
            aria-label="Close menu"
            tabIndex={-1}
            onClick={() => setOpen(false)}
          />
          <div
            id="site-menu"
            ref={panelRef}
            tabIndex={-1}
            className="m-sheet fixed inset-x-0 top-[72px] z-[62] max-h-[calc(100dvh-72px)] overflow-y-auto border-b border-midnight/[0.07] bg-surface px-5 pb-6 pt-3 shadow-lift outline-none md:hidden"
          >
            <nav className="flex flex-col" aria-label="Mobile navigation">
              {NAV.map((item) => {
                const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex min-h-[3rem] items-center justify-between border-b border-midnight/5 text-[0.95rem] font-semibold last:border-0",
                      active ? "text-orange" : "text-midnight",
                    )}
                  >
                    {item.label}
                    <ArrowRight className="size-4 opacity-35" aria-hidden="true" />
                  </Link>
                );
              })}
            </nav>
            <Link
              href="/discover"
              onClick={() => setOpen(false)}
              className="btn btn-primary mt-4 w-full"
            >
              Start my journey
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </>
      )}
    </>
  );
}
