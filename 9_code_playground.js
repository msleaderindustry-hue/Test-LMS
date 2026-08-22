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

/* Своя палитра — независимая от темы хост-страницы, чтобы виджет всегда
   выглядел одинаково, где бы его ни встроили. */
const TOKENS = {
    '--cq-bg-deep': '#120f22',
    '--cq-bg-panel': '#1b1733',
    '--cq-bg-soft': '#241f42',
    '--cq-border': '#332c58',
    '--cq-text-hi': '#ffffff',
    '--cq-text-dim': '#a79fd1',
    '--cq-text-dim2': '#736a9c',
    '--cq-violet': '#8b5cf6',
    '--cq-pink': '#f472b6',
    '--cq-mint': '#34d399',
    '--cq-rose': '#fb7185',
    '--cq-sky': '#38bdf8'
};

/* =====================================================================
   ПАНЕЛЬ ОДНОГО ФАЙЛА (гаттер + подсветка + textarea)
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
                    fontSize: '13px', lineHeight: '1.65', padding: '14px 10px 14px 0',
                    textAlign: 'right', overflow: 'hidden', userSelect: 'none'
                }}
            >
                {Array.from({ length: lineCount }, (_, i) => <div key={i}>{i + 1}</div>)}
            </div>

            <div style={{ position: 'relative', flex: 1, overflow: 'hidden', minWidth: 0 }}>
                <pre
                    ref={preRef}
                    style={{
                        position: 'absolute', inset: 0, margin: 0, padding: '14px 16px',
                        fontFamily: "'Cascadia Code', Consolas, 'Courier New', monospace",
                        fontSize: '13.5px', lineHeight: '1.65', whiteSpace: 'pre',
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
                        position: 'absolute', inset: 0, margin: 0, padding: '14px 16px',
                        fontFamily: "'Cascadia Code', Consolas, 'Courier New', monospace",
                        fontSize: '13.5px', lineHeight: '1.65', whiteSpace: 'pre',
                        border: 'none', resize: 'none', outline: 'none', overflow: 'auto',
                        background: 'transparent', color: 'transparent', caretColor: '#ffffff'
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
    const [activeTab, setActiveTab] = useState('html');
    const [code, setCode] = useState({ ...DEFAULT_CODE });
    const [srcDoc, setSrcDoc] = useState('');
    const [cursor, setCursor] = useState({ line: 1, col: 1 });

    const [isAsking, setIsAsking] = useState(false);
    const [aiResponse, setAiResponse] = useState(null);

    const taRefs = useRef({});
    const preRefs = useRef({});
    const gutterRefs = useRef({});

    // Ширина СВОЕГО контейнера (не окна) — компонент встраивается в чужую
    // страницу произвольной ширины, поэтому меряем себя через ResizeObserver.
    const splitRef = useRef(null);
    const [splitWidth, setSplitWidth] = useState(1200);

    useEffect(() => {
        if (!splitRef.current || typeof ResizeObserver === 'undefined') return;
        const ro = new ResizeObserver((entries) => {
            for (const entry of entries) setSplitWidth(entry.contentRect.width);
        });
        ro.observe(splitRef.current);
        return () => ro.disconnect();
    }, []);

    const stacked = splitWidth < 720;

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

    const circleBtnStyle = (color) => ({
        width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: 'none', background: `${color}22`, color,
        fontSize: '14px', cursor: 'pointer'
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
                width: '100%', maxWidth: '1400px', display: 'flex', flexDirection: 'column', gap: '16px',
                padding: '20px', margin: '0 auto', fontFamily: "'Nunito', 'Segoe UI', sans-serif",
                position: 'relative'
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

                .cq-pill:hover{ filter: brightness(1.15); }
                .cq-circle-btn:hover{ filter: brightness(1.3); transform: translateY(-1px); }
                .cq-circle-btn:active{ transform: translateY(0); }
                .cq-ask-btn{ transition: transform .15s ease, box-shadow .15s ease; }
                .cq-ask-btn:not(:disabled):hover{ transform: translateY(-2px); box-shadow: 0 14px 30px rgba(139,92,246,0.5) !important; }
                .cq-back-btn:hover{ background: var(--cq-bg-soft) !important; color: #fff !important; }
                .cq-close-btn:hover{ background: rgba(139,92,246,0.2); }
                .cq-refresh-btn:hover{ transform: rotate(45deg); }

                @keyframes cq-bounce{ 0%,80%,100%{ transform: translateY(0); opacity:.5; } 40%{ transform: translateY(-4px); opacity:1; } }
                .cq-dot{ width:6px; height:6px; border-radius:50%; background:currentColor; display:inline-block; animation: cq-bounce 1s infinite ease-in-out; }
                .cq-dot:nth-child(2){ animation-delay:.15s; }
                .cq-dot:nth-child(3){ animation-delay:.3s; }

                @keyframes cq-glow{ 0%,100%{ opacity:.5; } 50%{ opacity:1; } }
            `}</style>

            {/* декоративное свечение фона */}
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

            {/* ==================== РЕДАКТОР + ПРЕВЬЮ ==================== */}
            <div ref={splitRef} style={{ display: 'flex', flexDirection: stacked ? 'column' : 'row', gap: '16px', height: stacked ? 'auto' : '68vh', minHeight: stacked ? 'auto' : '520px' }}>

                {/* ---- КАРТОЧКА РЕДАКТОРА ---- */}
                <div style={{ flex: stacked ? 'none' : 1.15, height: stacked ? '440px' : 'auto', display: 'flex', flexDirection: 'column', background: 'var(--cq-bg-deep)', borderRadius: '20px', overflow: 'hidden', border: '1px solid var(--cq-border)', boxShadow: '0 25px 50px rgba(0,0,0,0.45)' }}>

                    {/* Заголовок карточки: переключатель языка + действия */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap', padding: '12px 14px', borderBottom: '1px solid var(--cq-border)', background: 'var(--cq-bg-panel)' }}>
                        <div style={{ display: 'flex', gap: '6px', background: 'var(--cq-bg-deep)', padding: '4px', borderRadius: '999px', border: '1px solid var(--cq-border)' }}>
                            {LANGS.map((lang) => {
                                const active = activeTab === lang;
                                return (
                                    <button
                                        key={lang}
                                        className="cq-pill"
                                        onClick={() => setActiveTab(lang)}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '999px',
                                            border: 'none', cursor: 'pointer', fontSize: '12.5px', fontWeight: 700,
                                            fontFamily: "'Nunito', sans-serif",
                                            background: active ? LANG_META[lang].accent : 'transparent',
                                            color: active ? '#1b1733' : 'var(--cq-text-dim)'
                                        }}
                                    >
                                        <span style={{ fontFamily: "'Cascadia Code', monospace" }}>{LANG_META[lang].icon}</span> {LANG_META[lang].short}
                                    </button>
                                );
                            })}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '11px', color: 'var(--cq-text-dim2)', fontWeight: 700, whiteSpace: 'nowrap' }}>
                                Стр. {cursor.line}:{cursor.col}
                            </span>
                            <button className="cq-circle-btn" onClick={runNow} title="Запустить" style={circleBtnStyle(TOKENS['--cq-mint'])}>▶</button>
                            <button className="cq-circle-btn" onClick={resetCurrent} title="Сбросить файл" style={circleBtnStyle(TOKENS['--cq-rose'])}>↺</button>
                            <button className="cq-circle-btn" onClick={downloadSite} title="Скачать сайт" style={circleBtnStyle(TOKENS['--cq-sky'])}>⬇</button>
                        </div>
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
                    </div>
                </div>

                {/* ---- КАРТОЧКА ПРЕВЬЮ ---- */}
                <div style={{ flex: stacked ? 'none' : 0.85, height: stacked ? '320px' : 'auto', display: 'flex', flexDirection: 'column', background: '#ffffff', borderRadius: '20px', overflow: 'hidden', border: '1px solid var(--cq-border)', boxShadow: '0 25px 50px rgba(0,0,0,0.35)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', padding: '10px 14px', background: 'var(--cq-bg-panel)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                            <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: 'var(--cq-mint)', flexShrink: 0, boxShadow: '0 0 8px var(--cq-mint)' }} />
                            <span style={{ fontSize: '12.5px', color: 'var(--cq-text-hi)', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Живой сайт</span>
                        </div>
                        <button className="cq-refresh-btn" onClick={runNow} title="Обновить" style={{ background: 'transparent', border: 'none', color: 'var(--cq-text-dim)', cursor: 'pointer', fontSize: '15px', transition: 'transform .2s ease' }}>⟳</button>
                    </div>
                    <div style={{ padding: '6px 12px', background: '#f5f3fb', borderBottom: '1px solid #e7e2f5' }}>
                        <div style={{ background: '#ffffff', border: '1px solid #e2ddef', borderRadius: '999px', padding: '4px 12px', fontSize: '11.5px', color: '#6b6488', textAlign: 'center', fontWeight: 600 }}>
                            🔒 мой-сайт.детский-код
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
                                    <span style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: '14.5px', color: 'var(--cq-text-hi)' }}>Наставник ИИ</span>
                                    <button className="cq-close-btn" onClick={() => setAiResponse(null)} style={{ background: 'transparent', border: 'none', color: 'var(--cq-text-dim)', cursor: 'pointer', fontSize: '16px', padding: '5px', borderRadius: '7px' }}>✖</button>
                                </div>
                                <div style={{ background: 'var(--cq-bg-deep)', border: '1px solid var(--cq-border)', borderRadius: '14px', borderTopLeftRadius: '4px', padding: '14px 16px', lineHeight: '1.65', fontSize: '14.5px', whiteSpace: 'pre-wrap', color: '#e9e7f5' }}>
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
