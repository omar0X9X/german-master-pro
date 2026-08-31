import type { PronunciationScore } from "@/types";
export interface GenerateOptions { model?:string; temperature?:number; maxTokens?:number }
export interface AIProvider {
 generateText(prompt:string,options?:GenerateOptions):Promise<string>;
 generateJSON<T>(prompt:string):Promise<T>;
 transcribeAudio(audioBuffer:ArrayBuffer):Promise<string>;
 scorePronunciation(audioBuffer:ArrayBuffer,targetWord:string):Promise<PronunciationScore>;
 generateEmbedding(text:string):Promise<number[]>;
}
