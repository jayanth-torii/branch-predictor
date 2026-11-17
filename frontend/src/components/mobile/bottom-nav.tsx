"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, House, Sparkles } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Suspense } from "react";

/* ══════════════════════════════════════════════════════════════════════════
   MATERIAL 3 NAVIGATION BAR

   M3's primary navigation for a compact window. 80dp tall, up to five
   destinations, and each one carrying the full anatomy: a 64×32dp active
   INDICATOR pill behind the icon, the icon itself, and an always-visible
   label beneath. The metrics live in globals.css under `.m-nav-item`.

   Why the indicator is a pill behind the icon and not, say, an underline:
   the pill does not move the label when selection changes, so the row of
   labels stays still as a student moves between tabs.

   THREE cues mark the selected destination — the pill, a heavier icon
   stroke, and the orange tint. Only the last is colour, so "which tab am I
   on" still reads for a student with a colour vision deficiency, and still
   reads in bright sunlight where tint is the first thing to go.

   On the icon treatment: M3 specifies the selected icon swap from outline to
   FILLED. Lucide is a stroke-only family — filling `GraduationCap` or
   `Scale` produces an unreadable blob rather than a glyph — so the weight
   change stands in for the fill. It is the same idea (a shape change, not a
   colour change) delivered by the means this icon set actually supports.
   ══════════════════════════════════════════════════════════════════════════ */

/* Three destinations, down from five. M3 allows three to five in a navigation
   bar, so the bar is still the right component — but each item now gets a
   third of the width instead of a fifth, which is a real gain at 360px. */
const ITEMS = [
  { href: "/", label: "Home", icon: House },
  { href: "/courses", label: "Courses", icon: GraduationCap },
  { href: "/results", label: "Profile", icon: Sparkles },
] as const;

/**
 * Routes that own the full screen and must not show the bar:
 * the onboarding/quest flow (one decision per screen), the join handoff, and
 * the educator workspace, which has its own section tabs.
 */
const HIDDEN_PREFIXES = ["/discover", "/assessment", "/analyzing", "/join", "/admin"];

export function MobileBottomNav() {
  return (
    <Suspense fallback={null}>
      <MobileBottomNavInner />
    </Suspense>
  );
}

function MobileBottomNavInner() {
  const pathname = usePathname() ?? "/";
  const reduceMotion = useReducedMotion();

  if (HIDDEN_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    return null;
  }

  return (
    <>
      {/* Reserves the strip the fixed bar covers, so the last element of a page
          and the footer stay reachable. Both the bar and this spacer are shown
          and sized entirely by the mobile layer in globals.css — a `md:hidden`
          utility here would lose to `.m-nav`'s own unlayered `display`. */}
      <div aria-hidden="true" className="m-nav-spacer" />
      <nav className="m-nav" aria-label="Primary">
        {ITEMS.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="m-nav-item press"
              data-active={active}
              aria-current={active ? "page" : undefined}
            >
              <span className="m-nav-icon">
                {active &&
                  (reduceMotion ? (
                    <span aria-hidden="true" className="m-nav-indicator" />
                  ) : (
                    /* One shared pill, so it SLIDES from the old destination
                       to the new one rather than blinking out and in. Framer
                       matches the two by layoutId across the unmount. */
                    <motion.span
                      aria-hidden="true"
                      layoutId="m-nav-indicator"
                      className="m-nav-indicator"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  ))}
                <item.icon
                  className="size-6"
                  strokeWidth={active ? 2.5 : 1.8}
                  aria-hidden="true"
                />
              </span>
              {/* A real element, not a bare text node, so the compact-height
                  rule can visually hide the label while leaving it in the
                  accessibility tree — a landscape phone shows icons only, but
                  a screen reader still announces the destination. */}
              <span className="m-nav-label">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
