const { useState, useEffect, useRef } = React;
const { motion, AnimatePresence } = window.Motion;
const { Button } = window;

/* =====================================================================
   ПОДСВЕТКА СИНТАКСИСА — цвета максимально близки к теме VS Code Dark+
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
                    width: '50px', flexShrink: 0, background: '#1e1e1e', color: '#6e7681',
                    fontFamily: "'Cascadia Code', Consolas, 'Courier New', monospace",
                    fontSize: '13px', lineHeight: '1.6', padding: '10px 12px 10px 0',
                    textAlign: 'right', overflow: 'hidden', userSelect: 'none'
                }}
            >
                {Array.from({ length: lineCount }, (_, i) => <div key={i}>{i + 1}</div>)}
            </div>

            <div style={{ position: 'relative', flex: 1, overflow: 'hidden', borderLeft: '1px solid #2d2d2d' }}>
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

            {/* Мини-карта, как в настоящем VS Code */}
            <div className="vsc-minimap" style={{ width: '64px', flexShrink: 0, background: '#1e1e1e', borderLeft: '1px solid #2d2d2d', position: 'relative', overflow: 'hidden' }}>
                <div
                    style={{ transform: 'scale(0.2)', transformOrigin: 'top left', width: '500%', padding: '10px 16px' }}
                    dangerouslySetInnerHTML={{ __html: highlighted }}
                />
                <div
                    ref={minimapRef}
                    style={{ position: 'absolute', left: 0, right: 0, top: 0, height: '30%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', pointerEvents: 'none' }}
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

    // держим мини-карту и статус-бар в актуальном состоянии при смене вкладки
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
        padding: '4px 9px', borderRadius: '5px',
        border: `1px solid ${color}66`, background: `${color}1a`,
        color, fontWeight: '600', fontSize: '11.5px',
        cursor: 'pointer', fontFamily: "'Segoe UI', sans-serif"
    });

    return (
        <motion.div
            className="glass-panel"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5 }}
            style={{
                width: '100%', maxWidth: '1440px', display: 'flex', flexDirection: 'column', gap: '16px',
                padding: '20px', margin: '0 auto', fontFamily: '"Segoe UI", sans-serif'
            }}
        >
            <style>{`
                .vsc-tok-comment{ color:#6a9955; font-style: italic; }
                .vsc-tok-string{ color:#ce9178; }
                .vsc-tok-tag{ color:#569cd6; }
                .vsc-tok-attr{ color:#9cdcfe; }
                .vsc-tok-punct{ color:#d4d4d4; }
                .vsc-tok-entity{ color:#d7ba7d; }
                .vsc-tok-property{ color:#9cdcfe; }
                .vsc-tok-selector{ color:#d7ba7d; }
                .vsc-tok-number{ color:#b5cea8; }
                .vsc-tok-keyword{ color:#569cd6; }
                .vsc-tok-func{ color:#dcdcaa; }
                .vsc-tok-operator{ color:#d4d4d4; }
                .vsc-tok-identifier{ color:#d4d4d4; }
                .vsc-code-textarea::selection{ background: rgba(38,79,120,0.6); }
                .vsc-menu-item:hover{ background:#4a4a4a; }
                .vsc-activity-icon:hover{ opacity: 1 !important; }
                .vsc-sidebar-item:hover{ background:#2a2d2e !important; }
                @media (max-width: 980px){
                    .vsc-sidebar{ display:none !important; }
                    .vsc-body{ flex-direction: column !important; }
                    .vsc-preview{ height: 260px !important; border-left:none !important; border-top:1px solid #2d2d2d !important; }
                    .vsc-minimap{ display:none !important; }
                }
            `}</style>

            {/* Шапка хост-приложения (не часть окна VS Code) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', background: 'var(--bg-panel)', padding: '15px 25px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
                    {onBack && (
                        <button onClick={onBack} style={{ background: 'transparent', border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '6px 12px', color: 'var(--text-sec)', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
                            ← Назад
                        </button>
                    )}
                    <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ color: '#0ea5e9' }}>{'</>'}</span> VS School
                    </h2>
                    <span style={{ background: 'var(--bg-body)', color: 'var(--text-sec)', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', border: '1px solid var(--glass-border)' }}>
                        Проект: Мой первый сайт
                    </span>
                </div>

                <button
                    onClick={askAI}
                    disabled={isAsking}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '10px 18px', borderRadius: '10px',
                        background: isAsking ? 'var(--bg-body)' : 'linear-gradient(135deg, #a78bfa, #7c5cff)',
                        color: isAsking ? 'var(--text-sec)' : '#fff',
                        border: isAsking ? '1px solid var(--glass-border)' : 'none',
                        fontWeight: '700', fontSize: '14px', cursor: isAsking ? 'not-allowed' : 'pointer',
                        boxShadow: isAsking ? 'none' : '0 8px 18px rgba(124,92,255,0.35)',
                        transition: 'all 0.2s'
                    }}
                >
                    {isAsking ? '⏳ Анализ кода...' : '✨ Спросить ИИ-наставника'}
                </button>
            </div>

            {/* ===================== ОКНО VS CODE ===================== */}
            <div style={{ background: '#1e1e1e', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 30px 70px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', height: '74vh', minHeight: '580px', border: '1px solid #3c3c3c' }}>

                {/* Title bar */}
                <div style={{ height: '34px', background: '#323233', display: 'flex', alignItems: 'center', padding: '0 12px', flexShrink: 0, borderBottom: '1px solid #2d2d2d' }}>
                    <div style={{ display: 'flex', gap: '8px', width: '54px' }}>
                        <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ff5f57', display: 'block' }} />
                        <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#febc2e', display: 'block' }} />
                        <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#28c840', display: 'block' }} />
                    </div>
                    <div style={{ flex: 1, textAlign: 'center', fontSize: '12px', color: '#a0a0a0' }}>
                        {LANG_META[activeTab].file} — Мой-первый-сайт — VS School
                    </div>
                    <div style={{ width: '54px' }} />
                </div>

                {/* Menu bar */}
                <div style={{ height: '28px', background: '#3c3c3c', display: 'flex', alignItems: 'center', gap: '4px', padding: '0 10px', fontSize: '12.5px', color: '#cccccc', flexShrink: 0 }}>
                    {['Файл', 'Правка', 'Выделение', 'Вид', 'Переход', 'Выполнить', 'Справка'].map((m) => (
                        <span key={m} className="vsc-menu-item" style={{ padding: '3px 8px', borderRadius: '4px', cursor: 'default' }}>{m}</span>
                    ))}
                </div>

                {/* Тело окна */}
                <div className="vsc-body" style={{ flex: 1, display: 'flex', minHeight: 0 }}>

                    {/* Activity bar */}
                    <div style={{ width: '48px', background: '#333333', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '12px', gap: '22px', flexShrink: 0, borderRight: '1px solid #2d2d2d' }}>
                        <div className="vsc-activity-icon" style={{ color: '#ffffff', fontSize: '20px', cursor: 'pointer', opacity: 1, borderLeft: '2px solid #ffffff', paddingLeft: '9px', marginLeft: '-2px' }}>📄</div>
                        <div className="vsc-activity-icon" style={{ color: '#ffffff', fontSize: '20px', cursor: 'pointer', opacity: 0.5 }}>🔍</div>
                        <div className="vsc-activity-icon" style={{ color: '#ffffff', fontSize: '18px', cursor: 'pointer', opacity: 0.5 }}>⎇</div>
                        <div className="vsc-activity-icon" style={{ color: '#ffffff', fontSize: '18px', cursor: 'pointer', opacity: 0.5 }} onClick={runNow} title="Запустить">▶</div>
                        <div className="vsc-activity-icon" style={{ color: '#ffffff', fontSize: '18px', cursor: 'pointer', opacity: 0.5 }}>🧩</div>
                        <div style={{ marginTop: 'auto', marginBottom: '14px', color: '#ffffff', fontSize: '18px', opacity: 0.5 }}>⚙️</div>
                    </div>

                    {/* Sidebar — Проводник */}
                    <div className="vsc-sidebar" style={{ width: '190px', background: '#252526', flexShrink: 0, display: 'flex', flexDirection: 'column', borderRight: '1px solid #2d2d2d' }}>
                        <div style={{ padding: '10px 14px 6px', fontSize: '10.5px', letterSpacing: '0.8px', color: '#bbbbbb', fontWeight: 700, textTransform: 'uppercase' }}>Проводник</div>
                        <div style={{ padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px', color: '#cccccc', fontSize: '12.5px', fontWeight: 700 }}>
                            <span style={{ fontSize: '9px' }}>▾</span> МОЙ-ПЕРВЫЙ-САЙТ
                        </div>
                        <div style={{ paddingLeft: '10px' }}>
                            {LANGS.map((lang) => (
                                <div
                                    key={lang}
                                    className="vsc-sidebar-item"
                                    onClick={() => setActiveTab(lang)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '7px', padding: '4px 10px 4px 16px',
                                        fontSize: '13px', cursor: 'pointer',
                                        background: activeTab === lang ? '#37373d' : 'transparent',
                                        color: activeTab === lang ? '#ffffff' : '#cccccc'
                                    }}
                                >
                                    {getFileIcon(lang)} {LANG_META[lang].file}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Группа редактора */}
                    <div style={{ flex: 1.3, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

                        {/* Tab bar */}
                        <div style={{ display: 'flex', alignItems: 'center', background: '#252526', borderBottom: '1px solid #2d2d2d', flexShrink: 0 }}>
                            <div style={{ display: 'flex', flex: 1, overflowX: 'auto' }}>
                                {LANGS.map((lang) => {
                                    const isActiveTab = activeTab === lang;
                                    return (
                                        <button
                                            key={lang}
                                            onClick={() => setActiveTab(lang)}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '7px',
                                                padding: '8px 14px', minWidth: '130px',
                                                background: isActiveTab ? '#1e1e1e' : '#2d2d2d',
                                                color: isActiveTab ? '#ffffff' : '#969696',
                                                border: 'none', borderTop: isActiveTab ? `2px solid ${LANG_META[lang].accent}` : '2px solid transparent',
                                                borderRight: '1px solid #2d2d2d',
                                                fontSize: '13px', cursor: 'pointer', fontFamily: '"Segoe UI", sans-serif'
                                            }}
                                        >
                                            {getFileIcon(lang)} {LANG_META[lang].file}
                                        </button>
                                    );
                                })}
                            </div>
                            <div style={{ display: 'flex', gap: '6px', padding: '0 10px' }}>
                                <button onClick={runNow} style={iconBtnStyle('#4ec9b0')}>▶ Запуск</button>
                                <button onClick={resetCurrent} style={iconBtnStyle('#f48771')}>↺ Сброс</button>
                                <button onClick={downloadSite} style={iconBtnStyle('#569cd6')}>⬇ Скачать</button>
                            </div>
                        </div>

                        {/* Breadcrumb */}
                        <div style={{ background: '#1e1e1e', padding: '4px 15px', fontSize: '12px', color: '#8a8a8a', borderBottom: '1px solid #2d2d2d', display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}>
                            <span>мой-первый-сайт</span> <span>›</span>
                            <span style={{ color: '#d4d4d4' }}>{LANG_META[activeTab].file}</span>
                        </div>

                        {/* Editor body */}
                        <div style={{ flex: 1, position: 'relative', background: '#1e1e1e', minHeight: 0 }}>
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

                    {/* Simple Browser — предпросмотр как вкладка VS Code */}
                    <div className="vsc-preview" style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#ffffff', borderLeft: '1px solid #2d2d2d', minWidth: 0 }}>
                        <div style={{ background: '#252526', padding: '7px 12px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #2d2d2d', flexShrink: 0 }}>
                            <span style={{ fontSize: '12px', color: '#cccccc' }}>🌐</span>
                            <span style={{ fontSize: '12px', color: '#cccccc', fontWeight: 600 }}>Simple Browser</span>
                        </div>
                        <div style={{ background: '#f3f3f3', padding: '6px 12px', borderBottom: '1px solid #2d2d2d', flexShrink: 0 }}>
                            <div style={{ background: '#ffffff', border: '1px solid #d0d0d0', borderRadius: '14px', padding: '4px 12px', fontSize: '12px', color: '#555555', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
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
                <div style={{ height: '24px', background: '#007acc', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 10px', fontSize: '11.5px', color: '#ffffff', flexShrink: 0 }}>
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
                        style={{ background: 'var(--bg-panel)', border: '1px solid #c4b5fd', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 25px rgba(124,92,255,0.15)' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(139, 92, 246, 0.12)', padding: '12px 20px', borderBottom: '1px solid rgba(139, 92, 246, 0.25)' }}>
                            <div style={{ fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px' }}>
                                <span style={{ color: '#8b5cf6', fontSize: '18px' }}>✨</span> Наставник ИИ
                            </div>
                            <button onClick={() => setAiResponse(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-sec)', cursor: 'pointer', fontSize: '18px', padding: '4px' }}>✖</button>
                        </div>
                        <div style={{ padding: '18px 20px', lineHeight: '1.6', fontSize: '15px', whiteSpace: 'pre-wrap', color: 'var(--text-main)' }}>
                            {aiResponse}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-sec)' }}>
                Совет: нажимай <b>Tab</b> для отступа, а скобки и кавычки закрываются сами — совсем как в настоящей IDE 🚀
            </div>
        </motion.div>
    );
};

Object.assign(window, { CodePlayground });
