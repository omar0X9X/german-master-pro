import type { SkillMastery } from "@/types";
import { canUnlockNextLevel } from "./mastery-system";
export interface UnlockableLesson {id:string;order:number;scorePrevious?:number;completedPrevious?:boolean}
export function lessonUnlocked(lesson:UnlockableLesson){ return lesson.order===1 || (lesson.completedPrevious===true && (lesson.scorePrevious??0)>=70); }
export function levelUnlocked(skills:SkillMastery){ return canUnlockNextLevel(skills); }
export function examUnlocked(levelCompleted:boolean){return levelCompleted}
