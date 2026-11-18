import test from 'node:test';import assert from 'node:assert/strict';
import {FirestoreStore} from '../server/firestore.mjs';

test('Firestore REST escapes colon IDs without escaping RPCs or resource names',async()=>{
  const root='projects/fixture-lms/databases/(default)/documents',calls=[];
  const store=new FirestoreStore({FIREBASE_PROJECT_ID:'fixture-lms'},async(url,init)=>{
    calls.push({url,body:init.body&&JSON.parse(init.body)});
    if(url.endsWith('/lmsLimits/student%3Awrite'))return Response.json({name:root+'/lmsLimits/student:write',fields:{count:{integerValue:'1'}},updateTime:'v1'});
    if(url.endsWith('/users/missing%3Awrite'))return Response.json({}, {status:404});
    if(url.endsWith(':runQuery'))return Response.json([]);
    if(url.endsWith(':batchGet'))return Response.json([{missing:root+'/users/missing:write'}]);
    return Response.json({});
  });store.token=async()=> 'synthetic-token';
  assert.equal((await store.get('lmsLimits/student:write')).data.count,1);
  assert.equal(await store.get('users/missing:write'),null);
  assert.deepEqual(await store.list('lmsReports/daily:123/students'),[]);
  assert.ok(calls.at(-1).url.endsWith('/lmsReports/daily%3A123/students?pageSize=200'));
  assert.deepEqual(await store.query('lmsReports/daily:123/students'),[]);
  assert.ok(calls.at(-1).url.endsWith('/lmsReports/daily%3A123:runQuery'));
  assert.deepEqual(await store.getMany(['users/missing:write']),[null]);
  assert.deepEqual(calls.at(-1).body.documents,[root+'/users/missing:write']);
  await store.commit([{path:'lmsLimits/student:write',version:null,data:{count:1}}]);
  assert.ok(calls.at(-1).url.endsWith('/documents:commit'));
  assert.equal(calls.at(-1).body.writes[0].update.name,root+'/lmsLimits/student:write');
});
