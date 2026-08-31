import { AIManager } from "@/lib/ai";
import { apiErrorResponse, enforceRateLimit, noStoreJson, parseJson } from "@/lib/security/api";
import { grammarCheckSchema } from "@/lib/validation/api-schemas";
export async function POST(req:Request){try{enforceRateLimit(req,"ai:grammar",30);const {text}=await parseJson(req,grammarCheckSchema);return noStoreJson({feedback:await new AIManager().checkGrammar(text)})}catch(error){return apiErrorResponse(error)}}
