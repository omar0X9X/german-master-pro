import type { FSRSCard, Rating } from "@/types";
import { clamp } from "@/lib/utils";
export const FSRS45_WEIGHTS=[0.4,0.6,2.4,5.8,4.93,0.94,0.86,0.01,1.49,0.14,0.94,2.18,0.05,0.34,1.26,0.29,2.61] as const;
const DAY=86400000;
function initStability(r:Rating,w=FSRS45_WEIGHTS){return Math.max(.1,w[r-1])}
function initDifficulty(r:Rating,w=FSRS45_WEIGHTS){return clamp(w[4]-Math.exp(w[5]*(r-1))+1,1,10)}
function retrievability(elapsed:number,stability:number){return Math.pow(1+elapsed/(9*Math.max(.1,stability)),-1)}
function nextDifficulty(d:number,r:Rating,w=FSRS45_WEIGHTS){ const next=d-w[6]*(r-3); return clamp(w[7]*w[4]+(1-w[7])*next,1,10); }
function nextRecallStability(d:number,s:number,r:Rating,R:number,w=FSRS45_WEIGHTS){ const hard=r===2?w[15]:1; const easy=r===4?w[16]:1; return s*(1+Math.exp(w[8])*(11-d)*Math.pow(s,-w[9])*(Math.exp((1-R)*w[10])-1)*hard*easy); }
function nextForgetStability(d:number,s:number,R:number,w=FSRS45_WEIGHTS){ return Math.max(.1,w[11]*Math.pow(d,-w[12])*(Math.pow(s+1,w[13])-1)*Math.exp((1-R)*w[14])); }
function intervalFromStability(s:number,retention=.9){return clamp(Math.round(9*s*(1/retention-1)),1,36500)}
function fuzz(interval:number,seed:number){ if(interval<3)return interval; const spread=Math.max(1,Math.round(interval*.05)); const n=((seed*9301+49297)%233280)/233280; return clamp(Math.round(interval-spread+n*spread*2),1,36500); }
export function createNewCard(now=new Date()):FSRSCard{return{due:now,stability:0,difficulty:0,elapsedDays:0,scheduledDays:0,reps:0,lapses:0,state:"New"}}
export function reviewCard(card:FSRSCard,rating:Rating,now=new Date(),desiredRetention=.9):FSRSCard{
 const elapsed=card.lastReview?Math.max(0,(now.getTime()-card.lastReview.getTime())/DAY):0; const reps=card.reps+1;
 if(card.state==="New"){
  const s=initStability(rating),d=initDifficulty(rating); const learning=rating===1||rating===2; const days=rating===1?0:rating===2?1:fuzz(intervalFromStability(s,desiredRetention),reps);
  return{...card,stability:s,difficulty:d,elapsedDays:elapsed,scheduledDays:days,reps,lapses:rating===1?1:0,state:learning?"Learning":"Review",lastReview:now,due:new Date(now.getTime()+days*DAY)};
 }
 const R=retrievability(elapsed,Math.max(.1,card.stability)); const d=nextDifficulty(card.difficulty,rating); const failed=rating===1;
 const s=failed?nextForgetStability(d,card.stability,R):nextRecallStability(d,card.stability,rating,R); const days=failed?0:fuzz(intervalFromStability(s,desiredRetention),reps+card.lapses);
 return{...card,stability:s,difficulty:d,elapsedDays:elapsed,scheduledDays:days,reps,lapses:card.lapses+(failed?1:0),state:failed?"Relearning":"Review",lastReview:now,due:new Date(now.getTime()+days*DAY)};
}
export const fsrsMath={retrievability,intervalFromStability,nextDifficulty};
