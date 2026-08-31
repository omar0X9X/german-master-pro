export type CEFRLevel = "A0"|"A1"|"A2"|"B1"|"B2";
export type SkillName = "vocabulary"|"grammar"|"listening"|"reading"|"writing"|"speaking"|"pronunciation"|"shadowing";
export type SkillMastery = Record<SkillName, number>;
export interface Profile { id?: string; fullName: string; nativeLanguage: "ar"; targetLevel: CEFRLevel; currentLevel: CEFRLevel; dailyGoalMinutes: number; streakCount: number; totalXp: number; }
export interface DailyPlanItem { id: string; skill: SkillName|"fsrs"; titleAr: string; titleDe: string; minutes: number; reason: string; priority: number; }
export interface ReadingQuestion { question: string; options: string[]; correctIndex: number; explanationAr?: string; }
export interface ReadingText { id:string; title:string; level:Exclude<CEFRLevel,"A0">; wordCount:number; estimatedMinutes:number; genre:string; germanText:string; arabicTranslation:string; vocabularyGlossary:{word:string;meaning:string;article:string|null}[]; comprehensionQuestions:ReadingQuestion[]; }
export type Rating = 1|2|3|4;
export type FSRSState = "New"|"Learning"|"Review"|"Relearning";
export interface FSRSCard { due: Date; stability:number; difficulty:number; elapsedDays:number; scheduledDays:number; reps:number; lapses:number; state:FSRSState; lastReview?:Date; }
export interface PronunciationScore { overall:number; accuracy:number; fluency:number; completeness:number; feedbackAr:string[]; phonemeScores?:Record<string,number>; }
