// Reuses the owner's Wrangler OAuth session for this one account only.
// Refresh the session with wrangler whoami if it has expired; never log tokens.
import fs from 'node:fs/promises';import path from 'node:path';
export const account='c48b5b01708e393db6030be75bc17f13';
export async function cloudflareRequest(resource,options={}){
  if(resource.startsWith('/')||resource.includes('://'))throw Error('Invalid Cloudflare resource');
  const file=path.join(process.env.APPDATA,'xdg.config','.wrangler','config','default.toml'),token=/^oauth_token\s*=\s*"([^"]+)"/m.exec(await fs.readFile(file,'utf8'))?.[1];
  if(!token)throw Error('Wrangler login required');
  const response=await fetch('https://api.cloudflare.com/client/v4/accounts/'+account+'/'+resource,{...options,headers:{...options.headers,Authorization:'Bearer '+token},signal:AbortSignal.timeout(30000)});
  if(!response.ok){const data=await response.json().catch(()=>({}));throw Error('Cloudflare API: HTTP '+response.status+' '+(data.errors||[]).map(e=>e.code).join(','));}
  return response;
}
