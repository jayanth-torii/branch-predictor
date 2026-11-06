"use client";

import { ChevronDown, Download, Loader2, Search, ShieldCheck, TriangleAlert } from "lucide-react";
import { Fragment, useMemo, useState } from "react";
import { courseDemand } from "@/lib/batches";
import { CAREER_BY_SLUG } from "@/lib/careers";
import { COURSE_BY_SLUG } from "@/lib/courses";
import { usePathora } from "@/lib/store";
import { DIMENSION_META, STREAMS, type Submission } from "@/lib/types";
import { downloadCsv, formatDate } from "@/lib/utils";

export default function AdminStudentsPage() {
  const admin = usePathora((state) => state.admin);
  const [query, setQuery] = useState("");
  const [batch, setBatch] = useState("All");
  const [stream, setStream] = useState("All");
  const [undecidedOnly, setUndecidedOnly] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [pdfFor, setPdfFor] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return admin.submissions.filter((submission) => {
      if (batch !== "All" && submission.batchCode !== batch) return false;
      if (stream !== "All" && submission.stream !== stream) return false;
      if (undecidedOnly && !submission.undecided) return false;
      if (!term) return true;
      return (
        submission.name.toLowerCase().includes(term) ||
        submission.archetype.toLowerCase().includes(term) ||
        (COURSE_BY_SLUG[submission.topCourseSlug]?.name ?? "").toLowerCase().includes(term)
      );
    });
  }, [admin.submissions, query, batch, stream, undecidedOnly]);

  async function downloadProfilePdf(submission: Submission) {
    setPdfFor(submission.id);
    try {
      const { downloadStudentProfilePdf } = await import("@/lib/pdf");
      await downloadStudentProfilePdf(submission);
    } catch {
      // Silently keep the table usable; the browser console holds the detail.
    } finally {
      setPdfFor(null);
    }
  }

  function exportCsv() {
    const rows: (string | number)[][] = [
      ["Name", "Stream", "Class", "Batch", "Assessed on", "Profile", "Top dimension", "Top course", "XP", "Undecided"],
      ...filtered.map((submission) => [
        submission.name,
        submission.stream,
        submission.puYear,
        submission.batchCode,
        formatDate(submission.createdAt),
        submission.archetype,
        DIMENSION_META[submission.topDimension].short,
        COURSE_BY_SLUG[submission.topCourseSlug]?.name ?? "",
        submission.xp,
        submission.undecided ? "Yes" : "No",
      ]),
    ];
    downloadCsv("pathora-batch-records.csv", rows);
  }

  const demand = courseDemand(filtered);

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
      <div className="flex flex-col items-stretch gap-3 md:flex-row md:flex-wrap md:items-end md:justify-between">
        <div>
          <h2 className="display text-xl text-midnight">Student records</h2>
          <p className="mt-1 text-xs text-slate-ink">
            {filtered.length} of {admin.submissions.length} records shown · profile summaries only
          </p>
        </div>
        <button
          type="button"
          onClick={exportCsv}
          className="btn btn-ghost w-full !py-2.5 !text-xs md:w-auto"
        >
          <Download className="size-3.5" aria-hidden="true" />
          Export filtered CSV
        </button>
      </div>

      <div className="card mt-5 p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-ink"
              aria-hidden="true"
            />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search name, profile or course"
              aria-label="Search student records"
              className="w-full rounded-xl border border-midnight/10 bg-arctic py-2.5 pl-9 pr-3 text-xs text-midnight outline-none transition placeholder:text-slate-ink focus:border-orange focus:bg-surface"
            />
          </div>
          <select
            value={batch}
            onChange={(event) => setBatch(event.target.value)}
            aria-label="Filter by batch"
            className="rounded-xl border border-midnight/10 bg-arctic px-3 py-2.5 text-xs font-semibold text-midnight outline-none focus:border-orange"
          >
            <option value="All">All batches</option>
            {admin.batches.map((entry) => (
              <option key={entry.code} value={entry.code}>
                {entry.name}
              </option>
            ))}
          </select>
          <select
            value={stream}
            onChange={(event) => setStream(event.target.value)}
            aria-label="Filter by stream"
            className="rounded-xl border border-midnight/10 bg-arctic px-3 py-2.5 text-xs font-semibold text-midnight outline-none focus:border-orange"
          >
            <option value="All">All streams</option>
            {STREAMS.map((entry) => (
              <option key={entry} value={entry}>
                {entry}
              </option>
            ))}
          </select>
          <label className="flex min-h-11 items-center gap-2 rounded-xl bg-arctic px-3 py-2.5 text-xs font-medium text-slate-ink md:min-h-0">
            <input
              type="checkbox"
              checked={undecidedOnly}
              onChange={(event) => setUndecidedOnly(event.target.checked)}
              className="size-3.5 accent-orange"
            />
            Undecided only
          </label>
        </div>
      </div>

      <div className="card mt-4 overflow-hidden">
        {/* `as-cards` turns each row into a list card below 768px (see the mobile
            layer in globals.css); the min-width only applies once there is room
            for a real table. */}
        <div className="as-cards overflow-x-auto">
          <table className="w-full border-collapse text-left md:min-w-[760px]">
            <thead>
              <tr className="border-b border-midnight/[0.07] bg-arctic/70">
                {["Student", "Stream", "Batch", "Profile", "Top course", "Assessed", ""].map((heading) => (
                  <th
                    key={heading}
                    className="px-4 py-3 text-[0.58rem] font-bold uppercase tracking-[0.12em] text-slate-ink"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((submission) => {
                const open = openId === submission.id;
                return (
                  <Fragment key={submission.id}>
                    <tr className="border-b border-midnight/[0.05] last:border-0">
                      <td data-role="title" className="px-4 py-3">
                        <p className="text-xs font-bold text-midnight">
                          {submission.name}
                          {submission.sample && (
                            <span className="ml-1.5 rounded bg-fog px-1 py-0.5 text-[0.5rem] font-bold uppercase tracking-wide text-indigo">
                              sample
                            </span>
                          )}
                        </p>
                        <p className="mt-0.5 text-[0.6rem] text-slate-ink">
                          {submission.puYear || "Class not set"} · {submission.xp} XP
                        </p>
                      </td>
                      <td data-role="meta" data-label="Stream" className="px-4 py-3 text-[0.68rem] text-slate-ink">
                        {submission.stream || "—"}
                      </td>
                      <td
                        data-role="meta"
                        data-label="Batch"
                        className="px-4 py-3 font-mono text-[0.64rem] text-slate-ink"
                      >
                        {submission.batchCode || "—"}
                      </td>
                      <td
                        data-role="meta"
                        data-label="Profile"
                        className="px-4 py-3 text-[0.68rem] font-semibold text-midnight"
                      >
                        {submission.archetype.replace("The ", "")}
                        {submission.undecided && (
                          <span className="ml-1.5 inline-flex items-center gap-0.5 rounded bg-[color:light-dark(#fff7e6,#3b2c0e)] px-1 py-0.5 text-[0.5rem] font-bold text-[color:light-dark(#8a5b00,#f2c66b)]">
                            <TriangleAlert className="size-2.5" aria-hidden="true" />
                            exploring
                          </span>
                        )}
                      </td>
                      <td
                        data-role="meta"
                        data-label="Top course"
                        className="px-4 py-3 text-[0.68rem] text-slate-ink"
                      >
                        {COURSE_BY_SLUG[submission.topCourseSlug]?.name ?? "—"}
                      </td>
                      <td
                        data-role="meta"
                        data-label="Assessed"
                        className="px-4 py-3 text-[0.64rem] text-slate-ink"
                      >
                        {formatDate(submission.createdAt)}
                      </td>
                      <td data-role="actions" className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => setOpenId(open ? null : submission.id)}
                          aria-expanded={open}
                          aria-label={open ? "Hide profile" : "Show profile"}
                          // The 44px phone floor comes from the mobile layer's
                          // `.as-cards td[data-role="actions"] > *` rule, so no height class is
                          // needed here. `md:` restores the compact desktop chevron.
                          className="inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-midnight/10 px-3 text-[0.72rem] font-bold text-slate-ink transition hover:border-orange hover:text-orange md:size-7 md:w-auto md:px-0"
                        >
                          {/* The bare chevron is enough beside a table row; a
                              full-width card action needs a word. */}
                          <span className="md:hidden">{open ? "Hide profile" : "Show profile"}</span>
                          <ChevronDown className={`size-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
                        </button>
                      </td>
                    </tr>
                    {open && (
                      <tr data-full-row className="border-b border-midnight/[0.05] bg-arctic/50">
                        <td colSpan={7} className="px-4 py-4">
                          <div className="mb-3 flex flex-col items-stretch gap-2 md:flex-row md:flex-wrap md:items-center md:justify-between">
                            <p className="text-[0.58rem] font-bold uppercase tracking-wide text-slate-ink">
                              Profile summary
                            </p>
                            <button
                              type="button"
                              onClick={() => downloadProfilePdf(submission)}
                              disabled={pdfFor === submission.id}
                              className="inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-full border border-midnight/10 bg-surface px-3 py-1.5 text-[0.64rem] font-bold text-midnight transition hover:border-orange hover:text-orange disabled:opacity-50 md:min-h-0 md:w-auto"
                            >
                              {pdfFor === submission.id ? (
                                <Loader2 className="size-3 animate-spin" aria-hidden="true" />
                              ) : (
                                <Download className="size-3" aria-hidden="true" />
                              )}
                              {pdfFor === submission.id ? "Preparing PDF" : "Download profile PDF"}
                            </button>
                          </div>
                          <div className="grid gap-5 sm:grid-cols-[1fr_1fr_1fr]">
                            <div>
                              <p className="text-[0.58rem] font-bold uppercase tracking-wide text-slate-ink">
                                Interest profile
                              </p>
                              <div className="mt-2 space-y-1.5">
                                {(Object.keys(submission.profile) as (keyof typeof submission.profile)[])
                                  .sort((a, b) => submission.profile[b] - submission.profile[a])
                                  .map((dimension) => (
                                    <div key={dimension} className="flex items-center gap-2">
                                      <span className="w-20 text-[0.6rem] text-slate-ink">
                                        {DIMENSION_META[dimension].short}
                                      </span>
                                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-midnight/[0.08]">
                                        <div
                                          className="h-full rounded-full"
                                          style={{
                                            width: `${submission.profile[dimension]}%`,
                                            background: DIMENSION_META[dimension].color,
                                          }}
                                        />
                                      </div>
                                      <span className="w-6 text-right text-[0.58rem] font-semibold text-midnight">
                                        {submission.profile[dimension]}
                                      </span>
                                    </div>
                                  ))}
                              </div>
                            </div>
                            <div>
                              <p className="text-[0.58rem] font-bold uppercase tracking-wide text-slate-ink">
                                Eligible course directions
                              </p>
                              <div className="mt-2 flex flex-wrap gap-1.5">
                                {submission.eligibleCourses.map((slug) => (
                                  <span key={slug} className="chip !px-2 !py-0.5 chip-xs">
                                    {COURSE_BY_SLUG[slug]?.name ?? slug}
                                  </span>
                                ))}
                              </div>
                              <p className="mt-2 text-[0.58rem] text-slate-ink">
                                Batch demand currently points to{" "}
                                <strong className="text-midnight">{demand[0]?.name ?? "no clear leader"}</strong>.
                              </p>
                            </div>
                            <div>
                              <p className="text-[0.58rem] font-bold uppercase tracking-wide text-slate-ink">
                                Career interests
                              </p>
                              <div className="mt-2 flex flex-wrap gap-1.5">
                                {submission.interestedCareers.map((slug) => (
                                  <span key={slug} className="chip !px-2 !py-0.5 chip-xs">
                                    {CAREER_BY_SLUG[slug]?.title ?? slug}
                                  </span>
                                ))}
                              </div>
                              <p className="mt-2 text-[0.58rem] leading-relaxed text-slate-ink">
                                Question-level answers are intentionally not shown. Use this summary for
                                a conversation, not a diagnosis.
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-slate-ink">
                    No records match those filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="mt-4 flex items-start gap-2 text-[0.68rem] leading-relaxed text-slate-ink">
        <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-[color:light-dark(#1f9d8b,#5fd4bd)]" aria-hidden="true" />
        Records are shown as profile summaries. In a production system, staff access would be audited
        and scoped per institution, with consent captured before a student joins a batch.
      </p>
    </div>
  );
}
