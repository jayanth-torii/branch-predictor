"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, House, MessageCircle, Scale, Sparkles } from "lucide-react";
import { Suspense } from "react";

const ITEMS = [
  { href: "/", label: "Home", icon: House },
  { href: "/courses", label: "Courses", icon: GraduationCap },
  { href: "/compare", label: "Compare", icon: Scale },
  { href: "/results", label: "Profile", icon: Sparkles },
  { href: "/mentor", label: "Mentor", icon: MessageCircle },
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
              className="m-nav-item"
              data-active={active}
              aria-current={active ? "page" : undefined}
            >
              <span className="m-nav-icon">
                <item.icon className="size-[1.15rem]" aria-hidden="true" />
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
