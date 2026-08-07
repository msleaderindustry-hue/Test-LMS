const { useState, useEffect } = React;
const { motion, AnimatePresence } = window.Motion;
const { Button } = window;

const CodePlayground = ({ onBack }) => {
    const [activeTab, setActiveTab] = useState('html');
    
    // Стартовый веселый код для ребенка
    const [htmlCode, setHtmlCode] = useState('<h1>Привет, я юный программист! 🚀</h1>\n<p>Это мой первый настоящий сайт.</p>\n<button onclick="sayHello()">Нажми меня!</button>');
    const [cssCode, setCssCode] = useState('body {\n  font-family: Arial, sans-serif;\n  background: #f0fdf4;\n  text-align: center;\n  padding: 20px;\n}\n\nh1 {\n  color: #0ea5e9;\n}\n\nbutton {\n  background: #10b981;\n  color: white;\n  border: none;\n  padding: 12px 24px;\n  font-size: 18px;\n  border-radius: 12px;\n  cursor: pointer;\n  transition: 0.3s;\n  box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);\n}\n\nbutton:hover {\n  background: #059669;\n  transform: scale(1.05);\n}');
    const [jsCode, setJsCode] = useState('function sayHello() {\n  alert("Ура! Ты написал свой первый скрипт! 🎉");\n}');
    
    const [srcDoc, setSrcDoc] = useState('');

    // AI Состояния
    const [isAsking, setIsAsking] = useState(false);
    const [aiResponse, setAiResponse] = useState(null);

    // Мгновенная компиляция кода в iframe
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

    // Функция обращения к ИИ
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
            console.log("🚀 Отправляем код на проверку ИИ...");
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

    // Стили в духе VS Code вкладок, но с поддержкой тем
    const tabStyle = (isActive, type) => {
        let accentColor = type === 'html' ? '#e34c26' : type === 'css' ? '#264de4' : '#f7df1e';
        return {
            padding: '10px 20px',
            background: isActive ? 'var(--bg-body)' : 'transparent',
            color: isActive ? 'var(--text-main)' : 'var(--text-sec)',
            border: 'none',
            borderTop: isActive ? `2px solid ${accentColor}` : '2px solid transparent',
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

    const getFileIcon = (type) => {
        if (type === 'html') return <span style={{color: '#e34c26', fontSize: '14px'}}>{'</>'}</span>;
        if (type === 'css') return <span style={{color: '#264de4', fontSize: '14px'}}>#</span>;
        return <span style={{color: '#d4b830', fontSize: '14px'}}>JS</span>;
    };

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
            {/* ШАПКА КАК В IDE */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-panel)', padding: '15px 25px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <h2 style={{margin: 0, fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px'}}>
                        <span style={{ color: '#0ea5e9' }}>{'</>'}</span> VS School
                    </h2>
                    <span style={{ background: 'var(--bg-body)', color: 'var(--text-sec)', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', border: '1px solid var(--glass-border)' }}>
                        Проект: Мой первый сайт
                    </span>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '20px', height: '70vh', minHeight: '550px' }}>
                
                {/* ЛЕВАЯ ЧАСТЬ - VS CODE РЕДАКТОР */}
                <div style={{ flex: 1.2, display: 'flex', background: 'var(--bg-body)', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 15px 35px rgba(0,0,0,0.1)', border: '1px solid var(--glass-border)' }}>
                    
                    {/* Боковая панелька инструментов (Activity Bar) */}
                    <div style={{ width: '48px', background: 'var(--bg-panel)', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '15px', gap: '20px', borderRight: '1px solid var(--glass-border)' }}>
                        <div style={{ color: 'var(--text-main)', fontSize: '20px', cursor: 'pointer', opacity: 1 }}>📄</div>
                        <div style={{ color: 'var(--text-main)', fontSize: '20px', cursor: 'pointer', opacity: 0.4 }}>🔍</div>
                        <div style={{ color: 'var(--text-main)', fontSize: '20px', cursor: 'pointer', opacity: 0.4 }}>🧩</div>
                        <div style={{ marginTop: 'auto', marginBottom: '15px', color: 'var(--text-main)', fontSize: '20px', cursor: 'pointer', opacity: 0.4 }}>⚙️</div>
                    </div>

                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        {/* Верхняя панель вкладок файлов */}
                        <div style={{ display: 'flex', background: 'var(--bg-panel)', overflowX: 'auto', borderBottom: '1px solid var(--glass-border)' }}>
                            <button onClick={() => setActiveTab('html')} style={tabStyle(activeTab === 'html', 'html')}>
                                {getFileIcon('html')} index.html
                            </button>
                            <button onClick={() => setActiveTab('css')} style={tabStyle(activeTab === 'css', 'css')}>
                                {getFileIcon('css')} style.css
                            </button>
                            <button onClick={() => setActiveTab('js')} style={tabStyle(activeTab === 'js', 'js')}>
                                {getFileIcon('js')} script.js
                            </button>
                            
                            {/* Кнопка вызова ИИ (Стилизована под плагин Copilot) */}
                            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', paddingRight: '10px' }}>
                                <button 
                                    onClick={askAI}
                                    disabled={isAsking}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '6px',
                                        padding: '6px 12px',
                                        background: isAsking ? 'transparent' : 'rgba(139, 92, 246, 0.1)',
                                        color: isAsking ? 'var(--text-sec)' : '#a78bfa',
                                        border: isAsking ? '1px solid var(--glass-border)' : '1px solid #8b5cf6',
                                        borderRadius: '6px',
                                        fontWeight: '600',
                                        cursor: isAsking ? 'not-allowed' : 'pointer',
                                        fontSize: '12px',
                                        transition: 'all 0.2s',
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    {isAsking ? '⏳ Анализ кода...' : '✨ ИИ-Наставник'}
                                </button>
                            </div>
                        </div>

                        {/* Хлебные крошки (Breadcrumbs) */}
                        <div style={{ background: 'var(--bg-body)', padding: '4px 15px', fontSize: '12px', color: 'var(--text-sec)', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <span>project</span> <span>›</span> 
                            <span style={{color: 'var(--text-main)'}}>
                                {activeTab === 'html' ? 'index.html' : activeTab === 'css' ? 'style.css' : 'script.js'}
                            </span>
                        </div>

                        {/* Поля ввода (Сам редактор) */}
                        <div style={{ flex: 1, display: 'flex', position: 'relative', background: 'var(--bg-body)' }}>
                            {/* Фальшивая панель с номерами строк (Gutter) */}
                            <div style={{ width: '40px', background: 'var(--bg-panel)', borderRight: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', padding: '20px 10px 20px 0', color: 'var(--text-sec)', opacity: 0.7, fontFamily: "'Fira Code', 'Courier New', monospace", fontSize: '15px', lineHeight: '1.6', userSelect: 'none' }}>
                                {[...Array(15)].map((_, i) => <div key={i}>{i + 1}</div>)}
                            </div>

                            {activeTab === 'html' && (
                                <textarea 
                                    value={htmlCode} onChange={(e) => setHtmlCode(e.target.value)}
                                    style={{ flex: 1, background: 'transparent', color: 'var(--text-main)', fontFamily: "'Fira Code', Consolas, Monaco, 'Courier New', monospace", fontSize: '15px', padding: '20px', border: 'none', resize: 'none', outline: 'none', lineHeight: '1.6', whiteSpace: 'pre' }}
                                    spellCheck="false"
                                />
                            )}
                            {activeTab === 'css' && (
                                <textarea 
                                    value={cssCode} onChange={(e) => setCssCode(e.target.value)}
                                    style={{ flex: 1, background: 'transparent', color: 'var(--text-main)', fontFamily: "'Fira Code', Consolas, Monaco, 'Courier New', monospace", fontSize: '15px', padding: '20px', border: 'none', resize: 'none', outline: 'none', lineHeight: '1.6', whiteSpace: 'pre' }}
                                    spellCheck="false"
                                />
                            )}
                            {activeTab === 'js' && (
                                <textarea 
                                    value={jsCode} onChange={(e) => setJsCode(e.target.value)}
                                    style={{ flex: 1, background: 'transparent', color: 'var(--text-main)', fontFamily: "'Fira Code', Consolas, Monaco, 'Courier New', monospace", fontSize: '15px', padding: '20px', border: 'none', resize: 'none', outline: 'none', lineHeight: '1.6', whiteSpace: 'pre' }}
                                    spellCheck="false"
                                />
                            )}
                            
                            {/* ИСПРАВЛЕННОЕ Окошко с ответом ИИ поверх редактора */}
                            <AnimatePresence>
                                {aiResponse && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                                        style={{
                                            position: 'absolute',
                                            bottom: '20px',
                                            right: '20px',
                                            width: 'calc(100% - 60px)',
                                            maxWidth: '550px',
                                            background: 'var(--bg-body)', // Плотный фон вместо прозрачного
                                            border: '2px solid #8b5cf6', // Более четкая граница
                                            borderRadius: '12px',
                                            padding: '0',
                                            color: 'var(--text-main)',
                                            boxShadow: '0 20px 50px rgba(0,0,0,0.5)', // Сильная тень для отделения от кода
                                            zIndex: 100, // Поверх всего
                                            overflow: 'hidden',
                                            backdropFilter: 'blur(24px)', // Размытие на случай, если тема стеклянная
                                            WebkitBackdropFilter: 'blur(24px)'
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(139, 92, 246, 0.15)', padding: '12px 20px', borderBottom: '1px solid rgba(139, 92, 246, 0.3)' }}>
                                            <div style={{ fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px' }}>
                                                <span style={{color: '#a78bfa', fontSize: '18px'}}>✨</span> Наставник ИИ
                                            </div>
                                            <button 
                                                onClick={() => setAiResponse(null)}
                                                style={{ background: 'transparent', border: 'none', color: 'var(--text-sec)', cursor: 'pointer', fontSize: '18px', padding: '4px' }}
                                            >
                                                ✖
                                            </button>
                                        </div>
                                        <div style={{ padding: '20px', lineHeight: '1.6', fontSize: '15px', whiteSpace: 'pre-wrap', maxHeight: '300px', overflowY: 'auto', fontFamily: '"Segoe UI", sans-serif', background: 'var(--bg-body)' }}>
                                            {aiResponse}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* ПРАВАЯ ЧАСТЬ - МИНИ-БРАУЗЕР */}
                <div style={{ flex: 0.8, display: 'flex', flexDirection: 'column', background: '#ffffff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 15px 35px rgba(0,0,0,0.1)', border: '1px solid var(--glass-border)' }}>
                    
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
                    
                    {/* Сам результат (Оставляем белым, так как это готовый сайт) */}
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

