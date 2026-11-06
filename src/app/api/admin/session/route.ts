import { NextRequest, NextResponse } from "next/server";
import { ensureSeeded } from "@/lib/server/seed";
import { BatchModel } from "@/lib/server/models";
import {
  isAdminRequest,
  isAuthConfigured,
  verifyPasscode,
  startAdminSession,
  endAdminSession,
  clientKey,
} from "@/lib/server/auth";
import { adminLoginSchema, adminDataQuerySchema, extractBatchCode } from "@/lib/server/validation";
import { dbErrorResponse, unauthorizedResponse, badRequestResponse, conflictResponse } from "@/lib/server/http";
import type { Batch } from "@/lib/types";

export async function GET(_request: NextRequest) {
  try {
    await ensureSeeded();
    const batches = await BatchModel.find({}).sort({ createdAt: 1 }).lean<Batch[]>();
    return NextResponse.json({ batches: batches ?? [] });
  } catch {
    return dbErrorResponse();
  }
}

export async function POST(request: NextRequest) {
  if (!isAuthConfigured()) {
    return badRequestResponse("Admin login is unavailable on this server.");
  }
  if (!(await isAdminRequest())) {
    return unauthorizedResponse();
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequestResponse("The request body must be valid JSON.");
  }

  const parsed = adminLoginSchema.safeParse(body);
  if (!parsed.success) {
    return badRequestResponse(parsed.error.issues[0]?.message ?? "Invalid request.");
  }
  if (!verifyPasscode(parsed.data.passcode)) {
    return unauthorizedResponse();
  }
  await startAdminSession();
  return NextResponse.json({ ok: true });
}
