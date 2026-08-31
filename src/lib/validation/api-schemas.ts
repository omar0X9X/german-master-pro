import { z } from "zod";

export const cefrLevel = z.enum(["A0", "A1", "A2", "B1", "B2"]);
export const skillName = z.enum(["vocabulary", "grammar", "listening", "reading", "writing", "speaking", "pronunciation", "shadowing"]);

export const tutorSchema = z.object({
  message: z.string().trim().min(1).max(4000),
  level: cefrLevel.default("A1"),
  scenario: z.string().trim().max(100).optional(),
  mistakes: z.array(z.string().max(240)).max(20).optional(),
});

export const grammarCheckSchema = z.object({ text: z.string().trim().min(1).max(5000) });
export const translateSchema = z.object({ text: z.string().trim().min(1).max(5000), target: z.enum(["ar", "de"]).default("ar") });
export const writingSchema = z.object({ prompt: z.string().trim().min(1).max(1000), submission: z.string().trim().min(1).max(10000), level: cefrLevel.default("A1") });
export const conversationSchema = z.object({ scenario: z.string().trim().min(1).max(120), level: cefrLevel.default("A1") });
export const readingGenerationSchema = z.object({ topic: z.string().trim().min(2).max(120), level: cefrLevel.exclude(["A0"]).default("A1") });

export const fsrsReviewSchema = z.object({
  card: z.object({
    due: z.coerce.date(),
    stability: z.number().min(0),
    difficulty: z.number().min(0).max(10),
    elapsedDays: z.number().min(0),
    scheduledDays: z.number().min(0),
    reps: z.number().int().min(0),
    lapses: z.number().int().min(0),
    state: z.enum(["New", "Learning", "Review", "Relearning"]),
    lastReview: z.coerce.date().optional(),
  }),
  rating: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  desiredRetention: z.number().min(.7).max(.99).default(.9),
});

export const skillsSchema = z.record(skillName, z.number().min(0).max(100));
export const dailyPlanSchema = z.object({
  profile: z.object({ dailyGoalMinutes: z.number().int().min(30).max(360), currentLevel: cefrLevel.default("A0"), targetLevel: cefrLevel.default("B1") }).passthrough(),
  skills: skillsSchema,
  dueReviews: z.number().int().min(0).max(10000).default(0),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  level: cefrLevel.optional(),
  query: z.string().trim().max(100).optional(),
});
