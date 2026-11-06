"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";
import { DIMENSIONS, DIMENSION_META, type InterestProfile } from "@/lib/types";

export function InterestRadar({
  profile,
  compare,
  height = 300,
  dark = false,
}: {
  profile: InterestProfile;
  compare?: InterestProfile | null;
  height?: number;
  dark?: boolean;
}) {
  const data = DIMENSIONS.map((dimension) => ({
    dimension: DIMENSION_META[dimension].short,
    you: profile[dimension],
    other: compare ? compare[dimension] : undefined,
  }));

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="72%" margin={{ top: 8, right: 16, bottom: 8, left: 16 }}>
          {/* `dark` means "this chart sits on an always-dark panel", NOT "the
              page is in dark mode". On a flipping surface the grid and labels
              must follow the theme, so they read the ink tokens directly: the
              literal #101B3D grid vanished against the near-black dark card and
              the #59657f labels fell to about 2:1 on it.

              These are `var()` in SVG presentation attributes, which browsers
              do substitute. A Tailwind `fill-*` class does NOT work for the
              tick: Recharts puts className on the wrapping <g> and leaves
              `fill="#808080"` on the <text>, and an attribute on the element
              beats a fill inherited from its parent — the labels came out
              default grey. */}
          <PolarGrid
            stroke={dark ? "#FFFFFF" : "var(--color-midnight)"}
            strokeOpacity={dark ? 0.16 : 0.2}
          />
          <PolarAngleAxis
            dataKey="dimension"
            tick={{
              fill: dark ? "rgba(255,255,255,0.72)" : "var(--color-slate-ink)",
              fontSize: 11,
              fontWeight: 600,
            }}
          />
          {compare && (
            <Radar
              name="Comparison"
              dataKey="other"
              stroke={dark ? "#9CC0FF" : "var(--color-indigo)"}
              fill={dark ? "#9CC0FF" : "var(--color-indigo)"}
              fillOpacity={0.12}
              strokeWidth={1.6}
              strokeDasharray="4 4"
              isAnimationActive={false}
            />
          )}
          <Radar
            name="Your profile"
            dataKey="you"
            stroke="#FF6B35"
            fill="#FF6B35"
            fillOpacity={0.22}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
