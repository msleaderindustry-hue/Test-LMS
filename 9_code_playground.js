const { useState, useEffect } = React;
const { motion, AnimatePresence } = window.Motion;
const { Button } = window;

// Цвета языков — фирменные, не завязаны на тему
const LANG = {
    html: { color: '#ff6b4a', label: 'index.html', icon: '</>' },
    css: { color: '#3b82f6', label: 'style.css', icon: '#' },
    js: { color: '#f5c518', label: 'script.js', icon: 'JS' },
};

const CodePlayground = ({ onBack }) => {
    const [activeTab, setActiveTab] = useState('html');

    const [htmlCode, setHtmlCode] = useState('<h1>Привет, я юный программист! 🚀</h1>\n<p>Это мой первый настоящий сайт.</p>\n<button onclick="sayHello()">Нажми меня!</button>');
    const [cssCode, setCssCode] = useState('body {\n  font-family: Arial, sans-serif;\n  background: #f0fdf4;\n  text-align: center;\n  padding: 20px;\n}\n\nh1 {\n  color: #0ea5e9;\n}\n\nbutton {\n  background: #10b981;\n  color: white;\n  border: none;\n  padding: 12px 24px;\n  font-size: 18px;\n  border-radius: 12px;\n  cursor: pointer;\n  transition: 0.3s;\n  box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);\n}\n\nbutton:hover {\n  background: #059669;\n  transform: scale(1.05);\n}');
    const [jsCode, setJsCode] = useState('function sayHello() {\n  alert("Ура! Ты написал свой первый скрипт! 🎉");\n}');

    const [srcDoc, setSrcDoc] = useState('');
    const [isAsking, setIsAsking] = useState(false);
    const [aiResponse, setAiResponse] = useState(null);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setSrcDoc(`
                <!DOCTYPE html>
                <html>
                    <head>
                        <style>${cssCode}</style>
                    </head>
                    <body>
                        ${htmlCode}
                        <script>${jsCode}</script>
                    </body>
                </html>
            `);
        }, 350);
        return () => clearTimeout(timeout);
    }, [htmlCode, cssCode, jsCode]);

    const askAI = async () => {
        setIsAsking(true);
        setAiResponse(null);

        const prompt = `Ты — добрый и веселый учитель программирования для детей. 
        Ученик написал вот такой код:
        
        --- HTML ---
        ${htmlCode}
        
        --- CSS ---
        ${cssCode}
        
        --- JavaScript ---
        ${jsCode}
        
        Твоя задача: Найди ошибки в коде или предложи, как его можно улучшить или сделать интереснее. 
        НЕ ДАВАЙ готовый код сразу! Дай подсказку, чтобы ребенок сам догадался. Хвали за старания! 
        Ответь коротко, абзацем на 3-4 предложения. Пиши простым языком, используй эмодзи.`;

        try {
            const response = await fetch("https://gemini-proxy-lms.msleaderindustry.workers.dev", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });

            const data = await response.json();
            if (data.error) throw new Error(data.error.message);
            if (!data.candidates || data.candidates.length === 0) throw new Error("Нет ответа от ИИ");

            setAiResponse(data.candidates[0].content.parts[0].text);
        } catch (error) {
            console.error("Ошибка ИИ:", error);
            setAiResponse("Ой! Кажется, мой интернет-провод перегрыз кот 🐈. Попробуй спросить чуть позже!");
        } finally {
            setIsAsking(false);
        }
    };

    const tabStyle = (isActive, type) => ({
        padding: '11px 18px',
        background: isActive ? 'var(--bg-body, #0f1115)' : 'transparent',
        color: isActive ? 'var(--text-main, #f1f1f4)' : 'var(--text-sec, #8b8fa3)',
        border: 'none',
        borderTop: isActive ? `2px solid ${LANG[type].color}` : '2px solid transparent',
        borderRight: '1px solid var(--glass-border, rgba(255,255,255,0.08))',
        fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
        fontSize: '13px',
        fontWeight: isActive ? 700 : 500,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        transition: 'background 0.2s, color 0.2s',
        minWidth: '128px',
        position: 'relative'
    });

    const getFileIcon = (type) => (
        <span style={{
            color: LANG[type].color, fontSize: '11px', fontWeight: 800,
            width: '20px', height: '20px', borderRadius: '5px',
            background: `${LANG[type].color}22`, display: 'flex',
            alignItems: 'center', justifyContent: 'center', flexShrink: 0
        }}>
            {LANG[type].icon}
        </span>
    );

    const activeCode = activeTab === 'html' ? htmlCode : activeTab === 'css' ? cssCode : jsCode;
    const setActiveCode = activeTab === 'html' ? setHtmlCode : activeTab === 'css' ? setCssCode : setJsCode;
    const lineCount = Math.max(15, activeCode.split('\n').length + 3);

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5 }}
            style={{
                width: '100%', maxWidth: '1400px', display: 'flex', flexDirection: 'column', gap: '18px',
                padding: '20px', margin: '0 auto', fontFamily: '"Segoe UI", sans-serif'
            }}
        >
            {/* ШАПКА */}
            <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: 'linear-gradient(120deg, var(--bg-panel, #14161c) 0%, var(--bg-panel, #14161c) 60%, rgba(139,92,246,0.12) 100%)',
                padding: '16px 26px', borderRadius: '16px', border: '1px solid var(--glass-border, rgba(255,255,255,0.08))',
                boxShadow: '0 10px 30px rgba(0,0,0,0.18)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                        width: '42px', height: '42px', borderRadius: '12px',
                        background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '18px', fontWeight: 900, color: '#fff',
                        boxShadow: '0 8px 20px rgba(14, 165, 233, 0.4)'
                    }}>
                        {'</>'}
                    </div>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: 'var(--text-main, #f1f1f4)', letterSpacing: '-0.01em' }}>
                            VS School
                        </h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e', display: 'inline-block' }} />
                            <span style={{ fontSize: '12px', color: 'var(--text-sec, #8b8fa3)', fontWeight: 600 }}>
                                Проект: Мой первый сайт · сохраняется автоматически
                            </span>
                        </div>
                    </div>
                </div>
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700,
                    color: '#a78bfa', background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.3)',
                    padding: '7px 14px', borderRadius: '999px'
                }}>
                    ✨ ИИ-наставник на связи
                </div>
            </div>

            <div style={{ display: 'flex', gap: '20px', height: '70vh', minHeight: '550px' }}>

                {/* РЕДАКТОР */}
                <div style={{
                    flex: 1.2, display: 'flex', background: 'var(--bg-body, #0f1115)', borderRadius: '16px',
                    overflow: 'hidden', boxShadow: '0 20px 45px rgba(0,0,0,0.25)', border: '1px solid var(--glass-border, rgba(255,255,255,0.08))'
                }}>
                    {/* Activity Bar */}
                    <div style={{
                        width: '48px', background: 'var(--bg-panel, #14161c)', display: 'flex', flexDirection: 'column',
                        alignItems: 'center', paddingTop: '16px', gap: '22px', borderRight: '1px solid var(--glass-border, rgba(255,255,255,0.08))'
                    }}>
                        <div style={{
                            width: '30px', height: '30px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: 'rgba(14,165,233,0.15)', color: '#38bdf8', fontSize: '15px'
                        }}>📄</div>
                        <div style={{ color: 'var(--text-sec, #8b8fa3)', fontSize: '15px', cursor: 'pointer', opacity: 0.5 }}>🔍</div>
                        <div style={{ color: 'var(--text-sec, #8b8fa3)', fontSize: '15px', cursor: 'pointer', opacity: 0.5 }}>🧩</div>
                        <div style={{ marginTop: 'auto', marginBottom: '15px', color: 'var(--text-sec, #8b8fa3)', fontSize: '15px', cursor: 'pointer', opacity: 0.5 }}>⚙️</div>
                    </div>

                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                        {/* Вкладки файлов */}
                        <div style={{ display: 'flex', background: 'var(--bg-panel, #14161c)', overflowX: 'auto', borderBottom: '1px solid var(--glass-border, rgba(255,255,255,0.08))' }}>
                            {['html', 'css', 'js'].map(type => (
                                <button key={type} onClick={() => setActiveTab(type)} style={tabStyle(activeTab === type, type)}>
                                    {getFileIcon(type)} {LANG[type].label}
                                </button>
                            ))}

                            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', paddingRight: '10px' }}>
                                <motion.button
                                    onClick={askAI}
                                    disabled={isAsking}
                                    whileHover={{ scale: isAsking ? 1 : 1.04 }}
                                    whileTap={{ scale: isAsking ? 1 : 0.97 }}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '7px',
                                        padding: '7px 14px',
                                        background: isAsking ? 'transparent' : 'linear-gradient(90deg, rgba(139,92,246,0.25), rgba(99,102,241,0.25))',
                                        color: isAsking ? 'var(--text-sec, #8b8fa3)' : '#c4b5fd',
                                        border: isAsking ? '1px solid var(--glass-border, rgba(255,255,255,0.08))' : '1px solid #8b5cf6',
                                        borderRadius: '8px',
                                        fontWeight: 700,
                                        cursor: isAsking ? 'not-allowed' : 'pointer',
                                        fontSize: '12px',
                                        whiteSpace: 'nowrap',
                                        boxShadow: isAsking ? 'none' : '0 4px 16px rgba(139, 92, 246, 0.25)'
                                    }}
                                >
                                    {isAsking ? (
                                        <>
                                            <motion.span
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                                style={{ display: 'inline-block', width: '11px', height: '11px', borderRadius: '50%', border: '2px solid currentColor', borderTopColor: 'transparent' }}
                                            />
                                            Анализ кода…
                                        </>
                                    ) : (
                                        <>✨ ИИ-Наставник</>
                                    )}
                                </motion.button>
                            </div>
                        </div>

                        {/* Хлебные крошки */}
                        <div style={{
                            background: 'var(--bg-body, #0f1115)', padding: '5px 15px', fontSize: '12px',
                            color: 'var(--text-sec, #8b8fa3)', borderBottom: '1px solid var(--glass-border, rgba(255,255,255,0.08))',
                            display: 'flex', alignItems: 'center', gap: '6px'
                        }}>
                            <span>project</span> <span style={{ opacity: 0.5 }}>›</span>
                            <span style={{ color: LANG[activeTab].color, fontWeight: 700 }}>{LANG[activeTab].label}</span>
                        </div>

                        {/* Редактор */}
                        <div style={{ flex: 1, display: 'flex', position: 'relative', background: 'var(--bg-body, #0f1115)' }}>
                            <div style={{
                                width: '42px', background: 'var(--bg-panel, #14161c)', borderRight: '1px solid var(--glass-border, rgba(255,255,255,0.08))',
                                display: 'flex', flexDirection: 'column', alignItems: 'flex-end', padding: '20px 10px 20px 0',
                                color: 'var(--text-sec, #8b8fa3)', opacity: 0.5, fontFamily: "'Fira Code', 'Courier New', monospace",
                                fontSize: '15px', lineHeight: '1.6', userSelect: 'none'
                            }}>
                                {[...Array(lineCount)].map((_, i) => <div key={i}>{i + 1}</div>)}
                            </div>

                            <textarea
                                key={activeTab}
                                value={activeCode}
                                onChange={(e) => setActiveCode(e.target.value)}
                                style={{
                                    flex: 1, background: 'transparent', color: 'var(--text-main, #f1f1f4)',
                                    caretColor: LANG[activeTab].color,
                                    fontFamily: "'Fira Code', Consolas, Monaco, 'Courier New', monospace",
                                    fontSize: '15px', padding: '20px', border: 'none', resize: 'none', outline: 'none',
                                    lineHeight: '1.6', whiteSpace: 'pre'
                                }}
                                spellCheck="false"
                            />

                            {/* Ответ ИИ */}
                            <AnimatePresence>
                                {aiResponse && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 24, scale: 0.96 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 24, scale: 0.96 }}
                                        transition={{ type: 'spring', stiffness: 300, damping: 26 }}
                                        style={{
                                            position: 'absolute', bottom: '20px', right: '20px',
                                            width: 'calc(100% - 60px)', maxWidth: '550px',
                                            background: 'var(--bg-panel, #181b23)',
                                            border: '1px solid rgba(139,92,246,0.5)',
                                            borderRadius: '14px', padding: 0,
                                            color: 'var(--text-main, #f1f1f4)',
                                            boxShadow: '0 25px 60px rgba(76,29,149,0.35), 0 0 0 1px rgba(139,92,246,0.15)',
                                            zIndex: 100, overflow: 'hidden'
                                        }}
                                    >
                                        <div style={{
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            background: 'linear-gradient(90deg, rgba(139,92,246,0.25), rgba(99,102,241,0.15))',
                                            padding: '12px 16px', borderBottom: '1px solid rgba(139,92,246,0.3)'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{
                                                    width: '28px', height: '28px', borderRadius: '9px',
                                                    background: 'linear-gradient(135deg, #a855f7, #6366f1)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px'
                                                }}>✨</div>
                                                <span style={{ fontWeight: 800, fontSize: '14px' }}>Наставник ИИ</span>
                                            </div>
                                            <button
                                                onClick={() => setAiResponse(null)}
                                                style={{ background: 'transparent', border: 'none', color: 'var(--text-sec, #8b8fa3)', cursor: 'pointer', fontSize: '16px', padding: '4px' }}
                                            >
                                                ✖
                                            </button>
                                        </div>
                                        <div style={{
                                            padding: '18px', lineHeight: '1.65', fontSize: '15px', whiteSpace: 'pre-wrap',
                                            maxHeight: '280px', overflowY: 'auto', fontFamily: '"Segoe UI", sans-serif'
                                        }}>
                                            {aiResponse}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* ПРЕВЬЮ */}
                <div style={{
                    flex: 0.8, display: 'flex', flexDirection: 'column', background: '#ffffff', borderRadius: '16px',
                    overflow: 'hidden', boxShadow: '0 20px 45px rgba(0,0,0,0.25)', border: '1px solid var(--glass-border, rgba(255,255,255,0.08))'
                }}>
                    <div style={{
                        background: 'var(--bg-panel, #14161c)', padding: '11px 15px',
                        borderBottom: '1px solid var(--glass-border, rgba(255,255,255,0.08))',
                        display: 'flex', alignItems: 'center', gap: '14px'
                    }}>
                        <div style={{ display: 'flex', gap: '7px' }}>
                            <div style={{ width: '11px', height: '11px', background: '#ef4444', borderRadius: '50%' }} />
                            <div style={{ width: '11px', height: '11px', background: '#eab308', borderRadius: '50%' }} />
                            <div style={{ width: '11px', height: '11px', background: '#22c55e', borderRadius: '50%' }} />
                        </div>
                        <div style={{
                            flex: 1, background: 'var(--bg-body, #0f1115)', borderRadius: '7px', padding: '5px 0',
                            textAlign: 'center', fontSize: '12px', color: 'var(--text-main, #f1f1f4)', fontWeight: 600,
                            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px',
                            border: '1px solid var(--glass-border, rgba(255,255,255,0.06))'
                        }}>
                            <span style={{ fontSize: '10px' }}>🔒</span> localhost:3000
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--text-sec, #8b8fa3)' }}>↻</div>
                    </div>

                    <iframe
                        srcDoc={srcDoc}
                        title="output"
                        sandbox="allow-scripts"
                        style={{ width: '100%', height: '100%', border: 'none', background: '#fff' }}
                    />
                </div>
            </div>
        </motion.div>
    );
};


Object.assign(window, { CodePlayground });
