import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { BatchModel, SubmissionModel } from "@/lib/server/models";
import { isAdminRequest, clientKey } from "@/lib/server/auth";
import { batchInputSchema } from "@/lib/server/validation";
import { dbErrorResponse, unauthorizedResponse, conflictResponse, badRequestResponse } from "@/lib/server/http";
import type { Batch } from "@/lib/types";

export async function GET() {
  try {
    const batches = await BatchModel.find({}).sort({ createdAt: 1 }).lean<Batch[]>();
    return NextResponse.json({ batches: batches ?? [] });
  } catch {
    return dbErrorResponse();
  }
}

export async function POST(request: NextRequest) {
  if (!(await isAdminRequest())) {
    return unauthorizedResponse();
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequestResponse("The request body must be valid JSON.");
  }

  const parsed = batchInputSchema.safeParse(body);
  if (!parsed.success) {
    return badRequestResponse(parsed.error.issues[0]?.message ?? "Invalid batch data.");
  }

  const code = parsed.data.code.toUpperCase();
  const existing = await BatchModel.findOne({ code }).lean();
  if (existing) {
    return conflictResponse(`A batch with code ${code} already exists.`);
  }

  const batch = await BatchModel.create({
    id: `batch-${Date.now().toString(36).slice(-8)}`,
    name: parsed.data.name.trim(),
    code,
    institution: parsed.data.institution.trim(),
    capacity: parsed.data.capacity,
    createdAt: new Date().toISOString(),
    sample: false,
  });

  return NextResponse.json({ batch: sanitizeBatch(batch), status: "created" }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  if (!(await isAdminRequest())) {
    return unauthorizedResponse();
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequestResponse("The request body must be valid JSON.");
  }
  const parsed = z.object({
    code: z.string().trim().toUpperCase(),
  }).safeParse(body);
  if (!parsed.success) {
    return badRequestResponse(parsed.error.issues[0]?.message ?? "Invalid request body.");
  }
  const code = parsed.data.code;
  const deleted = await BatchModel.deleteOne({ code });
  if (deleted.deletedCount === 0) {
    return new NextResponse(null, { status: 404 });
  }
  return NextResponse.json({ deleted: true });
}

function sanitizeBatch(doc: { id: string; name: string; code: string; institution: string; createdAt: string; capacity: number; _id?: unknown }): Batch {
  return {
    id: doc.id,
    name: doc.name,
    code: doc.code,
    institution: doc.institution,
    createdAt: doc.createdAt,
    capacity: doc.capacity,
  };
}
