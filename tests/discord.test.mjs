import test from 'node:test';import assert from 'node:assert/strict';import discord from '../workers/discord.mjs';import {discordEnvelope} from '../server/discord-format.mjs';
test('private Discord relay accepts formatted embeds, suppresses mentions and preserves retry signals',async t=>{
 const native=globalThis.fetch,captured=[];t.after(()=>{globalThis.fetch=native;});
 const env={INTERNAL_DISCORD_TOKEN:'synthetic-internal-token',DISCORD_WEBHOOK_URL:'https://discord.com/api/webhooks/123/synthetic'};
 const request=(body,token=env.INTERNAL_DISCORD_TOKEN)=>new Request('https://discord.internal/send',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify(body)});
 globalThis.fetch=async(url,init)=>{captured.push(JSON.parse(init.body));return Response.json({id:'synthetic-message'});};
 assert.equal((await discord.fetch(request(discordEnvelope('Вошёл в LMS',{kind:'login'})),env)).status,200);assert.equal(captured.length,1);assert.equal(captured[0].embeds.length,1);assert.deepEqual(captured[0].allowed_mentions.parse,[]);
 assert.equal((await discord.fetch(request({content:'x'},'bad-token'),env)).status,401);assert.equal(captured.length,1);
 globalThis.fetch=async()=>Response.json({retry_after:12},{status:429});const limited=await discord.fetch(request(discordEnvelope('Отчёт',{kind:'report'})),env);assert.equal(limited.status,429);assert.equal((await limited.json()).retryAfter,12);
});
