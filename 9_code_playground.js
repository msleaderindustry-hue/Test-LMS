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
                out += `<span class="cq-tok-${type}">${escapeHtml(m[0])}</span>`;
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
    html: { file: 'index.html', short: 'HTML', accent: '#fb923c', icon: '</>' },
    css: { file: 'style.css', short: 'CSS', accent: '#38bdf8', icon: '#' },
    js: { file: 'script.js', short: 'JS', accent: '#fbbf24', icon: 'JS' }
};

const PAIR_MAP = { '(': ')', '{': '}', '[': ']', '"': '"', "'": "'" };
const CLOSERS = [')', '}', ']', '"', "'"];

// ИЗМЕНЕНО: Заменил жесткие HEX-цвета на твои глобальные CSS-переменные
const TOKENS = {
    '--cq-bg-deep': 'var(--bg-body)',
    '--cq-bg-panel': 'var(--bg-panel)',
    '--cq-bg-soft': 'rgba(128,128,128,0.15)',
    '--cq-border': 'var(--glass-border)',
    '--cq-text-hi': 'var(--text-main)',
    '--cq-text-dim': 'var(--text-sec)',
    '--cq-text-dim2': 'var(--text-sec)',
    '--cq-violet': '#8b5cf6',
    '--cq-pink': '#f472b6',
    '--cq-mint': '#34d399',
    '--cq-rose': '#fb7185',
    '--cq-sky': '#38bdf8'
};

/* =====================================================================
   ПАНЕЛЬ ОДНОГО ФАЙЛА
   ===================================================================== */

const EditorPane = ({ lang, value, isActive, onChange, onKeyDown, onScroll, onCursor, taRef, preRef, gutterRef }) => {
    const lineCount = value.split('\n').length;
    const highlighted = tokenizeCode(value, lang) + '\n';

    return (
        <div style={{ position: 'absolute', inset: 0, display: isActive ? 'flex' : 'none' }}>
            <div
                ref={gutterRef}
                style={{
                    width: '44px', flexShrink: 0, background: 'var(--cq-bg-deep)', color: 'var(--cq-text-dim2)',
                    fontFamily: "'Cascadia Code', Consolas, 'Courier New', monospace",
                    fontSize: '13px', lineHeight: '1.65', padding: '16px 10px 16px 0',
                    textAlign: 'right', overflow: 'hidden', userSelect: 'none'
                }}
            >
                {Array.from({ length: lineCount }, (_, i) => <div key={i}>{i + 1}</div>)}
            </div>

            <div style={{ position: 'relative', flex: 1, overflow: 'hidden', minWidth: 0 }}>
                <pre
                    ref={preRef}
                    style={{
                        position: 'absolute', inset: 0, margin: 0, padding: '16px',
                        fontFamily: "'Cascadia Code', Consolas, 'Courier New', monospace",
                        fontSize: '14px', lineHeight: '1.65', whiteSpace: 'pre',
                        overflow: 'auto', color: 'var(--cq-text-hi)', pointerEvents: 'none', background: 'transparent'
                    }}
                    dangerouslySetInnerHTML={{ __html: highlighted }}
                />
                <textarea
                    ref={taRef}
                    className="cq-code-textarea"
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
                        position: 'absolute', inset: 0, margin: 0, padding: '16px',
                        fontFamily: "'Cascadia Code', Consolas, 'Courier New', monospace",
                        fontSize: '14px', lineHeight: '1.65', whiteSpace: 'pre',
                        border: 'none', resize: 'none', outline: 'none', overflow: 'auto',
                        background: 'transparent', color: 'transparent', caretColor: 'var(--cq-text-hi)'
                    }}
                />
            </div>
        </div>
    );
};

/* =====================================================================
   ОСНОВНОЙ КОМПОНЕНТ
   ===================================================================== */

