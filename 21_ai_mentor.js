// 21_ai_mentor.js (v5) — Встроенный раздел «ИИ-менеджер» для Админки (6_admin.js) + аналитика кодом + Discord Embed-отчёты.
// Никаких плавающих кнопок в углу; чат поддержки студентов (16_ai_chat.js) и ручное удаление в админке не затрагиваются.
(function () {
  'use strict';
  if (window.LMSMentor && window.LMSMentor.version >= 5) return;

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
      .replace(/^[-•]\s+(.+)$/gm, '<div class="lmm-li"><span>•</span><span>$1</span></div>')
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

  // 3. Планы и красиво оформленные Embed-отчёты в Discord
  async function generateStudentPlanWithAi(targetUid) {
    requireOwner('личный план ученика');
    const [student, group] = await Promise.all([analyzeStudent(targetUid, true), analyzeGroup()]);
    const prompt =
      'Ты ИИ-методист Ultimate LMS. Все цифры ниже уже посчитаны кодом — НЕ выдумывай новых чисел.\n' +
      'Составь краткий, конкретный личный план для ученика до уровня «профи» (3–5 шагов, списком через дефис).\n' +
      'К КАЖДОЙ рекомендации коротко укажи «Почему: ...», опираясь на переданные факты. Без приветствий.\n' +
      'Ученик: ' + JSON.stringify(student) + '\n' +
      'Группа: ' + JSON.stringify({ medianReadiness: group.medianReadiness, avgTests: group.avgTests, avgCpm: group.avgCpm }) + '\n' +
      'Критерии «профи»: ' + JSON.stringify(proCriteria);

    const explanation = await callAi(prompt);
    return { student, explanation };
  }

  function buildReportEmbed(compact, aiText, periodLabel) {
    const color = compact.medianReadiness >= 70 ? 0x16a34a : (compact.medianReadiness >= 35 ? 0x6a52e5 : 0xf59e0b);
    const leadersText = compact.leaders.length
      ? compact.leaders.slice(0, 3).map((s, i) => `${['🥇', '🥈', '🥉'][i] || '•'} **${s.name}** — ${s.readiness}% профи · тесты ${s.testsAvg}% · ${s.cpm} зн/мин`).join('\n')
      : 'Пока нет данных';
    const laggingText = compact.lagging.length
      ? compact.lagging.slice(0, 4).map(s => `⚠️ **${s.name}** — ${s.readiness}% профи${s.inactiveDays != null && s.inactiveDays >= 3 ? ` · не заходил ${s.inactiveDays} дн.` : ''}`).join('\n')
      : '✅ Отстающих нет';

    return {
      username: 'Ultimate LMS · ИИ-отчёт',
      embeds: [{
        title: `📊 Сводка успеваемости LMS (${periodLabel})`,
        color,
        fields: [
          { name: '👥 Учеников', value: `**${compact.totalStudents}**`, inline: true },
          { name: '🎯 Медиана «профи»', value: `**${compact.medianReadiness}%**`, inline: true },
          { name: '📝 Тесты / ⌨️ Печать', value: `**${compact.avgTests}%** · **${compact.avgCpm} зн/мин**`, inline: true },
          { name: '🏆 Лидеры группы', value: leadersText.slice(0, 1000), inline: false },
          { name: '🚨 Требуют внимания', value: laggingText.slice(0, 1000), inline: false },
          { name: '🧠 Выводы и рекомендации ИИ', value: String(aiText || 'Нет текста').slice(0, 1020), inline: false }
        ],
        footer: { text: 'Ultimate LMS · Цифры рассчитаны кодом, рекомендации подготовлены ИИ' },
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
      'Ты ИИ-методист Ultimate LMS. Напиши ОЧЕНЬ краткую, деловую выжимку (до 700 символов) для Discord-карточки администратора строго по JSON ниже:\n' +
      '- 1–2 предложения про главную тенденцию группы;\n' +
      '- 3 конкретных шага на неделю списком через дефис с коротким «Почему: ...».\n' +
      'Без приветствий, без воды, без выдуманных цифр.\n' +
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
      'Верни СТРОГО чистый JSON без markdown: {"title":"короткое название до 60 символов","text":"короткий учебный текст на русском 45-65 слов без эмодзи (для typing) или чёткая инструкция (для других модулей)","reason":"почему выбрано это задание (1 предложение)"}.\n' +
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
      version: 3,
      assessmentVersion: 2,
      hotkeyBank: p.module === 'hotkeys' ? (p.hotkeyBank || 'any') : 'any',
      title: p.title,
      module: p.module,
      text: p.text || '',
      lang: p.lang || 'ru',
      minAccuracy: Number(p.minAccuracy) || 92,
      target: ['typing', 'word'].includes(p.module) ? 1 : (Number(p.target) || 5),
      wordLesson: p.module === 'word' ? (p.wordLesson || 'memo') : null,
      dueAt,
      studentIds: p.studentIds,
      studentNames,
      createdBy: OWNER_UID,
      sourceProposalId: proposalId,
      createdAt: serverTime(),
      status: 'assigned'
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

  // 5. Восстановимая уборка (только для уборки ИИ; ручное удаление админа не трогаем)
  async function previewCleanup(options = {}) {
    requireOwner('предпросмотр очистки');
    const target = options.target;
    const olderThanDays = Math.max(0, Number(options.olderThanDays || 0));
    const cutoff = olderThanDays > 0 ? Date.now() - olderThanDays * 86400000 : Infinity;
    let colRef;
    if (target === 'platformErrors') colRef = window.db.collection('platformErrors');
    else if (target === 'userActivity' && options.uid) colRef = window.db.collection('users').doc(options.uid).collection('activity');
    else if (target === 'userAttempts' && options.uid) colRef = window.db.collection('users').doc(options.uid).collection('attempts');
    else throw new Error('Неизвестная цель очистки.');

    const snap = await colRef.get();
    const matched = snap.docs.filter(d => {
      const data = d.data() || {};
      const ts = toMillis(data.at || data.clientAt);
      return olderThanDays === 0 || (ts > 0 && ts < cutoff);
    });
    return { target, uid: options.uid || null, olderThanDays, count: matched.length, ids: matched.map(d => d.id) };
  }

  async function executeCleanup(preview, confirmed) {
    requireOwner('выполнение очистки');
    if (confirmed !== true) throw new Error('Очистка отменена: требуется подтверждение администратора.');
    if (!preview || !Array.isArray(preview.ids) || !preview.ids.length) return { ok: true, deleted: 0, backupId: null };

    let colRef, pathLabel;
    if (preview.target === 'platformErrors') { colRef = window.db.collection('platformErrors'); pathLabel = 'platformErrors'; }
    else if (preview.target === 'userActivity' && preview.uid) { colRef = window.db.collection('users').doc(preview.uid).collection('activity'); pathLabel = 'users/' + preview.uid + '/activity'; }
    else if (preview.target === 'userAttempts' && preview.uid) { colRef = window.db.collection('users').doc(preview.uid).collection('attempts'); pathLabel = 'users/' + preview.uid + '/attempts'; }
    else throw new Error('Некорректные параметры очистки.');

    const records = [];
    for (const id of preview.ids) {
      const d = await colRef.doc(id).get();
      if (d.exists) records.push({ id: d.id, data: d.data() });
    }
    if (!records.length) return { ok: true, deleted: 0, backupId: null };

    const serialized = JSON.stringify(records);
    if (serialized.length > 850000) throw new Error('Слишком большой объём для одного бэкапа (>850 КБ). Укажите меньший период.');
    const backupRef = await window.db.collection('lmsBackups').add({
      path: pathLabel, count: records.length, createdAt: serverTime(), clientAt: Date.now(), restored: false, payloadJson: serialized
    });

    let deleted = 0;
    for (let i = 0; i < records.length; i += 400) {
      const batch = window.db.batch();
      records.slice(i, i + 400).forEach(r => batch.delete(colRef.doc(r.id)));
      await batch.commit();
      deleted += Math.min(400, records.length - i);
    }
    return { ok: true, deleted, backupId: backupRef.id };
  }

  async function restoreBackup(backupId) {
    requireOwner('восстановление копии');
    const bRef = window.db.collection('lmsBackups').doc(backupId);
    const snap = await bRef.get();
    if (!snap.exists) throw new Error('Резервная копия не найдена.');
    const b = snap.data();
    const records = JSON.parse(b.payloadJson || '[]');
    const parts = String(b.path || '').split('/');
    let colRef;
    if (parts.length === 1) colRef = window.db.collection(parts[0]);
    else if (parts.length === 3) colRef = window.db.collection(parts[0]).doc(parts[1]).collection(parts[2]);
    else throw new Error('Некорректный путь в резервной копии.');

    for (let i = 0; i < records.length; i += 400) {
      const batch = window.db.batch();
      records.slice(i, i + 400).forEach(r => batch.set(colRef.doc(r.id), reviveFirestoreTypes(r.data)));
      await batch.commit();
    }
    await bRef.update({ restored: true, restoredAt: serverTime() });
    return { ok: true, restoredCount: records.length };
  }

  function setProCriteria(patch) {
    requireOwner('настройка критериев «профи»');
    proCriteria = Object.assign({}, proCriteria, patch || {}, { confirmed: true });
    cache.group = null;
    cache.students.clear();
    return Object.assign({}, proCriteria);
  }

  // ---------------------------------------------------------------------------
  // 6. Встроенный раздел «ИИ-менеджер» для Админ-панели (без плавающих кнопок!)
  // ---------------------------------------------------------------------------
  function injectSectionStyles() {
    if (document.getElementById('lms-mentor-styles')) return;
    const style = document.createElement('style');
    style.id = 'lms-mentor-styles';
    style.textContent = `
      @keyframes lmmSpin{to{transform:rotate(360deg)}}
      @keyframes lmmIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}

      .lmm-wrap{
        --bg:transparent;--surface:#161e31;--surface-2:#101727;--border:#26324e;--border-2:#36466b;
        --text:#f1f5ff;--muted:#93a5c6;--accent:#7c5dfa;--accent-soft:rgba(124,93,250,.15);
        --green:#22c55e;--green-soft:rgba(34,197,94,.14);--amber:#f59e0b;--amber-soft:rgba(245,158,11,.15);
        --red:#ef4444;--red-soft:rgba(239,68,68,.14);
        display:flex;flex-direction:column;gap:18px;color:var(--text);
        font-family:Montserrat,system-ui,sans-serif;animation:lmmIn .25s ease both;
      }
      .lmm-wrap.lmm-light{
        --surface:#ffffff;--surface-2:#f2f5fb;--border:#dde3f0;--border-2:#c7d0e5;
        --text:#172033;--muted:#5c6b89;--accent:#6a52e5;--accent-soft:rgba(106,82,229,.10);
        --green:#16a34a;--green-soft:rgba(22,163,74,.11);--amber:#d97706;--amber-soft:rgba(217,119,6,.12);
        --red:#dc2626;--red-soft:rgba(220,38,38,.11);
      }
      .lmm-hero{
        display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;
        padding:22px 24px;border-radius:20px;border:1px solid var(--border);
        background:radial-gradient(ellipse at 95% 0%,var(--accent-soft),transparent 58%),var(--surface);
      }
      .lmm-hero-left{display:flex;align-items:center;gap:14px;}
      .lmm-hero-ic{
        width:46px;height:46px;border-radius:15px;display:grid;place-items:center;flex-shrink:0;
        background:linear-gradient(135deg,#7c5dfa,#5336d6);color:#fff;font-size:20px;
        box-shadow:0 8px 22px rgba(106,82,229,.3);
      }
      .lmm-hero h3{margin:0;font-size:19px;font-weight:800;letter-spacing:-.02em;}
      .lmm-hero p{margin:4px 0 0;font-size:12.5px;color:var(--muted);}

      .lmm-tabs{
        display:flex;gap:8px;flex-wrap:wrap;padding:6px;border-radius:16px;
        background:var(--surface);border:1px solid var(--border);
      }
      .lmm-tab{
        padding:10px 16px;border-radius:12px;border:1px solid transparent;
        background:transparent;color:var(--muted);font-weight:700;font-size:13px;
        cursor:pointer;display:inline-flex;align-items:center;gap:7px;transition:all .18s;
      }
      .lmm-tab:hover{background:var(--surface-2);color:var(--text);}
      .lmm-tab.active{background:var(--accent-soft);color:var(--accent);border-color:rgba(124,93,250,.3);}

      .lmm-panel{display:flex;flex-direction:column;gap:14px;}
      .lmm-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;}
      .lmm-kpi{
        background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:16px 18px;
        display:flex;flex-direction:column;gap:6px;
      }
      .lmm-kpi span{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--muted);}
      .lmm-kpi b{font-size:24px;font-weight:800;letter-spacing:-.02em;color:var(--text);}

      .lmm-toolbar{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;}
      .lmm-filters{display:flex;gap:6px;flex-wrap:wrap;}
      .lmm-fbtn{
        padding:7px 14px;border-radius:999px;border:1px solid var(--border);
        background:var(--surface);color:var(--muted);font-size:12px;font-weight:700;cursor:pointer;transition:all .15s;
      }
      .lmm-fbtn.active{background:var(--text);color:var(--surface);border-color:var(--text);}

      .lmm-card{
        background:var(--surface);border:1px solid var(--border);border-radius:18px;
        padding:16px 18px;display:flex;flex-direction:column;gap:12px;transition:border-color .18s;
      }
      .lmm-card:hover{border-color:var(--border-2);}
      .lmm-row{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;}

      .lmm-student-head{display:flex;align-items:center;gap:12px;min-width:0;}
      .lmm-avatar{
        width:42px;height:42px;border-radius:13px;flex-shrink:0;
        display:grid;place-items:center;font-weight:800;font-size:13px;
        background:var(--accent-soft);color:var(--accent);border:1.5px solid rgba(124,93,250,.3);
      }
      .lmm-avatar.st-pro{background:var(--green-soft);color:var(--green);border-color:rgba(34,197,94,.35);}
      .lmm-avatar.st-warn{background:var(--amber-soft);color:var(--amber);border-color:rgba(245,158,11,.35);}

      .lmm-pills{display:flex;gap:6px;flex-wrap:wrap;margin-top:5px;}
      .lmm-pill{
        font-size:11px;font-weight:700;padding:3px 9px;border-radius:8px;
        background:var(--surface-2);color:var(--muted);border:1px solid var(--border);
      }
      .lmm-badge{font-size:11px;font-weight:800;padding:4px 10px;border-radius:999px;}
      .lmm-badge.ok{background:var(--green-soft);color:var(--green);}
      .lmm-badge.warn{background:var(--amber-soft);color:var(--amber);}
      .lmm-badge.err{background:var(--red-soft);color:var(--red);}
      .lmm-badge.info{background:var(--accent-soft);color:var(--accent);}

      .lmm-prog-wrap{display:flex;align-items:center;gap:10px;}
      .lmm-bar{height:8px;background:var(--surface-2);border:1px solid var(--border);border-radius:99px;overflow:hidden;width:116px;}
      .lmm-bar i{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,#7c5dfa,#22c55e);transition:width .4s ease;}

      .lmm-btn{
        padding:9px 14px;border-radius:11px;border:1px solid var(--border-2);
        background:var(--surface-2);color:var(--text);font-weight:700;font-size:12px;
        cursor:pointer;display:inline-flex;align-items:center;gap:6px;transition:all .16s;
      }
      .lmm-btn:hover:not(:disabled){transform:translateY(-1px);border-color:var(--accent);}
      .lmm-btn.primary{background:linear-gradient(135deg,#7c5dfa,#5a3ed8);border-color:#5a3ed8;color:#fff;}
      .lmm-btn.good{background:var(--green);border-color:var(--green);color:#fff;}
      .lmm-btn.danger{background:var(--red-soft);border-color:var(--red);color:var(--red);}
      .lmm-btn.danger:hover:not(:disabled){background:var(--red);color:#fff;}
      .lmm-btn:disabled{opacity:.52;cursor:not-allowed;transform:none;}

      .lmm-rich{
        font-size:13px;line-height:1.68;color:var(--text);
        background:var(--surface-2);padding:15px 16px;border-radius:14px;border:1px solid var(--border);
      }
      .lmm-li{display:flex;gap:8px;margin:4px 0;}
      .lmm-li span:first-child{color:var(--accent);font-weight:800;}
      .lmm-notice{
        font-size:12.5px;font-weight:600;padding:11px 15px;border-radius:12px;
        background:var(--accent-soft);color:var(--accent);border:1px solid rgba(124,93,250,.22);
      }
      .lmm-loader{display:flex;align-items:center;gap:10px;color:var(--muted);font-size:13px;padding:16px 4px;}
      .lmm-spin{width:17px;height:17px;border-radius:50%;border:2.5px solid var(--border-2);border-top-color:var(--accent);animation:lmmSpin .7s linear infinite;}
      @media(max-width:720px){.lmm-grid{grid-template-columns:repeat(2,1fr);}.lmm-hero{padding:18px;}}
    `;
    document.head.appendChild(style);
  }

  function mountInto(rootEl) {
    if (!rootEl) return;
    injectSectionStyles();
    rootEl.innerHTML = '';

    const wrap = document.createElement('div');
    wrap.className = 'lmm-wrap' + (isLightTheme() ? ' lmm-light' : '');
    wrap.innerHTML = `
      <div class="lmm-hero">
        <div class="lmm-hero-left">
          <div class="lmm-hero-ic">⚡</div>
          <div>
            <h3>ИИ-менеджер LMS</h3>
            <p>Расчёты успеваемости кодом · Личные планы до «профи» · Красивые отчёты в Discord · Согласование заданий и авто-уборка</p>
          </div>
        </div>
      </div>
      <div class="lmm-tabs" id="lmmTabs">
        <button type="button" class="lmm-tab active" data-tab="group">👥 Группа и «Профи»</button>
        <button type="button" class="lmm-tab" data-tab="reports">📊 Отчёты → Discord</button>
        <button type="button" class="lmm-tab" data-tab="proposals">📋 Задания на согласование</button>
        <button type="button" class="lmm-tab" data-tab="cleanup">🧹 Уборка ИИ и бэкапы</button>
      </div>
      <div class="lmm-panel" id="lmmBody"></div>
    `;
    rootEl.appendChild(wrap);

    let activeTab = 'group';
    let groupFilter = 'all';
    let lastCleanupPreview = null;

    wrap.querySelectorAll('.lmm-tab').forEach(btn => {
      btn.onclick = () => {
        activeTab = btn.dataset.tab;
        wrap.querySelectorAll('.lmm-tab').forEach(b => b.classList.toggle('active', b === btn));
        renderTab();
      };
    });

    async function renderTab() {
      wrap.classList.toggle('lmm-light', isLightTheme());
      const body = wrap.querySelector('#lmmBody');
      if (!isOwner()) {
        body.innerHTML = '<div class="lmm-card">Раздел доступен только владельцу LMS.</div>';
        return;
      }
      body.innerHTML = '<div class="lmm-loader"><span class="lmm-spin"></span><span>Загружаем актуальные данные…</span></div>';
      try {
        if (activeTab === 'group') await renderGroupTab(body);
        else if (activeTab === 'reports') await renderReportsTab(body);
        else if (activeTab === 'proposals') await renderProposalsTab(body);
        else await renderCleanupTab(body);
      } catch (e) {
        body.innerHTML = `<div class="lmm-card"><span class="lmm-badge err">Ошибка</span><div>${escHtml(e.message)}</div></div>`;
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
          <div class="lmm-kpi"><span>Учеников</span><b>${g.totalStudents}</b></div>
          <div class="lmm-kpi"><span>Медиана «профи»</span><b>${g.medianReadiness}%</b></div>
          <div class="lmm-kpi"><span>Средний тест</span><b>${g.avgTests}%</b></div>
          <div class="lmm-kpi"><span>Средняя печать</span><b>${g.avgCpm} зн/м</b></div>
        </div>
        <div class="lmm-toolbar">
          <div class="lmm-filters">
            <button type="button" class="lmm-fbtn ${groupFilter === 'all' ? 'active' : ''}" data-gf="all">Все (${g.students.length})</button>
            <button type="button" class="lmm-fbtn ${groupFilter === 'warn' ? 'active' : ''}" data-gf="warn">Требуют внимания (${g.lagging.length})</button>
            <button type="button" class="lmm-fbtn ${groupFilter === 'top' ? 'active' : ''}" data-gf="top">Выше медианы</button>
          </div>
          <button type="button" class="lmm-btn" id="lmmRefreshGroup">↻ Пересчитать</button>
        </div>
        <div id="lmmNoticeBox"></div>
        <div id="lmmPlanBox"></div>
        <div style="display:flex;flex-direction:column;gap:10px;" id="lmmStudentList"></div>
      `;
      body.querySelectorAll('[data-gf]').forEach(b => {
        b.onclick = () => { groupFilter = b.dataset.gf; renderGroupTab(body); };
      });
      body.querySelector('#lmmRefreshGroup').onclick = async () => { await analyzeGroup(true); renderTab(); };

      const list = body.querySelector('#lmmStudentList');
      if (!filtered.length) {
        list.innerHTML = '<div class="lmm-card" style="color:var(--muted);">В этом фильтре учеников пока нет.</div>';
        return;
      }
      filtered.forEach(s => {
        const avCls = s.pro.status === 'pro_ready' ? 'st-pro' : (s.pro.status === 'needs_attention' ? 'st-warn' : '');
        const badgeHtml = s.pro.status === 'pro_ready'
          ? '<span class="lmm-badge ok">Готов к профи</span>'
          : s.pro.status === 'needs_attention'
            ? '<span class="lmm-badge warn">Нужно внимание</span>'
            : '<span class="lmm-badge info">В темпе</span>';

        const card = document.createElement('div');
        card.className = 'lmm-card';
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
              <button type="button" class="lmm-btn primary" data-plan>План ИИ</button>
              <button type="button" class="lmm-btn" data-prop>+ Задание</button>
            </div>
          </div>
        `;
        card.querySelector('[data-plan]').onclick = async ev => {
          const b = ev.currentTarget; b.disabled = true; b.textContent = 'Анализирует…';
          try {
            const res = await generateStudentPlanWithAi(s.uid);
            body.querySelector('#lmmPlanBox').innerHTML = `
              <div class="lmm-card">
                <div class="lmm-row"><strong>🎯 Личный план до «профи»: ${escHtml(s.name)}</strong><span class="lmm-badge info">${s.pro.readiness}% готовности</span></div>
                <div class="lmm-rich">${formatRichText(res.explanation)}</div>
              </div>`;
          } catch (err) {
            body.querySelector('#lmmNoticeBox').innerHTML = `<div class="lmm-notice">Ошибка: ${escHtml(err.message)}</div>`;
          } finally { b.disabled = false; b.textContent = 'План ИИ'; }
        };
        card.querySelector('[data-prop]').onclick = async ev => {
          const b = ev.currentTarget; b.disabled = true; b.textContent = 'Подбирает…';
          try {
            await proposeSmartAssignmentWithAi(s.uid);
            body.querySelector('#lmmNoticeBox').innerHTML = `<div class="lmm-notice">✅ Предложение задания для <b>${escHtml(s.name)}</b> создано — открой вкладку «Задания на согласование».</div>`;
          } catch (err) {
            body.querySelector('#lmmNoticeBox').innerHTML = `<div class="lmm-notice">Ошибка: ${escHtml(err.message)}</div>`;
          } finally { b.disabled = false; b.textContent = '+ Задание'; }
        };
        list.appendChild(card);
      });
    }

    async function renderReportsTab(body) {
      const snap = await window.db.collection('aiReports').orderBy('clientAt', 'desc').limit(8).get().catch(() => ({ docs: [] }));
      body.innerHTML = `
        <div class="lmm-card">
          <div class="lmm-row">
            <div>
              <strong>Сводка по группе + Discord Embed</strong>
              <div style="font-size:12px;color:var(--muted);margin-top:3px;">Цифры считаются кодом, отчёт сохраняется в LMS и красиво уходит карточкой в Discord.</div>
            </div>
            <button type="button" class="lmm-btn primary" id="lmmSendRep">📊 Отправить отчёт в Discord</button>
          </div>
          <div id="lmmRepNotice"></div>
        </div>
        <div id="lmmRepList" style="display:flex;flex-direction:column;gap:10px;"></div>
      `;
      body.querySelector('#lmmSendRep').onclick = async e => {
        const b = e.currentTarget; b.disabled = true; b.textContent = 'Формируем и отправляем…';
        try {
          await generateGroupReport({ period: 'по команде', sendToDiscord: true });
          renderTab();
        } catch (err) {
          body.querySelector('#lmmRepNotice').innerHTML = `<div class="lmm-notice">Ошибка: ${escHtml(err.message)}</div>`;
          b.disabled = false; b.textContent = '📊 Отправить отчёт в Discord';
        }
      };
      const list = body.querySelector('#lmmRepList');
      if (!snap.docs.length) { list.innerHTML = '<div class="lmm-card" style="color:var(--muted);">Сохранённых отчётов пока нет.</div>'; return; }
      snap.docs.forEach(d => {
        const r = d.data() || {};
        const dt = r.clientAt ? new Date(r.clientAt).toLocaleString('ru-RU') : '';
        const card = document.createElement('div');
        card.className = 'lmm-card';
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
        <div class="lmm-notice">Режим согласования (14 дней): задания от ИИ попадают к ученикам только после нажатия «Подтвердить и выдать».</div>
        <div id="lmmPropList" style="display:flex;flex-direction:column;gap:10px;"></div>
      `;
      const list = body.querySelector('#lmmPropList');
      if (!snap.docs.length) {
        list.innerHTML = '<div class="lmm-card" style="color:var(--muted);">Пока нет предложений. Нажми «+ Задание» напротив любого ученика во вкладке «Группа и Профи».</div>';
        return;
      }
      const statusMap = {
        pending_approval: ['warn', 'Ждёт подтверждения'],
        approved: ['ok', 'Выдано ученику'],
        rejected: ['err', 'Отклонено']
      };
      snap.docs.forEach(d => {
        const p = d.data() || {};
        const st = statusMap[p.status] || ['info', p.status];
        const pending = p.status === 'pending_approval';
        const card = document.createElement('div');
        card.className = 'lmm-card';
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
          ${pending ? '<div class="lmm-row" style="justify-content:flex-end;"><button type="button" class="lmm-btn danger" data-rej>Отклонить</button><button type="button" class="lmm-btn good" data-app>✓ Подтвердить и выдать</button></div>' : ''}
        `;
        if (pending) {
          card.querySelector('[data-app]').onclick = async ev => { ev.currentTarget.disabled = true; await approveProposal(d.id); renderTab(); };
          card.querySelector('[data-rej]').onclick = async ev => { ev.currentTarget.disabled = true; await rejectProposal(d.id); renderTab(); };
        }
        list.appendChild(card);
      });
    }

    async function renderCleanupTab(body) {
      const bSnap = await window.db.collection('lmsBackups').orderBy('clientAt', 'desc').limit(10).get().catch(() => ({ docs: [] }));
      body.innerHTML = `
        <div class="lmm-card">
          <strong>Авто-уборка старых данных от ИИ</strong>
          <div style="font-size:12.5px;color:var(--muted);line-height:1.55;">Твоё ручное удаление в обычной админке работает мгновенно без вопросов. Здесь ИИ проверяет старые технические записи и чистит их только с твоим подтверждением и автоматическим бэкапом.</div>
          <div class="lmm-row" style="justify-content:flex-start;">
            <button type="button" class="lmm-btn primary" id="lmmScanErr">Найти старые ошибки (&gt; 14 дн.)</button>
            <button type="button" class="lmm-btn" id="lmmScanErrAll">Найти все ошибки</button>
          </div>
          <div id="lmmCleanPreview"></div>
        </div>
        <div class="lmm-card">
          <strong>Резервные копии (возврат в 1 клик)</strong>
          <div id="lmmBackupList" style="display:flex;flex-direction:column;gap:8px;"></div>
        </div>
      `;
      async function runScan(days) {
        const box = body.querySelector('#lmmCleanPreview');
        box.innerHTML = '<div class="lmm-loader"><span class="lmm-spin"></span><span>Проверяем записи…</span></div>';
        lastCleanupPreview = await previewCleanup({ target: 'platformErrors', olderThanDays: days });
        if (!lastCleanupPreview.count) {
          box.innerHTML = '<div class="lmm-notice">✅ Старых записей не найдено — всё чисто.</div>';
          return;
        }
        box.innerHTML = `
          <div class="lmm-row" style="padding:12px 14px;background:var(--surface-2);border:1px solid var(--border);border-radius:12px;">
            <span style="font-size:13px;">Найдено записей в <b>platformErrors</b>: <b>${lastCleanupPreview.count}</b></span>
            <button type="button" class="lmm-btn danger" id="lmmDoClean">Подтвердить уборку (с бэкапом)</button>
          </div>
        `;
        box.querySelector('#lmmDoClean').onclick = async e => {
          e.currentTarget.disabled = true; e.currentTarget.textContent = 'Сохраняем бэкап и чистим…';
          await executeCleanup(lastCleanupPreview, true);
          renderTab();
        };
      }
      body.querySelector('#lmmScanErr').onclick = () => runScan(14);
      body.querySelector('#lmmScanErrAll').onclick = () => runScan(0);

      const bList = body.querySelector('#lmmBackupList');
      if (!bSnap.docs.length) { bList.innerHTML = '<div style="font-size:12.5px;color:var(--muted);">Резервных копий пока нет.</div>'; return; }
      bSnap.docs.forEach(d => {
        const b = d.data() || {};
        const row = document.createElement('div');
        row.className = 'lmm-row';
        row.style.cssText = 'padding:10px 14px;background:var(--surface-2);border:1px solid var(--border);border-radius:12px;font-size:12.5px;';
        row.innerHTML = `<span><b>${escHtml(b.path)}</b> · ${b.count} зап. · ${b.clientAt ? new Date(b.clientAt).toLocaleString('ru-RU') : ''}</span>` +
          (b.restored ? '<span class="lmm-badge ok">Восстановлено</span>' : '<button type="button" class="lmm-btn good">Восстановить</button>');
        const btn = row.querySelector('button');
        if (btn) btn.onclick = async () => { btn.disabled = true; btn.textContent = 'Восстанавливаем…'; await restoreBackup(d.id); renderTab(); };
        bList.appendChild(row);
      });
    }

    renderTab();
  }

  // React-обёртка для нативного встраивания в AdminSections (6_admin.js)
  function LMSMentorSection() {
    const ref = React.useRef(null);
    React.useEffect(() => {
      if (ref.current) mountInto(ref.current);
      return () => { if (ref.current) ref.current.innerHTML = ''; };
    }, []);
    return React.createElement('div', { ref });
  }

  // На случай если раньше была открыта старая версия v3/v4 с кнопкой в углу — подчистим
  document.getElementById('lms-mentor-launcher')?.remove();
  document.getElementById('lms-mentor-overlay')?.remove();

  window.LMSMentorSection = LMSMentorSection;
  window.LMSMentor = {
    version: 5,
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
    restoreBackup
  };
})();
