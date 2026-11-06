import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AfterRevealSection } from "@/components/landing/after-reveal";
import { ExperienceSection } from "@/components/landing/experience";
import { EducatorsSection } from "@/components/landing/educators";
import { ExplainableSection } from "@/components/landing/explainable";
import { Hero } from "@/components/landing/hero";
import { UniverseSection } from "@/components/landing/universe";
import { SiteFooter } from "@/components/site-footer";
import { Reveal } from "@/components/ui";
import { COURSES } from "@/lib/courses";

/**
 * The landing page is a composition, not a monolith. Each narrative section
 * owns its own file and its own data under `components/landing/`, so one can be
 * redesigned without touching the others.
 */
export default function LandingPage() {
  return (
    <main>
      <Hero courseCount={COURSES.length} />
      <ExperienceSection />
      <ExplainableSection />
      <UniverseSection />
      <AfterRevealSection />

      <EducatorsSection />

      {/* Final CTA */}
      <section className="mx-auto w-full max-w-6xl px-5 pb-4 sm:px-8">
        <Reveal>
          <div className="glass glass-sheen relative isolate overflow-hidden !rounded-[2rem] px-6 py-16 text-center sm:px-12 sm:py-24">
            <div className="aurora" aria-hidden="true" />
            <span
              className="glow left-1/2 top-0 size-72 -translate-x-1/2 -translate-y-1/3"
              aria-hidden="true"
            />
            <p className="eyebrow relative">Your move</p>
            <h2 className="display relative mx-auto mt-3 max-w-2xl text-[2.1rem] leading-[1.06] text-balance text-midnight sm:text-[3.2rem]">
              You do not need to know the answer yet.
            </h2>
            <p className="relative mx-auto mt-4 max-w-lg text-[0.98rem] leading-relaxed text-slate-ink">
              You need better questions. Ten of them, about five minutes, and a profile you can
              actually argue with.
            </p>
            <div className="relative mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/discover" className="btn btn-primary">
                Start my journey
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <Link href="/courses" className="btn btn-ghost">
                Explore UG courses
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      <SiteFooter />
    </main>
  );
}
