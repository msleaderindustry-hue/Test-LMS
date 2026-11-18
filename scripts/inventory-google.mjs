import fs from 'node:fs/promises';import {googleRequest} from './google-client.mjs';
const project='my-lms-project-13739',folder='.deployment/inventory';await fs.mkdir(folder,{recursive:true});
const urls={billing:`https://cloudbilling.googleapis.com/v1/projects/${project}/billingInfo`,accounts:`https://iam.googleapis.com/v1/projects/${project}/serviceAccounts`,iam:`https://cloudresourcemanager.googleapis.com/v1/projects/${project}:getIamPolicy`,releases:`https://firebaserules.googleapis.com/v1/projects/${project}/releases`,users:`https://firestore.googleapis.com/v1/projects/${project}/databases/(default)/documents/users?pageSize=100&mask.fieldPaths=role&mask.fieldPaths=isBanned&mask.fieldPaths=allowedModules`};
const results=await Promise.allSettled(Object.entries(urls).map(async([name,url])=>{const value=await googleRequest(url,name==='iam'?{method:'POST',body:'{}'}:{});await fs.writeFile(folder+'/'+name+'.json',JSON.stringify(value,null,2));return {name,value};}));
for(let i=0;i<results.length;i++){
  const result=results[i];if(result.status!=='fulfilled'){console.log(JSON.stringify({name:Object.keys(urls)[i],error:result.reason.message}));continue;}
  const {name,value}=result.value;
  if(name==='billing')console.log(JSON.stringify({name,billingEnabled:!!value.billingEnabled}));
  else if(name==='accounts')console.log(JSON.stringify({name,accounts:(value.accounts||[]).map(a=>({email:a.email,disabled:!!a.disabled}))}));
  else if(name==='iam')console.log(JSON.stringify({name,roles:(value.bindings||[]).map(b=>b.role)}));
  else if(name==='users')console.log(JSON.stringify({name,count:value.documents?.length||0,more:!!value.nextPageToken,ownerProfilePresent:value.documents?.some(d=>d.name.endsWith('/1qhlWSbqAxd1dAvo2Nw92gdJhNk1'))}));
  else {console.log(JSON.stringify({name,releases:value.releases?.map(r=>r.name)}));for(const r of value.releases||[]){if(!r.name.endsWith('/cloud.firestore'))continue;const rules=await googleRequest('https://firebaserules.googleapis.com/v1/'+r.rulesetName);await fs.writeFile(folder+'/firestore.before.json',JSON.stringify(rules,null,2));for(const file of rules.source?.files||[])await fs.writeFile(folder+'/firestore.before.rules',file.content);}}
}
