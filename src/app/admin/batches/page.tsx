"use client";

import Link from "next/link";
import { Check, Copy, Download, Loader2, Plus, Users } from "lucide-react";
import { useState } from "react";
import { batchStats } from "@/lib/batches";
import { usePathora } from "@/lib/store";
import { DIMENSION_META, type Batch } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";
import {
  createBatch,
  fetchBatches,
  type CreateBatchResponse,
} from "@/lib/api";

export default function AdminBatchesPage() {
  const admin = usePathora((state) => state.admin);
  const addBatch = usePathora((state) => state.addBatch);
  const setAdminData = usePathora((state) => state.setAdminData);
  const submissions = admin.submissions;

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [institution, setInstitution] = useState("");
  const [capacity, setCapacity] = useState("30");
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [pdfBatch, setPdfBatch] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function refreshBatches() {
    const base = adminApiBase();
    if (!base) return;
    try {
      const res = await fetchBatches(base);
      if (res?.batches) {
        setAdminData(res.batches, admin.submissions);
      }
    } catch {
      // Keep local state usable.
    }
  }

  function adminApiBase(): string | null {
    // The admin layout stores the app origin after login; fall back to
    // window location so the page is still usable before login completes.
    if (typeof window === "undefined") return null;
    return window.location.origin;
  }

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = code.trim().toUpperCase();
    if (!name.trim() || !normalized) {
      setError("A batch name and code are required.");
      return;
    }
    if (admin.batches.some((batch) => batch.code === normalized)) {
      setError("That batch code already exists.");
      return;
    }

    const base = adminApiBase();
    if (base) {
      setSubmitting(true);
      try {
        const res = await createBatch(base, {
          name: name.trim(),
          code: normalized,
          institution: institution.trim() || "Unassigned institution",
          capacity: Number.isFinite(Number(capacity)) && Number(capacity) > 0
            ? Number(capacity)
            : 30,
        });
        if (res?.batch) {
          setAdminData(
            admin.batches.concat(res.batch as unknown as Batch),
            admin.submissions,
          );
          setCreated(res.batch.code);
        } else {
          throw new Error(res?.error ?? "Create returned no batch");
        }
      } catch (error) {
        const message =
          error && typeof error === "object" && "error" in error
            ? String((error as { error: unknown }).error)
            : "The batch could not be created. Please try again.";
        setError(message);
      } finally {
        setSubmitting(false);
      }
      return;
    }

    addBatch(name, normalized, institution, Number(capacity));
    setError(null);
    setCreated(normalized);
  }

  async function downloadBatchPdf(batch: Batch) {
    setPdfBatch(batch.code);
    try {
      const { downloadBatchReportPdf } = await import("@/lib/pdf");
      await downloadBatchReportPdf(batch, submissions);
    } catch {
      setError("The PDF could not be generated. Please try again.");
    } finally {
      setPdfBatch(null);
    }
  }

  async function copyLink(batchCode: string) {
    const url = `${window.location.origin}/join/${batchCode}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(batchCode);
      setTimeout(() => setCopied(null), 1800);
    } catch {
      setError("Clipboard access was blocked. Copy the code manually.");
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-3">
          {admin.batches.map((batch) => {
            const stats = batchStats(batch, submissions);
            return (
              <div key={batch.id} className="card p-5">
                <div className="flex flex-col items-stretch gap-3 md:flex-row md:flex-wrap md:items-start md:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="display text-lg text-midnight">{batch.name}</h2>
                      {batch.sample && (
                        <span className="rounded bg-fog px-1.5 py-0.5 text-[0.55rem] font-bold uppercase tracking-wide text-indigo">
                          sample
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-[0.7rem] text-slate-ink">
                      {batch.institution} · created {formatDate(batch.createdAt)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyLink(batch.code)}
                    aria-label={`Copy the join link for ${batch.code}`}
                    className={cn(
                      "inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-[0.68rem] font-bold transition md:min-h-0 md:w-auto",
                      copied === batch.code
                        ? "border-[color:light-dark(#1f9d8b66,#2dd4bf59)] bg-[color:light-dark(#1f9d8b1a,#2dd4bf24)] text-[color:light-dark(#14705f,#5fd4bd)]"
                        : "border-midnight/10 text-midnight hover:border-orange hover:text-orange",
                    )}
                  >
                    {copied === batch.code ? (
                      <>
                        <Check className="size-3" aria-hidden="true" />
                        Copied link
                      </>
                    ) : (
                      <>
                        <Copy className="size-3" aria-hidden="true" />
                        {batch.code}
                      </>
                    )}
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <MiniStat label="Assessed" value={`${stats.completed}/${batch.capacity}`} />
                  <MiniStat label="Completion" value={`${stats.completionRate}%`} />
                  <MiniStat
                    label="Dominant"
                    value={stats.dominant ? DIMENSION_META[stats.dominant].short : "—"}
                  />
                  <MiniStat label="Undecided" value={String(stats.undecided)} />
                </div>

                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-midnight/[0.07]">
                  <div
                    className="h-full rounded-full bg-orange"
                    style={{ width: `${Math.min(100, stats.completionRate)}%` }}
                  />
                </div>

                {/* Phone: one action per full-width row. Desktop keeps the
                    single justified line it had before. */}
                <div className="mt-4 flex flex-col gap-1 border-t border-midnight/[0.06] pt-3 md:flex-row md:flex-wrap md:items-center md:justify-between md:gap-2">
                  <Link
                    href={`/join/${batch.code}`}
                    className="inline-flex min-h-11 items-center gap-1 text-[0.68rem] font-bold text-orange hover:underline md:min-h-0"
                  >
                    Preview student join page
                  </Link>
                  <div className="flex flex-col gap-2 md:flex-row md:flex-wrap md:items-center md:gap-3">
                    <button
                      type="button"
                      onClick={() => downloadBatchPdf(batch)}
                      disabled={pdfBatch === batch.code}
                      className="inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-full border border-midnight/10 px-3 py-1.5 text-[0.66rem] font-bold text-midnight transition hover:border-orange hover:text-orange disabled:opacity-50 md:min-h-0 md:w-auto"
                    >
                      {pdfBatch === batch.code ? (
                        <Loader2 className="size-3 animate-spin" aria-hidden="true" />
                      ) : (
                        <Download className="size-3" aria-hidden="true" />
                      )}
                      {pdfBatch === batch.code ? "Preparing PDF" : "Batch report PDF"}
                    </button>
                    <Link
                      href="/admin/students"
                      className="inline-flex min-h-11 items-center text-[0.66rem] font-semibold text-slate-ink hover:text-midnight hover:underline md:min-h-0"
                    >
                      View records
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-4">
          <form onSubmit={handleCreate} className="card p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-xl bg-peach text-orange">
                <Plus className="size-4" aria-hidden="true" />
              </span>
              <div>
                <h2 className="display text-base text-midnight">Create a batch</h2>
                <p className="text-[0.66rem] text-slate-ink">Students join with the code</p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <Field label="Batch name" value={name} onChange={setName} placeholder="PU 2028 — Science" />
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="Join code"
                  value={code}
                  onChange={(value) => setCode(value.toUpperCase())}
                  placeholder="PTH-2028"
                  mono
                />
                <Field label="Capacity" value={capacity} onChange={setCapacity} placeholder="40" type="number" />
              </div>
              <Field
                label="Institution"
                value={institution}
                onChange={setInstitution}
                placeholder="College or programme name"
              />
            </div>

            {error && (
              <p role="alert" className="mt-3 rounded-xl bg-orange/10 px-3 py-2 text-[0.7rem] font-semibold text-orange">
                {error}
              </p>
            )}
            {created && !error && (
              <p className="mt-3 rounded-xl bg-[color:light-dark(#1f9d8b1a,#2dd4bf24)] px-3 py-2 text-[0.7rem] font-semibold text-[color:light-dark(#14705f,#5fd4bd)]">
                Batch {created} created. Share its join link with students.
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary mt-4 w-full !py-2.5 !text-xs"
            >
              {submitting ? "Creating…" : "Create batch"}
            </button>
          </form>

          <div className="rounded-2xl border border-midnight/[0.08] bg-surface p-5">
            <p className="flex items-center gap-1.5 text-[0.66rem] font-bold uppercase tracking-wide text-slate-ink">
              <Users className="size-3.5" aria-hidden="true" />
              How joining works
            </p>
            <ol className="mt-2 space-y-1.5 text-[0.7rem] leading-relaxed text-slate-ink">
              <li>1. Student opens the join link or enters the code.</li>
              <li>2. They complete onboarding and the quest.</li>
              <li>3. Their result is attached to this batch in aggregate.</li>
            </ol>
            <p className="mt-3 text-[0.66rem] leading-relaxed text-slate-ink">
              This demo stores everything locally. A production version would validate codes on the
              server and isolate records per institution.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  mono = false,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  mono?: boolean;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-[0.6rem] font-bold uppercase tracking-[0.12em] text-slate-ink">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        min={type === "number" ? 1 : undefined}
        className={cn(
          "mt-1.5 w-full rounded-xl border border-midnight/10 bg-arctic px-3 py-2.5 text-sm text-midnight outline-none transition placeholder:text-slate-ink focus:border-orange focus:bg-surface",
          mono && "font-mono font-semibold",
        )}
      />
    </label>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-arctic px-3 py-2">
      <p className="text-[0.55rem] font-bold uppercase tracking-wide text-slate-ink">{label}</p>
      <p className="mt-0.5 text-xs font-bold text-midnight">{value}</p>
    </div>
  );
}
