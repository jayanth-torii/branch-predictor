import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { SubmissionModel, BatchModel } from "@/lib/server/models";
import { ensureSeeded } from "@/lib/server/seed";
import { isAdminRequest, clientKey } from "@/lib/server/auth";
import { submissionCreateSchema, extractBatchCode, submissionIdParamSchema } from "@/lib/server/validation";
import { dbErrorResponse, unauthorizedResponse, notFoundResponse, badRequestResponse } from "@/lib/server/http";
import type { Batch, Submission } from "@/lib/types";

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 80;
const submissionAttempts = new Map<string, number[]>();

export async function GET(request: NextRequest) {
  if (!(await isAdminRequest())) {
    return unauthorizedResponse();
  }
  try {
    await ensureSeeded();
    const { searchParams } = request.nextUrl;
    const batchCode = searchParams.get("batchCode")?.toUpperCase() ?? "";

    const query: Record<string, unknown> = {};
    if (batchCode) query.batchCode = batchCode;
    const submissions = await SubmissionModel.find(query)
      .sort({ createdAt: -1 })
      .lean<Submission[]>();

    return NextResponse.json({ submissions: submissions ?? [] });
  } catch {
    return dbErrorResponse();
  }
}

export async function POST(request: NextRequest) {
  const ip = clientKey(request);
  const now = Date.now();
  const recent = submissionAttempts.get(ip)?.filter((t) => now - t < RATE_LIMIT_WINDOW_MS) ?? [];
  if (recent.length >= RATE_LIMIT_MAX) {
    return NextResponse.json(
      { error: "Too many submissions from this address. Please wait a minute and try again.", code: "rate_limited" },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequestResponse("The request body must be valid JSON.");
  }

  const parsed = submissionCreateSchema.safeParse(body);
  if (!parsed.success) {
    return badRequestResponse(parsed.error.issues[0]?.message ?? "Invalid submission data.");
  }

  const code = parsed.data.batchCode;
  const batch = await BatchModel.findOne({ code }).lean<Batch>();
  if (!batch) {
    return badRequestResponse(`No batch found for code ${code}.`);
  }
  if (batch.capacity > 0 && await SubmissionModel.countDocuments({ batchCode: code }) >= batch.capacity) {
    return badRequestResponse(`The batch ${code} has reached its capacity of ${batch.capacity}.`);
  }

  recent.push(now);
  submissionAttempts.set(ip, recent);
  if (submissionAttempts.size > 500) {
    for (const [key, times] of submissionAttempts) {
      if (!times.some((t) => now - t < RATE_LIMIT_WINDOW_MS)) submissionAttempts.delete(key);
    }
  }

  try {
    const created = await SubmissionModel.findOneAndUpdate(
      { id: new RegExp(`^${parsed.data.id}$`, "i") },
      {
        $set: {
          name: parsed.data.name,
          stream: parsed.data.stream,
          puYear: parsed.data.puYear,
          batchCode: code,
          createdAt: parsed.data.createdAt,
          profile: parsed.data.profile,
          archetype: parsed.data.archetype,
          topDimension: parsed.data.topDimension,
          topCourseSlug: parsed.data.topCourseSlug,
          xp: parsed.data.xp,
          undecided: parsed.data.undecided,
          eligibleCourses: parsed.data.eligibleCourses,
          interestedCareers: parsed.data.interestedCareers,
          sample: false,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    ).lean<Submission>();

    return NextResponse.json({ submission: created ?? null }, { status: 201 });
  } catch {
    return dbErrorResponse();
  }
}

export async function DELETE(request: NextRequest) {
  if (!(await isAdminRequest())) {
    return unauthorizedResponse();
  }

  const { searchParams } = request.nextUrl;
  const id = searchParams.get("id")?.toLowerCase();
  if (!id) {
    return badRequestResponse("A submission id query parameter is required.");
  }

  const submissionIdSchema = z.string().regex(/^[a-z0-9]{8,16}$/);
  if (!submissionIdSchema.safeParse(id).success) {
    return badRequestResponse("The provided submission id is invalid.");
  }

  const deleted = await SubmissionModel.deleteOne({ id: id.toLowerCase() });
  if (deleted.deletedCount === 0) {
    return new NextResponse(null, { status: 404 });
  }
  return NextResponse.json({ deleted: true });
}
