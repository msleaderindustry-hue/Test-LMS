import fs from 'node:fs';
const pairs=[['lmsAttempts',['uid','at']],['lmsAttempts',['module','uid']],['lmsAttempts',['module','uid','id']],['lmsEvents',['uid','at']],['lmsProposals',['type','status']]];
fs.writeFileSync('firestore.indexes.json',JSON.stringify({indexes:pairs.map(([collectionGroup,keys])=>({collectionGroup,queryScope:'COLLECTION',fields:keys.map(fieldPath=>({fieldPath,order:'ASCENDING'}))})),fieldOverrides:[]},null,2)+'\n');
