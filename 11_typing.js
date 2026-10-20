// --- 11_typing.js: ProType + TypeDrive. Полная замена. React / Babel / Firebase compat. ---
// Онлайн: добавьте блок TypeDrive из firestore-typedrive.rules.txt внутрь match /databases/{database}/documents.
// React + существующий Firebase compat. JSX подключается как раньше.
(function () {
const { useState, useEffect, useRef } = React;
const TEXTS = {
    en: [
        "The universe is an unimaginably vast place, constantly expanding at an accelerating rate. Scientists believe that galaxies are moving further apart every second, driven by a mysterious force known as dark energy. Even with our most advanced telescopes, we have only mapped a tiny fraction of the observable cosmos.",
        "Artificial intelligence has rapidly evolved from simple rule-based algorithms to complex neural networks capable of learning. Today, machine learning models can recognize images, translate languages in real time, and even generate creative artwork, fundamentally changing the way we interact with modern technology."
    ],
    ru: [
        "Космос представляет собой невероятно огромное и таинственное пространство, которое постоянно расширяется с ускорением. Ученые предполагают, что галактики отдаляются друг от друга каждую секунду под воздействием загадочной темной энергии. Даже с помощью самых мощных телескопов мы смогли изучить лишь ничтожно малую часть наблюдаемой Вселенной.",
        "Искусственный интеллект прошел долгий путь развития от простых алгоритмов до сложнейших нейронных сетей, способных к глубокому обучению. Сегодня современные модели могут распознавать изображения, переводить тексты в реальном времени и даже создавать произведения искусства, меняя наш привычный мир."
    ]
};

const AI_URL = 'https://gemini-proxy-lms.msleaderindustry.workers.dev';
const ICONS = {
    keyboard: 'M3 5h18v14H3zM7 9h.01M12 9h.01M17 9h.01M7 13h.01M12 13h.01M17 13h.01M8 16h8',
    spark: 'M12 3l2.3 6.7L21 12l-6.7 2.3L12 21l-2.3-6.7L3 12l6.7-2.3L12 3z',
    back: 'M19 12H5M11 6l-6 6 6 6',
    refresh: 'M3 11a9 9 0 1 1 2.6 7M3 4v7h7',
    play: 'M8 4l13 8-13 8V4z', pause: 'M8 4v16M16 4v16',
    close: 'M6 6l12 12M18 6L6 18', check: 'M5 12l4 4L19 6',
    clock: 'M12 8v4l3 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
    target: 'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0M17 12a5 5 0 1 1-10 0 5 5 0 0 1 10 0M12 12h.01',
    bolt: 'M13 2L3 14h8l-1 8 11-12h-8l1-8z',
    trophy: 'M8 3h8v7a4 4 0 0 1-8 0V3zM8 5H4v3a4 4 0 0 0 4 4M16 5h4v3a4 4 0 0 1-4 4M12 14v6M8 21h8',
    more: 'M5 12h.01M12 12h.01M19 12h.01',
    chevron: 'M6 9l6 6 6-6', info: 'M12 11v6M12 7h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0'
};
const Icon = ({ name, size = 18 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d={ICONS[name] || ICONS.keyboard}/></svg>;
// Физические коды позволяют подсветить клавишу даже при неверной раскладке.
const ROWS = [
    [['Backquote','`','ё'],['Digit1','1','1'],['Digit2','2','2'],['Digit3','3','3'],['Digit4','4','4'],['Digit5','5','5'],['Digit6','6','6'],['Digit7','7','7'],['Digit8','8','8'],['Digit9','9','9'],['Digit0','0','0'],['Minus','-','-'],['Equal','=','='],['Backspace','⌫','⌫',1.65]],
    [['Tab','Tab','Tab',1.5],['KeyQ','q','й'],['KeyW','w','ц'],['KeyE','e','у'],['KeyR','r','к'],['KeyT','t','е'],['KeyY','y','н'],['KeyU','u','г'],['KeyI','i','ш'],['KeyO','o','щ'],['KeyP','p','з'],['BracketLeft','[','х'],['BracketRight',']','ъ'],['Backslash','\\','\\',1.15]],
    [['CapsLock','Caps','Caps',1.8],['KeyA','a','ф'],['KeyS','s','ы'],['KeyD','d','в'],['KeyF','f','а'],['KeyG','g','п'],['KeyH','h','р'],['KeyJ','j','о'],['KeyK','k','л'],['KeyL','l','д'],['Semicolon',';','ж'],['Quote',"'",'э'],['Enter','Enter','Enter',1.85]],
    [['ShiftLeft','Shift','Shift',2.3],['KeyZ','z','я'],['KeyX','x','ч'],['KeyC','c','с'],['KeyV','v','м'],['KeyB','b','и'],['KeyN','n','т'],['KeyM','m','ь'],['Comma',',','б'],['Period','.','ю'],['Slash','/','.',1],['ShiftRight','Shift','Shift',2.35]],
    [['Space',' ',' ',8]]
];
const SHIFT = {
    en: {'`':'~','1':'!','2':'@','3':'#','4':'$','5':'%','6':'^','7':'&','8':'*','9':'(','0':')','-':'_','=':'+','[':'{',']':'}','\\':'|',';':':',"'":'"',',':'<','.':'>','/':'?'},
    ru: {'1':'!','2':'"','3':'№','4':';','5':'%','6':':','7':'?','8':'*','9':'(','0':')','-':'_','=':'+','\\':'/','.':','}
};
const finite = value => Number.isFinite(Number(value)) ? Math.max(0, Number(value)) : 0;
const sessionId = () => window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
function makeSession(text, lang, source = 'practice') {
    return { id: sessionId(), text: text.trim(), lang, source, index: 0, errors: 0, combo: 0, maxCombo: 0, elapsed: 0, activeAt: null, started: false, done: false, uid: null };
}
function duration(session, now) { return session.elapsed + (session.activeAt === null ? 0 : Math.max(0, now - session.activeAt)); }
function statsFor(session, now) {
    const ms = duration(session, now), attempts = session.index + session.errors;
    return { ms, wpm: ms >= 1000 ? Math.round((session.index / 5) / (ms / 60000)) : 0, accuracy: attempts ? Math.round(session.index / attempts * 100) : 100, progress: session.text.length ? Math.round(session.index / session.text.length * 100) : 0 };
}
function stopClock(session, now) { return { ...session, elapsed: duration(session, now), activeAt: null }; }
function typeCharacters(session, value, now, uid) {
    const characters = [...(value || '').normalize('NFC')].filter(char => !['\n', '\r', '\t'].includes(char));
    if (session.done || !characters.length) return session;
    let next = { ...session };
    if (!next.started) { next.started = true; next.uid = uid; }
    if (next.activeAt === null) next.activeAt = now;
    for (const char of characters) {
        if (char === next.text[next.index]) { next.index++; next.combo++; next.maxCombo = Math.max(next.maxCombo, next.combo); }
        else { next.errors++; next.combo = 0; }
        if (next.index === next.text.length) { next = stopClock(next, now); next.elapsed = Math.max(1000, next.elapsed); next.done = true; break; }
    }
    return next;
}
function targetFor(char, lang, caps = false) {
    if (!char) return null;
    for (const row of ROWS) for (const [code, en, ru] of row) {
        const base = lang === 'ru' ? ru : en;
        if (base.length !== 1) continue;
        if (/\p{L}/u.test(base)) {
            if (base.toLowerCase() === char.toLowerCase()) return { code, shift: (char !== char.toLowerCase()) !== caps };
        } else {
            if (base === char) return { code, shift: false };
            if (SHIFT[lang][base] === char) return { code, shift: true };
        }
    }
    return null;
}
function normalizeAI(value, lang) {
    const normalized = value.normalize('NFC').replace(/[\r\n\t\u00a0]+/g, ' ').replace(/[—–−]/g, '-').replace(/[«»“”„]/g, '"').replace(/[‘’]/g, "'").replace(/\s+/g, ' ').trim();
    if (normalized.length < 60 || normalized.length > 1800) throw new Error('Получился слишком короткий или длинный текст. Попробуйте другую тему.');
    if (![...normalized].every(char => targetFor(char, lang))) throw new Error('В тексте есть символы другой раскладки. Повторите генерацию.');
    return normalized;
}
function localText(lang, previous = '') {
    const choices = TEXTS[lang].filter(text => text !== previous);
    const bank = choices.length ? choices : TEXTS[lang];
    return bank[Math.floor(Math.random() * bank.length)];
}
const formatTime = ms => { const seconds = Math.floor(ms / 1000); return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`; };
const STYLES = `
.pt-root{--pt-bg:rgba(16,19,30,.94);--pt-panel:rgba(255,255,255,.035);--pt-paper:rgba(255,255,255,.045);--pt-line:rgba(174,181,210,.12);--pt-text:#f0f0fa;--pt-muted:#a0a5be;--pt-untyped:#9a9eb7;--pt-correct:#ece8ff;--pt-accent:#b8a6ff;--pt-soft:rgba(169,142,255,.1);--pt-blue:#84dbc9;--pt-error:#ff9fbd;--pt-error-bg:rgba(255,96,145,.12);--pt-key:rgba(168,177,211,.065);--pt-key-border:transparent;--pt-key-shadow:transparent;--pt-focus:#baa6ff;--pt-ink:#181226;color:var(--pt-text);color-scheme:dark;width:100%;min-width:0;font:14px/1.5 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;text-align:left}
html.light .pt-root,body.light .pt-root,.theme-light .pt-root,[data-theme="light"] .pt-root{--pt-bg:rgba(249,248,255,.92);--pt-panel:rgba(97,74,150,.035);--pt-paper:rgba(255,255,255,.65);--pt-line:rgba(90,70,143,.11);--pt-text:#272438;--pt-muted:#69617f;--pt-untyped:#716a85;--pt-correct:#543591;--pt-accent:#7150c7;--pt-soft:rgba(121,85,207,.08);--pt-blue:#227d70;--pt-error:#b32753;--pt-error-bg:#fce3ed;--pt-key:rgba(116,95,163,.065);--pt-focus:#7150c7;--pt-ink:#fff;color-scheme:light}
.pt-root *{box-sizing:border-box}.pt-root :is(button,input,textarea){font:inherit}.pt-root button{cursor:pointer;text-transform:none;letter-spacing:normal}.pt-root button:disabled{cursor:not-allowed;opacity:.4}.pt-root :is(button,input,textarea):focus-visible{outline:2px solid var(--pt-focus);outline-offset:4px}.pt-root :is(h2,h3,p){margin:0}.pt-shell{max-width:1120px;margin:0 auto;border:1px solid var(--pt-line);background:radial-gradient(ellipse at 85% 0%,var(--pt-soft),transparent 48%),radial-gradient(ellipse at 0% 100%,var(--pt-soft),transparent 40%),var(--pt-bg);border-radius:30px;padding:32px 44px 22px;backdrop-filter:blur(28px);-webkit-backdrop-filter:blur(28px);box-shadow:0 30px 100px #10072020;position:relative;isolation:isolate}.pt-header{display:flex;align-items:center;justify-content:space-between;gap:15px;margin-bottom:32px}.pt-brand{display:flex;align-items:center;gap:10px}.pt-brand-icon{display:none}.pt-brand h2{font-size:29px;letter-spacing:-1.3px;font-weight:750;line-height:1.2}.pt-brand h2 span{color:var(--pt-accent)}.pt-brand p{font-size:9px;color:var(--pt-muted);letter-spacing:2px;margin-top:6px;text-transform:uppercase}.pt-header-actions{display:flex;align-items:center;justify-content:flex-end;flex-wrap:wrap;gap:9px;position:relative}.pt-btn{display:inline-flex;align-items:center;justify-content:center;gap:7px;border:1px solid transparent;border-radius:24px;background:var(--pt-soft);color:var(--pt-text);padding:10px 17px;line-height:1.4;font-size:12px!important;font-weight:550;transition:background .15s,color .15s}.pt-btn:hover:not(:disabled){background:var(--pt-paper);color:var(--pt-accent)}.pt-btn.primary{background:var(--pt-accent);color:var(--pt-ink)}.pt-btn.primary:hover:not(:disabled){filter:brightness(1.08);background:var(--pt-accent);color:var(--pt-ink)}.pt-icon-btn{border:0;border-radius:50%;padding:10px;background:transparent;color:var(--pt-muted);display:grid;place-items:center;transition:background .15s}.pt-icon-btn:hover{background:var(--pt-soft);color:var(--pt-text)}.pt-menu-wrap{position:relative}.pt-menu{position:absolute;z-index:20;right:0;top:calc(100% + 10px);min-width:225px;border:1px solid var(--pt-line);border-radius:16px;background:var(--pt-bg);box-shadow:0 15px 60px #0003;backdrop-filter:blur(25px);padding:7px}.pt-menu button{display:flex;align-items:center;gap:10px;width:100%;border:0;border-radius:10px;background:transparent;color:var(--pt-text);padding:11px 10px;text-align:left;font-size:12px}.pt-menu button:hover{background:var(--pt-soft)}.pt-menu svg{color:var(--pt-accent)}
.pt-stats{display:flex;align-items:flex-end;justify-content:center;gap:60px;margin:15px 0 35px}.pt-stat{min-width:90px;position:relative;text-align:left}.pt-stat-title{display:flex;align-items:center;gap:6px;font-size:10px;color:var(--pt-muted);margin-bottom:6px}.pt-stat-title svg{display:none}.pt-stat strong{font-size:36px;font-weight:450;font-variant-numeric:tabular-nums;letter-spacing:-1.8px;line-height:1.15}.pt-stat small{font-size:10px;color:var(--pt-muted);margin-left:5px}.pt-stat.speed strong{color:var(--pt-accent)}.pt-stat.precision.low strong{color:var(--pt-error)}.pt-stat.combo small{display:none}.pt-stat.speed .pt-stat-title{margin-bottom:6px}.pt-controls{display:flex;align-items:center;justify-content:center;gap:12px;margin:0 0 20px}.pt-segment{display:flex;align-items:center;gap:3px;background:var(--pt-panel);padding:4px;border:0;border-radius:30px}.pt-segment button{border:0;background:transparent;color:var(--pt-muted);border-radius:20px;padding:7px 18px;font-size:11px;font-weight:550}.pt-segment button.selected{background:var(--pt-soft);color:var(--pt-accent)}.pt-mode-label{font-size:10px;color:var(--pt-muted);border-left:1px solid var(--pt-line);padding-left:16px}
.pt-ai{background:var(--pt-soft);border:1px solid var(--pt-line);border-radius:18px;padding:17px 20px;margin:0 0 23px;animation:pt-appear .18s ease-out}.pt-ai-header{display:flex;gap:8px;align-items:center;margin-bottom:11px;color:var(--pt-accent);font-size:11px;font-weight:550}.pt-ai form{display:flex;align-items:center;gap:9px}.pt-topic{flex:1;min-width:0;border:1px solid var(--pt-line);border-radius:12px;background:var(--pt-paper);color:var(--pt-text);padding:11px 13px;font-size:13px!important}.pt-ai p{font-size:10px;color:var(--pt-muted);margin-top:9px}.pt-notice{display:flex;align-items:center;gap:8px;border:1px solid var(--pt-line);border-radius:13px;padding:10px 14px;background:var(--pt-panel);color:var(--pt-muted);font-size:12px;margin-bottom:13px}.pt-notice span{flex:1}.pt-notice.error{background:var(--pt-error-bg);color:var(--pt-error)}
.pt-practice{background:transparent;border:0;border-radius:0;position:relative;padding:6px 0 0;transition:opacity .2s}.pt-practice-top{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:15px;color:var(--pt-muted);font-size:9px;letter-spacing:.9px}.pt-practice-top .pt-source{display:flex;align-items:center;gap:6px}.pt-progress{height:2px;background:var(--pt-line);border:0;border-radius:4px;margin-top:16px;overflow:hidden;opacity:.7}.pt-progress>div{height:100%;background:var(--pt-accent);transition:width .12s linear}.pt-text{min-height:250px;max-height:345px;overflow-y:auto;overscroll-behavior:contain;scrollbar-width:none;font:27px/1.75 ui-monospace,SFMono-Regular,Consolas,'Liberation Mono',monospace;white-space:pre-wrap;overflow-wrap:break-word;padding:6px 3px;color:var(--pt-untyped);cursor:text;letter-spacing:-.45px}.pt-text::-webkit-scrollbar{display:none}.pt-letter.correct{color:var(--pt-correct)}.pt-letter.current{color:var(--pt-ink);background:var(--pt-accent);border-radius:4px;padding:2px 0;position:relative;box-decoration-break:clone;-webkit-box-decoration-break:clone}.pt-letter.wrong{background:var(--pt-error-bg);color:var(--pt-error);border-radius:4px}.pt-capture{position:absolute!important;width:1px!important;height:1px!important;min-height:0!important;opacity:0!important;overflow:hidden;resize:none;padding:0!important;border:0!important;left:0;bottom:0;pointer-events:none;font-size:16px!important}.pt-practice-bottom{display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:10px;color:var(--pt-muted);margin-top:16px;min-height:25px}.pt-feedback{display:flex;align-items:center;gap:6px;min-height:18px}.pt-feedback.error{color:var(--pt-error)}.pt-start-hint{display:inline-flex;align-items:center;gap:8px;border:0;padding:0;background:transparent;color:var(--pt-muted);font-size:11px!important}.pt-start-hint:hover{color:var(--pt-accent)}.pt-start-hint svg{color:var(--pt-accent)}.pt-pause-hint{display:flex;align-items:center;gap:5px;font-size:9px;color:var(--pt-muted)}.pt-pause-hint kbd{font:9px inherit;border:1px solid var(--pt-line);padding:2px 5px;border-radius:4px}.pt-sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
.pt-keyboard-section{margin-top:28px}.pt-keyboard-heading{display:none}.pt-keyboard-scroll{overflow:auto;padding:3px 0 5px;scrollbar-width:none;overscroll-behavior-x:contain}.pt-keyboard{max-width:990px;min-width:0;margin:0 auto;display:flex;flex-direction:column;gap:7px}.pt-key-row{display:flex;gap:6px;justify-content:center}.pt-key{height:46px;flex:1;min-width:0;border:1px solid transparent;border-radius:8px;background:var(--pt-key);color:var(--pt-muted);box-shadow:none;display:flex;align-items:center;justify-content:center;font:14px -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;position:relative;transition:background .12s,color .12s,transform .12s}.pt-key.special{font-size:10px}.pt-key.space{max-width:350px;height:36px;font-size:10px}.pt-key.home:after{content:'';position:absolute;bottom:6px;left:calc(50% - 3px);height:1px;width:6px;background:currentColor;opacity:.4}.pt-key.target{background:var(--pt-soft);border-color:var(--pt-accent);color:var(--pt-accent);box-shadow:0 0 18px var(--pt-soft)}.pt-key.pressed{background:var(--pt-accent);border-color:transparent;color:var(--pt-ink);transform:scale(.94);box-shadow:none}.pt-key.mistake{background:var(--pt-error-bg);border-color:var(--pt-error);color:var(--pt-error)}.pt-keyboard-note{display:none}.pt-bottom{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-top:21px;padding-top:17px;border-top:1px solid var(--pt-line);color:var(--pt-muted);font-size:9px}.pt-bottom span{display:flex;align-items:center;gap:5px}.pt-bottom kbd{padding:1px 5px;border:1px solid var(--pt-line);border-radius:4px;font:9px inherit}
.pt-results{padding:20px 15px 14px;text-align:center;animation:pt-appear .2s ease-out}.pt-result-icon{display:grid;place-items:center;margin:0 auto 12px;width:48px;height:48px;background:var(--pt-soft);color:var(--pt-accent);border-radius:50%}.pt-results h3{font-size:28px;letter-spacing:-.8px;font-weight:550}.pt-results>p{font-size:11px;color:var(--pt-muted);margin-top:8px}.pt-results-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;max-width:580px;margin:26px auto}.pt-result-stat{padding:10px;background:transparent;border:0}.pt-result-stat strong{display:block;font-size:38px;font-weight:450;letter-spacing:-1.5px;color:var(--pt-accent);font-variant-numeric:tabular-nums}.pt-result-stat span{font-size:10px;color:var(--pt-muted)}.pt-result-actions{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}.pt-save{display:flex;justify-content:center;align-items:center;gap:7px;font-size:10px;color:var(--pt-muted);margin-top:17px;flex-wrap:wrap}.pt-save .pt-btn{padding:5px 8px;font-size:10px!important}.pt-spinner{display:inline-block;width:14px;height:14px;border:2px solid var(--pt-line);border-top-color:var(--pt-accent);border-radius:50%;animation:pt-spin .8s linear infinite}
@keyframes pt-spin{to{transform:rotate(360deg)}}@keyframes pt-appear{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:none}}
@media(max-width:720px){.pt-shell{padding:25px;border-radius:24px}.pt-stats{gap:32px}.pt-stat{min-width:65px}.pt-stat strong{font-size:29px}.pt-text{font-size:24px;min-height:240px;max-height:330px}.pt-header-actions .pt-btn{padding:9px 13px}.pt-key{height:40px;font-size:12px}.pt-key.special{font-size:8px}}
@media(max-width:480px){.pt-shell{padding:22px 18px 18px;border-radius:22px}.pt-header{margin-bottom:28px;gap:16px;flex-wrap:wrap}.pt-brand h2{font-size:26px}.pt-brand p{font-size:8px;letter-spacing:1.3px}.pt-header-actions{gap:4px;width:100%}.pt-header-actions .pt-segment{margin-right:auto}.pt-header-actions .pt-btn{padding:8px 11px;font-size:10px!important}.pt-header-actions>.pt-icon-btn{padding:7px}.pt-icon-btn{padding:7px}.pt-stats{justify-content:space-between;gap:10px;margin-bottom:27px}.pt-stat{min-width:0}.pt-stat-title{font-size:8px;gap:0;white-space:nowrap;margin-bottom:4px}.pt-stat strong{font-size:25px;letter-spacing:-1px}.pt-stat.speed .pt-stat-title{margin-bottom:4px}.pt-stat small{font-size:8px;margin-left:2px}.pt-controls{margin-bottom:21px;gap:9px}.pt-segment button{padding:6px 13px;font-size:10px}.pt-mode-label{padding-left:11px;font-size:9px}.pt-ai{padding:14px}.pt-ai form{flex-wrap:wrap}.pt-topic{flex-basis:100%;font-size:16px!important}.pt-ai form .pt-btn{flex:1}.pt-practice-top{font-size:8px;letter-spacing:.3px;margin-bottom:12px}.pt-text{font-size:21px;line-height:1.85;min-height:235px;max-height:310px;letter-spacing:-.5px}.pt-practice-bottom{font-size:9px;align-items:flex-start;gap:6px}.pt-start-hint{font-size:10px!important}.pt-feedback.error{flex-wrap:wrap}.pt-pause-hint{font-size:8px}.pt-keyboard-section{margin-top:25px}.pt-keyboard{gap:4px}.pt-key-row{gap:3px}.pt-key{height:34px;font-size:10px;border-radius:5px}.pt-key.special{font-size:6px}.pt-key.space{height:30px;max-width:170px;font-size:8px}.pt-key.home:after{bottom:4px;width:4px;left:calc(50% - 2px)}.pt-results{padding:14px 0 10px}.pt-results h3{font-size:25px}.pt-results-grid{gap:6px}.pt-result-stat{padding:8px 2px}.pt-result-stat strong{font-size:30px}.pt-result-stat span{font-size:9px}.pt-bottom{font-size:8px;gap:8px;margin-top:18px;padding-top:13px}.pt-bottom .pt-formula{display:none}}
/* Компактная компоновка: текст и клавиатура остаются рядом на экране. */
.pt-shell{padding:22px 36px 16px}
.pt-header{margin-bottom:10px}
.pt-stats{margin:0 0 14px}
.pt-practice-top{margin-bottom:10px}
.pt-text{min-height:0;height:clamp(164px,calc(100dvh - 570px),242px);max-height:none;font-size:25px;line-height:1.55;padding:4px 3px}
.pt-progress{margin-top:10px}
.pt-practice-bottom{margin-top:9px;min-height:22px}
.pt-keyboard-section{margin-top:14px}
.pt-keyboard{gap:5px}
.pt-key{height:clamp(35px,5.2dvh,45px);font-size:14px}
.pt-key.space{height:31px}
.pt-bottom{margin-top:10px;padding-top:10px}
@media(max-width:720px){.pt-shell{padding:20px 22px 14px}.pt-stats{margin-bottom:16px}.pt-text{font-size:23px;line-height:1.6}.pt-key{font-size:12px}}
@media(max-width:480px){.pt-shell{padding:18px 16px 13px}.pt-header{gap:12px;margin-bottom:18px}.pt-stats{margin:0 0 14px}.pt-text{height:clamp(132px,calc(100dvh - 510px),180px);min-height:0;max-height:none;font-size:21px;line-height:1.65}.pt-practice-top{margin-bottom:9px}.pt-keyboard-section{margin-top:17px}.pt-keyboard{gap:4px}.pt-key{height:33px;font-size:11px}.pt-key.space{height:27px}.pt-bottom{margin-top:12px;padding-top:9px}}
`;
// ---------- Анимации ----------
const ANIMATIONS = `
/* ---------- ключевые кадры ---------- */
@keyframes pt-rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes pt-pop{0%{opacity:0;transform:scale(.4) rotate(-12deg)}70%{transform:scale(1.12) rotate(3deg)}100%{opacity:1;transform:none}}
@keyframes pt-bump{0%{transform:scale(1)}40%{transform:scale(1.14)}100%{transform:scale(1)}}
@keyframes pt-shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-4px)}40%{transform:translateX(4px)}60%{transform:translateX(-3px)}80%{transform:translateX(3px)}}
@keyframes pt-caret{0%,100%{box-shadow:0 0 0 0 var(--pt-soft)}50%{box-shadow:0 0 14px 3px var(--pt-accent)}}
@keyframes pt-letter-in{from{color:var(--pt-accent);text-shadow:0 0 12px var(--pt-accent)}to{text-shadow:0 0 0 transparent}}
@keyframes pt-wrong-flash{0%{box-shadow:0 0 0 0 var(--pt-error)}50%{box-shadow:0 0 0 5px var(--pt-error-bg)}100%{box-shadow:0 0 0 0 transparent}}
@keyframes pt-key-pulse{0%,100%{box-shadow:0 0 6px var(--pt-soft)}50%{box-shadow:0 0 22px var(--pt-accent)}}
@keyframes pt-shimmer{from{background-position:0 0}to{background-position:200% 0}}
@keyframes pt-menu-in{from{opacity:0;transform:translateY(-6px) scale(.96)}to{opacity:1;transform:none}}
@keyframes pt-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}

/* ---------- появление интерфейса ---------- */
.pt-shell{animation:pt-rise .55s cubic-bezier(.2,.8,.2,1) backwards}
.pt-brand{animation:pt-rise .5s cubic-bezier(.2,.8,.2,1) .08s backwards}
.pt-header-actions{animation:pt-rise .5s cubic-bezier(.2,.8,.2,1) .14s backwards}
.pt-stat{animation:pt-rise .5s cubic-bezier(.2,.8,.2,1) backwards}
.pt-stat:nth-child(1){animation-delay:.18s}
.pt-stat:nth-child(2){animation-delay:.24s}
.pt-stat:nth-child(3){animation-delay:.30s}
.pt-stat:nth-child(4){animation-delay:.36s}
.pt-practice-top{animation:pt-rise .5s cubic-bezier(.2,.8,.2,1) .4s backwards}
.pt-text{animation:pt-rise .6s cubic-bezier(.2,.8,.2,1) .45s backwards}
.pt-keyboard-section{animation:pt-rise .6s cubic-bezier(.2,.8,.2,1) .55s backwards}
.pt-notice{animation:pt-rise .25s ease-out}
.pt-menu{animation:pt-menu-in .16s ease-out;transform-origin:top right}
.pt-brand h2 span{display:inline-block;animation:pt-float 3.2s ease-in-out infinite}

/* ---------- кнопки ---------- */
.pt-btn{transition:background .15s,color .15s,transform .15s,filter .15s}
.pt-btn:hover:not(:disabled){transform:translateY(-1px)}
.pt-btn:active:not(:disabled){transform:scale(.96)}
.pt-icon-btn{transition:background .15s,color .15s,transform .15s}
.pt-icon-btn:active{transform:scale(.88)}
.pt-segment button{transition:background .2s,color .2s}

/* ---------- цифры статистики ---------- */
.pt-stat.combo strong,.pt-stat.precision strong{display:inline-block;animation:pt-bump .22s ease-out}

/* ---------- набор текста ---------- */
.pt-letter{transition:color .12s,background .12s}
.pt-letter.correct{animation:pt-letter-in .35s ease-out}
.pt-letter.current{animation:pt-caret 1.2s ease-in-out infinite}
.pt-letter.current.wrong{animation:pt-wrong-flash .35s ease-out}
.pt-progress>div{background:linear-gradient(90deg,var(--pt-accent),var(--pt-blue),var(--pt-accent));background-size:200% 100%;animation:pt-shimmer 3s linear infinite;transition:width .18s ease-out}

/* ---------- клавиатура ---------- */
.pt-key.target{animation:pt-key-pulse 1.2s ease-in-out infinite}
.pt-key.mistake{animation:pt-shake .28s ease-out}

/* ---------- результаты ---------- */
.pt-result-icon{animation:pt-pop .7s cubic-bezier(.34,1.56,.64,1) backwards}
.pt-results h3{animation:pt-rise .5s ease-out .15s backwards}
.pt-results>p{animation:pt-rise .5s ease-out .22s backwards}
.pt-result-stat{animation:pt-rise .5s ease-out backwards}
.pt-result-stat:nth-child(1){animation-delay:.3s}
.pt-result-stat:nth-child(2){animation-delay:.4s}
.pt-result-stat:nth-child(3){animation-delay:.5s}
.pt-result-actions{animation:pt-rise .5s ease-out .6s backwards}
.pt-save{animation:pt-rise .5s ease-out .7s backwards}

/* ---------- «уменьшить движение»: оставляем только мягкое появление ---------- */
@media(prefers-reduced-motion:reduce){
@keyframes pt-rise{from{opacity:0}to{opacity:1}}
@keyframes pt-pop{from{opacity:0}to{opacity:1}}
@keyframes pt-menu-in{from{opacity:0}to{opacity:1}}
.pt-brand h2 span,.pt-letter.current,.pt-key.target,.pt-key.mistake,.pt-progress>div,.pt-stat.combo strong,.pt-stat.precision strong{animation:none!important}
.pt-progress>div{background:var(--pt-accent)}
.pt-btn:hover:not(:disabled),.pt-btn:active:not(:disabled),.pt-icon-btn:active{transform:none}
}
`;
const Button = ({ variant = '', children, ...props }) => <button type="button" className={`pt-btn ${variant}`} {...props}>{children}</button>;
function Keyboard({ lang, expected, pressed, caps, wrongCode }) {
    const target = targetFor(expected, lang, caps);
    const shifted = pressed.has('ShiftLeft') || pressed.has('ShiftRight');
    return <div className="pt-keyboard-scroll" role="img" aria-label={`Подсказка клавиатуры. Следующий символ: ${expected === ' ' ? 'пробел' : expected || 'текст завершён'}`}><div className="pt-keyboard" aria-hidden="true">{ROWS.map((row, index) => <div className="pt-key-row" key={index}>{row.map(([code, en, ru, size = 1]) => {
        const base = lang === 'ru' ? ru : en;
        const letter = base.length === 1 && /\p{L}/u.test(base);
        let label = code === 'Space' ? 'Пробел' : base;
        if (letter) label = shifted !== caps ? base.toUpperCase() : base;
        else if (shifted && SHIFT[lang][base]) label = SHIFT[lang][base];
        const isTarget = target?.code === code || target?.shift && code === 'ShiftLeft';
        const className = `pt-key${base.length > 1 ? ' special' : ''}${code === 'Space' ? ' space' : ''}${code === 'KeyF' || code === 'KeyJ' ? ' home' : ''}${isTarget ? ' target' : ''}${pressed.has(code) ? ' pressed' : ''}${wrongCode === code ? ' mistake' : ''}`;
        return <div key={code} className={className} style={{ flexGrow: size }}>{label}</div>;
    })}</div>)}</div></div>;
}
function ClassicTypingTest({ onBack, active = true }) {
    const [game, setGame] = useState(() => makeSession(localText('en'), 'en'));
    const current = useRef(game);
    const [clock, setClock] = useState(() => performance.now());
    const [focused, setFocused] = useState(false);
    const [pressed, setPressed] = useState(() => new Set());
    const [caps, setCaps] = useState(false);
    const [wrongCode, setWrongCode] = useState(null);
    const [mistake, setMistake] = useState(false);
    const [notice, setNotice] = useState(null);
    const [showKeyboard, setShowKeyboard] = useState(true);
    const [showAI, setShowAI] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef(null);
    const [topic, setTopic] = useState('Искусственный интеллект');
    const [generating, setGenerating] = useState(false);
    const [saveState, setSaveState] = useState(null);
    const inputRef = useRef(null), textRef = useRef(null), alive = useRef(true);
    const composing = useRef(false), request = useRef(null), lastCode = useRef(null);
    const saveJobs = useRef(new Set()), saved = useRef(new Set()), focusFrame = useRef(null);
    const stats = statsFor(game, clock);
    const running = game.activeAt !== null && !game.done;
    useEffect(() => {
        alive.current = true;
        let style = document.getElementById('protype-v2-styles');
        if (!style) { style = document.createElement('style'); style.id = 'protype-v2-styles'; document.head.appendChild(style); }
        style.textContent = STYLES + ANIMATIONS + TYPE_DRIVE_STYLES;
        return () => {
            alive.current = false;
            if (request.current) { clearTimeout(request.current.timer); request.current.controller.abort(); request.current = null; }
            cancelAnimationFrame(focusFrame.current);
        };
    }, []);
    useEffect(() => {
        if (!running) return;
        const timer = setInterval(() => setClock(performance.now()), 250);
        return () => clearInterval(timer);
    }, [running]);
    useEffect(() => {
        const blur = () => { inputRef.current?.blur(); pause(); setPressed(new Set()); setCaps(false); };
        const visibility = () => { if (document.hidden) blur(); };
        window.addEventListener('blur', blur);
        document.addEventListener('visibilitychange', visibility);
        return () => { window.removeEventListener('blur', blur); document.removeEventListener('visibilitychange', visibility); };
    }, []);
    useEffect(() => {
        const container = textRef.current;
        const letter = container?.querySelector('[data-current="true"]');
        if (!letter) return;
        const outer = container.getBoundingClientRect(), inner = letter.getBoundingClientRect();
        if (inner.bottom > outer.bottom - 10) container.scrollTop += inner.bottom - outer.bottom + 30;
        else if (inner.top < outer.top) container.scrollTop -= outer.top - inner.top + 8;
    }, [game.index, game.id]);
    useEffect(() => {
        if (!showMenu) return;
        const close = event => { if (!menuRef.current?.contains(event.target)) setShowMenu(false); };
        const escape = event => { if (event.key === 'Escape') { setShowMenu(false); menuRef.current?.querySelector('button')?.focus(); } };
        document.addEventListener('pointerdown', close);
        document.addEventListener('keydown', escape);
        return () => { document.removeEventListener('pointerdown', close); document.removeEventListener('keydown', escape); };
    }, [showMenu]);
    useEffect(() => { if (!active) { inputRef.current?.blur(); pause(); cancelGeneration(false); setShowMenu(false); } }, [active]);
    function commit(next) {
        current.current = next;
        if (alive.current) { setGame(next); setClock(performance.now()); }
    }
    function pause() {
        const session = current.current;
        if (!session.done && session.activeAt !== null) commit(stopClock(session, performance.now()));
        setFocused(false); setPressed(new Set()); setMistake(false); setWrongCode(null); lastCode.current = null;
    }
    function focusInput() {
        if (!active || request.current || current.current.done) return;
        inputRef.current?.focus({ preventScroll: true });
    }
    function install(text, lang = current.current.lang, source = 'practice') {
        const next = makeSession(text, lang, source);
        commit(next); setPressed(new Set()); setWrongCode(null); setMistake(false); setNotice(null); setSaveState(null);
        composing.current = false; lastCode.current = null;
        if (inputRef.current) inputRef.current.value = '';
        if (textRef.current) textRef.current.scrollTop = 0;
        cancelAnimationFrame(focusFrame.current);
        focusFrame.current = requestAnimationFrame(focusInput);
    }
    function cancelGeneration(showNotice = true) {
        const job = request.current;
        if (!job) return;
        request.current = null; clearTimeout(job.timer); job.controller.abort(); setGenerating(false);
        if (showNotice) setNotice({ text: 'Генерация остановлена. Предыдущий текст сохранён.', type: 'info' });
    }
    function changeLanguage(lang) {
        if (lang === current.current.lang) return;
        cancelGeneration(false); install(localText(lang), lang);
    }
    function reset(same = false) {
        cancelGeneration(false);
        const session = current.current;
        install(same ? session.text : localText(session.lang, session.text), session.lang, same ? session.source : 'practice');
    }
    function accept(value) {
        if (request.current || current.current.done || !value) { if (inputRef.current) inputRef.current.value = ''; return; }
        const before = current.current;
        const next = typeCharacters(before, value, performance.now(), window.auth?.currentUser?.uid || null);
        commit(next);
        const wrong = next.errors > before.errors;
        setMistake(wrong); setWrongCode(wrong ? lastCode.current : null); setNotice(null);
        if (inputRef.current) inputRef.current.value = '';
        if (next.done) { setFocused(false); setPressed(new Set()); inputRef.current?.blur(); persist(next); }
    }
    function keyDown(event) {
        setCaps(!!event.getModifierState?.('CapsLock'));
        if (event.key === 'Escape') { event.preventDefault(); inputRef.current?.blur(); pause(); return; }
        if (event.ctrlKey || event.metaKey || event.altKey) return;
        if (event.repeat) { event.preventDefault(); return; }
        if (event.code) { lastCode.current = event.code; setPressed(previous => new Set([...previous, event.code])); }
        if (['Enter', 'Backspace'].includes(event.key)) event.preventDefault();
    }
    function blockInsertion(event) {
        event.preventDefault();
        setNotice({ text: 'Введите текст вручную. Вставка и автозамена не учитываются.', type: 'info' });
    }
    async function persist(session) {
        if (!session.done || saveJobs.current.has(session.id) || saved.current.has(session.id)) return;
        const status = (state, message) => { if (alive.current && current.current.id === session.id) setSaveState({ state, message }); };
        const uid = session.uid;
        if (!uid) { status('guest', 'Результат показан здесь. Для сохранения следующих тренировок войдите в аккаунт.'); return; }
        if (window.auth?.currentUser?.uid !== uid) { status('error', 'Аккаунт изменился. Этот результат не записан в новый профиль.'); return; }
        if (!window.db?.runTransaction) { status('error', 'Нет подключения к базе данных. Результат пока не сохранён.'); return; }
        saveJobs.current.add(session.id); status('pending', 'Сохраняем результат…');
        const finalStats = statsFor(session, 0);
        try {
            await window.db.runTransaction(async transaction => {
                if (window.auth?.currentUser?.uid !== uid) throw new Error('account-changed');
                const ref = window.db.collection('users').doc(uid), snapshot = await transaction.get(ref);
                if (!snapshot.exists) throw new Error('profile-missing');
                const user = snapshot.data();
                if (user.isBanned || Array.isArray(user.allowedModules) && !user.allowedModules.includes('typing')) throw new Error('access-denied');
                const old = user.typingProgress && typeof user.typingProgress === 'object' ? user.typingProgress : {};
                // Последние id защищают повторное сохранение после неоднозначного сетевого сбоя.
                const recent = Array.isArray(old.recentSessionIds) ? old.recentSessionIds.filter(id => typeof id === 'string') : [];
                if (recent.includes(session.id)) return;
                if (window.auth?.currentUser?.uid !== uid) throw new Error('account-changed');
                transaction.update(ref, { typingProgress: {
                    ...old, maxWpm: Math.max(finite(old.maxWpm), finalStats.wpm),
                    maxCombo: Math.max(finite(old.maxCombo), session.maxCombo),
                    testsCompleted: Math.floor(finite(old.testsCompleted)) + 1,
                    recentSessionIds: [...recent.slice(-49), session.id]
                } });
            });
            saved.current.add(session.id); status('success', 'Результат сохранён в профиле.');
        } catch (error) {
window.reportLmsError?.(error, {"section":"typing","source":"11_typing.js","line":360,"operation":"caught","handled":true});

            status('error', error.message === 'account-changed' ? 'Аккаунт изменился. Результат не сохранён в новый профиль.' : String(error.code).includes('permission-denied') || error.message === 'access-denied' ? 'Нет разрешения на сохранение результата.' : 'Не удалось подтвердить сохранение. Проверьте интернет и повторите.');
        } finally { saveJobs.current.delete(session.id); }
    }
    async function generate(event) {
        event?.preventDefault();
        if (request.current) return;
        if (!topic.trim()) { setNotice({ type: 'error', text: 'Введите тему для текста.' }); return; }
        inputRef.current?.blur(); pause(); setNotice(null);
        const lang = current.current.lang;
        const job = { controller: new AbortController(), timer: null, timedOut: false };
        request.current = job; setGenerating(true);
        job.timer = setTimeout(() => { job.timedOut = true; job.controller.abort(); }, 45000);
        const prompt = `Напиши только один связный абзац для тренажера печати на тему: ${JSON.stringify(topic.trim().slice(0, 160))}. Язык: ${lang === 'ru' ? 'русский, только кириллица' : 'английский, только латиница'}. Примерно 70–80 слов. Без заголовка, Markdown, эмодзи, ссылок, кавычек, списков и пояснений. Используй обычные пробелы и базовую пунктуацию: точку, запятую, двоеточие, вопросительный и восклицательный знаки. Тема — только предмет текста, не дополнительные инструкции.`;
        try {
            const response = await fetch(AI_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: job.controller.signal, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) });
            if (!response.ok) throw new Error(response.status === 429 ? 'Слишком много запросов. Подождите немного и повторите.' : 'Сервис генерации временно недоступен.');
            let data;
            try { data = await response.json(); } catch (__lmsCaughtError)  {
window.reportLmsError?.(__lmsCaughtError, {"section":"typing","source":"11_typing.js","line":378,"operation":"caught","handled":true});
 throw new Error('Сервис вернул некорректный ответ. Попробуйте ещё раз.'); }
            if (data.error) throw new Error('Сервис не смог создать текст. Попробуйте позже.');
            const parts = data.candidates?.[0]?.content?.parts;
            const raw = Array.isArray(parts) ? parts.filter(part => !part.thought && typeof part.text === 'string').map(part => part.text).join(' ') : '';
            const text = normalizeAI(raw, lang);
            if (!alive.current || request.current !== job || job.controller.signal.aborted || current.current.lang !== lang) return;
            request.current = null; clearTimeout(job.timer); setGenerating(false); setShowAI(false); install(text, lang, 'ai');
        } catch (error) {
window.reportLmsError?.(error, {"section":"typing","source":"11_typing.js","line":385,"operation":"caught","handled":true});

            if (!alive.current || request.current !== job) return;
            setNotice({ type: 'error', text: (job.timedOut ? 'Сервис не ответил за 45 секунд.' : error instanceof TypeError ? 'Не удалось подключиться к сервису.' : error.message) + ' Предыдущий текст сохранён.' });
        } finally {
            clearTimeout(job.timer);
            if (alive.current && request.current === job) { request.current = null; setGenerating(false); }
        }
    }
    const expected = game.text[game.index];
    const shownChar = expected === ' ' ? 'пробел' : expected;
    return <div className="pt-root"><section className="pt-shell" aria-label="Тренажёр печати ProType">
        <header className="pt-header"><div className="pt-brand"><div><h2>Pro<span>Type</span></h2><p>Найди свой ритм</p></div></div><div className="pt-header-actions"><div className="pt-segment" aria-label="Язык текста">{[['en', 'English'], ['ru', 'Русский']].map(([lang, label]) => <button key={lang} type="button" className={game.lang === lang ? 'selected' : ''} aria-pressed={game.lang === lang} onClick={() => changeLanguage(lang)}>{label}</button>)}</div>{onBack && <button type="button" className="pt-icon-btn" onClick={onBack} title="Назад" aria-label="Назад"><Icon name="back" size={17}/></button>}<Button aria-expanded={showAI} onClick={() => { setShowAI(value => !value); setShowMenu(false); }}><Icon name="spark" size={15}/>Текст с ИИ</Button><div className="pt-menu-wrap" ref={menuRef}><button type="button" className="pt-icon-btn" aria-label="Настройки тренировки" aria-expanded={showMenu} title="Настройки тренировки" onClick={() => setShowMenu(value => !value)}><Icon name="more" size={20}/></button>{showMenu && <div className="pt-menu" aria-label="Настройки тренировки"><button type="button" disabled={generating} onClick={() => { setShowMenu(false); reset(true); }}><Icon name="refresh" size={15}/>Повторить текст</button><button type="button" disabled={generating} onClick={() => { setShowMenu(false); reset(false); }}><Icon name="play" size={15}/>Другой текст</button><button type="button" onClick={() => { setShowKeyboard(value => !value); setShowMenu(false); }}><Icon name="keyboard" size={15}/>{showKeyboard ? 'Скрыть клавиатуру' : 'Показать клавиатуру'}</button></div>}</div></div></header>
        <div className="pt-stats" aria-label="Показатели тренировки">
            <div className="pt-stat speed"><div className="pt-stat-title"><Icon name="bolt" size={14}/>Скорость</div><strong>{stats.wpm}</strong><small>WPM</small></div>
            <div className={`pt-stat precision ${stats.accuracy < 90 ? 'low' : ''}`}><div className="pt-stat-title"><Icon name="target" size={14}/>Точность</div><strong key={stats.accuracy}>{stats.accuracy}%</strong></div>
            <div className="pt-stat combo"><div className="pt-stat-title"><Icon name="spark" size={14}/>Серия</div><strong key={game.combo}>{game.combo}</strong><small>символов</small></div>
            <div className="pt-stat"><div className="pt-stat-title"><Icon name="clock" size={14}/>Время печати</div><strong>{formatTime(stats.ms)}</strong></div>
        </div>

        {showAI && <div className="pt-ai"><div className="pt-ai-header"><Icon name="spark" size={17}/>Практика на интересную тему</div><form onSubmit={generate}><label className="pt-sr" htmlFor="pt-topic">Тема текста</label><input id="pt-topic" className="pt-topic" value={topic} maxLength={160} onChange={event => setTopic(event.target.value)} placeholder="Например: путешествия, космос, технологии" disabled={generating}/><button type="submit" className="pt-btn primary" disabled={generating || !topic.trim()}>{generating ? <><i className="pt-spinner"/>Генерация…</> : <><Icon name="spark" size={15}/>Создать текст</>}</button></form><p>Один абзац на {game.lang === 'ru' ? 'русском' : 'английском'} языке. Текущая тренировка заменится после успешной генерации.</p></div>}
        {generating && <div className="pt-notice" role="status"><i className="pt-spinner"/><span>Готовим текст. Тренировка на паузе.</span><Button onClick={() => cancelGeneration()}>Отменить</Button></div>}
        {notice && <div className={`pt-notice ${notice.type === 'error' ? 'error' : ''}`} role={notice.type === 'error' ? 'alert' : 'status'}><Icon name="info" size={16}/><span>{notice.text}</span><button type="button" className="pt-icon-btn" onClick={() => setNotice(null)} aria-label="Скрыть уведомление"><Icon name="close" size={15}/></button></div>}
        <div className={`pt-practice ${focused && !game.done ? 'focused' : ''}`}>
            {game.done ? <div className="pt-results" role="region" aria-label="Результат тренировки"><div className="pt-result-icon"><Icon name="trophy" size={28}/></div><h3>Текст пройден</h3><p>{game.text.length} символов · {formatTime(stats.ms)} активного времени · {game.errors} ошибок</p><div className="pt-results-grid"><div className="pt-result-stat"><strong>{stats.wpm}</strong><span>слов в минуту</span></div><div className="pt-result-stat"><strong>{stats.accuracy}%</strong><span>точность</span></div><div className="pt-result-stat"><strong>{game.maxCombo}</strong><span>лучшая серия</span></div></div><div className="pt-result-actions"><Button variant="primary" onClick={() => reset(false)} disabled={generating}><Icon name="play" size={14}/>Следующий текст</Button><Button onClick={() => reset(true)} disabled={generating}><Icon name="refresh" size={14}/>Улучшить результат</Button></div><div className="pt-save" role="status">{saveState?.state === 'pending' ? <i className="pt-spinner"/> : saveState?.state === 'success' ? <Icon name="check" size={14}/> : null}<span>{saveState?.message}</span>{saveState?.state === 'error' && <Button onClick={() => persist(current.current)}>Повторить сохранение</Button>}</div></div> : <>
                <div className="pt-practice-top"><span className="pt-source"><Icon name={game.source === 'ai' ? 'spark' : 'keyboard'} size={13}/>{game.source === 'ai' ? 'ТЕКСТ ОТ ИИ' : 'СВОБОДНАЯ ПРАКТИКА'} · {game.lang.toUpperCase()}</span><span>{game.index} / {game.text.length} символов</span></div>
                <div className="pt-text" ref={textRef} onClick={focusInput} aria-label="Текст для набора">{game.text.split('').map((char, index) => <span key={index} className={`pt-letter${index < game.index ? ' correct' : index === game.index ? ` current${mistake ? ' wrong' : ''}` : ''}`} data-current={index === game.index ? 'true' : undefined}>{char}</span>)}</div>
                <div className="pt-progress" role="progressbar" aria-label="Прогресс набора" aria-valuemin={0} aria-valuemax={100} aria-valuenow={stats.progress}><div style={{ width: `${stats.progress}%` }}/></div>
                <label className="pt-sr" htmlFor="pt-capture">Поле для печати. Повторяйте текст выше. Ошибочный символ не продвигает курсор.</label>
                <textarea id="pt-capture" ref={inputRef} className="pt-capture" rows={1} defaultValue="" disabled={generating} placeholder={game.started ? 'Продолжайте печатать здесь' : 'Нажмите здесь и печатайте'} autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} lang={game.lang}
                    onFocus={() => { if (request.current) return; setFocused(true); const session = current.current; if (session.started && !session.done && session.activeAt === null) commit({ ...session, activeAt: performance.now() }); }}
                    onBlur={() => { pause(); setCaps(false); }}
                    onKeyDown={keyDown} onKeyUp={event => { setCaps(!!event.getModifierState?.('CapsLock')); setPressed(previous => { const next = new Set(previous); next.delete(event.code); return next; }); }}
                    onPaste={blockInsertion} onDrop={blockInsertion} onBeforeInput={event => { const type = event.nativeEvent?.inputType; if (['insertFromPaste', 'insertFromDrop', 'insertReplacementText'].includes(type)) blockInsertion(event); }}
                    onCompositionStart={() => { composing.current = true; }} onCompositionEnd={event => { composing.current = false; accept(event.currentTarget.value); event.currentTarget.value = ''; }}
                    onChange={event => { if (composing.current || event.nativeEvent?.isComposing) return; if (['insertFromPaste', 'insertFromDrop', 'insertReplacementText'].includes(event.nativeEvent?.inputType)) { event.currentTarget.value = ''; setNotice({ type: 'info', text: 'Введите текст вручную, без вставки и автозамены.' }); return; } accept(event.currentTarget.value); event.currentTarget.value = ''; }}/>
                <div className="pt-practice-bottom"><div className={`pt-feedback ${mistake ? 'error' : ''}`} role="status">{mistake ? <>Ожидается: <strong>{shownChar === 'пробел' ? 'пробел' : `«${shownChar}»`}</strong>. Проверьте регистр и раскладку.</> : caps ? 'Caps Lock включён' : focused ? (game.started ? 'Держите свой ритм.' : 'Таймер начнётся с первого символа.') : <button type="button" className="pt-start-hint" onClick={focusInput} disabled={generating}><Icon name="play" size={12}/>{game.started ? 'Пауза. Нажмите на текст, чтобы продолжить' : 'Нажмите на текст и начните печатать'}</button>}</div><span className="pt-pause-hint"><kbd>esc</kbd> пауза</span></div>
            </>}
        </div>
        {showKeyboard && <section className="pt-keyboard-section" aria-label="Виртуальная клавиатура"><div className="pt-keyboard-heading"><h3>Клавиатура · {game.lang === 'ru' ? 'ЙЦУКЕН' : 'QWERTY'}</h3><div className="pt-legend"><span><i/>Следующая клавиша</span><span><i className="pressed"/>Нажата</span></div></div><Keyboard lang={game.lang} expected={game.done || generating ? null : expected} pressed={pressed} caps={caps} wrongCode={wrongCode}/><p className="pt-keyboard-note">Подсказка показывает физические клавиши. На телефоне печатайте в поле ввода; схему можно прокрутить вбок.</p></section>}
        <footer className="pt-bottom"><span><Icon name="info" size={12}/>Ошибка не продвигает курсор. Введите нужный символ.</span><span className="pt-formula">WPM = символы ÷ 5 ÷ минуты</span></footer>
    </section></div>;
}

const TYPE_DRIVE_STYLES = "\n\n.td-root [hidden]{display:none!important}.td-root *{box-sizing:border-box} .td-root{color-scheme:dark;--bg:#0d1019;--panel:#171b29;--soft:#111522;--line:#2a3042;--text:#edf0fa;--muted:#9aa5bc;--accent:#b79bff;--accent-soft:#b79bff14;--success:#81d7bd;--shadow:0 18px 50px #0002;--button:#9572e7}\nhtml.light .td-root,body.light .td-root,.theme-light .td-root,[data-theme=\"light\"] .td-root{color-scheme:light;--bg:#f0f1f8;--panel:#fff;--soft:#f5f5fb;--line:#e0e2ef;--text:#272c43;--muted:#66718b;--accent:#7952c9;--accent-soft:#7952c910;--success:#227a61;--shadow:0 16px 45px #51477d0c;--button:#8059d6}\n.td-root{margin:0;background:radial-gradient(ellipse at 20% 0%,var(--accent-soft),transparent 55%),var(--bg);color:var(--text);font:14px/1.5 -apple-system,BlinkMacSystemFont,\"Segoe UI\",sans-serif;transition:background-color .25s,color .25s}.td-root:has(dialog[open]){overflow:hidden}\n.td-root button,.td-root input,.td-root textarea{font:inherit}.td-root button{cursor:pointer;color:inherit;border:1px solid var(--line);background:var(--panel);transition:background .2s,border-color .2s,box-shadow .2s,transform .2s;touch-action:manipulation}.td-root button:hover{border-color:var(--accent);background:var(--accent-soft)}.td-root button:active{transform:scale(.975)}.td-root button:disabled{opacity:.48;cursor:default;transform:none;box-shadow:none}.td-root button:focus-visible,.td-root input:focus-visible,.td-root textarea:focus-visible{outline:2px solid var(--accent);outline-offset:4px}.td-root button .ui-svg{flex-shrink:0}.td-root .ui-svg{vertical-align:middle;flex-shrink:0}\n.td-root .app{max-width:1300px;padding:24px 32px;margin:auto;animation:td-enter .5s ease both}.td-root header{display:flex;justify-content:space-between;align-items:center;padding-bottom:22px;border-bottom:1px solid var(--line);margin-bottom:30px}.td-root .brand{display:flex;gap:12px;align-items:center;font-weight:800;letter-spacing:.08em;font-size:13px}.td-root .logo{display:grid;place-items:center;width:40px;height:40px;border-radius:13px;background:linear-gradient(145deg,#c0a6ff,#825bce);color:white;box-shadow:0 5px 20px #9972e52a;font-size:23px;font-weight:850}.td-root .brand small{display:block;font-size:8px;letter-spacing:.18em;color:var(--muted);font-weight:600;margin-top:3px}.td-root .actions{display:flex;gap:8px}.td-root .icon{height:40px;width:40px;display:grid;place-items:center;border-radius:12px}.td-root .icon[aria-pressed=true]{color:var(--accent);background:var(--accent-soft);border-color:var(--accent)}\n.td-root .heading{display:flex;justify-content:space-between;align-items:center;gap:24px;margin-bottom:25px}.td-root .eyebrow{font-size:10px;font-weight:750;color:var(--accent);letter-spacing:.16em}.td-root .heading .eyebrow{display:flex;align-items:center;gap:8px}.td-root .heading .eyebrow:before{content:'';width:18px;height:2px;background:var(--accent)}.td-root h1{font-size:clamp(26px,3vw,38px);letter-spacing:-.045em;line-height:1.2;margin:10px 0}.td-root p{color:var(--muted);margin:0;line-height:1.65}.td-root .head-copy p{font-size:13px}.td-root .tabs{display:flex;padding:4px;gap:3px;border:1px solid var(--line);border-radius:14px;background:var(--soft);flex-shrink:0}.td-root .tabs button{display:flex;gap:7px;align-items:center;justify-content:center;border:0;border-radius:10px;background:none;color:var(--muted);padding:11px 16px;font-size:12px;font-weight:650;white-space:nowrap}.td-root .tabs button.active{background:var(--panel);color:var(--accent);box-shadow:0 2px 8px #0002}.td-root .tabs button:hover{color:var(--text)}\n.td-root .layout{display:grid;grid-template-columns:minmax(0,1fr) 306px;gap:20px;align-items:start}.td-root .main,.td-root .side{min-width:0;background:var(--panel);border:1px solid var(--line);border-radius:22px;box-shadow:var(--shadow)}.td-root .main{overflow:hidden}.td-root .bar{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:17px 22px;border-bottom:1px solid var(--line);font-size:11px}.td-root .bar b{font-weight:600}.td-root .dot{display:inline-block;width:6px;height:6px;margin-right:8px;border-radius:50%;background:var(--success);box-shadow:0 0 12px #81d7bd44}.td-root .pill{font-size:9px;letter-spacing:.06em;color:var(--muted);padding:3px 8px;border:1px solid var(--line);border-radius:6px;white-space:nowrap}.td-root .metrics{display:grid;grid-template-columns:repeat(4,1fr);padding:20px 8px 22px}.td-root .metric{text-align:center;border-right:1px solid var(--line)}.td-root .metric:last-child{border:0}.td-root .metric strong{display:block;font-size:30px;font-weight:650;letter-spacing:-.045em;line-height:1.2;font-variant-numeric:tabular-nums}.td-root .metric small{display:block;margin-top:6px;font-size:11px;color:var(--muted)}.td-root .metric:first-child strong{color:var(--accent)}\n.td-root .scene{height:386px;margin:0 12px;position:relative;overflow:hidden;border-radius:15px;background:#0b0f1c}.td-root canvas{display:block;width:100%;height:100%}.td-root .scene-title{position:absolute;top:14px;left:15px;font-size:8px;font-weight:650;letter-spacing:.16em;color:#dfdeef;text-shadow:0 1px 6px #000}.td-root .scene-note{position:absolute;top:11px;right:12px;padding:6px 10px;background:#101529bb;backdrop-filter:blur(10px);border:1px solid #ffffff25;border-radius:8px;font-size:10px;color:#dcd7f3;transition:color .2s,border .2s}.td-root .scene-note.boost{color:#91fbd9;border-color:#91fbd966;box-shadow:0 0 25px #91fbd922}.td-root .overlay{position:absolute;inset:0;display:grid;place-items:center;pointer-events:none}.td-root .count{font-size:76px;color:white;font-weight:900;text-shadow:0 0 45px #b899ff;animation:td-count .7s both}@keyframes td-count{from{opacity:0;transform:scale(1.5)}to{opacity:1;transform:scale(1)}}\n.td-root .typing{padding:20px}.td-root .type-top{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px;font-size:11px;color:var(--muted)}.td-root .type-top b{font-size:12px;font-weight:600;color:var(--accent);min-width:0}.td-root .type-right{display:flex;align-items:center;gap:9px;flex-shrink:0}.td-root #counter{font-variant-numeric:tabular-nums}.td-root .mini{display:inline-flex;align-items:center;gap:5px;background:var(--soft);border-radius:8px;padding:5px 8px;font-size:10px}.td-root .mini .ui-svg{width:13px;height:13px}.td-root .ribbon{height:74px;border:1px solid var(--line);border-radius:14px;background:var(--soft);position:relative;overflow:hidden;transition:border-color .2s,box-shadow .2s}.td-root .ribbon:focus-within{border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-soft)}.td-root .ribbon::after{content:'';position:absolute;right:0;top:0;bottom:0;width:36px;background:linear-gradient(90deg,transparent,var(--soft));pointer-events:none}.td-root .text{position:absolute;left:20px;top:0;display:flex;align-items:center;height:100%;white-space:pre;font:500 25px ui-monospace,Consolas,monospace;color:var(--muted);transition:transform .2s ease-out}.td-root .text span{flex-shrink:0;padding:3px 0;border-radius:4px}.td-root .text .done{color:var(--accent);opacity:.55}.td-root .text .current{color:var(--text);background:color-mix(in srgb,var(--accent) 23%,transparent);box-shadow:inset 0 -2px var(--accent)}.td-root .text .wrong{color:#f28b9c;background:#ef64742b;box-shadow:inset 0 -2px #ef6474}.td-root .ribbon.error{border-color:#ef6474;animation:td-shake .22s}@keyframes td-shake{25%{transform:translateX(-3px)}75%{transform:translateX(3px)}}.td-root .capture{position:absolute;inset:0;width:100%;height:100%;opacity:0;z-index:3;cursor:text;font-size:16px;border:0}.td-root .progress{height:4px;overflow:hidden;border-radius:8px;background:var(--line);margin-top:12px}.td-root .progress div{width:0;height:100%;background:linear-gradient(90deg,#b097ff,#72e3c7);transition:width .2s}.td-root .help{display:flex;align-items:center;justify-content:space-between;gap:12px;font-size:10px;color:var(--muted);margin-top:12px;line-height:1.6}.td-root kbd{padding:2px 5px;border:1px solid var(--line);border-radius:4px;background:var(--soft);font:10px inherit}.td-root #series{white-space:nowrap;color:var(--accent)}\n.td-root .side{padding:21px}.td-root .side h2{font-size:15px;font-weight:650;letter-spacing:-.02em;margin:0 0 5px}.td-root .side p{font-size:11px}.td-root .vehicles{display:flex;gap:7px;margin:18px 0 13px}.td-root .vehicle{position:relative;flex:1;min-width:0;display:flex;flex-direction:column;align-items:center;gap:10px;padding:18px 3px 12px;background:var(--soft);border-radius:13px;color:var(--muted);font-size:10px;font-weight:600}.td-root .vehicle svg{width:47px;height:28px;transition:transform .25s}.td-root .vehicle:hover svg{transform:translateY(-3px)}.td-root .vehicle.active{color:var(--accent);background:var(--accent-soft);border-color:var(--accent)}.td-root .vehicle.active:after{content:'';position:absolute;top:7px;right:7px;width:4px;height:4px;border-radius:50%;background:var(--accent)}.td-root .callout{font-size:10px;line-height:1.65;color:var(--muted)}.td-root #vehicleInfo{min-height:34px}.td-root .divider{height:1px;background:var(--line);margin:23px 0}.td-root .primary,.td-root .secondary{width:100%;min-height:42px;display:flex;align-items:center;justify-content:center;gap:8px;border-radius:11px;padding:10px 14px;font-size:12px;font-weight:650}.td-root .primary{background:linear-gradient(115deg,#a181ee,#8056d0);color:white;border-color:#b597ff55;box-shadow:0 4px 14px #9264e326}.td-root .primary:hover{background:linear-gradient(115deg,#ad8ff3,#8c65d9);border-color:#b597ff;box-shadow:0 5px 18px #9264e346;transform:translateY(-1px)}.td-root .secondary{background:var(--soft)}.td-root .secondary:hover{background:var(--accent-soft)}.td-root #soloAI{background:var(--accent-soft);color:var(--accent);border-color:color-mix(in srgb,var(--accent) 35%,var(--line))}.td-root #newText{min-height:34px;border-color:transparent;background:none;font-weight:500;font-size:11px;color:var(--muted)}.td-root .room{margin-top:17px;padding:14px;background:var(--soft);border:1px solid var(--line);border-radius:13px}.td-root .room h3{font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);margin:0 0 8px}.td-root .room-row{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:7px 0;font-size:11px}.td-root .room-row+.room-row{border-top:1px solid var(--line)}.td-root .room-row>span:last-child{color:var(--muted);font-size:10px}.td-root .room-row .ready{color:var(--success)!important}.td-root .ready:before{content:'';display:inline-block;width:5px;height:5px;border-radius:50%;background:currentColor;margin-right:6px}.td-root .people{display:flex;flex-direction:column;gap:8px;margin-top:15px}.td-root .person{display:flex;align-items:center;gap:9px;padding:11px 0;border-bottom:1px solid var(--line);animation:td-enter .3s both}.td-root .person:last-child{border:0}.td-root .avatar{display:grid;place-items:center;flex-shrink:0;width:33px;height:36px;border-radius:11px;background:var(--accent-soft);color:var(--accent);font-size:12px;font-weight:650}.td-root .person:nth-child(2) .avatar{color:var(--success);background:#81d7bd12}.td-root .info{flex:1;min-width:0}.td-root .info b{display:block;font-size:11px;font-weight:650}.td-root .info small{display:block;font-size:9px;color:var(--muted)}.td-root .invite{padding:7px 9px;border-radius:8px;font-size:10px;color:var(--accent);background:var(--accent-soft);border-color:transparent}.td-root .side>.callout{margin-top:21px;padding-top:15px;border-top:1px solid var(--line);font-size:9px}.td-root #demoReady{margin-top:10px;font-size:10px}.td-root #changeAI{margin-top:7px;font-size:10px;background:none}.td-root #leave{background:none;color:var(--muted);border-color:transparent;font-size:11px}.td-root .footer{display:flex;justify-content:space-between;gap:15px;padding:16px 2px;font-size:10px;color:var(--muted)}.td-root .legend{display:flex;gap:16px;flex-wrap:wrap}.td-root .legend i{display:inline-block;margin-right:5px;width:5px;height:5px;border-radius:50%}\n/* Dialog: fixed header and actions, one scrollable content area. */\n.td-root dialog{background:var(--panel);color:var(--text);border:1px solid var(--line);border-radius:24px;box-shadow:0 32px 120px #0007;padding:28px;width:min(440px,calc(100% - 28px));text-align:center}.td-root dialog::backdrop{background:#080c19a8;backdrop-filter:blur(8px)}.td-root dialog[open]{animation:td-dialog-in .3s cubic-bezier(.2,.8,.2,1) both}@keyframes td-dialog-in{from{opacity:0;transform:translateY(16px) scale(.98)}to{opacity:1;transform:none}}@keyframes td-enter{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}.td-root dialog h2{font-size:27px;letter-spacing:-.04em;margin:10px 0}.td-root .results{display:flex;gap:8px;margin:25px 0}.td-root .results>div{flex:1;padding:12px 5px;background:var(--soft);border:1px solid var(--line);border-radius:12px}.td-root .results strong{display:block;font-size:25px}.td-root .results small{font-size:10px;color:var(--muted)}.td-root .record{color:var(--accent);font-size:12px;margin-bottom:20px}.td-root .dlg-actions{display:grid;gap:8px}\n.td-root #aiDialog{width:min(650px,calc(100% - 32px));max-height:calc(100dvh - 48px);padding:0;text-align:left;overflow:hidden}.td-root #aiDialog[open]{display:flex;flex-direction:column}.td-root #aiForm{display:flex;flex-direction:column;min-height:0;overflow:hidden}.td-root .ai-header{position:relative;flex-shrink:0;padding:25px 28px 19px;border-bottom:1px solid var(--line);background:radial-gradient(ellipse at 0 0,var(--accent-soft),transparent 80%)}.td-root .ai-kicker{display:flex;align-items:center;gap:8px;font-size:10px;font-weight:650;color:var(--accent);letter-spacing:.1em}.td-root .ai-kicker .ui-svg{width:17px;height:17px}.td-root #aiDialog h2{font-size:27px;line-height:1.2;margin:12px 38px 8px 0;letter-spacing:-.035em}.td-root .ai-header p{font-size:12px;max-width:490px}.td-root .close-dialog{position:absolute;right:20px;top:20px;width:32px;height:32px;border-radius:10px;display:grid;place-items:center;background:transparent;color:var(--muted);border-color:transparent}.td-root .close-dialog:hover{border-color:var(--line)}.td-root .ai-steps{display:flex;gap:10px;align-items:center;margin-top:19px;color:var(--muted);font-size:10px}.td-root .ai-steps span{display:flex;align-items:center;gap:6px}.td-root .ai-steps b{display:grid;place-items:center;width:19px;height:19px;border:1px solid var(--line);border-radius:50%;font-size:9px;font-weight:600}.td-root .ai-steps .active{color:var(--accent)}.td-root .ai-steps .active b{background:var(--accent);border-color:var(--accent);color:var(--soft)}.td-root .ai-steps i{height:1px;flex:1;background:var(--line)}\n.td-root .ai-body{min-height:0;overflow:auto;overscroll-behavior:contain;scrollbar-width:thin;scrollbar-color:var(--line) transparent;padding:22px 28px 24px}.td-root .field-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:9px}.td-root .field-top label,.td-root .field-label{font-size:12px;font-weight:600}.td-root .field-top small{font-size:10px;color:var(--muted);font-variant-numeric:tabular-nums}.td-root .topic-wrap{position:relative}.td-root #aiTopic{display:block;width:100%;height:78px;resize:none;padding:13px 15px;border:1px solid var(--line);border-radius:12px;background:var(--soft);color:var(--text);font-size:13px;line-height:1.6;transition:box-shadow .2s,border .2s}.td-root #aiTopic:focus{outline:none;border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-soft)}.td-root #aiTopic::placeholder{color:var(--muted)}.td-root .suggestions{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin:10px 0 21px}.td-root .topic-chip{display:flex;align-items:center;gap:5px;padding:5px 9px;border:1px solid var(--line);background:none;border-radius:8px;font-size:10px;color:var(--muted)}.td-root .topic-chip .ui-svg{width:12px;height:12px}.td-root .topic-chip[aria-pressed=true]{color:var(--accent);background:var(--accent-soft);border-color:color-mix(in srgb,var(--accent) 40%,var(--line))}\n.td-root .ai-grid{display:grid;grid-template-columns:.8fr 1.2fr;gap:18px;margin-bottom:19px}.td-root .choice-group{min-width:0;padding:0;border:0;margin:0}.td-root .choice-group legend{padding:0;margin:0 0 9px;font-size:12px;font-weight:600}.td-root .segmented{display:flex;padding:3px;background:var(--soft);border:1px solid var(--line);border-radius:11px;gap:3px}.td-root .choice{position:relative;flex:1;min-width:0;cursor:pointer}.td-root .choice input{position:absolute;opacity:0;width:1px;height:1px}.td-root .choice>span{display:flex;align-items:center;justify-content:center;gap:5px;padding:8px 4px;border-radius:8px;color:var(--muted);font-size:11px;font-weight:550;transition:background .2s,box-shadow .2s,color .2s}.td-root .choice input:checked+span{background:var(--panel);color:var(--accent);box-shadow:0 2px 5px #0002}.td-root .choice input:focus-visible+span{outline:2px solid var(--accent);outline-offset:2px}.td-root .choice:hover>span{color:var(--text)}.td-root .setting-hint{margin-top:7px;font-size:10px;color:var(--muted)}.td-root .level-options{display:flex;gap:8px}.td-root .level-options .choice>span{flex-direction:column;align-items:flex-start;gap:4px;padding:12px;border:1px solid var(--line);border-radius:11px;background:var(--soft)}.td-root .level-options .choice input:checked+span{border-color:var(--accent);background:var(--accent-soft);box-shadow:none}.td-root .level-options strong{font-size:11px;font-weight:600}.td-root .level-options small{font-size:9px;font-weight:400;color:var(--muted)}.td-root .level-bars{display:flex;gap:3px;height:14px;align-items:end;margin-bottom:3px}.td-root .level-bars i{width:4px;border-radius:2px;background:var(--line)}.td-root .level-bars i:nth-child(1){height:6px;background:var(--accent)}.td-root .level-bars i:nth-child(2){height:10px}.td-root .level-bars i:nth-child(3){height:14px}.td-root .choice:nth-child(n+2) .level-bars i:nth-child(2),.td-root .choice:nth-child(3) .level-bars i:nth-child(3){background:var(--accent)}\n.td-root #aiStatus{font-size:11px;color:var(--accent);margin-top:18px;line-height:1.6}.td-root #aiStatus:empty,.td-root #aiError:empty{display:none}.td-root #aiError{padding:11px 13px;font-size:11px;line-height:1.6;background:#ef647412;color:#ef8a9b;border:1px solid #ef647440;border-radius:10px;margin-top:10px}html.light .td-root #aiError,body.light .td-root #aiError,.theme-light .td-root #aiError,[data-theme=\"light\"] .td-root #aiError{color:#b83452}.td-root .preview-card{margin-top:15px;border:1px solid color-mix(in srgb,var(--accent) 30%,var(--line));border-radius:13px;background:var(--soft);animation:td-enter .25s both;overflow:hidden}.td-root .preview-title{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 15px;border-bottom:1px solid var(--line);font-size:11px;font-weight:600}.td-root .preview-title span:first-child{display:flex;align-items:center;gap:7px}.td-root .preview-title .ui-svg{width:15px;height:15px;color:var(--success)}.td-root #previewCount{font-size:10px;font-weight:400;color:var(--muted)}.td-root .ai-preview{white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.85;font-size:13px;color:var(--text);padding:14px 15px}.td-root .ai-loading{margin-top:18px;padding:17px;background:var(--soft);border:1px solid var(--line);border-radius:12px}.td-root .skeleton{height:8px;border-radius:8px;margin:8px 0;background:linear-gradient(90deg,var(--line) 20%,var(--accent-soft) 50%,var(--line) 80%);background-size:200% 100%;animation:td-shimmer 1.5s ease infinite}.td-root .skeleton:last-child{width:64%}@keyframes td-shimmer{to{background-position:-200% 0}}\n.td-root .ai-footer{flex-shrink:0;padding:16px 28px 18px;border-top:1px solid var(--line);background:var(--panel)}.td-root .ai-actions{display:flex;align-items:center;gap:10px}.td-root .ai-actions .primary{flex:1}.td-root .ai-actions .secondary{width:auto;min-width:120px;background:none}.td-root .ai-actions button{font-size:12px;min-height:43px}.td-root .ai-actions button .ui-svg{width:17px;height:17px}.td-root .ai-actions.has-preview #generate{width:auto;min-width:44px;flex:0 0 auto;background:var(--soft);color:var(--muted);box-shadow:none;border-color:var(--line)}.td-root .ai-actions.has-preview #cancelAI{display:none}.td-root .ai-actions #useAI{flex:1}.td-root .footer-note{margin:10px 0 0;font-size:10px;color:var(--muted);text-align:center}.td-root .spinner{width:15px;height:15px;border:2px solid #ffffff44;border-top-color:white;border-radius:50%;animation:td-spin .8s linear infinite}@keyframes td-spin{to{transform:rotate(360deg)}}\n@media(min-width:1001px){.td-root .side{position:sticky;top:20px}}@media(max-width:1000px){.td-root .app{padding:22px}.td-root .layout{grid-template-columns:minmax(0,1fr) 270px;gap:14px}.td-root .side{padding:17px}.td-root .heading{align-items:flex-start}.td-root .tabs button{padding:10px 12px}.td-root .scene{height:370px}.td-root .type-top{align-items:flex-start}.td-root .type-top b{font-size:11px}.td-root .help{align-items:flex-start}.td-root .help>span:first-child{max-width:75%}}\n@media(max-width:800px){.td-root .layout{grid-template-columns:1fr}.td-root .side{display:grid;grid-template-columns:1fr 1fr;gap:22px}.td-root .side .divider{display:none}.td-root .side>.callout{grid-column:1/-1;margin:0;padding-top:12px}.td-root .heading{align-items:flex-start;flex-direction:column;gap:14px}.td-root .heading .tabs{align-self:stretch}.td-root .tabs button{flex:1}.td-root .footer{flex-direction:column;gap:8px}.td-root .scene{height:370px}}\n@media(max-width:560px){.td-root .app{padding:16px 12px}.td-root header{padding-bottom:16px;margin-bottom:24px}.td-root .brand{font-size:11px;gap:8px}.td-root .brand small{font-size:7px}.td-root .logo{width:35px;height:35px;border-radius:11px}.td-root .icon{width:35px;height:35px;border-radius:10px}.td-root .heading{margin-bottom:18px}.td-root h1{font-size:27px;max-width:300px}.td-root .head-copy p{font-size:12px}.td-root .bar{padding:13px 14px;font-size:10px}.td-root .metrics{padding:18px 4px}.td-root .metric strong{font-size:25px}.td-root .metric small{font-size:9px}.td-root .scene{height:336px;margin:0 8px;border-radius:12px}.td-root .scene-title{font-size:7px;left:10px}.td-root .scene-note{font-size:9px;right:9px}.td-root .typing{padding:17px 13px}.td-root .type-top{flex-direction:column;gap:8px}.td-root .type-right{width:100%;justify-content:space-between}.td-root .type-top b{font-size:11px}.td-root .ribbon{height:67px}.td-root .text{font-size:23px;left:15px}.td-root .help{font-size:9px;gap:8px}.td-root .side{display:block;padding:18px}.td-root .side .divider{display:block;margin:20px 0}.td-root .side>.callout{margin-top:18px}.td-root .vehicles{margin-top:15px}.td-root .vehicle{padding:18px 4px 12px}.td-root .callout{font-size:11px}.td-root .scene-title{max-width:45%}.td-root #aiDialog{width:calc(100% - 20px);max-height:calc(100dvh - 20px);border-radius:20px}.td-root .ai-header{padding:21px 19px 16px}.td-root .ai-header p{font-size:11px}.td-root #aiDialog h2{font-size:24px}.td-root .close-dialog{right:13px;top:13px}.td-root .ai-steps{margin-top:14px;gap:7px;font-size:9px}.td-root .ai-body{padding:18px 19px 20px}.td-root .ai-grid{grid-template-columns:1fr;gap:16px;margin-bottom:17px}.td-root .ai-footer{padding:13px 19px 15px}.td-root .ai-actions{gap:7px}.td-root .ai-actions .secondary{min-width:80px}.td-root .ai-actions button{font-size:11px;padding:10px}.td-root .level-options{gap:6px}.td-root .level-options .choice>span{padding:10px 7px}.td-root .level-options small{font-size:8px}.td-root .suggestions{gap:5px}.td-root .topic-chip{font-size:9px;padding:5px 7px}.td-root .ai-actions.has-preview #generate{min-width:40px}.td-root .ai-actions.has-preview #generate .button-label{display:none}.td-root .preview-title{padding:11px 12px}.td-root .ai-preview{padding:12px;font-size:12px}}\n@media(prefers-reduced-motion:reduce){.td-root *,.td-root *:before,.td-root *:after{animation:none!important;transition:none!important;scroll-behavior:auto!important}}\n\n\n.td-hub{max-width:1320px;margin:0 auto}.td-hub-bar{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:0 auto 18px;max-width:1240px;padding:6px}.td-hub-tabs{display:flex;gap:5px;background:var(--pt-panel);padding:5px;border:1px solid var(--pt-line);border-radius:16px}.td-hub-tabs button{display:flex;gap:8px;align-items:center;justify-content:center;border:0;background:none;color:var(--pt-muted);border-radius:11px;padding:11px 17px;font-size:12px!important;font-weight:650}.td-hub-tabs button.selected{background:var(--pt-soft);color:var(--pt-accent);box-shadow:0 2px 8px #0001}.td-hub-tabs button>span{font-size:8px;letter-spacing:.07em;border:1px solid var(--pt-line);padding:2px 5px;border-radius:5px}.td-hub>[hidden]{display:none!important}.td-root{background:transparent}.td-root .app{padding:15px 6px}.td-root .td-top-actions{display:flex;gap:10px;align-items:center}.td-root .td-notice{display:flex;align-items:center;gap:10px;border:1px solid var(--line);background:var(--soft);padding:12px 16px;margin-bottom:17px;border-radius:12px;color:var(--muted);font-size:12px}.td-root .td-notice span{flex:1}.td-root .td-notice .icon{width:28px;height:28px;flex-shrink:0}.td-root .td-notice.error{color:var(--pt-error);border-color:var(--pt-error);background:var(--pt-error-bg)}.td-root .td-ai-button{margin-top:15px}.td-root .td-other{background:none;border-color:transparent;color:var(--muted);margin-top:6px;font-size:11px}.td-root .td-empty{padding:16px 4px;line-height:1.8;font-size:11px}.td-root .td-invite-actions{display:flex;gap:7px;margin-top:12px}.td-root .td-invite-actions button{font-size:10px;padding:8px}.td-root .td-wait-note{font-size:11px;color:var(--muted);margin-top:12px;line-height:1.7}.td-root .td-shared-text{margin-top:16px;padding:11px 13px;border:1px solid var(--line);border-radius:11px;background:var(--soft);font-size:11px}.td-root .td-shared-text summary{cursor:pointer;color:var(--accent);font-weight:600}.td-root .td-shared-text p{font-size:12px;line-height:1.8;margin-top:10px}.td-root .td-result-link{margin-top:15px}.td-root .td-save{font-size:11px;margin-bottom:16px}.td-root .td-save .mini{margin-left:7px}.td-root #aiDialog .ai-header h2{margin:12px 38px 8px 0;font-size:27px;line-height:1.2;letter-spacing:-.035em}.td-root .side>.callout{margin-top:20px}.td-root .primary>svg,.td-root .secondary>svg{flex-shrink:0}.td-root .vehicle:disabled{opacity:.65}.td-root .ai-header p{margin:0}.td-root .ai-footer p{margin:10px 0 0}.td-root .preview-title>span:last-child{font-size:10px;color:var(--muted);font-weight:400}.td-root .ribbon:focus-within{border-color:var(--accent)}\n@media(max-width:560px){.td-hub-tabs{width:100%}.td-hub-tabs button{flex:1;font-size:11px!important;padding:10px}.td-hub-tabs button>span{display:none}.td-hub-bar{gap:4px;padding:0}.td-root .app{padding:10px 0}.td-root .td-top-actions{width:100%}.td-root .td-top-actions .tabs{flex:1}.td-root .td-notice{padding:10px;font-size:11px}.td-root #aiDialog .ai-header h2{font-size:24px}.td-root .side{display:block}.td-root .ai-grid{grid-template-columns:1fr}}\n";
// TypeDrive uses the existing Firebase compat instance; no extra Firebase app is created.
const TD = { presence: 'typedrivePresence', rooms: 'typedriveRooms', heartbeat: 25000, lease: 90000, inviteTTL: 60000, countdown: 3000, progressEvery: 1500 };
const tdMillis = value => value?.toMillis?.() || 0;
const tdName = value => String(value || 'Ученик').replace(/[\u0000-\u001f]/g, '').trim().slice(0, 40) || 'Ученик';
const tdError = error => {
    const code = String(error?.code || '');
    if (code.includes('permission-denied')) return 'Нет доступа к TypeDrive. Добавьте правила Firestore из комплекта и проверьте доступ к модулю «typing».';
    if (code.includes('failed-precondition')) return 'Firebase требует индекс. Администратору нужно добавить индексы TypeDrive из комплекта.';
    if (code.includes('unavailable') || code.includes('deadline')) return 'Нет связи с Firebase. Проверьте интернет и повторите действие.';
    return error?.message || 'Не удалось выполнить действие. Повторите попытку.';
};
class TypeDriveService {
    constructor({ db, auth, firebase, emit, session }) {
        this.db = db; this.auth = auth; this.fb = firebase; this.emit = emit; this.session = session;
        this.uid = auth.currentUser.uid; this.room = null; this.roomId = ''; this.unsubs = []; this.dead = false;
        this.people = []; this.incoming = []; this.offset = 0; this.lastHeartbeat = 0; this.progressInFlight = false; this.progressBlocked = false;
        this.searching = false; this.matching = false; this.seq = 0; this.queue = null; this.online = true;
    }
    stamp() { return this.fb.firestore.FieldValue.serverTimestamp(); }
    timestamp(ms) { return this.fb.firestore.Timestamp.fromMillis(ms); }
    now() { return Date.now() + this.offset; }
    ownRef() { return this.db.collection(TD.presence).doc(this.uid); }
    check() { if (this.dead || this.auth.currentUser?.uid !== this.uid) throw new Error('Аккаунт изменился. Откройте TypeDrive заново.'); }
    send(type, data) { if (!this.dead) this.emit(type, data); }
    fail(e) { this.send('error', tdError(e)); }
    async start(vehicle) {
        this.check(); this.vehicle = vehicle;
        const profile = await this.db.collection('users').doc(this.uid).get({ source: 'server' });
        if (!profile.exists) throw new Error('Профиль ученика не найден. Войдите в LMS заново.');
        const user = profile.data();
        if (user.isBanned || Array.isArray(user.allowedModules) && !user.allowedModules.includes('typing')) throw new Error('Доступ к тренажёру печати закрыт. Обратитесь к преподавателю.');
        this.name = tdName(user.fullName || user.name || user.displayName || this.auth.currentUser.displayName);
        const ref = this.ownRef(); let resume = '';
        await this.db.runTransaction(async tx => {
            this.check(); const old = await tx.get(ref), data = old.data();
            if (data && data.session !== this.session && (data.available || data.roomId || data.looking) && Date.now() - tdMillis(data.seenAt) < TD.lease) throw new Error('TypeDrive уже открыт в другой вкладке. Закройте его там или подождите полторы минуты.');
            resume = data?.session === this.session ? data.roomId || '' : '';
            tx.set(ref, { uid: this.uid, name: this.name, vehicle, session: this.session, roomId: resume, available: !resume, looking: false, seenAt: this.stamp() });
        });
        this.check(); await this.heartbeat(); this.check();
        this.unsubs.push(ref.onSnapshot(s => {
            if (s.exists && s.data().session !== this.session) { this.send('fatal', 'Сессия TypeDrive открыта в другой вкладке. Вернитесь в классический режим.'); this.dispose(false); }
        }, e => this.fail(e)));
        this.watchPeople();
        this.unsubs.push(this.db.collection(TD.rooms).where('guestId', '==', this.uid).where('status', '==', 'invited').limit(10).onSnapshot(s => {
            this.incoming = s.docs.map(d => ({ id: d.id, ...d.data() })).filter(r => this.now() - tdMillis(r.createdAt) < TD.inviteTTL);
            this.send('incoming', this.incoming); this.autoAccept();
        }, e => this.fail(e)));
        this.tick = setInterval(() => { this.heartbeat().catch(e => this.fail(e)); this.sweep(); }, TD.heartbeat);
        this.progressTimer = setInterval(() => this.flushProgress(), TD.progressEvery);
        this.onlineHandler = () => { this.online = navigator.onLine; this.send('connection', this.online); if (this.online) { this.progressBlocked = false; this.flushProgress(); this.heartbeat().catch(e => this.fail(e)); } };
        window.addEventListener('online', this.onlineHandler); window.addEventListener('offline', this.onlineHandler);
        this.onlineHandler();
        if (resume) {
            const saved = await this.db.collection(TD.rooms).doc(resume).get({ source: 'server' });
            if (saved.exists && saved.data().memberIds.includes(this.uid) && saved.data().status !== 'closed' && this.now() - tdMillis(saved.data().createdAt) < 1800000) this.watchRoom(resume);
            else await this.release();
        }
        this.send('connected', { uid: this.uid, name: this.name });
    }
    async heartbeat() {
        if (this.dead || this.heartBusy || !navigator.onLine) return;
        this.heartBusy = true; const before = Date.now();
        try {
            this.check(); await this.db.runTransaction(async tx => {
                const ref = this.ownRef(), snap = await tx.get(ref); this.check();
                if (!snap.exists || snap.data().session !== this.session) throw new Error('Сессия TypeDrive завершена в другой вкладке.');
                tx.update(ref, { seenAt: this.stamp(), vehicle: this.vehicle });
            });
            const snap = await this.ownRef().get({ source: 'server' }); this.check();
            const stamp = tdMillis(snap.data()?.seenAt);
            if (stamp) this.offset = stamp - (before + Date.now()) / 2;
            this.lastHeartbeat = Date.now(); this.send('clock', this.offset);
        } finally { this.heartBusy = false; }
    }
    watchPeople() {
        this.peopleOff?.();
        this.peopleOff = this.db.collection(TD.presence).where('seenAt', '>', this.timestamp(this.now() - TD.lease)).limit(50).onSnapshot(s => {
            this.people = s.docs.map(d => d.data()).filter(p => p.uid !== this.uid);
            this.sendPeople(); this.match();
        }, e => this.fail(e));
    }
    sendPeople() { this.send('people', this.people.filter(p => p.available && this.now() - tdMillis(p.seenAt) < TD.lease)); }
    sweep() {
        this.sendPeople();
        this.send('incoming', this.incoming.filter(r => this.now() - tdMillis(r.createdAt) < TD.inviteTTL));
        if (this.room?.status === 'invited' && this.now() - tdMillis(this.room.createdAt) > TD.inviteTTL) this.leave('expired').catch(e => this.fail(e));
        if (this.room && this.now() - tdMillis(this.room.createdAt) > 1800000) this.leave('expired').catch(e => this.fail(e));
        if (!this.roomId) this.watchPeople();
    }
    async setLooking(value) {
        this.check(); if (this.roomId) return;
        await this.db.runTransaction(async tx => {
            const ref = this.ownRef(), s = await tx.get(ref); this.check();
            if (!s.exists || s.data().session !== this.session || s.data().roomId) throw new Error('Вы уже участвуете в другом заезде.');
            tx.update(ref, { looking: value, available: true, seenAt: this.stamp() });
        });
        this.searching = value; this.send('searching', value); if (value) { this.autoAccept(); this.match(); }
    }
    async match() {
        if (!this.searching || this.roomId || this.matching || this.dead) return;
        const target = this.people.filter(p => p.available && p.looking && this.now() - tdMillis(p.seenAt) < TD.lease && this.uid < p.uid).sort((a,b) => a.uid.localeCompare(b.uid))[0];
        if (!target) return; this.matching = true;
        try { await this.invite(target.uid, true); } catch (e) { this.fail(e); } finally { this.matching = false; }
    }
    async autoAccept() {
        if (!this.searching || this.roomId || this.accepting || this.dead) return;
        const candidate = this.incoming.find(r => r.autoMatch && this.now() - tdMillis(r.createdAt) < TD.inviteTTL);
        if (!candidate) return; this.accepting = true;
        try { await this.accept(candidate.id); } catch (e) { this.fail(e); } finally { this.accepting = false; }
    }
    player(p) { return { uid: p.uid, name: tdName(p.name), vehicle: p.vehicle, readyVersion: 0, index: 0, errors: 0, elapsedMs: 0, finishedAt: null, seenAt: this.stamp() }; }
    async invite(guestId, autoMatch = false) {
        this.check(); if (this.roomId || guestId === this.uid) return;
        const ref = this.db.collection(TD.rooms).doc();
        await this.db.runTransaction(async tx => {
            const meRef = this.ownRef(), guestRef = this.db.collection(TD.presence).doc(guestId);
            const meSnap = await tx.get(meRef), guestSnap = await tx.get(guestRef); this.check();
            const me = meSnap.data(), guest = guestSnap.data();
            if (!me || me.session !== this.session || me.roomId) throw new Error('Вы уже участвуете в заезде.');
            if (!guest || !guest.available || guest.roomId || this.now() - tdMillis(guest.seenAt) > TD.lease || autoMatch && !guest.looking) throw new Error('Ученик уже занят или вышел из TypeDrive. Выберите другого.');
            tx.set(ref, { hostId: this.uid, guestId, memberIds: [this.uid, guestId], host: this.player(me), guest: this.player(guest), status: 'invited', autoMatch, text: '', version: 0, language: 'ru', topic: '', length: 'medium', level: 'medium', startAt: null, createdAt: this.stamp(), updatedAt: this.stamp(), closedBy: '', reason: '' });
            tx.update(meRef, { roomId: ref.id, available: false, looking: false, seenAt: this.stamp() });
        });
        this.check(); this.searching = false; this.send('searching', false); this.watchRoom(ref.id);
    }
    async accept(id) {
        this.check(); if (this.roomId) throw new Error('Сначала завершите текущий заезд.');
        const ref = this.db.collection(TD.rooms).doc(id);
        await this.db.runTransaction(async tx => {
            const snap = await tx.get(ref), meSnap = await tx.get(this.ownRef()); this.check();
            const r = snap.data(), me = meSnap.data();
            if (!r || r.guestId !== this.uid || r.status !== 'invited' || this.now() - tdMillis(r.createdAt) >= TD.inviteTTL) throw new Error('Приглашение уже недействительно.');
            const host = await tx.get(this.db.collection(TD.presence).doc(r.hostId));
            if (!host.exists || host.data().roomId !== id || this.now() - tdMillis(host.data().seenAt) > TD.lease) throw new Error('Соперник уже покинул заезд.');
            if (!me || me.session !== this.session || me.roomId) throw new Error('Вы уже участвуете в другом заезде.');
            tx.update(ref, { status: 'preparing', guest: this.player(me), updatedAt: this.stamp() });
            tx.update(this.ownRef(), { roomId: id, available: false, looking: false, seenAt: this.stamp() });
        });
        this.check(); this.searching = false; this.send('searching', false); this.watchRoom(id);
    }
    async decline(id) {
        this.check(); const ref = this.db.collection(TD.rooms).doc(id);
        await this.db.runTransaction(async tx => { const s = await tx.get(ref); this.check(); if (s.exists && s.data().guestId === this.uid && s.data().status === 'invited') tx.update(ref, { status: 'closed', reason: 'declined', closedBy: this.uid, updatedAt: this.stamp() }); });
    }
    watchRoom(id) {
        this.roomOff?.(); this.roomId = id; this.queue = null; this.progressBlocked = false; this.seq++;
        this.roomOff = this.db.collection(TD.rooms).doc(id).onSnapshot({ includeMetadataChanges: true }, snap => {
            if (this.dead || this.roomId !== id || !snap.exists) return;
            this.room = { id, ...snap.data() };
            this.send('room', { ...this.room, pending: snap.metadata.hasPendingWrites, cached: snap.metadata.fromCache });
            if (this.room.status === 'closed') {
                const reason = this.room.reason === 'declined' ? 'Приглашение отклонено.' : this.room.reason === 'expired' ? 'Время ожидания заезда истекло.' : 'Заезд завершён: один из участников вышел.';
                this.send('message', reason); this.release().catch(e => this.fail(e));
            }
        }, e => this.fail(e));
    }
    async publish(text, settings, expectedVersion) {
        this.check(); const id = this.roomId, ref = this.db.collection(TD.rooms).doc(id);
        await this.db.runTransaction(async tx => {
            const s = await tx.get(ref); this.check(); const r = s.data();
            if (!r || r.hostId !== this.uid || !['preparing','ready'].includes(r.status) || r.version !== expectedVersion) throw new Error('Комната изменилась. Обновите текст и попробуйте снова.');
            tx.update(ref, { text, ...settings, version: r.version + 1, status: 'ready', updatedAt: this.stamp() });
        });
    }
    async ready(version) {
        this.check(); const ref = this.db.collection(TD.rooms).doc(this.roomId);
        await this.db.runTransaction(async tx => {
            const s = await tx.get(ref); this.check(); const r = s.data();
            if (!r || r.status !== 'ready' || r.version !== version) throw new Error('Текст изменился. Подтвердите готовность заново.');
            const slot = r.hostId === this.uid ? 'host' : 'guest', other = slot === 'host' ? 'guest' : 'host';
            const both = r[other].readyVersion === version;
            tx.update(ref, { [slot]: { ...r[slot], vehicle: this.vehicle, readyVersion: version, seenAt: this.stamp() }, ...(both ? { status: 'racing', startAt: this.stamp() } : {}), updatedAt: this.stamp() });
        });
    }
    progress(data) { if (this.room?.status !== 'racing') return; this.queue = { ...data, roomId: this.roomId, version: this.room.version }; if (data.done) this.flushProgress(); }
    async flushProgress() {
        if (this.dead || this.progressBlocked || !this.online || !this.queue || this.progressInFlight) return;
        const q = this.queue; this.queue = null; const r = this.room;
        if (!r || q.roomId !== this.roomId || q.version !== r.version || r.status !== 'racing') return;
        const slot = r.hostId === this.uid ? 'host' : 'guest';
        if (r[slot].finishedAt) return;
        this.progressInFlight = true;
        try {
            this.check();
            await this.db.collection(TD.rooms).doc(q.roomId).update({
                [slot + '.index']: q.index, [slot + '.errors']: q.errors, [slot + '.elapsedMs']: Math.max(0, Math.floor(q.elapsedMs)),
                [slot + '.seenAt']: this.stamp(), ...(q.done ? { [slot + '.finishedAt']: this.stamp() } : {}), updatedAt: this.stamp()
            });
            if (q.done) this.send('saved', true);
        } catch (e) { this.progressBlocked = true; if (!this.queue && this.roomId === q.roomId) this.queue = q; this.fail(e); }
        finally { this.progressInFlight = false; if (!this.progressBlocked && this.queue?.done) setTimeout(() => this.flushProgress(), 1000); }
    }
    async leave(reason = 'left') {
        if (!this.roomId) return;
        const id = this.roomId, ref = this.db.collection(TD.rooms).doc(id);
        await this.db.runTransaction(async tx => { const s = await tx.get(ref); this.check(); if (s.exists && s.data().status !== 'closed') tx.update(ref, { status: 'closed', reason, closedBy: this.uid, updatedAt: this.stamp() }); });
        if (this.roomId === id) await this.release();
    }
    async release() {
        const old = this.roomId; this.roomOff?.(); this.roomOff = null; this.roomId = ''; this.room = null; this.queue = null;
        this.send('room', null);
        await this.db.runTransaction(async tx => { const s = await tx.get(this.ownRef()); this.check(); if (s.exists && s.data().session === this.session && (!s.data().roomId || s.data().roomId === old)) tx.update(this.ownRef(), { roomId: '', available: true, looking: false, seenAt: this.stamp() }); });
    }
    dispose(close = true) {
        if (this.dead) return;
        const id = this.roomId; this.dead = true; this.queue = null;
        clearInterval(this.tick); clearInterval(this.progressTimer); this.peopleOff?.(); this.roomOff?.(); this.unsubs.forEach(fn => fn());
        window.removeEventListener('online', this.onlineHandler); window.removeEventListener('offline', this.onlineHandler);
        if (!close || this.auth.currentUser?.uid !== this.uid) return;
        this.db.runTransaction(async tx => {
            const p = await tx.get(this.ownRef()), r = id ? await tx.get(this.db.collection(TD.rooms).doc(id)) : null;
            if (!p.exists || p.data().session !== this.session) return;
            if (r?.exists && r.data().status !== 'closed') tx.update(r.ref, { status: 'closed', reason: 'left', closedBy: this.uid, updatedAt: this.stamp() });
            tx.update(this.ownRef(), { available: false, looking: false, roomId: '', seenAt: this.stamp() });
        }).catch(() => {}); // Presence also expires if the tab disappears before this commit.
    }
}

function mountTypeDriveTrack(canvas,scene,read){
 if(!canvas||!scene)return()=>{};const ctx=canvas.getContext('2d');if(!ctx)return()=>{};
 let w=900,h=386,offset=0,velocity=0,lastFrame=0,raf=0,disposed=false,particles=[],flash=0,positions=[0,0,0,0];
 let mode='solo',state='idle',transport='car',opponentVehicle='car',index=0,raceText='',streak=0,error=false,speed=0,lastInput=0,names=['ТЫ','ВЕКТОР','КОМЕТА','ИМПУЛЬС'];
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,colors=['#b499ff','#70ddc8','#f2b97c','#83bfff'];
 const observer=new ResizeObserver(()=>{const r=canvas.getBoundingClientRect();if(!r.width||!r.height)return;w=r.width;h=r.height;const d=Math.min(devicePixelRatio||1,2);canvas.width=w*d;canvas.height=h*d;ctx.setTransform(d,0,0,d,0,0);});observer.observe(scene);
 const TAU=Math.PI*2,clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),mod=(a,b)=>((a%b)+b)%b,mk=(n,m)=>{const c=document.createElement('canvas');c.width=n;c.height=m;return c};
function rect(x,y,a,b,c,r=0){ctx.fillStyle=c;ctx.beginPath();ctx.roundRect(x,y,a,b,r);ctx.fill()}
function ellipse(x,y,a,b,c){ctx.fillStyle=c;ctx.beginPath();ctx.ellipse(x,y,a,b,0,0,TAU);ctx.fill()}
function line(p,c,wd=1){ctx.strokeStyle=c;ctx.lineWidth=wd;ctx.lineCap='round';ctx.beginPath();p.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));ctx.stroke()}
function vg(x0,y0,x1,y1,st){const g=ctx.createLinearGradient(x0,y0,x1,y1);st.forEach(s=>g.addColorStop(s[0],s[1]));return g}
function glow(x,y,r,c,a=1,sx=1,sy=1){ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=a;ctx.translate(x,y);ctx.scale(sx,sy);const g=ctx.createRadialGradient(0,0,0,0,0,r);g.addColorStop(0,c);g.addColorStop(.3,c+'55');g.addColorStop(1,c+'00');ctx.fillStyle=g;ctx.fillRect(-r,-r,r*2,r*2);ctx.restore()}
function paint(path,c,y0,y1,k=1){ctx.fillStyle=c;ctx.fill(path);ctx.save();ctx.clip(path);ctx.fillStyle=vg(0,y0,0,y1,[[0,'rgba(255,255,255,'+.6*k+')'],[.3,'rgba(255,255,255,'+.08*k+')'],[.62,'rgba(0,0,0,.18)'],[1,'rgba(0,0,0,.78)']]);ctx.fillRect(-12,y0-8,150,y1-y0+16);ctx.restore()}
function beam(x,y,L){ctx.save();ctx.globalCompositeOperation='lighter';ctx.fillStyle=vg(x,0,x+L,0,[[0,'rgba(255,225,170,.38)'],[1,'rgba(255,225,170,0)']]);ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+L,y-14);ctx.lineTo(x+L+8,y+24);ctx.lineTo(x,y+5);ctx.fill();ctx.restore()}
function flame(x,y,len,t){ctx.save();ctx.globalCompositeOperation='lighter';const L=len*(.8+.2*Math.sin(t/23));ctx.fillStyle=vg(x,0,x-L,0,[[0,'rgba(170,230,255,.95)'],[.4,'rgba(70,140,255,.6)'],[1,'rgba(60,90,255,0)']]);ctx.beginPath();ctx.moveTo(x,y-4);ctx.quadraticCurveTo(x-L*.6,y-3,x-L,y);ctx.quadraticCurveTo(x-L*.6,y+3,x,y+4);ctx.fill();ctx.restore();glow(x-6,y,16,'#7fb5ff',.8)}
const P={
car:new Path2D('M1 21C-1 14 1 8 5 6L24 2C32 0 39-7 47-13C54-18 66-19 74-15C84-10 95-3 105 0C113 2 119 7 120 13L120 23C120 27 117 29 112 29L8 29C3 29 1 26 1 21Z'),
glass:new Path2D('M32 1L48-11C55-14.5 64-14.5 71-11.5L90 0Z'),
tail:new Path2D('M3 3C12-4 26-7 38-4L42 9L24 11C14 11 7 9 3 3Z'),
tank:new Path2D('M36-5C47-13 62-15 74-13L82-8C92-6 101 0 103 7C97 11 87 13 79 15L52 19C44 19 38 15 36 9Z'),
screen:new Path2D('M72-13L78-22C80-24 85-23 87-19L92-8Z'),
fender:new Path2D('M81 7C86-3 102-1 110 11L107 13C99 7 90 7 84 13Z'),
eng:new Path2D('M46 8L72 6L76 22L48 24Z'),
boom:new Path2D('M36 4L1 8L1 12L36 18Z'),fin:new Path2D('M1 8L-4-9L5-9L10 8Z'),
hull:new Path2D('M97 18C97 5 84-5 66-7C48-9 34-3 30 8C28 19 33 29 45 31L86 31C93 29 97 25 97 18Z'),
canopy:new Path2D('M97 18C97 8 87-1 73-4L67-4L67 19Z')};
let asphalt,grain,S,hasTex=false,acc=0,pv=0,DT=.016;const fx=[],em=[0,0,0,0],vs=[{l:0},{l:0},{l:0},{l:0}];
function tex(){
let c=mk(256,256),a=c.getContext('2d');
for(let k=0;k<2600;k++){a.fillStyle=Math.random()<.45?'rgba(255,255,255,.08)':'rgba(0,0,0,.22)';const s=Math.random()<.08?2:1;a.fillRect(Math.random()*256,Math.random()*256,s,s)}
asphalt=ctx.createPattern(c,'repeat');
c=mk(128,128);a=c.getContext('2d');const d=a.createImageData(128,128);for(let k=0;k<d.data.length;k+=4){d.data[k]=d.data[k+1]=d.data[k+2]=Math.random()*255;d.data[k+3]=255}a.putImageData(d,0,0);grain=ctx.createPattern(c,'repeat');
const sp=col=>{const c=mk(64,64),a=c.getContext('2d'),g=a.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,col+'ff');g.addColorStop(.5,col+'66');g.addColorStop(1,col+'00');a.fillStyle=g;a.fillRect(0,0,64,64);return c};
S={s:sp('#8d93a1'),d:sp('#d7b894'),f:sp('#8fd0ff')};
}
function wheel(x,y,r){
const b=clamp((velocity-40)/70,0,1),rr=r*.68;
ctx.save();ctx.translate(x,y);
ellipse(0,0,r,r,'#07080c');
ctx.strokeStyle='#1d212b';ctx.lineWidth=r*.1;ctx.beginPath();ctx.arc(0,0,r*.86,0,TAU);ctx.stroke();
ctx.strokeStyle='rgba(255,255,255,.12)';ctx.lineWidth=1;ctx.beginPath();ctx.arc(0,0,r*.97,Math.PI*1.1,Math.PI*1.6);ctx.stroke();
const g=ctx.createRadialGradient(-rr*.3,-rr*.3,0,0,0,rr);g.addColorStop(0,'#f1f4fa');g.addColorStop(.6,'#aab5c8');g.addColorStop(1,'#5b6578');
ellipse(0,0,rr,rr,g);ellipse(0,0,rr*.82,rr*.82,'#181c27');ellipse(0,0,rr*.6,rr*.6,'#6c7587');ellipse(0,0,rr*.48,rr*.48,'#222836');
ctx.fillStyle='#d4243b';ctx.beginPath();ctx.arc(0,0,rr*.6,-1.2,-.35);ctx.arc(0,0,rr*.46,-.35,-1.2,true);ctx.fill();
ctx.save();ctx.rotate(reduced?0:offset*1.6/r);ctx.globalAlpha=1-b*.85;ctx.fillStyle='#c6d0df';
for(let k=0;k<5;k++){ctx.rotate(TAU/5);ctx.beginPath();ctx.moveTo(0,-r*.07);ctx.lineTo(rr*.95,-r*.13);ctx.lineTo(rr*.95,r*.13);ctx.lineTo(0,r*.07);ctx.fill()}
ctx.restore();
if(b>0)ellipse(0,0,rr*.95,rr*.95,'rgba(190,200,220,'+.34*b+')');
ellipse(0,0,r*.12,r*.12,'#e8eef7');ctx.restore();
}
function car(c,boost,t,i,sp){
const jit=reduced?0:Math.sin(t/41+i*5)*sp*.35;
ctx.save();ctx.translate(60,30);ctx.rotate(-clamp(acc*.0005,-.04,.05));ctx.translate(-60,-30+jit);
if(boost)flame(1,26,70+sp*30,t);
paint(P.car,c,-19,29);
ctx.save();ctx.clip(P.car);
ctx.fillStyle=vg(0,0,120,0,[[0,'rgba(0,0,0,.35)'],[.5,'rgba(0,0,0,0)'],[1,'rgba(255,160,100,.28)']]);ctx.fillRect(-2,-22,126,56);
ctx.fillStyle=vg(0,0,120,0,[[0,'rgba(255,255,255,0)'],[.28,'rgba(255,232,214,.6)'],[.72,'rgba(255,200,170,.3)'],[1,'rgba(255,255,255,0)']]);ctx.fillRect(6,5,110,2);
ctx.fillStyle='rgba(0,0,0,.62)';ctx.fillRect(4,22,108,8);ctx.restore();
ctx.save();ctx.clip(P.glass);ctx.fillStyle=vg(0,-14,0,1,[[0,'#2b3d5c'],[1,'#060a12']]);ctx.fillRect(28,-18,66,22);
ctx.fillStyle=vg(38,-14,74,0,[[0,'rgba(255,190,150,0)'],[.5,'rgba(255,190,150,.45)'],[1,'rgba(255,190,150,0)']]);ctx.fillRect(28,-18,66,22);ctx.restore();
ctx.strokeStyle='#05070c';ctx.lineWidth=1.1;ctx.stroke(P.glass);line([[58,-13],[58,1]],'#07090f',2.2);
line([[56,2],[55.5,22]],'rgba(0,0,0,.45)',.8);line([[90,1],[91.5,22]],'rgba(0,0,0,.45)',.8);
rect(44,5,6,1.4,'rgba(0,0,0,.5)',.7);ellipse(86,-1,4.5,2.2,'#0b0e15');rect(-4,-1,17,2.6,'#0d1018',1);line([[4,1],[5,7]],'#0d1018',1.8);rect(111,17,10,7,'#06080c',1.5);
ctx.fillStyle='#fff6dc';ctx.beginPath();ctx.moveTo(105,3);ctx.lineTo(119,9);ctx.lineTo(118,11.5);ctx.lineTo(103,6);ctx.fill();
ctx.fillStyle='#ff3552';ctx.fillRect(0,9,3,6);
glow(118,9,24,'#ffe8b0',.9);glow(1,12,18,'#ff2a4a',.8);beam(118,8,115);
ctx.restore();
ellipse(26,22,14.8,14.8,'#040508');ellipse(93,22,14.8,14.8,'#040508');wheel(26,22,12.5);wheel(93,22,12.5);
}
function bike(c,boost,t,i,sp){
const v=vs[i];v.l+=((boost?-.12:0)-v.l)*Math.min(1,DT*4);
ctx.save();ctx.translate(19,38);ctx.rotate(v.l);ctx.translate(-19,-38);
if(boost)flame(4,14,60+sp*25,t);
wheel(19,23,15);
line([[19,23],[48,20]],'#707a8c',4.5);line([[34,2],[44,19]],'#e0a93a',3);
ctx.strokeStyle='#2a2f3a';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(66,22);ctx.bezierCurveTo(52,28,30,24,4,14);ctx.stroke();
ctx.strokeStyle=vg(0,10,0,28,[[0,'#f2f5fa'],[.5,'#8993a6'],[1,'#3a4150']]);ctx.lineWidth=4;ctx.stroke();
ctx.fillStyle=vg(0,6,0,24,[[0,'#59627a'],[1,'#12161e']]);ctx.fill(P.eng);for(let k=0;k<4;k++)line([[50+k*5,8],[52+k*5,21]],'rgba(0,0,0,.45)',1);
line([[84,-6],[89,8]],'#d8a838',4);line([[89,8],[96,23]],'#cfd8e6',3);
wheel(96,23,15);
line([[36,0],[56,8]],'#151a26',9);line([[56,8],[42,20]],'#151a26',7);
paint(P.tail,c,-6,11);
line([[34,-3],[64,-23]],'#1a2030',11);line([[36,-7],[62,-25]],c,2.2);
paint(P.tank,c,-14,19);
line([[62,-22],[80,-11]],'#202738',6);ellipse(81,-10,3.6,3,'#0e1119');
ellipse(70,-30,8.5,8,c);ctx.fillStyle=vg(0,-36,0,-24,[[0,'#2a1a3a'],[1,'#ff9a6a']]);ctx.beginPath();ctx.moveTo(72,-35);ctx.bezierCurveTo(80,-35,81,-27,77,-25);ctx.lineTo(68,-26);ctx.fill();ellipse(66,-34,3,1.4,'rgba(255,255,255,.6)');
ctx.fillStyle='rgba(170,205,235,.35)';ctx.fill(P.screen);paint(P.fender,c,-2,13);
ctx.fillStyle='#fff6dc';ctx.beginPath();ctx.moveTo(99,-1);ctx.lineTo(105,4);ctx.lineTo(101,8);ctx.lineTo(96,3);ctx.fill();
glow(104,4,22,'#ffe8b0',.9);glow(3,4,14,'#ff2a4a',.8);beam(104,4,105);
ctx.restore();
}
function heli(c,boost,t,i,sp){
const bob=reduced?0:Math.sin(t/520+i)*2+Math.sin(t/110)*.4*sp;
ctx.save();ctx.translate(58,10);ctx.rotate(clamp(sp*.045+acc*.0003,-.02,.1));ctx.translate(-58,-20+bob);
paint(P.boom,c,4,18);paint(P.fin,c,-9,8);
ctx.save();ctx.translate(2,-2);ctx.rotate(t/32);ellipse(0,0,9,9,'rgba(200,215,235,.12)');line([[-9,0],[9,0]],'rgba(220,228,240,.7)',1.6);ctx.restore();
paint(P.hull,c,-8,31);
ctx.save();ctx.clip(P.hull);ctx.fillStyle=vg(0,0,100,0,[[0,'rgba(0,0,0,.4)'],[.5,'rgba(0,0,0,0)'],[1,'rgba(255,160,100,.3)']]);ctx.fillRect(20,-10,85,45);ctx.restore();
line([[38,22],[88,24]],'rgba(0,0,0,.35)',1);
ctx.save();ctx.clip(P.canopy);ctx.fillStyle=vg(0,-4,0,19,[[0,'#2d4366'],[1,'#080d18']]);ctx.fillRect(60,-6,40,28);
ctx.fillStyle=vg(70,-4,95,18,[[0,'rgba(255,190,150,0)'],[.5,'rgba(255,190,150,.45)'],[1,'rgba(255,190,150,0)']]);ctx.fillRect(60,-6,40,28);ctx.restore();
ctx.strokeStyle='#06080d';ctx.lineWidth=1;ctx.stroke(P.canopy);
rect(49,-15,7,12,'#0e121b',2);
line([[26,36],[32,38],[90,38],[96,34]],'#cdd5e2',2.6);line([[46,31],[44,38]],'#9aa5b8',2);line([[82,31],[84,38]],'#9aa5b8',2);
ctx.save();ctx.globalCompositeOperation='lighter';ctx.fillStyle=vg(92,22,180,48,[[0,'rgba(255,240,200,.5)'],[1,'rgba(255,240,200,0)']]);ctx.beginPath();ctx.moveTo(92,22);ctx.lineTo(150,48);ctx.lineTo(215,48);ctx.fill();ctx.restore();
glow(190,48,30,'#fff0c8',.3,2,.25);
if(t%1100<130)glow(2,-10,12,'#ff3030',1);glow(88,20,8,'#ffffff',.5);
ctx.save();ctx.translate(53,-17);
ctx.fillStyle=vg(-76,0,76,0,[[0,'rgba(200,215,235,0)'],[.5,'rgba(200,215,235,.22)'],[1,'rgba(200,215,235,0)']]);ctx.beginPath();ctx.ellipse(0,0,76,3.5,0,0,TAU);ctx.fill();
for(let k=0;k<4;k++){const q=reduced?1:Math.cos(t/55+k*TAU/4);line([[0,0],[q*76,k%2?.6:-.6]],'rgba(225,232,244,.55)',2)}
ctx.restore();ctx.restore();
}
function paintVehicle(type,x,gy,color,i,t,boost){
const s=w<480?.58:.84,sp=clamp(velocity/120,0,1.4),G=type==='car'?34.5:38,R=type==='heli'?64:70;
ctx.save();ctx.translate(x,gy-G*s);ctx.scale(s,s);
ctx.save();ctx.translate(60,G);ctx.scale(1,.16);const sg=ctx.createRadialGradient(0,0,0,0,0,R),k=type==='heli'?.55:1;sg.addColorStop(0,'rgba(0,0,0,'+.75*k+')');sg.addColorStop(.6,'rgba(0,0,0,'+.35*k+')');sg.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=sg;ctx.beginPath();ctx.arc(0,0,R,0,TAU);ctx.fill();ctx.restore();
glow(60,G+3,60,color,.12,1.3,.14);glow(120,G+3,34,'#ffe0a0',.2,2.4,.1);
({car,bike,heli})[type](color,boost,t,i,sp);
ctx.restore();
if(state==='running'&&!reduced){em[i]+=DT*(boost?90:type==='heli'?26:14);
while(em[i]>1){em[i]--;
if(type==='heli')fx.push({k:'dust',x:x+(30+Math.random()*60)*s,y:gy-Math.random()*3,vx:(Math.random()-.2)*60,vy:-6-Math.random()*20,life:.9,max:.9,r:5+Math.random()*5,w:1});
else{const ex=type==='car'?2:5,ey=type==='car'?26:14,y0=gy-(G-ey)*s;
fx.push({k:boost?'flame':'smoke',x:x+ex*s,y:y0,vx:boost?-(160+Math.random()*80):-20,vy:(Math.random()-.6)*(boost?18:12),life:boost?.28:.8,max:boost?.28:.8,r:boost?7:3+Math.random()*3,w:boost?0:1});
if(boost&&Math.random()<.5)fx.push({k:'spark',x:x+ex*s,y:y0,vx:-(120+Math.random()*160),vy:(Math.random()-.3)*90,life:.4,max:.4,r:1,w:0})}}}
ctx.font='700 9px system-ui';ctx.textAlign='center';const ly=gy-(type==='car'?58:type==='bike'?78:72)*s,lx=x+58*s;
ctx.fillStyle='rgba(0,0,0,.5)';ctx.fillText(names[i],lx+1,ly+1);ctx.fillStyle=i?'#c3cfe2':'#eadfff';ctx.fillText(names[i],lx,ly);ctx.textAlign='start';
}
function draw(t,dt){
if(!hasTex){tex();hasTex=true}
DT=dt;acc+=((velocity-pv)/Math.max(dt,.001)-acc)*Math.min(1,dt*5);pv=velocity;
const HZ=88,sx=w*.7,gs=offset*1.6,lane=(h-112)/(mode==='online'?2:4),boosting=state==='running'&&streak>=20&&!error&&t-lastInput<1500;
ctx.save();if(boosting&&!reduced)ctx.translate((Math.random()-.5)*1.4,(Math.random()-.5)*1.4);
ctx.fillStyle=vg(0,0,0,HZ,[[0,'#091030'],[.4,'#2a2a5e'],[.65,'#8b4f73'],[.85,'#e68b69'],[1,'#ffcb8e']]);ctx.fillRect(-4,-4,w+8,HZ+6);
for(let j=0;j<40;j++){const yy=(j*37)%60;ctx.globalAlpha=(.25+.45*Math.abs(Math.sin(t/700+j)))*(1-yy/64);rect((j*131+23)%w,yy+4,1.2,1.2,'#dfe6ff')}ctx.globalAlpha=1;
glow(sx,HZ-5,130,'#ff9a5a',.8,1.6,.7);glow(sx,HZ-5,40,'#ffe6b8',1);ellipse(sx,HZ-5,11,11,'#fff4da');
for(let j=0;j<6;j++){const cw=170+j*23,cx=mod(j*263-offset*(.02+j%3*.012),w+cw*2)-cw,cy=14+(j*29)%40;
for(let b=0;b<4;b++){ctx.save();ctx.translate(cx+b*cw*.22,cy+Math.sin(b*2+j)*4);ctx.scale(2.6,.55);const g=ctx.createRadialGradient(0,8,0,0,0,26+b%2*8);g.addColorStop(0,'rgba(255,170,130,.30)');g.addColorStop(.6,'rgba(120,80,130,.16)');g.addColorStop(1,'rgba(40,40,90,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,34,0,TAU);ctx.fill();ctx.restore()}}
ctx.fillStyle=vg(0,HZ,0,106,[[0,'#d97d68'],[.4,'#6c4668'],[1,'#1b2146']]);ctx.fillRect(0,HZ,w,20);
for(let k=0;k<17;k++){ctx.globalAlpha=.55*(1-k/17);rect(sx+Math.sin(t/260+k*1.7)*k*1.1-(3+k*2.4)/2,HZ+1+k,(3+k*2.4)*(.6+.4*Math.sin(t/200+k)),1,'#ffd9a8')}ctx.globalAlpha=1;
ctx.beginPath();ctx.moveTo(0,104);for(let x=0;x<=w+8;x+=8){const u=x+offset*.02;ctx.lineTo(x,100-30*(.55+.3*Math.sin(u*.011)+.22*Math.sin(u*.027+1.7)+.12*Math.sin(u*.071)))}ctx.lineTo(w+8,104);ctx.closePath();ctx.fillStyle=vg(0,66,0,104,[[0,'#5d4a78'],[1,'#3a3258']]);ctx.fill();
const size=64,sc=offset*.07,b0=Math.floor(sc/size);ctx.fillStyle=vg(0,44,0,104,[[0,'#2a2a4f'],[1,'#3e3558']]);
for(let j=-1;j<w/size+2;j++){const k=j+b0,bx=j*size-mod(sc,size),bh=22+Math.abs(Math.sin(k*14.3))*40,bw=size-10-Math.abs(Math.sin(k*3.1))*10;ctx.fillStyle=vg(0,104-bh,0,104,[[0,'#2a2a4f'],[1,'#3e3558']]);ctx.fillRect(bx,104-bh,bw,bh);
ctx.fillStyle='#ffc98a';ctx.globalAlpha=.8;for(let r=0;r<Math.min(6,(bh-12)/8|0);r++)for(let c=0;c<Math.min(5,(bw-8)/9|0);c++)if(Math.sin(k*7+r*3+c*5)>.35)ctx.fillRect(bx+5+c*9,104-bh+8+r*8,3,4);ctx.globalAlpha=1;
if(j%3===0&&t%1400<700)glow(bx+bw/2,104-bh-2,7,'#ff3a3a',.9)}
for(let x=-mod(gs*.55,320)-320;x<w+40;x+=320){rect(x,52,3,50,'#0f1220');rect(x-14,52,17,2.4,'#0f1220');glow(x-12,57,36,'#ffb86a',.55)}
ctx.fillStyle=vg(0,99,0,108,[[0,'#8d8a99'],[.15,'#5f5c6e'],[1,'#25232f']]);ctx.fillRect(0,99,w,9);ctx.fillStyle='rgba(0,0,0,.35)';for(let x=-mod(gs*.9,70);x<w;x+=70)ctx.fillRect(x,99,1.5,9);ctx.fillStyle='rgba(255,200,160,.45)';ctx.fillRect(0,99,w,1);
ctx.fillStyle=vg(0,108,0,h,[[0,'#3a3b47'],[.25,'#262831'],[1,'#121319']]);ctx.fillRect(0,108,w,h-108);
ctx.save();ctx.translate(-mod(gs,256),0);ctx.fillStyle=asphalt;ctx.fillRect(0,108,w+256,h-108);ctx.restore();
ctx.fillStyle=vg(0,108,0,170,[[0,'rgba(255,170,120,.2)'],[1,'rgba(255,170,120,0)']]);ctx.fillRect(0,108,w,62);glow(sx,150,90,'#ffb27a',.2,.5,1.5);
ctx.fillStyle='rgba(0,0,0,.5)';ctx.fillRect(0,108,w,3);ctx.fillStyle='rgba(235,240,255,.35)';ctx.fillRect(0,112,w,1.5);
rect(0,109,w,lane,'rgba(176,147,255,.045)');
const L=26+clamp(velocity,0,160)*.45,dg=vg(0,0,1,0,[[0,'rgba(235,240,255,0)'],[.15,'rgba(235,240,255,.55)'],[.85,'rgba(235,240,255,.55)'],[1,'rgba(235,240,255,0)']]);
for(let i=0;i<(mode==='online'?1:3);i++)for(let x=-mod(gs,120)-120;x<w;x+=120){ctx.save();ctx.translate(x,109+(i+1)*lane-1);ctx.scale(L,1);ctx.fillStyle=dg;ctx.fillRect(0,0,1,2);ctx.restore()}
for(let i=0;i<(mode==='online'?2:4);i++){const y=109+i*lane;for(let q=0;q<Math.ceil(lane/6);q++)for(let c=0;c<2;c++)rect(w-15+c*6,y+q*6,6,6,(q+c)%2?'rgba(231,237,246,.7)':'#10131a');}
const vw=w-(125*(w<480?.58:.84)+14);
for(let i=0;i<(mode==='online'?2:4);i++){const y=109+i*lane,type=i===0?transport:mode==='online'?opponentVehicle:['car','bike','heli'][i-1];
paintVehicle(type,5+positions[i]*Math.max(10,vw),y+lane*.76,colors[i],i,t,i===0&&boosting)}
const gv=velocity*1.6;let n=0;
for(const p of fx){p.life-=dt;if(p.life<=0)continue;p.x+=(p.vx-gv*p.w)*dt;p.y+=p.vy*dt;const u=1-p.life/p.max;
if(p.k==='spark'){ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=1-u;line([[p.x,p.y],[p.x-p.vx*.04,p.y-p.vy*.04]],'#ffb060',1.2);ctx.restore()}
else if(p.k==='flame'){ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=(1-u)*.7;const r=p.r*(1-u*.5);ctx.drawImage(S.f,p.x-r*2,p.y-r*2,r*4,r*4);ctx.restore()}
else{const r=p.r+u*(p.k==='dust'?14:16);ctx.globalAlpha=(p.k==='dust'?.28:.2)*(1-u);ctx.drawImage(p.k==='dust'?S.d:S.s,p.x-r,p.y-r,r*2,r*2);ctx.globalAlpha=1}
fx[n++]=p}fx.length=n;
if(velocity>35){ctx.fillStyle='#fff';for(let j=0;j<Math.min(16,velocity/9|0);j++){ctx.globalAlpha=clamp(velocity/200,0,.35)*(.4+.6*((j*7)%5)/4);ctx.fillRect(mod(j*277-gs*(1.4+j%3*.4),w+300)-150,114+(j*61)%(h-122),30+velocity*.9,1)}ctx.globalAlpha=1}
if(boosting){ctx.fillStyle=vg(0,0,w*.3,0,[[0,'rgba(130,255,230,.14)'],[1,'rgba(130,255,230,0)']]);ctx.fillRect(0,0,w*.3,h)}
if(flash>0&&!reduced){ctx.fillStyle=`rgba(155,229,219,${flash*.045})`;ctx.fillRect(0,0,w,h);flash=Math.max(0,flash-dt*2)}
for(const p of particles){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=100*dt;ctx.globalAlpha=Math.max(0,Math.min(1,p.life));rect(p.x,p.y,5,2,p.color)}ctx.globalAlpha=1;particles=particles.filter(p=>p.life>0);
glow(sx,HZ-5,200,'#ffa860',.16,3,.25);
ctx.save();ctx.globalCompositeOperation='soft-light';ctx.globalAlpha=.28;ctx.fillStyle=vg(0,0,0,h,[[0,'#3a52c8'],[.5,'#ff9a5a'],[1,'#ff7a40']]);ctx.fillRect(0,0,w,h);ctx.restore();
const vn=ctx.createRadialGradient(w/2,h*.55,h*.35,w/2,h*.55,Math.max(w,h)*.75);vn.addColorStop(0,'rgba(4,6,14,0)');vn.addColorStop(1,'rgba(4,6,14,'+(.62+(boosting?.18:0))+')');ctx.fillStyle=vn;ctx.fillRect(0,0,w,h);
if(!reduced){ctx.save();ctx.globalCompositeOperation='overlay';ctx.globalAlpha=.09;ctx.translate(Math.random()*128|0,Math.random()*128|0);ctx.fillStyle=grain;ctx.fillRect(-128,-128,w+256,h+256);ctx.restore()}
ctx.restore();
}

 function frame(t){if(disposed)return;const v=read(),dt=Math.min((t-lastFrame)/1000,.05)||.016;lastFrame=t;
 ({mode,state,transport,opponentVehicle,index,raceText,streak,error,speed,lastInput}=v);names=v.names.map(n=>String(n).slice(0,20));
 const desired=v.progress||[0,0,0,0];for(let i=0;i<4;i++)positions[i]+=((desired[i]||0)-positions[i])*(reduced?1:1-Math.exp(-dt*8));
 const targetSpeed=state==='running'?15+Math.min(150,speed*.4):state==='finished'?0:5;velocity+=(targetSpeed-velocity)*(1-Math.exp(-dt*2));if(!reduced)offset+=velocity*dt;
 if(!document.hidden&&!v.paused){ctx.clearRect(0,0,w,h);draw(reduced?0:t,dt);}raf=requestAnimationFrame(frame);}
 raf=requestAnimationFrame(frame);return()=>{disposed=true;cancelAnimationFrame(raf);observer.disconnect();};
}

const TD_VEHICLES = { car: ['Купе', 'Спортивное купе · свет фар и вращение колёс.', 'M2 15l2-5 5-1 4-4h5l4 7v6H2zM7 18h.01M18 18h.01'], bike: ['Мотоцикл','Спортбайк · плавный наклон и эффект ускорения.','M5 18h.01M19 18h.01M5 18l6-11 5 11H5m11 0 3-13h-4M9 7h5'], heli: ['Вертолёт','Вертолёт · вращение винтов и мягкий полёт.','M9 10c13-4 17 9 7 9h-6l-3-5-6-2V8l7 4M14 9V4M6 3h16M10 22h12M12 19v3m6-3v3'] };
const tdInitial = (text = TEXTS.ru[0]) => ({ text, index: 0, errors: 0, streak: 0, elapsed: 0, start: 0, wrong: false, lastInput: 0, status: 'idle', version: 0 });
const tdEscapeLabel = c => c === ' ' ? 'пробел' : `«${c}»`;
function TypeDrive({ onBusy }) {
    const [mode, setMode] = useState('solo'), [transport,setTransport] = useState('car');
    const [run, setRun] = useState(tdInitial), runRef = useRef(run), [tick,setTick] = useState(Date.now());
    const [account,setAccount] = useState(window.auth?.currentUser || null);
    const [net,setNet] = useState({ connected:false, people:[], incoming:[], room:null, searching:false, offset:0, online: navigator.onLine });
    const [notice,setNotice] = useState(''), [error,setError] = useState(''), [busy,setBusy] = useState(false), [saved,setSaved] = useState(false);
    const [sound,setSound] = useState(false), audioRef=useRef(null), gainRef=useRef(null), oscRef=useRef(null);
    const serviceRef=useRef(null), inputRef=useRef(null), canvasRef=useRef(null), sceneRef=useRef(null), ribbonRef=useRef(null), lineRef=useRef(null), viewRef=useRef({});
    const lastRoom=useRef(''), mounted=useRef(true), resultRef=useRef(null);
    const [aiOpen,setAiOpen]=useState(false), dialogRef=useRef(null), aiBody=useRef(null), jobRef=useRef(null);
    const [settings,setSettings]=useState({ topic:'Путешествия и интересные открытия',language:'ru',length:'medium',level:'medium' });
    const [generated,setGenerated]=useState(''), [generating,setGenerating]=useState(false), [aiError,setAiError]=useState('');
    const [showResult,setShowResult]=useState(false);
    const room=net.room, uid=account?.uid, slot=room?.hostId===uid?'host':'guest', me=room?.[slot], other=room?.[slot==='host'?'guest':'host'];
    const serverNow=()=>serviceRef.current?.now() || Date.now();
    const elapsed=run.status==='running'?Math.max(0,(mode==='online'?tick+net.offset:tick)-run.start):run.elapsed;
    const speed=elapsed>=1000?Math.round(run.index*60000/elapsed):0;
    const accuracy=run.index+run.errors?Math.round(run.index/(run.index+run.errors)*100):100;
    const progress=run.status==='ready'?0:run.index/Math.max(1,run.text.length);
    const remoteProgress=room?.text?other.index/room.text.length:0;
    const botProgress=[2.5,3.1,3.7].map(rate=>Math.min(1,elapsed/1000*rate/Math.max(1,run.text.length)));
    const place=mode==='online'?1+(remoteProgress>progress?1:0):1+botProgress.filter(p=>p>progress).length;
    const opponentStale=mode==='online'&&room?.status==='racing'&&!other?.finishedAt&&serverNow()-tdMillis(other?.seenAt)>45000;
    const myReady=!!room&&room.version>0&&me?.readyVersion===room.version;
    const waiting=['lobby','invited','preparing','countdown'].includes(run.status)||(run.status==='ready'&&myReady);
    const typingBlocked=waiting||run.status==='finished'||mode==='online'&&(!net.online||!net.connected||room?.cached||(room?.pending&&room?.status!=='racing'))||busy;
    function commit(next){runRef.current=next;setRun(next);}
    function focus(){requestAnimationFrame(()=>inputRef.current?.focus({preventScroll:true}));}
    async function action(fn){if(busy)return;setBusy(true);setError('');try{await fn();}catch(e){if(mounted.current)setError(tdError(e));}finally{if(mounted.current)setBusy(false);}}
    function abortAI(){const job=jobRef.current;if(job){jobRef.current=null;clearTimeout(job.timer);job.controller.abort();}setGenerating(false);}
    function closeAI(){abortAI();setAiOpen(false);}
    function resetSolo(){setSaved(false);setShowResult(false);commit(tdInitial(localText(settings.language,runRef.current.text)));}
    useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;const job=jobRef.current;if(job){clearTimeout(job.timer);job.controller.abort();}audioRef.current?.close().catch(()=>{});};},[]);
    useEffect(()=>{const off=window.auth?.onAuthStateChanged?.(u=>setAccount(u));return()=>off?.();},[]);
    useEffect(()=>{const t=setInterval(()=>setTick(Date.now()),200);return()=>clearInterval(t);},[]);
    useEffect(()=>{onBusy?.(!!room||run.status==='running'||net.searching);return()=>onBusy?.(false);},[!!room,run.status,net.searching]);
    useEffect(()=>{
        if(mode!=='online')return;
        setNet({connected:false,people:[],incoming:[],room:null,searching:false,offset:0,online:navigator.onLine});lastRoom.current='';
        commit({...tdInitial('Найди соперника или пригласи ученика'),status:'lobby'});
        if(!uid){setNotice('Для онлайн-заезда войдите в аккаунт LMS. Одиночная тренировка доступна без входа.');return;}
        if(!window.db?.runTransaction||!window.firebase?.firestore){setError('Не найдено подключение Firebase compat. Проверьте window.auth, window.db и Firebase в LMS.');return;}
        let token;try{const key='typedrive-tab-'+uid;token=sessionStorage.getItem(key)||sessionId();sessionStorage.setItem(key,token);}catch{token=sessionId();}
        let active=true;
        const service=new TypeDriveService({db:window.db,auth:window.auth,firebase:window.firebase,session:token,emit:(type,value)=>{
            if(!active)return;
            if(type==='error'||type==='fatal'){setError(value);if(type==='fatal')setNet(n=>({...n,connected:false}));}
            else if(type==='message')setNotice(value);
            else if(type==='saved')setSaved(value);
            else if(type==='connected'){setNet(n=>({...n,connected:true}));setNotice('');}
            else if(type==='connection')setNet(n=>({...n,online:value}));
            else if(type==='clock')setNet(n=>({...n,offset:value}));
            else setNet(n=>({...n,[type]:value}));
        }});serviceRef.current=service;
        service.start(transport).catch(e=>{if(active)setError(tdError(e));service.dispose();});
        return()=>{active=false;service.dispose();if(serviceRef.current===service)serviceRef.current=null;};
    },[mode,uid]);
    useEffect(()=>{if(serviceRef.current)serviceRef.current.vehicle=transport;},[transport]);
    useEffect(()=>{
        if(mode!=='online')return;
        if(!room){lastRoom.current='';closeAI();setShowResult(false);commit({...tdInitial('Найди соперника или пригласи ученика'),status:'lobby'});return;}
        const key=room.id+':'+room.version;
        if(['invited','preparing'].includes(room.status)){
            if(runRef.current.status!==room.status)commit({...tdInitial(room.status==='invited'?'Ждём ответа на приглашение':'Подготовка общего текста'),status:room.status});
            return;
        }
        if(room.status==='ready'&&lastRoom.current!==key){lastRoom.current=key;setSaved(false);commit({...tdInitial('старт'),status:'ready',version:room.version});}
        if(room.status==='racing'&&room.startAt&&!room.pending){
            const raceKey=key+':race';
            if(lastRoom.current!==raceKey){
                lastRoom.current=raceKey;closeAI();setSaved(!!me.finishedAt);
                const start=tdMillis(room.startAt)+TD.countdown;
                const done=!!me.finishedAt;
                commit({...tdInitial(room.text),index:me.index,errors:me.errors,start,elapsed:done?Math.max(1000,tdMillis(me.finishedAt)-start):0,status:done?'finished':serverNow()<start?'countdown':'running',version:room.version});
                if(done)setShowResult(true);
            }
        }
        if(room.status==='closed'){closeAI();}
    },[room?.id,room?.version,room?.status,tdMillis(room?.startAt),room?.pending]);
    useEffect(()=>{if(run.status==='countdown'&&serverNow()>=run.start){commit({...runRef.current,status:'running'});focus();}},[tick,run.status]);
    useEffect(()=>{
        const dialog=dialogRef.current;if(!dialog)return;
        if(aiOpen&&!dialog.open){dialog.showModal();if(aiBody.current)aiBody.current.scrollTop=0;}
        else if(!aiOpen&&dialog.open)dialog.close();
    },[aiOpen]);
    useEffect(()=>{if(!aiOpen&&!showResult)return;const before=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{document.body.style.overflow=before;};},[aiOpen,showResult]);
    useEffect(()=>{const d=resultRef.current;if(showResult&&!d.open)d.showModal();else if(!showResult&&d.open)d.close();},[showResult]);
    useEffect(()=>{const c=lineRef.current?.children[Math.min(run.index,run.text.length-1)];if(c&&ribbonRef.current)lineRef.current.style.transform=`translateX(${-Math.max(0,c.offsetLeft-ribbonRef.current.clientWidth*.32)}px)`;},[run.index,run.text]);
    viewRef.current={mode,transport,state:run.status,index:run.index,raceText:run.text,streak:run.streak,error:run.wrong,speed,lastInput:run.lastInput,progress:[progress,...(mode==='online'?[remoteProgress]:botProgress)],names:mode==='online'?['ТЫ',other?.name||'СОПЕРНИК']:['ТЫ','ВЕКТОР','КОМЕТА','ИМПУЛЬС'],opponentVehicle:other?.vehicle||'car',paused:aiOpen};
    useEffect(()=>mountTypeDriveTrack(canvasRef.current,sceneRef.current,()=>viewRef.current),[]);
    useEffect(()=>{if(gainRef.current&&audioRef.current){const enabled=sound&&run.status==='running'&&!document.hidden;gainRef.current.gain.setTargetAtTime(enabled?.008:0,audioRef.current.currentTime,.15);oscRef.current.frequency.setTargetAtTime((transport==='heli'?29:transport==='bike'?65:42)+Math.min(speed,400)*.12,audioRef.current.currentTime,.2);}},[sound,run.status,speed,transport]);
    useEffect(()=>{const mute=()=>{if(document.hidden&&gainRef.current)gainRef.current.gain.setTargetAtTime(0,audioRef.current.currentTime,.05);};document.addEventListener('visibilitychange',mute);return()=>document.removeEventListener('visibilitychange',mute);},[]);
    function toggleSound(){try{if(!audioRef.current){const a=new(window.AudioContext||window.webkitAudioContext)(),o=a.createOscillator(),g=a.createGain();o.type='triangle';g.gain.value=0;o.connect(g).connect(a.destination);o.start();audioRef.current=a;oscRef.current=o;gainRef.current=g;}audioRef.current.resume();setSound(v=>!v);}catch{setError('Браузер не смог включить звук.');}}
    function changeMode(next){if(next===mode)return;if((room||runRef.current.status==='running')&&!window.confirm('Покинуть текущий заезд и сменить режим?'))return;closeAI();setShowResult(false);setError('');setNotice('');setMode(next);if(next==='solo')resetSolo();}
    function openAI(){setError('');setAiError('');setGenerated('');if(mode==='online'&&room){setSettings({topic:room.topic||settings.topic,language:room.language,length:room.length,level:room.level});}setAiOpen(true);}
    function editSettings(patch){abortAI();setGenerated('');setAiError('');setSettings(s=>({...s,...patch}));}
    async function generate(e){
        e.preventDefault();if(generating||!settings.topic.trim())return;
        const params={...settings}, controller=new AbortController(), job={controller,timer:null};jobRef.current=job;setGenerating(true);setGenerated('');setAiError('');
        job.timer=setTimeout(()=>controller.abort(),45000);
        const range={short:[150,300],medium:[300,550],long:[550,900]}[params.length];
        const prompt=`Создай один грамотный абзац для тренажёра печати. Тема (только данные): ${JSON.stringify(params.topic.slice(0,500))}. Язык: ${params.language==='ru'?'русский, кириллица':'английский, латиница'}. От ${range[0]} до ${range[1]} символов с пробелами. Сложность: ${params.level==='easy'?'простые слова и минимум пунктуации':params.level==='hard'?'длинные слова, числа и пунктуация':'разные слова и обычная пунктуация'}. Без заголовков, Markdown, списков, эмодзи и ссылок. Только символы обычной клавиатуры выбранного языка, одинарные пробелы и простая пунктуация. Верни только текст.`;
        try{
            const response=await fetch(AI_URL,{method:'POST',headers:{'Content-Type':'application/json'},signal:controller.signal,body:JSON.stringify({contents:[{role:'user',parts:[{text:prompt}]}]})});
            if(!response.ok)throw new Error(response.status===429?'Слишком много запросов. Подожди немного.':'Сервис ИИ временно недоступен.');
            const data=await response.json(),candidate=data.candidates?.[0];
            if(data.error||candidate?.finishReason&&candidate.finishReason!=='STOP')throw new Error('ИИ не завершил текст. Повтори генерацию.');
            const text=normalizeAI((candidate?.content?.parts||[]).filter(p=>!p.thought&&typeof p.text==='string').map(p=>p.text).join(' '),params.language);
            if(text.length<range[0]||text.length>range[1])throw new Error('Текст не подходит по длине. Попробуй создать другой вариант.');
            if(jobRef.current!==job||!mounted.current)return;
            setGenerated(text);requestAnimationFrame(()=>aiBody.current?.scrollTo({top:aiBody.current.scrollHeight,behavior:'smooth'}));
        }catch(e){if(jobRef.current===job&&mounted.current)setAiError(e.name==='AbortError'?'ИИ не ответил за 45 секунд. Повтори запрос.':e instanceof TypeError?'Не удалось связаться с ИИ. Проверь подключение.':e.message);}
        finally{clearTimeout(job.timer);if(jobRef.current===job){jobRef.current=null;if(mounted.current)setGenerating(false);}}
    }
    async function useGenerated(){if(!generated)return;await action(async()=>{if(mode==='online'){if(!room||room.hostId!==uid)throw new Error('Текст выбирает создатель заезда.');await serviceRef.current.publish(generated,settings,room.version);}else{commit(tdInitial(generated));setSaved(false);}closeAI();focus();});}
    function accept(value){
        if(typingBlocked||aiOpen||showResult)return;
        let next={...runRef.current};const now=mode==='online'?serverNow():Date.now();
        for(const c of [...value.normalize('NFC')]){
            if(next.index>=next.text.length)break;
            if(c!==next.text[next.index]){next.wrong=true;if(next.status!=='ready'){next.errors++;next.streak=0;}break;}
            if(next.status==='idle'){next.status='running';next.start=now;}
            next.index++;next.wrong=false;next.streak++;next.lastInput=performance.now();
            if(next.index===next.text.length){
                if(next.status==='ready'){
                    commit(next);action(async()=>{try{await serviceRef.current.ready(next.version);}catch(e){commit({...runRef.current,index:0,wrong:false});throw e;}});return;
                }
                next.elapsed=Math.max(1000,now-next.start);next.status='finished';setShowResult(true);break;
            }
        }
        commit(next);
        if(mode==='online'&&['running','finished'].includes(next.status))serviceRef.current?.progress({index:next.index,errors:next.errors,elapsedMs:next.status==='finished'?next.elapsed:Math.max(0,now-next.start),done:next.status==='finished'});
    }
    const resultMs=mode==='online'&&me?.finishedAt?Math.max(1000,tdMillis(me.finishedAt)-(tdMillis(room.startAt)+TD.countdown)):Math.max(1000,run.elapsed);
    const winner=mode==='online'&&me?.finishedAt&&other?.finishedAt?(tdMillis(me.finishedAt)===tdMillis(other.finishedAt)?'Ничья':tdMillis(me.finishedAt)<tdMillis(other.finishedAt)?'Ты победил!':'Второе место'):mode==='online'?'Ты на финише!':place===1?'Первое место!':`Финиш · ${place} место`;
    const instruction=run.wrong?'Нужен '+tdEscapeLabel(run.text[run.index]):run.status==='ready'?(myReady?'Ты готов. Ждём соперника':'Общий текст готов. Напечатай «старт»'):run.status==='preparing'?(room?.hostId===uid?'Создай общий текст для заезда':'Соперник готовит общий текст'):run.status==='invited'?'Ожидаем принятия приглашения':run.status==='lobby'?'Выбери соперника или включи подбор':run.status==='countdown'?'Все готовы. Приготовься печатать':run.status==='finished'?'Заезд завершён':run.status==='running'?'Печатай точно и держи свой ритм':'Первая правильная буква запускает заезд';
    return <div className="td-root"><div className="app">
      <div className="heading"><div className="head-copy"><div className="eyebrow">TYPEDRIVE / ГОНКА НА КЛАВИАТУРЕ</div><h1>Один текст. Разные скорости.</h1><p>Выбирай транспорт, находи свой ритм и выходи вперёд.</p></div><div className="td-top-actions"><button className="icon" aria-label={sound?'Выключить звук':'Включить звук'} aria-pressed={sound} onClick={toggleSound}><Icon name="bolt"/></button><div className="tabs"><button className={mode==='solo'?'active':''} aria-pressed={mode==='solo'} onClick={()=>changeMode('solo')}>Тренировка</button><button className={mode==='online'?'active':''} aria-pressed={mode==='online'} onClick={()=>changeMode('online')}>С учениками</button></div></div></div>
      {(error||notice)&&<div className={'td-notice '+(error?'error':'')} role={error?'alert':'status'}><Icon name="info"/><span>{error||notice}</span><button className="icon" aria-label="Закрыть уведомление" onClick={()=>{setError('');setNotice('');}}><Icon name="close"/></button></div>}
      {mode==='online'&&!net.online&&<div className="td-notice error" role="alert">Связь прервана. Ввод остановлен до подключения; общий таймер продолжает идти.</div>}
      <div className="layout"><section className="main"><div className="bar"><b><span className="dot"/>Coastal circuit · {mode==='solo'?'тренировочный заезд':'онлайн-заезд'}</b><span className="pill">{mode==='solo'?'С БОТАМИ':net.connected?'ОНЛАЙН':'ПОДКЛЮЧЕНИЕ'}</span></div>
      <div className="metrics">{[[speed,'знаков / мин'],[accuracy+'%','точность'],[['running','finished'].includes(run.status)?place:'—','место'],[formatTime(elapsed),'время']].map(([value,label])=><div className="metric" key={label}><strong>{value}</strong><small>{label}</small></div>)}</div>
      <div className="scene" ref={sceneRef}><canvas ref={canvasRef} aria-label="Гоночная трасса TypeDrive"/><div className="scene-title">COASTAL CIRCUIT / 01</div><div className={'scene-note '+(run.streak>=20?'boost':'')}>{run.streak>=20?'ТУРБО · серия '+run.streak:mode==='online'?(other?.name||'Пригласи соперника'):'Начни печатать'}</div>{run.status==='countdown'&&<div className="overlay"><div className="count" key={Math.ceil((run.start-tick-net.offset)/1000)}>{Math.max(1,Math.ceil((run.start-tick-net.offset)/1000))}</div></div>}</div>
      <div className="typing"><div className="type-top"><b role="status">{instruction}</b><span className="type-right"><span>{run.index} / {run.text.length}</span>{mode==='solo'&&<button className="mini" onClick={resetSolo}><Icon name="refresh" size={13}/>Заново</button>}</span></div>
      <div className={'ribbon '+(run.wrong?'error':'')} ref={ribbonRef}><div className="text" ref={lineRef} aria-hidden="true">{run.text.split('').map((c,i)=><span key={i} className={i<run.index?'done':i===run.index?run.wrong?'wrong':'current':''}>{c}</span>)}</div><input ref={inputRef} className="capture" aria-label="Печатай показанный текст" aria-description={run.text} readOnly={typingBlocked} autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} onPaste={e=>e.preventDefault()} onDrop={e=>e.preventDefault()} onKeyDown={e=>{if(e.repeat)e.preventDefault();if(e.key==='Escape')e.currentTarget.blur();}} onBeforeInput={e=>{if(/Paste|Drop|Replacement/.test(e.nativeEvent?.inputType||''))e.preventDefault();}} onChange={e=>{if(e.nativeEvent?.isComposing)return;const v=e.currentTarget.value;e.currentTarget.value='';if(!/Paste|Drop|Replacement/.test(e.nativeEvent?.inputType||''))accept(v);}} onCompositionEnd={e=>{const v=e.currentTarget.value;e.currentTarget.value='';accept(v);}}/></div>
      <div className="progress" role="progressbar" aria-label="Прогресс заезда" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress*100)}><div style={{width:progress*100+'%'}}/></div><div className="help"><span>Ошибка останавливает набор. Нажми правильную букву и продолжай.</span><span>Серия: {run.streak}</span></div>
      {room?.text&&['ready','racing'].includes(room.status)&&<details className="td-shared-text"><summary>Общий текст · {room.language==='ru'?'русский':'English'} · {room.text.length} знаков</summary><p>{room.text}</p></details>}
      {opponentStale&&<p className="td-wait-note">Соперник давно не отправлял прогресс. Возможно, он отошёл или потерял связь. Можно продолжить или покинуть заезд.</p>}
      {run.status==='finished'&&<button className="secondary td-result-link" onClick={()=>setShowResult(true)}>Показать результат</button>}
      </div></section>
      <aside className="side"><div><h2>Твой транспорт</h2><p>Разный характер. Равные возможности.</p><div className="vehicles">{Object.entries(TD_VEHICLES).map(([key,[name,,path]])=><button key={key} className={'vehicle '+(transport===key?'active':'')} aria-pressed={transport===key} disabled={mode==='online'&&!!room||run.status==='running'} onClick={()=>setTransport(key)}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3"><path d={path}/></svg>{name}</button>)}</div><div className="callout">{TD_VEHICLES[transport][1]}</div></div>
      <div><div className="divider"/>{mode==='solo'?<><h2>Просто начни печатать</h2><p>Нажми на строку текста. Таймер включится с первой правильной буквы.</p><div className="room"><h3>В этом заезде</h3>{['Вектор · купе','Комета · мотоцикл','Импульс · вертолёт'].map(name=><div className="room-row" key={name}><span>{name}</span><span>Бот</span></div>)}</div><button className="secondary td-ai-button" onClick={openAI} disabled={run.status==='running'}><Icon name="spark"/>Создать текст с ИИ</button><button className="secondary td-other" onClick={resetSolo}>Другой текст</button></>:<>
      <h2>Гонка с учениками</h2><p>{net.connected?'Пригласи ученика, который открыл TypeDrive.':'Подключаем твой аккаунт LMS…'}</p>
      {!room&&<><button className="primary td-ai-button" disabled={!net.connected||busy||!net.online} onClick={()=>action(()=>serviceRef.current.setLooking(!net.searching))}>{net.searching?<><i className="spinner"/>Отменить поиск</>:'Найти соперника'}</button>{net.searching&&<p className="td-wait-note">Ожидаем другого ученика, который тоже включил подбор.</p>}
      <div className="people">{net.people.map(p=><div className="person" key={p.uid}><span className="avatar">{p.name.slice(0,1)}</span><div className="info"><b>{p.name}</b><small>{TD_VEHICLES[p.vehicle]?.[0]||'Купе'} · в TypeDrive</small></div><button className="invite" disabled={busy||!net.connected||!net.online} onClick={()=>action(()=>serviceRef.current.invite(p.uid))}>Пригласить</button></div>)}{net.connected&&!net.people.length&&<p className="td-empty">Пока здесь только ты.<br/>Попроси друга открыть TypeDrive → «С учениками».</p>}</div>
      {net.incoming.map(r=><div className="room" key={r.id}><h3>Приглашение</h3><p><strong>{r.host.name}</strong> зовёт тебя в заезд.</p><div className="td-invite-actions"><button className="primary" disabled={busy} onClick={()=>action(()=>serviceRef.current.accept(r.id))}>Принять</button><button className="secondary" disabled={busy} onClick={()=>action(()=>serviceRef.current.decline(r.id))}>Отклонить</button></div></div>)}</>}
      {room&&<div className="room"><h3>{room.status==='invited'?'Приглашение отправлено':'Общий текст · 2 участника'}</h3>{[['Ты',me],[other?.name||'Соперник',other]].map(([name,p],i)=><div className="room-row" key={i}><span>{name}</span><span className={p?.readyVersion===room.version&&room.version>0?'ready':''}>{p?.finishedAt?'Финиш':p?.readyVersion===room.version&&room.version>0?'Готов':room.status==='preparing'?'Ждёт текст':'Ожидание'}</span></div>)}
      {room.hostId===uid&&['preparing','ready'].includes(room.status)&&<button className="primary td-ai-button" disabled={busy||room.pending||room.cached} onClick={openAI}><Icon name="spark"/>{room.text?'Изменить текст':'Подготовить текст с ИИ'}</button>}
      {room.hostId===uid&&['preparing','ready'].includes(room.status)&&<button className="secondary td-other" disabled={busy||room.pending||room.cached} onClick={()=>action(()=>serviceRef.current.publish(localText(settings.language,room.text),{language:settings.language,topic:'Готовый текст',length:'medium',level:'medium'},room.version))}>Использовать готовый текст</button>}
      {room.hostId!==uid&&room.status==='preparing'&&<p className="td-wait-note">Создатель заезда выбирает тему и готовит текст для вас обоих.</p>}
      <button className="secondary td-other" disabled={busy} onClick={()=>{if(room.status==='racing'&&!window.confirm('Покинуть онлайн-заезд?'))return;action(()=>serviceRef.current.leave());}}>Покинуть заезд</button></div>}
      </>}</div><div className="callout">{mode==='online'?'Общий старт после готовности обоих. Прогресс обновляется каждые 1,5 секунды.':'Скорость зависит от печати. Транспорт и турбо не дают преимущества.'}</div></aside></div>
      <div className="footer"><div className="legend"><span><i style={{background:'#b499ff'}}/>Ты</span><span><i style={{background:'#70ddc8'}}/>{mode==='online'?other?.name||'Соперник':'Боты-тренеры'}</span></div><span>TypeDrive · находи свой ритм</span></div>
      <dialog id="aiDialog" ref={dialogRef} aria-labelledby="td-ai-title" onCancel={closeAI}><div className="ai-header"><div className="ai-kicker"><Icon name="spark"/>ТЕКСТ ОТ ИИ</div><button className="close-dialog" aria-label="Закрыть настройки текста" onClick={closeAI}><Icon name="close"/></button><h2 id="td-ai-title">О чём будем печатать?</h2><p>{mode==='online'?'Один общий текст для тебя и друга. Заезд начнётся, когда оба будут готовы.':'Выбери тему и настрой текст под свой темп.'}</p><div className="ai-steps"><span className="active"><b>1</b>Текст</span><i/><span><b>2</b>Готовность</span><i/><span><b>3</b>Заезд</span></div></div>
      <form id="aiForm" onSubmit={generate} aria-busy={generating}><div className="ai-body" ref={aiBody}><div className="field-top"><label htmlFor="aiTopic">Тема и пожелания</label><small>{settings.topic.length} / 500</small></div><textarea id="aiTopic" required maxLength={500} value={settings.topic} onChange={e=>editSettings({topic:e.target.value})}/><div className="suggestions">{[['Путешествия','Путешествия и интересные открытия'],['Космос','Интересные факты о космосе'],['Технологии','Современные технологии и изобретения'],['Природа','Природа и удивительный мир животных']].map(([label,topic])=><button className="topic-chip" type="button" key={label} aria-pressed={settings.topic===topic} onClick={()=>editSettings({topic})}>{label}</button>)}</div>
      <div className="ai-grid"><TDChoices label="Язык" value={settings.language} name="td-language" onChange={language=>editSettings({language})} options={[["ru","Русский"],["en","English"]]}/><div><TDChoices label="Длина текста" name="td-length" value={settings.length} onChange={length=>editSettings({length})} options={[["short","Короткий"],["medium","Средний"],["long","Длинный"]]}/><div className="setting-hint">{{short:'150–300',medium:'300–550',long:'550–900'}[settings.length]} знаков</div></div></div>
      <TDChoices label="Сложность" name="td-level" value={settings.level} onChange={level=>editSettings({level})} detailed options={[["easy","Лёгкая","Простые слова"],["medium","Средняя","С пунктуацией"],["hard","Сложная","Числа и термины"]]}/>
      {generating&&<div className="ai-loading" role="status"><p>ИИ готовит текст…</p><div className="skeleton"/><div className="skeleton"/><div className="skeleton"/></div>}{aiError&&<div id="aiError" role="alert">{aiError}</div>}{generated&&<section className="preview-card"><div className="preview-title"><span><Icon name="check" size={15}/>Твой текст готов</span><span>{generated.length} знаков</span></div><div className="ai-preview">{generated}</div></section>}</div>
      <div className="ai-footer"><div className={'ai-actions '+(generated?'has-preview':'')}>{!generated&&<button className="secondary" type="button" onClick={closeAI}>Отмена</button>}<button className="primary" id="generate" type="submit" disabled={generating||!settings.topic.trim()||busy}>{generating?<i className="spinner"/>:<Icon name={generated?'refresh':'spark'} size={17}/>}<span className="button-label">{generating?'Создаём текст…':generated?'Другой вариант':'Создать текст'}</span></button>{generated&&<button type="button" className="primary" id="useAI" disabled={busy} onClick={useGenerated}>{busy?'Сохраняем…':'Использовать текст'}<Icon name="play" size={15}/></button>}</div><p className="footer-note">{mode==='online'?'После выбора текста оба игрока печатают «старт».':'Проверь текст перед заездом — его можно создать заново.'}</p></div></form></dialog>
      <dialog ref={resultRef} aria-label="Результат заезда" onCancel={()=>setShowResult(false)}><div className="eyebrow">ФИНИШ</div><h2>{winner}</h2><p>{mode==='online'&&!other?.finishedAt?'Ожидаем финиша соперника. Результат обновится автоматически.':'Точность и ровный ритм — ключ к хорошей скорости.'}</p><div className="results"><div><strong>{Math.round(run.index*60000/resultMs)}</strong><small>знаков / мин</small></div><div><strong>{accuracy}%</strong><small>точность</small></div><div><strong>{formatTime(resultMs)}</strong><small>время</small></div></div>{mode==='online'&&<p className="td-save">{saved||me?.finishedAt?'Результат сохранён.':'Подтверждаем результат…'}{!saved&&!me?.finishedAt&&<button className="mini" onClick={()=>{serviceRef.current.progressBlocked=false;serviceRef.current.flushProgress();}}>Повторить</button>}</p>}<div className="dlg-actions"><button className="primary" onClick={()=>{setShowResult(false);if(mode==='solo'){resetSolo();focus();}else action(()=>serviceRef.current.leave());}}>{mode==='solo'?'Ещё один заезд':'Вернуться в лобби'}</button><button className="secondary" onClick={()=>setShowResult(false)}>Закрыть</button></div></dialog>
    </div></div>;
}
function TDChoices({label,name,value,onChange,options,detailed=false}){return <fieldset className="choice-group"><legend>{label}</legend><div className={detailed?'level-options':'segmented'}>{options.map(([key,title,description])=><label className="choice" key={key}><input type="radio" name={name} checked={value===key} value={key} onChange={()=>onChange(key)}/><span>{detailed?<><div className="level-bars" aria-hidden="true"><i/><i/><i/></div><strong>{title}</strong><small>{description}</small></>:title}</span></label>)}</div></fieldset>;}
function TypingTest({onBack}){
    const [section,setSection]=useState('classic'),[driveBusy,setDriveBusy]=useState(false);
    const choose=value=>{if(value===section)return;if(section==='drive'&&driveBusy&&!window.confirm('Покинуть TypeDrive и вернуться к классическому режиму?'))return;setSection(value);};
    return <div className="pt-root td-hub"><div className="td-hub-bar"><div className="td-hub-tabs" aria-label="Раздел тренажёра"><button aria-pressed={section==='classic'} className={section==='classic'?'selected':''} onClick={()=>choose('classic')}><Icon name="keyboard"/>Классический</button><button aria-pressed={section==='drive'} className={section==='drive'?'selected':''} onClick={()=>choose('drive')}><Icon name="bolt"/>TypeDrive<span>ГОНКА</span></button></div>{onBack&&<button className="pt-icon-btn" aria-label="Назад" title="Назад" onClick={()=>{if(section==='drive'&&driveBusy&&!window.confirm('Покинуть текущий заезд?'))return;onBack();}}><Icon name="back"/></button>}</div><div hidden={section!=='classic'}><ClassicTypingTest active={section==='classic'}/></div>{section==='drive'&&<TypeDrive onBusy={setDriveBusy}/>}</div>;
}

Object.assign(window, { TypingTest });
})();
