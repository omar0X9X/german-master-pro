import { z } from "zod";
import { apiErrorResponse, enforceRateLimit, noStoreJson, parseJson } from "@/lib/security/api";
import { getSupabaseServerClient } from "@/lib/supabase/server";
const schema=z.object({email:z.string().email().max(254),password:z.string().min(8).max(128)});
export async function POST(req:Request){try{enforceRateLimit(req,"auth:login",10,15*60_000);const input=await parseJson(req,schema);const supabase=await getSupabaseServerClient();if(!supabase)return noStoreJson({mode:"mock",user:{id:"mock-user",email:input.email},message:"Mock Mode: تم فتح جلسة تجريبية فقط."});const{data,error}=await supabase.auth.signInWithPassword(input);if(error)return noStoreJson({error:"بيانات الدخول غير صحيحة",code:"AUTH_LOGIN_FAILED"},{status:401});return noStoreJson({mode:"supabase",user:data.user})}catch(error){return apiErrorResponse(error)}}
