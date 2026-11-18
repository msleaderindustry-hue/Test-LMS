import { SignJWT, importPKCS8 } from 'jose';
import { HttpError, fail } from './domain.mjs';
const tokenCache = new Map();
export const timestamp = value => ({ __timestamp: new Date(value).toISOString() });
export const millis = value => typeof value === 'number' ? value : value?.__timestamp ? Date.parse(value.__timestamp) : typeof value === 'string' ? Date.parse(value) : null;
export function encode(value) {
  if (value === null) return {nullValue:null};
  if (typeof value === 'boolean') return {booleanValue:value};
  if (typeof value === 'string') return {stringValue:value};
  if (typeof value === 'number' && Number.isFinite(value)) return Number.isSafeInteger(value)?{integerValue:String(value)}:{doubleValue:value};
  if (Array.isArray(value)) return {arrayValue:{values:value.map(encode)}};
  if (value && typeof value === 'object') {
    if (Object.keys(value).length===1 && value.__timestamp) return {timestampValue:value.__timestamp};
    if (Object.keys(value).length===1 && value.__reference) return {referenceValue:value.__reference};
    if (Object.keys(value).length===1 && value.__bytes) return {bytesValue:value.__bytes};
    if (Object.keys(value).length===1 && value.__geoPoint) return {geoPointValue:value.__geoPoint};
    return {mapValue:{fields:Object.fromEntries(Object.entries(value).filter(([,v])=>v!==undefined).map(([k,v])=>[k,encode(v)]))}};
  }
  fail(400,'unsupported-value','Неподдерживаемый тип данных.');
}
export function decode(value) {
  if ('nullValue' in value) return null;
  for(const key of ['booleanValue','stringValue']) if(key in value)return value[key];
  if('integerValue' in value)return Number(value.integerValue);
  if('doubleValue' in value)return value.doubleValue;
  if('timestampValue' in value)return {__timestamp:value.timestampValue};
  if('referenceValue' in value)return {__reference:value.referenceValue};
  if('bytesValue' in value)return {__bytes:value.bytesValue};
  if('geoPointValue' in value)return {__geoPoint:value.geoPointValue};
  if('arrayValue' in value)return (value.arrayValue.values||[]).map(decode);
  if('mapValue' in value)return Object.fromEntries(Object.entries(value.mapValue.fields||{}).map(([k,v])=>[k,decode(v)]));
  fail(502,'unknown-value','Неизвестный формат поля базы данных.');
}
const validPath = path => typeof path==='string' && /^(?:[A-Za-z0-9_.:-]+\/)*[A-Za-z0-9_.:-]+$/.test(path) && !path.split('/').some(x=>x==='.'||x==='..');
export class FirestoreStore {
  constructor(env, transport=fetch) {
    if(!/^[a-z][a-z0-9-]{4,61}[a-z0-9]$/.test(env.FIREBASE_PROJECT_ID||''))fail(503,'configuration','Сервер базы данных не настроен.');
    this.env=env;this.fetch=transport;this.root=`projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents`;
    this.base='https://firestore.googleapis.com/v1/'+this.root;
  }
  async token() {
    let account;try{account=JSON.parse(this.env.FIREBASE_SERVICE_ACCOUNT)}catch{fail(503,'configuration','Не настроен серверный доступ к базе.');}
    if(account.project_id!==this.env.FIREBASE_PROJECT_ID || !account.client_email || !account.private_key)fail(503,'configuration','Неверная конфигурация серверного доступа.');
    const old=tokenCache.get(account.client_email),now=Date.now();
    if(old&&old.until>now+60000)return old.token;
    const key=await importPKCS8(account.private_key,'RS256');
    const assertion=await new SignJWT({scope:'https://www.googleapis.com/auth/datastore'}).setProtectedHeader({alg:'RS256'}).setIssuer(account.client_email).setAudience('https://oauth2.googleapis.com/token').setIssuedAt().setExpirationTime('55m').sign(key);
    const r=await this.fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({grant_type:'urn:ietf:params:oauth:grant-type:jwt-bearer',assertion}),signal:AbortSignal.timeout(15000)});
    if(!r.ok)fail(503,'database-auth','Сервер не смог подключиться к базе.');
    const data=await r.json();if(!data.access_token)fail(503,'database-auth','Сервер не смог подключиться к базе.');
    tokenCache.set(account.client_email,{token:data.access_token,until:now+Math.min(Number(data.expires_in)||300,3600)*1000});return data.access_token;
  }
  async request(suffix,init={}) {
    const r=await this.fetch(this.base+suffix,{...init,headers:{Authorization:'Bearer '+await this.token(),'Content-Type':'application/json'},signal:AbortSignal.timeout(20000)});
    if(r.status===404&&!init.method)return null;
    const data=await r.json();
    if(!r.ok){if(r.status===409||data.error?.status==='FAILED_PRECONDITION')throw new HttpError(409,'conflict','Данные изменились. Повторите проверку.');fail(503,'database-unavailable','База временно недоступна.');}
    return data;
  }
  document(raw) {return raw?{path:raw.name.slice(this.root.length+1),data:decode({mapValue:{fields:raw.fields||{}}}),version:raw.updateTime}:null;}
  async get(path) {if(!validPath(path)||path.split('/').length%2)fail(400,'invalid-path','Некорректный путь документа.');return this.document(await this.request('/'+path));}
  async getMany(paths){
    if(paths.length>400||paths.some(path=>!validPath(path)||path.split('/').length%2))fail(400,'invalid-path','Некорректный список документов.');
    if(!paths.length)return [];
    const result=await this.request(':batchGet',{method:'POST',body:JSON.stringify({documents:[...new Set(paths)].map(path=>this.root+'/'+path)})});
    const found=new Map(result.filter(r=>r.found).map(r=>{const doc=this.document(r.found);return [doc.path,doc];}));
    return paths.map(path=>found.get(path)||null);
  }
  async list(collection,{limit=1000}={}) {
    if(!validPath(collection)||collection.split('/').length%2!==1)fail(400,'invalid-path','Некорректный путь коллекции.');
    const rows=[];let page='';
    do {const result=await this.request('/'+collection+'?pageSize='+Math.min(200,limit+1-rows.length)+(page?'&pageToken='+encodeURIComponent(page):''));rows.push(...(result?.documents||[]).map(x=>this.document(x)));page=result?.nextPageToken||'';if(rows.length>limit)fail(413,'scan-limit','Объём превышает лимит одной операции. Выберите меньший период или группу.');}while(page);
    return rows;
  }
  async query(collection,filters=[],limit=1000) {
    if(!validPath(collection)||collection.split('/').length%2!==1)fail(400,'invalid-path','Некорректный путь коллекции.');
    const segments=collection.split('/'),id=segments.pop(),parent=segments.length?'/'+segments.join('/'):'';
    const fieldFilters=filters.map(([field,op,value])=>({fieldFilter:{field:{fieldPath:field},op,value:encode(value)}}));
    const q={from:[{collectionId:id}],limit:limit+1};if(fieldFilters.length)q.where=fieldFilters.length===1?fieldFilters[0]:{compositeFilter:{op:'AND',filters:fieldFilters}};
    const result=await this.request(parent+':runQuery',{method:'POST',body:JSON.stringify({structuredQuery:q})});
    const rows=(result||[]).filter(x=>x.document).map(x=>this.document(x.document));if(rows.length>limit)fail(413,'scan-limit','Слишком много данных для одного отчёта.');return rows;
  }
  async commit(writes) {
    if(!writes.length)return;
    if(writes.length>400)fail(413,'write-limit','Слишком много записей в одной операции.');
    const request=writes.map(w=>{
      if(!validPath(w.path)||w.path.split('/').length%2)fail(400,'invalid-path','Недопустимый путь записи.');
      const name=this.root+'/'+w.path,result=w.delete?{delete:name}:{update:{name,fields:encode(w.data).mapValue.fields}};
      if(w.version===null)result.currentDocument={exists:false};else if(typeof w.version==='string')result.currentDocument={updateTime:w.version};else fail(500,'missing-precondition','Для записи обязательна проверка версии.');
      if(w.fields)result.updateMask={fieldPaths:w.fields};return result;
    });
    await this.request(':commit',{method:'POST',body:JSON.stringify({writes:request})});
  }
  async atomic(fn) {for(let i=0;i<4;i++){try{return await fn(this)}catch(e){if(e.code!=='conflict'||i===3)throw e;}}}
}
