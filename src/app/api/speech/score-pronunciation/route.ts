import { z } from "zod";
import { scoreTranscriptPronunciation } from "@/lib/engine/pronunciation-engine";
import { apiErrorResponse, enforceRateLimit, noStoreJson, parseJson } from "@/lib/security/api";

const schema = z.object({
  target: z.string().trim().min(1).max(500),
  transcript: z.string().trim().min(1).max(500),
  durationMs: z.number().int().positive().max(120000).optional(),
});

export async function POST(req: Request) {
  try {
    enforceRateLimit(req, "speech:score", 60);
    const { target, transcript, durationMs } = await parseJson(req, schema);
    return noStoreJson(scoreTranscriptPronunciation(target, transcript, durationMs));
  } catch (error) { return apiErrorResponse(error); }
}
