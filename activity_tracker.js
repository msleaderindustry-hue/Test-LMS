// activity_tracker.js — полная замена. Подключите после Firebase Auth + Firestore.
// Для React-экранов обязательна вставка из App_activity_integration.txt.
(function () {
  'use strict';
  if (window.__lmsActivityTrackerInstalled) return;
  window.__lmsActivityTrackerInstalled = true;
  const SECTIONS = {platform:'Платформа',menu:'Главная',tests:'Тестирование',typing:'Тренажёр печати',hotkeys:'Горячие клавиши',flashcards:'Карточки',code:'VS School',excel:'Excel',chat:'Чат',ai_chat:'ИИ-ассистент',stats:'Статистика',admin:'Администрирование'};
  const ALIASES = {home:'menu',timer_setup:'tests',review:'tests',test:'tests',set_menu:'tests',quiz:'tests',testing:'tests',test_setup:'tests',test_result:'tests',results:'tests',result:'tests',school:'code',statistics:'stats'};
  const short = v => String(v ?? '').trim().slice(0,500);
  const sectionOf = v => {const s=short(v).toLowerCase();return ALIASES[s] || s || 'platform';};
  const serverTime = () => window.firebase?.firestore?.FieldValue?.serverTimestamp?.() || new Date().toISOString();
  const path = () => `${location.pathname || '/'}${location.search || ''}${location.hash || ''}`;
  let uid=null, timer=null, lastKey='', explicit=false;
  let screen=window.__lmsCurrentSection || null;
  if(screen) explicit=true;

  async function writeFor(targetUid,type,section,details={}) {
    if(!targetUid || !window.db)return {ok:false};
    const id=sectionOf(section);
    const payload={at:serverTime(),type:short(type || 'activity'),section:id,
      sectionLabel:SECTIONS[id] || id,action:short(details.action || ''),
      label:short(details.label || ''),path:short(details.path || path()),
      view:short(details.view || ''),details:details.details == null ? '' : details.details,
      duration:details.duration != null && Number.isFinite(Number(details.duration)) ? Number(details.duration) : null,
      device:short(navigator.userAgent || '')};
    try {await window.db.collection('users').doc(targetUid).collection('activity').add(payload);return {ok:true};}
    catch(e){console.warn('[activity] event:',e);return {ok:false};}
  }
  async function seen(targetUid=uid,visit=false) {
    if(!targetUid || !window.db)return;
    try {await window.db.collection('users').doc(targetUid).set({lastSeenAt:serverTime(),...(visit ? {lastVisitAt:serverTime()} : {})},{merge:true});}
    catch(e){console.warn('[activity] presence:',e);}
  }
  function recordScreen(reason='open') {
    if(!uid || !screen)return;
    const targetUid=uid, key=JSON.stringify([targetUid,screen.section,screen.view || '']);
    if(key===lastKey)return;
    lastKey=key;
    void writeFor(targetUid,'navigation',screen.section,{action:reason,
      label:screen.label || `Открыт раздел «${SECTIONS[screen.section] || screen.section}»`,
      view:screen.view,details:{view:screen.view || '',source:explicit?'react':'url'}})
      .then(result=>{if(!result.ok && uid===targetUid && lastKey===key)lastKey='';});
  }
  function selectSection(section,options={}) {
    const value=short(section).toLowerCase();
    if(!value || ['loading','login','auth'].includes(value))return;
    explicit=true;
    screen={section:sectionOf(value),view:short(options.view || value),label:short(options.label || '')};
    window.__lmsCurrentSection=screen;
    recordScreen('open');
  }
  // Only exact route tokens; /Test-LMS/ is NOT a test screen.
  function routeSection() {
    const url=new URL(location.href);
    const route=url.searchParams.get('section') || url.searchParams.get('view') || url.hash.replace(/^#\/?/,'').split(/[/?]/)[0] || url.pathname.split('/').filter(Boolean).pop();
    const id=sectionOf(route);
    return Object.prototype.hasOwnProperty.call(SECTIONS,id)?id:'platform';
  }
  function trackRoute() {
    if(explicit)return;
    screen={section:routeSection(),view:path(),label:''};
    recordScreen('navigation');
  }
  window.trackLmsSection=selectSection;
  window.trackLmsActivity=(type,section,details={})=>writeFor(uid,type,section,details);
  window.addEventListener('lms:section',event=>{const d=event.detail || {};selectSection(d.section,d);});
  window.addEventListener('lms:activity',event=>{const d=event.detail || {};void writeFor(uid,d.type || 'activity',d.section || 'platform',d);});
  window.addEventListener('hashchange',trackRoute);
  window.addEventListener('popstate',trackRoute);
  document.addEventListener('visibilitychange',()=>{void seen();if(document.visibilityState==='visible') {if(explicit)recordScreen('return');else trackRoute();}});
  const auth=window.auth;
  if(!auth?.onAuthStateChanged){console.warn('[activity] Подключите трекер после Firebase Auth.');return;}
  auth.onAuthStateChanged(user=>{
    const next=user?.uid || null;
    if(next===uid)return;
    clearInterval(timer);timer=null;uid=next;lastKey='';
    if(!uid || !window.db)return;
    const targetUid=uid;
    void seen(targetUid,true);
    void writeFor(targetUid,'session','platform',{action:'start',label:'Запуск платформы'});
    if(explicit)recordScreen('open');else trackRoute();
    timer=setInterval(()=>{if(document.visibilityState!=='hidden')void seen(targetUid);},180000);
  });
})();
