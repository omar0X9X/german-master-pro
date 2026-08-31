import { AdaptiveLearningEngine } from "@/lib/engine/adaptive-learning";
import { apiErrorResponse, enforceRateLimit, noStoreJson, parseJson } from "@/lib/security/api";
import { dailyPlanSchema } from "@/lib/validation/api-schemas";

export async function POST(req: Request) {
  try {
    enforceRateLimit(req, "daily-plan", 60);
    const { profile, skills, dueReviews } = await parseJson(req, dailyPlanSchema);
    const engine = new AdaptiveLearningEngine();
    return noStoreJson({ weakestSkill: engine.getWeakestSkill(skills), mastery: engine.calculateMastery(skills), plan: engine.getDailyPlan(profile as never, skills, dueReviews) });
  } catch (error) { return apiErrorResponse(error); }
}
