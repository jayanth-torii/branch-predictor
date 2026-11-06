import { NextResponse } from "next/server";

export function dbErrorResponse(): Response {
  return NextResponse.json(
    { error: "Database temporarily unavailable. Please try again in a moment." },
    { status: 503 },
  );
}

export function unauthorizedResponse(): Response {
  return NextResponse.json(
    { error: "Admin authentication required for this endpoint." },
    { status: 401 },
  );
}

export function notFoundResponse(): Response {
  return NextResponse.json({ error: "Resource not found." }, { status: 404 });
}

export function conflictResponse(message: string): Response {
  return NextResponse.json({ error: message }, { status: 409 });
}

export function badRequestResponse(message: string): Response {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function validationErrors(errors: readonly { path: ReadonlyArray<string>; message: string }[]): Response {
  return NextResponse.json(
    {
      error: "Request body could not be validated.",
      fields: Object.fromEntries(
        errors.map((e) => [e.path.join("."), e.message]),
      ),
    },
    { status: 400 },
  );
}
