import { NextRequest, NextResponse } from "next/server";
import { BatchModel } from "@/lib/server/models";
import { isAdminRequest, clientKey } from "@/lib/server/auth";
import { extractBatchCode } from "@/lib/server/validation";
import { dbErrorResponse, unauthorizedResponse, notFoundResponse, conflictResponse, badRequestResponse } from "@/lib/server/http";
import type { Batch, Submission } from "@/lib/types";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const code = (await extractBatchCode(params)).toUpperCase();
    const batch = await BatchModel.findOne({ code }).lean<Batch>();
    if (!batch) return notFoundResponse();
    return NextResponse.json({ batch });
  } catch {
    return dbErrorResponse();
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  if (!(await isAdminRequest())) {
    return unauthorizedResponse();
  }
  const code = (await extractBatchCode(params)).toUpperCase();
  const existing = await BatchModel.findOne({ code }).lean<Batch>();
  if (!existing) return notFoundResponse();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequestResponse("The request body must be valid JSON.");
  }

  const { z } = await import("zod");
  const updateSchema = z.object({
    name: z.string().max(80).optional(),
    institution: z.string().max(120).optional(),
    capacity: z.number().int().min(1).max(5000).optional(),
  }).strict();

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return badRequestResponse(parsed.error.issues[0]?.message ?? "Invalid fields.");
  }

  const updated = await BatchModel.findOneAndUpdate({ code }, parsed.data, { new: true }).lean<Batch>();
  if (!updated) return new NextResponse(null, { status: 404 });

  return NextResponse.json({ batch: sanitizeBatch(updated) });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  if (!(await isAdminRequest())) {
    return unauthorizedResponse();
  }
  const code = (await extractBatchCode(params)).toUpperCase();
  const deletedBatch = await BatchModel.deleteOne({ code });
  if (deletedBatch.deletedCount === 0) {
    return new NextResponse(null, { status: 404 });
  }
  return NextResponse.json({ deleted: true });
}

function sanitizeBatch(doc: Batch & { _id?: string }): Batch {
  return {
    id: doc.id,
    name: doc.name,
    code: doc.code,
    institution: doc.institution,
    createdAt: doc.createdAt,
    capacity: doc.capacity,
  };
}
