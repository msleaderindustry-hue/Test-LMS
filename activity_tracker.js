// --- activity_tracker.js — Ultimate LMS / журнал активности ---
// Подключить один раз после Firebase Auth + Firestore.
// Хранит события в users/{uid}/activity и обновляет lastVisitAt / lastSeenAt.
(function () {
    const SEEN_INTERVAL = 3 * 60 * 1000;
    let uid = null;
    let seenTimer = null;
    let lastRoute = '';

    const serverTime = () => window.firebase?.firestore?.FieldValue?.serverTimestamp?.() || new Date().toISOString();
    const currentPath = () => `${location.pathname || '/'}${location.search || ''}${location.hash || ''}`;
    const short = value => String(value ?? '').trim().slice(0, 500);

    async function updateSeen(force = false) {
        if (!uid || !window.db) return;
        try {
            await window.db.collection('users').doc(uid).set({
                lastSeenAt: serverTime()
            }, { merge: true });
        } catch (e) {
            if (force) console.warn('[activity] lastSeenAt:', e);
        }
    }

    async function writeEvent(type, section, details = {}) {
        if (!uid || !window.db) return;
        const payload = {
            at: serverTime(),
            type: short(type || 'activity'),
            section: short(section || 'platform'),
            action: short(details.action || ''),
            label: short(details.label || ''),
            path: short(details.path || currentPath()),
            details: details.details == null ? '' : (typeof details.details === 'string' ? short(details.details) : details.details),
            duration: Number.isFinite(Number(details.duration)) ? Number(details.duration) : null,
            device: short(navigator.userAgent || '')
        };
        try {
            await window.db.collection('users').doc(uid).collection('activity').add(payload);
        } catch (e) {
            console.warn('[activity] event:', e);
        }
    }

    function sectionFromPath(path) {
        const p = String(path || '').toLowerCase();
        if (p.includes('excel')) return 'excel';
        if (p.includes('typing') || p.includes('print')) return 'typing';
        if (p.includes('hotkey') || p.includes('keyboard')) return 'hotkeys';
        if (p.includes('test')) return 'tests';
        if (p.includes('flash')) return 'flashcards';
        if (p.includes('code') || p.includes('school')) return 'code';
        if (p.includes('chat')) return 'chat';
        return 'platform';
    }

    function trackRoute(reason = 'navigation') {
        const path = currentPath();
        if (!uid || path === lastRoute) return;
        lastRoute = path;
        writeEvent('navigation', sectionFromPath(path), { action: reason, label: 'Переход по платформе', path });
    }

    // Можно вызывать из любого модуля:
    // window.trackLmsActivity('practice', 'excel', { label: 'Урок 3 завершён', details: { score: 95 } });
    window.trackLmsActivity = (type, section, details = {}) => writeEvent(type, section, details);

    // Альтернатива без прямого вызова:
    // window.dispatchEvent(new CustomEvent('lms:activity', { detail: { type:'practice', section:'typing', label:'Тренировка завершена' } }));
    window.addEventListener('lms:activity', event => {
        const d = event.detail || {};
        writeEvent(d.type || 'activity', d.section || 'platform', d);
    });

    window.addEventListener('hashchange', () => trackRoute('hashchange'));
    window.addEventListener('popstate', () => trackRoute('popstate'));
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') updateSeen();
        else { updateSeen(); trackRoute('return'); }
    });

    const auth = window.auth;
    if (auth?.onAuthStateChanged) {
        auth.onAuthStateChanged(async user => {
            if (seenTimer) { clearInterval(seenTimer); seenTimer = null; }
            uid = user?.uid || null;
            lastRoute = '';
            if (!uid || !window.db) return;
            try {
                await window.db.collection('users').doc(uid).set({
                    lastVisitAt: serverTime(),
                    lastSeenAt: serverTime()
                }, { merge: true });
            } catch (e) {
                console.warn('[activity] session:', e);
            }
            await writeEvent('session', 'platform', { action: 'start', label: 'Запуск платформы', path: currentPath() });
            trackRoute('start');
            seenTimer = setInterval(updateSeen, SEEN_INTERVAL);
        });
    }
})();
