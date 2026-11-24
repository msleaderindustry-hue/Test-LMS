// 21_ai_mentor.js (v14) — Премиальный встроенный раздел «ИИ-менеджер» (без эмодзи, SVG-иконки, анимации, новые графики, подсказки, полная уборка + удаление бэкапов).
(function () {
  'use strict';
  if (window.LMSMentor && window.LMSMentor.version >= 14) return;

  const OWNER_UID = '1qhlWSbqAxd1dAvo2Nw92gdJhNk1';
  const AI_URL = 'https://gemini-proxy-lms.msleaderindustry.workers.dev';
  const DISCORD_URL = 'https://discordwebhook.msleaderindustry.workers.dev';
  const CACHE_TTL_MS = 120000;

  const DEFAULT_PRO_CRITERIA = {
    confirmed: false,
    typingCpm: 250,
    typingAccuracy: 98,
    testsScore: 90,
    hotkeysAccuracy: 95,
    excelTasks: 25,
    wordLessons: 10,
    stabilityDays: 7
  };

  let proCriteria = Object.assign({}, DEFAULT_PRO_CRITERIA);
  const cache = { group: null, groupAt: 0, students: new Map() };

  // Чистые линейные SVG-иконки (ноль эмодзи в интерфейсе)
  function svgIcon(name, size = 16) {
    const p = {
      sparkle: '<path d="M12 3l2 5.4L19.4 10.4 14 12.4 12 17.8l-2-5.4-5.4-2 5.4-2L12 3z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>',
      users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="1.8"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
      chart: '<path d="M4 19h16M7 16v-5M12 16V7M17 16v-8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
      clipboard: '<rect x="5" y="4" width="14" height="17" rx="2.5" stroke="currentColor" stroke-width="1.8"/><path d="M9 4.5h6M9 10h6M9 14h4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
      trash: '<path d="M4 7h16M9 7V4.8c0-.44.36-.8.8-.8h4.4c.44 0 .8.36.8.8V7m2 0v12.2c0 1-.8 1.8-1.8 1.8H8.8c-1 0-1.8-.8-1.8-1.8V7h10z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>',
      refresh: '<path d="M4 12a8 8 0 0 1 13.7-5.6M20 12a8 8 0 0 1-13.7 5.6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M16.8 3.6v3.6h-3.6M7.2 20.4v-3.6h3.6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
      send: '<path d="M21 3L10 14M21 3l-6.5 18-3.5-7.5L3.5 10 21 3z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>',
      check: '<path d="M5 12.5l4.2 4.2L19 7" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/>',
      x: '<path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"/>',
      plus: '<path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"/>',
      shield: '<path d="M12 3l7 3v5c0 4.5-3 8.2-7 10-4-1.8-7-5.5-7-10V6l7-3z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>',
      alert: '<path d="M12 9v4m0 4h.01M10.3 3.9L2 18a1.5 1.5 0 0 0 1.3 2.2h17.4A1.5 1.5 0 0 0 22 18L13.7 3.9a1.5 1.5 0 0 0-3.4 0z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>',
      message: '<path d="M4 6a2.5 2.5 0 0 1 2.5-2.5h11A2.5 2.5 0 0 1 20 6v8a2.5 2.5 0 0 1-2.5 2.5H9l-4.5 3.5v-3.5H6.5A2.5 2.5 0 0 1 4 14V6z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>',
      activity: '<path d="M3 12h4l2.5-7 5 14 2.5-7H21" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>',
      chess: '<path d="M8 20h8M9 17h6l-1-6h2l-1-4h-6l-1 4h2l-1 6zM12 3v2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
      keyboard: '<rect x="3" y="5" width="18" height="14" rx="2.5" stroke="currentColor" stroke-width="1.8"/><path d="M7 9h1m3 0h1m3 0h2M7 13h2m3 0h5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
      archive: '<rect x="3" y="4" width="18" height="4.5" rx="1.2" stroke="currentColor" stroke-width="1.8"/><path d="M5 8.5V19a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 19 19V8.5M10 13h4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
      rotateCcw: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8m0-5v5h5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>'
    };
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" aria-hidden="true">' + (p[name] || p.sparkle) + '</svg>';
  }

  function isOwner() {
    return !!(window.auth && window.auth.currentUser && window.auth.currentUser.uid === OWNER_UID);
  }
  function requireOwner(actionName) {
    if (!isOwner()) throw new Error('Доступ запрещён: операция «' + actionName + '» доступна только администратору.');
    if (!window.db) throw new Error('Firestore не инициализирован.');
  }
  function serverTime() {
    return window.firebase?.firestore?.FieldValue?.serverTimestamp?.() || new Date().toISOString();
  }
  function toMillis(v) {
    if (!v) return 0;
    if (typeof v === 'number') return v;
    if (typeof v.toMillis === 'function') return v.toMillis();
    if (v.seconds) return v.seconds * 1000;
    const t = Date.parse(v);
    return Number.isFinite(t) ? t : 0;
  }
  function round1(n) { return Number.isFinite(n) ? Math.round(n * 10) / 10 : 0; }
  function avg(arr) { const nums = arr.filter(Number.isFinite); return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0; }
  function median(arr) {
    const nums = arr.filter(Number.isFinite).sort((a, b) => a - b);
    if (!nums.length) return 0;
    const mid = Math.floor(nums.length / 2);
    return nums.length % 2 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
  }
  function escHtml(s) {
    return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function formatRichText(raw) {
    const safe = escHtml(raw || '');
    return safe
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/^[-•]\s+(.+)$/gm, '<div class="lmm-li"><span class="lmm-bullet"></span><span>$1</span></div>')
      .replace(/\n/g, '<br>');
  }
  function initialsOf(name) {
    const parts = String(name || '?').trim().split(/\s+/).filter(Boolean);
    return ((parts[0]?.[0] || '') + (parts[1]?.[0] || parts[0]?.[1] || '')).toUpperCase() || '?';
  }
  function isLightTheme() {
    const r = document.documentElement, b = document.body;
    return r.classList.contains('light') || b?.classList.contains('light') || b?.classList.contains('theme-light') || r.getAttribute('data-theme') === 'light';
  }

  function reviveFirestoreTypes(val) {
    if (Array.isArray(val)) return val.map(reviveFirestoreTypes);
    if (val && typeof val === 'object') {
      const keys = Object.keys(val);
      if (keys.length === 2 && typeof val.seconds === 'number' && typeof val.nanoseconds === 'number' && window.firebase?.firestore?.Timestamp) {
        return new window.firebase.firestore.Timestamp(val.seconds, val.nanoseconds);
      }
      const out = {};
      for (const k of keys) out[k] = reviveFirestoreTypes(val[k]);
      return out;
    }
    return val;
  }

  function extractAiText(data) {
    const parts = data?.candidates?.[0]?.content?.parts || [];
    const visible = parts.filter(p => typeof p.text === 'string' && !p.thought);
    const use = visible.length ? visible : parts.filter(p => typeof p.text === 'string');
    return use.map(p => p.text).join('\n').trim();
  }

  async function callAi(prompt, timeoutMs = 42000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(AI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        signal: controller.signal
      });
      if (!res.ok) throw new Error('Ошибка прокси ИИ (код ' + res.status + ')');
      const data = await res.json();
      if (data.error) throw new Error(data.error.message || 'Ошибка ответа ИИ');
      const text = extractAiText(data);
      if (!text) throw new Error('Пустой ответ от ИИ');
      return text;
    } finally {
      clearTimeout(timer);
    }
  }

  async function sendDiscord(payload) {
    const body = typeof payload === 'string' ? { content: payload.slice(0, 1900) } : payload;
    const res = await fetch(DISCORD_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    return res.ok;
  }

  // 1. Единая запись учебных попыток
  async function recordAttempt(attempt) {
    const uid = window.auth?.currentUser?.uid;
    if (!uid || !window.db) return { ok: false, reason: 'no-auth' };
    const a = attempt || {};
    const cpm = Number.isFinite(Number(a.cpm)) ? Number(a.cpm) : (Number.isFinite(Number(a.wpm)) ? Math.round(Number(a.wpm) * 5) : null);
    const doc = {
      module: String(a.module || 'general').slice(0, 40),
      topic: String(a.topic || '').slice(0, 120),
      score: Number.isFinite(Number(a.score)) ? round1(Number(a.score)) : null,
      accuracy: Number.isFinite(Number(a.accuracy)) ? round1(Number(a.accuracy)) : null,
      cpm,
      errors: Number.isFinite(Number(a.errors)) ? Number(a.errors) : 0,
      weakKeys: Array.isArray(a.weakKeys) ? a.weakKeys.slice(0, 12).map(String) : [],
      durationSec: Number.isFinite(Number(a.durationSec)) ? Math.max(0, Math.round(Number(a.durationSec))) : 0,
      passed: Boolean(a.passed),
      at: serverTime(),
      clientAt: Date.now(),
      version: 1
    };
    try {
      await window.db.collection('users').doc(uid).collection('attempts').add(doc);
      cache.students.delete(uid);
      cache.group = null;
      return { ok: true };
    } catch (e) {
      window.reportLmsError?.(e, { section: 'ai_chat', source: '21_ai_mentor.js', operation: 'recordAttempt', handled: true });
      return { ok: false, error: e.message };
    }
  }

  // 2. Точные расчёты успеваемости кодом
  function computeStudentMetrics(uid, profile, extras) {
    const u = profile || {};
    const name = u.nickname || u.displayName || u.email || uid;

    const rawTests = Array.isArray(u.testHistory) ? u.testHistory : [];
    const testScores = rawTests.map(t => {
      if (Number.isFinite(Number(t.percent))) return Number(t.percent);
      if (Number.isFinite(Number(t.score)) && Number.isFinite(Number(t.total)) && Number(t.total) > 0) return (Number(t.score) / Number(t.total)) * 100;
      return Number.isFinite(Number(t.score)) ? Number(t.score) : NaN;
    }).filter(Number.isFinite);

    const testsAvg = round1(avg(testScores));
    const recentTests = testScores.slice(-3);
    const prevTests = testScores.slice(-6, -3);
    const testsDelta = prevTests.length ? round1(avg(recentTests) - avg(prevTests)) : 0;

    const topicMap = {};
    rawTests.forEach((t, idx) => {
      const topic = String(t.topic || t.title || t.testName || 'Общие тесты').trim();
      const sc = testScores[idx];
      if (!Number.isFinite(sc)) return;
      if (!topicMap[topic]) topicMap[topic] = [];
      topicMap[topic].push(sc);
    });
    const weakTopics = Object.keys(topicMap)
      .map(k => ({ topic: k, avg: round1(avg(topicMap[k])), count: topicMap[k].length }))
      .filter(x => x.avg < proCriteria.testsScore)
      .sort((a, b) => a.avg - b.avg)
      .slice(0, 5);

    const tp = u.typingProgress && typeof u.typingProgress === 'object' ? u.typingProgress : {};
    let typingCpm = 0;
    if (Number.isFinite(Number(tp.bestCpm)) && Number(tp.bestCpm) > 0) typingCpm = Number(tp.bestCpm);
    else if (Number.isFinite(Number(tp.cpm)) && Number(tp.cpm) > 0) typingCpm = Number(tp.cpm);
    else if (Number.isFinite(Number(tp.maxWpm)) && Number(tp.maxWpm) > 0) typingCpm = Math.round(Number(tp.maxWpm) * 5);
    else if (Number.isFinite(Number(tp.bestWpm)) && Number(tp.bestWpm) > 0) typingCpm = Math.round(Number(tp.bestWpm) * 5);
    else if (Number.isFinite(Number(tp.wpm)) && Number(tp.wpm) > 0) typingCpm = Math.round(Number(tp.wpm) * 5);

    const attempts = extras?.attempts || [];
    const typingAttempts = attempts.filter(a => a.module === 'typing' && Number.isFinite(Number(a.accuracy)));
    const typingAccuracy = typingAttempts.length
      ? round1(avg(typingAttempts.slice(0, 10).map(a => Number(a.accuracy))))
      : round1(Number(tp.accuracy || tp.avgAccuracy || tp.bestAccuracy || 0));

    const weakKeysObj = tp.weakKeys && typeof tp.weakKeys === 'object' ? tp.weakKeys : {};
    const weakKeys = Array.isArray(weakKeysObj)
      ? weakKeysObj.slice(0, 8)
      : Object.entries(weakKeysObj)
          .map(([k, v]) => [k, typeof v === 'object' && v ? Number(v.errors || v.misses || v.count || 0) : Number(v || 0)])
          .filter(([, c]) => c > 0)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 8)
          .map(e => e[0]);

    const hk = u.hotkeyProgress && typeof u.hotkeyProgress === 'object' ? u.hotkeyProgress : {};
    const hkHistory = Array.isArray(hk.history) ? hk.history : [];
    const hkRates = hkHistory.filter(h => Number(h.total) > 0 && Number.isFinite(Number(h.score))).map(h => Math.min(100, (Number(h.score) / Number(h.total)) * 100));
    const hotkeysAccuracy = hkRates.length ? round1(avg(hkRates.slice(-10))) : round1(Number(hk.accuracy || hk.percent || 0));

    const ex = u.excelProgress && typeof u.excelProgress === 'object' ? u.excelProgress : {};
    const excelCompleted = Number.isFinite(Number(ex.completedCount))
      ? Number(ex.completedCount)
      : Object.entries(ex).filter(([k, v]) => !['percent', 'totalCount', 'updatedAt'].includes(k) && Number(v) > 0).length;
    const excelPercent = Number.isFinite(Number(ex.percent))
      ? round1(Number(ex.percent))
      : Math.min(100, Math.round((excelCompleted / Math.max(1, proCriteria.excelTasks)) * 100));

    const wordCompleted = (extras?.wordResults || []).filter(r => r.completed).length;
    const recentAttemptsCount = attempts.filter(a => (Date.now() - toMillis(a.at || a.clientAt)) <= 7 * 86400000).length;
    const activeMinutes7d = Math.round(attempts.filter(a => (Date.now() - toMillis(a.at || a.clientAt)) <= 7 * 86400000).reduce((s, a) => s + (Number(a.durationSec) || 0), 0) / 60);

    const typingProgress = typingAccuracy > 0
      ? Math.min(100, Math.round((Math.min(1, typingCpm / Math.max(1, proCriteria.typingCpm)) * 0.6 + Math.min(1, typingAccuracy / Math.max(1, proCriteria.typingAccuracy)) * 0.4) * 100))
      : Math.min(100, Math.round((typingCpm / Math.max(1, proCriteria.typingCpm)) * 100));
    const testsProgress = Math.min(100, Math.round((testsAvg / Math.max(1, proCriteria.testsScore)) * 100));
    const hotkeysProgress = Math.min(100, Math.round((hotkeysAccuracy / Math.max(1, proCriteria.hotkeysAccuracy)) * 100));
    const excelScore = Math.min(100, Math.round(excelPercent));
    const wordProgress = Math.min(100, Math.round((wordCompleted / Math.max(1, proCriteria.wordLessons)) * 100));

    const proReadiness = Math.round(avg([typingProgress, testsProgress, hotkeysProgress, excelScore, wordProgress]));
    const lastSeenMs = toMillis(u.lastSeenAt || u.lastVisitAt || u.lastLoginAt);
    const inactiveDays = lastSeenMs ? Math.floor((Date.now() - lastSeenMs) / 86400000) : null;

    let status = 'on_track';
    if (proReadiness >= 90) status = 'pro_ready';
    else if ((inactiveDays !== null && inactiveDays >= 5) || testsDelta <= -10 || proReadiness < 35) status = 'needs_attention';

    return {
      uid, name, role: u.role || 'student', isBanned: u.isBanned === true,
      tests: { count: testScores.length, avg: testsAvg, delta: testsDelta, weakTopics },
      typing: { cpm: typingCpm, maxWpm: Number(tp.maxWpm || 0), testsCompleted: Number(tp.testsCompleted || 0), accuracy: typingAccuracy, weakKeys },
      hotkeys: { accuracy: hotkeysAccuracy, sessionsPlayed: Number(hk.sessionsPlayed || hkHistory.length || 0) },
      excel: { completed: excelCompleted, percent: excelPercent },
      word: { completed: wordCompleted },
      activity: { recentAttempts7d: recentAttemptsCount, activeMinutes7d, inactiveDays },
      pro: { readiness: proReadiness, breakdown: { typing: typingProgress, tests: testsProgress, hotkeys: hotkeysProgress, excel: excelScore, word: wordProgress }, status }
    };
  }

  async function analyzeStudent(targetUid, force = false) {
    requireOwner('анализ ученика');
    const cached = cache.students.get(targetUid);
    if (!force && cached && (Date.now() - cached.at) < CACHE_TTL_MS) return cached.data;
    const userRef = window.db.collection('users').doc(targetUid);
    const [uSnap, wordSnap, attSnap] = await Promise.all([
      userRef.get(),
      userRef.collection('wordResults').get().catch(() => ({ docs: [] })),
      userRef.collection('attempts').orderBy('clientAt', 'desc').limit(100).get().catch(() => ({ docs: [] }))
    ]);
    if (!uSnap.exists) throw new Error('Профиль ученика не найден.');
    const metrics = computeStudentMetrics(targetUid, uSnap.data(), {
      wordResults: wordSnap.docs.map(d => d.data()),
      attempts: attSnap.docs.map(d => d.data())
    });
    cache.students.set(targetUid, { at: Date.now(), data: metrics });
    return metrics;
  }

  async function analyzeGroup(force = false) {
    requireOwner('анализ группы');
    if (!force && cache.group && (Date.now() - cache.groupAt) < CACHE_TTL_MS) return cache.group;
    const snap = await window.db.collection('users').get();
    const students = [];
    for (const doc of snap.docs) {
      const u = doc.data() || {};
      if (doc.id === OWNER_UID || u.role === 'admin' || u.isBanned === true) continue;
      const [wordSnap, attSnap] = await Promise.all([
        doc.ref.collection('wordResults').get().catch(() => ({ docs: [] })),
        doc.ref.collection('attempts').orderBy('clientAt', 'desc').limit(60).get().catch(() => ({ docs: [] }))
      ]);
      students.push(computeStudentMetrics(doc.id, u, {
        wordResults: wordSnap.docs.map(d => d.data()),
        attempts: attSnap.docs.map(d => d.data())
      }));
    }
    const groupMedianReadiness = round1(median(students.map(s => s.pro.readiness)));
    const groupAvgTests = round1(avg(students.map(s => s.tests.avg).filter(v => v > 0)));
    const groupAvgCpm = Math.round(avg(students.map(s => s.typing.cpm).filter(v => v > 0)));
    students.forEach(s => {
      s.vsGroup = {
        readinessDiff: round1(s.pro.readiness - groupMedianReadiness),
        testsDiff: round1(s.tests.avg - groupAvgTests),
        cpmDiff: Math.round(s.typing.cpm - groupAvgCpm)
      };
    });
    const summary = {
      generatedAt: new Date().toISOString(),
      criteria: Object.assign({}, proCriteria),
      totalStudents: students.length,
      medianReadiness: groupMedianReadiness,
      avgTests: groupAvgTests,
      avgCpm: groupAvgCpm,
      leaders: students.slice().sort((a, b) => b.pro.readiness - a.pro.readiness).slice(0, 5),
      lagging: students.filter(s => s.pro.status === 'needs_attention').sort((a, b) => a.pro.readiness - b.pro.readiness),
      students
    };
    cache.group = summary;
    cache.groupAt = Date.now();
    return summary;
  }

  // 3. Планы и Discord Embed-отчёты
  async function generateStudentPlanWithAi(targetUid) {
    requireOwner('личный план ученика');
    const [student, group] = await Promise.all([analyzeStudent(targetUid, true), analyzeGroup()]);
    const prompt =
      'Ты ИИ-методист Ultimate LMS. Все цифры ниже уже посчитаны кодом — НЕ выдумывай новых чисел.\n' +
      'Составь краткий, конкретный личный план для ученика до уровня «профи» (3–5 шагов, списком через дефис, без эмодзи и без приветствий).\n' +
      'К КАЖДОЙ рекомендации коротко укажи «Почему: ...», опираясь на переданные факты.\n' +
      'Ученик: ' + JSON.stringify(student) + '\n' +
      'Группа: ' + JSON.stringify({ medianReadiness: group.medianReadiness, avgTests: group.avgTests, avgCpm: group.avgCpm }) + '\n' +
      'Критерии «профи»: ' + JSON.stringify(proCriteria);

    const explanation = await callAi(prompt);
    return { student, explanation };
  }

  function buildReportEmbed(compact, aiText, periodLabel) {
    const color = compact.medianReadiness >= 70 ? 0x16a34a : (compact.medianReadiness >= 35 ? 0x6a52e5 : 0xf59e0b);
    const leadersText = compact.leaders.length
      ? compact.leaders.slice(0, 3).map((s, i) => `${i + 1}. **${s.name}** — ${s.readiness}% профи · тесты ${s.testsAvg}% · ${s.cpm} зн/мин`).join('\n')
      : 'Пока нет данных';
    const laggingText = compact.lagging.length
      ? compact.lagging.slice(0, 4).map(s => `- **${s.name}** — ${s.readiness}% профи${s.inactiveDays != null && s.inactiveDays >= 3 ? ` · не заходил ${s.inactiveDays} дн.` : ''}`).join('\n')
      : 'Отстающих нет';

    return {
      username: 'Ultimate LMS · ИИ-отчёт',
      embeds: [{
        title: `Сводка успеваемости LMS (${periodLabel})`,
        color,
        fields: [
          { name: 'Учеников', value: `**${compact.totalStudents}**`, inline: true },
          { name: 'Медиана «профи»', value: `**${compact.medianReadiness}%**`, inline: true },
          { name: 'Тесты / Печать', value: `**${compact.avgTests}%** · **${compact.avgCpm} зн/мин**`, inline: true },
          { name: 'Лидеры группы', value: leadersText.slice(0, 1000), inline: false },
          { name: 'Требуют внимания', value: laggingText.slice(0, 1000), inline: false },
          { name: 'Выводы и рекомендации ИИ', value: String(aiText || 'Нет текста').slice(0, 1020), inline: false }
        ],
        footer: { text: 'Ultimate LMS · Расчёт кодом, рекомендации ИИ' },
        timestamp: new Date().toISOString()
      }]
    };
  }

  async function generateGroupReport(options = {}) {
    requireOwner('отчёт группы');
    const group = await analyzeGroup(true);
    const compact = {
      totalStudents: group.totalStudents,
      medianReadiness: group.medianReadiness,
      avgTests: group.avgTests,
      avgCpm: group.avgCpm,
      leaders: group.leaders.map(s => ({ name: s.name, readiness: s.pro.readiness, testsAvg: s.tests.avg, cpm: s.typing.cpm })),
      lagging: group.lagging.slice(0, 8).map(s => ({ name: s.name, readiness: s.pro.readiness, testsAvg: s.tests.avg, delta: s.tests.delta, inactiveDays: s.activity.inactiveDays }))
    };
    const prompt =
      'Ты ИИ-методист Ultimate LMS. Напиши краткую, деловую выжимку (до 700 символов, без эмодзи и приветствий) строго по JSON ниже:\n' +
      '- 1–2 предложения про главную тенденцию группы;\n' +
      '- 3 конкретных шага на неделю списком через дефис с коротким «Почему: ...».\n' +
      'Данные: ' + JSON.stringify(compact);

    const text = await callAi(prompt);
    const periodLabel = options.period || 'по команде';
    const saved = await window.db.collection('aiReports').add({
      type: periodLabel, createdAt: serverTime(), clientAt: Date.now(), metrics: compact, summaryText: text
    });
    if (options.sendToDiscord !== false) {
      await sendDiscord(buildReportEmbed(compact, text, periodLabel)).catch(() => false);
    }
    return { id: saved.id, metrics: compact, summaryText: text };
  }

  // 4. Предложения заданий
  async function proposeAssignment(proposal) {
    requireOwner('создание предложения задания');
    const p = proposal || {};
    if (!Array.isArray(p.studentIds) || !p.studentIds.length) throw new Error('Укажите хотя бы одного ученика.');
    const module = ['typing', 'hotkeys', 'excel', 'word'].includes(p.module) ? p.module : 'typing';
    const doc = {
      title: String(p.title || 'Персональное задание').slice(0, 140),
      module,
      text: String(p.text || p.description || '').slice(0, 2000),
      lang: p.lang === 'en' ? 'en' : 'ru',
      minAccuracy: Number.isFinite(Number(p.minAccuracy)) ? Number(p.minAccuracy) : 92,
      target: ['typing', 'word'].includes(module) ? 1 : Math.max(1, Number(p.target) || 5),
      hotkeyBank: module === 'hotkeys' ? String(p.hotkeyBank || 'any') : 'any',
      wordLesson: module === 'word' ? (p.wordLesson || 'memo') : null,
      reason: String(p.reason || 'На основе анализа слабых мест').slice(0, 400),
      studentIds: p.studentIds,
      studentLabel: String(p.studentLabel || ''),
      dueInDays: Math.max(1, Number(p.dueInDays) || 3),
      status: 'pending_approval',
      createdAt: serverTime(),
      clientAt: Date.now()
    };
    const ref = await window.db.collection('aiProposals').add(doc);
    return { id: ref.id, ...doc };
  }

  async function proposeSmartAssignmentWithAi(targetUid) {
    requireOwner('автоподбор задания ИИ');
    const st = await analyzeStudent(targetUid, true);
    const b = st.pro.breakdown;
    const weakest = Object.entries({ typing: b.typing, hotkeys: b.hotkeys, excel: b.excel, word: b.word })
      .sort((a, c) => a[1] - c[1])[0][0];

    const prompt =
      'Верни СТРОГО чистый JSON без markdown и эмодзи: {"title":"короткое название до 60 символов","text":"короткий учебный текст на русском 45-65 слов (для typing) или чёткая инструкция (для других модулей)","reason":"почему выбрано это задание (1 предложение)"}.\n' +
      'Ученик: ' + st.name + ', самый слабый модуль: ' + weakest + ', данные: ' + JSON.stringify({ typing: st.typing, hotkeys: st.hotkeys, excel: st.excel, word: st.word });

    const raw = await callAi(prompt);
    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    const s = cleaned.indexOf('{'), e = cleaned.lastIndexOf('}');
    let parsed = {};
    try { parsed = JSON.parse(s !== -1 && e !== -1 ? cleaned.slice(s, e + 1) : cleaned); } catch (_) {}

    return proposeAssignment({
      title: parsed.title || (`Тренировка (${weakest}) для ${st.name}`),
      module: weakest,
      text: parsed.text || 'Регулярная практика точности и скорости помогает закрепить навык и уверенно приблизиться к уровню профи.',
      reason: parsed.reason || `Слабейшее направление ученика — ${weakest} (${b[weakest]}% готовности).`,
      studentIds: [targetUid],
      studentLabel: st.name,
      minAccuracy: 94,
      dueInDays: 3
    });
  }

  async function approveProposal(proposalId) {
    requireOwner('подтверждение задания');
    const ref = window.db.collection('aiProposals').doc(proposalId);
    const snap = await ref.get();
    if (!snap.exists) throw new Error('Предложение не найдено.');
    const p = snap.data();
    if (p.status !== 'pending_approval') throw new Error('Предложение уже обработано (' + p.status + ').');

    const studentNames = {};
    await Promise.all((p.studentIds || []).map(async id => {
      try {
        const uSnap = await window.db.collection('users').doc(id).get();
        const u = uSnap.exists ? (uSnap.data() || {}) : {};
        studentNames[id] = u.nickname || u.displayName || u.email || id;
      } catch (_) { studentNames[id] = id; }
    }));

    const dueMs = Date.now() + (Math.max(1, Number(p.dueInDays) || 3) * 86400000);
    const dueAt = window.firebase?.firestore?.Timestamp?.fromMillis
      ? window.firebase.firestore.Timestamp.fromMillis(dueMs)
      : new Date(dueMs).toISOString();

    const assignmentRef = await window.db.collection('lmsAssignments').add({
      version: 3, assessmentVersion: 2,
      hotkeyBank: p.module === 'hotkeys' ? (p.hotkeyBank || 'any') : 'any',
      title: p.title, module: p.module, text: p.text || '', lang: p.lang || 'ru',
      minAccuracy: Number(p.minAccuracy) || 92,
      target: ['typing', 'word'].includes(p.module) ? 1 : (Number(p.target) || 5),
      wordLesson: p.module === 'word' ? (p.wordLesson || 'memo') : null,
      dueAt, studentIds: p.studentIds, studentNames,
      createdBy: OWNER_UID, sourceProposalId: proposalId, createdAt: serverTime(), status: 'assigned'
    });
    await ref.update({ status: 'approved', assignmentId: assignmentRef.id, approvedAt: serverTime() });
    return { ok: true, assignmentId: assignmentRef.id };
  }

  async function rejectProposal(proposalId, note = '') {
    requireOwner('отклонение задания');
    await window.db.collection('aiProposals').doc(proposalId).update({
      status: 'rejected', rejectNote: String(note || '').slice(0, 300), rejectedAt: serverTime()
    });
    return { ok: true };
  }

  // ---------------------------------------------------------------------------
  // 5. Полная восстановимая уборка (журнал, активность, СМС, шахматы, TypeDrive, отменённые задания) + удаление бэкапов
  // ---------------------------------------------------------------------------
  const CLEANUP_CATALOG = [
    { id: 'platformErrors', label: 'Журнал ошибок', desc: 'Системные ошибки platformErrors', icon: 'alert' },
    { id: 'allActivity', label: 'Активность учеников', desc: 'Журналы посещений и переходов users/*/activity', icon: 'activity' },
    { id: 'chatMessages', label: 'Сообщения (СМС)', desc: 'Личная переписка private_chats/*/messages', icon: 'message' },
    { id: 'chessRooms', label: 'Шахматы', desc: 'Комнаты партий chessRooms', icon: 'chess' },
    { id: 'typeDrive', label: 'TypeDrive', desc: 'Комнаты и присутствие typeDriveRooms / Presence', icon: 'keyboard' },
    { id: 'cancelledAssignments', label: 'Отменённые задания', desc: 'Отменённые/архивные lmsAssignments и отклонённые aiProposals', icon: 'clipboard' }
  ];

  async function collectCleanupDocs(target, olderThanDays) {
    const cutoff = olderThanDays > 0 ? Date.now() - olderThanDays * 86400000 : Infinity;
    const matchAge = data => {
      if (olderThanDays === 0) return true;
      const ts = toMillis(data.at || data.clientAt || data.createdAt || data.updatedAt || data.timestamp || data.endedAt);
      return ts > 0 && ts < cutoff;
    };
    const docs = [];

    if (target === 'platformErrors') {
      const s = await window.db.collection('platformErrors').get();
      s.docs.forEach(d => { if (matchAge(d.data() || {})) docs.push(d); });
    } else if (target === 'allActivity') {
      const uSnap = await window.db.collection('users').get();
      for (const u of uSnap.docs) {
        const aSnap = await u.ref.collection('activity').get().catch(() => ({ docs: [] }));
        aSnap.docs.forEach(d => { if (matchAge(d.data() || {})) docs.push(d); });
      }
    } else if (target === 'chatMessages') {
      const s = await window.db.collectionGroup('messages').get();
      s.docs.forEach(d => {
        if (d.ref.path.startsWith('private_chats/') && matchAge(d.data() || {})) docs.push(d);
      });
    } else if (target === 'chessRooms') {
      const s = await window.db.collection('chessRooms').get();
      s.docs.forEach(d => {
        const data = d.data() || {};
        if (matchAge(data)) docs.push(d);
      });
    } else if (target === 'typeDrive') {
      const [rSnap, pSnap] = await Promise.all([
        window.db.collection('typeDriveRooms').get().catch(() => ({ docs: [] })),
        window.db.collection('typeDrivePresence').get().catch(() => ({ docs: [] }))
      ]);
      rSnap.docs.forEach(d => { if (matchAge(d.data() || {})) docs.push(d); });
      pSnap.docs.forEach(d => { if (matchAge(d.data() || {})) docs.push(d); });
    } else if (target === 'cancelledAssignments') {
      const [aSnap, pSnap] = await Promise.all([
        window.db.collection('lmsAssignments').get().catch(() => ({ docs: [] })),
        window.db.collection('aiProposals').get().catch(() => ({ docs: [] }))
      ]);
      aSnap.docs.forEach(d => {
        const st = String((d.data() || {}).status || '').toLowerCase();
        if (['cancelled', 'canceled', 'archived', 'deleted', 'closed'].includes(st) && matchAge(d.data() || {})) docs.push(d);
      });
      pSnap.docs.forEach(d => {
        const st = String((d.data() || {}).status || '').toLowerCase();
        if (['rejected', 'cancelled'].includes(st) && matchAge(d.data() || {})) docs.push(d);
      });
    } else {
      throw new Error('Неизвестная категория очистки: ' + target);
    }
    return docs;
  }

  async function previewCleanup(options = {}) {
    requireOwner('предпросмотр очистки');
    const target = options.target;
    const olderThanDays = Math.max(0, Number(options.olderThanDays || 0));
    const docs = await collectCleanupDocs(target, olderThanDays);
    return {
      target,
      olderThanDays,
      count: docs.length,
      paths: docs.map(d => d.ref.path)
    };
  }

  async function executeCleanup(preview, confirmed) {
    requireOwner('выполнение очистки');
    if (confirmed !== true) throw new Error('Требуется подтверждение администратора.');
    if (!preview || !Array.isArray(preview.paths) || !preview.paths.length) return { ok: true, deleted: 0, backupIds: [] };

    const records = [];
    for (const p of preview.paths) {
      const snap = await window.db.doc(p).get().catch(() => null);
      if (snap && snap.exists) records.push({ path: p, data: snap.data() });
    }
    if (!records.length) return { ok: true, deleted: 0, backupIds: [] };

    // Автоматически делим бэкап на части до ~700 КБ, чтобы Firestore никогда не упёрся в лимит 1 МБ
    const chunks = [];
    let current = [], size = 2;
    for (const r of records) {
      const str = JSON.stringify(r);
      if (current.length && (size + str.length) > 700000) {
        chunks.push(current);
        current = [r];
        size = str.length + 2;
      } else {
        current.push(r);
        size += str.length + 1;
      }
    }
    if (current.length) chunks.push(current);

    const cat = CLEANUP_CATALOG.find(c => c.id === preview.target);
    const label = cat ? cat.label : preview.target;
    const backupIds = [];

    for (let idx = 0; idx < chunks.length; idx++) {
      const part = chunks[idx];
      const bRef = await window.db.collection('lmsBackups').add({
        target: preview.target,
        label: chunks.length > 1 ? `${label} (часть ${idx + 1}/${chunks.length})` : label,
        count: part.length,
        createdAt: serverTime(),
        clientAt: Date.now(),
        restored: false,
        format: 'paths_v2',
        payloadJson: JSON.stringify(part)
      });
      backupIds.push(bRef.id);
    }

    // Удаление батчами по 400 документов
    let deleted = 0;
    for (let i = 0; i < records.length; i += 400) {
      const batch = window.db.batch();
      records.slice(i, i + 400).forEach(r => batch.delete(window.db.doc(r.path)));
      await batch.commit();
      deleted += Math.min(400, records.length - i);
    }
    return { ok: true, deleted, backupIds };
  }

  async function restoreBackup(backupId) {
    requireOwner('восстановление копии');
    const bRef = window.db.collection('lmsBackups').doc(backupId);
    const snap = await bRef.get();
    if (!snap.exists) throw new Error('Резервная копия не найдена.');
    const b = snap.data();
    const records = JSON.parse(b.payloadJson || '[]');

    for (let i = 0; i < records.length; i += 400) {
      const batch = window.db.batch();
      records.slice(i, i + 400).forEach(r => {
        if (b.format === 'paths_v2' && r.path) {
          batch.set(window.db.doc(r.path), reviveFirestoreTypes(r.data));
        } else if (b.path && r.id) {
          batch.set(window.db.doc(b.path + '/' + r.id), reviveFirestoreTypes(r.data));
        }
      });
      await batch.commit();
    }
    await bRef.update({ restored: true, restoredAt: serverTime() });
    return { ok: true, restoredCount: records.length };
  }

  async function deleteBackup(backupId) {
    requireOwner('удаление резервной копии');
    await window.db.collection('lmsBackups').doc(backupId).delete();
    return { ok: true };
  }

  async function deleteAllRestoredBackups() {
    requireOwner('очистка восстановленных копий');
    const snap = await window.db.collection('lmsBackups').get();
    const targets = snap.docs.filter(d => d.data()?.restored === true);
    for (let i = 0; i < targets.length; i += 400) {
      const batch = window.db.batch();
      targets.slice(i, i + 400).forEach(d => batch.delete(d.ref));
      await batch.commit();
    }
    return { ok: true, deleted: targets.length };
  }

  const AUTO_SCAN_KEY = 'lms_ai_cleanup_last_scan_v1';
  let pendingAutoPlan = null;

  // Умное фоновое сканирование старых данных порциями (по умолчанию старше 14 дн., до 100 записей на категорию)
  async function scanOldDataForAi(options = {}) {
    requireOwner('авто-проверка старых данных');
    const olderThanDays = Math.max(1, Number(options.olderThanDays || 14));
    const maxPerCategory = Math.max(10, Number(options.maxPerCategory || 100));
    const items = [];
    let totalFound = 0;

    for (const cat of CLEANUP_CATALOG) {
      try {
        const docs = await collectCleanupDocs(cat.id, olderThanDays);
        if (!docs.length) continue;
        // Берём самые старые записи порцией, чтобы чистить понемногу и без нагрузки
        const sorted = docs.slice().sort((a, b) => {
          const da = a.data() || {}, db = b.data() || {};
          return toMillis(da.at || da.clientAt || da.createdAt) - toMillis(db.at || db.clientAt || db.createdAt);
        });
        const slice = sorted.slice(0, maxPerCategory);
        totalFound += slice.length;
        items.push({
          target: cat.id,
          label: cat.label,
          olderThanDays,
          totalAvailable: docs.length,
          count: slice.length,
          paths: slice.map(d => d.ref.path)
        });
      } catch (_) {}
    }

    if (!items.length) {
      pendingAutoPlan = { generatedAt: Date.now(), olderThanDays, totalFound: 0, items: [], aiNote: 'Старых записей старше ' + olderThanDays + ' дн. не найдено — база чистая.' };
      return pendingAutoPlan;
    }

    let aiNote = 'Найдено ' + totalFound + ' старых записей (старше ' + olderThanDays + ' дн.). Рекомендую очистить этой порцией — перед удалением автоматически сохранится резервная копия.';
    try {
      const compact = items.map(i => ({ category: i.label, batchCount: i.count, totalOld: i.totalAvailable }));
      const prompt = 'Ты ИИ-менеджер Ultimate LMS. Напиши администратору 1–2 коротких предложения на русском (без эмодзи и приветствий), какие старые данные найдены для порционной уборки и почему их стоит безопасно почистить с бэкапом. Строго по цифрам: ' + JSON.stringify(compact);
      const reply = await callAi(prompt, 15000);
      if (reply) aiNote = reply;
    } catch (_) {}

    pendingAutoPlan = { generatedAt: Date.now(), olderThanDays, totalFound, items, aiNote };

    if (options.notifyDiscord) {
      const lines = items.map(i => `- **${i.label}**: ${i.count} зап. (всего старых: ${i.totalAvailable})`).join('\n');
      await sendDiscord({
        username: 'Ultimate LMS · ИИ-уборка',
        embeds: [{
          title: 'ИИ подготовил порционную уборку старых данных',
          color: 0x6a52e5,
          description: aiNote.slice(0, 1000),
          fields: [
            { name: 'К удалению (с авто-бэкапом)', value: lines.slice(0, 1000), inline: false },
            { name: 'Действие', value: 'Открой **Админка → ИИ-менеджер → Уборка и бэкапы** и нажми «Подтвердить и очистить».', inline: false }
          ],
          footer: { text: 'Ничего не удаляется без твоего подтверждения' },
          timestamp: new Date().toISOString()
        }]
      }).catch(() => false);
    }
    return pendingAutoPlan;
  }

  async function executeAutoCleanupPlan(plan, confirmed) {
    requireOwner('подтверждение авто-уборки ИИ');
    if (confirmed !== true) throw new Error('Требуется подтверждение администратора.');
    const targetPlan = plan || pendingAutoPlan;
    if (!targetPlan || !Array.isArray(targetPlan.items) || !targetPlan.items.length) return { ok: true, totalDeleted: 0, details: [] };

    const details = [];
    let totalDeleted = 0;
    for (const item of targetPlan.items) {
      const res = await executeCleanup(item, true);
      totalDeleted += res.deleted || 0;
      details.push({ label: item.label, deleted: res.deleted || 0, backupIds: res.backupIds || [] });
    }
    pendingAutoPlan = null;

    const summaryLines = details.map(d => `- **${d.label}**: удалено ${d.deleted} зап. (бэкап сохранён)`).join('\n');
    await sendDiscord({
      username: 'Ultimate LMS · ИИ-уборка',
      embeds: [{
        title: 'Плановая уборка выполнена с резервной копией',
        color: 0x16a34a,
        fields: [
          { name: 'Итого очищено', value: `**${totalDeleted} записей**`, inline: true },
          { name: 'Детали', value: summaryLines.slice(0, 1000), inline: false }
        ],
        footer: { text: 'Копии сохранены в lmsBackups — можно восстановить в 1 клик' },
        timestamp: new Date().toISOString()
      }]
    }).catch(() => false);

    return { ok: true, totalDeleted, details };
  }

  // Фоновая проверка раз в 24 часа, когда админ заходит в LMS (без нагрузки на интерфейс)
  function scheduleDailyAutoScan() {
    if (!isOwner()) return;
    try {
      const last = Number(localStorage.getItem(AUTO_SCAN_KEY) || 0);
      if (Date.now() - last < 86400000) return;
      localStorage.setItem(AUTO_SCAN_KEY, String(Date.now()));
    } catch (_) { return; }
    setTimeout(() => {
      if (isOwner()) void scanOldDataForAi({ olderThanDays: 14, maxPerCategory: 100, notifyDiscord: true }).catch(() => {});
    }, 6000);
  }
  if (window.auth?.onAuthStateChanged) window.auth.onAuthStateChanged(() => scheduleDailyAutoScan());
  window.addEventListener('lms:profile-ready', scheduleDailyAutoScan);

  function setProCriteria(patch) {
    requireOwner('настройка критериев «профи»');
    proCriteria = Object.assign({}, proCriteria, patch || {}, { confirmed: true });
    cache.group = null;
    cache.students.clear();
    return Object.assign({}, proCriteria);
  }

  // ---------------------------------------------------------------------------
  // 6. Премиальный встроенный интерфейс «ИИ-менеджер» (без эмодзи, SVG + анимации)
  // ---------------------------------------------------------------------------
  function injectSectionStyles() {
    const old = document.getElementById('lms-mentor-styles');
    if (old) old.remove();
    const style = document.createElement('style');
    style.id = 'lms-mentor-styles';
    style.textContent = `
      @keyframes lmmSpin{to{transform:rotate(360deg)}}
      @keyframes lmmFadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
      @keyframes lmmShimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
      @keyframes lmmPulse{0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,.45)}50%{box-shadow:0 0 0 7px transparent}}

      .lmm-wrap{
        --surface:#ffffff;--surface-2:#f3f5fb;--surface-hover:#e9eef8;
        --border:#dde3f0;--border-2:#c3cde3;
        --text:#162033;--muted:#5b6a88;
        --accent:#6a52e5;--accent-2:#8b72ff;--accent-soft:rgba(106,82,229,.10);
        --green:#16a34a;--green-soft:rgba(22,163,74,.11);
        --amber:#d97706;--amber-soft:rgba(217,119,6,.12);
        --red:#dc2626;--red-soft:rgba(220,38,38,.11);
        --shadow-card:0 4px 16px rgba(22,32,51,.05);
        --ease:cubic-bezier(.22,1,.36,1);
        display:flex;flex-direction:column;gap:18px;color:var(--text);
        font-family:Montserrat,system-ui,sans-serif;animation:lmmFadeUp .35s var(--ease) both;
      }
      body.dark .lmm-wrap, html.dark .lmm-wrap, [data-theme="dark"] .lmm-wrap{
        --surface:#151d30;--surface-2:#0f1626;--surface-hover:#1d2740;
        --border:#25314d;--border-2:#35456b;
        --text:#f1f5ff;--muted:#90a3c4;
        --accent:#7c5dfa;--accent-2:#a28bff;--accent-soft:rgba(124,93,250,.16);
        --green:#22c55e;--green-soft:rgba(34,197,94,.14);
        --amber:#f59e0b;--amber-soft:rgba(245,158,11,.15);
        --red:#ef4444;--red-soft:rgba(239,68,68,.14);
        --shadow-card:0 12px 32px rgba(0,0,0,.22);
      }
      body.light .lmm-wrap, html.light .lmm-wrap, [data-theme="light"] .lmm-wrap{
        --surface:#ffffff;--surface-2:#f3f5fb;--surface-hover:#e9eef8;
        --border:#dde3f0;--border-2:#c3cde3;
        --text:#162033;--muted:#5b6a88;
        --accent:#6a52e5;--accent-2:#8b72ff;--accent-soft:rgba(106,82,229,.10);
        --green:#16a34a;--green-soft:rgba(22,163,74,.11);
        --amber:#d97706;--amber-soft:rgba(217,119,6,.12);
        --red:#dc2626;--red-soft:rgba(220,38,38,.11);
        --shadow-card:0 4px 16px rgba(22,32,51,.05);
      }

      /* Spotlight hover effect on desktop */
      .lmm-glow{position:relative;overflow:hidden;}
      @media(hover:hover){
        .lmm-glow::after{
          content:"";position:absolute;inset:0;pointer-events:none;opacity:0;
          background:radial-gradient(320px circle at var(--mx,50%) var(--my,50%),var(--accent-soft),transparent 65%);
          transition:opacity .28s ease;z-index:0;
        }
        .lmm-glow:hover::after{opacity:1;}
        .lmm-glow > *{position:relative;z-index:1;}
      }

      .lmm-hero{
        display:flex;align-items:center;justify-content:space-between;gap:18px;flex-wrap:wrap;
        padding:24px 26px;border-radius:22px;border:1px solid var(--border);
        background:radial-gradient(ellipse at 92% 0%,var(--accent-soft),transparent 60%),var(--surface);
        box-shadow:var(--shadow-card);
      }
      .lmm-hero-left{display:flex;align-items:center;gap:16px;}
      .lmm-hero-ic{
        width:48px;height:48px;border-radius:15px;display:grid;place-items:center;flex-shrink:0;
        background:linear-gradient(140deg,var(--accent-2),var(--accent));color:#fff;
        box-shadow:0 8px 24px rgba(106,82,229,.35);
      }
      .lmm-hero h3{margin:0;font-size:20px;font-weight:800;letter-spacing:-.02em;}
      .lmm-hero p{margin:5px 0 0;font-size:12.5px;color:var(--muted);line-height:1.5;}
      .lmm-live-pill{
        display:inline-flex;align-items:center;gap:8px;padding:8px 14px;border-radius:999px;
        background:var(--surface-2);border:1px solid var(--border);font-size:12px;font-weight:700;color:var(--muted);
      }
      .lmm-live-dot{width:8px;height:8px;border-radius:50%;background:var(--green);animation:lmmPulse 2.4s infinite;}

      .lmm-tabs{
        display:flex;gap:6px;flex-wrap:wrap;padding:6px;border-radius:16px;
        background:var(--surface);border:1px solid var(--border);
      }
      .lmm-tab{
        padding:10px 16px;border-radius:12px;border:1px solid transparent;
        background:transparent;color:var(--muted);font-weight:700;font-size:12.5px;
        cursor:pointer;display:inline-flex;align-items:center;gap:8px;
        transition:background .18s var(--ease),color .18s,border-color .18s,transform .15s;
      }
      .lmm-tab:hover{background:var(--surface-2);color:var(--text);}
      .lmm-tab.active{
        background:var(--accent-soft);color:var(--accent);
        border-color:rgba(124,93,250,.32);box-shadow:0 4px 12px rgba(124,93,250,.12);
      }

      .lmm-panel{display:flex;flex-direction:column;gap:14px;animation:lmmFadeUp .28s var(--ease) both;}
      .lmm-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;}
      .lmm-kpi{
        background:var(--surface);border:1px solid var(--border);border-radius:18px;padding:18px;box-shadow:var(--shadow-card);
        display:flex;align-items:center;gap:14px;
        animation:lmmFadeUp .35s var(--ease) both;animation-delay:calc(var(--i,0)*45ms);
        transition:transform .2s var(--ease),border-color .2s;
      }
      .lmm-kpi:hover{transform:translateY(-2px);border-color:var(--border-2);}
      .lmm-kpi-ic{
        width:42px;height:42px;border-radius:13px;display:grid;place-items:center;flex-shrink:0;
        background:var(--accent-soft);color:var(--accent);
      }
      .lmm-kpi:nth-child(2) .lmm-kpi-ic{background:var(--green-soft);color:var(--green);}
      .lmm-kpi:nth-child(3) .lmm-kpi-ic{background:var(--amber-soft);color:var(--amber);}
      .lmm-kpi span{display:block;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--muted);}
      .lmm-kpi b{display:block;font-size:23px;font-weight:800;letter-spacing:-.02em;margin-top:2px;color:var(--text);}

      .lmm-toolbar{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;}
      .lmm-filters{display:flex;gap:6px;flex-wrap:wrap;}
      .lmm-fbtn{
        padding:8px 14px;border-radius:999px;border:1px solid var(--border);
        background:var(--surface);color:var(--muted);font-size:12px;font-weight:700;cursor:pointer;
        transition:all .16s var(--ease);
      }
      .lmm-fbtn:hover{border-color:var(--border-2);color:var(--text);}
      .lmm-fbtn.active{background:linear-gradient(135deg,var(--accent-2),var(--accent));color:#ffffff;border-color:var(--accent);box-shadow:0 4px 14px rgba(106,82,229,.28);}

      .lmm-card{
        background:var(--surface);border:1px solid var(--border);border-radius:18px;box-shadow:var(--shadow-card);
        padding:16px 18px;display:flex;flex-direction:column;gap:12px;
        animation:lmmFadeUp .34s var(--ease) both;animation-delay:calc(min(var(--i,0),10)*35ms);
        transition:border-color .18s,transform .18s var(--ease);
      }
      .lmm-card:hover{border-color:var(--border-2);}
      .lmm-row{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;}

      .lmm-student-head{display:flex;align-items:center;gap:13px;min-width:0;}
      .lmm-avatar{
        width:42px;height:42px;border-radius:13px;flex-shrink:0;
        display:grid;place-items:center;font-weight:800;font-size:13px;
        background:var(--accent-soft);color:var(--accent);border:1.5px solid rgba(124,93,250,.32);
      }
      .lmm-avatar.st-pro{background:var(--green-soft);color:var(--green);border-color:rgba(34,197,94,.38);}
      .lmm-avatar.st-warn{background:var(--amber-soft);color:var(--amber);border-color:rgba(245,158,11,.38);}

      .lmm-pills{display:flex;gap:6px;flex-wrap:wrap;margin-top:6px;}
      .lmm-pill{
        font-size:11px;font-weight:700;padding:3px 9px;border-radius:8px;
        background:var(--surface-2);color:var(--muted);border:1px solid var(--border);
      }
      .lmm-badge{display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:800;padding:4px 10px;border-radius:999px;}
      .lmm-badge.ok{background:var(--green-soft);color:var(--green);}
      .lmm-badge.warn{background:var(--amber-soft);color:var(--amber);}
      .lmm-badge.err{background:var(--red-soft);color:var(--red);}
      .lmm-badge.info{background:var(--accent-soft);color:var(--accent);}

      .lmm-prog-wrap{display:flex;align-items:center;gap:10px;}
      .lmm-bar{height:8px;background:var(--surface-2);border:1px solid var(--border);border-radius:99px;overflow:hidden;width:118px;}
      .lmm-bar i{
        display:block;height:100%;border-radius:99px;position:relative;overflow:hidden;
        background:linear-gradient(90deg,var(--accent),var(--green));transition:width .5s var(--ease);
      }
      .lmm-bar i::after{
        content:"";position:absolute;inset:0;
        background:linear-gradient(90deg,transparent,rgba(255,255,255,.4),transparent);
        background-size:200% 100%;animation:lmmShimmer 2.4s linear infinite;
      }

      .lmm-btn{
        padding:9px 14px;border-radius:11px;border:1px solid var(--border-2);border-bottom-width:2px;
        background:var(--surface-2);color:var(--text);font-weight:700;font-size:12px;
        cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:7px;
        transition:transform .16s var(--ease),background .16s,border-color .16s,color .16s;
      }
      .lmm-btn:hover:not(:disabled){transform:translateY(-1px);border-color:var(--accent);background:var(--surface-hover);}
      .lmm-btn:active:not(:disabled){transform:translateY(1px);}
      .lmm-btn.primary{background:linear-gradient(135deg,var(--accent-2),var(--accent));border-color:#4b33be;color:#fff;}
      .lmm-btn.primary:hover:not(:disabled){background:linear-gradient(135deg,#ad98ff,#7458f2);}
      .lmm-btn.good{background:var(--green);border-color:#15803d;color:#fff;}
      .lmm-btn.danger{background:var(--red-soft);border-color:rgba(239,68,68,.45);color:var(--red);}
      .lmm-btn.danger:hover:not(:disabled){background:var(--red);color:#fff;border-color:var(--red);}
      .lmm-btn.sm{padding:7px 11px;font-size:11.5px;border-radius:9px;}
      .lmm-btn:disabled{opacity:.5;cursor:not-allowed;transform:none;}

      .lmm-rich{
        font-size:13px;line-height:1.68;color:var(--text);
        background:var(--surface-2);padding:15px 17px;border-radius:14px;border:1px solid var(--border);
      }
      .lmm-li{display:flex;align-items:flex-start;gap:10px;margin:5px 0;}
      .lmm-bullet{width:6px;height:6px;border-radius:50%;background:var(--accent);margin-top:8px;flex-shrink:0;}

      .lmm-notice{
        display:flex;align-items:center;gap:10px;font-size:12.5px;font-weight:600;
        padding:11px 15px;border-radius:13px;
        background:var(--accent-soft);color:var(--accent);border:1px solid rgba(124,93,250,.25);
      }
      .lmm-clean-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;}
      .lmm-clean-item{
        background:var(--surface-2);border:1px solid var(--border);border-radius:16px;
        padding:15px;display:flex;flex-direction:column;gap:10px;
        transition:border-color .18s,transform .18s var(--ease);
      }
      .lmm-clean-item:hover{border-color:var(--accent);transform:translateY(-2px);}
      .lmm-clean-head{display:flex;align-items:center;gap:10px;}
      .lmm-clean-ic{
        width:36px;height:36px;border-radius:11px;display:grid;place-items:center;flex-shrink:0;
        background:var(--accent-soft);color:var(--accent);
      }
      .lmm-clean-item strong{font-size:13.5px;display:block;}
      .lmm-clean-item small{font-size:11.5px;color:var(--muted);line-height:1.4;display:block;}
      .lmm-clean-actions{display:flex;gap:6px;flex-wrap:wrap;margin-top:auto;}

      .lmm-backup-row{
        padding:12px 14px;background:var(--surface-2);border:1px solid var(--border);
        border-radius:13px;display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;
      }
      .lmm-skel-wrap{display:flex;flex-direction:column;gap:10px;}
      .lmm-skel{
        height:68px;border-radius:16px;
        background:linear-gradient(90deg,var(--surface) 25%,var(--surface-hover) 50%,var(--surface) 75%);
        background-size:200% 100%;animation:lmmShimmer 1.4s infinite linear;border:1px solid var(--border);
      }
      .lmm-charts-grid{display:grid;grid-template-columns:1.18fr 1fr;gap:16px;}
      @keyframes lmmOrbFloat{0%{transform:translate3d(0,0,0) scale(1)}50%{transform:translate3d(-18px,14px,0) scale(1.08)}100%{transform:translate3d(0,0,0) scale(1)}}
      @keyframes lmmOrbFloat2{0%{transform:translate3d(0,0,0) scale(1)}50%{transform:translate3d(16px,-12px,0) scale(1.1)}100%{transform:translate3d(0,0,0) scale(1)}}
      .lmm-chart-card{
        position:relative;overflow:hidden;isolation:isolate;
        background:
          radial-gradient(circle at 1px 1px, rgba(148,163,184,0.14) 1px, transparent 0),
          var(--surface);
        background-size:20px 20px, auto;
        border:1px solid var(--border);border-radius:20px;
        padding:20px 22px 18px;display:flex;flex-direction:column;gap:12px;
        box-shadow:var(--shadow-card);animation:lmmFadeUp .4s var(--ease) both;
      }
      .lmm-chart-card::before{
        content:"";position:absolute;left:0;right:0;top:0;height:2.5px;z-index:2;
        background:linear-gradient(90deg,var(--accent),var(--green));opacity:.9;
      }
      .lmm-chart-orb{
        position:absolute;border-radius:50%;filter:blur(48px);pointer-events:none;z-index:-1;opacity:.22;
      }
      .lmm-chart-orb.o1{width:190px;height:190px;top:-45px;right:-35px;background:var(--accent);animation:lmmOrbFloat 11s ease-in-out infinite;}
      .lmm-chart-orb.o2{width:165px;height:165px;bottom:-55px;left:-35px;background:var(--green);animation:lmmOrbFloat2 14s ease-in-out infinite;}
      .lmm-vtab{flex:1;text-align:center;white-space:nowrap;}

      .lv-lnp{fill:none;stroke-width:3;stroke-linecap:round;stroke-dasharray:1;stroke-dashoffset:1;transition:stroke-dashoffset 1.5s var(--ease) var(--d,0s);}
      .lv-go .lv-lnp{stroke-dashoffset:0;}
      .lv-ar{opacity:0;transition:opacity .9s ease .6s;}.lv-go .lv-ar{opacity:1;}
      .lv-gap-row{display:flex;flex-direction:column;gap:5px;margin:7px 0;}
      .lv-gap-top{display:flex;justify-content:space-between;align-items:center;font-size:12px;font-weight:700;}
      .lv-gap-tag{font-size:10.5px;font-weight:800;padding:2px 8px;border-radius:99px;}
      .lv-gap-tag.ok{background:var(--green-soft);color:var(--green);}
      .lv-gap-tag.warn{background:var(--amber-soft);color:var(--amber);}
      .lv-gap-tag.bad{background:var(--red-soft);color:var(--red);}
      .lmm-chart-head{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;}
      .lmm-chart-head strong{font-size:14.5px;font-weight:800;display:inline-flex;align-items:center;gap:8px;}
      .lmm-chart-head small{display:block;font-size:11.5px;color:var(--muted);margin-top:2px;}
      .lmm-vtabs{display:flex;gap:4px;flex-wrap:wrap;padding:3px;border-radius:11px;background:var(--surface-2);border:1px solid var(--border);}
      .lmm-vtab{
        padding:5px 9px;border-radius:8px;border:none;background:transparent;color:var(--muted);
        font:700 11px/1.2 Montserrat,system-ui,sans-serif;cursor:pointer;transition:all .16s;
      }
      .lmm-vtab:hover{color:var(--text);}
      .lmm-vtab.active{background:var(--accent);color:#fff;box-shadow:0 3px 10px rgba(106,82,229,.28);}
      .lmm-select{
        font:inherit;font-size:11.5px;font-weight:700;color:var(--text);
        background:var(--surface-2);border:1px solid var(--border-2);border-radius:10px;
        padding:6px 10px;max-width:195px;cursor:pointer;
      }
      .lmm-replay{
        width:30px;height:30px;border-radius:9px;border:1px solid var(--border);
        background:var(--surface-2);color:var(--muted);display:grid;place-items:center;cursor:pointer;
        transition:all .16s;
      }
      .lmm-replay:hover{color:var(--text);border-color:var(--accent);transform:rotate(-45deg);}
      .lmm-viz-box{min-height:252px;display:flex;flex-direction:column;justify-content:center;}
      .lmm-viz-box svg{width:100%;height:auto;display:block;}
      .lmm-viz-box text{fill:var(--muted);font-size:11px;font-family:Montserrat,system-ui,sans-serif;}

      /* 1. Glowing gradient bars (точная шкала 0-100%) */
      .lv-cols{display:flex;align-items:flex-end;justify-content:space-around;height:200px;position:relative;border-bottom:1px solid var(--border);margin-top:16px;gap:10px;padding:0 6px;}
      .lv-col{position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%;gap:5px;flex:1;max-width:68px;cursor:pointer;}
      .lv-bar{
        width:100%;border-radius:10px 10px 4px 4px;height:0;
        transition:height 1.15s cubic-bezier(.2,.8,.2,1) var(--d,0s),filter .2s;
        background:linear-gradient(180deg,var(--c-top),var(--c));
        box-shadow:0 0 22px -4px var(--c);
      }
      .lv-col:hover .lv-bar{filter:brightness(1.12);}
      .lv-go .lv-bar{height:var(--h);}
      .lv-goal{position:absolute;left:0;right:0;bottom:90%;border-top:2px dashed var(--green);opacity:.82;pointer-events:none;z-index:1;}
      .lv-goal span{position:absolute;right:2px;top:-17px;color:var(--green);font-size:10.5px;font-weight:800;}
      .lv-gline{position:absolute;left:0;right:0;border-top:1px dashed var(--border);opacity:.7;pointer-events:none;z-index:0;}
      .lv-gline span{position:absolute;left:0;top:-13px;font:700 9.5px/1 Montserrat,sans-serif;color:var(--muted);opacity:.75;}
      .lv-labs{display:flex;justify-content:space-around;gap:8px;margin-top:8px;color:var(--muted);font-size:11px;font-weight:700;}
      .lv-labs span{flex:1;max-width:74px;text-align:center;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
      .lv-val{font-size:11.5px;font-weight:800;color:var(--text);}

      /* 2. Horizontal shimmer bars */
      .lv-hrow{margin:9px 0;cursor:pointer;}
      .lv-hrow .lv-ht{display:flex;justify-content:space-between;margin-bottom:5px;font-size:12px;font-weight:700;}
      .lv-htr{height:13px;background:var(--surface-2);border:1px solid var(--border);border-radius:99px;overflow:hidden;}
      .lv-hfill{
        height:100%;width:0;border-radius:99px;position:relative;overflow:hidden;
        background:linear-gradient(90deg,var(--c),var(--c-top));
        transition:width 1.2s cubic-bezier(.2,.8,.2,1) var(--d,0s);
      }
      .lv-go .lv-hfill{width:var(--w);}
      .lv-hfill::after{content:"";position:absolute;inset:0;background:linear-gradient(100deg,transparent 30%,rgba(255,255,255,.45) 50%,transparent 70%);transform:translateX(-100%);animation:lmmShimmer 2.4s infinite 1.2s;}

      /* 3. Progress rings */
      .lv-rings{display:grid;grid-template-columns:repeat(auto-fit,minmax(84px,1fr));gap:10px;text-align:center;}
      .lv-ring-item{cursor:pointer;padding:6px;border-radius:14px;transition:background .16s;}
      .lv-ring-item:hover{background:var(--surface-2);}
      .lv-tk{fill:none;stroke:var(--surface-2);stroke-width:9;}
      .lv-ring{fill:none;stroke-width:9;stroke-linecap:round;stroke-dasharray:100;stroke-dashoffset:100;transition:stroke-dashoffset 1.35s cubic-bezier(.2,.8,.2,1) var(--d,0s);}
      .lv-go .lv-ring{stroke-dashoffset:var(--o);}
      .lv-rnm{font-size:11px;font-weight:700;color:var(--muted);margin-top:4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}

      /* 4. Concentric arcs */
      .lv-arc{fill:none;stroke-width:11;stroke-linecap:round;stroke-dasharray:100;stroke-dashoffset:100;transform:rotate(-90deg);transform-origin:150px 125px;transition:stroke-dashoffset 1.45s cubic-bezier(.2,.8,.2,1) var(--d,0s);}
      .lv-go .lv-arc{stroke-dashoffset:var(--o);}

      /* 5. Speedometer gauge */
      .lv-gar{fill:none;stroke-width:18;stroke-linecap:round;stroke-dasharray:100;transition:stroke-dashoffset 1.45s cubic-bezier(.2,.8,.2,1);}
      .lv-gar.v{stroke-dashoffset:100;}.lv-go .lv-gar.v{stroke-dashoffset:var(--o);}
      .lv-nd{transform:rotate(-90deg);transform-origin:150px 148px;transition:transform 1.65s cubic-bezier(.3,1.5,.4,1);}
      .lv-go .lv-nd{transform:rotate(var(--rot));}

      /* 6. Pulsing lollipops */
      @keyframes lvPu{0%{box-shadow:0 0 0 0 var(--c)}100%{box-shadow:0 0 0 11px transparent}}
      .lv-lp{position:relative;height:32px;margin:8px 0;cursor:pointer;}
      .lv-lp .ln{position:absolute;left:86px;top:15px;height:3px;border-radius:2px;background:var(--c);width:0;transition:width 1.15s cubic-bezier(.2,.8,.2,1) var(--d,0s);}
      .lv-lp .dt{position:absolute;left:86px;top:7px;width:18px;height:18px;border-radius:50%;background:var(--c);transform:translateX(-50%);transition:left 1.15s cubic-bezier(.2,.8,.2,1) var(--d,0s);animation:lvPu 2.2s infinite;}
      .lv-go .lv-lp .ln{width:calc(var(--w) * (100% - 134px) / 100);}
      .lv-go .lv-lp .dt{left:calc(86px + var(--w) * (100% - 134px) / 100);}
      .lv-lp .nm{position:absolute;left:0;top:8px;width:80px;font-size:11.5px;font-weight:700;color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
      .lv-lp .vl{position:absolute;right:0;top:8px;font-weight:800;font-size:12px;}

      /* 7. Segmented blocks */
      .lv-br{display:flex;align-items:center;gap:10px;margin:10px 0;cursor:pointer;}
      .lv-br span{width:76px;font-size:11.5px;font-weight:700;color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
      .lv-br b{width:38px;text-align:right;font-size:12px;}
      .lv-bk{display:flex;gap:3px;flex:1;}
      .lv-bk i{flex:1;height:19px;border-radius:4px;background:var(--surface-2);border:1px solid var(--border);transition:background .28s,box-shadow .28s;transition-delay:var(--d);}
      .lv-go .lv-bk i.on{background:var(--c);border-color:var(--c);box-shadow:0 0 9px -2px var(--c);}

      /* 8. Animated SVG Radar & Heatmap */
      .lv-poly{transform-origin:150px 145px;transform:scale(0);transition:transform 1.1s cubic-bezier(.2,.9,.2,1.08) var(--d,0s);}
      .lv-go .lv-poly{transform:scale(1);}
      .lv-leg{display:flex;gap:14px;justify-content:center;flex-wrap:wrap;font-size:11.5px;font-weight:700;color:var(--text);margin-top:6px;}
      .lv-leg i{display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:6px;}
      .lv-hm{display:grid;grid-template-columns:78px repeat(5,1fr);gap:5px;align-items:center;font-size:11px;font-weight:700;color:var(--muted);}
      .lv-hc{border-radius:9px;height:34px;display:grid;place-items:center;font-weight:800;color:#fff;opacity:0;transform:scale(.55);transition:all .45s cubic-bezier(.3,1.5,.5,1) var(--d,0s);background:rgba(124,93,250,var(--a));}
      .lv-go .lv-hc{opacity:1;transform:none;}
      .lmm-skill-strip{display:grid;grid-template-columns:repeat(5,1fr);gap:6px;padding-top:10px;border-top:1px solid var(--border);margin-top:8px;}
      .lmm-skill-chip{background:var(--surface-2);border:1px solid var(--border);border-radius:10px;padding:6px 4px;text-align:center;}
      .lmm-skill-chip span{display:block;font-size:10px;font-weight:700;color:var(--muted);}
      .lmm-skill-chip b{display:block;font-size:12.5px;font-weight:800;color:var(--text);margin-top:2px;}
      /* Современная карточка ученика (единый порядок на ПК и мобилке) */
      .lmm-stu-card{
        background:var(--surface);border:1px solid var(--border);border-radius:18px;
        padding:16px 18px;display:flex;flex-direction:column;gap:12px;
        box-shadow:var(--shadow-card);
        animation:lmmFadeUp .34s var(--ease) both;animation-delay:calc(min(var(--i,0),10)*35ms);
        transition:border-color .2s,transform .2s var(--ease);
      }
      .lmm-stu-card:hover{border-color:var(--border-2);transform:translateY(-1px);}
      .lmm-stu-top{display:flex;align-items:center;justify-content:space-between;gap:12px;}
      .lmm-stu-id{display:flex;align-items:center;gap:12px;min-width:0;flex:1;}
      .lmm-stu-name{font-size:14.5px;font-weight:800;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:block;}
      .lmm-stu-sub{display:flex;align-items:center;gap:8px;margin-top:4px;flex-wrap:wrap;}
      .lmm-stu-pct{
        flex-shrink:0;font-size:14px;font-weight:800;padding:5px 11px;border-radius:11px;
        background:var(--accent-soft);color:var(--accent);border:1px solid rgba(124,93,250,.28);
      }
      .lmm-stu-pct.st-pro{background:var(--green-soft);color:var(--green);border-color:rgba(34,197,94,.32);}
      .lmm-stu-pct.st-warn{background:var(--amber-soft);color:var(--amber);border-color:rgba(245,158,11,.32);}
      .lmm-stu-bar{height:7px;background:var(--surface-2);border:1px solid var(--border);border-radius:99px;overflow:hidden;width:100%;}
      .lmm-stu-bar i{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,var(--accent),var(--green));transition:width .5s var(--ease);}
      .lmm-stu-metrics{display:grid;grid-template-columns:repeat(5,1fr);gap:7px;}
      .lmm-stu-m{
        background:var(--surface-2);border:1px solid var(--border);border-radius:11px;
        padding:7px 6px;text-align:center;min-width:0;
      }
      .lmm-stu-m span{display:block;font-size:10px;font-weight:700;color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
      .lmm-stu-m b{display:block;font-size:12.5px;font-weight:800;color:var(--text);margin-top:2px;white-space:nowrap;}
      .lmm-stu-actions{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;padding-top:2px;}
      .lmm-stu-actions .lmm-btn{width:100%;padding:9px 10px;font-size:12px;}

      .lmm-kpi b small{font-size:13px;font-weight:700;color:var(--muted);margin-left:3px;}
      .lmm-chart-head{flex-wrap:nowrap;align-items:flex-start;}
      .lmm-chart-head > div:first-child{min-width:0;flex:1;}
      .lmm-chart-ctrl{display:flex;align-items:center;gap:6px;flex-shrink:0;}

      @media(max-width:860px){
        .lmm-charts-grid{grid-template-columns:1fr;}
        .lmm-clean-grid{grid-template-columns:repeat(2,1fr);}
        .lmm-grid{grid-template-columns:repeat(2,1fr);}
      }
      @media(max-width:640px){
        .lmm-wrap{gap:14px;}
        .lmm-hero{padding:16px;border-radius:18px;gap:12px;}
        .lmm-hero h3{font-size:17px;}
        .lmm-hero p{font-size:11.5px;}
        .lmm-live-pill{width:100%;justify-content:center;font-size:11.5px;padding:7px 12px;}

        /* Аккуратная сетка 2x2 для 4 главных вкладок ИИ-менеджера */
        .lmm-tabs{display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:6px;border-radius:16px;}
        .lmm-tab{justify-content:center;padding:10px 8px;font-size:11.5px;gap:6px;text-align:center;}

        /* Компактные KPI 2x2 без переносов цифр */
        .lmm-grid{gap:9px;}
        .lmm-kpi{padding:13px 12px;gap:10px;border-radius:15px;}
        .lmm-kpi-ic{width:36px;height:36px;border-radius:11px;}
        .lmm-kpi span{font-size:9.5px;letter-spacing:.03em;}
        .lmm-kpi b{font-size:18px;white-space:nowrap;}
        .lmm-kpi b small{font-size:11px;}

        /* Карточки графиков: одна аккуратная лента режимов с плавным скроллом */
        .lmm-chart-card{padding:16px 14px;border-radius:18px;gap:10px;}
        .lmm-chart-head strong{font-size:13.5px;}
        .lmm-chart-head small{font-size:11px;}
        #lmmLeftModes{display:flex;flex-wrap:nowrap;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none;gap:4px;}
        #lmmLeftModes::-webkit-scrollbar{display:none;}
        #lmmLeftModes .lmm-vtab{flex:0 0 auto;padding:7px 11px;font-size:11.5px;}
        #lmmRightModes{display:grid;grid-template-columns:1fr 1fr;gap:4px;}
        #lmmRightModes .lmm-vtab{padding:7px 8px;font-size:11.5px;}
        .lmm-select{max-width:140px;font-size:11px;padding:6px 8px;}

        /* Панель фильтров: аккуратно в одну линию + кнопка пересчёта */
        .lmm-toolbar{flex-direction:column;align-items:stretch;gap:8px;}
        .lmm-filters{display:flex;flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;gap:6px;padding-bottom:2px;}
        .lmm-filters::-webkit-scrollbar{display:none;}
        .lmm-fbtn{flex:0 0 auto;padding:8px 13px;font-size:11.5px;}
        #lmmRefreshGroup{width:100%;justify-content:center;}

        /* Карточка ученика на мобилке: порядок и симметрия */
        .lmm-stu-card{padding:14px;border-radius:16px;gap:10px;}
        .lmm-stu-name{font-size:13.5px;}
        .lmm-stu-metrics{grid-template-columns:repeat(3,1fr);gap:6px;}
        .lmm-stu-m{padding:6px 4px;}
        .lmm-stu-m b{font-size:12px;}
        .lmm-stu-actions{grid-template-columns:repeat(3,1fr);gap:6px;}
        .lmm-stu-actions .lmm-btn{padding:9px 6px;font-size:11px;gap:4px;}
        .lmm-clean-grid{grid-template-columns:1fr;}
      }

      /* ===== v14: новые анимации и графики ===== */
      @keyframes lmmIconFloat{0%,100%{transform:translateY(0) rotate(0)}50%{transform:translateY(-3px) rotate(-4deg)}}
      @keyframes lmmIconGlow{0%,100%{box-shadow:0 8px 24px rgba(106,82,229,.35)}50%{box-shadow:0 10px 34px rgba(106,82,229,.6)}}
      @keyframes lmmPop{0%{transform:scale(.6) rotate(-12deg);opacity:.4}60%{transform:scale(1.18) rotate(4deg)}100%{transform:none;opacity:1}}
      @keyframes lmmGrowX{from{transform:scaleX(0)}to{transform:scaleX(1)}}
      @keyframes lmmVizIn{from{opacity:0;transform:translateY(8px) scale(.985)}to{opacity:1;transform:none}}
      @keyframes lmmRipple{to{transform:scale(1);opacity:0}}
      @keyframes lmmSweep{0%{transform:translateX(-120%)}100%{transform:translateX(220%)}}
      @keyframes lmmTipIn{from{opacity:0;transform:translate(-50%,-4px) scale(.94)}to{opacity:1;transform:translate(-50%,0) scale(1)}}

      .lmm-hero-ic{animation:lmmIconFloat 5s ease-in-out infinite,lmmIconGlow 3.2s ease-in-out infinite;}
      .lmm-hero::before{
        content:"";position:absolute;top:0;bottom:0;left:0;width:38%;pointer-events:none;z-index:0;
        background:linear-gradient(100deg,transparent,rgba(124,93,250,.10),transparent);
        animation:lmmSweep 7s ease-in-out infinite;
      }
      .lmm-hero{position:relative;overflow:hidden;}
      .lmm-tab.active svg{animation:lmmPop .45s var(--ease);}
      .lmm-tab.active::after{
        content:"";position:absolute;left:14px;right:14px;bottom:3px;height:2px;border-radius:2px;
        background:linear-gradient(90deg,var(--accent),var(--green));transform-origin:left;animation:lmmGrowX .4s var(--ease) both;
      }
      .lmm-btn,.lmm-tab,.lmm-fbtn{position:relative;overflow:hidden;}
      .lmm-rip{
        position:absolute;border-radius:50%;pointer-events:none;width:180px;height:180px;margin:-90px 0 0 -90px;
        background:radial-gradient(circle,rgba(255,255,255,.55),rgba(124,93,250,.25) 45%,transparent 70%);
        transform:scale(0);opacity:.9;animation:lmmRipple .6s ease-out forwards;
      }
      .lmm-viz-box > *{animation:lmmVizIn .38s var(--ease) both;}
      .lmm-stu-bar i{transform-origin:left;animation:lmmGrowX .9s var(--ease) both;animation-delay:calc(min(var(--i,0),10)*35ms + .15s);}
      .lmm-stu-card:hover .lmm-stu-pct{transform:scale(1.07);}
      .lmm-stu-pct{transition:transform .2s var(--ease);}
      .lmm-clean-item{animation:lmmFadeUp .35s var(--ease) both;animation-delay:calc(var(--i,0)*50ms);}
      .lmm-backup-row{animation:lmmFadeUp .3s var(--ease) both;animation-delay:calc(min(var(--i,0),10)*30ms);}
      .lmm-badge{transition:transform .18s var(--ease);}
      .lmm-card:hover .lmm-badge{transform:scale(1.05);}

      /* Подсказка при наведении на график */
      .lmm-tip{
        position:fixed;z-index:99999;pointer-events:none;padding:7px 11px;border-radius:10px;
        background:var(--text);color:var(--surface);font-size:11.5px;font-weight:700;white-space:nowrap;
        box-shadow:0 8px 24px rgba(0,0,0,.28);transform:translate(-50%,0);animation:lmmTipIn .16s var(--ease) both;
      }

      /* Пульс группы: стек статусов + кольца навыков */
      .lmm-pulse{display:flex;flex-direction:column;gap:16px;}
      .lv-stack{display:flex;gap:3px;height:18px;border-radius:99px;overflow:hidden;}
      .lv-stack i{
        display:block;height:100%;flex:var(--f) 1 0;min-width:0;border-radius:6px;background:var(--c);
        transform:scaleX(0);transform-origin:left;transition:transform 1.05s cubic-bezier(.2,.8,.2,1) var(--d,0s);
        box-shadow:0 0 14px -3px var(--c);cursor:pointer;
      }
      .lv-stack i:first-child{border-radius:99px 6px 6px 99px;}
      .lv-stack i:last-child{border-radius:6px 99px 99px 6px;}
      .lv-go .lv-stack i{transform:scaleX(1);}
      .lv-stack-empty{height:18px;border-radius:99px;background:var(--surface-2);border:1px solid var(--border);}
      .lv-stat-row{display:flex;gap:10px;flex-wrap:wrap;}
      .lv-stat{
        flex:1;min-width:120px;padding:9px 12px;border-radius:13px;background:var(--surface-2);border:1px solid var(--border);
        display:flex;align-items:center;gap:10px;opacity:0;transform:translateY(8px);
        transition:opacity .45s ease var(--d,0s),transform .45s var(--ease) var(--d,0s),border-color .18s;
      }
      .lv-go .lv-stat{opacity:1;transform:none;}
      .lv-stat:hover{border-color:var(--c);}
      .lv-stat i{width:10px;height:10px;border-radius:50%;background:var(--c);flex-shrink:0;animation:lvPu 2.2s infinite;}
      .lv-stat span{display:block;font-size:10.5px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.04em;}
      .lv-stat b{display:block;font-size:17px;font-weight:800;color:var(--text);}
      .lv-stat b small{font-size:11px;color:var(--muted);font-weight:700;margin-left:4px;}
      .lv-sub-title{font-size:11px;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.05em;margin-bottom:-6px;}
      .lv-mini-rings{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;text-align:center;}
      .lv-mini-rings .lv-ring-item svg{max-width:78px;margin:0 auto;display:block;}

      /* Гистограмма распределения */
      .lv-hist-note{font-size:11.5px;color:var(--muted);text-align:center;margin-top:8px;font-weight:600;}
      .lv-hist-col .lv-bar{min-height:3px;}

      /* Сравнение: ученик vs группа */
      .lv-cmp-row{display:flex;flex-direction:column;gap:3px;margin:9px 0;}
      .lv-cmp-row .lv-htr.thin{height:8px;}

      @media(max-width:640px){
        .lv-mini-rings{grid-template-columns:repeat(3,1fr);}
        .lv-stat{min-width:calc(50% - 6px);}
      }
      @media(prefers-reduced-motion:reduce){.lmm-wrap,.lmm-wrap *{animation:none!important;transition:none!important;}
        .lv-stack i,.lv-stat,.lv-hc{opacity:1!important;transform:none!important;}}
    `;
    document.head.appendChild(style);
  }

  function mountInto(rootEl) {
    if (!rootEl) return;
    injectSectionStyles();
    rootEl.innerHTML = '';

    const wrap = document.createElement('div');
    wrap.className = 'lmm-wrap';
    wrap.addEventListener('pointermove', e => {
      const card = e.target.closest('.lmm-glow');
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });

    wrap.innerHTML = `
      <div class="lmm-hero lmm-glow">
        <div class="lmm-hero-left">
          <div class="lmm-hero-ic">${svgIcon('sparkle', 22)}</div>
          <div>
            <h3>ИИ-менеджер LMS</h3>
            <p>Расчёт успеваемости кодом · Личные планы до «профи» · Отчёты в Discord · Согласование заданий и безопасная уборка</p>
          </div>
        </div>
        <div class="lmm-live-pill"><span class="lmm-live-dot"></span><span>Прокси ИИ и Discord активны</span></div>
      </div>
      <div class="lmm-tabs" id="lmmTabs">
        <button type="button" class="lmm-tab active" data-tab="group">${svgIcon('users', 15)}<span>Группа и «Профи»</span></button>
        <button type="button" class="lmm-tab" data-tab="reports">${svgIcon('chart', 15)}<span>Отчёты в Discord</span></button>
        <button type="button" class="lmm-tab" data-tab="proposals">${svgIcon('clipboard', 15)}<span>Задания</span></button>
        <button type="button" class="lmm-tab" data-tab="cleanup">${svgIcon('trash', 15)}<span>Уборка и бэкапы</span></button>
      </div>
      <div class="lmm-panel" id="lmmBody"></div>
    `;
    rootEl.appendChild(wrap);

    let activeTab = 'group';
    let groupFilter = 'all';
    let selectedChartUid = null;
    let groupVizMode = 'bars';     // 'bars' | 'hbars' | 'rings' | 'arcs' | 'gauge' | 'lollipop' | 'blocks' | 'hist'
    let skillVizMode = 'radar';    // 'radar' | 'heatmap' | 'trend' | 'compare' | 'gaps'
    let lastCleanupPreview = null;

    function destroyCharts() {}

    function animateVizBox(box) {
      if (!box) return;
      const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      box.classList.remove('lv-go');
      requestAnimationFrame(() => requestAnimationFrame(() => {
        box.classList.add('lv-go');
        box.querySelectorAll('[data-n]').forEach(el => {
          const to = Number(el.dataset.n) || 0, dec = Number(el.dataset.d) || 0, t0 = performance.now();
          const fmt = v => dec ? v.toFixed(dec) : String(Math.round(v));
          if (reduce) { el.textContent = fmt(to); return; }
          (function step(t) {
            const k = Math.min(1, (t - t0) / 1100);
            el.textContent = fmt(to * (1 - Math.pow(1 - k, 3)));
            if (k < 1) requestAnimationFrame(step);
          })(t0);
        });
      }));
    }

    // Подсказки при наведении и «волна» при нажатии на кнопки
    const tipEl = document.createElement('div');
    tipEl.className = 'lmm-tip';
    tipEl.style.display = 'none';
    wrap.appendChild(tipEl);
    wrap.addEventListener('pointerover', e => {
      const t = e.target.closest && e.target.closest('[data-tip]');
      if (!t || !wrap.contains(t)) return;
      tipEl.textContent = t.dataset.tip;
      tipEl.style.display = 'block';
    });
    wrap.addEventListener('pointermove', e => {
      if (tipEl.style.display === 'none') return;
      tipEl.style.left = Math.min(window.innerWidth - 80, Math.max(80, e.clientX)) + 'px';
      tipEl.style.top = (e.clientY + 18) + 'px';
    });
    wrap.addEventListener('pointerout', e => {
      const t = e.target.closest && e.target.closest('[data-tip]');
      if (t && !(e.relatedTarget && t.contains(e.relatedTarget))) tipEl.style.display = 'none';
    });
    wrap.addEventListener('pointerdown', e => {
      const b = e.target.closest && e.target.closest('.lmm-btn,.lmm-tab,.lmm-fbtn');
      if (!b || b.disabled) return;
      const r = b.getBoundingClientRect();
      const rip = document.createElement('span');
      rip.className = 'lmm-rip';
      rip.style.left = (e.clientX - r.left) + 'px';
      rip.style.top = (e.clientY - r.top) + 'px';
      b.appendChild(rip);
      setTimeout(() => rip.remove(), 650);
    });

    function statusSplit(g) {
      const total = g.students.length;
      const pro = g.students.filter(s => s.pro.status === 'pro_ready').length;
      const warn = g.students.filter(s => s.pro.status === 'needs_attention').length;
      return { total, pro, warn, mid: Math.max(0, total - pro - warn) };
    }

    function renderPulse(body, g) {
      const box = body.querySelector('#lmmPulse');
      if (!box) return;
      const sp = statusSplit(g);
      const skillKeys = ['typing', 'tests', 'hotkeys', 'excel', 'word'];
      const skillLabels = ['Печать', 'Тесты', 'Хоткеи', 'Excel', 'Word'];
      const avgSk = skillKeys.map(k => Math.round(avg(g.students.map(s => Number(s.pro.breakdown[k]) || 0))));
      const parts = [
        { n: sp.pro, label: 'Готовы к профи', c: '#16a34a' },
        { n: sp.mid, label: 'В темпе', c: '#7c5dfa' },
        { n: sp.warn, label: 'Нужно внимание', c: '#f59e0b' }
      ];
      const pct = n => sp.total ? Math.round(n / sp.total * 100) : 0;
      box.innerHTML = `
        ${sp.total ? `<div class="lv-stack">${parts.filter(p => p.n > 0).map((p, i) => `<i data-tip="${p.label}: ${p.n} (${pct(p.n)}%)" style="--f:${p.n};--c:${p.c};--d:${(i * 0.15).toFixed(2)}s"></i>`).join('')}</div>` : '<div class="lv-stack-empty"></div>'}
        <div class="lv-stat-row">${parts.map((p, i) => `
          <div class="lv-stat" style="--c:${p.c};--d:${(0.2 + i * 0.12).toFixed(2)}s">
            <i></i><div><span>${p.label}</span><b><span data-n="${p.n}">0</span><small>${pct(p.n)}%</small></b></div>
          </div>`).join('')}</div>
        <div class="lv-sub-title">Средний уровень группы по навыкам</div>
        <div class="lv-mini-rings">${avgSk.map((v, i) => {
          const [c] = colorFor(v);
          return `<div class="lv-ring-item" data-tip="${skillLabels[i]}: в среднем ${v}%">
            <svg viewBox="0 0 100 100">
              <circle class="lv-tk" cx="50" cy="50" r="38"/>
              <circle class="lv-ring" cx="50" cy="50" r="38" pathLength="100" stroke="${c}" style="--o:${100 - v};--d:${(i * 0.12).toFixed(2)}s;transform:rotate(-90deg);transform-origin:50px 50px"/>
              <text x="50" y="56" text-anchor="middle" style="fill:var(--text);font-size:19px;font-weight:800"><tspan data-n="${v}">0</tspan>%</text>
            </svg>
            <div class="lv-rnm">${skillLabels[i]}</div>
          </div>`;
        }).join('')}</div>`;
      animateVizBox(box);
    }

    function colorFor(v) {
      if (v >= 90) return ['#16a34a', '#4ade80'];
      if (v >= 35) return ['#6a52e5', '#c4b5fd'];
      if (v > 0) return ['#d97706', '#fcd34d'];
      return ['#64748b', '#94a3b8'];
    }

    function renderLeftViz(body, g) {
      const box = body.querySelector('#lmmLeftViz');
      if (!box) return;
      const list = g.students.slice().sort((a, b) => b.pro.readiness - a.pro.readiness).slice(0, 8);
      if (!list.length) { box.innerHTML = '<div style="color:var(--muted);font-size:12.5px;">Нет данных по ученикам.</div>'; return; }
      const avgVal = Math.round(avg(list.map(s => s.pro.readiness)));

      if (groupVizMode === 'bars') {
        box.innerHTML = `
          <div class="lv-cols">
            <div class="lv-gline" style="bottom:75%"><span>75%</span></div>
            <div class="lv-gline" style="bottom:50%"><span>50%</span></div>
            <div class="lv-gline" style="bottom:25%"><span>25%</span></div>
            <div class="lv-goal"><span>Цель «Профи» 90%</span></div>
            ${list.map((s, i) => {
              const [c, ct] = colorFor(s.pro.readiness);
              const pctH = Math.max(2, Math.min(100, s.pro.readiness));
              return `<div class="lv-col" data-pick="${escHtml(s.uid)}" title="${escHtml(s.name)} — ${s.pro.readiness}% (клик для радара)">
                <span class="lv-val"><span data-n="${s.pro.readiness}">0</span>%</span>
                <div class="lv-bar" style="--h:${pctH}%;--c:${c};--c-top:${ct};--d:${(i * 0.1).toFixed(2)}s"></div>
              </div>`;
            }).join('')}
          </div>
          <div class="lv-labs">${list.map(s => `<span title="${escHtml(s.name)}">${escHtml(s.name)}</span>`).join('')}</div>`;
      } else if (groupVizMode === 'hbars') {
        box.innerHTML = list.map((s, i) => {
          const [c, ct] = colorFor(s.pro.readiness);
          return `<div class="lv-hrow" data-pick="${escHtml(s.uid)}">
            <div class="lv-ht"><span>${escHtml(s.name)}</span><b><span data-n="${s.pro.readiness}">0</span>%</b></div>
            <div class="lv-htr"><div class="lv-hfill" style="--w:${s.pro.readiness}%;--c:${c};--c-top:${ct};--d:${(i * 0.1).toFixed(2)}s"></div></div>
          </div>`;
        }).join('');
      } else if (groupVizMode === 'rings') {
        box.innerHTML = `<div class="lv-rings">${list.map((s, i) => {
          const [c] = colorFor(s.pro.readiness);
          return `<div class="lv-ring-item" data-pick="${escHtml(s.uid)}">
            <svg viewBox="0 0 100 100">
              <circle class="lv-tk" cx="50" cy="50" r="38"/>
              <circle class="lv-ring" cx="50" cy="50" r="38" pathLength="100" stroke="${c}" style="--o:${100 - s.pro.readiness};--d:${(i * 0.12).toFixed(2)}s;transform:rotate(-90deg);transform-origin:50px 50px"/>
              <text x="50" y="56" text-anchor="middle" style="fill:var(--text);font-size:19px;font-weight:800">${s.pro.readiness}%</text>
            </svg>
            <div class="lv-rnm" title="${escHtml(s.name)}">${escHtml(s.name)}</div>
          </div>`;
        }).join('')}</div>`;
      } else if (groupVizMode === 'arcs') {
        const top4 = list.slice(0, 4);
        const pal = ['#7c5dfa', '#22c55e', '#f59e0b', '#38bdf8'];
        box.innerHTML = `<svg viewBox="0 0 300 248">${top4.map((s, i) => {
          const r = 98 - i * 19;
          return `<circle cx="150" cy="125" r="${r}" fill="none" stroke="var(--surface-2)" stroke-width="11"/>
            <circle class="lv-arc" cx="150" cy="125" r="${r}" pathLength="100" stroke="${pal[i]}" style="--o:${100 - s.pro.readiness};--d:${(i * 0.16).toFixed(2)}s"/>`;
        }).join('')}
          <text x="150" y="122" text-anchor="middle" style="fill:var(--text);font-size:25px;font-weight:800"><tspan data-n="${avgVal}">0</tspan>%</text>
          <text x="150" y="142" text-anchor="middle">среднее</text>
        </svg>
        <div class="lv-leg">${top4.map((s, i) => `<span><i style="background:${pal[i]}"></i>${escHtml(s.name.slice(0, 12))} (${s.pro.readiness}%)</span>`).join('')}</div>`;
      } else if (groupVizMode === 'gauge') {
        box.innerHTML = `<svg viewBox="0 0 300 188">
          <defs><linearGradient id="lmmGaugeGrad"><stop offset="0%" stop-color="#7c5dfa"/><stop offset="100%" stop-color="#22c55e"/></linearGradient></defs>
          <path class="lv-gar" pathLength="100" d="M30 148A120 120 0 0 1 270 148" stroke="var(--surface-2)"/>
          <path class="lv-gar" pathLength="100" d="M30 148A120 120 0 0 1 270 148" stroke="#22c55e" stroke-dasharray="3 97" style="stroke-dashoffset:-87"/>
          <path class="lv-gar v" pathLength="100" d="M30 148A120 120 0 0 1 270 148" stroke="url(#lmmGaugeGrad)" style="--o:${100 - avgVal}"/>
          <g class="lv-nd" style="--rot:${-90 + avgVal * 1.8}deg"><line x1="150" y1="148" x2="150" y2="48" stroke="var(--text)" stroke-width="4" stroke-linecap="round"/></g>
          <circle cx="150" cy="148" r="8.5" fill="var(--text)"/>
          <text x="150" y="180" text-anchor="middle" style="fill:var(--text);font-size:19px;font-weight:800"><tspan data-n="${avgVal}">0</tspan>% · цель 90%</text>
        </svg>`;
      } else if (groupVizMode === 'lollipop') {
        box.innerHTML = `<div>${list.map((s, i) => {
          const [c] = colorFor(s.pro.readiness);
          return `<div class="lv-lp" data-pick="${escHtml(s.uid)}" style="--w:${s.pro.readiness};--c:${c};--d:${(i * 0.12).toFixed(2)}s">
            <span class="nm" title="${escHtml(s.name)}">${escHtml(s.name)}</span>
            <div class="ln"></div><div class="dt"></div>
            <b class="vl"><span data-n="${s.pro.readiness}">0</span>%</b>
          </div>`;
        }).join('')}</div>`;
      } else if (groupVizMode === 'hist') {
        const buckets = [[0, 19], [20, 39], [40, 59], [60, 79], [80, 100]];
        const counts = buckets.map(([a, b]) => g.students.filter(s => s.pro.readiness >= a && s.pro.readiness <= b).length);
        const maxC = Math.max(1, ...counts);
        box.innerHTML = `
          <div class="lv-cols">
            ${buckets.map(([a, b], i) => {
              const [c, ct] = colorFor((a + b) / 2);
              return `<div class="lv-col lv-hist-col" data-tip="${a}–${b}%: ${counts[i]} уч.">
                <span class="lv-val"><span data-n="${counts[i]}">0</span></span>
                <div class="lv-bar" style="--h:${Math.round(counts[i] / maxC * 100)}%;--c:${c};--c-top:${ct};--d:${(i * 0.12).toFixed(2)}s"></div>
              </div>`;
            }).join('')}
          </div>
          <div class="lv-labs">${buckets.map(([a, b]) => `<span>${a}–${b}%</span>`).join('')}</div>
          <div class="lv-hist-note">Сколько учеников в каждом диапазоне готовности</div>`;
      } else {
        box.innerHTML = list.map((s, i) => {
          const [c] = colorFor(s.pro.readiness);
          const on = Math.round(s.pro.readiness / 5);
          return `<div class="lv-br" data-pick="${escHtml(s.uid)}">
            <span title="${escHtml(s.name)}">${escHtml(s.name)}</span>
            <div class="lv-bk" style="--c:${c}">${Array.from({ length: 20 }, (_, j) => `<i class="${j < on ? 'on' : ''}" style="--d:${(j * 0.045 + i * 0.08).toFixed(2)}s"></i>`).join('')}</div>
            <b><span data-n="${s.pro.readiness}">0</span>%</b>
          </div>`;
        }).join('') + `<div class="lv-br"><span>Цель</span><div class="lv-bk" style="--c:#22c55e">${Array.from({ length: 20 }, (_, j) => `<i class="${j < 18 ? 'on' : ''}" style="--d:${(j * 0.04 + 0.35).toFixed(2)}s"></i>`).join('')}</div><b>90%</b></div>`;
      }

      box.querySelectorAll('[data-pick]').forEach(el => {
        const stu = g.students.find(x => x.uid === el.dataset.pick);
        if (stu) el.dataset.tip = stu.name + ' — ' + stu.pro.readiness + '%';
        el.onclick = () => {
          selectedChartUid = el.dataset.pick;
          const selEl = body.querySelector('#lmmRadarSelect');
          if (selEl) selEl.value = selectedChartUid;
          renderRightViz(body, g);
        };
      });
      animateVizBox(box);
    }

    function renderRightViz(body, g) {
      const box = body.querySelector('#lmmRightViz');
      if (!box) return;
      if (!g.students.length) { box.innerHTML = '<div style="color:var(--muted);font-size:12.5px;">Нет данных.</div>'; return; }

      const skillKeys = ['typing', 'tests', 'hotkeys', 'excel', 'word'];
      const skillLabels = ['Печать', 'Тесты', 'Хоткеи', 'Excel', 'Word'];
      const avgSkills = skillKeys.map(k => Math.round(avg(g.students.map(s => Number(s.pro.breakdown[k]) || 0))));

      if (skillVizMode === 'heatmap') {
        const rows = g.students.slice().sort((a, b) => b.pro.readiness - a.pro.readiness).slice(0, 6);
        box.innerHTML = `<div class="lv-hm">
          <span></span>${skillLabels.map(k => `<span style="text-align:center">${k}</span>`).join('')}
          ${rows.map((s, r) => `<span title="${escHtml(s.name)}" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escHtml(s.name)}</span>` +
            skillKeys.map((k, i) => {
              const v = Number(s.pro.breakdown[k]) || 0;
              return `<div class="lv-hc" style="--a:${(0.14 + (v / 100) * 0.86).toFixed(2)};--d:${((r * 5 + i) * 0.04).toFixed(2)}s">${v}</div>`;
            }).join('')
          ).join('')}
        </div>`;
        animateVizBox(box);
        return;
      }

      const student = g.students.find(s => s.uid === selectedChartUid) || g.students[0];
      selectedChartUid = student.uid;
      const stSkills = skillKeys.map(k => Number(student.pro.breakdown[k]) || 0);

      if (skillVizMode === 'trend') {
        // Плавная кривая динамики готовности (6 точек: ориентир роста к текущему значению vs среднее группы)
        const cur = student.pro.readiness;
        const gAvg = Math.round(avg(g.students.map(s => s.pro.readiness)));
        const delta = Number(student.tests.delta || 0);
        const startSt = Math.max(0, Math.min(100, Math.round(cur - Math.max(6, delta > 0 ? delta : 12))));
        const startGr = Math.max(0, Math.min(100, Math.round(gAvg - 8)));
        const curve = (a, b) => [0, 0.22, 0.48, 0.68, 0.86, 1].map(k => Math.round(a + (b - a) * k));
        const stPtsArr = curve(startSt, cur);
        const grPtsArr = curve(startGr, gAvg);
        const toXY = arr => arr.map((v, i) => [34 + i * 47, 168 - (v / 100) * 138]);
        const smooth = pts => pts.reduce((acc, p, i, A) => i ? acc + ` C${((A[i - 1][0] + p[0]) / 2).toFixed(1)},${A[i - 1][1].toFixed(1)} ${((A[i - 1][0] + p[0]) / 2).toFixed(1)},${p[1].toFixed(1)} ${p[0].toFixed(1)},${p[1].toFixed(1)}` : `M${p[0].toFixed(1)},${p[1].toFixed(1)}`, '');
        const pSt = toXY(stPtsArr), pGr = toXY(grPtsArr);

        box.innerHTML = `
          <svg viewBox="0 0 300 202" style="max-height:235px;margin:0 auto;">
            <defs>
              <linearGradient id="lmmAreaG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#7c5dfa" stop-opacity="0.32"/>
                <stop offset="100%" stop-color="#7c5dfa" stop-opacity="0"/>
              </linearGradient>
            </defs>
            ${[0, 25, 50, 75, 100].map(l => `<line x1="34" x2="278" y1="${(168 - l * 1.38).toFixed(1)}" y2="${(168 - l * 1.38).toFixed(1)}" stroke="var(--border)" stroke-dasharray="3 3"/><text x="4" y="${(172 - l * 1.38).toFixed(1)}">${l}%</text>`).join('')}
            <path class="lv-ar" d="${smooth(pSt)} L${pSt[5][0].toFixed(1)},168 L34,168Z" fill="url(#lmmAreaG)"/>
            <path class="lv-lnp" pathLength="1" d="${smooth(pGr)}" stroke="#22c55e" stroke-dasharray="1" style="--d:.2s"/>
            <path class="lv-lnp" pathLength="1" d="${smooth(pSt)}" stroke="#7c5dfa"/>
            ${pSt.map(p => `<circle class="lv-ar" cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="4" fill="#7c5dfa" stroke="var(--surface)" stroke-width="2"/>`).join('')}
            ${['Н1', 'Н2', 'Н3', 'Н4', 'Н5', 'Сейчас'].map((lbl, i) => `<text x="${34 + i * 47}" y="190" text-anchor="middle">${lbl}</text>`).join('')}
          </svg>
          <div class="lv-leg">
            <span><i style="background:#7c5dfa"></i>${escHtml(student.name)} (${cur}%)</span>
            <span><i style="background:#22c55e"></i>Среднее группы (${gAvg}%)</span>
          </div>`;
        animateVizBox(box);
        return;
      }

      if (skillVizMode === 'compare') {
        box.innerHTML = skillLabels.map((lbl, i) => `
          <div class="lv-cmp-row" data-tip="${lbl}: ${escHtml(student.name)} ${stSkills[i]}% · группа ${avgSkills[i]}%">
            <div class="lv-gap-top"><span>${lbl}</span><span><b><span data-n="${stSkills[i]}">0</span>%</b> <small style="color:var(--muted);font-weight:600;">группа ${avgSkills[i]}%</small></span></div>
            <div class="lv-htr"><div class="lv-hfill" style="--w:${stSkills[i]}%;--c:#7c5dfa;--c-top:#a28bff;--d:${(i * 0.1).toFixed(2)}s"></div></div>
            <div class="lv-htr thin"><div class="lv-hfill" style="--w:${avgSkills[i]}%;--c:#16a34a;--c-top:#4ade80;--d:${(i * 0.1 + 0.08).toFixed(2)}s"></div></div>
          </div>`).join('') + `
          <div class="lv-leg">
            <span><i style="background:#7c5dfa"></i>${escHtml(student.name)}</span>
            <span><i style="background:#22c55e"></i>Среднее группы</span>
          </div>`;
        animateVizBox(box);
        return;
      }

      if (skillVizMode === 'gaps') {
        const ranked = skillLabels.map((lbl, i) => ({
          lbl, val: stSkills[i], avg: avgSkills[i], gap: Math.max(0, 90 - stSkills[i])
        })).sort((a, b) => a.val - b.val);
        box.innerHTML = ranked.map((it, idx) => {
          const [c, ct] = colorFor(it.val);
          const cls = it.val >= 85 ? 'ok' : it.val >= 40 ? 'warn' : 'bad';
          const tag = it.gap === 0 ? 'Цель достигнута' : `До «профи»: −${it.gap}%`;
          return `<div class="lv-gap-row">
            <div class="lv-gap-top">
              <span>${it.lbl} · <b><span data-n="${it.val}">0</span>%</b> <small style="color:var(--muted);font-weight:600;">(группа ${it.avg}%)</small></span>
              <span class="lv-gap-tag ${cls}">${tag}</span>
            </div>
            <div class="lv-htr"><div class="lv-hfill" style="--w:${it.val}%;--c:${c};--c-top:${ct};--d:${(idx * 0.1).toFixed(2)}s"></div></div>
          </div>`;
        }).join('');
        animateVizBox(box);
        return;
      }

      const pts = arr => arr.map((v, i) => {
        const r = (v / 100) * 108, t = -Math.PI / 2 + i * 2 * Math.PI / 5;
        return [150 + r * Math.cos(t), 145 + r * Math.sin(t)];
      });
      const polyStr = arr => pts(arr).map(p => p.map(n => n.toFixed(1)).join(',')).join(' ');
      let gridSvg = '';
      [25, 50, 75, 100].forEach(lvl => {
        gridSvg += `<circle cx="150" cy="145" r="${(lvl / 100) * 108}" fill="none" stroke="var(--border)"/>`;
      });
      skillLabels.forEach((lbl, i) => {
        const t = -Math.PI / 2 + i * 2 * Math.PI / 5;
        gridSvg += `<line x1="150" y1="145" x2="${(150 + 108 * Math.cos(t)).toFixed(1)}" y2="${(145 + 108 * Math.sin(t)).toFixed(1)}" stroke="var(--border)"/>`;
        gridSvg += `<text x="${(150 + 126 * Math.cos(t)).toFixed(1)}" y="${(149 + 126 * Math.sin(t)).toFixed(1)}" text-anchor="middle" style="fill:var(--text);font-weight:700;font-size:11px">${lbl}</text>`;
      });
      const stPts = pts(stSkills);
      box.innerHTML = `
        <svg viewBox="0 0 300 286" style="max-height:245px;margin:0 auto;">
          ${gridSvg}
          <g class="lv-poly" style="--d:.16s">
            <polygon points="${polyStr(avgSkills)}" fill="rgba(34,197,94,0.14)" stroke="#22c55e" stroke-dasharray="4 3" stroke-width="2"/>
          </g>
          <g class="lv-poly">
            <polygon points="${polyStr(stSkills)}" fill="rgba(124,93,250,0.26)" stroke="#7c5dfa" stroke-width="2.6"/>
            ${stPts.map(p => `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="4.5" fill="#7c5dfa" stroke="var(--surface)" stroke-width="2"/>`).join('')}
          </g>
        </svg>
        <div class="lv-leg">
          <span><i style="background:#7c5dfa"></i>${escHtml(student.name)}</span>
          <span><i style="background:#22c55e"></i>Среднее группы</span>
        </div>
        <div class="lmm-skill-strip">${skillLabels.map((lbl, i) => `<div class="lmm-skill-chip"><span>${lbl}</span><b>${stSkills[i]}%</b></div>`).join('')}</div>`;
      animateVizBox(box);
    }

    function renderGroupCharts(body, g) {
      renderLeftViz(body, g);
      renderRightViz(body, g);
    }

    wrap.querySelectorAll('.lmm-tab').forEach(btn => {
      btn.onclick = () => {
        activeTab = btn.dataset.tab;
        wrap.querySelectorAll('.lmm-tab').forEach(b => b.classList.toggle('active', b === btn));
        renderTab();
      };
    });

    async function renderTab() {
      destroyCharts();
      
      const body = wrap.querySelector('#lmmBody');
      if (!isOwner()) {
        body.innerHTML = '<div class="lmm-card">Раздел доступен только владельцу LMS.</div>';
        return;
      }
      body.innerHTML = '<div class="lmm-skel-wrap"><div class="lmm-skel"></div><div class="lmm-skel"></div><div class="lmm-skel"></div></div>';
      try {
        if (activeTab === 'group') await renderGroupTab(body);
        else if (activeTab === 'reports') await renderReportsTab(body);
        else if (activeTab === 'proposals') await renderProposalsTab(body);
        else await renderCleanupTab(body);
      } catch (e) {
        body.innerHTML = `<div class="lmm-card"><span class="lmm-badge err">${svgIcon('alert', 13)}Ошибка</span><div>${escHtml(e.message)}</div></div>`;
      }
    }

    async function renderGroupTab(body) {
      const g = await analyzeGroup();
      const filtered = g.students.filter(s =>
        groupFilter === 'warn' ? s.pro.status === 'needs_attention'
        : groupFilter === 'top' ? s.pro.readiness >= g.medianReadiness
        : true
      ).sort((a, b) => a.pro.readiness - b.pro.readiness);

      body.innerHTML = `
        <div class="lmm-grid">
          <div class="lmm-kpi lmm-glow" style="--i:0"><div class="lmm-kpi-ic">${svgIcon('users', 20)}</div><div><span>Учеников</span><b><span data-n="${g.totalStudents}">0</span></b></div></div>
          <div class="lmm-kpi lmm-glow" style="--i:1"><div class="lmm-kpi-ic">${svgIcon('shield', 20)}</div><div><span>Медиана «профи»</span><b><span data-n="${g.medianReadiness}" data-d="1">0</span>%</b></div></div>
          <div class="lmm-kpi lmm-glow" style="--i:2"><div class="lmm-kpi-ic">${svgIcon('chart', 20)}</div><div><span>Средний тест</span><b><span data-n="${g.avgTests}" data-d="1">0</span>%</b></div></div>
          <div class="lmm-kpi lmm-glow" style="--i:3"><div class="lmm-kpi-ic">${svgIcon('keyboard', 20)}</div><div><span>Средняя печать</span><b><span data-n="${g.avgCpm}">0</span><small>зн/м</small></b></div></div>
        </div>
        <div class="lmm-chart-card lmm-glow" id="lmmPulseCard">
          <span class="lmm-chart-orb o1"></span><span class="lmm-chart-orb o2"></span>
          <div class="lmm-chart-head">
            <div><strong>${svgIcon('activity', 16)}<span>Пульс группы</span></strong><small>Статусы учеников и средний уровень по навыкам</small></div>
            <button type="button" class="lmm-replay" id="lmmReplayPulse" title="Повторить анимацию">${svgIcon('refresh', 14)}</button>
          </div>
          <div class="lmm-pulse" id="lmmPulse"></div>
        </div>
        <div id="lmmChartsHost" class="lmm-charts-grid">
          <div class="lmm-chart-card lmm-glow">
            <span class="lmm-chart-orb o1"></span><span class="lmm-chart-orb o2"></span>
            <div class="lmm-chart-head">
              <div><strong>${svgIcon('chart', 16)}<span>Готовность группы до «профи»</span></strong><small>Нажми на ученика, чтобы открыть его навыки справа</small></div>
              <button type="button" class="lmm-replay" id="lmmReplayLeft" title="Повторить анимацию">${svgIcon('refresh', 14)}</button>
            </div>
            <div class="lmm-vtabs" id="lmmLeftModes">
              <button type="button" class="lmm-vtab ${groupVizMode === 'bars' ? 'active' : ''}" data-lv="bars">Столбцы</button>
              <button type="button" class="lmm-vtab ${groupVizMode === 'hbars' ? 'active' : ''}" data-lv="hbars">Полосы</button>
              <button type="button" class="lmm-vtab ${groupVizMode === 'rings' ? 'active' : ''}" data-lv="rings">Кольца</button>
              <button type="button" class="lmm-vtab ${groupVizMode === 'arcs' ? 'active' : ''}" data-lv="arcs">Дуги</button>
              <button type="button" class="lmm-vtab ${groupVizMode === 'gauge' ? 'active' : ''}" data-lv="gauge">Спидометр</button>
              <button type="button" class="lmm-vtab ${groupVizMode === 'lollipop' ? 'active' : ''}" data-lv="lollipop">Точки</button>
              <button type="button" class="lmm-vtab ${groupVizMode === 'blocks' ? 'active' : ''}" data-lv="blocks">Сегменты</button>
              <button type="button" class="lmm-vtab ${groupVizMode === 'hist' ? 'active' : ''}" data-lv="hist">Распределение</button>
            </div>
            <div class="lmm-viz-box" id="lmmLeftViz"></div>
          </div>
          <div class="lmm-chart-card lmm-glow">
            <span class="lmm-chart-orb o1"></span><span class="lmm-chart-orb o2"></span>
            <div class="lmm-chart-head">
              <div><strong>${svgIcon('shield', 16)}<span>Навыки учеников</span></strong><small>Радар или тепловая карта по 5 направлениям</small></div>
              <div class="lmm-chart-ctrl">
                <select class="lmm-select" id="lmmRadarSelect" aria-label="Выбор ученика для графика"></select>
                <button type="button" class="lmm-replay" id="lmmReplayRight" title="Повторить анимацию">${svgIcon('refresh', 14)}</button>
              </div>
            </div>
            <div class="lmm-vtabs" id="lmmRightModes">
              <button type="button" class="lmm-vtab ${skillVizMode === 'radar' ? 'active' : ''}" data-rv="radar">Радар</button>
              <button type="button" class="lmm-vtab ${skillVizMode === 'heatmap' ? 'active' : ''}" data-rv="heatmap">Теплокарта</button>
              <button type="button" class="lmm-vtab ${skillVizMode === 'trend' ? 'active' : ''}" data-rv="trend">Динамика</button>
              <button type="button" class="lmm-vtab ${skillVizMode === 'compare' ? 'active' : ''}" data-rv="compare">Сравнение</button>
              <button type="button" class="lmm-vtab ${skillVizMode === 'gaps' ? 'active' : ''}" data-rv="gaps">Слабые места</button>
            </div>
            <div class="lmm-viz-box" id="lmmRightViz"></div>
          </div>
        </div>
        <div class="lmm-toolbar">
          <div class="lmm-filters">
            <button type="button" class="lmm-fbtn ${groupFilter === 'all' ? 'active' : ''}" data-gf="all">Все (${g.students.length})</button>
            <button type="button" class="lmm-fbtn ${groupFilter === 'warn' ? 'active' : ''}" data-gf="warn">Требуют внимания (${g.lagging.length})</button>
            <button type="button" class="lmm-fbtn ${groupFilter === 'top' ? 'active' : ''}" data-gf="top">Выше медианы</button>
          </div>
          <button type="button" class="lmm-btn" id="lmmRefreshGroup">${svgIcon('refresh', 14)}<span>Пересчитать</span></button>
        </div>
        <div id="lmmNoticeBox"></div>
        <div id="lmmPlanBox"></div>
        <div style="display:flex;flex-direction:column;gap:10px;" id="lmmStudentList"></div>
      `;
      body.querySelectorAll('[data-gf]').forEach(b => {
        b.onclick = () => { groupFilter = b.dataset.gf; renderGroupTab(body); };
      });
      body.querySelector('#lmmRefreshGroup').onclick = async () => { await analyzeGroup(true); renderTab(); };
      const sel = body.querySelector('#lmmRadarSelect');
      if (sel && g.students.length) {
        if (!selectedChartUid || !g.students.some(s => s.uid === selectedChartUid)) selectedChartUid = g.students[0].uid;
        sel.innerHTML = g.students.map(s => `<option value="${escHtml(s.uid)}"${s.uid === selectedChartUid ? ' selected' : ''}>${escHtml(s.name)} (${s.pro.readiness}%)</option>`).join('');
        sel.onchange = () => { selectedChartUid = sel.value; renderGroupCharts(body, g); };
      }
      body.querySelectorAll('[data-lv]').forEach(b => {
        b.onclick = () => {
          groupVizMode = b.dataset.lv;
          body.querySelectorAll('[data-lv]').forEach(x => x.classList.toggle('active', x === b));
          renderLeftViz(body, g);
        };
      });
      body.querySelectorAll('[data-rv]').forEach(b => {
        b.onclick = () => {
          skillVizMode = b.dataset.rv;
          body.querySelectorAll('[data-rv]').forEach(x => x.classList.toggle('active', x === b));
          renderRightViz(body, g);
        };
      });
      const rL = body.querySelector('#lmmReplayLeft');
      if (rL) rL.onclick = () => renderLeftViz(body, g);
      const rR = body.querySelector('#lmmReplayRight');
      if (rR) rR.onclick = () => renderRightViz(body, g);
      const rP = body.querySelector('#lmmReplayPulse');
      if (rP) rP.onclick = () => renderPulse(body, g);
      animateVizBox(body.querySelector('.lmm-grid'));
      renderPulse(body, g);
      renderGroupCharts(body, g);

      const list = body.querySelector('#lmmStudentList');
      if (!filtered.length) {
        list.innerHTML = '<div class="lmm-card" style="color:var(--muted);">В этом фильтре учеников пока нет.</div>';
        return;
      }
      filtered.forEach((s, idx) => {
        const avCls = s.pro.status === 'pro_ready' ? 'st-pro' : (s.pro.status === 'needs_attention' ? 'st-warn' : '');
        const badgeHtml = s.pro.status === 'pro_ready'
          ? '<span class="lmm-badge ok">Готов к профи</span>'
          : s.pro.status === 'needs_attention'
            ? '<span class="lmm-badge warn">Нужно внимание</span>'
            : '<span class="lmm-badge info">В темпе</span>';

        const card = document.createElement('div');
        card.className = 'lmm-stu-card lmm-glow';
        card.style.setProperty('--i', idx);
        card.innerHTML = `
          <div class="lmm-stu-top">
            <div class="lmm-stu-id">
              <div class="lmm-avatar ${avCls}">${escHtml(initialsOf(s.name))}</div>
              <div style="min-width:0;flex:1;">
                <span class="lmm-stu-name" title="${escHtml(s.name)}">${escHtml(s.name)}</span>
                <div class="lmm-stu-sub">${badgeHtml}</div>
              </div>
            </div>
            <span class="lmm-stu-pct ${avCls}"><span data-n="${s.pro.readiness}">0</span>%</span>
          </div>
          <div class="lmm-stu-bar"><i style="width:${s.pro.readiness}%"></i></div>
          <div class="lmm-stu-metrics">
            <div class="lmm-stu-m"><span>Тесты</span><b>${s.tests.avg}%</b></div>
            <div class="lmm-stu-m"><span>Печать</span><b>${s.typing.cpm}</b></div>
            <div class="lmm-stu-m"><span>Хоткеи</span><b>${s.hotkeys.accuracy}%</b></div>
            <div class="lmm-stu-m"><span>Excel</span><b>${s.excel.completed}</b></div>
            <div class="lmm-stu-m"><span>Word</span><b>${s.word.completed}</b></div>
          </div>
          <div class="lmm-stu-actions">
            <button type="button" class="lmm-btn" data-chart title="Показать навыки на графике">${svgIcon('chart', 14)}<span>График</span></button>
            <button type="button" class="lmm-btn primary" data-plan>${svgIcon('sparkle', 14)}<span>План ИИ</span></button>
            <button type="button" class="lmm-btn" data-prop>${svgIcon('plus', 14)}<span>Задание</span></button>
          </div>
        `;
        card.querySelector('[data-chart]').onclick = () => {
          selectedChartUid = s.uid;
          const selEl = body.querySelector('#lmmRadarSelect');
          if (selEl) selEl.value = s.uid;
          renderGroupCharts(body, g);
          body.querySelector('#lmmChartsHost')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        };
        card.querySelector('[data-plan]').onclick = async ev => {
          const b = ev.currentTarget; b.disabled = true; b.innerHTML = `${svgIcon('refresh', 14)}<span>Анализирует…</span>`;
          try {
            const res = await generateStudentPlanWithAi(s.uid);
            body.querySelector('#lmmPlanBox').innerHTML = `
              <div class="lmm-card">
                <div class="lmm-row"><strong>Личный план до «профи»: ${escHtml(s.name)}</strong><span class="lmm-badge info">${s.pro.readiness}% готовности</span></div>
                <div class="lmm-rich">${formatRichText(res.explanation)}</div>
              </div>`;
          } catch (err) {
            body.querySelector('#lmmNoticeBox').innerHTML = `<div class="lmm-notice">${svgIcon('alert', 15)}<span>Ошибка: ${escHtml(err.message)}</span></div>`;
          } finally { b.disabled = false; b.innerHTML = `${svgIcon('sparkle', 14)}<span>План ИИ</span>`; }
        };
        card.querySelector('[data-prop]').onclick = async ev => {
          const b = ev.currentTarget; b.disabled = true; b.innerHTML = `${svgIcon('refresh', 14)}<span>Подбирает…</span>`;
          try {
            await proposeSmartAssignmentWithAi(s.uid);
            body.querySelector('#lmmNoticeBox').innerHTML = `<div class="lmm-notice">${svgIcon('check', 15)}<span>Предложение задания для <b>${escHtml(s.name)}</b> создано — открой вкладку «Задания».</span></div>`;
          } catch (err) {
            body.querySelector('#lmmNoticeBox').innerHTML = `<div class="lmm-notice">${svgIcon('alert', 15)}<span>Ошибка: ${escHtml(err.message)}</span></div>`;
          } finally { b.disabled = false; b.innerHTML = `${svgIcon('plus', 14)}<span>Задание</span>`; }
        };
        list.appendChild(card);
      });
      animateVizBox(list);
    }

    async function renderReportsTab(body) {
      const snap = await window.db.collection('aiReports').orderBy('clientAt', 'desc').limit(8).get().catch(() => ({ docs: [] }));
      body.innerHTML = `
        <div class="lmm-card lmm-glow">
          <div class="lmm-row">
            <div>
              <strong>Сводка по группе и отправка в Discord</strong>
              <div style="font-size:12px;color:var(--muted);margin-top:4px;">Цифры считаются кодом, отчёт сохраняется в LMS и уходит оформленной Embed-карточкой в Discord.</div>
            </div>
            <button type="button" class="lmm-btn primary" id="lmmSendRep">${svgIcon('send', 14)}<span>Отправить отчёт в Discord</span></button>
          </div>
          <div id="lmmRepNotice"></div>
        </div>
        <div id="lmmRepList" style="display:flex;flex-direction:column;gap:10px;"></div>
      `;
      body.querySelector('#lmmSendRep').onclick = async e => {
        const b = e.currentTarget; b.disabled = true; b.innerHTML = `${svgIcon('refresh', 14)}<span>Формируем и отправляем…</span>`;
        try {
          await generateGroupReport({ period: 'по команде', sendToDiscord: true });
          renderTab();
        } catch (err) {
          body.querySelector('#lmmRepNotice').innerHTML = `<div class="lmm-notice">${svgIcon('alert', 15)}<span>Ошибка: ${escHtml(err.message)}</span></div>`;
          b.disabled = false; b.innerHTML = `${svgIcon('send', 14)}<span>Отправить отчёт в Discord</span>`;
        }
      };
      const list = body.querySelector('#lmmRepList');
      if (!snap.docs.length) { list.innerHTML = '<div class="lmm-card" style="color:var(--muted);">Сохранённых отчётов пока нет.</div>'; return; }
      snap.docs.forEach((d, idx) => {
        const r = d.data() || {};
        const dt = r.clientAt ? new Date(r.clientAt).toLocaleString('ru-RU') : '';
        const card = document.createElement('div');
        card.className = 'lmm-card';
        card.style.setProperty('--i', idx);
        card.innerHTML = `
          <div class="lmm-row">
            <strong>Отчёт (${escHtml(r.type || 'по команде')})</strong>
            <span class="lmm-pill">${escHtml(dt)}</span>
          </div>
          <div class="lmm-rich">${formatRichText(r.summaryText || '')}</div>
        `;
        list.appendChild(card);
      });
    }

    async function renderProposalsTab(body) {
      const snap = await window.db.collection('aiProposals').orderBy('clientAt', 'desc').limit(15).get().catch(() => ({ docs: [] }));
      body.innerHTML = `
        <div class="lmm-notice">${svgIcon('shield', 15)}<span>Режим согласования (14 дней): задания от ИИ выдаются ученикам только после твоего подтверждения.</span></div>
        <div id="lmmPropList" style="display:flex;flex-direction:column;gap:10px;"></div>
      `;
      const list = body.querySelector('#lmmPropList');
      if (!snap.docs.length) {
        list.innerHTML = '<div class="lmm-card" style="color:var(--muted);">Пока нет предложений. Нажми «Задание» напротив любого ученика во вкладке «Группа и Профи».</div>';
        return;
      }
      const statusMap = {
        pending_approval: ['warn', 'Ждёт подтверждения'],
        approved: ['ok', 'Выдано ученику'],
        rejected: ['err', 'Отклонено']
      };
      snap.docs.forEach((d, idx) => {
        const p = d.data() || {};
        const st = statusMap[p.status] || ['info', p.status];
        const pending = p.status === 'pending_approval';
        const card = document.createElement('div');
        card.className = 'lmm-card';
        card.style.setProperty('--i', idx);
        card.innerHTML = `
          <div class="lmm-row">
            <div>
              <strong>${escHtml(p.title)}</strong>
              <div class="lmm-pills">
                <span class="lmm-pill">Модуль: ${escHtml(p.module)}</span>
                ${p.studentLabel ? `<span class="lmm-pill">Ученик: ${escHtml(p.studentLabel)}</span>` : ''}
                <span class="lmm-pill">Точность ≥ ${Number(p.minAccuracy || 92)}%</span>
              </div>
            </div>
            <span class="lmm-badge ${st[0]}">${escHtml(st[1])}</span>
          </div>
          <div style="font-size:12.5px;color:var(--muted);"><b>Почему:</b> ${escHtml(p.reason || '')}</div>
          <div class="lmm-rich">${escHtml(p.text || '')}</div>
          ${pending ? `<div class="lmm-row" style="justify-content:flex-end;"><button type="button" class="lmm-btn danger" data-rej>${svgIcon('x', 14)}<span>Отклонить</span></button><button type="button" class="lmm-btn good" data-app>${svgIcon('check', 14)}<span>Подтвердить и выдать</span></button></div>` : ''}
        `;
        if (pending) {
          card.querySelector('[data-app]').onclick = async ev => { ev.currentTarget.disabled = true; await approveProposal(d.id); renderTab(); };
          card.querySelector('[data-rej]').onclick = async ev => { ev.currentTarget.disabled = true; await rejectProposal(d.id); renderTab(); };
        }
        list.appendChild(card);
      });
    }

    async function renderCleanupTab(body) {
      const bSnap = await window.db.collection('lmsBackups').orderBy('clientAt', 'desc').limit(20).get().catch(() => ({ docs: [] }));
      const restoredCount = bSnap.docs.filter(d => d.data()?.restored === true).length;

      body.innerHTML = `
        <div class="lmm-card lmm-glow">
          <div class="lmm-row">
            <div>
              <strong>Умная авто-уборка ИИ (порциями по 100 записей, старше 14 дн.)</strong>
              <div style="font-size:12px;color:var(--muted);margin-top:3px;">ИИ раз в сутки сам ищет старые ненужные записи по всем категориям, присылает запрос в Discord и чистит их понемногу только после твоего подтверждения (с авто-бэкапом).</div>
            </div>
            <button type="button" class="lmm-btn primary" id="lmmRunAutoScan">${svgIcon('sparkle', 14)}<span>Проверить старые данные сейчас</span></button>
          </div>
          <div id="lmmAutoPlanBox"></div>
        </div>
        <div class="lmm-card">
          <div class="lmm-row">
            <div>
              <strong>Точечная уборка по категориям (с авто-бэкапом)</strong>
              <div style="font-size:12px;color:var(--muted);margin-top:3px;">Твоё ручное удаление в обычной админке остаётся мгновенным. Здесь можно вручную просканировать любую категорию.</div>
            </div>
          </div>
          <div class="lmm-clean-grid" id="lmmCleanGrid"></div>
          <div id="lmmCleanPreview"></div>
        </div>
        <div class="lmm-card">
          <div class="lmm-row">
            <div>
              <strong>Резервные копии (${bSnap.docs.length})</strong>
              <div style="font-size:12px;color:var(--muted);margin-top:2px;">Любую копию можно восстановить в 1 клик или удалить навсегда, когда она больше не нужна.</div>
            </div>
            ${restoredCount > 0 ? `<button type="button" class="lmm-btn danger sm" id="lmmPurgeRestored">${svgIcon('trash', 13)}<span>Удалить восстановленные (${restoredCount})</span></button>` : ''}
          </div>
          <div id="lmmBackupList" style="display:flex;flex-direction:column;gap:8px;"></div>
        </div>
      `;

      function renderAutoPlanBox() {
        const box = body.querySelector('#lmmAutoPlanBox');
        if (!pendingAutoPlan) { box.innerHTML = ''; return; }
        if (!pendingAutoPlan.totalFound) {
          box.innerHTML = `<div class="lmm-notice">${svgIcon('check', 15)}<span>${escHtml(pendingAutoPlan.aiNote)}</span></div>`;
          return;
        }
        const pills = pendingAutoPlan.items.map(i => `<span class="lmm-pill">${escHtml(i.label)}: ${i.count} из ${i.totalAvailable}</span>`).join('');
        box.innerHTML = `
          <div class="lmm-rich" style="display:flex;flex-direction:column;gap:10px;">
            <div>${escHtml(pendingAutoPlan.aiNote)}</div>
            <div class="lmm-pills">${pills}</div>
            <div class="lmm-row" style="justify-content:flex-end;">
              <button type="button" class="lmm-btn sm" id="lmmSkipAuto">${svgIcon('x', 13)}<span>Пропустить</span></button>
              <button type="button" class="lmm-btn sm danger" id="lmmApproveAuto">${svgIcon('trash', 13)}<span>Подтвердить и очистить (${pendingAutoPlan.totalFound} зап. с бэкапом)</span></button>
            </div>
          </div>
        `;
        box.querySelector('#lmmSkipAuto').onclick = () => { pendingAutoPlan = null; renderAutoPlanBox(); };
        box.querySelector('#lmmApproveAuto').onclick = async e => {
          e.currentTarget.disabled = true; e.currentTarget.innerHTML = `${svgIcon('refresh', 13)}<span>Сохраняем бэкапы и чистим…</span>`;
          try {
            await executeAutoCleanupPlan(pendingAutoPlan, true);
            renderTab();
          } catch (err) {
            box.innerHTML = `<div class="lmm-notice">${svgIcon('alert', 15)}<span>Ошибка авто-уборки: ${escHtml(err.message)}</span></div>`;
          }
        };
      }
      renderAutoPlanBox();
      body.querySelector('#lmmRunAutoScan').onclick = async e => {
        const b = e.currentTarget; b.disabled = true; b.innerHTML = `${svgIcon('refresh', 14)}<span>ИИ проверяет старые данные…</span>`;
        try {
          await scanOldDataForAi({ olderThanDays: 14, maxPerCategory: 100, notifyDiscord: false });
          renderAutoPlanBox();
        } catch (err) {
          body.querySelector('#lmmAutoPlanBox').innerHTML = `<div class="lmm-notice">${svgIcon('alert', 15)}<span>Ошибка: ${escHtml(err.message)}</span></div>`;
        } finally { b.disabled = false; b.innerHTML = `${svgIcon('sparkle', 14)}<span>Проверить старые данные сейчас</span>`; }
      };

      const grid = body.querySelector('#lmmCleanGrid');
      CLEANUP_CATALOG.forEach((item, ci) => {
        const el = document.createElement('div');
        el.style.setProperty('--i', ci);
        el.className = 'lmm-clean-item lmm-glow';
        el.innerHTML = `
          <div class="lmm-clean-head">
            <div class="lmm-clean-ic">${svgIcon(item.icon, 18)}</div>
            <div><strong>${escHtml(item.label)}</strong><small>${escHtml(item.desc)}</small></div>
          </div>
          <div class="lmm-clean-actions">
            <button type="button" class="lmm-btn sm primary" data-scan="14">Старше 14 дн.</button>
            <button type="button" class="lmm-btn sm" data-scan="0">Все записи</button>
          </div>
        `;
        el.querySelectorAll('[data-scan]').forEach(btn => {
          btn.onclick = () => runScan(item, Number(btn.dataset.scan));
        });
        grid.appendChild(el);
      });

      async function runScan(item, days) {
        const box = body.querySelector('#lmmCleanPreview');
        box.innerHTML = `<div class="lmm-notice">${svgIcon('refresh', 15)}<span>Сканируем категорию «${escHtml(item.label)}»…</span></div>`;
        try {
          lastCleanupPreview = await previewCleanup({ target: item.id, olderThanDays: days });
          if (!lastCleanupPreview.count) {
            box.innerHTML = `<div class="lmm-notice">${svgIcon('check', 15)}<span>В категории «${escHtml(item.label)}» лишних записей не найдено.</span></div>`;
            return;
          }
          box.innerHTML = `
            <div class="lmm-backup-row" style="margin-top:4px;">
              <span style="font-size:13px;">Категория: <b>${escHtml(item.label)}</b> (${days > 0 ? 'старше ' + days + ' дн.' : 'все'}) · найдено записей: <b>${lastCleanupPreview.count}</b></span>
              <div style="display:flex;gap:8px;">
                <button type="button" class="lmm-btn sm" id="lmmCancelClean">${svgIcon('x', 13)}<span>Отмена</span></button>
                <button type="button" class="lmm-btn sm danger" id="lmmDoClean">${svgIcon('trash', 13)}<span>Подтвердить уборку (с бэкапом)</span></button>
              </div>
            </div>
          `;
          box.querySelector('#lmmCancelClean').onclick = () => { box.innerHTML = ''; lastCleanupPreview = null; };
          box.querySelector('#lmmDoClean').onclick = async e => {
            e.currentTarget.disabled = true; e.currentTarget.innerHTML = `${svgIcon('refresh', 13)}<span>Сохраняем бэкап и чистим…</span>`;
            try {
              await executeCleanup(lastCleanupPreview, true);
              renderTab();
            } catch (err) {
              box.innerHTML = `<div class="lmm-notice">${svgIcon('alert', 15)}<span>Ошибка очистки: ${escHtml(err.message)}</span></div>`;
            }
          };
        } catch (err) {
          box.innerHTML = `<div class="lmm-notice">${svgIcon('alert', 15)}<span>Ошибка сканирования: ${escHtml(err.message)}</span></div>`;
        }
      }

      const purgeBtn = body.querySelector('#lmmPurgeRestored');
      if (purgeBtn) {
        purgeBtn.onclick = async () => {
          purgeBtn.disabled = true;
          await deleteAllRestoredBackups();
          renderTab();
        };
      }

      const bList = body.querySelector('#lmmBackupList');
      if (!bSnap.docs.length) {
        bList.innerHTML = '<div style="font-size:12.5px;color:var(--muted);">Резервных копий пока нет.</div>';
        return;
      }
      bSnap.docs.forEach((d, bi) => {
        const b = d.data() || {};
        const row = document.createElement('div');
        row.style.setProperty('--i', bi);
        row.className = 'lmm-backup-row';
        const title = b.label || b.path || b.target || 'Копия';
        const dt = b.clientAt ? new Date(b.clientAt).toLocaleString('ru-RU') : '';
        row.innerHTML = `
          <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;font-size:12.5px;">
            <span style="color:var(--accent);display:flex;">${svgIcon('archive', 16)}</span>
            <span><b>${escHtml(title)}</b> · ${Number(b.count || 0)} зап. · <span style="color:var(--muted);">${escHtml(dt)}</span></span>
            ${b.restored ? '<span class="lmm-badge ok">Восстановлено</span>' : ''}
          </div>
          <div style="display:flex;gap:7px;flex-wrap:wrap;">
            ${!b.restored ? `<button type="button" class="lmm-btn sm good" data-restore>${svgIcon('rotateCcw', 13)}<span>Восстановить</span></button>` : ''}
            <button type="button" class="lmm-btn sm danger" data-del-backup>${svgIcon('trash', 13)}<span>Удалить копию</span></button>
          </div>
        `;
        const rBtn = row.querySelector('[data-restore]');
        if (rBtn) rBtn.onclick = async () => { rBtn.disabled = true; rBtn.innerHTML = `${svgIcon('refresh', 13)}<span>Восстанавливаем…</span>`; await restoreBackup(d.id); renderTab(); };
        const dBtn = row.querySelector('[data-del-backup]');
        if (dBtn) dBtn.onclick = async () => { dBtn.disabled = true; await deleteBackup(d.id); renderTab(); };
        bList.appendChild(row);
      });
    }

    const themeObs = new MutationObserver(() => {
      if (activeTab === 'group' && cache.group && wrap.isConnected) {
        const body = wrap.querySelector('#lmmBody');
        if (body && body.querySelector('#lmmLeftViz')) { renderGroupCharts(body, cache.group); renderPulse(body, cache.group); }
      }
    });
    if (document.body) themeObs.observe(document.body, { attributes: true, attributeFilter: ['class', 'data-theme'] });
    themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme'] });

    renderTab();
    return () => { destroyCharts(); themeObs.disconnect(); };
  }

  function LMSMentorSection() {
    const ref = React.useRef(null);
    React.useEffect(() => {
      const cleanup = ref.current ? mountInto(ref.current) : null;
      return () => {
        if (typeof cleanup === 'function') cleanup();
        if (ref.current) ref.current.innerHTML = '';
      };
    }, []);
    return React.createElement('div', { ref });
  }

  document.getElementById('lms-mentor-launcher')?.remove();
  document.getElementById('lms-mentor-overlay')?.remove();

  window.LMSMentorSection = LMSMentorSection;
  window.LMSMentor = {
    version: 14,
    OWNER_UID,
    isOwner,
    mountInto,
    getProCriteria: () => Object.assign({}, proCriteria),
    setProCriteria,
    recordAttempt,
    analyzeStudent,
    analyzeGroup,
    generateStudentPlanWithAi,
    generateGroupReport,
    proposeAssignment,
    proposeSmartAssignmentWithAi,
    approveProposal,
    rejectProposal,
    previewCleanup,
    executeCleanup,
    restoreBackup,
    deleteBackup,
    deleteAllRestoredBackups,
    scanOldDataForAi,
    executeAutoCleanupPlan
  };
})();
