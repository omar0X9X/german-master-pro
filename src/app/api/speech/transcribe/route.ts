import { z } from "zod";
import { apiErrorResponse, enforceRateLimit, noStoreJson, parseJson } from "@/lib/security/api";

const schema = z.object({ mockTranscript: z.string().trim().min(1).max(2000).optional() });

export async function POST(req: Request) {
  try {
    enforceRateLimit(req, "speech:transcribe", 30);
    const body = await parseJson(req, schema);
    if (body.mockTranscript) return noStoreJson({ transcript: body.mockTranscript, provider: "mock" });
    return noStoreJson({ error: "أرسل mockTranscript في الوضع المجاني أو فعّل مزود Speech خارجي.", code: "SPEECH_PROVIDER_REQUIRED" }, { status: 501 });
  } catch (error) { return apiErrorResponse(error); }
}
