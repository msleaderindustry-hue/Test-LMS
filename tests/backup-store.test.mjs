import test from 'node:test';import assert from 'node:assert/strict';
import {FirestoreBackupStore} from '../server/backup-store.mjs';import {MemoryStore} from './helpers/memory-store.mjs';import {ControlService} from '../server/control.mjs';import {OWNER_UID} from '../server/domain.mjs';
const secret=Buffer.alloc(32,17).toString('base64');
test('encrypted archive round-trips across chunks without storing student text',async()=>{
  const store=new MemoryStore(),backups=new FirestoreBackupStore(store,secret),source=JSON.stringify({text:'Закрытая история ученика '.repeat(30000)});
  await backups.put('snapshots/test.json',source);assert.equal(await (await backups.get('snapshots/test.json')).text(),source);
  assert.ok((await store.list('lmsBackups/test/chunks')).length>1);assert.ok(!JSON.stringify([...store.rows.values()]).includes('Закрытая история'));
  await assert.rejects(()=>backups.put('snapshots/test.json','overwrite'),{code:'conflict'});
});
test('missing encryption key and damaged archive cannot lead to a cleanup',async()=>{
  const store=new MemoryStore({'users/student':{role:'student'},'users/student/activity/e':{type:'navigation'}}),backups=new FirestoreBackupStore(store,secret),control=new ControlService({store,backups});
  await assert.rejects(()=>new FirestoreBackupStore(store,undefined).put('snapshots/no-key.json','x'),{code:'backup-key-missing'});
  const p=await control.proposeCleanup({uid:OWNER_UID},{kind:'activity',uid:'student'}),row=await store.get('lmsProposals/'+p.id),chunk=await store.get('lmsBackups/'+row.data.payload.snapshotId+'/chunks/0');
  const data=chunk.data.data;await store.commit([{path:chunk.path,version:chunk.version,data:{...chunk.data,data:(data[0]==='A'?'B':'A')+data.slice(1)}}]);
  await assert.rejects(()=>control.approve({uid:OWNER_UID},p.id,p.digest),{code:'backup-unreadable'});assert.ok(await store.get('users/student/activity/e'));
});
test('cleanup and restoration work with the encrypted Firestore archive',async()=>{
  const store=new MemoryStore({'users/student':{role:'student'},'users/student/activity/e':{type:'navigation'}}),control=new ControlService({store,backups:new FirestoreBackupStore(store,secret)}),owner={uid:OWNER_UID};
  const p=await control.proposeCleanup(owner,{kind:'activity',uid:'student'}),deleted=await control.approve(owner,p.id,p.digest);assert.equal(deleted.deleted,1);assert.equal(await store.get('users/student/activity/e'),null);
  const restore=await control.proposeRestore(owner,p.id);await control.approve(owner,restore.id,restore.digest);assert.equal((await store.get('users/student/activity/e')).data.type,'navigation');
});
