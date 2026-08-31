import type { DailyPlanItem, Profile, SkillMastery, SkillName } from "@/types";
const weights:Record<SkillName,number>={vocabulary:.15,grammar:.15,listening:.15,reading:.1,writing:.1,speaking:.15,pronunciation:.1,shadowing:.1};
export class AdaptiveLearningEngine {
  getWeakestSkill(skills:SkillMastery):SkillName { return (Object.entries(skills) as [SkillName,number][]).sort((a,b)=>a[1]-b[1])[0][0]; }
  calculateMastery(skills:SkillMastery){ return Math.round((Object.entries(weights) as [SkillName,number][]).reduce((sum,[k,w])=>sum+skills[k]*w,0)); }
  shouldUnlockModule(module:{unlockCriteria?:{minimumOverall?:number;skill?:SkillName;minimumSkill?:number}},skills:SkillMastery){ const c=module.unlockCriteria??{}; return this.calculateMastery(skills)>=(c.minimumOverall??0) && (!c.skill || skills[c.skill]>=(c.minimumSkill??0)); }
  getDailyPlan(profile:Profile, skills:SkillMastery, dueReviews:number, history:{minutesLast7Days?:number}={}):DailyPlanItem[]{
    const weak=this.getWeakestSkill(skills); const base=[
      ["fsrs","fsrs","مراجعة الذاكرة الذكية","Intelligente Wiederholung",30,`لديك ${dueReviews} بطاقة مستحقة`],
      ["weak",weak,`تدريب مركز: ${weak}`,"Fokus auf deine Schwäche",40,`هذه أضعف مهارة لديك (${skills[weak]}%)`],
      ["listen","listening","استماع مركز","Aktives Hören",25,"رفع فهم الكلام الطبيعي"],
      ["read","reading","قراءة سهلة + استرجاع","Leichtes Lesen",20,"تعلم الكلمات داخل سياق"],
      ["talk","speaking","محادثة AI","KI-Gespräch",15,"تحويل المعرفة إلى كلام"],
      ["pron","pronunciation","مختبر النطق","Aussprache-Labor",15,"تصحيح الأصوات والإيقاع"],
      ["gram","grammar","قواعد من أخطائك","Grammatik aus Fehlern",15,"معالجة الأنماط المتكررة"],
      ["write","writing","كتابة قصيرة","Kurzes Schreiben",20,"تثبيت التراكيب بالإنتاج"]
    ] as const;
    const scale=profile.dailyGoalMinutes/180;
    return base.map((x,i)=>({id:x[0],skill:x[1],titleAr:x[2],titleDe:x[3],minutes:Math.max(5,Math.round(x[4]*scale)),reason:x[5],priority:i+1}));
  }
  adjustDifficulty(performance:number){ if(performance>=.9)return 1; if(performance<.6)return -1; return 0; }
}
