"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowRight,
  GraduationCap,
  Menu,
  ShieldCheck,
  Sparkles,
  X,
  type LucideIcon,
} from "lucide-react";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { useBackClose } from "@/lib/use-back-close";
import { cn } from "@/lib/utils";

const NAV: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/courses", label: "Courses", icon: GraduationCap },
  { href: "/results", label: "My profile", icon: Sparkles },
  { href: "/admin", label: "For educators", icon: ShieldCheck },
];

/** Everything inside the drawer that can take focus, in document order. */
const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

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
  const triggerRef = useRef<HTMLButtonElement>(null);
  const isAssessment = pathname?.startsWith("/assessment") || pathname?.startsWith("/analyzing");

  const close = useCallback(() => setOpen(false), []);

  /* The Android Back gesture dismisses the drawer like a pushed page, instead
     of navigating the whole app away from the page behind it. */
  useBackClose(open, close);

  /* ── Modal behaviour ───────────────────────────────────────────────────
     A modal surface owes the user four things, and the old dropdown gave two
     of them. Opening locks the page behind it (otherwise iOS happily scrolls
     the page under the scrim), Escape closes it, focus MOVES INTO it on open
     and RETURNS to the button that opened it on close, and Tab is trapped
     inside it — without the trap, a keyboard or screen-reader user tabs
     straight out of the open drawer and into a page they cannot see. */
  useEffect(() => {
    if (!open) return;

    const panel = panelRef.current;
    // Captured before focus moves, so focus goes back to the real trigger
    // even if the ref has been reassigned by a re-render in between.
    const restoreTo = (document.activeElement as HTMLElement | null) ?? triggerRef.current;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }
      if (event.key !== "Tab" || !panel) return;

      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (element) => element.offsetParent !== null,
      );
      if (items.length === 0) return;

      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;

      // Wrap at both ends. Focus starting on the panel itself counts as
      // "before the first item", so a first Tab lands on the first link.
      if (event.shiftKey && (active === first || active === panel)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      restoreTo?.focus?.();
    };
  }, [open]);

  if (isAssessment) return null;

  return (
    <>
      {/* The header carries `backdrop-blur`, which makes it the containing block
          for any `position: fixed` descendant — a scrim nested inside it covers
          only the 72px header strip. The scrim and drawer are therefore siblings
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
                  aria-current={active ? "page" : undefined}
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
              ref={triggerRef}
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="press state-layer grid size-11 place-items-center rounded-full border border-midnight/10 bg-surface text-midnight md:hidden"
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
            onClick={close}
          />
          {/* M3 modal navigation drawer. `aria-modal` plus the focus trap above
              is what tells a screen reader the rest of the page is inert. */}
          <div
            id="site-menu"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            tabIndex={-1}
            className="m-drawer outline-none md:hidden"
          >
            <div className="flex items-center justify-between px-5 pb-2">
              <span className="eyebrow">Menu</span>
              <button
                type="button"
                onClick={close}
                aria-label="Close menu"
                className="press state-layer -mr-2 grid size-11 place-items-center rounded-full text-slate-ink"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>

            <nav className="flex flex-col gap-1 px-3 py-1" aria-label="Mobile navigation">
              {NAV.map((item) => {
                const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={close}
                    aria-current={active ? "page" : undefined}
                    data-active={active}
                    className="m-drawer-item state-layer"
                  >
                    <item.icon className="size-5 shrink-0" aria-hidden="true" />
                    <span className="min-w-0 flex-1 truncate">{item.label}</span>
                    {active && (
                      <span
                        aria-hidden="true"
                        className="size-1.5 shrink-0 rounded-full bg-orange"
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* The primary action sits at the foot of the drawer, where a thumb
                reaches without stretching — not at the top, where it would be
                the furthest point on the sheet from the hand holding it. */}
            <div className="mt-auto px-5 pt-5">
              <Link href="/discover" onClick={close} className="btn btn-primary w-full">
                Start my journey
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </>
      )}
    </>
  );
}
