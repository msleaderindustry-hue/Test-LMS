// Preserve existing records; only dated, structurally valid results join a time series.
import {percent} from './metrics.mjs';
const finite=n=>typeof n==='number'&&Number.isFinite(n)&&n>=0;
const list=value=>Array.isArray(value)?value:[];
function time(record){if(finite(record.at))return record.at;if(typeof record.at==='string'&&/^\d{4}-\d\d-\d\dT/.test(record.at))return Date.parse(record.at);if(finite(record.date))return record.date;const id=Number(record.id);return id>946684800000&&id<4102444800000?id:NaN;}
export function legacyAttempts(profile,uid,now){
  const out=[],add=(r,module,extra)=>{const at=time(r);if(!Number.isFinite(at)||at<946684800000||at>now)return;out.push({id:String(r.id||module+':'+at),uid,module,skill:r.topic||module,language:'',mode:'practice',difficulty:'unspecified',at,durationMs:0,hints:0,skipped:0,verified:false,source:'legacy-observation',...extra});};
  for(const r of list(profile.testHistory))if(r&&finite(r.score)&&finite(r.total)&&r.total>0&&r.score<=r.total)add(r,'tests',{correct:r.score,total:r.total,score:percent(r.score,r.total)});
  for(const r of list(profile.hotkeyProgress?.history))if(r&&finite(r.score)&&finite(r.total)&&r.total>0&&r.score<=r.total)add(r,'hotkeys',{correct:r.score,total:r.total,score:percent(r.score,r.total)});
  for(const lang of ['ru','en'])for(const r of list(profile.typingProgress?.weakKeys?.[lang]?.history))if(r&&finite(r.attempts)&&finite(r.errors)&&r.attempts>=r.errors)add(r,'typing',{language:lang,mode:r.source||'practice',correct:r.attempts-r.errors,total:r.attempts,errors:r.errors,characters:r.attempts-r.errors,score:percent(r.attempts-r.errors,r.attempts),cpm:finite(r.wpm)?r.wpm*5:null,keyMetrics:r.metrics});
  return out;
}
export function mergeHistory(ledger,profiles,now){const map=new Map();for(const [uid,profile]of profiles)for(const row of legacyAttempts(profile,uid,now))map.set(uid+':'+row.id,row);for(const row of ledger)map.set(row.uid+':'+row.id,row);return [...map.values()];}
