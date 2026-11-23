// 21_ai_mentor.js (v10) — Премиальный встроенный раздел «ИИ-менеджер» (без эмодзи, SVG-иконки, анимации, полная уборка + удаление бэкапов).
(function () {
  'use strict';
  if (window.LMSMentor && window.LMSMentor.version >= 10) return;

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
      .lmm-charts-grid{display:grid;grid-template-columns:1.15fr 1fr;gap:14px;}
      .lmm-chart-card{
        position:relative;overflow:hidden;
        background:var(--surface);border:1px solid var(--border);border-radius:20px;
        padding:20px 22px 18px;display:flex;flex-direction:column;gap:14px;
        box-shadow:var(--shadow-card);
        animation:lmmFadeUp .42s var(--ease) both;
        transition:border-color .2s,transform .2s var(--ease);
      }
      .lmm-chart-card::before{
        content:"";position:absolute;left:0;right:0;top:0;height:3px;
        background:linear-gradient(90deg,var(--accent),var(--green));opacity:.78;
      }
      .lmm-chart-card:hover{border-color:var(--border-2);}
      .lmm-chart-head{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;}
      .lmm-chart-head strong{font-size:14.5px;font-weight:800;display:inline-flex;align-items:center;gap:8px;letter-spacing:-.01em;}
      .lmm-chart-head small{display:block;font-size:11.5px;color:var(--muted);margin-top:3px;}
      .lmm-select{
        font:inherit;font-size:12px;font-weight:700;color:var(--text);
        background:var(--surface-2);border:1px solid var(--border-2);border-radius:11px;
        padding:8px 11px;max-width:215px;cursor:pointer;transition:border-color .16s;
      }
      .lmm-select:hover{border-color:var(--accent);}
      .lmm-chart-box{position:relative;height:278px;width:100%;}
      .lmm-skill-strip{
        display:grid;grid-template-columns:repeat(5,1fr);gap:6px;
        padding-top:10px;border-top:1px solid var(--border);
      }
      .lmm-skill-chip{
        background:var(--surface-2);border:1px solid var(--border);border-radius:10px;
        padding:6px 4px;text-align:center;
      }
      .lmm-skill-chip span{display:block;font-size:10px;font-weight:700;color:var(--muted);}
      .lmm-skill-chip b{display:block;font-size:13px;font-weight:800;color:var(--text);margin-top:2px;}
      @media(max-width:860px){.lmm-charts-grid{grid-template-columns:1fr;}.lmm-clean-grid{grid-template-columns:repeat(2,1fr);}.lmm-grid{grid-template-columns:repeat(2,1fr);}}
      @media(max-width:560px){.lmm-clean-grid{grid-template-columns:1fr;}.lmm-hero{padding:18px;}}
      @media(prefers-reduced-motion:reduce){.lmm-wrap,.lmm-wrap *{animation:none!important;transition:none!important;}}
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
    let lastCleanupPreview = null;
    let activeCharts = [];

    function destroyCharts() {
      activeCharts.forEach(ch => { try { ch.destroy(); } catch (_) {} });
      activeCharts = [];
    }

    function isDarkNow() {
      const r = document.documentElement, b = document.body;
      return b?.classList.contains('dark') || r.classList.contains('dark') || r.getAttribute('data-theme') === 'dark';
    }

    function renderGroupCharts(body, g) {
      destroyCharts();
      if (typeof window.Chart !== 'function') {
        const host = body.querySelector('#lmmChartsHost');
        if (host) host.innerHTML = '<div class="lmm-notice">Библиотека Chart.js не загрузилась — графики временно недоступны.</div>';
        return;
      }
      if (!g.students.length) return;

      const dark = isDarkNow();
      const gridColor = dark ? 'rgba(148,163,184,0.12)' : 'rgba(22,32,51,0.07)';
      const textColor = dark ? '#9fb0cf' : '#5b6b89';
      const titleColor = dark ? '#f1f5ff' : '#162033';
      const surfaceColor = dark ? '#151d30' : '#ffffff';

      const modernBarPlugin = {
        id: 'lmmModernBar',
        beforeDatasetsDraw(chart) {
          const c = chart.ctx;
          c.save();
          c.shadowColor = dark ? 'rgba(124,93,250,0.34)' : 'rgba(106,82,229,0.22)';
          c.shadowBlur = 14;
          c.shadowOffsetY = 6;
        },
        afterDatasetsDraw(chart) {
          const c = chart.ctx;
          c.restore();
          const { chartArea, scales } = chart;
          if (!chartArea || !scales?.y) return;

          const y90 = scales.y.getPixelForValue(90);
          c.save();
          c.beginPath();
          c.setLineDash([5, 5]);
          c.strokeStyle = dark ? 'rgba(52,211,153,0.55)' : 'rgba(22,163,74,0.48)';
          c.lineWidth = 1.4;
          c.moveTo(chartArea.left, y90);
          c.lineTo(chartArea.right, y90);
          c.stroke();
          c.setLineDash([]);
          c.fillStyle = dark ? '#34d399' : '#16a34a';
          c.font = '700 10.5px Montserrat, system-ui, sans-serif';
          c.textAlign = 'right';
          c.fillText('Цель «Профи» 90%', chartArea.right - 2, y90 - 5);

          const meta = chart.getDatasetMeta(0);
          c.fillStyle = titleColor;
          c.font = '800 11px Montserrat, system-ui, sans-serif';
          c.textAlign = 'center';
          meta.data.forEach((bar, i) => {
            const val = chart.data.datasets[0].data[i];
            const yPos = Math.max(chartArea.top + 12, bar.y - 7);
            c.fillText(val + '%', bar.x, yPos);
          });
          c.restore();
        }
      };

      const barCanvas = body.querySelector('#lmmBarChart');
      if (barCanvas) {
        const ctx2d = barCanvas.getContext('2d');
        const ordered = g.students.slice().sort((a, b) => b.pro.readiness - a.pro.readiness).slice(0, 12);

        const makeGrad = (topHex, botHex) => {
          const gr = ctx2d.createLinearGradient(0, 0, 0, 260);
          gr.addColorStop(0, topHex);
          gr.addColorStop(1, botHex);
          return gr;
        };
        const barFills = ordered.map(s =>
          s.pro.readiness >= 90 ? makeGrad('#34d399', 'rgba(16,185,129,0.55)')
          : s.pro.readiness >= 35 ? makeGrad('#a78bfa', 'rgba(106,82,229,0.62)')
          : makeGrad('#fbbf24', 'rgba(245,158,11,0.52)')
        );

        const barChart = new window.Chart(ctx2d, {
          type: 'bar',
          plugins: [modernBarPlugin],
          data: {
            labels: ordered.map(s => s.name.length > 13 ? s.name.slice(0, 12) + '…' : s.name),
            datasets: [{
              label: 'Готовность к «профи»',
              data: ordered.map(s => s.pro.readiness),
              backgroundColor: barFills,
              hoverBackgroundColor: ordered.map(s => s.pro.readiness >= 90 ? '#22c55e' : s.pro.readiness >= 35 ? '#7c5dfa' : '#f59e0b'),
              borderRadius: { topLeft: 10, topRight: 10, bottomLeft: 4, bottomRight: 4 },
              borderSkipped: false,
              maxBarThickness: 38
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 700, easing: 'easeOutQuart' },
            onClick: (_evt, els) => {
              if (!els || !els.length) return;
              const clicked = ordered[els[0].index];
              if (clicked) {
                selectedChartUid = clicked.uid;
                const selEl = body.querySelector('#lmmRadarSelect');
                if (selEl) selEl.value = clicked.uid;
                renderGroupCharts(body, g);
              }
            },
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: dark ? 'rgba(15,22,38,0.96)' : 'rgba(22,32,51,0.95)',
                titleColor: '#ffffff',
                bodyColor: '#dbe4ff',
                borderColor: 'rgba(124,93,250,0.45)',
                borderWidth: 1,
                padding: 12,
                cornerRadius: 12,
                displayColors: false,
                callbacks: {
                  title: items => ordered[items[0].dataIndex]?.name || '',
                  label: ctx => `Готовность к «профи»: ${ctx.raw}%`,
                  afterLabel: ctx => {
                    const st = ordered[ctx.dataIndex];
                    return st ? [`Тесты: ${st.tests.avg}%`, `Печать: ${st.typing.cpm} зн/мин`, 'Нажми, чтобы открыть в радаре'] : '';
                  }
                }
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                max: 105,
                border: { display: false },
                grid: { color: gridColor, drawTicks: false },
                ticks: { color: textColor, padding: 8, stepSize: 25, font: { family: 'Montserrat', size: 11, weight: '600' }, callback: v => v <= 100 ? v + '%' : '' }
              },
              x: {
                border: { display: false },
                grid: { display: false },
                ticks: { color: textColor, padding: 6, font: { family: 'Montserrat', size: 11, weight: '700' } }
              }
            }
          }
        });
        activeCharts.push(barChart);
      }

      const radarCanvas = body.querySelector('#lmmRadarChart');
      if (radarCanvas) {
        const rCtx = radarCanvas.getContext('2d');
        const student = g.students.find(s => s.uid === selectedChartUid) || g.students[0];
        selectedChartUid = student.uid;

        const skillKeys = ['typing', 'tests', 'hotkeys', 'excel', 'word'];
        const skillLabels = ['Печать', 'Тесты', 'Хоткеи', 'Excel', 'Word'];
        const avgSkills = skillKeys.map(k => Math.round(avg(g.students.map(s => Number(s.pro.breakdown[k]) || 0))));
        const stSkills = skillKeys.map(k => Number(student.pro.breakdown[k]) || 0);

        const radGrad = rCtx.createRadialGradient(140, 125, 10, 140, 125, 130);
        radGrad.addColorStop(0, dark ? 'rgba(167,139,250,0.44)' : 'rgba(106,82,229,0.34)');
        radGrad.addColorStop(1, dark ? 'rgba(124,93,250,0.08)' : 'rgba(106,82,229,0.06)');

        const radarChart = new window.Chart(rCtx, {
          type: 'radar',
          data: {
            labels: skillLabels,
            datasets: [
              {
                label: student.name,
                data: stSkills,
                fill: true,
                tension: 0.14,
                backgroundColor: radGrad,
                borderColor: '#7c5dfa',
                borderWidth: 2.5,
                pointBackgroundColor: '#7c5dfa',
                pointBorderColor: surfaceColor,
                pointBorderWidth: 2,
                pointRadius: 4.5,
                pointHoverRadius: 7
              },
              {
                label: 'Среднее группы',
                data: avgSkills,
                fill: true,
                tension: 0.14,
                backgroundColor: dark ? 'rgba(34,197,94,0.12)' : 'rgba(22,163,74,0.10)',
                borderColor: '#22c55e',
                borderWidth: 1.8,
                borderDash: [5, 4],
                pointBackgroundColor: '#22c55e',
                pointBorderColor: surfaceColor,
                pointBorderWidth: 1.5,
                pointRadius: 3.5,
                pointHoverRadius: 6
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 600, easing: 'easeOutQuart' },
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  color: titleColor,
                  usePointStyle: true,
                  pointStyle: 'circle',
                  boxWidth: 8,
                  padding: 14,
                  font: { family: 'Montserrat', size: 11.5, weight: '700' }
                }
              },
              tooltip: {
                backgroundColor: dark ? 'rgba(15,22,38,0.96)' : 'rgba(22,32,51,0.95)',
                borderColor: 'rgba(124,93,250,0.45)',
                borderWidth: 1,
                padding: 11,
                cornerRadius: 11,
                callbacks: { label: ctx => `${ctx.dataset.label}: ${ctx.raw}%` }
              }
            },
            scales: {
              r: {
                beginAtZero: true,
                max: 100,
                ticks: { stepSize: 25, display: false },
                grid: { circular: true, color: gridColor },
                angleLines: { color: gridColor },
                pointLabels: { color: titleColor, font: { family: 'Montserrat', size: 11.5, weight: '700' } }
              }
            }
          }
        });
        activeCharts.push(radarChart);

        const strip = body.querySelector('#lmmSkillStrip');
        if (strip) {
          strip.innerHTML = skillLabels.map((lbl, idx) =>
            `<div class="lmm-skill-chip"><span>${lbl}</span><b>${stSkills[idx]}%</b></div>`
          ).join('');
        }
      }
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
          <div class="lmm-kpi lmm-glow" style="--i:0"><div class="lmm-kpi-ic">${svgIcon('users', 20)}</div><div><span>Учеников</span><b>${g.totalStudents}</b></div></div>
          <div class="lmm-kpi lmm-glow" style="--i:1"><div class="lmm-kpi-ic">${svgIcon('shield', 20)}</div><div><span>Медиана «профи»</span><b>${g.medianReadiness}%</b></div></div>
          <div class="lmm-kpi lmm-glow" style="--i:2"><div class="lmm-kpi-ic">${svgIcon('chart', 20)}</div><div><span>Средний тест</span><b>${g.avgTests}%</b></div></div>
          <div class="lmm-kpi lmm-glow" style="--i:3"><div class="lmm-kpi-ic">${svgIcon('keyboard', 20)}</div><div><span>Средняя печать</span><b>${g.avgCpm} зн/м</b></div></div>
        </div>
        <div id="lmmChartsHost" class="lmm-charts-grid">
          <div class="lmm-chart-card lmm-glow">
            <div class="lmm-chart-head">
              <div><strong>${svgIcon('chart', 16)}<span>Готовность группы до «профи»</span></strong><small>Сравнение прогресса всех учеников (0–100%)</small></div>
            </div>
            <div class="lmm-chart-box"><canvas id="lmmBarChart"></canvas></div>
          </div>
          <div class="lmm-chart-card lmm-glow">
            <div class="lmm-chart-head">
              <div><strong>${svgIcon('shield', 16)}<span>Профиль навыков</span></strong><small>Ученик против среднего по группе</small></div>
              <select class="lmm-select" id="lmmRadarSelect" aria-label="Выбор ученика для графика"></select>
            </div>
            <div class="lmm-chart-box"><canvas id="lmmRadarChart"></canvas></div>
            <div class="lmm-skill-strip" id="lmmSkillStrip"></div>
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
        card.className = 'lmm-card lmm-glow';
        card.style.setProperty('--i', idx);
        card.innerHTML = `
          <div class="lmm-row">
            <div class="lmm-student-head">
              <div class="lmm-avatar ${avCls}">${escHtml(initialsOf(s.name))}</div>
              <div style="min-width:0;">
                <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                  <strong>${escHtml(s.name)}</strong>${badgeHtml}
                </div>
                <div class="lmm-pills">
                  <span class="lmm-pill">Тесты ${s.tests.avg}%</span>
                  <span class="lmm-pill">Печать ${s.typing.cpm} зн/м</span>
                  <span class="lmm-pill">Хоткеи ${s.hotkeys.accuracy}%</span>
                  <span class="lmm-pill">Excel ${s.excel.completed}</span>
                  <span class="lmm-pill">Word ${s.word.completed}</span>
                </div>
              </div>
            </div>
            <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
              <div class="lmm-prog-wrap">
                <b style="font-size:13px;">${s.pro.readiness}%</b>
                <div class="lmm-bar"><i style="width:${s.pro.readiness}%"></i></div>
              </div>
              <button type="button" class="lmm-btn" data-chart title="Показать навыки на графике">${svgIcon('chart', 14)}<span>График</span></button>
              <button type="button" class="lmm-btn primary" data-plan>${svgIcon('sparkle', 14)}<span>План ИИ</span></button>
              <button type="button" class="lmm-btn" data-prop>${svgIcon('plus', 14)}<span>Задание</span></button>
            </div>
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
      CLEANUP_CATALOG.forEach(item => {
        const el = document.createElement('div');
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
      bSnap.docs.forEach(d => {
        const b = d.data() || {};
        const row = document.createElement('div');
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
        if (body && body.querySelector('#lmmBarChart')) renderGroupCharts(body, cache.group);
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
    version: 10,
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
