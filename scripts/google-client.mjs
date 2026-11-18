// Deployment tooling only. Reuses the owner's Firebase CLI sign-in.
// Credentials stay in memory and must never be printed or written by callers.
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),auth=require('firebase-tools/lib/auth.js');
const allowed=new Set(['firestore.googleapis.com','firebaserules.googleapis.com','iam.googleapis.com','cloudresourcemanager.googleapis.com','cloudbilling.googleapis.com','serviceusage.googleapis.com']);
export async function googleRequest(url,options={}){
  if(!allowed.has(new URL(url).hostname)||!url.startsWith('https://'))throw Error('Unapproved Google API host');
  const account=auth.getProjectDefaultAccount(process.cwd());if(!account)throw Error('Run firebase login first');
  const {access_token}=await auth.getAccessToken(account.tokens.refresh_token,[]);
  const response=await fetch(url,{...options,headers:{...options.headers,Authorization:'Bearer '+access_token,'Content-Type':'application/json'},signal:AbortSignal.timeout(30000)});
  const value=await response.json();if(!response.ok){const error=Error(`${new URL(url).hostname}: HTTP ${response.status} ${value.error?.status||''}`);error.status=response.status;error.code=value.error?.status;throw error;}
  return value;
}
