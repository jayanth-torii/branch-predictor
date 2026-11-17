"use client";

import { useEffect, useRef } from "react";

/* ══════════════════════════════════════════════════════════════════════════
   HARDWARE BACK CLOSES AN OVERLAY

   On Android, a full-screen surface — a navigation drawer, a sheet, a
   full-screen dialog — is expected to behave like a pushed page: the system
   Back gesture dismisses it and leaves you on the screen underneath. A web
   overlay that ignores Back instead navigates the whole app away, so a
   student who swipes back to close the menu loses the page they were reading.
   That is the single most jarring difference between a web app and a native
   one on a phone, and it costs about thirty lines to fix.

   How it works: while the overlay is open, one history entry is pushed at the
   SAME url. A Back press pops it, which this hook reads as "close", not as a
   navigation. Closing from the UI instead — a close button, picking a
   destination, Escape — pops that entry on cleanup, so Back does not have to
   be pressed twice afterwards to leave the page.

   Next's own router state is copied onto the pushed entry. Without it the App
   Router treats the pop as an unknown entry and performs a full reload rather
   than a same-page restore.

   Phone-only: the drawer this serves does not exist at >=768px, and pushing
   history for a desktop popover would be surprising.
   ══════════════════════════════════════════════════════════════════════════ */

export function useBackClose(open: boolean, onClose: () => void): void {
  // Held in a ref so a caller passing an inline arrow does not re-run the
  // effect below on every render — which would push a new history entry each
  // time. Written in its own effect rather than during render: a ref write
  // during render is a React correctness rule, not a style preference, and it
  // costs nothing here because the value is only ever read later, from inside
  // the popstate handler. This effect is declared first, so it has already
  // run by the time the one below registers that handler.
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  });

  useEffect(() => {
    if (!open || typeof window === "undefined") return;
    if (!window.matchMedia("(max-width: 767.98px)").matches) return;

    // Tags OUR entry, so a pop that lands on somebody else's is left alone.
    const marker = `m-overlay-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
    window.history.pushState({ ...(window.history.state ?? {}), __overlay: marker }, "");

    let poppedByUser = false;

    function onPopState() {
      // Forward navigation landed back ON our entry — nothing to close.
      if (window.history.state?.__overlay === marker) return;
      poppedByUser = true;
      closeRef.current();
    }

    window.addEventListener("popstate", onPopState);

    return () => {
      window.removeEventListener("popstate", onPopState);
      // Closed from the UI rather than by Back: drop our entry so the next
      // Back press leaves the page instead of being swallowed.
      if (!poppedByUser && window.history.state?.__overlay === marker) {
        window.history.back();
      }
    };
  }, [open]);
}
