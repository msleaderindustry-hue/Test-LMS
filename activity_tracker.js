// activity_tracker.js — трекер активности + сгруппированные уведомления наблюдения в Discord.
// Подключите после Firebase Auth + Firestore.
(function () {
  'use strict';
  if (window.__lmsActivityTrackerInstalled) return;
  window.__lmsActivityTrackerInstalled = true;

  const OWNER_UID = '1qhlWSbqAxd1dAvo2Nw92gdJhNk1';
  const DISCORD_URL =
    window.LMSCore?.config?.discordWorker ||
    'https://discordwebhook.msleaderindustry.workers.dev';

  const SECTIONS = {
    platform:'Платформа', menu:'Главная', tests:'Тестирование', typing:'Тренажёр печати',
    hotkeys:'Горячие клавиши', flashcards:'Карточки', code:'VS School', excel:'Excel',
    word:'Word', chat:'Чат', ai_chat:'ИИ-ассистент', stats:'Статистика',
    admin:'Администрирование', chess:'Шахматы', tasks:'Задания'
  };
  const ALIASES = {
    home:'menu', timer_setup:'tests', review:'tests', test:'tests', set_menu:'tests',
    quiz:'tests', testing:'tests', test_setup:'tests', test_result:'tests',
    results:'tests', result:'tests', school:'code', statistics:'stats'
  };

  const short = v => String(v ?? '').trim().slice(0, 500);
  const sectionOf = v => { const s = short(v).toLowerCase(); return ALIASES[s] || s || 'platform'; };
  const serverTime = () => window.firebase?.firestore?.FieldValue?.serverTimestamp?.() || new Date().toISOString();
  const path = () => `${location.pathname || '/'}${location.search || ''}${location.hash || ''}`;

  let uid = null, timer = null, lastKey = '', explicit = false;
  let sessionUid = null;
  const presencePending = new Set();
  let screen = window.__lmsCurrentSection || null;
  if (screen) explicit = true;

  // --- Буфер наблюдения для Discord (группировка, защита от спама и тормозов) ---
  const FLUSH_INTERVAL_MS = 60000;   // раз в минуту
  const IDLE_THRESHOLD_MS = 180000;  // 3 минуты бездействия
  const MIN_SEND_GAP_MS = 15000;     // не чаще 1 раза в 15 сек даже для срочных событий
  let eventQueue = [];
  let flushTimer = null;
  let idleTimer = null;
  let isIdle = false;
  let lastDiscordSentAt = 0;
  let typingReported = false;
  let studentNameCache = '';

  function resolveStudentName() {
    if (studentNameCache) return studentNameCache;
    const u = window.auth?.currentUser;
    return u?.displayName || u?.email?.split('@')[0] || (uid ? uid.slice(0, 8) : 'Ученик');
  }

  function queueDiscordEvent(text, urgent = false) {
    if (!uid || uid === OWNER_UID) return; // не спамим действиями самого админа
    const stamp = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    const entry = `• [${stamp}] ${short(text).slice(0, 140)}`;
    if (eventQueue[eventQueue.length - 1] !== entry) {
      eventQueue.push(entry);
      if (eventQueue.length > 15) eventQueue = eventQueue.slice(-15);
    }
    if (urgent && (Date.now() - lastDiscordSentAt) >= MIN_SEND_GAP_MS) {
      void flushDiscordQueue();
    }
  }

  async function flushDiscordQueue() {
    if (!uid || uid === OWNER_UID || !eventQueue.length) return;
    if ((Date.now() - lastDiscordSentAt) < MIN_SEND_GAP_MS) return;
    const batch = eventQueue.splice(0, eventQueue.length);
    lastDiscordSentAt = Date.now();
    const header = `👀 **${resolveStudentName()}**`;
    const body = `${header}\n${batch.join('\n')}`.slice(0, 1850);
    try {
      await fetch(DISCORD_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: body }),
        keepalive: true
      });
    } catch (e) {
      // Тихо игнорируем сетевой сбой наблюдения, чтобы не мешать ученику
    }
  }

  function resetIdleTimer() {
    if (!uid || uid === OWNER_UID) return;
    if (isIdle) {
      isIdle = false;
      queueDiscordEvent('Вернулся к работе после простоя');
    }
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      if (!uid || uid === OWNER_UID || document.visibilityState === 'hidden') return;
      isIdle = true;
      const secName = screen ? (SECTIONS[screen.section] || screen.section) : 'LMS';
      queueDiscordEvent(`Бездействует более 3 мин (раздел: ${secName})`, true);
    }, IDLE_THRESHOLD_MS);
  }

  async function writeFor(targetUid, type, section, details = {}) {
    if (!targetUid || !window.db) return { ok: false };
    const id = sectionOf(section);
    const payload = {
      at: serverTime(),
      type: short(type || 'activity'),
      section: id,
      sectionLabel: SECTIONS[id] || id,
      action: short(details.action || ''),
      label: short(details.label || ''),
      path: short(details.path || path()),
      view: short(details.view || ''),
      details: details.details == null ? '' : details.details,
      duration: details.duration != null && Number.isFinite(Number(details.duration)) ? Number(details.duration) : null,
      device: short(navigator.userAgent || '')
    };
    try {
      await window.db.collection('users').doc(targetUid).collection('activity').add(payload);
      if (type === 'task_complete' || type === 'test_complete' || details.action === 'finish' || details.action === 'complete') {
        queueDiscordEvent(`Завершил: ${payload.label || payload.sectionLabel}`, true);
      }
      return { ok: true };
    } catch (e) {
      window.reportLmsError?.(e, { section: 'activity', source: 'activity_tracker.js', line: 105, operation: 'caught', handled: true });
      console.warn('[activity] event:', e);
      return { ok: false };
    }
  }

  async function seen(targetUid = uid, visit = false) {
    if (!targetUid || targetUid !== uid || !window.db || presencePending.has(targetUid)) return;
    presencePending.add(targetUid);
    try {
      const patch = { lastSeenAt: serverTime() };
      if (visit) {
        Object.assign(patch, {
          lastVisitAt: serverTime(),
          lastLoginAt: serverTime(),
          loginCount: window.firebase.firestore.FieldValue.increment(1)
        });
      }
      await window.db.collection('users').doc(targetUid).update(patch);
    } catch (e) {
      window.reportLmsError?.(e, { section: 'activity', source: 'activity_tracker.js', line: 124, operation: 'caught', handled: true });
      console.warn('[activity] presence:', e);
    } finally {
      presencePending.delete(targetUid);
    }
  }

  function recordScreen(reason = 'open') {
    if (!uid || !screen) return;
    const targetUid = uid, key = JSON.stringify([targetUid, screen.section, screen.view || '']);
    if (key === lastKey) return;
    lastKey = key;
    const secLabel = screen.label || `Открыт раздел «${SECTIONS[screen.section] || screen.section}»`;
    queueDiscordEvent(reason === 'return' ? `Вернулся в «${SECTIONS[screen.section] || screen.section}»` : secLabel);
    void writeFor(targetUid, 'navigation', screen.section, {
      action: reason,
      label: secLabel,
      view: screen.view,
      details: { view: screen.view || '', source: explicit ? 'react' : 'url' }
    }).then(result => {
      if (!result.ok && uid === targetUid && lastKey === key) lastKey = '';
    });
  }

  function selectSection(section, options = {}) {
    const value = short(section).toLowerCase();
    if (!value || ['loading', 'login', 'auth'].includes(value)) return;
    explicit = true;
    screen = { section: sectionOf(value), view: short(options.view || value), label: short(options.label || '') };
    window.__lmsCurrentSection = screen;
    typingReported = false;
    recordScreen('open');
  }

  function routeSection() {
    const url = new URL(location.href);
    const route = url.searchParams.get('section') || url.searchParams.get('view') || url.hash.replace(/^#\/?/, '').split(/[/?]/)[0] || url.pathname.split('/').filter(Boolean).pop();
    const id = sectionOf(route);
    return Object.prototype.hasOwnProperty.call(SECTIONS, id) ? id : 'platform';
  }

  function trackRoute() {
    if (explicit) return;
    screen = { section: routeSection(), view: path(), label: '' };
    recordScreen('navigation');
  }

  window.trackLmsSection = selectSection;
  window.trackLmsActivity = (type, section, details = {}) => writeFor(uid, type, section, details);
  window.addEventListener('lms:section', event => { const d = event.detail || {}; selectSection(d.section, d); });
  window.addEventListener('lms:activity', event => { const d = event.detail || {}; void writeFor(uid, d.type || 'activity', d.section || 'platform', d); });
  window.addEventListener('hashchange', trackRoute);
  window.addEventListener('popstate', trackRoute);

  // Отслеживание переключения вкладок / сворачивания окна
  document.addEventListener('visibilitychange', () => {
    void seen();
    if (document.visibilityState === 'hidden') {
      queueDiscordEvent('Переключился на другую вкладку или свернул окно');
      void flushDiscordQueue();
    } else {
      resetIdleTimer();
      if (explicit) recordScreen('return');
      else trackRoute();
    }
  });

  // Лёгкий сигнал «печатает» (максимум 1 раз за пребывание в разделе, без чтения текста!)
  window.addEventListener('keydown', () => {
    resetIdleTimer();
    if (!typingReported && uid && uid !== OWNER_UID && screen && ['typing', 'word', 'code', 'excel', 'tests'].includes(screen.section)) {
      typingReported = true;
      queueDiscordEvent(`Активно печатает в разделе «${SECTIONS[screen.section] || screen.section}»`);
    }
  }, { passive: true });
  window.addEventListener('pointerdown', resetIdleTimer, { passive: true });
  window.addEventListener('pagehide', () => { void flushDiscordQueue(); });

  const auth = window.auth;
  if (!auth?.onAuthStateChanged) {
    console.warn('[activity] Подключите трекер после Firebase Auth.');
    return;
  }

  function syncReady() {
    const current = auth.currentUser?.uid || null;
    const next = current && window.__lmsProfileReady?.uid === current ? current : null;
    if (next === uid) return;
    clearInterval(timer); timer = null;
    clearInterval(flushTimer); flushTimer = null;
    clearTimeout(idleTimer); idleTimer = null;
    if (uid && eventQueue.length) void flushDiscordQueue();

    uid = next; lastKey = ''; isIdle = false; typingReported = false; studentNameCache = '';
    if (!uid || !window.db) return;
    const targetUid = uid;
    const first = sessionUid !== uid;
    sessionUid = uid;

    window.db.collection('users').doc(targetUid).get().then(s => {
      if (s.exists) {
        const d = s.data() || {};
        studentNameCache = d.nickname || d.displayName || d.email || '';
      }
    }).catch(() => {});

    void seen(targetUid, first);
    if (first) {
      void writeFor(targetUid, 'session', 'platform', { action: 'start', label: 'Запуск платформы' });
      queueDiscordEvent('Вошёл в LMS', true);
    }
    screen = null;
    resetIdleTimer();
    timer = setInterval(() => { if (document.visibilityState !== 'hidden') void seen(targetUid); }, 180000);
    flushTimer = setInterval(() => { void flushDiscordQueue(); }, FLUSH_INTERVAL_MS);
  }

  window.addEventListener('lms:profile-ready', syncReady);
  auth.onAuthStateChanged(user => {
    if (!user || (sessionUid && sessionUid !== user.uid)) sessionUid = null;
    syncReady();
  });
  syncReady();
})();