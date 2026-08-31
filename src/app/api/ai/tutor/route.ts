import { AIManager } from "@/lib/ai";
import { apiErrorResponse, enforceRateLimit, noStoreJson, parseJson } from "@/lib/security/api";
import { tutorSchema } from "@/lib/validation/api-schemas";

export async function POST(req: Request) {
  try {
    enforceRateLimit(req, "ai:tutor", 40);
    const input = await parseJson(req, tutorSchema);
    const response = await new AIManager().tutorResponse(input.message, { level: input.level, scenario: input.scenario, mistakes: input.mistakes });
    return noStoreJson({ response });
  } catch (error) { return apiErrorResponse(error); }
}
