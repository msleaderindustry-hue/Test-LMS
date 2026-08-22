const { useState, useEffect, useRef } = React;
const { motion, AnimatePresence } = window.Motion;
const { Button } = window;

/* =====================================================================
   ПОДСВЕТКА СИНТАКСИСА (лёгкий самописный токенайзер, без зависимостей)
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
        ['value-unit', /^-?\d+\.?\d*(px|em|rem|%|vh|vw|s|ms|deg)?/],
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
                out += `<span class="vsschool-tok-${type}">${escapeHtml(m[0])}</span>`;
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
   СТАРТОВЫЙ КОД
   ===================================================================== */

const DEFAULT_CODE = {
    html: '<h1>Привет, я юный программист! 🚀</h1>\n<p>Это мой первый настоящий сайт.</p>\n<button onclick="sayHello()">Нажми меня!</button>',
    css: 'body {\n  font-family: Arial, sans-serif;\n  background: #f0fdf4;\n  text-align: center;\n  padding: 20px;\n}\n\nh1 {\n  color: #0ea5e9;\n}\n\nbutton {\n  background: #10b981;\n  color: white;\n  border: none;\n  padding: 12px 24px;\n  font-size: 18px;\n  border-radius: 12px;\n  cursor: pointer;\n  transition: 0.3s;\n  box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);\n}\n\nbutton:hover {\n  background: #059669;\n  transform: scale(1.05);\n}',
    js: 'function sayHello() {\n  alert("Ура! Ты написал свой первый скрипт! 🎉");\n}'
};

const LANGS = ['html', 'css', 'js'];
const LANG_META = {
    html: { file: 'index.html', accent: '#e34c26', icon: '</>' },
    css: { file: 'style.css', accent: '#264de4', icon: '#' },
    js: { file: 'script.js', accent: '#d4b830', icon: 'JS' }
};

const PAIR_MAP = { '(': ')', '{': '}', '[': ']', '"': '"', "'": "'" };
const CLOSERS = [')', '}', ']', '"', "'"];

/* =====================================================================
   ПАНЕЛЬ ОДНОГО ФАЙЛА (номера строк + подсветка + textarea)
   ===================================================================== */

