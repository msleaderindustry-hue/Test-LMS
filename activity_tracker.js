// activity_tracker.js (v3) — трекер активности Firestore + живой ИИ-наблюдатель в Discord.
// Собирает реальные действия ученика пачками, просит ИИ кратко и по-человечески рассказать преподавателю,
// чем занимается ученик, и отправляет красивую Embed-карточку в Discord (с резервной отправкой, если ИИ занят).
(function () {
  'use strict';
  if (window.__lmsActivityTrackerInstalled) return;
  window.__lmsActivityTrackerInstalled = true;

  const OWNER_UID = '1qhlWSbqAxd1dAvo2Nw92gdJhNk1';
  const AI_URL = 'https://gemini-proxy-lms.msleaderindustry.workers.dev';
  const DISCORD_URL =
    window.LMSCore?.config?.discordWorker ||
    'https://discordwebhook.msleaderindustry.workers.dev';

  const SECTIONS = {
    platform: 'Платформа', menu: 'Главная', tests: 'Тестирование', typing: 'Тренажёр печати',
    hotkeys: 'Горячие клавиши', flashcards: 'Карточки', code: 'VS School', excel: 'Excel',
    word: 'Word', chat: 'Чат', ai_chat: 'ИИ-ассистент', stats: 'Статистика',
    admin: 'Администрирование', chess: 'Шахматы', tasks: 'Задания'
  };
  const ALIASES = {
    home: 'menu', timer_setup: 'tests', review: 'tests', test: 'tests', set_menu: 'tests',
    quiz: 'tests', testing: 'tests', test_setup: 'tests', test_result: 'tests',
    results: 'tests', result: 'tests', school: 'code', statistics: 'stats'
  };

  const short = v => String(v ?? '').trim().slice(0, 500);
  const sectionOf = v => { const s = short(v).toLowerCase(); return ALIASES[s] || s || 'platform'; };
  const sectionName = id => SECTIONS[id] || id || 'Платформа';
  const serverTime = () => window.firebase?.firestore?.FieldValue?.serverTimestamp?.() || new Date().toISOString();
  const path = () => `${location.pathname || '/'}${location.search || ''}${location.hash || ''}`;
  const isMobile = () => /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || '');

  function fmtDur(ms) {
    const sec = Math.max(1, Math.round(ms / 1000));
    if (sec < 60) return `${sec} сек`;
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return s ? `${m} мин ${s} сек` : `${m} мин`;
  }

  let uid = null, timer = null, lastKey = '', explicit = false;
  let sessionUid = null;
  const presencePending = new Set();
  let screen = window.__lmsCurrentSection || null;
  if (screen) explicit = true;

  // --- Буфер наблюдения и ИИ-комментатор для Discord ---
  const FLUSH_INTERVAL_MS = 60000;   // сводка от ИИ раз в 60 сек при наличии новых событий
  const IDLE_THRESHOLD_MS = 120000;  // 2 минуты бездействия
  const MIN_SEND_GAP_MS = 20000;     // не чаще 1 раза в 20 сек (защита квоты ИИ и Discord)
  const AWAY_DEBOUNCE_MS = 3000;     // отсекаем случайные <3 сек потери фокуса
  const AI_TIMEOUT_MS = 12000;

  let eventQueue = [];
  let flushTimer = null;
  let idleTimer = null;
  let awayDebounceTimer = null;
  let isIdle = false;
  let idleSince = 0;
  let awaySince = 0;
  let awayReported = false;
  let sectionEnteredAt = Date.now();
  let lastDiscordSentAt = 0;
  let typingReported = false;
  let studentNameCache = '';
  let currentStatus = 'Активен';
  let flushing = false;

  function resolveStudentName() {
    if (studentNameCache) return studentNameCache;
    const u = window.auth?.currentUser;
    return u?.displayName || u?.email?.split('@')[0] || (uid ? uid.slice(0, 8) : 'Ученик');
  }

  async function askAiNarrative(studentName, secTitle, statusText, events) {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);
    const prompt =
      'Ты ИИ-наблюдатель Ultimate LMS. Расскажи преподавателю коротко и живым русским языком (2–3 предложения, без приветствий, без эмодзи, строго по фактам ниже, ничего не выдумывай): ' +
      'куда заходил ученик, чем сейчас занимается, работает стабильно или отвлекается/уходит со вкладки/простаивает.\n' +
      `Ученик: ${studentName}\nТекущий раздел: ${secTitle}\nСтатус: ${statusText}\nСобытия:\n${events.join('\n')}`;
    try {
      const res = await fetch(AI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        signal: controller.signal
      });
      if (!res.ok) return null;
      const data = await res.json();
      const parts = data?.candidates?.[0]?.content?.parts || [];
      const visible = parts.filter(p => typeof p.text === 'string' && !p.thought);
      const use = visible.length ? visible : parts.filter(p => typeof p.text === 'string');
      const txt = use.map(p => p.text).join(' ').replace(/\s+/g, ' ').trim();
      return txt ? txt.slice(0, 950) : null;
    } catch (_) {
      return null;
    } finally {
      clearTimeout(t);
    }
  }

  function queueDiscordEvent(text, opts = {}) {
    if (!uid || uid === OWNER_UID) return;
    const stamp = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const entry = `[${stamp}] ${short(text).slice(0, 150)}`;
    if (eventQueue[eventQueue.length - 1] !== entry) {
      eventQueue.push(entry);
      if (eventQueue.length > 14) eventQueue = eventQueue.slice(-14);
    }
    if (opts.urgent && (Date.now() - lastDiscordSentAt) >= MIN_SEND_GAP_MS) {
      void flushDiscordQueue(opts.level || 'info');
    }
  }

  async function flushDiscordQueue(level = 'info') {
    if (!uid || uid === OWNER_UID || !eventQueue.length || flushing) return;
    if (level !== 'unload' && (Date.now() - lastDiscordSentAt) < MIN_SEND_GAP_MS) return;

    flushing = true;
    const batch = eventQueue.splice(0, eventQueue.length);
    lastDiscordSentAt = Date.now();

    const studentName = resolveStudentName();
    const secTitle = screen ? sectionName(screen.section) : 'Платформа';
    const statusSnapshot = currentStatus;

    // На закрытии вкладки (unload) отправляем мгновенно без ожидания ИИ; в обычном режиме — с живым рассказом ИИ
    const aiStory = level === 'unload'
      ? null
      : await askAiNarrative(studentName, secTitle, statusSnapshot, batch);

    const color = statusSnapshot === 'В другой вкладке' || statusSnapshot === 'Бездействует'
      ? 0xf59e0b
      : (level === 'success' ? 0x16a34a : 0x6a52e5);

    const fields = [
      { name: 'Раздел', value: `**${secTitle}**`, inline: true },
      { name: 'Статус', value: `**${statusSnapshot}**`, inline: true }
    ];
    if (aiStory) {
      fields.push({ name: 'Сводка ИИ', value: aiStory, inline: false });
    }
    fields.push({ name: 'Хронология', value: batch.map(e => `• ${e}`).join('\n').slice(0, 950), inline: false });

    const embed = {
      username: 'Ultimate LMS · ИИ-наблюдатель',
      embeds: [{
        title: `Ученик: ${studentName}`,
        color,
        fields,
        footer: { text: `Ultimate LMS · ${isMobile() ? 'Телефон' : 'Компьютер'}` },
        timestamp: new Date().toISOString()
      }]
    };

    try {
      await fetch(DISCORD_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(embed),
        keepalive: true
      });
    } catch (_) {
      // Тихо пропускаем сетевой сбой, чтобы не тормозить ученика
    } finally {
      flushing = false;
    }
  }

  function resetIdleTimer() {
    if (!uid || uid === OWNER_UID) return;
    if (isIdle) {
      const dur = idleSince ? ` (простой ${fmtDur(Date.now() - idleSince)})` : '';
      isIdle = false;
      idleSince = 0;
      currentStatus = 'Активен';
      queueDiscordEvent(`Возобновил работу${dur}`);
    }
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      if (!uid || uid === OWNER_UID || document.visibilityState === 'hidden' || awaySince) return;
      isIdle = true;
      idleSince = Date.now();
      currentStatus = 'Бездействует';
      const secName = screen ? sectionName(screen.section) : 'LMS';
      queueDiscordEvent(`Бездействует 2 мин в разделе «${secName}»`, { urgent: true, level: 'warn' });
    }, IDLE_THRESHOLD_MS);
  }

  function handleLeaveFocus(reason) {
    if (!uid || uid === OWNER_UID || awaySince) return;
    awaySince = Date.now();
    awayReported = false;
    clearTimeout(awayDebounceTimer);
    awayDebounceTimer = setTimeout(() => {
      if (!awaySince || !uid || uid === OWNER_UID) return;
      awayReported = true;
      currentStatus = 'В другой вкладке';
      const secName = screen ? sectionName(screen.section) : 'LMS';
      queueDiscordEvent(`${reason} (был в «${secName}»)`, { urgent: true, level: 'warn' });
    }, AWAY_DEBOUNCE_MS);
  }

  function handleReturnFocus() {
    clearTimeout(awayDebounceTimer);
    if (!uid || uid === OWNER_UID) return;
    if (awaySince) {
      const awayMs = Date.now() - awaySince;
      const wasReported = awayReported;
      awaySince = 0;
      awayReported = false;
      currentStatus = 'Активен';
      if (wasReported || awayMs >= AWAY_DEBOUNCE_MS) {
        queueDiscordEvent(`Вернулся в LMS (отсутствовал ${fmtDur(awayMs)})`);
      }
    }
    resetIdleTimer();
  }

  async function writeFor(targetUid, type, section, details = {}) {
    if (!targetUid || !window.db) return { ok: false };
    const id = sectionOf(section);
    const payload = {
      at: serverTime(),
      type: short(type || 'activity'),
      section: id,
      sectionLabel: sectionName(id),
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
        queueDiscordEvent(`Завершил: ${payload.label || payload.sectionLabel}`, { urgent: true, level: 'success' });
      }
      return { ok: true };
    } catch (e) {
      window.reportLmsError?.(e, { section: 'activity', source: 'activity_tracker.js', line: 215, operation: 'caught', handled: true });
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
      window.reportLmsError?.(e, { section: 'activity', source: 'activity_tracker.js', line: 234, operation: 'caught', handled: true });
      console.warn('[activity] presence:', e);
    } finally {
      presencePending.delete(targetUid);
    }
  }

  function recordScreen(reason = 'open', prevSection = null, prevMs = 0) {
    if (!uid || !screen) return;
    const targetUid = uid, key = JSON.stringify([targetUid, screen.section, screen.view || '']);
    if (key === lastKey) return;
    lastKey = key;
    const curLabel = sectionName(screen.section);
    const prevNote = prevSection && prevSection !== screen.section && prevMs >= 5000
      ? ` (в «${sectionName(prevSection)}» был ${fmtDur(prevMs)})`
      : '';
    const msg = reason === 'return'
      ? `Вернулся в раздел «${curLabel}»`
      : `Открыл раздел «${curLabel}»${prevNote}`;

    queueDiscordEvent(msg);
    void writeFor(targetUid, 'navigation', screen.section, {
      action: reason,
      label: screen.label || `Открыт раздел «${curLabel}»`,
      view: screen.view,
      duration: prevMs >= 1000 ? Math.round(prevMs / 1000) : null,
      details: { view: screen.view || '', source: explicit ? 'react' : 'url' }
    }).then(result => {
      if (!result.ok && uid === targetUid && lastKey === key) lastKey = '';
    });
  }

  function selectSection(section, options = {}) {
    const value = short(section).toLowerCase();
    if (!value || ['loading', 'login', 'auth'].includes(value)) return;
    explicit = true;
    const prevSec = screen ? screen.section : null;
    const spentMs = sectionEnteredAt ? (Date.now() - sectionEnteredAt) : 0;
    sectionEnteredAt = Date.now();
    screen = { section: sectionOf(value), view: short(options.view || value), label: short(options.label || '') };
    window.__lmsCurrentSection = screen;
    typingReported = false;
    recordScreen('open', prevSec, spentMs);
  }

  function routeSection() {
    const url = new URL(location.href);
    const route = url.searchParams.get('section') || url.searchParams.get('view') || url.hash.replace(/^#\/?/, '').split(/[/?]/)[0] || url.pathname.split('/').filter(Boolean).pop();
    const id = sectionOf(route);
    return Object.prototype.hasOwnProperty.call(SECTIONS, id) ? id : 'platform';
  }

  function trackRoute() {
    if (explicit) return;
    const prevSec = screen ? screen.section : null;
    const spentMs = sectionEnteredAt ? (Date.now() - sectionEnteredAt) : 0;
    sectionEnteredAt = Date.now();
    screen = { section: routeSection(), view: path(), label: '' };
    recordScreen('navigation', prevSec, spentMs);
  }

  window.trackLmsSection = selectSection;
  window.trackLmsActivity = (type, section, details = {}) => writeFor(uid, type, section, details);
  window.addEventListener('lms:section', event => { const d = event.detail || {}; selectSection(d.section, d); });
  window.addEventListener('lms:activity', event => { const d = event.detail || {}; void writeFor(uid, d.type || 'activity', d.section || 'platform', d); });
  window.addEventListener('hashchange', trackRoute);
  window.addEventListener('popstate', trackRoute);

  document.addEventListener('visibilitychange', () => {
    void seen();
    if (document.visibilityState === 'hidden') {
      handleLeaveFocus('Переключился на другую вкладку или свернул браузер');
    } else {
      handleReturnFocus();
      if (explicit) recordScreen('return');
      else trackRoute();
    }
  });
  window.addEventListener('blur', () => {
    if (document.visibilityState === 'visible') {
      handleLeaveFocus('Ушёл в другое окно или программу');
    }
  });
  window.addEventListener('focus', handleReturnFocus);

  window.addEventListener('keydown', () => {
    resetIdleTimer();
    if (!typingReported && uid && uid !== OWNER_UID && screen && ['typing', 'word', 'code', 'excel', 'tests'].includes(screen.section)) {
      typingReported = true;
      queueDiscordEvent(`Активно печатает в разделе «${sectionName(screen.section)}»`);
    }
  }, { passive: true });
  window.addEventListener('pointerdown', resetIdleTimer, { passive: true });
  window.addEventListener('pagehide', () => {
    if (uid && uid !== OWNER_UID) {
      queueDiscordEvent('Закрыл вкладку LMS');
      void flushDiscordQueue('unload');
    }
  });

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
    clearTimeout(awayDebounceTimer); awayDebounceTimer = null;
    if (uid && eventQueue.length) void flushDiscordQueue('unload');

    uid = next; lastKey = ''; isIdle = false; idleSince = 0; awaySince = 0; awayReported = false;
    typingReported = false; studentNameCache = ''; currentStatus = 'Активен'; sectionEnteredAt = Date.now();
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
      queueDiscordEvent('Вошёл в LMS', { urgent: true, level: 'success' });
    }
    screen = null;
    resetIdleTimer();
    timer = setInterval(() => { if (document.visibilityState !== 'hidden') void seen(targetUid); }, 180000);
    flushTimer = setInterval(() => { void flushDiscordQueue('info'); }, FLUSH_INTERVAL_MS);
  }

  window.addEventListener('lms:profile-ready', syncReady);
  auth.onAuthStateChanged(user => {
    if (!user || (sessionUid && sessionUid !== user.uid)) sessionUid = null;
    syncReady();
  });
  syncReady();
})();
