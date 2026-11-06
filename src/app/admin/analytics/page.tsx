"use client";

import { Download, Sparkles, TrendingUp, TriangleAlert } from "lucide-react";
import { AdminBarChart } from "@/components/admin/admin-bar-chart";
import {
  batchStats,
  careerInterestCounts,
  courseDemand,
  interestDistribution,
} from "@/lib/batches";
import { COURSE_BY_SLUG } from "@/lib/courses";
import { usePathora } from "@/lib/store";
import { DIMENSIONS, DIMENSION_META } from "@/lib/types";
import { downloadCsv } from "@/lib/utils";

export default function AdminAnalyticsPage() {
  const admin = usePathora((state) => state.admin);
  const submissions = admin.submissions;
  const distribution = interestDistribution(submissions);
  const demand = courseDemand(submissions);
  const careers = careerInterestCounts(submissions);
  const undecided = submissions.filter((submission) => submission.undecided);
  const dominant = distribution.slice().sort((a, b) => b.count - a.count)[0];

  const distributionData = DIMENSIONS.map((dimension) => ({
    name: DIMENSION_META[dimension].short,
    count: distribution.find((entry) => entry.dimension === dimension)?.count ?? 0,
  })).sort((a, b) => b.count - a.count);

  function exportAnalytics() {
    downloadCsv("pathora-batch-analytics.csv", [
      ["Interest distribution", "Students", "% of records"],
      ...distribution.map((entry) => [
        DIMENSION_META[entry.dimension].label,
        entry.count,
        `${entry.percent}%`,
      ]),
      [],
      ["Course demand", "Students"],
      ...demand.map((entry) => [entry.name, entry.count]),
      [],
      ["Career interest", "Students"],
      ...careers.map((entry) => [entry.name, entry.count]),
      [],
      ["Batch", "Assessed", "Capacity", "Dominant interest", "Undecided"],
      ...admin.batches.map((batch) => {
        const stats = batchStats(batch, submissions);
        return [
          batch.name,
          stats.completed,
          batch.capacity,
          stats.dominant ? DIMENSION_META[stats.dominant].label : "",
          stats.undecided,
        ];
      }),
      [],
      ["Aggregated guidance data. Individual answers not included."],
    ]);
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
      <div className="flex flex-col items-stretch gap-3 md:flex-row md:flex-wrap md:items-end md:justify-between">
        <div>
          <h2 className="display text-xl text-midnight">Batch analytics</h2>
          <p className="mt-1 text-xs text-slate-ink">
            Aggregated interest, demand and guidance signals across {submissions.length} records
          </p>
        </div>
        <button
          type="button"
          onClick={exportAnalytics}
          className="btn btn-ghost w-full !py-2.5 !text-xs md:w-auto"
        >
          <Download className="size-3.5" aria-hidden="true" />
          Export analytics CSV
        </button>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="card p-5">
          <p className="text-[0.6rem] font-bold uppercase tracking-wide text-slate-ink">
            Dominant interest
          </p>
          <p className="display mt-1.5 text-2xl text-midnight">
            {dominant?.count ? DIMENSION_META[dominant.dimension].short : "—"}
          </p>
          <p className="mt-1 text-[0.68rem] text-slate-ink">
            {dominant?.count ? `${dominant.percent}% of assessed students` : "Awaiting data"}
          </p>
        </div>
        <div className="card p-5">
          <p className="text-[0.6rem] font-bold uppercase tracking-wide text-slate-ink">
            Most requested course
          </p>
          <p className="display mt-1.5 text-2xl text-midnight">{demand[0]?.name ?? "—"}</p>
          <p className="mt-1 text-[0.68rem] text-slate-ink">
            {demand[0] ? `${demand[0].count} students ranked it first` : "Awaiting data"}
          </p>
        </div>
        <div className="card p-5">
          <p className="text-[0.6rem] font-bold uppercase tracking-wide text-slate-ink">
            Needs guidance
          </p>
          <p className="display mt-1.5 text-2xl text-midnight">{undecided.length}</p>
          <p className="mt-1 text-[0.68rem] text-slate-ink">
            Chose “surprise me” or skipped questions
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="card p-5 sm:p-6">
          <p className="eyebrow">Interest heatmap</p>
          <h3 className="display mt-1.5 text-lg text-midnight">Batch interest distribution</h3>
          <div className="mt-3">
            <AdminBarChart
              data={distributionData}
              colors={distributionData.map(
                (entry) =>
                  DIMENSION_META[
                    DIMENSIONS.find((dimension) => DIMENSION_META[dimension].short === entry.name) ??
                      "technology"
                  ].color,
              )}
              height={240}
            />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-1.5">
            {distributionData.map((entry) => (
              <div key={entry.name} className="flex items-center justify-between rounded-lg bg-arctic px-2.5 py-1.5">
                <span className="flex items-center gap-1.5 text-[0.62rem] font-semibold text-midnight">
                  <span
                    className="size-1.5 rounded-full"
                    style={{
                      background:
                        DIMENSION_META[
                          DIMENSIONS.find(
                            (dimension) => DIMENSION_META[dimension].short === entry.name,
                          ) ?? "technology"
                        ].color,
                    }}
                  />
                  {entry.name}
                </span>
                <span className="text-[0.6rem] font-bold text-slate-ink">
                  {distribution.find(
                    (item) => DIMENSION_META[item.dimension].short === entry.name,
                  )?.percent ?? 0}
                  %
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="card p-5 sm:p-6">
            <p className="eyebrow">Course demand</p>
            <h3 className="display mt-1.5 text-lg text-midnight">Where the batch is heading</h3>
            <div className="mt-3">
              <AdminBarChart data={demand.slice(0, 7)} color="var(--color-indigo)" height={210} />
            </div>
          </div>

          <div className="card p-5 sm:p-6">
            <p className="eyebrow">Career pull</p>
            <h3 className="display mt-1.5 text-lg text-midnight">Most clicked-on futures</h3>
            <div className="mt-3 space-y-2">
              {careers.slice(0, 5).map((career, index) => (
                <div key={career.name} className="flex items-center gap-2.5">
                  <span className="w-4 text-[0.6rem] font-bold text-slate-ink">{index + 1}</span>
                  <span className="flex-1 truncate text-[0.72rem] font-semibold text-midnight">
                    {career.name}
                  </span>
                  <div className="h-1.5 w-14 shrink-0 overflow-hidden rounded-full bg-midnight/[0.07] md:w-24">
                    <div
                      className="h-full rounded-full bg-orange"
                      style={{
                        width: `${Math.round((career.count / Math.max(1, careers[0].count)) * 100)}%`,
                      }}
                    />
                  </div>
                  <span className="w-4 text-right text-[0.6rem] font-bold text-slate-ink">
                    {career.count}
                  </span>
                </div>
              ))}
              {careers.length === 0 && (
                <p className="text-xs text-slate-ink">No career data yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="card mt-4 overflow-hidden">
        <div className="border-b border-midnight/[0.07] px-5 py-4">
          <p className="eyebrow">Compare batches</p>
          <h3 className="display mt-1 text-lg text-midnight">Cohort-level differences</h3>
        </div>
        {/* Card stack below 768px — see the mobile layer in globals.css. */}
        <div className="as-cards overflow-x-auto">
          <table className="w-full text-left md:min-w-[620px]">
            <thead>
              <tr className="border-b border-midnight/[0.07] bg-arctic/70">
                {["Batch", "Assessed", "Completion", "Dominant interest", "Undecided", "Top course"].map(
                  (heading) => (
                    <th
                      key={heading}
                      className="px-4 py-2.5 text-[0.56rem] font-bold uppercase tracking-[0.12em] text-slate-ink"
                    >
                      {heading}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {admin.batches.map((batch) => {
                const stats = batchStats(batch, submissions);
                return (
                  <tr key={batch.id} className="border-b border-midnight/[0.05] last:border-0">
                    <td data-role="title" className="px-4 py-3">
                      <p className="text-xs font-bold text-midnight">{batch.name}</p>
                      <p className="font-mono text-[0.58rem] text-slate-ink">{batch.code}</p>
                    </td>
                    <td
                      data-role="meta"
                      data-label="Assessed"
                      className="px-4 py-3 text-[0.7rem] text-slate-ink"
                    >
                      {stats.completed}/{batch.capacity}
                    </td>
                    <td data-role="meta" data-label="Completion" className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-midnight/[0.08]">
                          <div
                            className="h-full rounded-full bg-orange"
                            style={{ width: `${Math.min(100, stats.completionRate)}%` }}
                          />
                        </div>
                        <span className="text-[0.62rem] font-semibold text-midnight">
                          {stats.completionRate}%
                        </span>
                      </div>
                    </td>
                    <td
                      data-role="meta"
                      data-label="Dominant interest"
                      className="px-4 py-3 text-[0.68rem] font-semibold text-midnight"
                    >
                      {stats.dominant ? DIMENSION_META[stats.dominant].short : "—"}
                    </td>
                    <td
                      data-role="meta"
                      data-label="Undecided"
                      className="px-4 py-3 text-[0.68rem] text-slate-ink"
                    >
                      {stats.undecided}
                    </td>
                    <td
                      data-role="meta"
                      data-label="Top course"
                      className="px-4 py-3 text-[0.68rem] text-slate-ink"
                    >
                      {stats.topCourse ? COURSE_BY_SLUG[demand.find((entry) => entry.name === stats.topCourse)?.slug ?? ""]?.name ?? stats.topCourse : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1fr]">
        <div className="card p-5 sm:p-6">
          <p className="flex items-center gap-1.5 text-[0.62rem] font-bold uppercase tracking-wide text-slate-ink">
            <TriangleAlert className="size-3.5 text-[color:light-dark(#a87a00,#f0c674)]" aria-hidden="true" />
            Students needing a conversation
          </p>
          <div className="mt-3 space-y-2">
            {undecided.length === 0 && (
              <p className="text-xs text-slate-ink">No undecided students in the current records.</p>
            )}
            {undecided.map((submission) => (
              <div
                key={submission.id}
                className="flex flex-col gap-1 rounded-xl border border-[color:light-dark(#e0a40040,#f0c67440)] bg-[color:light-dark(#fffbf0,#241b09)] px-3 py-2.5 md:flex-row md:items-center md:justify-between md:gap-3"
              >
                <div className="min-w-0">
                  <p className="text-xs font-bold text-midnight">{submission.name}</p>
                  <p className="text-[0.6rem] text-slate-ink">
                    {submission.stream || "No stream"} · {submission.batchCode}
                  </p>
                </div>
                <span className="min-w-0 text-[0.6rem] font-semibold text-[color:light-dark(#8a5b00,#f2c66b)]">
                  {COURSE_BY_SLUG[submission.eligibleCourses[0] ?? ""]?.name ?? "Exploring"}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[0.64rem] leading-relaxed text-slate-ink">
            Treat this as a prompt for a guidance conversation, not a flag for low potential.
          </p>
        </div>

        <div className="card p-5 sm:p-6">
          <p className="flex items-center gap-1.5 text-[0.62rem] font-bold uppercase tracking-wide text-slate-ink">
            <Sparkles className="size-3.5 text-orange" aria-hidden="true" />
            Reading the numbers
          </p>
          <ul className="mt-3 space-y-2.5 text-[0.74rem] leading-relaxed text-slate-ink">
            <li className="flex gap-2">
              <TrendingUp className="mt-0.5 size-3.5 shrink-0 text-orange" aria-hidden="true" />
              Distribution uses each student&apos;s strongest dimension only — use the full profiles on
              the Students page before drawing strong conclusions.
            </li>
            <li className="flex gap-2">
              <TrendingUp className="mt-0.5 size-3.5 shrink-0 text-orange" aria-hidden="true" />
              Course demand counts the highest-ranked eligible course per student, so it reflects the
              engine&apos;s rank order, not necessarily final applications.
            </li>
            <li className="flex gap-2">
              <TrendingUp className="mt-0.5 size-3.5 shrink-0 text-orange" aria-hidden="true" />
              Completion compares records to configured capacity. Capacity is a planning number, not a
              verified enrolment count.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
