// Authorized release preparation: adds a dedicated Firestore-only identity.
// Never prints credentials. .deployment must have owner-only OS permissions.
import fs from 'node:fs/promises';import {randomBytes} from 'node:crypto';
import {googleRequest} from './google-client.mjs';import {FirestoreStore} from '../server/firestore.mjs';
const project='my-lms-project-13739',accountId='lms-control-server',email=accountId+'@'+project+'.iam.gserviceaccount.com';
const accountUrl=`https://iam.googleapis.com/v1/projects/${project}/serviceAccounts/${email}`;
try{await googleRequest(accountUrl);}catch(e){if(e.status!==404)throw e;await googleRequest(`https://iam.googleapis.com/v1/projects/${project}/serviceAccounts`,{method:'POST',body:JSON.stringify({accountId,serviceAccount:{displayName:'LMS server (Firestore only)'}})});}
const projectUrl='https://cloudresourcemanager.googleapis.com/v1/projects/'+project;
const policy=await googleRequest(projectUrl+':getIamPolicy',{method:'POST',body:JSON.stringify({options:{requestedPolicyVersion:3}})});
const member='serviceAccount:'+email;let binding=policy.bindings?.find(b=>b.role==='roles/datastore.user'&&!b.condition);
if(!binding?.members.includes(member)){
  policy.bindings||=[];if(!binding){binding={role:'roles/datastore.user',members:[]};policy.bindings.push(binding);}binding.members.push(member);
  await googleRequest(projectUrl+':setIamPolicy',{method:'POST',body:JSON.stringify({policy})});
}
const accountFile='.deployment/firestore-service-account.json';let account;
try{account=await fs.readFile(accountFile,'utf8');}catch(e){
  if(e.code!=='ENOENT')throw e;
  const key=await googleRequest(accountUrl+'/keys',{method:'POST',body:JSON.stringify({privateKeyType:'TYPE_GOOGLE_CREDENTIALS_FILE',keyAlgorithm:'KEY_ALG_RSA_2048'})});
  account=Buffer.from(key.privateKeyData,'base64').toString('utf8');await fs.writeFile(accountFile,account,{flag:'wx',mode:0o600});
}
const parsed=JSON.parse(account);if(parsed.project_id!==project||parsed.client_email!==email)throw Error('Local server identity does not match this project');
const sharedFile='.deployment/server-secrets.json';let shared;
try{shared=JSON.parse(await fs.readFile(sharedFile,'utf8'));}catch(e){if(e.code!=='ENOENT')throw e;shared={INTERNAL_DISCORD_TOKEN:randomBytes(32).toString('base64url'),BACKUP_ENCRYPTION_KEY:randomBytes(32).toString('base64')};await fs.writeFile(sharedFile,JSON.stringify(shared),{flag:'wx',mode:0o600});}
await fs.writeFile('.deployment/api-secrets.json',JSON.stringify({...shared,FIREBASE_SERVICE_ACCOUNT:account}),{mode:0o600});
await fs.writeFile('.deployment/discord-secrets.json',JSON.stringify({INTERNAL_DISCORD_TOKEN:shared.INTERNAL_DISCORD_TOKEN}),{mode:0o600});
const store=new FirestoreStore({FIREBASE_PROJECT_ID:project,FIREBASE_SERVICE_ACCOUNT:account});
const docs=await store.getMany(['users/1qhlWSbqAxd1dAvo2Nw92gdJhNk1','users/lms-preflight-missing-document']);
if(!docs[0]||docs[1])throw Error('Unexpected read-only preflight result');
console.log(JSON.stringify({identity:email,role:'roles/datastore.user',credentialsPrepared:true,readOnlyPreflight:'passed',workersPublished:false}));
