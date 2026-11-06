"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import gsap from "gsap";
import { ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useHydrated } from "@/lib/client-hooks";
import { usePathora } from "@/lib/store";

const LINES = [
  "Connecting your interests…",
  "Mapping your strengths…",
  "Exploring your possibilities…",
];

export default function AnalyzingPage() {
  const router = useRouter();
  const reduced = useReducedMotion();
  const mounted = useHydrated();
  const [stage, setStage] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const sweepRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mounted) return;
    const state = usePathora.getState();
    if (!state.result) {
      if (Object.keys(state.answers).length === 0) {
        router.replace("/discover");
        return;
      }
      state.finishAssessment();
    }

    const duration = reduced ? 1.4 : 4.6;
    const ctx = gsap.context(() => {
      if (barRef.current) {
        gsap.fromTo(
          barRef.current,
          { scaleX: 0.02 },
          { scaleX: 1, duration, ease: "power1.inOut", transformOrigin: "left center" },
        );
      }
      if (sweepRef.current && !reduced) {
        gsap.to(sweepRef.current, { rotate: 1080, duration, ease: "none" });
      }
    }, rootRef);

    const stageTimers = [
      setTimeout(() => setStage(1), reduced ? 350 : 1300),
      setTimeout(() => setStage(2), reduced ? 700 : 2700),
    ];
    const finish = setTimeout(() => router.push("/results"), reduced ? 1500 : 4700);

    return () => {
      ctx.revert();
      stageTimers.forEach(clearTimeout);
      clearTimeout(finish);
    };
  }, [mounted, reduced, router]);

  return (
    // The sequence has to read as one uninterrupted frame, so on a phone it is
    // trimmed to fit the shortest common viewport (iPhone SE, 667px) without
    // scrolling. From 640px up every measurement is the original.
    <main
      ref={rootRef}
      className="relative grid min-h-dvh place-items-center overflow-hidden bg-navy px-5 py-12 text-white sm:py-16"
    >
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 size-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        aria-hidden="true"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(circle at center, black, transparent 70%)",
        }}
      />

      <div className="relative z-10 flex w-full max-w-lg flex-col items-center text-center">
        <div className="relative grid size-[220px] place-items-center sm:size-[280px]">
          <div className="absolute inset-0 rounded-full border border-white/10" />
          <div className="absolute inset-6 rounded-full border border-dashed border-white/10" />
          <div className="absolute inset-10 rounded-full border border-white/10" />
          <div
            ref={sweepRef}
            className="absolute inset-0 rounded-full"
            aria-hidden="true"
            style={{
              background:
                "conic-gradient(from 0deg, rgba(255,107,53,0.55) 0deg, rgba(255,107,53,0.12) 42deg, transparent 88deg, transparent 360deg)",
              maskImage: "radial-gradient(circle, transparent 34%, black 36%)",
              WebkitMaskImage: "radial-gradient(circle, transparent 34%, black 36%)",
            }}
          />
          <div
            className="relative size-24 rounded-full"
            style={{
              background:
                "radial-gradient(120% 120% at 32% 24%, #FFD0BD 0%, #FF8D5F 34%, #FF6B35 70%, #E1481A 100%)",
              boxShadow:
                "0 0 60px rgba(255,107,53,0.5), inset -10px -14px 24px rgba(129,36,8,0.3), inset 8px 8px 18px rgba(255,255,255,0.4)",
            }}
          />
          <span className="absolute size-24 animate-ping rounded-full border border-orange/40" aria-hidden="true" />
        </div>

        <p className="eyebrow mt-8 text-orange-soft sm:mt-10">Stage 02 · Analysis</p>
        <h1 className="display mt-3 text-3xl leading-tight text-balance sm:text-[2.4rem]">
          Building your direction.
        </h1>

        <div className="mt-6 w-full max-w-sm space-y-2.5 text-left sm:mt-7" aria-live="polite">
          {LINES.map((line, index) => (
            <motion.div
              key={line}
              initial={reduced ? false : { opacity: 0.25 }}
              animate={{ opacity: stage >= index ? 1 : 0.25 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-2.5"
            >
              <span
                className={`grid size-5 place-items-center rounded-full border text-[0.55rem] ${
                  stage >= index
                    ? "border-orange/40 bg-orange/15 text-orange"
                    : "border-white/15 text-white/30"
                }`}
              >
                {stage >= index ? "✓" : index + 1}
              </span>
              <p className={`text-sm ${stage >= index ? "text-white/90" : "text-white/55"}`}>
                {line}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="mt-7 h-[3px] w-full max-w-sm overflow-hidden rounded-full bg-white/10 sm:mt-9">
          <div ref={barRef} className="h-full rounded-full bg-orange" />
        </div>

        <p className="mt-4 text-[0.68rem] text-white/60">
          Rule-based scoring · your answers stay in this browser
        </p>

        <Link
          href="/results"
          className="mt-6 inline-flex min-h-11 items-center gap-1.5 text-xs font-semibold text-white/50 transition-colors hover:text-white sm:mt-8 md:min-h-0"
        >
          Skip the animation
          <ArrowRight className="size-3.5" aria-hidden="true" />
        </Link>
      </div>
    </main>
  );
}
