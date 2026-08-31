import type { SkillMastery } from "@/types";
export const MASTERY={skill:80,levelUnlock:70,wordSuccessfulReviews:3,grammarCorrectStreak:5};
export function isSkillMastered(v:number){return v>=MASTERY.skill}
export function canUnlockNextLevel(skills:SkillMastery){return Object.values(skills).every(v=>v>=MASTERY.levelUnlock)}
export function wordMastered(successfulReviews:number){return successfulReviews>=MASTERY.wordSuccessfulReviews}
export function grammarMastered(correctStreak:number){return correctStreak>=MASTERY.grammarCorrectStreak}
