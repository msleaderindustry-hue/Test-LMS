import { createRemoteJWKSet, jwtVerify } from 'jose';
import { fail, OWNER_UID } from './domain.mjs';
const keys=createRemoteJWKSet(new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'),{timeoutDuration:10000,cooldownDuration:30000,cacheMaxAge:3600000});
export async function authenticate(request,env,store,keyResolver=keys) {
  const match=/^Bearer ([^\s]+)$/.exec(request.headers.get('Authorization')||'');
  if(!match)fail(401,'unauthenticated','Войдите в LMS.');
  let payload;
  try{({payload}=await jwtVerify(match[1],keyResolver,{algorithms:['RS256'],issuer:`https://securetoken.google.com/${env.FIREBASE_PROJECT_ID}`,audience:env.FIREBASE_PROJECT_ID}));}catch{fail(401,'invalid-token','Сессия недействительна. Войдите заново.');}
  if(typeof payload.sub!=='string'||!payload.sub||payload.sub.length>128||!Number.isFinite(payload.auth_time)||payload.auth_time>Date.now()/1000+30)fail(401,'invalid-token','Сессия недействительна.');
  const doc=await store.get('users/'+payload.sub);
  if(!doc||doc.data.isBanned)fail(403,'account-disabled','Доступ к LMS закрыт.');
  return {uid:payload.sub,profile:doc.data,owner:payload.sub===(env.OWNER_UID||OWNER_UID)};
}
export function cors(request,env) {
  const origin=request.headers.get('Origin'),allowed=(env.ALLOWED_ORIGINS||'').split(',').map(x=>x.trim()).filter(Boolean);
  if(!allowed.length)fail(503,'configuration','Не настроен разрешённый адрес LMS.');
  if(origin&&!allowed.includes(origin))fail(403,'origin-denied','Этот адрес приложения не разрешён.');
  return {'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','Vary':'Origin',...(origin?{'Access-Control-Allow-Origin':origin}:{}),'Access-Control-Allow-Methods':'GET, POST, OPTIONS','Access-Control-Allow-Headers':'Authorization, Content-Type, X-Request-Id','Access-Control-Max-Age':'600'};
}
export async function jsonBody(request,max=128000) {
  if(!(request.headers.get('Content-Type')||'').toLowerCase().startsWith('application/json'))fail(415,'json-required','Ожидается JSON.');
  const reader=request.body?.getReader();if(!reader)fail(400,'empty-body','Пустой запрос.');
  const chunks=[];let size=0;
  while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>max){await reader.cancel();fail(413,'body-too-large','Запрос слишком большой.');}chunks.push(value);}
  const bytes=new Uint8Array(size);let at=0;for(const chunk of chunks){bytes.set(chunk,at);at+=chunk.length;}
  try{const data=JSON.parse(new TextDecoder().decode(bytes));if(!data||Array.isArray(data)||typeof data!=='object')throw Error();return data;}catch{fail(400,'invalid-json','Некорректный JSON.');}
}
export async function rateLimit(store,uid,bucket,limit,now) {
  const path=`lmsLimits/${uid}:${bucket}`;
  await store.atomic(async()=>{const old=await store.get(path),same=old&&now-old.data.start<60000,count=same?old.data.count:0;if(count>=limit)fail(429,'rate-limit','Слишком много запросов. Повторите через минуту.');await store.commit([{path,version:old?.version??null,data:{uid,bucket,start:same?old.data.start:now,count:count+1}}]);});
}
