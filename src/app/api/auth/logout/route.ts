import { apiErrorResponse, enforceRateLimit, noStoreJson } from "@/lib/security/api";
import { getSupabaseServerClient } from "@/lib/supabase/server";
export async function POST(req:Request){try{enforceRateLimit(req,"auth:logout",30);const supabase=await getSupabaseServerClient();if(!supabase)return noStoreJson({ok:true,mode:"mock"});const{error}=await supabase.auth.signOut();if(error)throw error;return noStoreJson({ok:true,mode:"supabase"})}catch(error){return apiErrorResponse(error)}}
