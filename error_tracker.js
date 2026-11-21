// Ultimate LMS: diagnostic events. No message text, payloads, URLs or user names.
(function () {
  'use strict';
  if (window.LmsErrorTracker) return;
  const queue = new Map();
  const counters = new Map();
  let writes = 0, windowStart = Date.now(), inFlight = false, blocked = false;
  let activeUid = null, lastWrite = 0, dropped = 0;
  const sections = ['platform','auth','admin','chat','typing','hotkeys','code','flashcards','excel','ai_chat','tests','chess','activity','sidebar','stats','landing','discord'];
  const codes = ['permission-denied','unauthenticated','unavailable','deadline-exceeded','resource-exhausted','failed-precondition','not-found','already-exists','aborted','cancelled','internal','invalid-argument','data-loss','unknown'];
  const descriptions = {
    'permission-denied':'Firebase отказал в доступе', unauthenticated:'Требуется вход в аккаунт',
    unavailable:'Сервис временно недоступен', 'deadline-exceeded':'Истекло время ожидания',
    'resource-exhausted':'Превышен лимит сервиса', 'failed-precondition':'Не выполнено условие запроса (возможно, нужен индекс)',
    network:'Ошибка соединения', runtime:'Ошибка выполнения JavaScript', caught:'Ошибка обработана модулем',
    resource:'Не удалось загрузить файл', http:'Сервис вернул HTTP-ошибку'
  };
  function fileOf(value) {
    const name = String(value || '').split(/[?#]/)[0].split('/').pop();
    return /^(?:\d{1,2}_[a-z_]+|activity_tracker|error_tracker|error_journal)\.js$/.test(name) ? name : '';
  }
  function classify(error) {
    const rawCode = String(error && error.code || '').split('/').pop();
    if (rawCode === 'cancelled' || rawCode === 'aborted') return 'cancelled';
    if (rawCode === 'cancelled' || rawCode === 'aborted') return 'cancelled';
    if (codes.includes(rawCode)) return rawCode;
    const name = error && error.name;
    if (name === 'AbortError' || rawCode === 'cancelled' || rawCode === 'aborted') return 'cancelled';
    const msg = String(error && error.message || '');
    if (/failed to fetch|network|load failed|offline/i.test(msg)) return 'network';
    if (name === 'ReferenceError' || name === 'TypeError' || name === 'RangeError') return 'runtime';
    return 'caught';
  }
  function report(error, context) {
    try {
      context = context || {};
      const user = window.auth && window.auth.currentUser;
      if (!user || blocked) return;
      const code = classify(error);
      if (code === 'cancelled' || (error && error.name === 'AbortError')) return;
      // Parsing/storage fallback is not a platform incident.
      if (context.handled && error && ['SyntaxError','QuotaExceededError','SecurityError'].includes(error.name)) return;
      let source = fileOf(context.source);
      let stackLine = 0;
      if (!source && error && typeof error.stack === 'string') {
        const match = error.stack.match(/(?:\/|\s)(\d{1,2}_[a-z_]+\.js|activity_tracker\.js):(\d+):\d+/);
        if (match) { source = fileOf(match[1]); stackLine = Number(match[2]); }
      }
      const section = sections.includes(context.section) ? context.section : 'platform';
      const line = Math.max(0, Math.min(1000000, Math.floor(Number(context.line) || stackLine || 0)));
      const operation = /^[\w.-]{1,80}$/.test(context.operation || '') ? context.operation : 'runtime';
      const status = Number(context.status) || 0;
      const kind = context.kind === 'http' ? 'http' : context.kind === 'resource' ? 'resource' : code;
      const key = [user.uid, section, source, line, operation, kind, status].join('|');
      if (queue.has(key)) { queue.get(key).count = Math.min(10000, queue.get(key).count + 1); return; }
      if (queue.size >= 30) { dropped++; return; }
      queue.set(key, {uid:user.uid, section, source, line, operation, code:kind,
        message:descriptions[kind] || 'Техническая ошибка: ' + kind,
        status:Math.max(0, Math.min(599, Math.floor(status))),
        severity:context.handled ? 'warning' : 'error', count:1,
        clientAt:Date.now(), device:matchMedia('(pointer:coarse)').matches ? 'mobile' : 'desktop', version:1});
    } catch (_) { /* diagnostics must never break the app */ }
  }
  async function flush() {
    const now = Date.now();
    if (now - windowStart >= 3600000) { writes=0; windowStart=now; counters.clear(); }
    const user = window.auth && window.auth.currentUser;
    if (inFlight || blocked || !user || !window.db || navigator.onLine === false || writes >= 30 || now-lastWrite < 3000) return;
    const next = Array.from(queue).find(([key,value]) => value.uid === user.uid && now-(counters.get(key)||0)>=60000);
    if (!next) return;
    const [key, value] = next;
    queue.delete(key); inFlight=true; writes++; lastWrite=now; counters.set(key,now);
    try {
      await window.db.collection('platformErrors').add({...value, at:window.firebase.firestore.FieldValue.serverTimestamp()});
    } catch (error) {
      // No recursive logging and no automatic retry storm.
      dropped += value.count;
      if (window.auth?.currentUser?.uid === value.uid && ['permission-denied','unauthenticated'].includes(String(error.code||'').split('/').pop())) blocked=true;
    } finally { inFlight=false; }
  }
  window.reportLmsError = report;
  window.LmsErrorTracker = {report, status:()=>({blocked, pending:queue.size, dropped, writes}),
    retry:()=>{blocked=false; void flush();}};
  window.addEventListener('error', event => {
    if (event.error) report(event.error,{source:event.filename,line:event.lineno,operation:'uncaught'});
    else if (event.target && /^(SCRIPT|LINK)$/.test(event.target.tagName || '')) {
      report(null,{source:event.target.src || event.target.href,kind:'resource',operation:'load'});
    }
  },true);
  window.addEventListener('unhandledrejection', event => report(event.reason,{operation:'unhandled-promise'}));
  // Observe only this platform's two worker services. Never inspect request/response bodies.
  const originalFetch = window.fetch;
  if (originalFetch) window.fetch = async function(input, init) {
    let service = '';
    try {
      const url = new URL(typeof input === 'string' || input instanceof URL ? String(input) : input.url, location.href);
      if (url.hostname === 'gemini-proxy-lms.msleaderindustry.workers.dev') service='ai';
      if (url.hostname === 'discordwebhook.msleaderindustry.workers.dev') service='discord';
    } catch (_) {}
    try {
      const response = await originalFetch.apply(this,arguments);
      if (service && !response.ok) report(null,{section:service==='ai'?'ai_chat':'discord',operation:service+'-request',kind:'http',status:response.status});
      return response;
    } catch(error) { if(service) report(error,{section:service==='ai'?'ai_chat':'discord',operation:service+'-request'}); throw error; }
  };
  function bindAuth() {
    if (!window.auth || !window.auth.onAuthStateChanged) return;
    window.auth.onAuthStateChanged(user=>{
      const next=user && user.uid || null;
      if(activeUid!==next) { for(const [key,value] of queue) if(value.uid!==next) queue.delete(key); blocked=false; activeUid=next; }
    });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',bindAuth,{once:true}); else bindAuth();
  setInterval(()=>void flush(),3000);
})();
