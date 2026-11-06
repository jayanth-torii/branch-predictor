"use client";

import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Compass,
  GraduationCap,
  Info,
  TrendingUp,
  Users,
} from "lucide-react";
import { AdminBarChart } from "@/components/admin/admin-bar-chart";
import {
  batchStats,
  courseDemand,
  interestDistribution,
} from "@/lib/batches";
import { COURSE_BY_SLUG } from "@/lib/courses";
import { usePathora } from "@/lib/store";
import { DIMENSIONS, DIMENSION_META } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default function AdminOverviewPage() {
  const admin = usePathora((state) => state.admin);
  const submissions = admin.submissions;
  const batches = admin.batches;

  const distribution = interestDistribution(submissions);
  const demand = courseDemand(submissions).slice(0, 6);
  const capacity = batches.reduce((sum, batch) => sum + batch.capacity, 0);
  const completion = capacity ? Math.round((submissions.length / capacity) * 100) : 0;
  const dominant = distribution.slice().sort((a, b) => b.count - a.count)[0];
  const undecided = submissions.filter((submission) => submission.undecided).length;
  const sampleCount = submissions.filter((submission) => submission.sample).length;

  const chartData = DIMENSIONS.map((dimension) => ({
    name: DIMENSION_META[dimension].short,
    count: distribution.find((entry) => entry.dimension === dimension)?.count ?? 0,
  }));

  const recent = submissions
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="display text-xl text-midnight">Batch overview</h2>
          <p className="mt-1 text-xs text-slate-ink">
            {batches.length} batches · {submissions.length} assessments recorded
          </p>
        </div>
        {sampleCount > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-fog px-3 py-1.5 text-[0.66rem] font-semibold text-indigo">
            <Info className="size-3.5" aria-hidden="true" />
            {sampleCount} sample records included for demonstration
          </span>
        )}
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Users}
          label="Students assessed"
          value={String(submissions.length)}
          note={`${capacity} seats across all batches`}
        />
        <StatCard
          icon={TrendingUp}
          label="Completion rate"
          value={`${completion}%`}
          note="Assessments completed vs batch capacity"
        />
        <StatCard
          icon={Compass}
          label="Dominant interest"
          value={dominant?.count ? DIMENSION_META[dominant.dimension].short : "—"}
          note={dominant?.count ? `${dominant.count} students, ${dominant.percent}% of records` : "No data yet"}
        />
        <StatCard
          icon={BarChart3}
          label="Still exploring"
          value={String(undecided)}
          note="Chose “surprise me” or skipped questions"
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="card p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="eyebrow">Interest distribution</p>
              <h3 className="display mt-1.5 text-lg text-midnight">What this batch leans toward</h3>
            </div>
            <Link
              href="/admin/analytics"
              className="inline-flex min-h-11 shrink-0 items-center text-[0.68rem] font-bold text-orange hover:underline md:min-h-0"
            >
              Deep dive
            </Link>
          </div>
          <div className="mt-3">
            <AdminBarChart
              data={chartData}
              colors={DIMENSIONS.map((dimension) => DIMENSION_META[dimension].color)}
              height={230}
            />
          </div>
          <p className="mt-1 text-[0.66rem] leading-relaxed text-slate-ink">
            Based on each student&apos;s single strongest dimension, not their full profile.
          </p>
        </div>

        <div className="card p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="eyebrow">Course demand</p>
              <h3 className="display mt-1.5 text-lg text-midnight">Top recommended programmes</h3>
            </div>
            <GraduationCap className="size-4 text-orange" aria-hidden="true" />
          </div>
          <div className="mt-3">
            <AdminBarChart data={demand} color="var(--color-indigo)" height={230} />
          </div>
          <p className="mt-1 text-[0.66rem] leading-relaxed text-slate-ink">
            Counts show each student&apos;s highest-ranked eligible course.
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-midnight/[0.07] px-5 py-4">
            <div>
              <p className="eyebrow">Recent activity</p>
              <h3 className="display mt-1 text-lg text-midnight">Latest assessments</h3>
            </div>
            <Link
              href="/admin/students"
              className="inline-flex min-h-11 shrink-0 items-center gap-1 text-[0.68rem] font-bold text-orange hover:underline md:min-h-0"
            >
              All students
              <ArrowRight className="size-3" aria-hidden="true" />
            </Link>
          </div>
          <div className="divide-y divide-midnight/[0.06]">
            {recent.length === 0 && (
              <p className="px-5 py-8 text-sm text-slate-ink">No assessments recorded yet.</p>
            )}
            {recent.map((submission) => (
              <div
                key={submission.id}
                className="flex flex-col gap-1 px-5 py-3 md:flex-row md:items-center md:justify-between md:gap-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-midnight">
                    {submission.name}
                    {submission.sample && (
                      <span className="ml-1.5 rounded bg-fog px-1.5 py-0.5 text-[0.55rem] font-semibold uppercase tracking-wide text-indigo">
                        sample
                      </span>
                    )}
                  </p>
                  <p className="mt-0.5 text-[0.64rem] text-slate-ink">
                    {submission.stream || "No stream"} · {submission.archetype.replace("The ", "")}
                  </p>
                </div>
                <div className="min-w-0 md:shrink-0 md:text-right">
                  <p className="text-[0.66rem] font-semibold text-midnight">
                    {COURSE_BY_SLUG[submission.topCourseSlug]?.name ?? "—"}
                  </p>
                  <p className="text-[0.6rem] text-slate-ink">{formatDate(submission.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="border-b border-midnight/[0.07] px-5 py-4">
            <p className="eyebrow">Batches</p>
            <h3 className="display mt-1 text-lg text-midnight">Completion by group</h3>
          </div>
          <div className="divide-y divide-midnight/[0.06]">
            {batches.map((batch) => {
              const stats = batchStats(batch, submissions);
              return (
                <div key={batch.id} className="px-5 py-3.5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-midnight">{batch.name}</p>
                      <p className="mt-0.5 font-mono text-[0.62rem] text-slate-ink">{batch.code}</p>
                    </div>
                    <span className="text-[0.66rem] font-bold text-midnight">
                      {stats.completed}/{batch.capacity}
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-midnight/[0.07]">
                    <div
                      className="h-full rounded-full bg-orange"
                      style={{ width: `${Math.min(100, stats.completionRate)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <Link
            href="/admin/batches"
            className="flex min-h-11 items-center justify-between gap-2 border-t border-midnight/[0.07] px-5 py-3 text-[0.68rem] font-bold text-orange hover:bg-arctic md:min-h-0"
          >
            Manage batches
            <ArrowRight className="size-3" aria-hidden="true" />
          </Link>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-midnight/[0.08] bg-surface px-5 py-4">
        <p className="flex items-start gap-2 text-[0.7rem] leading-relaxed text-slate-ink">
          <Info className="mt-0.5 size-3.5 shrink-0 text-indigo" aria-hidden="true" />
          Privacy default: dashboards use aggregated data. Individual question answers are not exposed
          to trainers here — only profile summaries and course recommendations. In production, access
          should be authenticated and scoped per institution.
        </p>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  note,
}: {
  icon: typeof Users;
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[0.62rem] font-bold uppercase tracking-[0.12em] text-slate-ink">{label}</p>
        <Icon className="size-4 text-orange" aria-hidden="true" />
      </div>
      <p className="display mt-2 text-2xl text-midnight">{value}</p>
      <p className="mt-1 text-[0.66rem] leading-relaxed text-slate-ink">{note}</p>
    </div>
  );
}
