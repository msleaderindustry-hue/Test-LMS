import test from 'node:test';import assert from 'node:assert/strict';
import {MemoryStore,MemoryBucket} from './helpers/memory-store.mjs';import {ControlService} from '../server/control.mjs';import {MaintenanceService} from '../server/maintenance.mjs';import {JobService} from '../server/jobs.mjs';import {discordEnvelope} from '../server/discord-format.mjs';import {OWNER_UID,DAY} from '../server/domain.mjs';import {timestamp} from '../server/firestore.mjs';
const now=Date.parse('2026-11-19T08:00Z'),owner={uid:OWNER_UID,owner:true};
test('manual TypeDrive presence cleanup preserves rooms and current players',async()=>{
 const store=new MemoryStore({'typeDriveRooms/finished':{stage:'finished'},'typeDriveRooms/playing':{stage:'playing'},'typeDrivePresence/old':{online:true,lastSeen:timestamp(now-120000)},'typeDrivePresence/current':{online:true,lastSeen:timestamp(now)}}),control=new ControlService({store,backups:new MemoryBucket(),now:()=>now});
 const result=await control.manual(owner,'cleanup',{kind:'drive',mode:'drivePresence'},'drive-presence');assert.equal(result.deleted,1);assert.equal(await store.get('typeDrivePresence/old'),null);for(const path of ['typeDriveRooms/finished','typeDriveRooms/playing','typeDrivePresence/current'])assert.ok(await store.get(path));
});
test('manual owner cleanup and restore complete directly with backup and replay protection',async()=>{
 const store=new MemoryStore({'users/s/activity/old':{kind:'navigation',at:now-DAY},'users/s':{nickname:'Ученик'}}),backups=new MemoryBucket(),control=new ControlService({store,backups,now:()=>now});
 const result=await control.manual(owner,'cleanup',{kind:'activity',uid:'s'},'manual-1');assert.equal(result.deleted,1);assert.equal(await store.get('users/s/activity/old'),null);assert.ok(await backups.get('snapshots/'+(await store.get('lmsProposals/'+result.backupId)).data.payload.snapshotId+'.json'));
 assert.equal((await control.manual(owner,'cleanup',{kind:'activity',uid:'s'},'manual-1')).replayed,true);
 await assert.rejects(()=>control.manual(owner,'cleanup',{kind:'diagnostics'},'manual-1'),e=>e.code==='request-reused');
 assert.equal((await control.manual(owner,'restore',{backupId:result.backupId},'restore-1')).restored,1);assert.ok(await store.get('users/s/activity/old'));
 await assert.rejects(()=>control.manual({uid:'s'},'cleanup',{kind:'activity'},'unauthorized'),e=>e.status===403);
});
test('scheduled maintenance proposes only old operational data, preserves results and waits for owner',async()=>{
 const seed={'platformErrors/old':{at:timestamp(now-40*DAY)},'platformErrors/recent':{at:timestamp(now-DAY)},'users/s':{testHistory:[{id:'result',percent:80}]},'users/s/activity/old':{at:timestamp(now-100*DAY)},'lmsAttempts/s:old':{uid:'s',at:now-100*DAY,module:'tests'},'chessRooms/finished':{status:'finished',endedAt:timestamp(now-40*DAY)},'chessRooms/active':{status:'playing',createdAt:timestamp(now-40*DAY)}};
 const store=new MemoryStore(seed),control=new ControlService({store,backups:new MemoryBucket(),now:()=>now}),maintenance=new MaintenanceService({store,control,now:()=>now});
 const result=await maintenance.inspect();assert.equal(result.created.length,3);for(const path of Object.keys(seed))assert.ok(await store.get(path));
 assert.equal((await maintenance.inspect()).created.length,0);
 for(const id of result.created){const p=await store.get('lmsProposals/'+id);assert.equal(p.data.source,'maintenance');assert.ok(p.data.expiresAt>=now+DAY);assert.ok(p.data.payload.entries.every(e=>!e.path.startsWith('lmsAttempts/')));}
 const p=(await store.query('lmsProposals',[['type','EQUAL','cleanup']])).find(p=>p.data.payload.kind==='diagnostics');await control.approve(owner,p.data.id,p.data.digest);assert.equal(await store.get('platformErrors/old'),null);assert.ok(await store.get('platformErrors/recent'));assert.ok(await store.get('lmsAttempts/s:old'));
});
test('temporary failures recover on schedule with bounded retries; permanent failures do not',async()=>{
 const store=new MemoryStore({'lmsJobs/retry':{id:'retry',kind:'notification',status:'failed',recoverable:true,failedAt:now-2*3600000,tries:5},'lmsJobs/permanent':{id:'permanent',status:'failed',recoverable:false,failedAt:now-2*3600000},'lmsJobs/exhausted':{id:'exhausted',status:'failed',recoverable:true,recoveryCycles:3,failedAt:now-2*3600000}}),sent=[],jobs=new JobService({store,now:()=>now,queue:{send:async x=>sent.push(x)}});await jobs.schedule(now);assert.equal((await store.get('lmsJobs/retry')).data.status,'pending');assert.equal((await store.get('lmsJobs/retry')).data.recoveryCycles,1);assert.equal((await store.get('lmsJobs/permanent')).data.status,'failed');assert.equal((await store.get('lmsJobs/exhausted')).data.status,'failed');assert.deepEqual(sent,[{id:'retry'}]);
});
test('Discord uses bounded embeds and login deliveries include the verified account name',async()=>{
 const store=new MemoryStore({'users/s':{nickname:'@everyone **Name**'}}),delivered=[],jobs=new JobService({store,now:()=>now,discord:async(content,envelope)=>delivered.push(envelope)});const j=await jobs.enqueue('login',{uid:'s',at:now},'session');await jobs.run(j.jobId);assert.equal(delivered.length,1);assert.match(delivered[0].embeds[0].title,/Вход/);assert.ok(!delivered[0].embeds[0].description.includes('@everyone'));assert.deepEqual(delivered[0].allowed_mentions.parse,[]);assert.ok(discordEnvelope('x'.repeat(3000)).embeds[0].description.length<=1850);
});
