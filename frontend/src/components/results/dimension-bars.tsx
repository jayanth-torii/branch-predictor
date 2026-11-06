import { DIMENSIONS, DIMENSION_META, type InterestProfile } from "@/lib/types";

export function DimensionBars({
  profile,
  compare,
}: {
  profile: InterestProfile;
  compare?: InterestProfile | null;
}) {
  const sorted = [...DIMENSIONS].sort((a, b) => profile[b] - profile[a]);

  return (
    <div className="space-y-3.5">
      {sorted.map((dimension) => {
        const meta = DIMENSION_META[dimension];
        return (
          <div key={dimension}>
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-xs font-semibold text-midnight">{meta.label}</p>
              <p className="text-[0.68rem] font-semibold tabular-nums text-slate-ink">
                {profile[dimension]}/100
              </p>
            </div>
            <div className="relative mt-1.5 h-2 overflow-hidden rounded-full bg-midnight/[0.07]">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.max(2, profile[dimension])}%`,
                  background: meta.color,
                  opacity: 0.9,
                }}
              />
              {compare && (
                <span
                  className="absolute top-0 h-full w-[2px] bg-midnight/50"
                  style={{ left: `${Math.max(2, compare[dimension])}%` }}
                  title={`Comparison: ${compare[dimension]}`}
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
