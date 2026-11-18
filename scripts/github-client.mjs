// Uses the owner's Git Credential Manager sign-in. Tokens stay in memory.
import {execFileSync} from 'node:child_process';
const root='/repos/msleaderindustry-hue/Test-LMS';
let token;
export async function githubRequest(path='',options={}){
  if(path&&(!path.startsWith('/')||path.includes('://')))throw Error('Invalid repository API path');
  if(!token){const value=execFileSync('git',['credential','fill'],{input:'protocol=https\nhost=github.com\n\n',encoding:'utf8',env:{...process.env,GIT_TERMINAL_PROMPT:'0',GCM_INTERACTIVE:'never'}});token=/^password=(.+)$/m.exec(value)?.[1]?.trim();if(!token)throw Error('GitHub login required');}
  const response=await fetch('https://api.github.com'+root+path,{...options,headers:{Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28',...options.headers,Authorization:'Bearer '+token,'Content-Type':'application/json'},signal:AbortSignal.timeout(30000)});
  const data=response.status===204?null:await response.json();if(!response.ok)throw Error('GitHub repository API: HTTP '+response.status+' '+String(data?.message||'').slice(0,180));return data;
}
