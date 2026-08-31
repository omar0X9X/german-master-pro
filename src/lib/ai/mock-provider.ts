import type { AIProvider } from "./providers";
import type { PronunciationScore } from "@/types";
export class MockProvider implements AIProvider{
 async generateText(prompt:string){ if(/grammar|قواعد|صحح/i.test(prompt)) return "التصحيح المقترح: Ich bin gestern nach Hause gegangen.\nالسبب: الفعل gehen في Perfekt يستخدم sein."; return "Gut gemacht! 🇩🇪 سنكمل بالألمانية البسيطة، وإذا أخطأت سأشرح لك بالعربية دون قطع المحادثة."; }
 async generateJSON<T>(_prompt:string){ return {ok:true,provider:"mock"} as T; }
 async transcribeAudio(_audioBuffer:ArrayBuffer){ return "Ich lerne jeden Tag Deutsch."; }
 async scorePronunciation(_audioBuffer:ArrayBuffer,targetWord:string):Promise<PronunciationScore>{ return {overall:82,accuracy:84,fluency:78,completeness:86,feedbackAr:[`نطق ${targetWord} جيد. ركز على طول الحركة والإيقاع.`]}; }
 async generateEmbedding(text:string){ return Array.from({length:16},(_,i)=>((text.charCodeAt(i%Math.max(1,text.length))||0)%31)/31); }
}
