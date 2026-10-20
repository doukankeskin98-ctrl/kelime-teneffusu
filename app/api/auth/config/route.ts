import {authConfig,authJson,authFailure} from '@/lib/auth/server';
export const dynamic='force-dynamic';
export async function GET(){try{return authJson({...authConfig(),available:true});}catch{return authJson({available:false});}}
