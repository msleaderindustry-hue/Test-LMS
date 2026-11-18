// Read-only release snapshot, compatible with Spark (no managed Export/Blaze).
// Run only after restricting the OS permissions on .deployment/.
import fs from 'node:fs/promises';import {createHash,randomBytes,createCipheriv,createDecipheriv} from 'node:crypto';
import {googleRequest} from './google-client.mjs';
const project='my-lms-project-13739',root=`projects/${project}/databases/(default)/documents`,base='https://firestore.googleapis.com/v1/'+root;
const escapePath=path=>path.split('/').map(encodeURIComponent).join('/');
const folder='.deployment/snapshots';await fs.mkdir(folder,{recursive:true});
const readTime=new Date(Date.now()-15000).toISOString(),documents=[],collections=new Map();let bytes=0;
const pending=[''],seen=new Set();
async function visit(parent){
  let next='';const ids=[];
  do{const page=await googleRequest(base+(parent?'/'+escapePath(parent):'')+':listCollectionIds',{method:'POST',body:JSON.stringify({pageSize:100,readTime,...(next?{pageToken:next}:{})})});ids.push(...(page.collectionIds||[]));next=page.nextPageToken||'';}while(next);
  for(const id of ids){
    const path=(parent?parent+'/':'')+id;let token='';
    do{
      const params=new URLSearchParams({pageSize:'100',showMissing:'true',readTime});if(token)params.set('pageToken',token);
      const page=await googleRequest(base+'/'+escapePath(path)+'?'+params);
      for(const doc of page.documents||[]){
        const relative=doc.name.slice(root.length+1);if(seen.has(relative))throw Error('Duplicate snapshot path');seen.add(relative);pending.push(relative);
        if(doc.createTime){documents.push(doc);bytes+=Buffer.byteLength(JSON.stringify(doc));collections.set(path.split('/')[0],(collections.get(path.split('/')[0])||0)+1);}
        if(seen.size>10000||bytes>100_000_000)throw Error('Snapshot exceeds the reviewed scope; no complete archive produced');
      }token=page.nextPageToken||'';
    }while(token);
  }
}
while(pending.length){const batch=pending.splice(0,4);await Promise.all(batch.map(visit));}
const plaintext=Buffer.from(JSON.stringify({version:1,project,readTime,documents})),checksum=createHash('sha256').update(plaintext).digest('hex');
const keyPath='.deployment/snapshot-encryption-key.bin';let key;try{key=await fs.readFile(keyPath);}catch(e){if(e.code!=='ENOENT')throw e;key=randomBytes(32);await fs.writeFile(keyPath,key,{flag:'wx',mode:0o600});}
const iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',key,iv);cipher.setAAD(Buffer.from(project));
const encrypted=Buffer.concat([cipher.update(plaintext),cipher.final()]),tag=cipher.getAuthTag(),file=folder+'/firestore-'+readTime.replace(/[:.]/g,'-')+'.aes';
await fs.writeFile(file,Buffer.concat([iv,tag,encrypted]),{flag:'wx',mode:0o600});
const stored=await fs.readFile(file),check=createDecipheriv('aes-256-gcm',key,stored.subarray(0,12));check.setAAD(Buffer.from(project));check.setAuthTag(stored.subarray(12,28));
const verified=Buffer.concat([check.update(stored.subarray(28)),check.final()]);if(createHash('sha256').update(verified).digest('hex')!==checksum)throw Error('Snapshot verification failed');
const manifest={version:1,project,readTime,documents:documents.length,bytes:plaintext.length,sha256:checksum,collections:Object.fromEntries(collections),verified:true,file};
await fs.writeFile(file+'.manifest.json',JSON.stringify(manifest,null,2));console.log(JSON.stringify(manifest));