const CodePlayground = ({ onBack }) => {
    const [mode, setMode] = useState('code'); // 'code' | 'preview' — только ОДИН режим виден целиком
    const [activeTab, setActiveTab] = useState('html');
    const [code, setCode] = useState({ ...DEFAULT_CODE });
    const [srcDoc, setSrcDoc] = useState('');
    const [cursor, setCursor] = useState({ line: 1, col: 1 });

    const [isAsking, setIsAsking] = useState(false);
    const [aiResponse, setAiResponse] = useState(null);

    const taRefs = useRef({});
    const preRefs = useRef({});
    const gutterRefs = useRef({});

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
        if (ta) updateCursor(ta);
    }, [activeTab]);

    const runNow = () => setSrcDoc(buildDoc(code));

    const goPreview = () => { runNow(); setMode('preview'); };
    const goCode = () => setMode('code');

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

    const handleScrollSync = (lang) => {
        const ta = taRefs.current[lang];
        const pre = preRefs.current[lang];
        const gutter = gutterRefs.current[lang];
        if (!ta) return;
        if (pre) { pre.scrollTop = ta.scrollTop; pre.scrollLeft = ta.scrollLeft; }
        if (gutter) gutter.scrollTop = ta.scrollTop;
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

    const fabStyle = (color) => ({
        width: '46px', height: '46px', borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: 'none', background: color, color: '#120f22',
        fontSize: '17px', fontWeight: 700, cursor: 'pointer',
        boxShadow: `0 10px 22px ${color}66`
    });

    const ThinkingDots = () => (
        <span style={{ display: 'inline-flex', gap: '3px' }}>
            <span className="cq-dot" /><span className="cq-dot" /><span className="cq-dot" />
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
                width: '100%', maxWidth: '1200px', display: 'flex', flexDirection: 'column', gap: '16px',
                padding: '20px', margin: '0 auto', fontFamily: "'Nunito', 'Segoe UI', sans-serif', position: 'relative'
            }}
        >
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Unbounded:wght@600;700;800&family=Nunito:wght@400;600;700;800&display=swap');

                .cq-tok-comment{ color:#847ea8; font-style: italic; }
                .cq-tok-string{ color:#facc7d; }
                .cq-tok-tag{ color:#7cc4ff; }
                .cq-tok-attr{ color:#a5e6c6; }
                .cq-tok-punct{ color:#cfc9ec; }
                .cq-tok-entity{ color:#facc7d; }
                .cq-tok-property{ color:#a5e6c6; }
                .cq-tok-selector{ color:#f0a8d0; }
                .cq-tok-number{ color:#b9f0c8; }
                .cq-tok-keyword{ color:#c39cf7; font-weight:600; }
                .cq-tok-func{ color:#ffd68a; }
                .cq-tok-operator{ color:#cfc9ec; }
                .cq-tok-identifier{ color:#e7e3f7; }
                .cq-code-textarea::selection{ background: rgba(139,92,246,0.35); }

                /* ИЗМЕНЕНО: Добавлена адаптация синтаксиса под светлую тему */
                body.light .cq-tok-comment{ color:#9ca3af; }
                body.light .cq-tok-string{ color:#d97706; }
                body.light .cq-tok-tag{ color:#2563eb; }
                body.light .cq-tok-attr{ color:#059669; }
                body.light .cq-tok-punct{ color:#64748b; }
                body.light .cq-tok-entity{ color:#d97706; }
                body.light .cq-tok-property{ color:#059669; }
                body.light .cq-tok-selector{ color:#db2777; }
                body.light .cq-tok-number{ color:#059669; }
                body.light .cq-tok-keyword{ color:#9333ea; }
                body.light .cq-tok-func{ color:#ea580c; }
                body.light .cq-tok-operator{ color:#64748b; }
                body.light .cq-tok-identifier{ color:#1e293b; }

                .cq-fab:hover{ filter: brightness(1.15); transform: translateY(-2px) scale(1.04); }
                .cq-fab:active{ transform: translateY(0) scale(0.97); }
                .cq-fab{ transition: transform .15s ease, filter .15s ease; }

                .cq-seg-btn{ transition: background .2s ease, color .2s ease; }
                .cq-ask-btn{ transition: transform .15s ease, box-shadow .15s ease; }
                .cq-ask-btn:not(:disabled):hover{ transform: translateY(-2px); box-shadow: 0 14px 30px rgba(139,92,246,0.5) !important; }
                .cq-back-btn:hover{ background: var(--cq-bg-soft) !important; color: var(--cq-text-hi) !important; }
                .cq-close-btn:hover{ background: rgba(139,92,246,0.2); }
                .cq-mode-switch{ transition: background .25s ease; }

                @keyframes cq-bounce{ 0%,80%,100%{ transform: translateY(0); opacity:.5; } 40%{ transform: translateY(-4px); opacity:1; } }
                .cq-dot{ width:6px; height:6px; border-radius:50%; background:currentColor; display:inline-block; animation: cq-bounce 1s infinite ease-in-out; }
                .cq-dot:nth-child(2){ animation-delay:.15s; }
                .cq-dot:nth-child(3){ animation-delay:.3s; }
            `}</style>

            <div style={{ position: 'absolute', top: '-60px', left: '5%', width: '260px', height: '260px', background: 'var(--cq-violet)', opacity: 0.18, filter: 'blur(80px)', borderRadius: '50%', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: '10%', right: '5%', width: '220px', height: '220px', background: 'var(--cq-sky)', opacity: 0.14, filter: 'blur(80px)', borderRadius: '50%', pointerEvents: 'none' }} />

            {/* ==================== ШАПКА ==================== */}
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', background: 'var(--cq-bg-panel)', padding: '14px 22px', borderRadius: '18px', border: '1px solid var(--cq-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                    {onBack && (
                        <button className="cq-back-btn" onClick={onBack} style={{ background: 'transparent', border: '1px solid var(--cq-border)', borderRadius: '10px', padding: '7px 13px', color: 'var(--cq-text-dim)', cursor: 'pointer', fontSize: '13px', fontWeight: 700 }}>
                            ← Назад
                        </button>
                    )}
                    <div style={{ width: '38px', height: '38px', borderRadius: '12px', flexShrink: 0, background: 'linear-gradient(135deg, var(--cq-violet), var(--cq-sky))', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 16px rgba(139,92,246,0.4)' }}>
                        <span style={{ fontSize: '18px' }}>🚀</span>
                    </div>
                    <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: 'var(--cq-text-hi)', fontFamily: "'Unbounded', sans-serif", letterSpacing: '-0.01em' }}>VS School</h2>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--cq-bg-soft)', color: 'var(--cq-text-dim)', padding: '5px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 700, border: '1px solid var(--cq-border)' }}>
                        📁 Мой первый сайт
                    </span>
                </div>

                <button
                    className="cq-ask-btn"
                    onClick={askAI}
                    disabled={isAsking}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '9px', padding: '10px 19px', borderRadius: '12px',
                        background: isAsking ? 'var(--cq-bg-soft)' : 'linear-gradient(135deg, var(--cq-pink), var(--cq-violet))',
                        color: isAsking ? 'var(--cq-text-dim)' : 'var(--cq-text-hi)',
                        border: isAsking ? '1px solid var(--cq-border)' : 'none',
                        fontWeight: 700, fontSize: '14px', cursor: isAsking ? 'not-allowed' : 'pointer',
                        boxShadow: isAsking ? 'none' : '0 8px 20px rgba(139,92,246,0.4)'
                    }}
                >
                    {isAsking ? (<>Думаю над кодом <ThinkingDots /></>) : '✨ Спросить наставника'}
                </button>
            </div>

            {/* ==================== ПЕРЕКЛЮЧАТЕЛЬ РЕЖИМА ==================== */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div className="cq-mode-switch" style={{ position: 'relative', display: 'flex', background: 'var(--cq-bg-panel)', border: '1px solid var(--cq-border)', borderRadius: '999px', padding: '5px', gap: '4px' }}>
                    <div style={{
                        position: 'absolute', top: '5px', bottom: '5px', width: 'calc(50% - 4px)',
                        left: mode === 'code' ? '5px' : 'calc(50% + 3px)',
                        background: 'linear-gradient(135deg, var(--cq-violet), var(--cq-pink))',
                        borderRadius: '999px', transition: 'left .25s cubic-bezier(.4,0,.2,1)',
                        boxShadow: '0 6px 16px rgba(139,92,246,0.4)'
                    }} />
                    <button onClick={goCode} style={{ position: 'relative', zIndex: 1, border: 'none', background: 'transparent', padding: '10px 26px', borderRadius: '999px', cursor: 'pointer', fontWeight: 800, fontSize: '13.5px', color: mode === 'code' ? 'var(--cq-text-hi)' : 'var(--cq-text-dim)', whiteSpace: 'nowrap' }}>
                        🛠️ Пишу код
                    </button>
                    <button onClick={goPreview} style={{ position: 'relative', zIndex: 1, border: 'none', background: 'transparent', padding: '10px 26px', borderRadius: '999px', cursor: 'pointer', fontWeight: 800, fontSize: '13.5px', color: mode === 'preview' ? 'var(--cq-text-hi)' : 'var(--cq-text-dim)', whiteSpace: 'nowrap' }}>
                        🚀 Смотрю сайт
                    </button>
                </div>
            </div>

            {/* ==================== ГЛАВНАЯ СЦЕНА (один режим на весь экран) ==================== */}
            <div style={{ position: 'relative', height: '64vh', minHeight: '480px' }}>
                <AnimatePresence mode="wait">
                    {mode === 'code' ? (
                        <motion.div
                            key="code"
                            initial={{ opacity: 0, x: -16 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -16 }}
                            transition={{ duration: 0.2 }}
                            style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', background: 'var(--cq-bg-deep)', borderRadius: '22px', overflow: 'hidden', border: '1px solid var(--cq-border)', boxShadow: '0 25px 55px rgba(0,0,0,0.1)' }}
                        >
                            {/* Полноширинный сегмент-переключатель файлов */}
                            <div style={{ display: 'flex', flexShrink: 0, borderBottom: '1px solid var(--cq-border)' }}>
                                {LANGS.map((lang) => {
                                    const active = activeTab === lang;
                                    return (
                                        <button
                                            key={lang}
                                            className="cq-seg-btn"
                                            onClick={() => setActiveTab(lang)}
                                            style={{
                                                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                                padding: '13px 8px', border: 'none', cursor: 'pointer',
                                                background: active ? 'var(--cq-bg-panel)' : 'transparent',
                                                color: active ? 'var(--cq-text-hi)' : 'var(--cq-text-dim)',
                                                borderBottom: active ? `3px solid ${LANG_META[lang].accent}` : '3px solid transparent',
                                                fontWeight: 800, fontSize: '13.5px'
                                            }}
                                        >
                                            <span style={{ fontFamily: "'Cascadia Code', monospace", color: LANG_META[lang].accent }}>{LANG_META[lang].icon}</span>
                                            {LANG_META[lang].short}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Тело редактора */}
                            <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
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
                                    />
                                ))}

                                {/* Плавающая колонка действий — сбоку, а не в шапке */}
                                <div style={{ position: 'absolute', top: '14px', right: '14px', display: 'flex', flexDirection: 'column', gap: '10px', zIndex: 2 }}>
                                    <button className="cq-fab" onClick={runNow} title="Запустить" style={fabStyle(TOKENS['--cq-mint'])}>▶</button>
                                    <button className="cq-fab" onClick={resetCurrent} title="Сбросить файл" style={fabStyle(TOKENS['--cq-rose'])}>↺</button>
                                    <button className="cq-fab" onClick={downloadSite} title="Скачать сайт" style={fabStyle(TOKENS['--cq-sky'])}>⬇</button>
                                </div>

                                {/* Индикатор курсора — тихо, снизу слева */}
                                <div style={{ position: 'absolute', bottom: '10px', left: '58px', fontSize: '11px', color: 'var(--cq-text-dim2)', fontWeight: 700, background: 'var(--cq-bg-soft)', border: '1px solid var(--cq-border)', padding: '3px 9px', borderRadius: '999px' }}>
                                    Стр. {cursor.line}:{cursor.col}
                                </div>

                                {/* Кнопка-мостик к результату */}
                                <button
                                    className="cq-fab"
                                    onClick={goPreview}
                                    title="Посмотреть сайт"
                                    style={{ ...fabStyle('linear-gradient(135deg, #8b5cf6, #f472b6)'), position: 'absolute', bottom: '14px', right: '14px', width: '54px', height: '54px', fontSize: '20px', color: '#fff', background: 'linear-gradient(135deg, #8b5cf6, #f472b6)' }}
                                >
                                    🚀
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="preview"
                            initial={{ opacity: 0, x: 16 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 16 }}
                            transition={{ duration: 0.2 }}
                            style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', background: '#ffffff', borderRadius: '22px', overflow: 'hidden', border: '1px solid var(--cq-border)', boxShadow: '0 25px 55px rgba(0,0,0,0.1)' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', background: 'var(--cq-bg-panel)', flexShrink: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: 'var(--cq-mint)', boxShadow: '0 0 8px var(--cq-mint)' }} />
                                    <span style={{ fontSize: '13px', color: 'var(--cq-text-hi)', fontWeight: 800 }}>Твой сайт готов!</span>
                                </div>
                                <button className="cq-fab" onClick={runNow} title="Обновить" style={{ ...fabStyle(TOKENS['--cq-sky']), width: '32px', height: '32px', fontSize: '13px' }}>⟳</button>
                            </div>
                            <div style={{ padding: '8px 16px', background: 'var(--cq-bg-deep)', borderBottom: '1px solid var(--cq-border)', flexShrink: 0 }}>
                                <div style={{ background: 'var(--cq-bg-panel)', border: '1px solid var(--cq-border)', borderRadius: '999px', padding: '5px 14px', fontSize: '12px', color: 'var(--cq-text-dim)', textAlign: 'center', fontWeight: 700 }}>
                                    🔒 мой-сайт.детский-код
                                </div>
                            </div>
                            <iframe
                                srcDoc={srcDoc}
                                title="output"
                                sandbox="allow-scripts"
                                style={{ flex: 1, width: '100%', border: 'none', background: '#fff' }}
                            />

                            <button
                                className="cq-fab"
                                onClick={goCode}
                                title="Редактировать код"
                                style={{ position: 'absolute', bottom: '18px', right: '18px', width: '54px', height: '54px', fontSize: '19px', color: '#fff', background: 'linear-gradient(135deg, #8b5cf6, #38bdf8)' }}
                            >
                                ✏️
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ==================== ИИ-НАСТАВНИК ==================== */}
            <AnimatePresence>
                {aiResponse && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{ background: 'var(--cq-bg-panel)', border: '1px solid var(--cq-border)', borderRadius: '18px', overflow: 'hidden', boxShadow: '0 14px 34px rgba(0,0,0,0.1)' }}
                    >
                        <div style={{ display: 'flex', gap: '13px', alignItems: 'flex-start', padding: '18px 20px' }}>
                            <div style={{
                                width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
                                background: 'linear-gradient(135deg, var(--cq-violet), var(--cq-pink))',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '19px',
                                boxShadow: '0 0 0 3px rgba(139,92,246,0.2)'
                            }}>🤖</div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '7px' }}>
                                    <span style={{ fontWeight: 800, fontSize: '14.5px', color: 'var(--cq-text-hi)' }}>Наставник ИИ</span>
                                    <button className="cq-close-btn" onClick={() => setAiResponse(null)} style={{ background: 'transparent', border: 'none', color: 'var(--cq-text-dim)', cursor: 'pointer', fontSize: '16px', padding: '5px', borderRadius: '7px' }}>✖</button>
                                </div>
                                <div style={{ background: 'var(--cq-bg-deep)', border: '1px solid var(--cq-border)', borderRadius: '14px', borderTopLeftRadius: '4px', padding: '14px 16px', lineHeight: '1.65', fontSize: '14.5px', whiteSpace: 'pre-wrap', color: 'var(--cq-text-hi)' }}>
                                    {aiResponse}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div style={{ textAlign: 'center' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', fontWeight: 700, color: 'var(--cq-text-dim)', background: 'var(--cq-bg-panel)', border: '1px solid var(--cq-border)', padding: '6px 16px', borderRadius: '999px' }}>
                    💡 Нажимай <b style={{ color: 'var(--cq-text-hi)' }}>Tab</b> для отступа — скобки и кавычки закрываются сами
                </span>
            </div>
        </motion.div>
    );
};

Object.assign(window, { CodePlayground });
