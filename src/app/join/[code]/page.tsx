"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowRight, Check, ShieldCheck, Users, AlertCircle } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { useHydrated } from "@/lib/client-hooks";
import { SiteFooter } from "@/components/site-footer";
import { Reveal } from "@/components/ui";
import { usePathora } from "@/lib/store";
import { fetchBatchByCode, apiErrorMessage } from "@/lib/api";

export default function JoinBatchPage() {
  return (
    <Suspense
      fallback={
        <main className="grid min-h-[60vh] place-items-center">
          <div className="size-10 animate-pulse rounded-full bg-orange/20" />
        </main>
      }
    >
      <JoinBatchContent />
    </Suspense>
  );
}

function windowLocationOrigin(): string {
  if (typeof window === "undefined") return "";
  return window.location.origin;
}

type FetchStatus = "idle" | "checking" | "ok" | "not-found" | "error";

function JoinBatchContent() {
  const params = useParams<{ code: string }>();
  const router = useRouter();
  const code = (Array.isArray(params.code) ? params.code[0] : params.code)?.toUpperCase() ?? "";
  const mounted = useHydrated();
  const [attached, setAttached] = useState(false);
  const [fetchStatus, setFetchStatus] = useState<FetchStatus>("idle");
  const joinBatch = usePathora((state) => state.joinBatch);
  const attachResultToBatch = usePathora((state) => state.attachResultToBatch);
  const batches = usePathora((state) => state.admin.batches);
  const result = usePathora((state) => state.result);

  async function resolveBatchForCode(code: string) {
    if (!code) {
      setFetchStatus("idle");
      return;
    }
    setFetchStatus("checking");
    const base = windowLocationOrigin();
    if (!base) {
      setFetchStatus("idle");
      return;
    }
    try {
      const res = await fetchBatchByCode(base, code);
      if (res?.error?.toLowerCase().includes("not found")) {
        setFetchStatus("not-found");
        return;
      }
      if (res?.batch && res.batch.code.toUpperCase() === code.toUpperCase()) {
        setFetchStatus("ok");
        return;
      }
      setFetchStatus("idle");
    } catch (error) {
      const message = apiErrorMessage(error).message;
      if (message !== "Backend not configured") {
        setFetchStatus("error");
      } else {
        setFetchStatus("idle");
      }
    }
  }


  useEffect(() => {
    if (!code || !mounted) return;
    joinBatch(code);
    const lookup = setTimeout(() => resolveBatchForCode(code), 0);
    return () => clearTimeout(lookup);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, mounted]);

  const localBatch = batches.find((entry) => entry.code === code);
  const batch = localBatch ?? null;
  const showNotFound = fetchStatus === "not-found";
  const showServerError = fetchStatus === "error";

  return (
    <main className="min-h-[70vh]">
      <div className="mx-auto w-full max-w-3xl px-5 py-10 sm:px-8 sm:py-16">
        {showNotFound ? (
          <Reveal className="card overflow-hidden">
            <div className="bg-navy px-5 py-7 text-white sm:px-9 sm:py-8">
              <p className="eyebrow text-orange-soft">Batch invitation</p>
              <h1 className="display mt-3 text-3xl leading-tight text-balance break-words sm:text-[2.4rem]">
                This batch code does not exist.
              </h1>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/65">
                Batch {code} was not found on the server, so it cannot be joined.
              </p>
            </div>
            <div className="space-y-5 p-5 sm:p-9">
              <Link href="/" className="btn btn-primary flex-1">
                Back to Pathora AI
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </Reveal>
        ) : (
          <Reveal className="card overflow-hidden">
            <div className="bg-navy px-5 py-7 text-white sm:px-9 sm:py-8">
              <p className="eyebrow text-orange-soft">Batch invitation</p>
              <h1 className="display mt-3 text-3xl leading-tight text-balance break-words sm:text-[2.4rem]">
                {batch ? `You are joining ${batch.name}.` : `You are joining batch ${code}.`}
              </h1>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/65">
                {batch
                  ? `${batch.institution} · ${batch.capacity} seats. Your anonymous result will contribute to this batch's aggregate career-interest dashboard.`
                  : "This code is not in the local demo list, but it will still be attached to your result so you can see how batch analytics work."}
              </p>
            </div>

            <div className="space-y-5 p-5 sm:p-9">
              <div className="flex flex-wrap items-center gap-2">
                <span className="chip max-w-full">
                  <Users className="size-3.5 shrink-0 text-orange" aria-hidden="true" />
                  <span className="truncate">Batch code {code}</span>
                </span>
                {mounted && (fetchStatus === "ok" || localBatch) && (
                  <span className="chip !border-[light-dark(#1F9D8B,#4FD1BE)]/30 !bg-[light-dark(#e8f6f3,#0f322e)] !text-[light-dark(#0f6252,#5fd8c4)]">
                    <Check className="size-3.5" aria-hidden="true" />
                    Code applied
                  </span>
                )}
                {showServerError && (
                  <span className="chip !border-orange/25 !bg-orange/8 !text-orange">
                    <AlertCircle className="size-3.5 shrink-0" aria-hidden="true" />
                    Server lookup unavailable
                  </span>
                )}
              </div>

              <div className="rounded-2xl bg-arctic p-4">
                <p className="flex items-center gap-2 text-xs font-bold text-midnight">
                  <ShieldCheck className="size-4 text-[light-dark(#1F9D8B,#4FD1BE)]" aria-hidden="true" />
                  What your trainer can see
                </p>
                <ul className="mt-2 space-y-1.5 text-[0.76rem] leading-relaxed text-slate-ink">
                  {[
                    "Aggregated interest distribution and course demand for the whole batch.",
                    "Your profile summary and recommended courses, if they open your record.",
                    "Not your individual question-by-question answers by default.",
                  ].map((line) => (
                    <li key={line} className="flex gap-2">
                      <span aria-hidden="true">•</span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col gap-2.5 sm:flex-row">
                <Link href="/discover" className="btn btn-primary flex-1">
                  Start the quest
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
                {mounted && result && (
                  <button
                    type="button"
                    onClick={() => {
                      attachResultToBatch(code);
                      setAttached(true);
                      router.push("/results");
                    }}
                    className="btn btn-ghost flex-1"
                  >
                    {attached ? "Result attached" : "Attach my existing result"}
                  </button>
                )}
              </div>

              <p className="text-[0.66rem] leading-relaxed text-slate-ink">
                In this build, batch codes are validated on the server when the backend is configured. When
                the backend is unreachable, the page still joins the code locally so you can preview the flow.
              </p>
            </div>
          </Reveal>
        )}
      </div>
      <SiteFooter />
    </main>
  );
}
