import { NextResponse } from "next/server";
import type { ZodType } from "zod";
import { consumeRateLimit, requestFingerprint } from "./rate-limit";

export class ApiError extends Error {
  constructor(public status: number, message: string, public code = "API_ERROR") {
    super(message);
  }
}

export async function parseJson<T>(req: Request, schema: ZodType<T>): Promise<T> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    throw new ApiError(400, "JSON غير صالح", "INVALID_JSON");
  }
  const result = schema.safeParse(raw);
  if (!result.success) {
    throw new ApiError(422, result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "), "VALIDATION_ERROR");
  }
  return result.data;
}

export function enforceRateLimit(req: Request, scope: string, limit = 30, windowMs = 60_000) {
  const state = consumeRateLimit(requestFingerprint(req, scope), limit, windowMs);
  if (!state.allowed) throw new ApiError(429, "عدد الطلبات كبير. حاول بعد قليل.", "RATE_LIMITED");
  return state;
}

export function apiErrorResponse(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json({ error: error.message, code: error.code }, { status: error.status });
  }
  console.error(error);
  return NextResponse.json({ error: "حدث خطأ داخلي", code: "INTERNAL_ERROR" }, { status: 500 });
}

export function noStoreJson(data: unknown, init: ResponseInit = {}) {
  const response = NextResponse.json(data, init);
  response.headers.set("Cache-Control", "no-store");
  return response;
}
