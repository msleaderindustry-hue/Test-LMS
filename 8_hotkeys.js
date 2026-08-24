const { useState, useEffect, useRef } = React;
const { motion, AnimatePresence } = window.Motion;
const { Button, shuffleArray } = window;

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

const TOKENS = {
    '--cq-bg-deep': 'var(--theme-cq-bg-deep, #120f22)',
    '--cq-bg-panel': 'var(--theme-cq-bg-panel, #1b1733)',
    '--cq-bg-soft': 'var(--theme-cq-bg-soft, #241f42)',
    '--cq-border': 'var(--theme-cq-border, #332c58)',
    '--cq-text-hi': 'var(--theme-cq-text-hi, #ffffff)',
    '--cq-text-dim': 'var(--theme-cq-text-dim, #a79fd1)',
    '--cq-text-dim2': 'var(--theme-cq-text-dim2, #736a9c)',
    '--cq-violet': 'var(--theme-cq-violet, #8b5cf6)',
    '--cq-pink': 'var(--theme-cq-pink, #f472b6)',
    '--cq-mint': 'var(--theme-cq-mint, #34d399)',
    '--cq-rose': 'var(--theme-cq-rose, #fb7185)',
    '--cq-sky': 'var(--theme-cq-sky, #38bdf8)'
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
                        overflow: 'auto', color: '#e7e3f7', pointerEvents: 'none', background: 'transparent'
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
                padding: '20px', margin: '0 auto', fontFamily: "'Nunito', 'Segoe UI', sans-serif", position: 'relative'
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

                .cq-fab:hover{ filter: brightness(1.15); transform: translateY(-2px) scale(1.04); }
                .cq-fab:active{ transform: translateY(0) scale(0.97); }
                .cq-fab{ transition: transform .15s ease, filter .15s ease; }

                .cq-seg-btn{ transition: background .2s ease, color .2s ease; }
                .cq-ask-btn{ transition: transform .15s ease, box-shadow .15s ease; }
                .cq-ask-btn:not(:disabled):hover{ transform: translateY(-2px); box-shadow: 0 14px 30px rgba(139,92,246,0.5) !important; }
                .cq-back-btn:hover{ background: var(--cq-bg-soft) !important; color: #fff !important; }
                .cq-close-btn:hover{ background: rgba(139,92,246,0.2); }
                .cq-mode-switch{ transition: background .25s ease; }

                @keyframes cq-bounce{ 0%,80%,100%{ transform: translateY(0); opacity:.5; } 40%{ transform: translateY(-4px); opacity:1; } }
                .cq-dot{ width:6px; height:6px; border-radius:50%; background:currentColor; display:inline-block; animation: cq-bounce 1s infinite ease-in-out; }
                .cq-dot:nth-child(2){ animation-delay:.15s; }
                .cq-dot:nth-child(3){ animation-delay:.3s; }

                body.light {
                    --theme-cq-bg-deep: #f8fafc;
                    --theme-cq-bg-panel: #ffffff;
                    --theme-cq-bg-soft: #f1f5f9;
                    --theme-cq-border: #e2e8f0;
                    --theme-cq-text-hi: #0f172a;
                    --theme-cq-text-dim: #64748b;
                    --theme-cq-text-dim2: #94a3b8;
                    --theme-cq-violet: #8b5cf6;
                    --theme-cq-pink: #ec4899;
                    --theme-cq-mint: #10b981;
                    --theme-cq-rose: #f43f5e;
                    --theme-cq-sky: #0ea5e9;
                }
                body.light .cq-tok-comment{ color:#94a3b8; }
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
                body.light .cq-tok-identifier{ color:#0f172a; }
                body.light .cq-code-textarea::selection{ background: rgba(139,92,246,0.25); }
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
                        color: isAsking ? 'var(--cq-text-dim)' : '#fff',
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
                    <button onClick={goCode} style={{ position: 'relative', zIndex: 1, border: 'none', background: 'transparent', padding: '10px 26px', borderRadius: '999px', cursor: 'pointer', fontWeight: 800, fontSize: '13.5px', color: mode === 'code' ? '#fff' : 'var(--cq-text-dim)', whiteSpace: 'nowrap' }}>
                        🛠️ Пишу код
                    </button>
                    <button onClick={goPreview} style={{ position: 'relative', zIndex: 1, border: 'none', background: 'transparent', padding: '10px 26px', borderRadius: '999px', cursor: 'pointer', fontWeight: 800, fontSize: '13.5px', color: mode === 'preview' ? '#fff' : 'var(--cq-text-dim)', whiteSpace: 'nowrap' }}>
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
                            style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', background: 'var(--cq-bg-deep)', borderRadius: '22px', overflow: 'hidden', border: '1px solid var(--cq-border)', boxShadow: '0 25px 55px rgba(0,0,0,0.5)' }}
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
                                <div style={{ position: 'absolute', bottom: '10px', left: '58px', fontSize: '11px', color: 'var(--cq-text-dim2)', fontWeight: 700, background: 'var(--cq-bg-soft)', padding: '3px 9px', borderRadius: '999px' }}>
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
                            style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', background: '#ffffff', borderRadius: '22px', overflow: 'hidden', border: '1px solid var(--cq-border)', boxShadow: '0 25px 55px rgba(0,0,0,0.4)' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', background: 'var(--cq-bg-panel)', flexShrink: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: 'var(--cq-mint)', boxShadow: '0 0 8px var(--cq-mint)' }} />
                                    <span style={{ fontSize: '13px', color: '#fff', fontWeight: 800 }}>Твой сайт готов!</span>
                                </div>
                                <button className="cq-fab" onClick={runNow} title="Обновить" style={{ ...fabStyle(TOKENS['--cq-sky']), width: '32px', height: '32px', fontSize: '13px' }}>⟳</button>
                            </div>
                            <div style={{ padding: '8px 16px', background: '#f5f3fb', borderBottom: '1px solid #e7e2f5', flexShrink: 0 }}>
                                <div style={{ background: '#ffffff', border: '1px solid #e2ddef', borderRadius: '999px', padding: '5px 14px', fontSize: '12px', color: '#6b6488', textAlign: 'center', fontWeight: 700 }}>
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
                        style={{ background: 'var(--cq-bg-panel)', border: '1px solid rgba(139,92,246,0.35)', borderRadius: '18px', overflow: 'hidden', boxShadow: '0 14px 34px rgba(139,92,246,0.2)' }}
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

/* ============================================================================
   ДАННЫЕ ДЛЯ ТРЕНАЖЁРА ХОТКЕЕВ
   ============================================================================ */

const SHIFT_SYMBOL_MAP = {
    '1': '!', '2': '@', '3': '#', '4': '$', '5': '%',
    '6': '^', '7': '&', '8': '*', '9': '(', '0': ')',
    '-': '_', '=': '+', '[': '{', ']': '}', '\\': '|',
    ';': ':', "'": '"', ',': '<', '.': '>', '/': '?', '`': '~'
};

const HOTKEYS_DB = [
    { descKey: "alignRight", key: "r", shift: false, visual: "Ctrl + R" },
    { descKey: "alignLeft", key: "l", shift: false, visual: "Ctrl + L" },
    { descKey: "undo", key: "z", shift: false, visual: "Ctrl + Z" },
    { descKey: "cut", key: "x", shift: false, visual: "Ctrl + X" },
    { descKey: "alignCenter", key: "e", shift: false, visual: "Ctrl + E" },
    { descKey: "selectAll", key: "a", shift: false, visual: "Ctrl + A" },
    { descKey: "italic", key: "i", shift: false, visual: "Ctrl + I" },
    { descKey: "print", key: "p", shift: false, visual: "Ctrl + P" },
    { descKey: "underline", key: "u", shift: false, visual: "Ctrl + U" },
    { descKey: "save", key: "s", shift: false, visual: "Ctrl + S" },
    { descKey: "copy", key: "c", shift: false, visual: "Ctrl + C" },
    { descKey: "paste", key: "v", shift: false, visual: "Ctrl + V" },
    { descKey: "openFile", key: "o", shift: false, visual: "Ctrl + O" },
    { descKey: "closeDoc", key: "w", shift: false, visual: "Ctrl + W" },
    { descKey: "find", key: "f", shift: false, visual: "Ctrl + F" },
    { descKey: "findReplace", key: "h", shift: false, visual: "Ctrl + H" },
    { descKey: "redo", key: "y", shift: false, visual: "Ctrl + Y" },
    { descKey: "hyperlink", key: "k", shift: false, visual: "Ctrl + K" },
    { descKey: "fontSmaller", key: "1", shift: true, visual: "Ctrl + Shift + 1" },
    { descKey: "fontBigger", key: "9", shift: true, visual: "Ctrl + Shift + 9" },
    { descKey: "doubleUnderline", key: "d", shift: true, visual: "Ctrl + Shift + D" },
    { descKey: "allCaps", key: "a", shift: true, visual: "Ctrl + Shift + A" },
    { descKey: "underlineWords", key: "w", shift: true, visual: "Ctrl + Shift + W" },
    { descKey: "newTab", key: "t", shift: false, visual: "Ctrl + T" },
    { descKey: "newFile", key: "n", shift: false, visual: "Ctrl + N" },
    { descKey: "bold", key: "b", shift: false, visual: "Ctrl + B" }
];

const HOTKEY_DESC_TRANSLATIONS = {
    ru: {
        alignRight: "Поправить текст по правому краю", alignLeft: "Поправить текст по левому краю",
        undo: "Отменить последнее действие", cut: "Вырезать текст", alignCenter: "Поправить текст по центру",
        selectAll: "Выделить весь текст", italic: "Курсив", print: "Открыть принтер",
        underline: "Линия под текстом", save: "Сохранить", copy: "Копия", paste: "Вставить",
        openFile: "Открыть файл", closeDoc: "Выйти из документа", find: "Найти",
        findReplace: "Найти и заменить", redo: "Перейти к истории (Redo)", hyperlink: "Вставить гиперссылку",
        fontSmaller: "Уменьшить размер шрифта", fontBigger: "Увеличить размер шрифта",
        doubleUnderline: "Двойное подчёркивание", allCaps: "Все прописные",
        underlineWords: "Подчёркивание только слов", newTab: "Открыть новую вкладку",
        newFile: "Создать новый файл или окно", bold: "Жирный текст"
    },
    en: {
        alignRight: "Align text to the right", alignLeft: "Align text to the left",
        undo: "Undo the last action", cut: "Cut text", alignCenter: "Center-align text",
        selectAll: "Select all text", italic: "Italic", print: "Open print dialog",
        underline: "Underline text", save: "Save", copy: "Copy", paste: "Paste",
        openFile: "Open file", closeDoc: "Close the document", find: "Find",
        findReplace: "Find and replace", redo: "Redo", hyperlink: "Insert a hyperlink",
        fontSmaller: "Decrease font size", fontBigger: "Increase font size",
        doubleUnderline: "Double underline", allCaps: "All caps",
        underlineWords: "Underline words only", newTab: "Open a new tab",
        newFile: "Create a new file or window", bold: "Bold text"
    },
    uz: {
        alignRight: "Матнни ўнг томонга текислаш", alignLeft: "Матнни чап томонга текислаш",
        undo: "Охирги амални бекор қилиш", cut: "Матнни кесиб олиш", alignCenter: "Матнни марказга текислаш",
        selectAll: "Барча матнни танлаш", italic: "Қия ёзув (курсив)", print: "Босиб чиқаришни очиш",
        underline: "Матн остига чизиқ тортиш", save: "Сақлаш", copy: "Нусха олиш", paste: "Қўйиш",
        openFile: "Файлни очиш", closeDoc: "Ҳужжатни ёпиш", find: "Қидириш",
        findReplace: "Қидириш ва алмаштириш", redo: "Қайта бажариш (Redo)", hyperlink: "Гиперҳавола қўйиш",
        fontSmaller: "Шрифт ўлчамини кичрайтириш", fontBigger: "Шрифт ўлчамини катталаштириш",
        doubleUnderline: "Икки қатор тагига чизиш", allCaps: "Барча ҳарфларни бош ҳарф қилиш",
        underlineWords: "Фақат сўзларни тагига чизиш", newTab: "Янги ойна (вкладка) очиш",
        newFile: "Янги файл ёки ойна яратиш", bold: "Қалин (bold) матн"
    }
};

const UI_TRANSLATIONS = {
    ru: {
        langName: "Русский", title: "Хоткеи", aiPowered: "AI powered",
        subtitle: "Тренируй стандартную базу из твоих конспектов (Word, Система) или создай персональную для любой другой программы",
        customPanelLabel: "Своя база для другой программы",
        inputPlaceholder: "Напр. Word, Excel, Photoshop...",
        generateButton: "Создать базу",
        generating: "Ищем…",
        loadedSuccess: (topic) => `✅ База «${topic}» успешно загружена`,
        startTraining: "🚀 Начать тренировку",
        theoryStep: "Шаг 1 из 2",
        theoryTitle: "Теория",
        theoryDesc: "Изучи комбинации, которые встретятся в этой тренировке, а затем закрепи их на практике.",
        exit: "Выйти",
        goToPractice: "Перейти к практике →",
        doCombination: "Выполните комбинацию",
        finishedTitle: "Отличная работа!",
        finishedDesc: (score) => `Вы успешно закрепили ${score} горячих клавиш в мышечной памяти`,
        repeat: "Пройти ещё раз",
        alertNoTopic: "Введите название программы!",
        alertFailed: "Не удалось сгенерировать. Попробуй переформулировать запрос.",
        defaultBaseName: null
    },
    en: {
        langName: "English", title: "Hotkeys", aiPowered: "AI powered",
        subtitle: "Practice the standard set from your notes (Word, System), or create a custom one for any other program",
        customPanelLabel: "Custom set for another program",
        inputPlaceholder: "e.g. Word, Excel, Photoshop...",
        generateButton: "Generate set",
        generating: "Generating…",
        loadedSuccess: (topic) => `✅ "${topic}" set loaded successfully`,
        startTraining: "🚀 Start training",
        theoryStep: "Step 1 of 2",
        theoryTitle: "Theory",
        theoryDesc: "Study the combinations you'll be tested on, then lock them in with practice.",
        exit: "Exit",
        goToPractice: "Go to practice →",
        doCombination: "Perform the combination",
        finishedTitle: "Great job!",
        finishedDesc: (score) => `You've successfully memorized ${score} hotkeys`,
        repeat: "Try again",
        alertNoTopic: "Enter the name of a program!",
        alertFailed: "Couldn't generate a set. Try rephrasing the topic.",
        defaultBaseName: null
    },
    uz: {
        langName: "O'zbek (кирилл)", title: "Хоткейлар", aiPowered: "AI powered",
        subtitle: "Конспектларингиздаги стандарт базани (Word, Тизим) машқ қилинг ёки бошқа дастур учун ўзингизникини яратинг",
        customPanelLabel: "Бошқа дастур учун ўз базангиз",
        inputPlaceholder: "Масалан: Word, Excel, Photoshop...",
        generateButton: "База яратиш",
        generating: "Излаяпмиз…",
        loadedSuccess: (topic) => `✅ «${topic}» базаси муваффақиятли юкланди`,
        startTraining: "🚀 Машқни бошлаш",
        theoryStep: "1-қадам, 2 тадан",
        theoryTitle: "Назария",
        theoryDesc: "Ушбу машқда учрайдиган комбинацияларни ўрганинг, сўнг уларни амалиётда мустаҳкамланг.",
        exit: "Чиқиш",
        goToPractice: "Амалиётга ўтиш →",
        doCombination: "Комбинацияни бажаринг",
        finishedTitle: "Ажойиб натижа!",
        finishedDesc: (score) => `Сиз ${score} та хоткейни муваффақиятли мустаҳкамладингиз`,
        repeat: "Яна бир бор такрорлаш",
        alertNoTopic: "Дастур номини киритинг!",
        alertFailed: "Яратиб бўлмади. Мавзуни бошқача ёзиб кўринг.",
        defaultBaseName: null
    }
};

const AI_LANG_HINT = {
    ru: "русском",
    en: "английском (English)",
    uz: "узбекском языке кириллицей (o'zbek tilida, kirill alifbosida)"
};

const LANGS = ["ru", "en", "uz"];
const LANG_LABEL = { ru: "РУС", en: "ENG", uz: "ЎЗБ" };

const PRESET_TOPICS = ["Microsoft Word", "Excel", "PowerPoint", "Photoshop", "Figma", "VS Code"];

const AMBIENT_COMBOS = [
    { key: "c", shift: false, descKey: "copy" },
    { key: "v", shift: false, descKey: "paste" },
    { key: "z", shift: false, descKey: "undo" },
    { key: "s", shift: false, descKey: "save" },
    { key: "f", shift: false, descKey: "find" }
];

/* ============================================================================
   ДИЗАЙН-СИСТЕМА: ИЗМЕНЕНЫ ЖЕСТКИЕ ЦВЕТА НА CSS-ПЕРЕМЕННЫЕ
   ============================================================================ */

const FONTS = {
    display: "'Space Grotesk', 'Inter', system-ui, sans-serif",
    body: "'Inter', system-ui, -apple-system, sans-serif",
    mono: "'JetBrains Mono', 'SF Mono', ui-monospace, monospace"
};

const INK = {
    amberTop: "var(--ink-amber-top, #f3b65c)", amber: "var(--ink-amber, #e8a33d)", amberEdge: "var(--ink-amber-edge, #9c661f)", amberInk: "var(--ink-amber-ink, #2a1707)",
    tealTop: "var(--ink-teal-top, #63d8c7)", teal: "var(--ink-teal, #49c6b4)", tealEdge: "var(--ink-teal-edge, #1f7c6f)", tealInk: "var(--ink-teal-ink, #062824)",
    coralTop: "var(--ink-coral-top, #f5837a)", coral: "var(--ink-coral, #f0645a)", coralEdge: "var(--ink-coral-edge, #9c2c26)",
    keyTop: "var(--ink-key-top, #3d3d47)", keyTopHi: "var(--ink-key-top-hi, #48485373)", keyEdge: "var(--ink-key-edge, rgba(0,0,0,0.55))", keyInk: "var(--ink-key-ink, #e9e5da)",
    dimTop: "var(--ink-dim-top, #222228)", dimEdge: "var(--ink-dim-edge, rgba(0,0,0,0.5))", dimInk: "var(--ink-dim-ink, #84818c)"
};

const KB_ROWS = [
    ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
    ["z", "x", "c", "v", "b", "n", "m"]
];

const KEY_SIZES = {
    xs: { pad: "6px 8px", fs: 10.5, radius: 6, bb: 2, min: 24 },
    sm: { pad: "9px 13px", fs: 12.5, radius: 8, bb: 3, min: 32 },
    md: { pad: "13px 18px", fs: 15, radius: 10, bb: 3, min: 40 },
    lg: { pad: "16px 22px", fs: 18, radius: 12, bb: 4, min: 48 }
};

const KEY_TONES = {
    neutral: { top: INK.keyTop, hi: INK.keyTopHi, ink: INK.keyInk, edge: INK.keyEdge },
    amber: { top: INK.amber, hi: INK.amberTop, ink: INK.amberInk, edge: INK.amberEdge },
    teal: { top: INK.teal, hi: INK.tealTop, ink: INK.tealInk, edge: INK.tealEdge },
    coral: { top: INK.coral, hi: INK.coralTop, ink: "#2a0a08", edge: INK.coralEdge },
    dim: { top: INK.dimTop, hi: "var(--bg-body)", ink: INK.dimInk, edge: INK.dimEdge }
};

const Keycap = ({ children, size = "md", tone = "neutral", glow = false, wide = false }) => {
    const d = KEY_SIZES[size];
    const c = KEY_TONES[tone];
    return (
        <div style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            padding: d.pad, minWidth: wide ? undefined : d.min,
            width: wide ? "100%" : undefined,
            borderRadius: d.radius, fontFamily: FONTS.mono, fontWeight: 700,
            fontSize: d.fs, letterSpacing: "0.2px", color: c.ink,
            background: `linear-gradient(180deg, ${c.hi} 0%, ${c.top} 100%)`,
            borderBottom: `${d.bb}px solid ${c.edge}`,
            boxShadow: glow
                ? `0 0 0 1px ${c.edge}, 0 6px 16px -6px ${c.top}, 0 0 22px -2px var(--hkx-amber-glow, rgba(232,163,61,0.6))`
                : `0 0 0 1px ${c.edge}, 0 2px 6px rgba(0,0,0,0.35)`,
            transition: "box-shadow 0.2s ease, background 0.2s ease",
            userSelect: "none", whiteSpace: "nowrap", lineHeight: 1
        }}>
            {children}
        </div>
    );
};

const MiniKeyboard = ({ targetKey, needsShift, pulse, scale = 1 }) => {
    const isMatch = (k) => targetKey && k === targetKey.toLowerCase();
    return (
        <div style={{
            display: "inline-flex", flexDirection: "column", gap: 6, padding: 16,
            background: "var(--hkx-kb-bg, linear-gradient(180deg, rgba(255,255,255,0.025), rgba(0,0,0,0.28)))",
            border: "var(--hkx-kb-border, 1px solid rgba(255,255,255,0.07))", borderRadius: 20,
            boxShadow: "var(--hkx-kb-shadow, 0 30px 60px -24px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04))",
            transform: `scale(${scale})`
        }}>
            {KB_ROWS.map((row, ri) => (
                <div key={ri} style={{ display: "flex", gap: 6, justifyContent: "center", paddingLeft: ri * 9 }}>
                    {row.map((k) => {
                        const match = isMatch(k);
                        const cell = (
                            <Keycap size="xs" tone={match ? "amber" : "dim"} glow={match && pulse !== "error"}>
                                {k.toUpperCase()}
                            </Keycap>
                        );
                        if (!match) return <div key={k}>{cell}</div>;
                        return (
                            <motion.div
                                key={k}
                                animate={
                                    pulse === "success" ? { y: [0, 3, 0] }
                                        : pulse === "error" ? { x: [-3, 3, -3, 3, 0] }
                                        : {}
                                }
                                transition={{ duration: 0.28 }}
                            >
                                {cell}
                            </motion.div>
                        );
                    })}
                </div>
            ))}
            <div style={{ display: "flex", gap: 6, justifyContent: "center", marginTop: 2 }}>
                <div style={{ flex: "0 0 76px" }}>
                    <Keycap size="xs" tone={needsShift ? "amber" : "dim"} glow={needsShift && pulse !== "error"} wide>Shift</Keycap>
                </div>
                <div style={{ flex: "0 0 60px" }}>
                    <Keycap size="xs" tone="amber" glow={pulse !== "error"} wide>Ctrl</Keycap>
                </div>
                <div style={{ flex: "1 1 auto", maxWidth: 140 }}>
                    <Keycap size="xs" tone="dim" wide>Space</Keycap>
                </div>
            </div>
        </div>
    );
};

const StepTrail = ({ step, labels }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {[1, 2].map((n) => (
            <React.Fragment key={n}>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <div style={{
                        width: 20, height: 20, borderRadius: "50%", display: "flex",
                        alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800,
                        fontFamily: FONTS.mono,
                        background: n < step ? INK.teal : n === step ? INK.amber : "var(--hkx-step-bg, rgba(255,255,255,0.09))",
                        color: n <= step ? "#181818" : "var(--text-sec)"
                    }}>
                        {n < step ? "✓" : n}
                    </div>
                    <span style={{
                        fontSize: 12, fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase",
                        color: n === step ? "var(--text-main)" : "var(--text-sec)", opacity: n === step ? 1 : 0.6
                    }}>
                        {labels[n - 1]}
                    </span>
                </div>
                {n === 1 && <div style={{ width: 22, height: 1, background: "var(--hkx-line-bg, rgba(255,255,255,0.14))" }} />}
            </React.Fragment>
        ))}
    </div>
);

const ProgressDots = ({ total, current }) => (
    <div style={{ display: "flex", gap: 6, justifyContent: "center", alignItems: "center" }}>
        {Array.from({ length: total }).map((_, i) => (
            <div key={i} style={{
                width: i === current ? 20 : 6, height: 6, borderRadius: 4,
                background: i < current ? INK.teal : i === current ? INK.amber : "var(--hkx-dot-bg, rgba(255,255,255,0.14))",
                boxShadow: i === current ? `0 0 10px -1px ${INK.amber}` : "none",
                transition: "all 0.25s ease"
            }} />
        ))}
    </div>
);

const LanguageSwitcher = ({ lang, setLang, style }) => (
    <div style={{ display: "flex", gap: 6, ...style }}>
        {LANGS.map((code) => (
            <motion.button
                key={code}
                className="hkx-focusable"
                whileHover={{ y: lang === code ? 0 : -1 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => setLang(code)}
                title={UI_TRANSLATIONS[code].langName}
                style={{
                    padding: "7px 12px", borderRadius: 999,
                    border: lang === code ? `1px solid ${INK.amberEdge}` : "1px solid var(--glass-border)",
                    background: lang === code ? `linear-gradient(180deg, ${INK.amberTop}, ${INK.amber})` : "var(--bg-body)",
                    color: lang === code ? INK.amberInk : "var(--text-sec)",
                    fontFamily: FONTS.mono, fontSize: 11.5, fontWeight: 800, letterSpacing: "0.5px",
                    cursor: "pointer", boxShadow: lang === code ? `0 6px 16px -7px ${INK.amber}` : "none"
                }}
            >
                {LANG_LABEL[code]}
            </motion.button>
        ))}
    </div>
);

/* ============================================================================
   ОСНОВНОЙ КОМПОНЕНТ
   ============================================================================ */

const HotkeyTrainer = ({ onBack }) => {
    const [tasks, setTasks] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [shake, setShake] = useState(false);
    const [successPulse, setSuccessPulse] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [phase, setPhase] = useState('setup'); // 'setup' | 'theory' | 'practice'

    const [lang, setLang] = useState('ru');
    const t = UI_TRANSLATIONS[lang];

    const [topic, setTopic] = useState("Microsoft Word");
    const [isGenerating, setIsGenerating] = useState(false);
    const [activeHotkeys, setActiveHotkeys] = useState(HOTKEYS_DB);
    const [isCustomBase, setIsCustomBase] = useState(false);

    const [reducedMotion, setReducedMotion] = useState(false);
    const [ambientIndex, setAmbientIndex] = useState(0);

    useEffect(() => {
        if (document.getElementById('hkx-fonts')) return;
        const link = document.createElement('link');
        link.id = 'hkx-fonts';
        link.rel = 'stylesheet';
        link.href = 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700;800&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700;800&display=swap';
        document.head.appendChild(link);
    }, []);

    useEffect(() => {
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
        setReducedMotion(mq.matches);
        const handler = (e) => setReducedMotion(e.matches);
        if (mq.addEventListener) mq.addEventListener('change', handler); else mq.addListener(handler);
        return () => { if (mq.removeEventListener) mq.removeEventListener('change', handler); else mq.removeListener(handler); };
    }, []);

    useEffect(() => {
        if (phase !== 'setup' || reducedMotion) return;
        const id = setInterval(() => setAmbientIndex((i) => (i + 1) % AMBIENT_COMBOS.length), 1900);
        return () => clearInterval(id);
    }, [phase, reducedMotion]);

    const getDesc = (hk) => {
        if (hk.descKey) return HOTKEY_DESC_TRANSLATIONS[lang][hk.descKey] || HOTKEY_DESC_TRANSLATIONS.ru[hk.descKey];
        return hk.desc;
    };

    const generateAIHotkeys = async () => {
        if (!topic.trim()) return alert(t.alertNoTopic);
        setIsGenerating(true);

        const prompt = `Ты — техническая справочная система, а не творческий помощник. Твоя единственная задача — точно воспроизвести ОФИЦИАЛЬНО ЗАДОКУМЕНТИРОВАННЫЕ горячие клавиши программы "${topic}", без каких-либо фантазий, догадок или "правдоподобных" комбинаций.

        Верни 10 горячих клавиш (с Ctrl или Cmd, некоторые могут дополнительно включать Shift) для программы "${topic}".

        СТРОГИЕ ПРАВИЛА (нарушение недопустимо):
        1. НЕ ПРИДУМЫВАЙ комбинации. Используй только те горячие клавиши, которые реально существуют и задокументированы в официальной справке/документации программы "${topic}". Если не уверен, что комбинация существует именно в этой программе — не включай её.
        2. Если для "${topic}" в принципе не существует 10 разных официальных комбинаций с Ctrl/Cmd — верни столько, сколько действительно существует (не меньше 5, не выдумывая недостающие).
        3. Никакой отсебятины в описаниях: поле "desc" должно точно и нейтрально описывать действие, без выдуманных деталей. Напиши поле "desc" на ${AI_LANG_HINT[lang]}.
        4. Поле "key" — ТОЛЬКО ОДНА строчная английская буква или цифра (физическая клавиша, которая нажимается вместе с Ctrl, без символов вроде "!" или "(" — если нужна цифра, пиши саму цифру).
        5. Не повторяй одну и ту же комбинацию дважды.
        6. Верни ТОЛЬКО чистый валидный JSON-массив объектов. Без markdown, без пояснений, без текста до или после массива.

        Формат строго такой:
        [
          {"desc": "Описание действия", "key": "c", "shift": false, "visual": "Ctrl + C"},
          {"desc": "Сохранить как", "key": "s", "shift": true, "visual": "Ctrl + Shift + S"}
        ]`;

        try {
            const response = await fetch("https://gemini-proxy-lms.msleaderindustry.workers.dev", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });

            const data = await response.json();
            if (data.error) throw new Error(data.error.message || "Ошибка API");
            if (!data.candidates || data.candidates.length === 0) throw new Error("Пустой ответ от ИИ");

            let aiText = data.candidates[0].content.parts[0].text.trim();
            const jsonMatch = aiText.match(/\[[\s\S]*\]/);
            if (!jsonMatch) throw new Error("ИИ не вернул JSON массив");

            const parsedHotkeys = JSON.parse(jsonMatch[0]);

            const seen = new Set();
            const validatedHotkeys = parsedHotkeys
                .filter((hk) => hk && typeof hk.key === "string" && hk.key.trim().length > 0)
                .map((hk) => ({ ...hk, key: hk.key.trim().toLowerCase().slice(0, 1), shift: !!hk.shift }))
                .filter((hk) => {
                    const sig = hk.key + (hk.shift ? "!" : "");
                    if (seen.has(sig)) return false;
                    seen.add(sig);
                    return true;
                })
                .slice(0, 10);

            if (validatedHotkeys.length > 0) {
                setActiveHotkeys(validatedHotkeys);
                setIsCustomBase(true);
            } else {
                throw new Error("Неверный формат данных");
            }
        } catch (error) {
            console.error("❌ Ошибка:", error);
            alert(t.alertFailed);
            setActiveHotkeys(HOTKEYS_DB);
            setIsCustomBase(false);
        } finally {
            setIsGenerating(false);
        }
    };

    const openTheory = () => {
        setTasks(shuffleArray([...activeHotkeys]).slice(0, 10));
        setCurrentIndex(0);
        setScore(0);
        setIsFinished(false);
        setPhase('theory');
    };

    const startGame = () => setPhase('practice');

    const resetGame = () => {
        setTasks(shuffleArray([...activeHotkeys]).slice(0, 10));
        setCurrentIndex(0);
        setScore(0);
        setIsFinished(false);
        setPhase('practice');
    };

    const leaveGame = () => {
        setPhase('setup');
        setActiveHotkeys(HOTKEYS_DB);
        setIsCustomBase(false);
    };

    useEffect(() => {
        if (phase !== 'practice' || isFinished || tasks.length === 0) return;

        const handleKeyDown = (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            if (e.key === "Control" || e.key === "Meta" || e.key === "Shift" || e.key === "Alt") return;

            const isCtrlOrCmd = e.ctrlKey || e.metaKey;
            const currentTask = tasks[currentIndex];

            if (isCtrlOrCmd) {
                e.preventDefault();

                const requiresShift = !!currentTask.shift;
                const isShiftPressed = e.shiftKey;
                const pressedKey = e.key.toLowerCase();
                const expectedKey = currentTask.key.toLowerCase();
                const expectedShiftedKey = SHIFT_SYMBOL_MAP[expectedKey] || expectedKey;
                const keyMatches = pressedKey === expectedKey || pressedKey === expectedShiftedKey;

                if (isShiftPressed === requiresShift && keyMatches) {
                    setSuccessPulse(true);
                    setScore((prev) => prev + 1);
                    setTimeout(() => setSuccessPulse(false), 220);

                    if (currentIndex < tasks.length - 1) {
                        setTimeout(() => setCurrentIndex((prev) => prev + 1), 160);
                    } else {
                        setTimeout(() => setIsFinished(true), 160);
                    }
                } else {
                    setShake(true);
                    setTimeout(() => setShake(false), 320);
                }
            } else {
                setShake(true);
                setTimeout(() => setShake(false), 320);
            }
        };

        window.addEventListener("keydown", handleKeyDown, { passive: false });
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [currentIndex, tasks, isFinished, phase]);

    const keycapStyle = (accent) => ({
        padding: '15px 24px',
        background: 'linear-gradient(180deg, var(--bg-panel) 0%, var(--bg-body) 100%)',
        border: '1px solid var(--glass-border)',
        borderBottom: accent ? `3px solid ${accent}` : '3px solid var(--glass-border)',
        borderRadius: '11px',
        fontSize: '20px',
        fontWeight: '800',
        fontFamily: "'SF Mono', 'JetBrains Mono', ui-monospace, monospace",
        color: accent || 'var(--text-main)',
        letterSpacing: '0.3px',
        boxShadow: '0 4px 10px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.4)',
        minWidth: '26px',
        textAlign: 'center'
    });

    const wrap = (children) => (
        <>
            <style>{`
                .hkx-focusable:focus-visible {
                    outline: 2px solid ${INK.amber};
                    outline-offset: 2px;
                }
                .hkx-input:focus {
                    border-color: ${INK.amberEdge} !important;
                    box-shadow: 0 0 0 3px var(--hkx-amber-glow, rgba(232,163,61,0.16)) !important;
                }
                .hkx-grid { grid-template-columns: 1.05fr 0.95fr; }
                .hkx-theory-grid { grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); }
                @media (max-width: 760px) {
                    .hkx-grid { grid-template-columns: 1fr !important; }
                    .hkx-kb-wrap { transform: scale(0.82); }
                }
                @media (prefers-reduced-motion: reduce) {
                    .hkx-scope * { animation-duration: 0.001ms !important; transition-duration: 0.001ms !important; }
                }
                
                /* ПРАВИЛА ДЛЯ ИДЕАЛЬНОЙ СВЕТЛОЙ ТЕМЫ */
                body.light {
                    --ink-amber-top: #fbc173;
                    --ink-amber: #f59e0b;
                    --ink-amber-edge: #d97706;
                    --ink-amber-ink: #ffffff;
                    --ink-teal-top: #6ee7b7;
                    --ink-teal: #10b981;
                    --ink-teal-edge: #059669;
                    --ink-teal-ink: #ffffff;
                    --ink-coral-top: #fda4af;
                    --ink-coral: #e11d48;
                    --ink-coral-edge: #be123c;
                    --ink-key-top: #ffffff;
                    --ink-key-top-hi: #f8fafc;
                    --ink-key-edge: rgba(0,0,0,0.15);
                    --ink-key-ink: #0f172a;
                    --ink-dim-top: #f1f5f9;
                    --ink-dim-edge: rgba(0,0,0,0.12);
                    --ink-dim-ink: #64748b;
                    
                    --hkx-kb-bg: linear-gradient(180deg, rgba(0,0,0,0.02), rgba(0,0,0,0.06));
                    --hkx-kb-border: 1px solid rgba(0,0,0,0.06);
                    --hkx-kb-shadow: 0 12px 30px -10px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.6);
                    --hkx-step-bg: rgba(0,0,0,0.08);
                    --hkx-dot-bg: rgba(0,0,0,0.12);
                    --hkx-line-bg: rgba(0,0,0,0.15);
                    --hkx-preset-bg: rgba(245,158,11,0.1);
                    --hkx-amber-glow: rgba(245,158,11,0.25);
                }
            `}</style>
            <div className="hkx-scope">{children}</div>
        </>
    );

    /* ---------------------------- SETUP ---------------------------- */
    if (phase === 'setup') {
        const ambient = AMBIENT_COMBOS[ambientIndex];
        return wrap(
            <motion.div
                className="glass-panel"
                initial={{ opacity: 0, scale: 0.97, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                style={{
                    width: '100%', maxWidth: '980px', margin: '0 auto', padding: '40px',
                    position: 'relative', overflow: 'hidden'
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 22 }}>
                    <LanguageSwitcher lang={lang} setLang={setLang} />
                </div>

                <div className="hkx-grid" style={{ display: 'grid', gap: 40, alignItems: 'center' }}>
                    {/* ЛЕВАЯ КОЛОНКА */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                            <Keycap size="lg" tone="amber" glow>Ctrl</Keycap>
                            <div>
                                <h2 style={{
                                    margin: 0, fontFamily: FONTS.display, fontSize: 32, fontWeight: 800,
                                    letterSpacing: '-0.5px', color: 'var(--text-main)', lineHeight: 1.05
                                }}>
                                    {t.title}
                                </h2>
                                <span style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 6,
                                    fontFamily: FONTS.mono, fontSize: 10.5, fontWeight: 800, letterSpacing: '1.4px',
                                    textTransform: 'uppercase', color: INK.teal
                                }}>
                                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: INK.teal, boxShadow: `0 0 8px ${INK.teal}` }} />
                                    {t.aiPowered}
                                </span>
                            </div>
                        </div>

                        <p style={{
                            fontFamily: FONTS.body, fontSize: 15, color: 'var(--text-sec)', lineHeight: 1.65,
                            margin: 0, maxWidth: 440, fontWeight: 500
                        }}>
                            {t.subtitle}
                        </p>

                        {/* Быстрый выбор темы */}
                        <div>
                            <div style={{
                                fontFamily: FONTS.mono, fontSize: 10.5, fontWeight: 800, letterSpacing: '1.2px',
                                textTransform: 'uppercase', color: 'var(--text-sec)', opacity: 0.7, marginBottom: 10
                            }}>
                                {t.presetsLabel}
                            </div>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                {PRESET_TOPICS.map((name) => (
                                    <button
                                        key={name}
                                        className="hkx-focusable"
                                        onClick={() => setTopic(name)}
                                        disabled={isGenerating}
                                        style={{
                                            padding: '8px 14px', borderRadius: 10, cursor: isGenerating ? 'default' : 'pointer',
                                            fontFamily: FONTS.body, fontSize: 13, fontWeight: 700,
                                            background: topic === name ? 'var(--hkx-preset-bg, rgba(232,163,61,0.14))' : 'var(--bg-body)',
                                            border: topic === name ? `1px solid ${INK.amberEdge}` : '1px solid var(--glass-border)',
                                            color: topic === name ? INK.amber : 'var(--text-sec)'
                                        }}
                                    >
                                        {name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Панель генерации */}
                        <div style={{
                            background: 'var(--bg-body)', border: '1px solid var(--glass-border)',
                            borderRadius: 16, padding: 18
                        }}>
                            <div style={{
                                fontFamily: FONTS.mono, fontSize: 10.5, fontWeight: 800, letterSpacing: '1.2px',
                                textTransform: 'uppercase', color: 'var(--text-sec)', opacity: 0.7, marginBottom: 12
                            }}>
                                {t.customPanelLabel}
                            </div>
                            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                <div style={{
                                    flex: '1 1 180px', display: 'flex', alignItems: 'center',
                                    background: 'var(--bg-panel)', border: '1px solid var(--glass-border)',
                                    borderRadius: 12, padding: '0 4px 0 14px'
                                }}>
                                    <span style={{ fontFamily: FONTS.mono, color: INK.amber, fontWeight: 800, marginRight: 6 }}>›</span>
                                    <input
                                        type="text"
                                        className="hkx-focusable hkx-input"
                                        value={topic}
                                        onChange={(e) => setTopic(e.target.value)}
                                        placeholder={t.inputPlaceholder}
                                        disabled={isGenerating}
                                        style={{
                                            flex: 1, padding: '13px 6px', border: 'none', outline: 'none',
                                            background: 'transparent', color: 'var(--text-main)',
                                            fontFamily: FONTS.body, fontSize: 15, fontWeight: 600
                                        }}
                                    />
                                </div>
                                <motion.button
                                    className="hkx-focusable"
                                    whileHover={{ y: isGenerating ? 0 : -1 }}
                                    whileTap={{ scale: isGenerating ? 1 : 0.97 }}
                                    onClick={generateAIHotkeys}
                                    disabled={isGenerating}
                                    style={{
                                        padding: '0 22px', height: 48, border: 'none', borderRadius: 12,
                                        background: `linear-gradient(180deg, ${INK.amberTop}, ${INK.amber})`,
                                        color: INK.amberInk, fontFamily: FONTS.body, fontWeight: 800, fontSize: 14,
                                        cursor: isGenerating ? 'not-allowed' : 'pointer', opacity: isGenerating ? 0.75 : 1,
                                        display: 'flex', alignItems: 'center', gap: 9,
                                        boxShadow: `0 12px 24px -12px ${INK.amber}`
                                    }}
                                >
                                    {isGenerating && (
                                        <motion.span
                                            animate={{ rotate: 360 }}
                                            transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                                            style={{
                                                width: 13, height: 13, borderRadius: '50%',
                                                border: `2px solid ${INK.amberInk}55`, borderTopColor: INK.amberInk,
                                                display: 'inline-block'
                                            }}
                                        />
                                    )}
                                    {isGenerating ? t.generating : t.generateButton}
                                </motion.button>
                            </div>
                            <AnimatePresence>
                                {isCustomBase && !isGenerating && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                        style={{
                                            fontFamily: FONTS.body, fontSize: 13, color: INK.teal, fontWeight: 700,
                                            background: 'rgba(73,198,180,0.09)', border: `1px solid ${INK.tealEdge}55`,
                                            borderRadius: 10, padding: '9px 12px'
                                        }}
                                    >
                                        {t.loadedSuccess(topic)}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <Button variant="orange" onClick={openTheory} style={{ height: 52, fontSize: 15.5, borderRadius: 13, fontWeight: 800 }}>
                            {t.startTraining}
                        </Button>
                    </div>

                    {/* ПРАВАЯ КОЛОНКА — живая клавиатура */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                        <div className="hkx-kb-wrap">
                            <MiniKeyboard targetKey={ambient.key} needsShift={ambient.shift} pulse={null} scale={1.15} />
                        </div>
                        <div style={{
                            fontFamily: FONTS.mono, fontSize: 12.5, fontWeight: 700, color: 'var(--text-sec)',
                            textAlign: 'center', minHeight: 18
                        }}>
                            {HOTKEY_DESC_TRANSLATIONS[lang][ambient.descKey]}
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    }

    /* ---------------------------- THEORY ---------------------------- */
    if (phase === 'theory') {
        return wrap(
            <motion.div
                className="glass-panel"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                style={{ width: '100%', maxWidth: '900px', margin: '0 auto', padding: '34px', display: 'flex', flexDirection: 'column', gap: 22 }}
            >
                <header style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: 18 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <StepTrail step={1} labels={[t.stepTheoryLabel, t.stepPracticeLabel]} />
                        <LanguageSwitcher lang={lang} setLang={setLang} />
                    </div>
                    <h2 style={{
                        margin: 0, fontFamily: FONTS.display, fontSize: 26, fontWeight: 800,
                        letterSpacing: '-0.4px', color: 'var(--text-main)'
                    }}>
                        {t.theoryTitle}{isCustomBase ? `: ${topic}` : ''}
                    </h2>
                    <p style={{ fontFamily: FONTS.body, fontSize: 14, color: 'var(--text-sec)', fontWeight: 500, margin: '8px 0 0', lineHeight: 1.6 }}>
                        {t.theoryDesc}
                    </p>
                </header>

                <div className="hkx-theory-grid" style={{
                    display: 'grid', gap: 12, maxHeight: 420, overflowY: 'auto', paddingRight: 4
                }}>
                    {tasks.map((hk, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.25, delay: Math.min(i * 0.03, 0.3) }}
                            style={{
                                display: 'flex', flexDirection: 'column', gap: 12, padding: 16,
                                background: 'var(--bg-body)', border: '1px solid var(--glass-border)', borderRadius: 14
                            }}
                        >
                            <div style={{ fontFamily: FONTS.body, fontSize: 13.5, fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.4 }}>
                                {getDesc(hk)}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Keycap size="sm" tone="neutral">Ctrl</Keycap>
                                {hk.shift && (
                                    <>
                                        <span style={{ color: 'var(--text-sec)', opacity: 0.5, fontWeight: 700, fontFamily: FONTS.mono }}>+</span>
                                        <Keycap size="sm" tone="neutral">Shift</Keycap>
                                    </>
                                )}
                                <span style={{ color: 'var(--text-sec)', opacity: 0.5, fontWeight: 700, fontFamily: FONTS.mono }}>+</span>
                                <Keycap size="sm" tone="amber">{hk.key.toUpperCase()}</Keycap>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                    <Button variant="muted" onClick={leaveGame} style={{ flex: '0 0 140px', height: 50, fontSize: 14.5, borderRadius: 13, fontWeight: 800 }}>
                        {t.exit}
                    </Button>
                    <Button variant="orange" onClick={startGame} style={{ flex: 1, height: 50, fontSize: 15, borderRadius: 13, fontWeight: 800 }}>
                        {t.goToPractice}
                    </Button>
                </div>
            </motion.div>
        );
    }

    if (tasks.length === 0) return null;

    const currentTask = tasks[currentIndex];
    const comboText = `Ctrl${currentTask.shift ? ' + Shift' : ''} + ${currentTask.key.toUpperCase()}`;
    const pulse = shake ? 'error' : successPulse ? 'success' : null;

    return wrap(
        <motion.div
            className="glass-panel"
            initial={{ opacity: 0, y: 26 }}
            animate={shake ? { x: [-8, 8, -8, 8, 0], opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
            transition={shake ? { duration: 0.32 } : { duration: 0.45, ease: 'easeOut' }}
            style={{ width: '100%', maxWidth: '760px', margin: '0 auto', padding: '32px', display: 'flex', flexDirection: 'column', gap: 24 }}
        >
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: 18 }}>
                <motion.button
                    className="hkx-focusable"
                    whileHover={{ x: -2, opacity: 1 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={leaveGame}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', border: 'none',
                        cursor: 'pointer', color: 'var(--text-sec)', fontFamily: FONTS.body, fontSize: 13.5, fontWeight: 700, opacity: 0.85, justifySelf: 'start'
                    }}
                >
                    <span style={{ fontSize: 16, lineHeight: 1 }}>←</span> {t.exit}
                </motion.button>
                {!isFinished && <StepTrail step={2} labels={[t.stepTheoryLabel, t.stepPracticeLabel]} />}
                <LanguageSwitcher lang={lang} setLang={setLang} />
            </header>

            {!isFinished ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28, padding: '4px 0' }}>
                    <div style={{
                        fontFamily: FONTS.mono, fontSize: 11.5, color: 'var(--text-sec)', textTransform: 'uppercase',
                        letterSpacing: '2px', fontWeight: 800, opacity: 0.75
                    }}>
                        {t.doCombination}
                    </div>

                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, scale: successPulse ? 1.04 : 1, y: 0 }}
                        transition={{ duration: 0.22 }}
                        style={{
                            fontFamily: FONTS.display, fontSize: 26, fontWeight: 700, textAlign: 'center',
                            color: successPulse ? INK.teal : 'var(--text-main)', maxWidth: '85%', lineHeight: 1.35,
                            transition: 'color 0.2s ease'
                        }}
                    >
                        {getDesc(currentTask)}
                    </motion.div>

                    <div className="hkx-kb-wrap">
                        <MiniKeyboard targetKey={currentTask.key} needsShift={currentTask.shift} pulse={pulse} />
                    </div>

                    <div style={{ fontFamily: FONTS.mono, fontSize: 12.5, fontWeight: 700, color: 'var(--text-sec)', opacity: 0.7 }}>
                        {comboText}
                    </div>

                    <ProgressDots total={tasks.length} current={currentIndex} />
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.32 }}
                    style={{ textAlign: 'center', padding: '36px 0', display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}
                >
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.08 }}>
                        <Keycap size="lg" tone="teal" glow>✓</Keycap>
                    </motion.div>
                    <h2 style={{ fontFamily: FONTS.display, fontSize: 30, margin: 0, fontWeight: 800, color: INK.teal, letterSpacing: '-0.4px' }}>
                        {t.finishedTitle}
                    </h2>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, fontFamily: FONTS.mono }}>
                        <span style={{ fontSize: 34, fontWeight: 800, color: 'var(--text-main)' }}>{score}</span>
                        <span style={{ fontSize: 16, color: 'var(--text-sec)', opacity: 0.6 }}>/ {tasks.length}</span>
                    </div>
                    <p style={{ fontFamily: FONTS.body, fontSize: 14.5, color: 'var(--text-sec)', fontWeight: 600, margin: 0 }}>
                        {t.finishedDesc(score)}
                    </p>
                    <Button variant="orange" onClick={resetGame} style={{ width: 240, marginTop: 12, height: 50, borderRadius: 13, fontSize: 14.5, fontWeight: 800 }}>
                        {t.repeat}
                    </Button>
                </motion.div>
            )}
        </motion.div>
    );
};

Object.assign(window, { HotkeyTrainer });
