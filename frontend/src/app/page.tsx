import { AfterRevealSection } from "@/components/landing/after-reveal";
import { ExperienceSection } from "@/components/landing/experience";
import { EducatorsSection } from "@/components/landing/educators";
import { ExplainableSection } from "@/components/landing/explainable";
import { Hero } from "@/components/landing/hero";
import { UniverseSection } from "@/components/landing/universe";
import { SiteFooter } from "@/components/site-footer";
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

      <SiteFooter />
    </main>
  );
}
