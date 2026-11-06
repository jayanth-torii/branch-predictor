import Link from "next/link";
import { ArrowRight, Compass, GraduationCap, Layers, Trophy } from "lucide-react";
import type { Course, Stream } from "@/lib/types";

export function JourneyMap({
  stream,
  course,
  careerTitle,
  careerSlug,
}: {
  stream: Stream | "";
  course: Course;
  careerTitle: string;
  careerSlug: string;
}) {
  const nodes = [
    {
      icon: Compass,
      label: "Today",
      title: stream ? `${stream} · PU` : "PU student",
      body: "Your current stream sets the eligibility gate, not your ceiling.",
      href: "/discover",
      cta: "Update details",
    },
    {
      icon: GraduationCap,
      label: "Next",
      title: course.name,
      body: `${course.degree} · ${course.duration}`,
      href: `/courses/${course.slug}`,
      cta: "Course details",
    },
    {
      icon: Layers,
      label: "Build",
      title: course.skills[0],
      body: `Start with ${course.skills.slice(0, 2).join(" and ").toLowerCase()} — projects beat certificates.`,
      href: `/courses/${course.slug}#skills`,
      cta: "Skills to build",
    },
    {
      icon: Trophy,
      label: "Explore",
      title: careerTitle,
      body: "One possible destination — not the only one your degree unlocks.",
      href: `/career/${careerSlug}`,
      cta: "Day in the life",
    },
  ];

  return (
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
      {nodes.map((node, index) => (
        <div key={node.label} className="relative">
          {index < nodes.length - 1 && (
            <span
              className="absolute -bottom-2.5 left-1/2 z-10 grid size-5 -translate-x-1/2 place-items-center rounded-full border border-midnight/10 bg-surface text-midnight/40 md:hidden"
              aria-hidden="true"
            >
              <ArrowRight className="size-3 rotate-90" />
            </span>
          )}
          <div className="card h-full p-5">
            <div className="flex items-center justify-between">
              <span className="chip !border-midnight/10 !px-2.5 !py-1 chip-xs">
                {node.label}
              </span>
              <node.icon className="size-4 text-orange" aria-hidden="true" />
            </div>
            <h4 className="display mt-3 text-base leading-snug text-midnight">{node.title}</h4>
            <p className="mt-1.5 text-[0.72rem] leading-relaxed text-slate-ink">{node.body}</p>
            <Link
              href={node.href}
              className="mt-2 inline-flex min-h-11 items-center gap-1 text-[0.66rem] font-bold text-orange hover:underline md:mt-3 md:min-h-0"
            >
              {node.cta}
              <ArrowRight className="size-3" aria-hidden="true" />
            </Link>
          </div>
          {index < nodes.length - 1 && (
            <span
              className="absolute -right-2.5 top-1/2 z-10 hidden size-5 -translate-y-1/2 place-items-center rounded-full border border-midnight/10 bg-surface text-midnight/40 lg:grid"
              aria-hidden="true"
            >
              <ArrowRight className="size-3" />
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
