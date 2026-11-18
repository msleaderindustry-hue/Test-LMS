import { jsonBody } from '../server/auth.mjs';
import { digest } from '../server/domain.mjs';
export default {
  async fetch(request,env){
    // Called only through the API Worker's service binding, never by students.
    const token=request.headers.get('Authorization');
    if(!env.INTERNAL_DISCORD_TOKEN||await digest(token||'')!==await digest('Bearer '+env.INTERNAL_DISCORD_TOKEN))return Response.json({error:'unauthorized'},{status:401});
    if(request.method!=='POST')return Response.json({error:'method'},{status:405});
    try{
      const body=await jsonBody(request,8000);if(typeof body.content!=='string'||!body.content.trim()||body.content.length>1900)return Response.json({error:'invalid-message'},{status:400});
      const url=new URL(env.DISCORD_WEBHOOK_URL);if(url.protocol!=='https:'||!['discord.com','discordapp.com'].includes(url.hostname)||!url.pathname.startsWith('/api/webhooks/'))return Response.json({error:'configuration'},{status:503});
      url.searchParams.set('wait','true');
      const response=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({content:body.content,allowed_mentions:{parse:[]}}),signal:AbortSignal.timeout(15000)});
      if(response.status===429){let data={};try{data=await response.json()}catch{}const retry=Math.max(1,Math.min(3600,Number(data.retry_after)||Number(response.headers.get('Retry-After'))||60));return Response.json({error:'rate-limit',retryAfter:retry},{status:429,headers:{'Retry-After':String(retry)}});}
      if(!response.ok)return Response.json({error:'delivery-failed',permanent:[401,403,404].includes(response.status)},{status:response.status});
      return Response.json({success:true});
    }catch(e){return Response.json({error:e.code||'delivery-unknown'},{status:e.status||502});}
  }
};
