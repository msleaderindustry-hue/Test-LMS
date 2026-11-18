(function () {
  'use strict';
  const config=window.LMS_SERVER_CONFIG||{},enabled=config.enabled===true,base=String(config.apiBase||'').replace(/\/$/,''),nativeFetch=window.fetch.bind(window);
  let epoch=0,account=window.auth?.currentUser?.uid||null,events=[],flushing=false,retryAt=0,currentSection='platform',session=crypto.randomUUID(),lastInput=Date.now(),lastPulse=Date.now(),lastTyping=0,idle=false,focused=document.hasFocus(),errorShown=false;
  const id=()=>crypto.randomUUID();
  function revive(value){if(Array.isArray(value))return value.map(revive);if(value&&typeof value==='object'){if(value.__timestamp)return {toMillis:()=>Date.parse(value.__timestamp),toDate:()=>new Date(value.__timestamp)};return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,revive(v)]));}return value;}
  async function request(path,body,options={}){
    const user=window.auth?.currentUser,uid=options.uid||user?.uid,mine=epoch;
    if(!enabled)throw Error('Серверное управление пока не включено.');
    if(!uid||user?.uid!==uid)throw Error('Аккаунт изменился. Повторите действие.');
    const token=await user.getIdToken();if(epoch!==mine||window.auth?.currentUser?.uid!==uid)throw Error('Аккаунт изменился.');
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),options.timeout||45000),abort=()=>controller.abort();options.signal?.addEventListener('abort',abort,{once:true});if(options.signal?.aborted)abort();
    try{
      const response=await nativeFetch(base+path,{method:body===undefined?'GET':'POST',headers:{Authorization:'Bearer '+token,...(body===undefined?{}:{'Content-Type':'application/json'})},body:body===undefined?undefined:JSON.stringify(body),credentials:'omit',cache:'no-store',signal:controller.signal});
      const data=await response.json();if(!response.ok){const e=new Error(data.error?.message||'Сервер временно недоступен.');e.code=data.error?.code;e.status=response.status;throw e;}
      if(epoch!==mine||window.auth?.currentUser?.uid!==uid)throw Error('Аккаунт изменился. Ответ скрыт.');return data;
    }finally{clearTimeout(timer);options.signal?.removeEventListener('abort',abort);}
  }
  function showCard(value){window.dispatchEvent(new CustomEvent('lms-ai-card',{detail:value}));}
  async function propose(kind,body){const result=await request('/proposals/'+kind,body);showCard({text:'Проверьте предложение перед подтверждением.',...result});return result;}
  function watchDirectory(next,error){let dead=false,timer;const tick=async()=>{try{const result=await request('/directory');if(!dead)next({docs:result.users.map(u=>({id:u.uid,data:()=>u}))});}catch(e){if(!dead)error?.(e);}finally{if(!dead)timer=setTimeout(tick,60000);}};tick();return()=>{dead=true;clearTimeout(timer);};}
  function watchChat(peer,subscribe,error){let dead=false,stop;request('/chat/open',{uid:peer}).then(()=>{if(!dead)stop=subscribe();}).catch(e=>{if(!dead)error?.(e);});return()=>{dead=true;stop?.();};}
  function emit(kind,section=currentSection,extra={}){
    if(!enabled||!account||account===config.ownerUid)return;
    const event={id:id(),sessionId:session,kind,section,at:Date.now(),...extra};events.push(event);
    window.LmsEventOutbox.put(account,event).then(({dropped})=>{if(dropped)notifySync('Не все события удалось отправить: очередь заполнена.');}).catch(()=>notifySync('Локальное сохранение событий недоступно. Оставьте страницу открытой до синхронизации.'));
    if(events.length>300){events=events.slice(-300);notifySync('Не все события удалось отправить: очередь заполнена.');}
  }
  function clearSync(){errorShown=false;document.getElementById('lms-sync-status')?.remove();}
  function notifySync(message){if(errorShown)return;errorShown=true;const notice=document.createElement('div');notice.id='lms-sync-status';notice.setAttribute('role','status');notice.textContent=message;notice.style.cssText='position:fixed;left:16px;bottom:16px;max-width:min(400px,calc(100vw - 32px));padding:10px 14px;border-radius:10px;background:#334155;color:#fff;font:13px/1.5 system-ui;z-index:200000;pointer-events:none';document.body.appendChild(notice);}
  async function flush(){
    if(!enabled||flushing||!account||account===config.ownerUid||Date.now()<retryAt)return;
    const uid=account,mine=epoch;flushing=true;
    try{
      const persisted=await window.LmsEventOutbox.list(uid).catch(()=>[]);if(mine!==epoch)return;
      events=[...new Map([...persisted,...events].filter(e=>Date.now()-e.at<23*3600000).map(e=>[e.id,e])).values()].sort((a,b)=>a.at-b.at).slice(-300);
      const batch=events.slice(0,30);if(!batch.length)return;
      await request('/events',{events:batch},{uid,timeout:15000});
      const ids=batch.map(e=>e.id);await window.LmsEventOutbox.remove(uid,ids).catch(()=>{});
      if(mine===epoch){const sent=new Set(ids);events=events.filter(e=>!sent.has(e.id));retryAt=0;clearSync();}
    }
    catch(e){if(mine===epoch){retryAt=Date.now()+30000;notifySync('События пока не синхронизированы. Повторим отправку в фоне.');}}
    finally{flushing=false;}
  }
  function navigate(section){if(!enabled)return;const map={home:'menu',main:'menu',test:'tests',ai:'ai_chat'};section=map[section]||section;if(!['typing','tests','hotkeys','word','excel','code','flashcards','chess','chat','ai_chat','stats','admin','assignments','menu','platform'].includes(section))section='platform';if(currentSection!==section){pulse();currentSection=section;emit('navigation');}}
  function pulse(){const now=Date.now(),end=Math.min(now,lastInput+60000);if(!document.hidden&&focused&&!idle&&end>lastPulse)emit('active',currentSection,{at:end,durationMs:Math.min(90000,end-lastPulse)});lastPulse=now;if(now-lastInput>=60000&&!idle){idle=true;emit('idle');}}
  function interaction(event){const now=Date.now();lastInput=now;if(idle){idle=false;lastPulse=now;}if(event.type==='keydown'&&!event.ctrlKey&&!event.metaKey&&event.key?.length===1&&now-lastTyping>=30000){lastTyping=now;emit('typing');}}
  function chatSource(peer,query){return {onSnapshot(...args){return watchChat(peer,()=>query.onSnapshot(...args),typeof args.at(-1)==='function'?args.at(-1):null);}};}
  function bindTrustedFrame(frame){
    if(!enabled||!frame?.contentWindow||!['Word Lab — редактор и практика','TypeDrive — гонка на скорость печати'].includes(frame.title))return;
    const w=frame.contentWindow;if(w.__lmsGatewayBound)return;w.__lmsGatewayBound=true;const original=w.fetch.bind(w);
    w.fetch=(input,init)=>{const url=new URL(typeof input==='string'?input:input.url,location.href);return [new URL(base).hostname,'discordwebhook.msleaderindustry.workers.dev'].includes(url.hostname)?window.fetch(input,init):original(input,init);};
    for(const name of ['keydown','pointerdown','pointermove'])w.addEventListener(name,interaction,{passive:true});
  }
  const key=name=>enabled?'lms:'+String(window.auth?.currentUser?.uid||'guest')+':'+name:name;
  const api={enabled,request,revive,id,key,bindTrustedFrame,showCard,propose,watchDirectory,watchChat,chatSource,emit,navigate,record:(body,options)=>request('/attempts',body,options),isOwner:()=>window.auth?.currentUser?.uid===config.ownerUid};
  window.LmsApi=api;
  if(!enabled)return;
  // Auth headers are attached to exactly the known AI endpoint. Never to code previews.
  window.fetch=async function(input,init={}){
    const url=new URL(typeof input==='string'?input:input.url,location.href);
    if(url.origin===new URL(base).origin&&url.pathname==='/'){
      const data=await request('/',JSON.parse(init.body||'{}'),{signal:init.signal});return new Response(JSON.stringify(data),{status:200,headers:{'Content-Type':'application/json'}});
    }
    if(url.hostname==='discordwebhook.msleaderindustry.workers.dev'){
      // Legacy messages contain arbitrary client text/screenshots. Activity and help now
      // use typed events and a server-side queue; they cannot relay arbitrary messages.
      return new Response(JSON.stringify({success:true,queued:false,legacy:true}),{status:200,headers:{'Content-Type':'application/json'}});
    }
    return nativeFetch(input,init);
  };
  window.auth.onAuthStateChanged(user=>{epoch++;account=user?.uid||null;events=[];retryAt=0;clearSync();session=id();lastInput=lastPulse=Date.now();idle=false;if(account)emit('session');window.dispatchEvent(new CustomEvent('lms-account-changed'));});
  for(const name of ['keydown','pointerdown','pointermove','touchstart'])window.addEventListener(name,interaction,{passive:true});
  document.addEventListener('visibilitychange',()=>{pulse();emit(document.hidden?'hidden':'visible');lastPulse=Date.now();if(document.hidden)flush();});
  window.addEventListener('blur',()=>{pulse();focused=false;emit('blur');});window.addEventListener('focus',()=>{focused=true;lastInput=lastPulse=Date.now();idle=false;emit('focus');});
  setInterval(pulse,30000);setInterval(flush,10000);window.addEventListener('online',()=>{retryAt=0;flush();});
})();
