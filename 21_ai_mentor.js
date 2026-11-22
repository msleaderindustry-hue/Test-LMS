// 21_ai_mentor.js — Аналитический движок, путь к «профи», отчёты, предложения заданий и восстановимая очистка.
// Подключается в index.html обычным <script src="21_ai_mentor.js" charset="utf-8"></script> после Firebase.
(function () {
  'use strict';
  if (window.LMSMentor) return;

  const OWNER_UID = '1qhlWSbqAxd1dAvo2Nw92gdJhNk1';
  const AI_URL = 'https://gemini-proxy-lms.msleaderindustry.workers.dev';
  const DISCORD_URL = 'https://discordwebhook.msleaderindustry.workers.dev';
  const CACHE_TTL_MS = 120000;

  // Стартовые критерии уровня «профи» (применяются как ориентир, настраиваются админом)
  const DEFAULT_PRO_CRITERIA = {
    confirmed: false,
    typingCpm: 250,       // знаков/мин (WPM * 5)
    typingAccuracy: 98,   // %
    testsScore: 90,       // %
    hotkeysAccuracy: 95,  // %
    excelTasks: 25,       // выполненных заданий Excel
    wordLessons: 10,      // выполненных практических уроков Word
    stabilityDays: 7      // повторная проверка через неделю
  };

  let proCriteria = Object.assign({}, DEFAULT_PRO_CRITERIA);
  const cache = { group: null, groupAt: 0, students: new Map() };

  function isOwner() {
    return !!(window.auth && window.auth.currentUser && window.auth.currentUser.uid === OWNER_UID);
  }

  function requireOwner(actionName) {
    if (!isOwner()) {
      throw new Error('Доступ запрещён: операция «' + actionName + '» доступна только администратору.');
    }
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

  function round1(n) {
    return Number.isFinite(n) ? Math.round(n * 10) / 10 : 0;
  }

  function avg(arr) {
    const nums = arr.filter(Number.isFinite);
    if (!nums.length) return 0;
    return nums.reduce((a, b) => a + b, 0) / nums.length;
  }

  function median(arr) {
    const nums = arr.filter(Number.isFinite).sort((a, b) => a - b);
    if (!nums.length) return 0;
    const mid = Math.floor(nums.length / 2);
    return nums.length % 2 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
  }

  // Восстановление Firestore Timestamp после JSON.parse при возврате из lmsBackups
  function reviveFirestoreTypes(val) {
    if (Array.isArray(val)) return val.map(reviveFirestoreTypes);
    if (val && typeof val === 'object') {
      const keys = Object.keys(val);
      if (
        keys.length === 2 &&
        typeof val.seconds === 'number' &&
        typeof val.nanoseconds === 'number' &&
        window.firebase?.firestore?.Timestamp
      ) {
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

  async function callAi(prompt, timeoutMs = 40000) {
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

  async function sendDiscord(content, embeds) {
    const payload = {};
    if (content) payload.content = String(content).slice(0, 1900);
    if (Array.isArray(embeds) && embeds.length) payload.embeds = embeds;
    const res = await fetch(DISCORD_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.ok;
  }

  // ---------------------------------------------------------------------------
  // 1. Единая запись учебных попыток (вызывается из любого модуля LMS)
  // ---------------------------------------------------------------------------
  async function recordAttempt(attempt) {
    const uid = window.auth?.currentUser?.uid;
    if (!uid || !window.db) return { ok: false, reason: 'no-auth' };
    const a = attempt || {};
    const cpm = Number.isFinite(Number(a.cpm))
      ? Number(a.cpm)
      : (Number.isFinite(Number(a.wpm)) ? Math.round(Number(a.wpm) * 5) : null);

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

  // ---------------------------------------------------------------------------
  // 2. Точные расчёты успеваемости (сверено с реальными схемами 11/12/15/17/20)
  // ---------------------------------------------------------------------------
  function computeStudentMetrics(uid, profile, extras) {
    const u = profile || {};
    const name = u.nickname || u.displayName || u.email || uid;

    // Тесты (17_tests_module.js: testHistory = [{ id, score, total, topic, date, ... }])
    const rawTests = Array.isArray(u.testHistory) ? u.testHistory : [];
    const testScores = rawTests
      .map(t => {
        if (Number.isFinite(Number(t.percent))) return Number(t.percent);
        if (Number.isFinite(Number(t.score)) && Number.isFinite(Number(t.total)) && Number(t.total) > 0) {
          return (Number(t.score) / Number(t.total)) * 100;
        }
        return Number.isFinite(Number(t.score)) ? Number(t.score) : NaN;
      })
      .filter(Number.isFinite);

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

    // Печать (11_typing.js: typingProgress = { maxWpm, maxCombo, testsCompleted, weakKeys })
    const tp = u.typingProgress && typeof u.typingProgress === 'object' ? u.typingProgress : {};
    let typingCpm = 0;
    if (Number.isFinite(Number(tp.bestCpm)) && Number(tp.bestCpm) > 0) typingCpm = Number(tp.bestCpm);
    else if (Number.isFinite(Number(tp.cpm)) && Number(tp.cpm) > 0) typingCpm = Number(tp.cpm);
    else if (Number.isFinite(Number(tp.maxWpm)) && Number(tp.maxWpm) > 0) typingCpm = Math.round(Number(tp.maxWpm) * 5);
    else if (Number.isFinite(Number(tp.bestWpm)) && Number(tp.bestWpm) > 0) typingCpm = Math.round(Number(tp.bestWpm) * 5);
    else if (Number.isFinite(Number(tp.wpm)) && Number(tp.wpm) > 0) typingCpm = Math.round(Number(tp.wpm) * 5);

    // Если точность печати есть в attempts, используем её, иначе из профиля
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
          .filter(([, count]) => count > 0)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 8)
          .map(e => e[0]);

    // Горячие клавиши (12_hotkeys.js: hotkeyProgress = { totalScore, maxScore, sessionsPlayed, history: [{ score, total, topic }] })
    const hk = u.hotkeyProgress && typeof u.hotkeyProgress === 'object' ? u.hotkeyProgress : {};
    const hkHistory = Array.isArray(hk.history) ? hk.history : [];
    const hkRates = hkHistory
      .filter(h => Number(h.total) > 0 && Number.isFinite(Number(h.score)))
      .map(h => Math.min(100, (Number(h.score) / Number(h.total)) * 100));
    const hotkeysAccuracy = hkRates.length
      ? round1(avg(hkRates.slice(-10)))
      : round1(Number(hk.accuracy || hk.percent || 0));

    // Excel (15_excel_trainer.js: excelProgress = { [taskKey]: number })
    const ex = u.excelProgress && typeof u.excelProgress === 'object' ? u.excelProgress : {};
    const excelCompleted = Number.isFinite(Number(ex.completedCount))
      ? Number(ex.completedCount)
      : Object.entries(ex).filter(([k, v]) => !['percent', 'totalCount', 'updatedAt'].includes(k) && Number(v) > 0).length;
    const excelPercent = Number.isFinite(Number(ex.percent))
      ? round1(Number(ex.percent))
      : Math.min(100, Math.round((excelCompleted / Math.max(1, proCriteria.excelTasks)) * 100));

    // Word (20_word.js: users/{uid}/wordResults/{lessonId})
    const wordCompleted = (extras?.wordResults || []).filter(r => r.completed).length;

    const recentAttemptsCount = attempts.filter(a => (Date.now() - toMillis(a.at || a.clientAt)) <= 7 * 86400000).length;
    const activeMinutes7d = Math.round(attempts
      .filter(a => (Date.now() - toMillis(a.at || a.clientAt)) <= 7 * 86400000)
      .reduce((sum, a) => sum + (Number(a.durationSec) || 0), 0) / 60);

    // Прогресс до уровня «профи» (0..100%) по 5 направлениям
    const typingProgress = typingAccuracy > 0
      ? Math.min(100, Math.round(
          (Math.min(1, typingCpm / Math.max(1, proCriteria.typingCpm)) * 0.6 +
           Math.min(1, typingAccuracy / Math.max(1, proCriteria.typingAccuracy)) * 0.4) * 100
        ))
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
      uid,
      name,
      role: u.role || 'student',
      isBanned: u.isBanned === true,
      tests: { count: testScores.length, avg: testsAvg, delta: testsDelta, weakTopics },
      typing: { cpm: typingCpm, maxWpm: Number(tp.maxWpm || 0), testsCompleted: Number(tp.testsCompleted || 0), accuracy: typingAccuracy, weakKeys },
      hotkeys: { accuracy: hotkeysAccuracy, sessionsPlayed: Number(hk.sessionsPlayed || hkHistory.length || 0) },
      excel: { completed: excelCompleted, percent: excelPercent },
      word: { completed: wordCompleted },
      activity: { recentAttempts7d: recentAttemptsCount, activeMinutes7d, inactiveDays },
      pro: {
        readiness: proReadiness,
        breakdown: { typing: typingProgress, tests: testsProgress, hotkeys: hotkeysProgress, excel: excelScore, word: wordProgress },
        status
      }
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

  // ---------------------------------------------------------------------------
  // 3. Объяснения и отчёты через ИИ (ИИ получает только посчитанные цифры)
  // ---------------------------------------------------------------------------
  async function generateStudentPlanWithAi(targetUid) {
    requireOwner('личный план ученика');
    const [student, group] = await Promise.all([analyzeStudent(targetUid, true), analyzeGroup()]);
    const prompt =
      'Ты ИИ-методист Ultimate LMS. Все цифры ниже уже посчитаны кодом — НЕ пересчитывай и НЕ выдумывай новых чисел.\n' +
      'Составь краткий, конкретный личный план для ученика до уровня «профи» (3–5 шагов).\n' +
      'К КАЖДОЙ рекомендации в скобках коротко напиши «Почему: ...», опираясь на переданные факты.\n' +
      'Данные ученика: ' + JSON.stringify(student) + '\n' +
      'Средние по группе: ' + JSON.stringify({ medianReadiness: group.medianReadiness, avgTests: group.avgTests, avgCpm: group.avgCpm }) + '\n' +
      'Критерии «профи»: ' + JSON.stringify(proCriteria);

    const explanation = await callAi(prompt);
    return { student, explanation };
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
      'Ты ИИ-методист Ultimate LMS. Подготовь краткий структурированный отчёт для администратора по группе на русском языке (без выдуманных цифр, строго по JSON ниже):\n' +
      '1) Общая картина и кто лидирует;\n' +
      '2) Кто отстаёт или снизил темп и почему;\n' +
      '3) 3 конкретные рекомендации на ближайшую неделю (к каждой коротко укажи «Почему: ...»).\n' +
      'Данные: ' + JSON.stringify(compact);

    const text = await callAi(prompt);
    const reportDoc = {
      type: options.period || 'manual',
      createdAt: serverTime(),
      clientAt: Date.now(),
      metrics: compact,
      summaryText: text
    };
    const saved = await window.db.collection('aiReports').add(reportDoc);

    if (options.sendToDiscord !== false) {
      const shortDiscord = '📊 **Отчёт LMS (' + (options.period || 'по команде') + ')**\n' +
        'Учеников: **' + compact.totalStudents + '** · Медиана «профи»: **' + compact.medianReadiness + '%** · Ср. тесты: **' + compact.avgTests + '%** · Ср. печать: **' + compact.avgCpm + ' зн/мин**\n\n' +
        text.slice(0, 1400);
      await sendDiscord(shortDiscord).catch(() => false);
    }
    return { id: saved.id, metrics: compact, summaryText: text };
  }

  // ---------------------------------------------------------------------------
  // 4. Предложения заданий (совместимо со схемой lmsAssignments v3 из 6_admin.js / 19_tasks.js)
  // ---------------------------------------------------------------------------
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
      dueInDays: Math.max(1, Number(p.dueInDays) || 3),
      status: 'pending_approval',
      createdAt: serverTime(),
      clientAt: Date.now()
    };
    const ref = await window.db.collection('aiProposals').add(doc);
    return { id: ref.id, ...doc };
  }

  async function approveProposal(proposalId) {
    requireOwner('подтверждение задания');
    const ref = window.db.collection('aiProposals').doc(proposalId);
    const snap = await ref.get();
    if (!snap.exists) throw new Error('Предложение не найдено.');
    const p = snap.data();
    if (p.status !== 'pending_approval') throw new Error('Предложение уже обработано (' + p.status + ').');

    // Собираем studentNames точно как в 6_admin.js
    const studentNames = {};
    await Promise.all((p.studentIds || []).map(async id => {
      try {
        const uSnap = await window.db.collection('users').doc(id).get();
        const u = uSnap.exists ? (uSnap.data() || {}) : {};
        studentNames[id] = u.nickname || u.displayName || u.email || id;
      } catch (e) {
        studentNames[id] = id;
      }
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
      status: 'rejected',
      rejectNote: String(note || '').slice(0, 300),
      rejectedAt: serverTime()
    });
    return { ok: true };
  }

  // ---------------------------------------------------------------------------
  // 5. Безопасная восстановимая уборка (превью → подтверждение → бэкап → удаление)
  // ---------------------------------------------------------------------------
  async function previewCleanup(options = {}) {
    requireOwner('предпросмотр очистки');
    const target = options.target; // 'platformErrors' | 'userActivity' | 'userAttempts'
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
    return {
      target,
      uid: options.uid || null,
      olderThanDays,
      count: matched.length,
      ids: matched.map(d => d.id)
    };
  }

  async function executeCleanup(preview, confirmed) {
    requireOwner('выполнение очистки');
    if (confirmed !== true) throw new Error('Очистка отменена: требуется явное подтверждение администратора.');
    if (!preview || !Array.isArray(preview.ids) || !preview.ids.length) return { ok: true, deleted: 0, backupId: null };

    let colRef, pathLabel;
    if (preview.target === 'platformErrors') {
      colRef = window.db.collection('platformErrors');
      pathLabel = 'platformErrors';
    } else if (preview.target === 'userActivity' && preview.uid) {
      colRef = window.db.collection('users').doc(preview.uid).collection('activity');
      pathLabel = 'users/' + preview.uid + '/activity';
    } else if (preview.target === 'userAttempts' && preview.uid) {
      colRef = window.db.collection('users').doc(preview.uid).collection('attempts');
      pathLabel = 'users/' + preview.uid + '/attempts';
    } else {
      throw new Error('Некорректные параметры очистки.');
    }

    const records = [];
    for (const id of preview.ids) {
      const d = await colRef.doc(id).get();
      if (d.exists) records.push({ id: d.id, data: d.data() });
    }
    if (!records.length) return { ok: true, deleted: 0, backupId: null };

    // 1) Сначала сохраняем резервную копию в lmsBackups (с разбиением на части, если много записей)
    const serialized = JSON.stringify(records);
    if (serialized.length > 850000) {
      throw new Error('Слишком большой объём для одного бэкапа (>850 КБ). Укажите меньший период очистки (olderThanDays).');
    }
    const backupRef = await window.db.collection('lmsBackups').add({
      path: pathLabel,
      count: records.length,
      createdAt: serverTime(),
      clientAt: Date.now(),
      restored: false,
      payloadJson: serialized
    });

    // 2) Удаляем батчами по 400 документов
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

  window.LMSMentor = {
    version: 2,
    OWNER_UID,
    isOwner,
    getProCriteria: () => Object.assign({}, proCriteria),
    setProCriteria,
    recordAttempt,
    analyzeStudent,
    analyzeGroup,
    generateStudentPlanWithAi,
    generateGroupReport,
    proposeAssignment,
    approveProposal,
    rejectProposal,
    previewCleanup,
    executeCleanup,
    restoreBackup
  };
})();