const EditorPane = ({ lang, value, isActive, onChange, onKeyDown, onScroll, taRef, preRef, gutterRef }) => {
    const lineCount = value.split('\n').length;
    const highlighted = tokenizeCode(value, lang) + '\n';

    return (
        <div style={{ position: 'absolute', inset: 0, display: isActive ? 'flex' : 'none' }}>
            <div
                ref={gutterRef}
                style={{
                    width: '46px', flexShrink: 0, background: '#242a55', color: '#6d78ad',
                    fontFamily: "'Fira Code', Consolas, Monaco, 'Courier New', monospace",
                    fontSize: '13.5px', lineHeight: '1.65', padding: '16px 12px 16px 0',
                    textAlign: 'right', overflow: 'hidden', userSelect: 'none',
                    borderRight: '1px solid #313a6b'
                }}
            >
                {Array.from({ length: lineCount }, (_, i) => <div key={i}>{i + 1}</div>)}
            </div>

            <div style={{ position: 'relative', flex: 1, overflow: 'hidden' }}>
                <pre
                    ref={preRef}
                    style={{
                        position: 'absolute', inset: 0, margin: 0, padding: '16px 18px',
                        fontFamily: "'Fira Code', Consolas, Monaco, 'Courier New', monospace",
                        fontSize: '13.5px', lineHeight: '1.65', whiteSpace: 'pre',
                        overflow: 'auto', color: '#e7ecff', pointerEvents: 'none', background: 'transparent'
                    }}
                    dangerouslySetInnerHTML={{ __html: highlighted }}
                />
                <textarea
                    ref={taRef}
                    className="vsschool-code-textarea"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={onKeyDown}
                    onScroll={onScroll}
                    spellCheck="false"
                    wrap="off"
                    autoCapitalize="off"
                    autoComplete="off"
                    style={{
                        position: 'absolute', inset: 0, margin: 0, padding: '16px 18px',
                        fontFamily: "'Fira Code', Consolas, Monaco, 'Courier New', monospace",
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

    // Мгновенная (с задержкой) компиляция кода в iframe
    useEffect(() => {
        const timeout = setTimeout(() => setSrcDoc(buildDoc(code)), 350);
        return () => clearTimeout(timeout);
    }, [code]);

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

    // Синхронизация прокрутки подсветки и номеров строк с textarea
    const handleScrollSync = (lang) => {
        const ta = taRefs.current[lang];
        const pre = preRefs.current[lang];
        const gutter = gutterRefs.current[lang];
        if (!ta) return;
        if (pre) { pre.scrollTop = ta.scrollTop; pre.scrollLeft = ta.scrollLeft; }
        if (gutter) gutter.scrollTop = ta.scrollTop;
    };

    // Tab / Enter с авто-отступом / автозакрытие скобок и кавычек
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
                    requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = newPos; });
                }
            } else {
                updateCode(lang, val.slice(0, start) + '  ' + val.slice(end));
                requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = start + 2; });
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
            requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = newPos; });
            return;
        }

        if (CLOSERS.includes(e.key) && start === end && val[start] === e.key) {
            e.preventDefault();
            requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = start + 1; });
            return;
        }

        if (PAIR_MAP[e.key] && start === end) {
            e.preventDefault();
            const open = e.key, close = PAIR_MAP[e.key];
            updateCode(lang, val.slice(0, start) + open + close + val.slice(end));
            requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = start + 1; });
            return;
        }
    };

    // Функция обращения к ИИ
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

    const tabStyle = (isActiveTab, type) => {
        const accentColor = LANG_META[type].accent;
        return {
            padding: '10px 20px',
            background: isActiveTab ? 'var(--bg-body)' : 'transparent',
            color: isActiveTab ? 'var(--text-main)' : 'var(--text-sec)',
            border: 'none',
            borderTop: isActiveTab ? `2px solid ${accentColor}` : '2px solid transparent',
            borderRight: '1px solid var(--glass-border)',
            fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'background 0.2s, color 0.2s',
            minWidth: '120px'
        };
    };

    const getFileIcon = (type) => (
        <span style={{ color: LANG_META[type].accent, fontSize: '14px' }}>{LANG_META[type].icon}</span>
    );

    const toolBtnStyle = (color, bg) => ({
        display: 'flex', alignItems: 'center', gap: '6px',
        padding: '7px 14px', borderRadius: '8px',
        border: `1px solid ${color}55`, background: bg,
        color, fontWeight: '600', fontSize: '12.5px',
        cursor: 'pointer', fontFamily: '"Segoe UI", sans-serif',
        transition: 'transform 0.15s ease'
    });

    return (
        <motion.div
            className="glass-panel"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5 }}
            style={{
                width: '100%', maxWidth: '1400px', display: 'flex', flexDirection: 'column', gap: '20px',
                padding: '20px', margin: '0 auto', fontFamily: '"Segoe UI", sans-serif'
            }}
        >
            {/* Локальные стили подсветки синтаксиса — с префиксом, чтобы не конфликтовать с классами хост-приложения */}
            <style>{`
                .vsschool-tok-comment{ color:#7484b8; font-style: italic; }
                .vsschool-tok-string{ color:#7ee6c5; }
                .vsschool-tok-tag{ color:#ff8c42; font-weight:600; }
                .vsschool-tok-attr{ color:#ffb37a; }
                .vsschool-tok-punct{ color:#8891c9; }
                .vsschool-tok-entity{ color:#7ee6c5; }
                .vsschool-tok-property{ color:#4cc9f0; }
                .vsschool-tok-selector{ color:#ffb3d1; font-weight:600; }
                .vsschool-tok-value-unit{ color:#ffd166; }
                .vsschool-tok-keyword{ color:#b895ff; font-weight:600; }
                .vsschool-tok-number{ color:#ffd166; }
                .vsschool-tok-func{ color:#7ee6c5; }
                .vsschool-tok-operator{ color:#8891c9; }
                .vsschool-tok-identifier{ color:#e7ecff; }
                .vsschool-code-textarea::selection{ background: rgba(124,146,255,0.35); }
                @media (max-width: 880px){
                    .vsschool-split{ flex-direction: column !important; height: auto !important; }
                    .vsschool-editor-card{ height: 55vh !important; min-height: 420px; }
                    .vsschool-preview-card{ height: 40vh !important; min-height: 300px; }
                }
            `}</style>

            {/* ШАПКА КАК В IDE */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', background: 'var(--bg-panel)', padding: '15px 25px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
                    {onBack && (
                        <button
                            onClick={onBack}
                            style={{ background: 'transparent', border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '6px 12px', color: 'var(--text-sec)', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
                        >
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

            {/* ПАНЕЛЬ ИНСТРУМЕНТОВ */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button onClick={runNow} style={toolBtnStyle('#059669', '#ecfdf5')}>▶ Запустить</button>
                <button onClick={resetCurrent} style={toolBtnStyle('#dc2626', '#fef2f2')}>⟳ Сбросить файл</button>
                <button onClick={downloadSite} style={toolBtnStyle('#0369a1', '#eff6ff')}>⬇ Скачать сайт</button>
            </div>

            <div className="vsschool-split" style={{ display: 'flex', gap: '20px', height: '70vh', minHeight: '550px' }}>

                {/* ЛЕВАЯ ЧАСТЬ - VS CODE РЕДАКТОР */}
                <div className="vsschool-editor-card" style={{ flex: 1.2, display: 'flex', background: '#1b2040', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 15px 35px rgba(0,0,0,0.25)', border: '1px solid var(--glass-border)' }}>

                    {/* Боковая панелька инструментов (Activity Bar) */}
                    <div style={{ width: '48px', background: '#161a35', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '15px', gap: '20px', borderRight: '1px solid #313a6b' }}>
                        <div style={{ color: '#e7ecff', fontSize: '20px', cursor: 'pointer', opacity: 1 }}>📄</div>
                        <div style={{ color: '#e7ecff', fontSize: '20px', cursor: 'pointer', opacity: 0.4 }}>🔍</div>
                        <div style={{ color: '#e7ecff', fontSize: '20px', cursor: 'pointer', opacity: 0.4 }}>🧩</div>
                        <div style={{ marginTop: 'auto', marginBottom: '15px', color: '#e7ecff', fontSize: '20px', cursor: 'pointer', opacity: 0.4 }}>⚙️</div>
                    </div>

                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        {/* Верхняя панель вкладок файлов */}
                        <div style={{ display: 'flex', background: '#1f2547', overflowX: 'auto', borderBottom: '1px solid #313a6b' }}>
                            {LANGS.map((lang) => (
                                <button key={lang} onClick={() => setActiveTab(lang)} style={tabStyleDark(activeTab === lang, lang)}>
                                    {getFileIcon(lang)} {LANG_META[lang].file}
                                </button>
                            ))}
                        </div>

                        {/* Хлебные крошки (Breadcrumbs) */}
                        <div style={{ background: '#1b2040', padding: '4px 15px', fontSize: '12px', color: '#8a94c9', borderBottom: '1px solid #313a6b', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <span>project</span> <span>›</span>
                            <span style={{ color: '#e7ecff' }}>{LANG_META[activeTab].file}</span>
                        </div>

                        {/* Поля ввода (Сам редактор) */}
                        <div style={{ flex: 1, position: 'relative', background: '#1b2040' }}>
                            {LANGS.map((lang) => (
                                <EditorPane
                                    key={lang}
                                    lang={lang}
                                    value={code[lang]}
                                    isActive={activeTab === lang}
                                    onChange={(v) => updateCode(lang, v)}
                                    onKeyDown={(e) => handleKeyDown(e, lang)}
                                    onScroll={() => handleScrollSync(lang)}
                                    taRef={(el) => { taRefs.current[lang] = el; }}
                                    preRef={(el) => { preRefs.current[lang] = el; }}
                                    gutterRef={(el) => { gutterRefs.current[lang] = el; }}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* ПРАВАЯ ЧАСТЬ - МИНИ-БРАУЗЕР */}
                <div className="vsschool-preview-card" style={{ flex: 0.8, display: 'flex', flexDirection: 'column', background: '#ffffff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 15px 35px rgba(0,0,0,0.1)', border: '1px solid var(--glass-border)' }}>

                    {/* Строка браузера */}
                    <div style={{ background: 'var(--bg-panel)', padding: '10px 15px', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                            <div style={{ width: '12px', height: '12px', background: '#ef4444', borderRadius: '50%' }}></div>
                            <div style={{ width: '12px', height: '12px', background: '#eab308', borderRadius: '50%' }}></div>
                            <div style={{ width: '12px', height: '12px', background: '#22c55e', borderRadius: '50%' }}></div>
                        </div>

                        <div style={{
                            flex: 1, background: 'var(--bg-body)', borderRadius: '6px', padding: '4px 0',
                            textAlign: 'center', fontSize: '12px', color: 'var(--text-main)', fontWeight: '600',
                            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px'
                        }}>
                            <span style={{ fontSize: '10px' }}>🔒</span> localhost:3000
                        </div>
                    </div>

                    {/* Сам результат */}
                    <iframe
                        srcDoc={srcDoc}
                        title="output"
                        sandbox="allow-scripts"
                        style={{ width: '100%', height: '100%', border: 'none', background: '#fff' }}
                    />
                </div>
            </div>

            {/* ПАНЕЛЬ ИИ — теперь под редактором, а не поверх кода */}
            <AnimatePresence>
                {aiResponse && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{
                            background: 'var(--bg-panel)',
                            border: '1px solid #c4b5fd',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            boxShadow: '0 10px 25px rgba(124,92,255,0.15)'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(139, 92, 246, 0.12)', padding: '12px 20px', borderBottom: '1px solid rgba(139, 92, 246, 0.25)' }}>
                            <div style={{ fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px' }}>
                                <span style={{ color: '#8b5cf6', fontSize: '18px' }}>✨</span> Наставник ИИ
                            </div>
                            <button
                                onClick={() => setAiResponse(null)}
                                style={{ background: 'transparent', border: 'none', color: 'var(--text-sec)', cursor: 'pointer', fontSize: '18px', padding: '4px' }}
                            >
                                ✖
                            </button>
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

// Тёмная версия tabStyle для редактора (сам редактор теперь всегда тёмный, независимо от темы хост-приложения)
function tabStyleDark(isActiveTab, type) {
    const accentColor = LANG_META[type].accent;
    return {
        padding: '10px 20px',
        background: isActiveTab ? '#1b2040' : 'transparent',
        color: isActiveTab ? '#e7ecff' : '#8a94c9',
        border: 'none',
        borderTop: isActiveTab ? `2px solid ${accentColor}` : '2px solid transparent',
        borderRight: '1px solid #313a6b',
        fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
        fontSize: '13px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        transition: 'background 0.2s, color 0.2s',
        minWidth: '120px'
    };
}

Object.assign(window, { CodePlayground });
