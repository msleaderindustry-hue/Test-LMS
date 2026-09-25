// --- 6_admin.js — Ultimate LMS / обновлённая панель ---
// Полная замена файла. React + существующий Firebase compat.
// JSX подключается тем же способом, что и исходный 6_admin.js.
(function () {
    const { useState, useEffect, useRef, useMemo } = React;
    const ADMIN_ICON_PATHS = {
        chat: <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />,
        keyboard: <><rect x="2" y="6" width="20" height="12" rx="2" /><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M6 14h12" /></>,
        zap: <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />,
        code: <><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></>,
        layers: <><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></>,
        barChart: <><line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /><line x1="6" y1="20" x2="6" y2="16" /></>,
        user: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>,
        users: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>,
        settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></>,
        fileText: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></>,
        ban: <><circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /></>,
        alertTriangle: <><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></>,
        checkCircle: <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></>,
        lock: <><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></>,
        info: <><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></>,
        folder: <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />,
        cloud: <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />,
        x: <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>,
        search: <><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></>,
        star: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />,
        inbox: <><polyline points="22 12 16 12 14 15 10 15 8 12 2 12" /><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" /></>,
        shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
        lightbulb: <><path d="M9 18h6" /><path d="M10 22h4" /><path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z" /></>,
        sparkle: <path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z"/>
    };

    const AdminIcon = ({ name, size = 16, color = 'currentColor', style = {}, strokeWidth = 2 }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', flexShrink: 0, ...style }}>
            {ADMIN_ICON_PATHS[name] || null}
        </svg>
    );

    const AVAILABLE_MODULES = [
        { id: 'chat', icon: 'chat', label: 'Чат', color: '#06b6d4' },
        { id: 'ai_chat', icon: 'sparkle', label: 'ИИ Ассистент', color: '#a855f7' },
        { id: 'typing', icon: 'keyboard', label: 'Печать', color: '#818cf8' },
        { id: 'hotkeys', icon: 'zap', label: 'Хоткеи', color: '#fbbf24' },
        { id: 'code', icon: 'code', label: 'VS School', color: '#2dd4bf' },
        { id: 'flashcards', icon: 'layers', label: 'Карточки', color: '#3b82f6' },
        { id: 'excel', icon: 'barChart', label: 'Excel', color: '#10b981' },
        { id: 'stats', icon: 'user', label: 'Статистика', color: '#f59e0b' } 
    ];

    const PAGE_SIZE = 12;
    const MAX_FILE = 350 * 1024;
    const array = value => Array.isArray(value) ? value : [];
    const str = value => typeof value === 'string' ? value : '';
    const number = (value, fallback = 0) => value !== null && value !== '' && Number.isFinite(Number(value)) ? Math.max(0, Number(value)) : fallback;
    const nameOf = user => str(user.nickname) || str(user.email) || 'Без имени';
    const testsOf = user => array(user.assignedTests).filter(test => test && typeof test === 'object');
    const modulesOf = user => user.allowedModules == null ? AVAILABLE_MODULES.map(module => module.id) : array(user.allowedModules);
    const initials = user => nameOf(user).split('@')[0].split(/[\s._-]+/).filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase();
    const average = user => {
        const values = array(user.testHistory).map(entry => entry?.percent).filter(value => value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value))).map(value => Math.min(100, Math.max(0, Number(value))));
        return values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : null;
    };
    function problem(message) { const error = new Error(message); error.userMessage = message; return error; }
    function errorText(error) {
        if (error?.userMessage) return error.userMessage;
        if (String(error?.code).includes('permission-denied')) return 'Недостаточно прав для этого действия. Проверьте доступ администратора.';
        if (String(error?.code).includes('unavailable')) return 'Нет связи с базой данных. Проверьте интернет и повторите.';
        if (String(error?.code).includes('resource-exhausted')) return 'Достигнут лимит базы данных. Попробуйте позже.';
        return 'Не удалось сохранить изменения. Попробуйте ещё раз.';
    }
    function normalizeTest(data) {
        if (!Array.isArray(data) || !data.length) throw problem('JSON должен содержать непустой массив вопросов.');
        if (data.length > 300) throw problem('В одном тесте допускается до 300 вопросов.');
        const image = (value, at) => {
            if (value == null || value === '') return null;
            if (typeof value !== 'string' || !/^(https?:\/\/|data:image\/(png|jpeg|jpg|gif|webp);base64,)/i.test(value)) throw problem(`${at}: изображение должно быть HTTP(S)-ссылкой или PNG/JPEG/GIF/WebP в base64.`);
            return value;
        };
        return data.map((item, index) => {
            const at = `Вопрос ${index + 1}`;
            if (!item || typeof item !== 'object' || Array.isArray(item)) throw problem(`${at}: некорректная структура.`);
            const question = str(item.question).trim();
            const questionImg = image(item.questionImg, at);
            if (!question && !questionImg) throw problem(`${at}: добавьте текст или изображение.`);
            if (question.length > 10000) throw problem(`${at}: текст слишком длинный.`);
            if (!Array.isArray(item.variants) || item.variants.length < 2 || item.variants.length > 12) throw problem(`${at}: нужно от 2 до 12 вариантов ответа.`);
            const variants = item.variants.map((variant, vi) => {
                const object = variant && typeof variant === 'object' && !Array.isArray(variant);
                const text = object ? str(variant.text).trim() : typeof variant === 'string' || typeof variant === 'number' ? String(variant).trim() : '';
                const img = object ? image(variant.img, `${at}, вариант ${vi + 1}`) : null;
                if (!text && !img) throw problem(`${at}: вариант ${vi + 1} пуст.`);
                if (text.length > 5000) throw problem(`${at}: вариант ${vi + 1} слишком длинный.`);
                return { text, img };
            });
            const validIndex = typeof item.correctIndex === 'number' || typeof item.correctIndex === 'string' && /^\d+$/.test(item.correctIndex);
            const correctIndex = Number(item.correctIndex);
            if (!validIndex || !Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex >= variants.length) throw problem(`${at}: correctIndex должен быть индексом ответа от 0 до ${variants.length - 1}.`);
            return { question, questionImg, variants, correctIndex };
        });
    }
    const STYLES = `
    .adm-root{--ad-bg:var(--bg-body,#111620);--ad-panel:var(--bg-panel,#191f2d);--ad-text:var(--text-main,#edf1fa);--ad-muted:var(--text-sec,#a1abc0);--ad-line:var(--glass-border,#2d3546);--ad-accent:#a89aff;--ad-soft:rgba(154,132,255,.12);--ad-green:#55cfa3;--ad-red:#f2929e;--ad-shadow:0 22px 65px #0003;color:var(--ad-text);font:14px/1.5 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;text-align:left;color-scheme:dark;width:100%;min-width:0}
    html.light .adm-root,body.light .adm-root,.theme-light .adm-root,[data-theme="light"] .adm-root{--ad-bg:#fff;--ad-panel:#f6f7fb;--ad-text:#232a3b;--ad-muted:#69758a;--ad-line:#e3e7f0;--ad-accent:#6c53ce;--ad-soft:#f0ecfc;--ad-green:#157653;--ad-red:#bd3e52;--ad-shadow:0 18px 60px #34415b12;color-scheme:light}
    .adm-root *{box-sizing:border-box}.adm-root button,.adm-root input,.adm-root select{font:inherit}.adm-root button{cursor:pointer}.adm-root button:disabled{opacity:.45;cursor:not-allowed}.adm-root :is(button,input,select):focus-visible{outline:2px solid var(--ad-accent);outline-offset:3px}.adm-root h2,.adm-root h3,.adm-root p{margin:0}.adm-root button{text-transform:none;letter-spacing:normal}.adm-shell{width:100%;max-width:1180px;margin:0 auto;background:var(--ad-bg);border:1px solid var(--ad-line);border-radius:24px;box-shadow:var(--ad-shadow);max-height:90vh;max-height:90dvh;overflow:auto;overscroll-behavior:contain;scrollbar-width:thin}
    .adm-head{padding:28px 30px 22px;display:flex;gap:16px;align-items:center}.adm-brand{width:48px;height:48px;display:grid;place-items:center;border:1px solid var(--ad-line);background:var(--ad-soft);border-radius:15px;color:var(--ad-accent);flex-shrink:0}.adm-eyebrow{color:var(--ad-muted);font-size:10px;letter-spacing:1.8px;margin-bottom:3px;font-weight:650}.adm-head h2{font-size:24px;font-weight:680;letter-spacing:-.8px;line-height:1.3}.adm-head p{color:var(--ad-muted);font-size:12px;margin-top:5px}.adm-live{margin-left:auto;display:flex;align-items:center;gap:7px;font-size:11px;color:var(--ad-muted);white-space:nowrap}.adm-dot{width:6px;height:6px;border-radius:50%;background:var(--ad-green)}
    .adm-summary{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;padding:0 30px 25px}.adm-summary-card{border:1px solid var(--ad-line);background:var(--ad-panel);border-radius:15px;padding:15px 17px;display:grid;grid-template-columns:1fr auto;gap:7px;align-items:center}.adm-summary-card span{font-size:11px;color:var(--ad-muted)}.adm-summary-card strong{font-size:27px;font-weight:650;letter-spacing:-1px;line-height:1.2}.adm-summary-card svg{color:var(--ad-accent);grid-column:2;grid-row:1 / 3}
    .adm-workspace{display:grid;grid-template-columns:330px minmax(0,1fr);border-top:1px solid var(--ad-line)}.adm-directory{border-right:1px solid var(--ad-line);padding:20px 14px;min-width:0}.adm-section-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:14px}.adm-section-head h3{font-size:14px;font-weight:650}.adm-count{color:var(--ad-muted);font-size:11px}.adm-search{position:relative}.adm-search>svg{position:absolute;left:12px;top:13px;color:var(--ad-muted)}.adm-input{width:100%;min-width:0;border:1px solid var(--ad-line);border-radius:10px;padding:10px 12px;background:var(--ad-bg);color:var(--ad-text);font-size:12px!important;outline:none}.adm-search .adm-input{padding-left:35px;padding-right:35px}.adm-search .adm-icon-btn{position:absolute;right:4px;top:5px}.adm-filter{display:flex;gap:5px;flex-wrap:wrap;margin:12px 0}.adm-chip{border:1px solid transparent;background:transparent;color:var(--ad-muted);border-radius:7px;padding:6px 8px;font-size:11px!important}.adm-chip.active{background:var(--ad-soft);color:var(--ad-accent);border-color:var(--ad-line)}.adm-sort{display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:10px;color:var(--ad-muted);margin-bottom:12px}.adm-sort select{background:var(--ad-bg);color:var(--ad-muted);border:1px solid var(--ad-line);border-radius:7px;padding:5px;font-size:10px}.adm-users{display:flex;flex-direction:column;gap:5px}.adm-person{display:flex;align-items:center;gap:10px;width:100%;text-align:left;color:var(--ad-text);background:transparent;border:1px solid transparent;border-radius:12px;padding:11px 10px}.adm-person:hover{background:var(--ad-panel)}.adm-person.selected{background:var(--ad-soft);border-color:var(--ad-line)}.adm-avatar{height:36px;width:36px;border-radius:11px;display:grid;place-items:center;background:var(--ad-panel);border:1px solid var(--ad-line);color:var(--ad-accent);font-size:12px;font-weight:700;flex-shrink:0}.adm-avatar.large{height:54px;width:54px;border-radius:17px;font-size:18px}.adm-person-text{flex:1;min-width:0}.adm-person-text strong{display:block;font-size:12px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.adm-person-text small{display:block;color:var(--ad-muted);font-size:10px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.adm-role-dot{width:6px;height:6px;border-radius:50%;background:var(--ad-green);flex-shrink:0}.adm-role-dot.banned{background:var(--ad-red)}.adm-person svg{color:var(--ad-accent)}
    .adm-pagination{display:flex;align-items:center;justify-content:space-between;gap:7px;margin-top:16px;color:var(--ad-muted);font-size:10px}.adm-btn{display:inline-flex;align-items:center;justify-content:center;gap:7px;padding:9px 12px;border:1px solid var(--ad-line);border-radius:9px;background:var(--ad-bg);color:var(--ad-text);font-size:12px!important;line-height:1.5;white-space:normal}.adm-btn:hover{background:var(--ad-panel)}.adm-btn.primary{background:var(--ad-accent);border-color:transparent;color:var(--ad-bg);font-weight:650}.adm-btn.danger{color:var(--ad-red);background:transparent}.adm-icon-btn{border:0;background:transparent;color:var(--ad-muted);padding:6px;border-radius:7px;display:grid;place-items:center}.adm-icon-btn:hover{background:var(--ad-soft);color:var(--ad-accent)}
    .adm-detail{padding:23px 26px 28px;min-width:0}.adm-profile{display:flex;align-items:center;gap:13px}.adm-profile-text{flex:1;min-width:0}.adm-profile h3{font-size:19px;font-weight:650;letter-spacing:-.4px;overflow-wrap:anywhere}.adm-profile p{font-size:12px;color:var(--ad-muted);overflow-wrap:anywhere}.adm-badges{display:flex;gap:6px;flex-wrap:wrap;margin-top:9px}.adm-badge{display:inline-flex;align-items:center;gap:4px;border:1px solid var(--ad-line);border-radius:6px;padding:2px 7px;font-size:10px;color:var(--ad-muted)}.adm-badge.good{color:var(--ad-green)}.adm-badge.bad{color:var(--ad-red)}.adm-badge.accent{color:var(--ad-accent);background:var(--ad-soft)}.adm-tabs{display:flex;gap:20px;overflow:auto;border-bottom:1px solid var(--ad-line);margin:25px 0 22px;scrollbar-width:thin}.adm-tab{border:0;border-bottom:2px solid transparent;display:flex;gap:6px;align-items:center;white-space:nowrap;background:transparent;color:var(--ad-muted);padding:0 0 12px;font-size:12px!important}.adm-tab.active{color:var(--ad-accent);border-bottom-color:var(--ad-accent)}
    .adm-section-label{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:12px}.adm-section-label h3{font-size:13px;font-weight:650}.adm-section-label p{font-size:11px;color:var(--ad-muted);margin-top:3px}.adm-modules{display:grid;grid-template-columns:1fr 1fr;gap:9px}.adm-module{display:flex;align-items:center;gap:10px;padding:13px 12px;border:1px solid var(--ad-line);border-radius:12px;background:var(--ad-bg);color:var(--ad-text);text-align:left;min-width:0}.adm-module:hover{background:var(--ad-panel)}.adm-module>svg{color:var(--ad-muted)}.adm-module.on>svg{color:var(--ad-accent)}.adm-module-name{flex:1;min-width:0;font-size:12px;font-weight:550}.adm-module-name small{display:block;font-size:10px;font-weight:400;color:var(--ad-muted);margin-top:2px}.adm-switch{width:29px;height:17px;border-radius:12px;background:var(--ad-line);padding:3px;flex-shrink:0;transition:background .15s}.adm-switch:before{content:'';display:block;width:11px;height:11px;border-radius:50%;background:var(--ad-bg);box-shadow:0 1px 3px #0003;transition:transform .15s}.on .adm-switch{background:var(--ad-accent)}.on .adm-switch:before{transform:translateX(12px)}.adm-setting{margin-top:18px;padding:15px;border:1px solid var(--ad-line);border-radius:12px;background:var(--ad-panel)}.adm-setting .adm-module{border:0;background:transparent;padding:0;width:100%}.adm-small{color:var(--ad-muted);font-size:11px;line-height:1.6}.adm-divider{height:1px;background:var(--ad-line);margin:22px 0}.adm-action-row{display:flex;align-items:center;justify-content:space-between;gap:15px;padding:14px 0;border-bottom:1px solid var(--ad-line)}.adm-action-row:last-child{border:0}.adm-action-row strong{display:block;font-size:12px;font-weight:600}.adm-action-row p{font-size:11px;color:var(--ad-muted);margin-top:3px}.adm-action-row .adm-btn{flex-shrink:0;max-width:45%}.adm-note{padding:12px;border:1px solid var(--ad-line);border-radius:10px;font-size:11px;color:var(--ad-muted);background:var(--ad-panel);display:flex;gap:8px;align-items:flex-start;margin-top:15px}
    .adm-stat-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.adm-stat{background:var(--ad-panel);border:1px solid var(--ad-line);border-radius:13px;padding:16px}.adm-stat-title{display:flex;align-items:center;gap:7px;font-size:11px;color:var(--ad-muted);margin-bottom:10px}.adm-stat-title svg{color:var(--ad-accent)}.adm-stat strong{font-size:25px;font-weight:650;letter-spacing:-.7px}.adm-stat strong small{font-size:12px;font-weight:400;color:var(--ad-muted);margin-left:4px}.adm-stat p{font-size:11px;color:var(--ad-muted);margin-top:5px}.adm-test-list{display:flex;flex-direction:column;gap:9px;margin-top:16px}.adm-test{display:flex;align-items:center;gap:10px;padding:13px;border:1px solid var(--ad-line);border-radius:11px}.adm-test>svg{color:var(--ad-accent)}.adm-test-text{min-width:0;flex:1}.adm-test strong{display:block;font-size:12px;overflow-wrap:anywhere;font-weight:600}.adm-test small{color:var(--ad-muted);font-size:10px}.adm-empty{padding:40px 18px;text-align:center;color:var(--ad-muted);font-size:12px}.adm-empty svg{margin:0 auto 12px;color:var(--ad-accent)}.adm-empty strong{display:block;font-size:14px;color:var(--ad-text);margin-bottom:5px}.adm-empty .adm-btn{margin-top:14px}.adm-empty.compact{padding:23px 10px}.adm-footer{display:flex;gap:10px;justify-content:space-between;padding:13px 30px;border-top:1px solid var(--ad-line);font-size:10px;color:var(--ad-muted)}.adm-banner{margin:0 30px 20px;padding:12px 14px;border:1px solid var(--ad-line);background:var(--ad-panel);border-radius:12px;display:flex;align-items:center;gap:12px;font-size:12px}.adm-banner span{flex:1}.adm-spinner{width:13px;height:13px;border:2px solid var(--ad-line);border-top-color:var(--ad-accent);display:inline-block;border-radius:50%;animation:adm-spin .7s linear infinite}.adm-saving{font-size:10px;color:var(--ad-muted);display:flex;align-items:center;gap:5px}
    .adm-overlay{position:fixed;inset:0;background:#10172788;backdrop-filter:blur(5px);z-index:10001;display:flex;align-items:center;justify-content:center;padding:18px}.adm-dialog{width:100%;max-width:460px;max-height:90dvh;overflow:auto;background:var(--ad-bg);border:1px solid var(--ad-line);border-radius:20px;padding:24px;box-shadow:var(--ad-shadow);animation:adm-enter .15s ease-out}.adm-dialog h3{font-size:19px;letter-spacing:-.4px;margin:10px 0}.adm-dialog p{font-size:13px;color:var(--ad-muted);line-height:1.6}.adm-dialog>svg{color:var(--ad-accent)}.adm-dialog-actions{display:flex;justify-content:flex-end;gap:9px;margin-top:22px}.adm-dialog label{display:block;font-size:12px;margin:16px 0 7px}.adm-upload{display:block;width:100%;padding:22px 16px;border:1px dashed var(--ad-line);border-radius:12px;background:var(--ad-panel);color:var(--ad-text);text-align:center;margin-top:14px}.adm-upload svg{margin:0 auto 8px;color:var(--ad-accent)}.adm-upload small{display:block;color:var(--ad-muted);font-size:11px;margin-top:6px}.adm-error{font-size:12px!important;color:var(--ad-red)!important;margin-top:12px!important}.adm-preview{display:flex;align-items:center;gap:8px;background:var(--ad-soft);color:var(--ad-accent);padding:10px;border-radius:9px;font-size:11px;margin-top:12px;overflow-wrap:anywhere}.adm-toasts{position:fixed;right:20px;top:20px;z-index:10005;display:flex;flex-direction:column;gap:8px;max-width:min(360px,calc(100vw - 40px))}.adm-toast{display:flex;gap:9px;align-items:center;background:var(--ad-bg);color:var(--ad-text);border:1px solid var(--ad-line);box-shadow:var(--ad-shadow);border-radius:12px;padding:12px;font-size:12px;animation:adm-enter .2s ease-out}.adm-toast>svg{color:var(--ad-green)}.adm-toast.error>svg{color:var(--ad-red)}.adm-toast span{flex:1}.adm-hidden{position:absolute;width:1px;height:1px;clip:rect(0,0,0,0);overflow:hidden;white-space:nowrap}.adm-skeleton{height:60px;border-radius:11px;background:var(--ad-panel);margin:8px 0;animation:adm-fade 1.2s infinite}
    @keyframes adm-spin{to{transform:rotate(360deg)}}@keyframes adm-enter{from{opacity:0;transform:translateY(7px)}to{opacity:1;transform:none}}@keyframes adm-fade{50%{opacity:.4}}
    @media(max-width:850px){.adm-workspace{grid-template-columns:280px minmax(0,1fr)}.adm-detail{padding:20px 18px}.adm-tabs{gap:12px}.adm-head{padding:22px}.adm-summary{padding:0 22px 20px;gap:9px}.adm-modules{grid-template-columns:1fr}.adm-live{display:none}}
    @media(max-width:620px){.adm-shell{border-radius:18px;max-height:92dvh}.adm-head{padding:20px 16px}.adm-head h2{font-size:21px}.adm-head p{font-size:11px}.adm-summary{grid-template-columns:1fr 1fr;padding:0 16px 18px}.adm-summary-card{padding:12px}.adm-summary-card strong{font-size:23px}.adm-workspace{grid-template-columns:1fr}.adm-directory{border-right:0;border-bottom:1px solid var(--ad-line);padding:16px}.adm-users{max-height:255px;overflow:auto;scrollbar-width:thin}.adm-detail{padding:20px 16px}.adm-modules{grid-template-columns:1fr 1fr}.adm-module{padding:11px 8px;gap:6px}.adm-module-name{font-size:11px}.adm-module>svg{width:14px}.adm-action-row{align-items:flex-start}.adm-footer{padding:13px 16px;flex-wrap:wrap}.adm-banner{margin:0 16px 16px}.adm-profile h3{font-size:17px}.adm-input{font-size:16px!important}.adm-stat{padding:12px}.adm-dialog{padding:20px}.adm-saving{font-size:9px}}
    @media(max-width:360px){.adm-modules{grid-template-columns:1fr}.adm-tabs{gap:10px}.adm-tab{font-size:11px!important}.adm-action-row{flex-wrap:wrap}.adm-action-row .adm-btn{max-width:100%}}
    @media(prefers-reduced-motion:reduce){.adm-root *{animation:none!important;transition:none!important}}
    `;

    const Btn = ({ children, variant = '', ...props }) => <button type="button" className={`adm-btn ${variant}`} {...props}>{children}</button>;
    const IconBtn = ({ icon = 'x', label, ...props }) => <button type="button" className="adm-icon-btn" title={label} aria-label={label} {...props}><AdminIcon name={icon} size={15}/></button>;
    const Empty = ({ title, children, compact = false }) => <div className={`adm-empty ${compact ? 'compact' : ''}`}><AdminIcon name="inbox" size={26}/><strong>{title}</strong>{children}</div>;
    function Dialog({ title, children, onClose, busy }) {
        const ref = useRef(null);
        const busyRef = useRef(busy); busyRef.current = busy;
        const closeRef = useRef(onClose); closeRef.current = onClose;
        useEffect(() => {
            const prior = document.activeElement;
            ref.current?.focus();
            const handle = event => {
                if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); if (!busyRef.current) closeRef.current(); }
                if (event.key !== 'Tab') return;
                const nodes = Array.from(ref.current?.querySelectorAll('button:not(:disabled),input:not(:disabled),select:not(:disabled),[tabindex="0"]') || []).filter(node => node.getClientRects().length);
                if (!nodes.length) { event.preventDefault(); ref.current?.focus(); return; }
                const first = nodes[0], last = nodes[nodes.length - 1];
                if (event.shiftKey && (document.activeElement === first || document.activeElement === ref.current)) { event.preventDefault(); last.focus(); }
                else if (!event.shiftKey && (document.activeElement === last || !ref.current?.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
            };
            document.addEventListener('keydown', handle, true);
            return () => { document.removeEventListener('keydown', handle, true); if (prior?.isConnected) prior.focus(); };
        }, []);
        return <div className="adm-overlay" onMouseDown={event => { if (event.target === event.currentTarget && !busy) onClose(); }}><section className="adm-dialog" ref={ref} role="dialog" aria-modal="true" aria-label={title} tabIndex={-1}><AdminIcon name="shield" size={24}/><h3>{title}</h3>{children}</section></div>;
    }
    function ImportDialog({ user, onClose, onSave, busy }) {
        const [title, setTitle] = useState('');
        const [data, setData] = useState(null);
        const [fileName, setFileName] = useState('');
        const [error, setError] = useState('');
        const [reading, setReading] = useState(false);
        const fileRef = useRef(null), sequence = useRef(0), alive = useRef(true);
        useEffect(() => { alive.current = true; return () => { alive.current = false; sequence.current++; }; }, []);
        async function read(file) {
            if (!file) return;
            const seq = ++sequence.current;
            setData(null); setError(''); setFileName(file.name); setReading(true);
            try {
                if (file.size > MAX_FILE) throw problem('Файл больше 350 КБ. Уменьшите тест или используйте ссылки на изображения.');
                let parsed;
                try { parsed = JSON.parse((await file.text()).replace(/^\uFEFF/, '')); } catch { throw problem('Не удалось прочитать JSON. Проверьте формат файла.'); }
                const normalized = normalizeTest(parsed);
                if (!alive.current || sequence.current !== seq) return;
                setData(normalized); setTitle(previous => previous || file.name.replace(/\.json$/i, '').slice(0, 100));
            } catch (e) { if (alive.current && sequence.current === seq) setError(errorText(e)); }
            finally { if (alive.current && sequence.current === seq) setReading(false); }
        }
        async function save(event) {
            event.preventDefault();
            if (!title.trim() || !data || busy || reading) return;
            setError('');
            try { await onSave({ title: title.trim(), data }); } catch (e) { if (alive.current) setError(errorText(e)); }
        }
        return <Dialog title="Назначить тест" onClose={onClose} busy={busy}>
            <p>Получатель: {nameOf(user)}. Загрузите JSON с вопросами, вариантами и индексами правильных ответов.</p>
            <form onSubmit={save}>
                <input className="adm-hidden" type="file" accept=".json,application/json" ref={fileRef} tabIndex={-1} aria-label="Файл теста" disabled={busy} onChange={event => { const file = event.target.files?.[0]; event.target.value = ''; read(file); }}/>
                <button className="adm-upload" type="button" disabled={busy || reading} onClick={() => fileRef.current?.click()}><AdminIcon name="cloud" size={23}/>{reading ? 'Проверяем файл…' : fileName || 'Выбрать JSON-файл'}<small>До 350 КБ · до 300 вопросов</small></button>
                {data && <div className="adm-preview"><AdminIcon name="checkCircle" size={15}/>Проверено вопросов: {data.length}</div>}
                <label htmlFor="adm-test-title">Название теста</label><input id="adm-test-title" className="adm-input" autoComplete="off" maxLength={100} value={title} onChange={event => setTitle(event.target.value)} placeholder="Например: Excel — базовые формулы" disabled={busy}/>
                {error && <p className="adm-error" role="alert">{error}</p>}
                <div className="adm-dialog-actions"><Btn disabled={busy} onClick={onClose}>Отмена</Btn><button type="submit" className="adm-btn primary" disabled={busy || reading || !data || !title.trim()}>{busy ? 'Сохраняем…' : 'Назначить тест'}</button></div>
            </form>
        </Dialog>;
    }
    function UserDetails({ user, self, busy, onAction, onModule, onHints, onImport, onRemove }) {
        const [tab, setTab] = useState('access');
        const tests = testsOf(user), avg = average(user);
        const excel = user.excelProgress || {}, typing = user.typingProgress || {}, hotkeys = user.hotkeyProgress || {};
        const tabs = [['access', 'settings', 'Доступы'], ['tests', 'fileText', `Тесты · ${tests.length}`], ['stats', 'barChart', 'Статистика'], ['account', 'shield', 'Аккаунт']];
        return <section className="adm-detail" aria-label={`Пользователь ${nameOf(user)}`} aria-busy={busy}>
            <div className="adm-profile"><div className="adm-avatar large">{initials(user)}</div><div className="adm-profile-text"><h3>{nameOf(user)}</h3><p>{str(user.email) || 'Email не указан'}</p><div className="adm-badges"><span className={`adm-badge ${user.isBanned ? 'bad' : 'good'}`}>{user.isBanned ? 'Заблокирован' : 'Не заблокирован'}</span><span className="adm-badge">{user.role === 'admin' ? 'Администратор' : 'Студент'}</span>{self && <span className="adm-badge accent">Это вы</span>}</div></div>{busy && <div className="adm-saving" role="status"><i className="adm-spinner"/>Сохранение</div>}</div>
            <div className="adm-tabs" role="tablist" aria-label="Разделы пользователя">{tabs.map(([id, icon, label], index) => <button key={id} type="button" className={`adm-tab ${tab === id ? 'active' : ''}`} role="tab" id={`adm-tab-${id}`} aria-controls={`adm-pane-${id}`} aria-selected={tab === id} tabIndex={tab === id ? 0 : -1} onClick={() => setTab(id)} onKeyDown={event => { const next = event.key === 'ArrowRight' ? (index + 1) % tabs.length : event.key === 'ArrowLeft' ? (index + tabs.length - 1) % tabs.length : event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : -1; if (next >= 0) { event.preventDefault(); setTab(tabs[next][0]); document.getElementById(`adm-tab-${tabs[next][0]}`)?.focus(); } }}><AdminIcon name={icon} size={14}/>{label}</button>)}</div>
            <div role="tabpanel" id={`adm-pane-${tab}`} aria-labelledby={`adm-tab-${tab}`}>
            {tab === 'access' && <>
                <div className="adm-section-label"><div><h3>Модули платформы</h3><p>Настройте доступ к каждому разделу.</p></div><span className="adm-count">{AVAILABLE_MODULES.filter(module => modulesOf(user).includes(module.id)).length} / {AVAILABLE_MODULES.length}</span></div>
                <div className="adm-modules">{AVAILABLE_MODULES.map(module => { const on = modulesOf(user).includes(module.id); return <button key={module.id} type="button" role="switch" aria-checked={on} aria-label={`Доступ: ${module.label}`} disabled={busy} className={`adm-module ${on ? 'on' : ''}`} onClick={() => onModule(module.id, !on)}><AdminIcon name={module.icon} size={18}/><span className="adm-module-name">{module.label}<small>{on ? 'Доступ открыт' : 'Доступ закрыт'}</small></span><span className="adm-switch" aria-hidden="true"/></button>; })}</div>
                <div className="adm-setting"><button type="button" role="switch" aria-label="Подсказки Excel" aria-checked={user.excelHintsEnabled !== false} disabled={busy} className={`adm-module ${user.excelHintsEnabled !== false ? 'on' : ''}`} onClick={() => onHints(user.excelHintsEnabled === false)}><AdminIcon name="lightbulb" size={19}/><span className="adm-module-name">Подсказки Excel<small>{user.excelHintsEnabled !== false ? 'Помощь при выполнении заданий включена' : 'Режим экзамена — подсказки отключены'}</small></span><span className="adm-switch" aria-hidden="true"/></button></div>
                {user.isBanned && <div className="adm-note"><AdminIcon name="lock" size={15}/>Аккаунт заблокирован. Настройка модулей не снимает общую блокировку.</div>}
            </>}
            {tab === 'tests' && <><div className="adm-section-label"><div><h3>Персональные тесты</h3><p>Задания, назначенные этому пользователю.</p></div><Btn variant="primary" onClick={onImport} disabled={busy}><AdminIcon name="cloud" size={14}/>Назначить</Btn></div>{!tests.length ? <Empty title="Пока нет назначенных тестов">Загрузите файл с вопросами, чтобы добавить первое задание.</Empty> : <div className="adm-test-list">{tests.map((test, index) => <div className="adm-test" key={`${test.id}-${index}`}><AdminIcon name="fileText" size={19}/><div className="adm-test-text"><strong>{str(test.title) || 'Без названия'}</strong><small>{array(test.data).length} вопросов</small></div><IconBtn label={`Удалить тест: ${str(test.title) || 'Без названия'}`} disabled={busy || test.id == null} onClick={() => onRemove(test)}/></div>)}</div>}</>}
            {tab === 'stats' && <><div className="adm-section-label"><div><h3>Результаты обучения</h3><p>Показатели из профиля пользователя.</p></div></div><div className="adm-stat-grid">
                <div className="adm-stat"><div className="adm-stat-title"><AdminIcon name="barChart" size={16}/>Excel</div><strong>{number(excel.level, 1)}<small>уровень</small></strong><p>{number(excel.xp)} XP · {Array.isArray(excel.completedLessons) ? excel.completedLessons.length : number(excel.completedLessons)} заданий</p><p>Серия: {number(excel.streak)}</p></div>
                <div className="adm-stat"><div className="adm-stat-title"><AdminIcon name="keyboard" size={16}/>Печать</div><strong>{number(typing.maxWpm)}<small>WPM</small></strong><p>Завершено: {number(typing.testsCompleted)}</p><p>Лучшее комбо: {number(typing.maxCombo)}</p></div>
                <div className="adm-stat"><div className="adm-stat-title"><AdminIcon name="zap" size={16}/>Горячие клавиши</div><strong>{number(hotkeys.maxScore)}<small>рекорд</small></strong><p>Сессий: {number(hotkeys.sessionsPlayed)}</p></div>
                <div className="adm-stat"><div className="adm-stat-title"><AdminIcon name="fileText" size={16}/>Тестирование</div><strong>{avg === null ? '—' : `${avg}%`}</strong><p>{avg === null ? 'Нет корректных оценок' : 'Средний результат'}</p><p>Попыток в истории: {array(user.testHistory).length}</p></div>
            </div><div className="adm-divider"/><div className="adm-action-row"><div><strong>Сброс прогресса</strong><p>Удалит статистику Excel, печати, горячих клавиш и историю тестов.</p></div><Btn variant="danger" disabled={busy} onClick={() => onAction('reset')}>Сбросить</Btn></div></>}
            {tab === 'account' && <><div className="adm-section-label"><div><h3>Управление аккаунтом</h3><p>Изменения применяются после подтверждения.</p></div></div><div className="adm-action-row"><div><strong>Права администратора</strong><p>{user.role === 'admin' ? 'Доступ к панели управления выдан.' : 'Пользователь работает с правами студента.'}</p></div><Btn disabled={self || busy} onClick={() => onAction('role')}>{user.role === 'admin' ? 'Снять права' : 'Выдать права'}</Btn></div><div className="adm-action-row"><div><strong>{user.isBanned ? 'Снять блокировку' : 'Заблокировать аккаунт'}</strong><p>{user.isBanned ? 'Разрешить пользователю вернуться к обучению.' : 'Ограничить доступ пользователя к платформе.'}</p></div><Btn variant={user.isBanned ? '' : 'danger'} disabled={self || busy} onClick={() => onAction('ban')}>{user.isBanned ? 'Разблокировать' : 'Заблокировать'}</Btn></div>{self && <div className="adm-note"><AdminIcon name="info" size={15}/>Собственные права администратора и блокировку здесь изменить нельзя.</div>}</>}
            </div>
        </section>;
    }
    function AdminPanel({ onKicked }) {
        const [uid, setUid] = useState(window.auth?.currentUser?.uid || null);
        const [authReady, setAuthReady] = useState(!!window.auth?.currentUser || typeof window.auth?.onAuthStateChanged !== 'function');
        const [access, setAccess] = useState({ state: 'checking', uid: null, message: '' });
        const [users, setUsers] = useState(null);
        const [loadError, setLoadError] = useState('');
        const [retry, setRetry] = useState(0);
        const [search, setSearch] = useState('');
        const [filter, setFilter] = useState('all');
        const [sort, setSort] = useState('name');
        const [page, setPage] = useState(1);
        const [selectedId, setSelectedId] = useState(null);
        const [pending, setPending] = useState(() => new Set());
        const [confirm, setConfirm] = useState(null);
        const [dialogError, setDialogError] = useState('');
        const [importUid, setImportUid] = useState(null);
        const [toasts, setToasts] = useState([]);
        const alive = useRef(true), locks = useRef(new Set()), timers = useRef(new Set());
        const actor = useRef(uid), accessRef = useRef(access), kicked = useRef(null), onKickedRef = useRef(onKicked);
        actor.current = uid; accessRef.current = access; onKickedRef.current = onKicked;
        const ready = access.state === 'ready' && access.uid === uid;
        useEffect(() => {
            alive.current = true;
            let style = document.getElementById('ultimate-admin-styles');
            if (!style) { style = document.createElement('style'); style.id = 'ultimate-admin-styles'; document.head.appendChild(style); }
            style.textContent = STYLES;
            return () => { alive.current = false; timers.current.forEach(clearTimeout); timers.current.clear(); };
        }, []);
        useEffect(() => {
            const auth = window.auth;
            if (!auth) { setAccess({ state: 'error', uid: null, message: 'Авторизация не подключена. Перезагрузите страницу.' }); return; }
            if (typeof auth.onAuthStateChanged === 'function') return auth.onAuthStateChanged(user => {
                actor.current = user?.uid || null;
                setAuthReady(true); setUid(user?.uid || null); setConfirm(null); setImportUid(null);
            }, () => setAccess({ state: 'error', uid: null, message: 'Не удалось проверить авторизацию.' }));
        }, [retry]);
        useEffect(() => {
            let live = true;
            setUsers(null); setLoadError(''); setSelectedId(null);
            if (!window.auth) { setAccess({ state: 'error', uid, message: 'Авторизация не подключена. Перезагрузите страницу.' }); return; }
            if (!authReady) { setAccess({ state: 'checking', uid, message: '' }); return; }
            if (!window.db) { setAccess({ state: 'error', uid, message: 'База данных не подключена. Перезагрузите страницу.' }); return; }
            if (!uid) { setAccess({ state: 'denied', uid, message: 'Войдите в аккаунт администратора.' }); return; }
            setAccess({ state: 'checking', uid, message: '' });
            const unsubscribe = window.db.collection('users').doc(uid).onSnapshot(snapshot => {
                if (!live) return;
                const user = snapshot.exists ? snapshot.data() : null;
                if (!user || user.role !== 'admin' || user.isBanned) {
                    setAccess({ state: 'denied', uid, message: user?.isBanned ? 'Аккаунт заблокирован.' : 'Для этой панели нужны права администратора.' });
                    setUsers(null); setConfirm(null); setImportUid(null);
                } else setAccess({ state: 'ready', uid, message: '' });
            }, error => {
                if (!live) return;
                const denied = String(error.code).includes('permission-denied');
                setAccess({ state: denied ? 'denied' : 'error', uid, message: denied ? 'Нет доступа к профилю администратора.' : 'Не удалось проверить права. Проверьте подключение и повторите.' });
                setUsers(null); setConfirm(null); setImportUid(null);
            });
            return () => { live = false; unsubscribe(); };
        }, [uid, retry, authReady]);
        useEffect(() => {
            if (access.state !== 'denied') { if (access.state === 'ready') kicked.current = null; return; }
            const timer = setTimeout(() => {
                if (kicked.current === access.message) return;
                kicked.current = access.message; onKickedRef.current?.();
            }, 1400);
            return () => clearTimeout(timer);
        }, [access.state, access.message]);
        useEffect(() => {
            if (!ready || !window.db) return;
            let live = true;
            setLoadError('');
            const unsubscribe = window.db.collection('users').onSnapshot(snapshot => {
                if (!live) return;
                setUsers(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
                setLoadError('');
            }, error => {
                if (!live) return;
                setUsers(null);
                setLoadError(String(error.code).includes('permission-denied') ? 'Нет разрешения на чтение списка пользователей.' : 'Не удалось загрузить пользователей. Проверьте соединение и повторите.');
            });
            return () => { live = false; unsubscribe(); };
        }, [ready, uid, retry]);
        useEffect(() => { setPage(1); setSelectedId(null); }, [search, filter, sort]);
        const list = useMemo(() => {
            const q = search.trim().toLocaleLowerCase();
            return array(users).filter(user => (filter !== 'admins' || user.role === 'admin') && (filter !== 'banned' || user.isBanned) && (filter !== 'students' || user.role !== 'admin') && (!q || `${nameOf(user)} ${str(user.email)} ${user.id}`.toLocaleLowerCase().includes(q))).sort((a, b) => {
                if (sort === 'tests') { const delta = testsOf(b).length - testsOf(a).length; if (delta) return delta; }
                if (sort === 'role') { const delta = Number(b.role === 'admin') - Number(a.role === 'admin'); if (delta) return delta; }
                return nameOf(a).localeCompare(nameOf(b), 'ru', { sensitivity: 'base' }) || a.id.localeCompare(b.id);
            });
        }, [users, search, filter, sort]);
        const pageCount = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
        const currentPage = Math.min(page, pageCount);
        const visible = list.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
        const selected = list.find(user => user.id === selectedId) || visible[0] || null;
        const importUser = array(users).find(user => user.id === importUid);
        const stats = useMemo(() => [array(users).length, array(users).filter(user => user.role === 'admin').length, array(users).filter(user => user.isBanned).length, array(users).reduce((sum, user) => sum + testsOf(user).length, 0)], [users]);
        function toast(message, type = 'success') {
            if (!alive.current) return;
            const id = `${Date.now()}-${Math.random()}`;
            setToasts(previous => [...previous.slice(-3), { id, message, type }]);
            const timer = setTimeout(() => { timers.current.delete(timer); if (alive.current) setToasts(previous => previous.filter(item => item.id !== id)); }, 4500);
            timers.current.add(timer);
        }
        // Транзакция читает актуальный профиль и не затирает параллельные изменения.
        // Реальная авторизация должна оставаться в существующих Firestore Rules.
        async function mutate(targetUid, transform, message) {
            const actorUid = actor.current;
            if (!actorUid || accessRef.current.state !== 'ready' || accessRef.current.uid !== actorUid) throw problem('Права администратора не подтверждены.');
            if (locks.current.has(targetUid)) throw problem('Для этого пользователя уже выполняется сохранение.');
            locks.current.add(targetUid); setPending(new Set(locks.current));
            try {
                const db = window.db;
                if (!db?.runTransaction) throw problem('Не удалось подключить транзакции Firebase. Проверьте подключение базы данных.');
                await db.runTransaction(async transaction => {
                    if (!alive.current || actor.current !== actorUid) throw problem('Аккаунт изменился. Откройте панель заново.');
                    const selfRef = db.collection('users').doc(actorUid), targetRef = db.collection('users').doc(targetUid);
                    const selfSnapshot = await transaction.get(selfRef);
                    const self = selfSnapshot.exists ? selfSnapshot.data() : null;
                    if (!self || self.role !== 'admin' || self.isBanned) throw problem('Права администратора отозваны.');
                    const targetSnapshot = targetUid === actorUid ? selfSnapshot : await transaction.get(targetRef);
                    if (!targetSnapshot.exists) throw problem('Пользователь уже удалён.');
                    const current = targetSnapshot.data();
                    const patch = transform(current, actorUid);
                    if (!alive.current || actor.current !== actorUid) throw problem('Аккаунт изменился.');
                    transaction.update(targetRef, patch);
                });
                if (alive.current && actor.current === actorUid && message) toast(message);
            } finally {
                locks.current.delete(targetUid);
                if (alive.current) setPending(new Set(locks.current));
            }
        }
        function quick(transform, message = 'Настройки сохранены') {
            if (!selected) return;
            mutate(selected.id, transform, message).catch(error => toast(errorText(error), 'error'));
        }
        function ask(kind) {
            if (!selected) return;
            const user = selected;
            if (kind !== 'reset' && user.id === actor.current) { toast('Собственные права и блокировку изменить нельзя.', 'error'); return; }
            const config = kind === 'role' ? { title: user.role === 'admin' ? 'Снять права администратора?' : 'Выдать права администратора?', message: `${nameOf(user)} ${user.role === 'admin' ? 'потеряет' : 'получит'} доступ к панели управления.`, label: user.role === 'admin' ? 'Снять права' : 'Выдать права', danger: true, value: user.role !== 'admin', expected: user.role } : kind === 'ban' ? { title: user.isBanned ? 'Снять блокировку?' : 'Заблокировать пользователя?', message: `${nameOf(user)} ${user.isBanned ? 'снова получит доступ к платформе.' : 'будет заблокирован на платформе.'}`, label: user.isBanned ? 'Разблокировать' : 'Заблокировать', danger: !user.isBanned, value: !user.isBanned, expected: !!user.isBanned } : { title: 'Сбросить статистику?', message: `Прогресс Excel, печати, горячих клавиш и история тестов для ${nameOf(user)} будут удалены без возможности восстановления. Назначенные тесты останутся.`, label: 'Сбросить статистику', danger: true };
            setDialogError(''); setConfirm({ ...config, kind, uid: user.id });
        }
        async function confirmAction() {
            if (!confirm || locks.current.has(confirm.uid)) return;
            const job = confirm; setDialogError('');
            try {
                await mutate(job.uid, (current, actorUid) => {
                    if (job.kind === 'role' || job.kind === 'ban') {
                        if (job.uid === actorUid) throw problem('Нельзя изменять собственные права или блокировку.');
                        if (job.kind === 'role') {
                            if (current.role !== job.expected) throw problem('Роль уже изменена другим администратором. Закройте окно и проверьте профиль.');
                            return { role: job.value ? 'admin' : 'student' };
                        }
                        if (!!current.isBanned !== job.expected) throw problem('Блокировка уже изменена. Закройте окно и проверьте профиль.');
                        return { isBanned: job.value };
                    }
                    if (job.kind === 'remove') {
                        if (current.assignedTests != null && !Array.isArray(current.assignedTests)) throw problem('Список тестов в профиле имеет неверный формат.');
                        return { assignedTests: array(current.assignedTests).filter(test => test?.id !== job.testId) };
                    }
                    return { testHistory: [], excelProgress: { level: 1, xp: 0, completedLessons: 0, streak: 0 }, typingProgress: { maxWpm: 0, maxCombo: 0, testsCompleted: 0 }, hotkeyProgress: { maxScore: 0, sessionsPlayed: 0 } };
                }, job.kind === 'remove' ? 'Тест удалён' : job.kind === 'reset' ? 'Статистика сброшена' : 'Изменения сохранены');
                if (alive.current) setConfirm(null);
            } catch (error) { if (alive.current) setDialogError(errorText(error)); }
        }
        async function saveTest(test) {
            const targetUid = importUid, actorUid = actor.current;
            // Числовой id сохранён для совместимости с существующим тестовым модулем.
            const id = Date.now() * 1000 + Math.floor(Math.random() * 1000);
            await mutate(targetUid, current => {
                if (current.assignedTests != null && !Array.isArray(current.assignedTests)) throw problem('Список тестов в профиле имеет неверный формат.');
                if (testsOf(current).some(item => item.id === id)) throw problem('Повторите назначение теста.');
                const assignedTests = [...array(current.assignedTests), { id, title: test.title, data: test.data }];
                // Консервативный бюджет: вопросы хранятся в одном документе пользователя.
                const bytes = new TextEncoder().encode(JSON.stringify({ ...current, assignedTests })).length;
                if (bytes > 700 * 1024) throw problem('Профиль содержит слишком много данных. Удалите ненужные назначенные тесты или уменьшите изображения.');
                return { assignedTests };
            }, 'Тест назначен');
            if (alive.current && actor.current === actorUid) setImportUid(null);
        }
        const changePage = value => { setPage(Math.max(1, Math.min(pageCount, value))); setSelectedId(null); };
        return <div className="adm-root">
            <div className="adm-toasts" aria-live="polite">{toasts.map(item => <div key={item.id} className={`adm-toast ${item.type}`}><AdminIcon name={item.type === 'error' ? 'alertTriangle' : 'checkCircle'} size={17}/><span>{item.message}</span><IconBtn label="Скрыть уведомление" onClick={() => setToasts(previous => previous.filter(t => t.id !== item.id))}/></div>)}</div>
            {ready && confirm && <Dialog title={confirm.title} busy={pending.has(confirm.uid)} onClose={() => setConfirm(null)}><p>{confirm.message}</p>{dialogError && <p className="adm-error" role="alert">{dialogError}</p>}<div className="adm-dialog-actions"><Btn disabled={pending.has(confirm.uid)} onClick={() => setConfirm(null)}>Отмена</Btn><Btn variant={confirm.danger ? 'danger' : 'primary'} disabled={pending.has(confirm.uid)} onClick={confirmAction}>{pending.has(confirm.uid) ? 'Сохраняем…' : confirm.label}</Btn></div></Dialog>}
            {ready && importUser && <ImportDialog key={importUid} user={importUser} busy={pending.has(importUid)} onClose={() => setImportUid(null)} onSave={saveTest}/>}
            <main className="adm-shell" aria-label="Панель администратора">
                <header className="adm-head"><div className="adm-brand"><AdminIcon name="shield" size={24}/></div><div><div className="adm-eyebrow">ULTIMATE LMS / ADMIN</div><h2>Панель управления</h2><p>Пользователи, доступы и результаты обучения</p></div>{ready && !loadError && users && <div className="adm-live"><span className="adm-dot"/>Автообновление</div>}</header>
                {!ready ? <Empty title={access.state === 'checking' ? 'Проверяем права доступа…' : access.state === 'denied' ? 'Доступ ограничен' : 'Не удалось открыть панель'}><p role="status">{access.message}</p>{access.state === 'error' && <Btn onClick={() => setRetry(value => value + 1)}>Повторить</Btn>}</Empty> : <>
                    <div className="adm-summary">{[['Пользователей', 'users'], ['Администраторов', 'shield'], ['Заблокировано', 'ban'], ['Назначенных тестов', 'fileText']].map(([label, icon], index) => <div className="adm-summary-card" key={label}><span>{label}</span><strong>{users === null ? '—' : stats[index]}</strong><AdminIcon name={icon} size={21}/></div>)}</div>
                    {loadError ? <div className="adm-banner" role="alert"><AdminIcon name="alertTriangle" size={19}/><span>{loadError}</span><Btn onClick={() => setRetry(value => value + 1)}>Повторить</Btn></div> : <div className="adm-workspace">
                        <aside className="adm-directory" aria-label="Список пользователей"><div className="adm-section-head"><h3>Пользователи</h3><span className="adm-count">{list.length} найдено</span></div><div className="adm-search"><AdminIcon name="search" size={15}/><input className="adm-input" value={search} onChange={event => setSearch(event.target.value)} placeholder="Имя, email или UID" aria-label="Поиск пользователей"/>{search && <IconBtn label="Очистить поиск" onClick={() => setSearch('')}/>}</div>
                            <div className="adm-filter" aria-label="Фильтр пользователей">{[['all', 'Все'], ['students', 'Студенты'], ['admins', 'Админы'], ['banned', 'Заблокированы']].map(([id, label]) => <button type="button" key={id} className={`adm-chip ${filter === id ? 'active' : ''}`} aria-pressed={filter === id} onClick={() => setFilter(id)}>{label}</button>)}</div>
                            <div className="adm-sort"><span>Сортировка</span><select aria-label="Сортировка пользователей" value={sort} onChange={event => setSort(event.target.value)}><option value="name">По имени</option><option value="role">Администраторы выше</option><option value="tests">Больше тестов</option></select></div>
                            <div className="adm-users">{users === null ? <div role="status" aria-label="Загрузка пользователей">{[0, 1, 2, 3].map(i => <div key={i} className="adm-skeleton"/>)}</div> : !visible.length ? <Empty compact title={users.length ? 'Никого не нашли' : 'Пока нет пользователей'}>{users.length ? 'Измените поиск или фильтр.' : 'Здесь появятся зарегистрированные пользователи.'}</Empty> : visible.map(user => <button type="button" key={user.id} className={`adm-person ${selected?.id === user.id ? 'selected' : ''}`} aria-pressed={selected?.id === user.id} onClick={() => setSelectedId(user.id)}><span className="adm-avatar">{initials(user)}</span><span className="adm-person-text"><strong>{nameOf(user)}{user.id === uid ? ' · Вы' : ''}</strong><small>{str(user.email) || user.id}</small></span>{user.role === 'admin' && <AdminIcon name="shield" size={13}/>}<span className={`adm-role-dot ${user.isBanned ? 'banned' : ''}`} title={user.isBanned ? 'Заблокирован' : 'Не заблокирован'}/></button>)}</div>
                            {list.length > PAGE_SIZE && <nav className="adm-pagination" aria-label="Страницы пользователей"><Btn disabled={currentPage === 1} onClick={() => changePage(currentPage - 1)}>Назад</Btn><span>{currentPage} / {pageCount}</span><Btn disabled={currentPage === pageCount} onClick={() => changePage(currentPage + 1)}>Далее</Btn></nav>}
                        </aside>
                        {selected ? <UserDetails key={selected.id} user={selected} self={selected.id === uid} busy={pending.has(selected.id)} onAction={ask} onModule={(moduleId, enabled) => quick(current => { const modules = modulesOf(current); return { allowedModules: enabled ? [...new Set([...modules, moduleId])] : modules.filter(id => id !== moduleId) }; })} onHints={enabled => quick(() => ({ excelHintsEnabled: enabled }))} onImport={() => setImportUid(selected.id)} onRemove={test => { setDialogError(''); setConfirm({ kind: 'remove', uid: selected.id, testId: test.id, title: 'Удалить назначенный тест?', message: `«${str(test.title) || 'Без названия'}» будет удалён у ${nameOf(selected)}.`, label: 'Удалить тест', danger: true }); }}/> : <Empty title={users === null ? 'Загружаем профили…' : 'Выберите пользователя'}>Здесь будут доступы, тесты и статистика.</Empty>}
                    </div>}
                </>}
                <footer className="adm-footer"><span>Ultimate LMS</span><span>Изменения сохраняются отдельно для каждого пользователя</span></footer>
            </main>
        </div>;
    }
    Object.assign(window, { AdminPanel });
})();
