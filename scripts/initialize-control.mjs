// One-time setup already requested by the owner: manual pilot and both schedules.
// Run only after the protected rules and compatible client/server are deployed.
import fs from 'node:fs/promises';import {FirestoreStore} from '../server/firestore.mjs';
import {initialPolicy,OWNER_UID} from '../server/domain.mjs';
const store=new FirestoreStore({FIREBASE_PROJECT_ID:'my-lms-project-13739',FIREBASE_SERVICE_ACCOUNT:await fs.readFile('.deployment/firestore-service-account.json','utf8')});
const existing=await store.get('lmsSettings/control');
if(existing)console.log(JSON.stringify({initialized:false,reason:'Existing owner settings preserved'}));
else{
  const now=Date.now(),defaults=initialPolicy(),policy={...defaults,pilotStartedAt:now,reports:{...defaults.reports,enabled:true,enabledAt:now}};
  await store.commit([{path:'lmsSettings/control',version:null,data:policy},{path:'lmsAudit/release-20261118-ai2',version:null,data:{type:'deployment-setup',actorUid:OWNER_UID,source:'owner-requested-release',at:now,summary:'Начат ручной пилот; включены ежедневные и недельные отчёты в согласованное время. Автоматическая выдача и критерии профи не включены.'}}]);
  console.log(JSON.stringify({initialized:true,manualPilotStartedAt:new Date(now).toISOString(),automaticAssignments:false,proficiencyApproved:false,reportsEnabled:true}));
}
