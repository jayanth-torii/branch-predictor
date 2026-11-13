/* ══════════════════════════════════════════════════════════════════════════
   LANDING ARTWORK — the hand-drawn pieces the landing bands use.

   These are hand-drawn SVG rather than raster renders on purpose:

   • they inherit the theme tokens, so nothing has to be re-exported when the
     palette moves and nothing looks wrong on the dark page;
   • they stay sharp at any size and cost a few kB instead of a few hundred;
   • they carry no other product's branding, which the borrowed 3D renders in
     C:\hack all do (a "V" mark on the laptop screen and the mug).

   Everything here is decorative. Each root carries aria-hidden and the callers
   pass no alt text, so a screen reader walks straight past them to the copy
   that actually states the claim.
   ══════════════════════════════════════════════════════════════════════════ */

/** Leaf positions along one laurel branch, bottom to top. */
const LAUREL_LEAVES: { x: number; y: number; r: number }[] = [
  { x: 24, y: 116, r: -48 },
  { x: 18, y: 100, r: -62 },
  { x: 15, y: 83, r: -74 },
  { x: 17, y: 66, r: -88 },
  { x: 24, y: 50, r: -104 },
  { x: 35, y: 37, r: -120 },
];

/**
 * Laurel wreath around a graduation cap on a lit plinth — the "this is the
 * match" crest in the card header. One branch is drawn and mirrored, so the
 * wreath is symmetric by construction rather than by eye.
 */
export function LaurelCrest({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 170 152"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <defs>
        <linearGradient id="crest-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffd9a8" />
          <stop offset="55%" stopColor="#ffb061" />
          <stop offset="100%" stopColor="#ff6b35" />
        </linearGradient>
        <linearGradient id="crest-cap" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="#ffa469" />
          <stop offset="100%" stopColor="#f0541b" />
        </linearGradient>
        <radialGradient id="crest-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#ff8a5f" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#ff6b35" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Plinth glow, then the plinth itself. */}
      <ellipse cx="85" cy="126" rx="62" ry="22" fill="url(#crest-glow)" />
      <ellipse cx="85" cy="124" rx="40" ry="10" fill="url(#crest-gold)" opacity="0.95" />
      <ellipse cx="85" cy="120" rx="40" ry="10" fill="#1a1205" opacity="0.55" />
      <ellipse cx="85" cy="119" rx="34" ry="7.5" fill="url(#crest-gold)" opacity="0.5" />

      {/* Wreath — left branch drawn once, right branch mirrored about x = 85. */}
      {[false, true].map((mirrored) => (
        <g
          key={String(mirrored)}
          transform={mirrored ? "translate(170 0) scale(-1 1)" : undefined}
          fill="url(#crest-gold)"
        >
          <path
            d="M32 122 C 10 98 11 58 44 30"
            fill="none"
            stroke="url(#crest-gold)"
            strokeWidth="3.4"
            strokeLinecap="round"
            opacity="0.95"
          />
          {LAUREL_LEAVES.map((leaf) => (
            <ellipse
              key={`${leaf.x}-${leaf.y}`}
              cx={leaf.x}
              cy={leaf.y}
              rx="11"
              ry="4.8"
              transform={`rotate(${leaf.r} ${leaf.x} ${leaf.y})`}
            />
          ))}
        </g>
      ))}

      {/* Mortarboard. */}
      <g>
        <path d="M85 50 L128 66 L85 82 L42 66 Z" fill="url(#crest-cap)" />
        <path d="M85 50 L128 66 L85 72 Z" fill="#ffb98c" opacity="0.5" />
        <path
          d="M63 73 L63 90 C63 98 107 98 107 90 L107 73 L85 81 Z"
          fill="url(#crest-cap)"
        />
        <path
          d="M126 67 L126 88"
          stroke="url(#crest-gold)"
          strokeWidth="2.6"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="126" cy="91" r="4.6" fill="url(#crest-gold)" />
      </g>
    </svg>
  );
}

/**
 * Flat-vector study scene for the left column: a laptop showing the cap mark,
 * a stack of books, a target, a bulb and a mug. Drawn in the brand palette so
 * it sits on the light band without the dark halo a keyed-out render leaves.
 */
