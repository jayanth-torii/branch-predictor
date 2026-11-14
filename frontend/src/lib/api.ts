import type { SubmissionDetail } from "@/lib/types";

export type ApiError = { error: string; fields?: Record<string, string>; status?: number };

export async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  let status = 0;
  let resText: string;
  let fetched: Response | null = null;
  try {
    const res = await fetch(url, init);
    fetched = res;
    status = res.status;
    resText = await res.text();
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : typeof error === "string"
          ? error
          : "Network error";
    const err = Object.assign(new Error(message), { status: 0, error: "network" });
    return Promise.reject(err);
  }

  let body: { error?: string; fields?: Record<string, string> };
  try {
    body = JSON.parse(resText);
  } catch {
    body = { error: resText || `${status} ${fetched?.statusText ?? ""}` };
  }

  if (fetched && !fetched.ok && status !== 204) {
    const err = Object.assign(
      new Error(body.error ?? `Request failed (${status}).`),
      {
        status,
        error: body.error ?? String(status),
        fields: body.fields,
      },
    );
    return Promise.reject(err);
  }

  if (status === 204) return undefined as unknown as T;

  return body as unknown as T;
}

/** Strips the HTTPError wrapper so UI can show clean messages. */
export function apiErrorMessage(error: unknown): { message: string; code?: string; fields?: Record<string, string> } {
  if (error && typeof error === "object" && "error" in error) {
    return {
      message: String((error as { error: unknown }).error),
      code: (error as { code?: unknown }).code as string | undefined,
      fields: (error as { fields?: Record<string, string> }).fields,
    };
  }
  if (error instanceof Error) return { message: error.message };
  return { message: String(error) };
}

export async function adminFetch(base: string | null, path: string, init?: RequestInit): Promise<unknown> {
  if (!base) return Promise.reject(new Error("Backend not configured"));
  // `credentials: "include"` is required now that the API is a separate origin:
  // the admin session is an httpOnly cookie and would otherwise not be sent.
  //
  // The Content-Type matters just as much. Next's `request.json()` parsed a
  // body regardless of header, so these calls never set one. Express's
  // `express.json()` only parses `application/json`, so without this every
  // POST/PATCH/DELETE would arrive with an empty body and fail validation.
  const headers = new Headers(init?.headers);
  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  return apiFetch<unknown>(new URL(path, base).href, {
    credentials: "include",
    ...init,
    headers,
  });
}

export type LoginResponse = { ok?: boolean; error?: string };
export type SessionResponse = { ok?: boolean; error?: string; authenticated?: boolean; mode?: string };

export async function fetchAdminSession(base: string | null): Promise<SessionResponse> {
  return adminFetch(base, "/api/admin/session") as Promise<SessionResponse>;
}

export async function postAdminLogin(
  base: string | null,
  email: string,
  password: string,
): Promise<LoginResponse> {
  return adminFetch(base, "/api/admin/session", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  }) as Promise<LoginResponse>;
}

export async function clearAdminSession(base: string | null): Promise<void> {
  await adminFetch(base, "/api/admin/session", { method: "DELETE" });
}

// `sample` marks a demo row. The API returns it on every batch, and the admin
// UI renders a badge from it, so it belongs on the payload type.
export type BatchPayload = { id: string; name: string; code: string; institution: string; createdAt: string; capacity: number; sample?: boolean };
export type BatchesResponse = { batches?: BatchPayload[]; error?: string };
export type CreateBatchResponse = { batch?: BatchPayload; status?: string; error?: string };
export type DeleteBatchResponse = { deleted?: boolean; error?: string };

export async function fetchBatches(base: string | null): Promise<BatchesResponse> {
  return adminFetch(base, "/api/batches") as Promise<BatchesResponse>;
}

export async function createBatch(base: string | null, batch: { name: string; code: string; institution: string; capacity: number }): Promise<CreateBatchResponse> {
  return adminFetch(base, "/api/batches", { method: "POST", body: JSON.stringify(batch) }) as Promise<CreateBatchResponse>;
}

export async function updateBatch(base: string | null, code: string, patch: { name?: string; institution?: string; capacity?: number }): Promise<CreateBatchResponse> {
  return adminFetch(base, `/api/batches/${encodeURIComponent(code)}`, { method: "PATCH", body: JSON.stringify(patch) }) as Promise<CreateBatchResponse>;
}

export async function deleteBatchByCode(base: string | null, code: string): Promise<DeleteBatchResponse> {
  return adminFetch(base, "/api/batches", { method: "DELETE", body: JSON.stringify({ code }) }) as Promise<DeleteBatchResponse>;
}

export async function fetchBatchByCode(base: string | null, code: string): Promise<{ batch?: BatchPayload; error?: string }> {
  return adminFetch(base, `/api/batches/${encodeURIComponent(code)}`) as Promise<{ batch?: BatchPayload; error?: string }>;
}

export type SubmissionPayload = {
  id: string;
  name: string;
  stream: string;
  puYear: string;
  batchCode: string;
  createdAt: string;
  profile: Record<string, number>;
  archetype: string;
  topDimension: string;
  topCourseSlug: string;
  xp: number;
  undecided: boolean;
  eligibleCourses: string[];
  interestedCareers: string[];
  sample?: boolean;
  /** The full record — answers, ranked matches, stream round, onboarding. */
  detail?: SubmissionDetail;
};
export type SubmissionsResponse = { submissions?: SubmissionPayload[]; error?: string };

export async function fetchSubmissions(base: string | null, batchCode?: string): Promise<SubmissionsResponse> {
  const params = new URLSearchParams(batchCode ? { batchCode } : undefined);
  return adminFetch(base, "/api/submissions" + (params.toString() ? `?${params}` : "")) as Promise<SubmissionsResponse>;
}

export async function createSubmission(base: string | null, submission: SubmissionPayload): Promise<{ submission?: SubmissionPayload; error?: string }> {
  return adminFetch(base, "/api/submissions", { method: "POST", body: JSON.stringify(submission) }) as Promise<{ submission?: SubmissionPayload; error?: string }>;
}

/* ── Question bank ──────────────────────────────────────────────────────── */

export type QuestionBankResponse = {
  core?: unknown[];
  stream?: Record<string, unknown[]>;
  counts?: { core: number; stream: number };
  error?: string;
};

/** Public: the assessment needs this before a student has logged into anything. */
export async function fetchQuestionBank(base: string | null): Promise<QuestionBankResponse> {
  if (!base) return Promise.reject(new Error("Backend not configured"));
  return apiFetch<QuestionBankResponse>(new URL("/api/questions", base).href);
}

export async function importQuestionBank(
  base: string | null,
  payload: { core: unknown[]; stream: unknown[]; replace?: boolean },
): Promise<unknown> {
  return adminFetch(base, "/api/questions/import", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateCoreQuestion(
  base: string | null,
  id: string,
  patch: unknown,
): Promise<unknown> {
  return adminFetch(base, `/api/questions/core/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

export async function updateStreamQuestion(
  base: string | null,
  id: string,
  patch: unknown,
): Promise<unknown> {
  return adminFetch(base, `/api/questions/stream/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}
