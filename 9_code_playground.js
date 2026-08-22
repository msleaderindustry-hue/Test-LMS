const { useState, useEffect, useRef } = React;
const { motion, AnimatePresence } = window.Motion;
const { Button } = window;

/* =====================================================================
   ПОДСВЕТКА СИНТАКСИСА
   ===================================================================== */

function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const HIGHLIGHT_RULES = {
    html: [
        ['comment', /^<!--[\s\S]*?-->/],
        ['tag', /^<\/?[a-zA-Z][a-zA-Z0-9-]*/],
        ['entity', /^&[a-zA-Z#0-9]+;/],
        ['string', /^"[^"]*"|^'[^']*'/],
        ['attr', /^[a-zA-Z-]+(?=\s*=)/],
        ['punct', /^[<>\/=]/]
    ],
    css: [
        ['comment', /^\/\*[\s\S]*?\*\//],
        ['string', /^"[^"]*"|^'[^']*'/],
        ['number', /^-?\d+\.?\d*(px|em|rem|%|vh|vw|s|ms|deg)?/],
        ['property', /^[a-zA-Z-]+(?=\s*:)/],
        ['selector', /^[.#]?[a-zA-Z][a-zA-Z0-9_-]*/],
        ['punct', /^[{}:;,()]/]
    ],
    js: [
        ['comment', /^\/\/.*|^\/\*[\s\S]*?\*\//],
        ['string', /^`[^`]*`|^"[^"]*"|^'[^']*'/],
        ['keyword', /^(function|const|let|var|if|else|for|while|return|new|this|true|false|null|undefined|typeof|class|extends|import|export|from|of|in|try|catch|finally|throw|async|await|break|continue|switch|case|default)\b/],
        ['number', /^-?\d+\.?\d*/],
        ['func', /^[a-zA-Z_$][a-zA-Z0-9_$]*(?=\s*\()/],
        ['punct', /^[{}()\[\];,.]/],
        ['operator', /^[=+\-*/%<>!&|?:]+/],
        ['identifier', /^[a-zA-Z_$][a-zA-Z0-9_$]*/]
    ]
};

function tokenizeCode(code, lang) {
    const rules = HIGHLIGHT_RULES[lang] || [];
    let i = 0, out = '';
    while (i < code.length) {
        let matched = false;
        for (const [type, re] of rules) {
            const m = re.exec(code.slice(i));
            if (m && m.index === 0 && m[0].length > 0) {
                out += `<span class="vsc-tok-${type}">${escapeHtml(m[0])}</span>`;
                i += m[0].length;
                matched = true;
                break;
            }
        }
        if (!matched) {
            out += escapeHtml(code[i]);
            i++;
        }
    }
    return out;
}

/* =====================================================================
   СТАРТОВЫЙ КОД / КОНСТАНТЫ
   ===================================================================== */

const DEFAULT_CODE = {
    html: '<h1>Привет, я юный программист! 🚀</h1>\n<p>Это мой первый настоящий сайт.</p>\n<button onclick="sayHello()">Нажми меня!</button>',
    css: 'body {\n  font-family: Arial, sans-serif;\n  background: #f0fdf4;\n  text-align: center;\n  padding: 20px;\n}\n\nh1 {\n  color: #0ea5e9;\n}\n\nbutton {\n  background: #10b981;\n  color: white;\n  border: none;\n  padding: 12px 24px;\n  font-size: 18px;\n  border-radius: 12px;\n  cursor: pointer;\n  transition: 0.3s;\n  box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);\n}\n\nbutton:hover {\n  background: #059669;\n  transform: scale(1.05);\n}',
    js: 'function sayHello() {\n  alert("Ура! Ты написал свой первый скрипт! 🎉");\n}'
};

const LANGS = ['html', 'css', 'js'];
const LANG_META = {
    html: { file: 'index.html', accent: '#e44d26', icon: '</>', label: 'HTML' },
    css: { file: 'style.css', accent: '#42a5f5', icon: '#', label: 'CSS' },
    js: { file: 'script.js', accent: '#f0db4f', icon: 'JS', label: 'JavaScript' }
};

const PAIR_MAP = { '(': ')', '{': '}', '[': ']', '"': '"', "'": "'" };
const CLOSERS = [')', '}', ']', '"', "'"];

/* Единая палитра нового дизайна — "мастерская юного программиста" в
   тёмных космических тонах. Задана как CSS-переменные на корне
   компонента, чтобы всё оформление ниже было согласовано. */
const TOKENS = {
    '--vs-nebula': '#7c5cff',
    '--vs-nebula-soft': '#a78bfa',
    '--vs-comet': '#ff7a45',
    '--vs-signal': '#22c58b',
    '--vs-sky': '#3aa9f0',
    '--vs-star': '#ffc93c',
    '--vs-bg-deep': '#14111f',
    '--vs-bg-mid': '#1b1830',
    '--vs-bg-soft': '#221d3d',
    '--vs-border': '#332c56',
    '--vs-text-dim': '#9791bd',
    '--vs-text-dim2': '#6f6a95'
};

/* =====================================================================
   ПАНЕЛЬ ОДНОГО ФАЙЛА (гаттер + подсветка + textarea + мини-карта)
   ===================================================================== */

const EditorPane = ({ lang, value, isActive, onChange, onKeyDown, onScroll, onCursor, taRef, preRef, gutterRef, minimapRef }) => {
    const lineCount = value.split('\n').length;
    const highlighted = tokenizeCode(value, lang) + '\n';

    return (
        <div style={{ position: 'absolute', inset: 0, display: isActive ? 'flex' : 'none' }}>
            <div
                ref={gutterRef}
                style={{
                    width: '50px', flexShrink: 0, background: 'var(--vs-bg-deep)', color: 'var(--vs-text-dim2)',
                    fontFamily: "'Cascadia Code', Consolas, 'Courier New', monospace",
                    fontSize: '13px', lineHeight: '1.6', padding: '10px 12px 10px 0',
                    textAlign: 'right', overflow: 'hidden', userSelect: 'none'
                }}
            >
                {Array.from({ length: lineCount }, (_, i) => <div key={i}>{i + 1}</div>)}
            </div>

            <div style={{ position: 'relative', flex: 1, overflow: 'hidden', borderLeft: '1px solid var(--vs-border)' }}>
                <pre
                    ref={preRef}
                    style={{
                        position: 'absolute', inset: 0, margin: 0, padding: '10px 16px',
                        fontFamily: "'Cascadia Code', Consolas, 'Courier New', monospace",
                        fontSize: '13px', lineHeight: '1.6', whiteSpace: 'pre',
                        overflow: 'auto', color: '#d4d4d4', pointerEvents: 'none', background: 'transparent'
                    }}
                    dangerouslySetInnerHTML={{ __html: highlighted }}
                />
                <textarea
                    ref={taRef}
                    className="vsc-code-textarea"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={onKeyDown}
                    onKeyUp={(e) => onCursor(e.target)}
                    onClick={(e) => onCursor(e.target)}
                    onScroll={onScroll}
                    spellCheck="false"
                    wrap="off"
                    autoCapitalize="off"
                    autoComplete="off"
                    style={{
                        position: 'absolute', inset: 0, margin: 0, padding: '10px 16px',
                        fontFamily: "'Cascadia Code', Consolas, 'Courier New', monospace",
                        fontSize: '13px', lineHeight: '1.6', whiteSpace: 'pre',
                        border: 'none', resize: 'none', outline: 'none', overflow: 'auto',
                        background: 'transparent', color: 'transparent', caretColor: '#aeafad'
                    }}
                />
            </div>

            {/* Мини-карта */}
            <div className="vsc-minimap" style={{ width: '64px', flexShrink: 0, background: 'var(--vs-bg-deep)', borderLeft: '1px solid var(--vs-border)', position: 'relative', overflow: 'hidden' }}>
                <div
                    style={{ transform: 'scale(0.2)', transformOrigin: 'top left', width: '500%', padding: '10px 16px' }}
                    dangerouslySetInnerHTML={{ __html: highlighted }}
                />
                <div
                    ref={minimapRef}
                    style={{ position: 'absolute', left: 0, right: 0, top: 0, height: '30%', background: 'rgba(124,92,255,0.14)', border: '1px solid rgba(124,92,255,0.3)', pointerEvents: 'none' }}
                />
            </div>
        </div>
    );
};

/* =====================================================================
   ОСНОВНОЙ КОМПОНЕНТ
   ===================================================================== */

const CodePlayground = ({ onBack }) => {
    const [activeTab, setActiveTab] = useState('html');
    const [code, setCode] = useState({ ...DEFAULT_CODE });
    const [srcDoc, setSrcDoc] = useState('');
    const [cursor, setCursor] = useState({ line: 1, col: 1 });

    const [isAsking, setIsAsking] = useState(false);
    const [aiResponse, setAiResponse] = useState(null);

    const taRefs = useRef({});
    const preRefs = useRef({});
    const gutterRefs = useRef({});
    const minimapRefs = useRef({});

    const buildDoc = (c) => `
        <!DOCTYPE html>
        <html>
            <head>
                <style>${c.css}</style>
            </head>
            <body>
                ${c.html}
                <script>${c.js}<\/script>
            </body>
        </html>
    `;

    useEffect(() => {
        const timeout = setTimeout(() => setSrcDoc(buildDoc(code)), 350);
        return () => clearTimeout(timeout);
    }, [code]);

    useEffect(() => {
        const ta = taRefs.current[activeTab];
        if (ta) {
            syncMinimap(activeTab, ta);
            updateCursor(ta);
        }
    }, [activeTab]);

    const runNow = () => setSrcDoc(buildDoc(code));

    const updateCode = (lang, value) => {
        setCode((prev) => ({ ...prev, [lang]: value }));
    };

    const resetCurrent = () => {
        const label = LANG_META[activeTab].file;
        if (!window.confirm(`Вернуть файл «${label}» к исходному коду? Твои изменения в этом файле пропадут.`)) return;
        updateCode(activeTab, DEFAULT_CODE[activeTab]);
    };

    const downloadSite = () => {
        const doc = `<!DOCTYPE html>\n<html lang="ru">\n<head>\n<meta charset="UTF-8">\n<title>Мой первый сайт</title>\n<style>\n${code.css}\n</style>\n</head>\n<body>\n${code.html}\n<script>\n${code.js}\n<\/script>\n</body>\n</html>\n`;
        const blob = new Blob([doc], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'moy-sayt.html';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    };

    const syncMinimap = (lang, ta) => {
        const minimap = minimapRefs.current[lang];
        if (!minimap || !ta.scrollHeight) return;
        const topPct = (ta.scrollTop / ta.scrollHeight) * 100;
        const heightPct = Math.max(6, (ta.clientHeight / ta.scrollHeight) * 100);
        minimap.style.top = topPct + '%';
        minimap.style.height = heightPct + '%';
    };

    const handleScrollSync = (lang) => {
        const ta = taRefs.current[lang];
        const pre = preRefs.current[lang];
        const gutter = gutterRefs.current[lang];
        if (!ta) return;
        if (pre) { pre.scrollTop = ta.scrollTop; pre.scrollLeft = ta.scrollLeft; }
        if (gutter) gutter.scrollTop = ta.scrollTop;
        syncMinimap(lang, ta);
    };

    const updateCursor = (ta) => {
        const pos = ta.selectionStart;
        const before = ta.value.slice(0, pos);
        const lines = before.split('\n');
        setCursor({ line: lines.length, col: lines[lines.length - 1].length + 1 });
    };

    const handleKeyDown = (e, lang) => {
        const ta = e.target;
        const val = ta.value;
        const start = ta.selectionStart;
        const end = ta.selectionEnd;

        if (e.key === 'Tab') {
            e.preventDefault();
            if (e.shiftKey) {
                const lineStart = val.lastIndexOf('\n', start - 1) + 1;
                if (val.slice(lineStart, lineStart + 2) === '  ') {
                    updateCode(lang, val.slice(0, lineStart) + val.slice(lineStart + 2));
                    const newPos = Math.max(lineStart, start - 2);
                    requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = newPos; updateCursor(ta); });
                }
            } else {
                updateCode(lang, val.slice(0, start) + '  ' + val.slice(end));
                requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = start + 2; updateCursor(ta); });
            }
            return;
        }

        if (e.key === 'Enter') {
            e.preventDefault();
            const lineStart = val.lastIndexOf('\n', start - 1) + 1;
            const currentLine = val.slice(lineStart, start);
            const indentMatch = currentLine.match(/^\s*/);
            let indent = indentMatch ? indentMatch[0] : '';
            if (currentLine.trim().endsWith('{')) indent += '  ';
            const insertion = '\n' + indent;
            updateCode(lang, val.slice(0, start) + insertion + val.slice(end));
            const newPos = start + insertion.length;
            requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = newPos; updateCursor(ta); });
            return;
        }

        if (CLOSERS.includes(e.key) && start === end && val[start] === e.key) {
            e.preventDefault();
            requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = start + 1; updateCursor(ta); });
            return;
        }

        if (PAIR_MAP[e.key] && start === end) {
            e.preventDefault();
            const open = e.key, close = PAIR_MAP[e.key];
            updateCode(lang, val.slice(0, start) + open + close + val.slice(end));
            requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = start + 1; updateCursor(ta); });
            return;
        }
    };

    const askAI = async () => {
        setIsAsking(true);
        setAiResponse(null);

        const prompt = `Ты — добрый и веселый учитель программирования для детей. 
        Ученик написал вот такой код:
        
        --- HTML ---
        ${code.html}
        
        --- CSS ---
        ${code.css}
        
        --- JavaScript ---
        ${code.js}
        
        Твоя задача: Найди ошибки в коде или предложи, как его можно улучшить или сделать интереснее. 
        НЕ ДАВАЙ готовый код сразу! Дай подсказку, чтобы ребенок сам догадался. Хвали за старания! 
        Ответь коротко, абзацем на 3-4 предложения. Пиши простым языком, используй эмодзи.`;

        try {
            const response = await fetch("https://gemini-proxy-lms.msleaderindustry.workers.dev", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });

            const data = await response.json();

            if (data.error) throw new Error(data.error.message);
            if (!data.candidates || data.candidates.length === 0) throw new Error("Нет ответа от ИИ");

            const answer = data.candidates[0].content.parts[0].text;
            setAiResponse(answer);

        } catch (error) {
            console.error("Ошибка ИИ:", error);
            setAiResponse("Ой! Кажется, мой интернет-провод перегрыз кот 🐈. Попробуй спросить чуть позже!");
        } finally {
            setIsAsking(false);
        }
    };

    const getFileIcon = (type, size) => (
        <span style={{ color: LANG_META[type].accent, fontSize: size || '14px', fontWeight: 700, fontFamily: "'Cascadia Code', Consolas, monospace" }}>{LANG_META[type].icon}</span>
    );

    const iconBtnStyle = (color) => ({
        display: 'flex', alignItems: 'center', gap: '5px',
        padding: '6px 12px', borderRadius: '9px',
        border: `1px solid ${color}55`, background: `${color}1f`,
        color, fontWeight: '700', fontSize: '11.5px', letterSpacing: '0.1px',
        cursor: 'pointer', fontFamily: "'Nunito', 'Segoe UI', sans-serif"
    });

    const activityIconStyle = (active) => ({
        width: '36px', height: '36px', borderRadius: '10px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '16px',
        color: active ? '#ffffff' : 'var(--vs-text-dim)',
        background: active ? 'var(--vs-nebula)' : 'transparent',
        boxShadow: active ? '0 4px 14px rgba(124,92,255,0.45)' : 'none',
        cursor: 'pointer'
    });

    const ThinkingDots = () => (
        <span style={{ display: 'inline-flex', gap: '3px', color: '#ffffff' }}>
            <span className="vsc-dot" /><span className="vsc-dot" /><span className="vsc-dot" />
        </span>
    );

    return (
        <motion.div
            className="glass-panel"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5 }}
            style={{
                ...TOKENS,
                width: '100%', maxWidth: '1440px', display: 'flex', flexDirection: 'column', gap: '16px',
                padding: '20px', margin: '0 auto', fontFamily: "'Nunito', 'Segoe UI', sans-serif"
            }}
        >
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Unbounded:wght@600;700;800&family=Nunito:wght@400;600;700;800&display=swap');

                .vsc-tok-comment{ color:#8a86b0; font-style: italic; }
                .vsc-tok-string{ color:#f0b88f; }
                .vsc-tok-tag{ color:#7ea6f2; }
                .vsc-tok-attr{ color:#9cdcfe; }
                .vsc-tok-punct{ color:#d4d4d4; }
                .vsc-tok-entity{ color:#e0c088; }
                .vsc-tok-property{ color:#9cdcfe; }
                .vsc-tok-selector{ color:#e0c088; }
                .vsc-tok-number{ color:#a3e0b8; }
                .vsc-tok-keyword{ color:#c39cf7; }
                .vsc-tok-func{ color:#f0dca0; }
                .vsc-tok-operator{ color:#d4d4d4; }
                .vsc-tok-identifier{ color:#d4d4d4; }
                .vsc-code-textarea::selection{ background: rgba(124,92,255,0.35); }

                .vsc-menu-item:hover{ background: rgba(124,92,255,0.16) !important; }
                .vsc-activity-icon:hover{ background: rgba(124,92,255,0.16) !important; }
                .vsc-sidebar-item:hover{ background: rgba(124,92,255,0.12) !important; }

                .vsc-back-btn{ transition: all .15s ease; }
                .vsc-back-btn:hover{ background: var(--vs-bg-soft) !important; border-color: var(--vs-nebula) !important; color: #ffffff !important; }

                .vsc-ai-btn{ transition: transform .15s ease, box-shadow .15s ease; }
                .vsc-ai-btn:not(:disabled):hover{ transform: translateY(-2px); box-shadow: 0 14px 26px rgba(124,92,255,0.45) !important; }
                .vsc-ai-btn:not(:disabled):active{ transform: translateY(0); }

                .vsc-tab-action{ transition: filter .15s ease, transform .15s ease; }
                .vsc-tab-action:hover{ filter: brightness(1.2); transform: translateY(-1px); }

                .vsc-tab-btn:hover{ color: #ffffff !important; }

                .vsc-close-btn{ transition: background .15s ease, color .15s ease; border-radius:7px; }
                .vsc-close-btn:hover{ background: rgba(124,92,255,0.18); color: var(--vs-nebula) !important; }

                @keyframes vsc-bounce{ 0%,80%,100%{ transform: translateY(0); opacity:.5; } 40%{ transform: translateY(-4px); opacity:1; } }
                .vsc-dot{ width:6px; height:6px; border-radius:50%; background:currentColor; display:inline-block; animation: vsc-bounce 1s infinite ease-in-out; }
                .vsc-dot:nth-child(2){ animation-delay:.15s; }
                .vsc-dot:nth-child(3){ animation-delay:.3s; }

                @media (max-width: 980px){
                    .vsc-sidebar{ display:none !important; }
                    .vsc-body{ flex-direction: column !important; }
                    .vsc-preview{ height: 260px !important; border-left:none !important; border-top:1px solid var(--vs-border) !important; }
                    .vsc-minimap{ display:none !important; }
                }
            `}</style>

            {/* Шапка хост-приложения */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', background: 'var(--vs-bg-mid)', padding: '14px 22px', borderRadius: '16px', border: '1px solid var(--vs-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                    {onBack && (
                        <button className="vsc-back-btn" onClick={onBack} style={{ background: 'transparent', border: '1px solid var(--vs-border)', borderRadius: '9px', padding: '7px 13px', color: 'var(--vs-text-dim)', cursor: 'pointer', fontSize: '13px', fontWeight: '700', fontFamily: "'Nunito', sans-serif" }}>
                            ← Назад
                        </button>
                    )}

                    <div style={{
                        width: '38px', height: '38px', borderRadius: '11px', flexShrink: 0,
                        background: 'linear-gradient(135deg, var(--vs-nebula), var(--vs-sky))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 6px 16px rgba(124,92,255,0.4)'
                    }}>
                        <span style={{ fontSize: '18px', lineHeight: 1 }}>🚀</span>
                    </div>

                    <h2 style={{ margin: 0, fontSize: '21px', fontWeight: '700', color: '#ffffff', fontFamily: "'Unbounded', 'Nunito', sans-serif", letterSpacing: '-0.01em' }}>
                        VS School
                    </h2>

                    <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        background: 'var(--vs-bg-soft)', color: 'var(--vs-text-dim)', padding: '5px 12px',
                        borderRadius: '999px', fontSize: '12px', fontWeight: '700',
                        border: '1px solid var(--vs-border)', fontFamily: "'Nunito', sans-serif"
                    }}>
                        📁 Мой первый сайт
                    </span>
                </div>

                <button
                    className="vsc-ai-btn"
                    onClick={askAI}
                    disabled={isAsking}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '9px',
                        padding: '10px 19px', borderRadius: '12px',
                        background: isAsking ? 'var(--vs-bg-soft)' : 'linear-gradient(135deg, var(--vs-nebula-soft), var(--vs-nebula))',
                        color: isAsking ? 'var(--vs-text-dim)' : '#fff',
                        border: isAsking ? '1px solid var(--vs-border)' : 'none',
                        fontWeight: '700', fontSize: '14px', cursor: isAsking ? 'not-allowed' : 'pointer',
                        fontFamily: "'Nunito', sans-serif",
                        boxShadow: isAsking ? 'none' : '0 8px 18px rgba(124,92,255,0.4)'
                    }}
                >
                    {isAsking ? (<>Анализирую код <ThinkingDots /></>) : '✨ Спросить ИИ-наставника'}
                </button>
            </div>

            {/* ===================== ОКНО РЕДАКТОРА ===================== */}
            <div style={{ background: 'var(--vs-bg-deep)', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.55), 0 0 0 1px rgba(124,92,255,0.08)', display: 'flex', flexDirection: 'column', height: '74vh', minHeight: '580px', border: '1px solid var(--vs-border)' }}>

                {/* Title bar */}
                <div style={{ height: '36px', background: 'var(--vs-bg-mid)', display: 'flex', alignItems: 'center', padding: '0 12px', flexShrink: 0, borderBottom: '1px solid var(--vs-border)' }}>
                    <div style={{ display: 'flex', gap: '8px', width: '54px' }}>
                        <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ff5f57', display: 'block' }} />
                        <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#febc2e', display: 'block' }} />
                        <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#28c840', display: 'block' }} />
                    </div>
                    <div style={{ flex: 1, textAlign: 'center', fontSize: '12px', color: 'var(--vs-text-dim)', fontFamily: "'Nunito', sans-serif", fontWeight: 600 }}>
                        {LANG_META[activeTab].file} — Мой-первый-сайт — VS School
                    </div>
                    <div style={{ width: '54px' }} />
                </div>

                {/* Menu bar */}
                <div style={{ height: '30px', background: 'var(--vs-bg-soft)', display: 'flex', alignItems: 'center', gap: '4px', padding: '0 10px', fontSize: '12.5px', color: 'var(--vs-text-dim)', flexShrink: 0, fontFamily: "'Nunito', sans-serif", fontWeight: 600 }}>
                    {['Файл', 'Правка', 'Выделение', 'Вид', 'Переход', 'Выполнить', 'Справка'].map((m) => (
                        <span key={m} className="vsc-menu-item" style={{ padding: '4px 9px', borderRadius: '6px', cursor: 'default' }}>{m}</span>
                    ))}
                </div>

                {/* Тело окна */}
                <div className="vsc-body" style={{ flex: 1, display: 'flex', minHeight: 0 }}>

                    {/* Activity bar */}
                    <div style={{ width: '52px', background: 'var(--vs-bg-mid)', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '12px', gap: '8px', flexShrink: 0, borderRight: '1px solid var(--vs-border)' }}>
                        <div className="vsc-activity-icon" style={activityIconStyle(true)}>📄</div>
                        <div className="vsc-activity-icon" style={activityIconStyle(false)}>🔍</div>
                        <div className="vsc-activity-icon" style={activityIconStyle(false)}>⎇</div>
                        <div className="vsc-activity-icon" style={activityIconStyle(false)} onClick={runNow} title="Запустить">▶</div>
                        <div className="vsc-activity-icon" style={activityIconStyle(false)}>🧩</div>
                        <div className="vsc-activity-icon" style={{ ...activityIconStyle(false), marginTop: 'auto', marginBottom: '14px' }}>⚙️</div>
                    </div>

                    {/* Sidebar — Проводник */}
                    <div className="vsc-sidebar" style={{ width: '190px', background: 'var(--vs-bg-mid)', flexShrink: 0, display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--vs-border)' }}>
                        <div style={{ padding: '12px 14px 6px', fontSize: '10.5px', letterSpacing: '0.8px', color: 'var(--vs-text-dim2)', fontWeight: 700, textTransform: 'uppercase', fontFamily: "'Nunito', sans-serif" }}>Проводник</div>
                        <div style={{ padding: '4px 14px', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--vs-text-dim)', fontSize: '12.5px', fontWeight: 700, fontFamily: "'Nunito', sans-serif" }}>
                            <span style={{ fontSize: '9px' }}>▾</span> МОЙ-ПЕРВЫЙ-САЙТ
                        </div>
                        <div style={{ padding: '4px 8px' }}>
                            {LANGS.map((lang) => {
                                const active = activeTab === lang;
                                return (
                                    <div
                                        key={lang}
                                        className="vsc-sidebar-item"
                                        onClick={() => setActiveTab(lang)}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '8px',
                                            padding: '7px 10px 7px 12px', margin: '1px 0',
                                            fontSize: '13px', cursor: 'pointer', borderRadius: '8px',
                                            fontFamily: "'Nunito', sans-serif", fontWeight: active ? 700 : 500,
                                            background: active ? `${LANG_META[lang].accent}22` : 'transparent',
                                            color: active ? '#ffffff' : 'var(--vs-text-dim)',
                                            borderLeft: active ? `3px solid ${LANG_META[lang].accent}` : '3px solid transparent'
                                        }}
                                    >
                                        {getFileIcon(lang)} {LANG_META[lang].file}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Группа редактора */}
                    <div style={{ flex: 1.3, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

                        {/* Tab bar */}
                        <div style={{ display: 'flex', alignItems: 'flex-end', background: 'var(--vs-bg-mid)', borderBottom: '1px solid var(--vs-border)', flexShrink: 0, padding: '6px 6px 0' }}>
                            <div style={{ display: 'flex', flex: 1, overflowX: 'auto', gap: '4px' }}>
                                {LANGS.map((lang) => {
                                    const isActiveTab = activeTab === lang;
                                    return (
                                        <button
                                            key={lang}
                                            className="vsc-tab-btn"
                                            onClick={() => setActiveTab(lang)}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '7px',
                                                padding: '9px 16px', minWidth: '128px',
                                                background: isActiveTab ? 'var(--vs-bg-deep)' : 'transparent',
                                                color: isActiveTab ? '#ffffff' : 'var(--vs-text-dim)',
                                                border: 'none', borderRadius: '10px 10px 0 0',
                                                boxShadow: isActiveTab ? `inset 0 -2px 0 ${LANG_META[lang].accent}` : 'none',
                                                fontSize: '13px', cursor: 'pointer', fontFamily: "'Nunito', sans-serif",
                                                fontWeight: isActiveTab ? 700 : 600
                                            }}
                                        >
                                            {getFileIcon(lang)} {LANG_META[lang].file}
                                        </button>
                                    );
                                })}
                            </div>
                            <div style={{ display: 'flex', gap: '6px', padding: '0 4px 6px' }}>
                                <button className="vsc-tab-action" onClick={runNow} style={iconBtnStyle(TOKENS['--vs-signal'])}>▶ Запуск</button>
                                <button className="vsc-tab-action" onClick={resetCurrent} style={iconBtnStyle(TOKENS['--vs-comet'])}>↺ Сброс</button>
                                <button className="vsc-tab-action" onClick={downloadSite} style={iconBtnStyle(TOKENS['--vs-sky'])}>⬇ Скачать</button>
                            </div>
                        </div>

                        {/* Breadcrumb */}
                        <div style={{ background: 'var(--vs-bg-deep)', padding: '5px 15px', fontSize: '12px', color: 'var(--vs-text-dim2)', borderBottom: '1px solid var(--vs-border)', display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0, fontFamily: "'Nunito', sans-serif" }}>
                            <span>мой-первый-сайт</span> <span>›</span>
                            <span style={{ color: 'var(--vs-text-dim)' }}>{LANG_META[activeTab].file}</span>
                        </div>

                        {/* Editor body */}
                        <div style={{ flex: 1, position: 'relative', background: 'var(--vs-bg-deep)', minHeight: 0 }}>
                            {LANGS.map((lang) => (
                                <EditorPane
                                    key={lang}
                                    lang={lang}
                                    value={code[lang]}
                                    isActive={activeTab === lang}
                                    onChange={(v) => updateCode(lang, v)}
                                    onKeyDown={(e) => handleKeyDown(e, lang)}
                                    onScroll={() => handleScrollSync(lang)}
                                    onCursor={(ta) => updateCursor(ta)}
                                    taRef={(el) => { taRefs.current[lang] = el; }}
                                    preRef={(el) => { preRefs.current[lang] = el; }}
                                    gutterRef={(el) => { gutterRefs.current[lang] = el; }}
                                    minimapRef={(el) => { minimapRefs.current[lang] = el; }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Simple Browser — предпросмотр */}
                    <div className="vsc-preview" style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#ffffff', borderLeft: '1px solid var(--vs-border)', minWidth: 0 }}>
                        <div style={{ background: 'var(--vs-bg-mid)', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--vs-border)', flexShrink: 0 }}>
                            <span style={{ fontSize: '12px' }}>🌐</span>
                            <span style={{ fontSize: '12px', color: 'var(--vs-text-dim)', fontWeight: 700, fontFamily: "'Nunito', sans-serif" }}>Simple Browser</span>
                        </div>
                        <div style={{ background: 'var(--vs-bg-soft)', padding: '7px 12px', borderBottom: '1px solid var(--vs-border)', flexShrink: 0 }}>
                            <div style={{ background: 'var(--vs-bg-deep)', border: '1px solid var(--vs-border)', borderRadius: '14px', padding: '4px 12px', fontSize: '12px', color: 'var(--vs-text-dim)', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontFamily: "'Nunito', sans-serif" }}>
                                <span style={{ fontSize: '10px' }}>🔒</span> localhost:3000/мой-сайт
                            </div>
                        </div>
                        <iframe
                            srcDoc={srcDoc}
                            title="output"
                            sandbox="allow-scripts"
                            style={{ flex: 1, width: '100%', border: 'none', background: '#fff' }}
                        />
                    </div>
                </div>

                {/* Status bar */}
                <div style={{ height: '25px', background: 'linear-gradient(90deg, var(--vs-nebula), var(--vs-sky))', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px', fontSize: '11.5px', color: '#ffffff', flexShrink: 0, fontFamily: "'Nunito', sans-serif", fontWeight: 600 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <span>⎇ main</span>
                        <span>⊗ 0  ⚠ 0</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <span>Ln {cursor.line}, Col {cursor.col}</span>
                        <span>Пробелы: 2</span>
                        <span>UTF-8</span>
                        <span>{LANG_META[activeTab].label}</span>
                        <span>✨ Copilot-стиль</span>
                    </div>
                </div>
            </div>

            {/* Панель ИИ-наставника */}
            <AnimatePresence>
                {aiResponse && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{ background: 'var(--vs-bg-mid)', border: '1px solid rgba(124,92,255,0.35)', borderRadius: '18px', overflow: 'hidden', boxShadow: '0 14px 34px rgba(124,92,255,0.22)' }}
                    >
                        <div style={{ display: 'flex', gap: '13px', alignItems: 'flex-start', padding: '18px 20px' }}>
                            <div style={{
                                width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
                                background: 'linear-gradient(135deg, var(--vs-nebula), var(--vs-comet))',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '19px', boxShadow: '0 0 0 3px rgba(124,92,255,0.2)'
                            }}>
                                🤖
                            </div>

                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '7px' }}>
                                    <span style={{ fontFamily: "'Nunito', sans-serif", fontWeight: '800', fontSize: '14.5px', color: '#ffffff' }}>
                                        Наставник ИИ
                                    </span>
                                    <button className="vsc-close-btn" onClick={() => setAiResponse(null)} style={{ background: 'transparent', border: 'none', color: 'var(--vs-text-dim)', cursor: 'pointer', fontSize: '16px', padding: '5px' }}>✖</button>
                                </div>
                                <div style={{
                                    background: 'var(--vs-bg-deep)', border: '1px solid var(--vs-border)',
                                    borderRadius: '14px', borderTopLeftRadius: '4px',
                                    padding: '14px 16px', lineHeight: '1.65', fontSize: '14.5px',
                                    fontFamily: "'Nunito', sans-serif", whiteSpace: 'pre-wrap', color: '#e9e7f5'
                                }}>
                                    {aiResponse}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div style={{ textAlign: 'center' }}>
                <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    fontFamily: "'Nunito', sans-serif", fontSize: '12.5px', fontWeight: '700',
                    color: 'var(--vs-text-dim)', background: 'var(--vs-bg-mid)', border: '1px solid var(--vs-border)',
                    padding: '6px 16px', borderRadius: '999px'
                }}>
                    💡 Нажимай <b>Tab</b> для отступа — скобки и кавычки закрываются сами, совсем как в настоящей IDE
                </span>
            </div>
        </motion.div>
    );
};

Object.assign(window, { CodePlayground });