export function StudyScene({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 560 300"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <defs>
        <linearGradient id="scene-orange" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#ff8a5f" />
          <stop offset="100%" stopColor="#ed5a1f" />
        </linearGradient>
        <linearGradient id="scene-navy" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#24355f" />
          <stop offset="100%" stopColor="#101b3d" />
        </linearGradient>
        <linearGradient id="scene-silver" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#d7ddec" />
        </linearGradient>
        <linearGradient id="scene-screen" x1="0.1" y1="0" x2="0.9" y2="1">
          <stop offset="0%" stopColor="#1b2a52" />
          <stop offset="100%" stopColor="#0b1226" />
        </linearGradient>
        <radialGradient id="scene-floor" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#ff6b35" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#ff6b35" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="scene-bulb" cx="0.5" cy="0.4" r="0.6">
          <stop offset="0%" stopColor="#ffe9a8" />
          <stop offset="100%" stopColor="#ffb13d" />
        </radialGradient>
      </defs>

      {/* Warm pool of light the whole scene stands in. */}
      <ellipse cx="285" cy="266" rx="250" ry="34" fill="url(#scene-floor)" />

      {/* Three spark strokes, mirroring the ones beside the headline. */}
      <g stroke="#ff6b35" strokeWidth="7" strokeLinecap="round" opacity="0.9">
        <path d="M104 44 L94 72" />
        <path d="M130 34 L126 66" />
        <path d="M156 40 L162 68" />
      </g>

      {/* ── Laptop ─────────────────────────────────────────────────────── */}
      <g>
        <rect x="168" y="70" width="244" height="158" rx="14" fill="url(#scene-silver)" />
        <rect x="179" y="81" width="222" height="136" rx="8" fill="url(#scene-screen)" />
        {/* The cap mark on the screen, in white so it reads at thumbnail size. */}
        <g transform="translate(290 149)" fill="#ffffff">
          <path d="M0 -26 L38 -11 L0 4 L-38 -11 Z" />
          <path d="M-19 -3 L-19 12 C-19 19 19 19 19 12 L19 -3 L0 3 Z" opacity="0.88" />
          <path d="M36 -10 L36 9" stroke="#ffffff" strokeWidth="2.6" strokeLinecap="round" />
          <circle cx="36" cy="12" r="4" />
        </g>
        {/* Base: a shallow wedge, wider at the front edge. */}
        <path
          d="M150 228 H430 L452 258 Q452 266 442 266 H138 Q128 266 128 258 Z"
          fill="url(#scene-silver)"
        />
        <path d="M253 232 H327 Q331 232 330 236 H250 Q249 232 253 232 Z" fill="#c3cbdf" />
      </g>

      {/* ── Book stack ─────────────────────────────────────────────────── */}
      <g>
        <rect x="36" y="222" width="168" height="26" rx="6" fill="url(#scene-navy)" />
        <rect x="46" y="227" width="150" height="16" rx="3" fill="#f3f5fb" />
        <rect x="36" y="222" width="14" height="26" rx="6" fill="url(#scene-navy)" />
        <rect x="48" y="194" width="160" height="26" rx="6" fill="url(#scene-orange)" />
        <rect x="58" y="199" width="142" height="16" rx="3" fill="#fff6f1" />
        <rect x="48" y="194" width="14" height="26" rx="6" fill="url(#scene-orange)" />
      </g>

      {/* ── Target ─────────────────────────────────────────────────────── */}
      <g transform="translate(78 150)">
        <circle r="34" fill="url(#scene-orange)" />
        <circle r="23" fill="#ffffff" />
        <circle r="13" fill="url(#scene-orange)" />
        <circle r="5" fill="#ffffff" />
        <path
          d="M8 -8 L44 -44"
          stroke="url(#scene-navy)"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path d="M30 -44 L46 -46 L44 -30 Z" fill="url(#scene-navy)" />
      </g>

      {/* ── Lightbulb ──────────────────────────────────────────────────── */}
      <g transform="translate(452 86)">
        <circle r="44" fill="#ffd27a" opacity="0.28" />
        <path
          d="M0 -26 C16 -26 27 -15 27 0 C27 11 19 16 16 25 L-16 25 C-19 16 -27 11 -27 0 C-27 -15 -16 -26 0 -26 Z"
          fill="url(#scene-bulb)"
        />
        <rect x="-14" y="27" width="28" height="8" rx="4" fill="#cfd6e6" />
        <rect x="-11" y="37" width="22" height="7" rx="3.5" fill="#aeb8cf" />
        <g stroke="#ffb13d" strokeWidth="5" strokeLinecap="round">
          <path d="M-44 -34 L-34 -27" />
          <path d="M44 -34 L34 -27" />
          <path d="M0 -50 L0 -40" />
        </g>
      </g>

      {/* ── Mug ────────────────────────────────────────────────────────── */}
      <g transform="translate(470 196)">
        <path
          d="M46 8 C62 8 62 34 46 34 L40 34 L40 8 Z"
          fill="none"
          stroke="#cfd6e6"
          strokeWidth="9"
          strokeLinecap="round"
        />
        <path d="M-6 0 H44 V40 Q44 56 26 56 H12 Q-6 56 -6 40 Z" fill="url(#scene-navy)" />
        <g transform="translate(19 26)" fill="#ff8a5f">
          <path d="M0 -11 L14 -4.5 L0 2 L-14 -4.5 Z" />
          <path d="M0 2 L14 8.5 L0 15 L-14 8.5 Z" opacity="0.75" />
        </g>
        <g stroke="#ff8a5f" strokeWidth="3.4" strokeLinecap="round" fill="none" opacity="0.75">
          <path d="M6 -10 C 12 -16 0 -22 6 -28" />
          <path d="M24 -10 C 30 -16 18 -22 24 -28" />
        </g>
      </g>
    </svg>
  );
}

/**
 * Checklist card for the stream-gate panel — the gate as a ticked list with a
 * confirmation badge, so the "Open" state reads at a glance.
 */
export function GateChecklist({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 132 128"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <defs>
        <linearGradient id="gate-orange" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#ff8a5f" />
          <stop offset="100%" stopColor="#ed5a1f" />
        </linearGradient>
      </defs>

      <rect x="10" y="6" width="98" height="112" rx="14" fill="#ffffff" />
      <rect
        x="10"
        y="6"
        width="98"
        height="112"
        rx="14"
        fill="none"
        stroke="#101b3d"
        strokeOpacity="0.1"
      />

      {[0, 1, 2].map((row) => (
        <g key={row} transform={`translate(26 ${30 + row * 26})`}>
          <path
            d="M0 2 L5 7 L13 -3"
            fill="none"
            stroke="url(#gate-orange)"
            strokeWidth="3.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <rect
            x="22"
            y="-1"
            width={row === 2 ? 36 : 56}
            height="6"
            rx="3"
            fill="#101b3d"
            opacity="0.16"
          />
        </g>
      ))}

      <circle cx="98" cy="98" r="24" fill="url(#gate-orange)" />
      <path
        d="M88 98 L95 105 L109 91"
        fill="none"
        stroke="#ffffff"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
