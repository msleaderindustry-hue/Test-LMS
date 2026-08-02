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

    // Стили в духе VS Code вкладок
    const tabStyle = (isActive, type) => {
        let accentColor = type === 'html' ? '#e34c26' : type === 'css' ? '#264de4' : '#f7df1e';
        return {
            padding: '10px 20px',
            background: isActive ? '#1e1e1e' : '#2d2d2d',
            color: isActive ? '#ffffff' : '#969696',
            border: 'none',
            borderTop: isActive ? `2px solid ${accentColor}` : '2px solid transparent',
            borderRight: '1px solid #252526',
            fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'background 0.2s',
            minWidth: '120px'
        };
    };

    const getFileIcon = (type) => {
        if (type === 'html') return <span style={{color: '#e34c26', fontSize: '14px'}}><></span>;
        if (type === 'css') return <span style={{color: '#264de4', fontSize: '14px'}}>#</span>;
        return <span style={{color: '#f7df1e', fontSize: '14px'}}>JS</span>;
    };

    return (
        <motion.div 
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#181818', padding: '15px 25px', borderRadius: '12px', border: '1px solid #333' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <h2 style={{margin: 0, fontSize: '24px', fontWeight: '800', color: '#fff', display: 'flex', alignItems: 'center', gap: '10px'}}>
                        <span style={{ color: '#007acc' }}>{'</>'}</span> VS School
                    </h2>
                    <span style={{ background: '#2d2d2d', color: '#ccc', padding: '4px 10px', borderRadius: '6px', fontSize: '12px' }}>
                        Проект: Мой первый сайт
                    </span>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '20px', height: '70vh', minHeight: '550px' }}>
                
                {/* ЛЕВАЯ ЧАСТЬ - VS CODE РЕДАКТОР */}
                <div style={{ flex: 1.2, display: 'flex', background: '#1e1e1e', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', border: '1px solid #333' }}>
                    
                    {/* Боковая панелька инструментов (Activity Bar) */}
                    <div style={{ width: '48px', background: '#333333', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '15px', gap: '20px', borderRight: '1px solid #252526' }}>
                        <div style={{ color: '#fff', fontSize: '20px', cursor: 'pointer', opacity: 1 }}>📄</div>
                        <div style={{ color: '#fff', fontSize: '20px', cursor: 'pointer', opacity: 0.4 }}>🔍</div>
                        <div style={{ color: '#fff', fontSize: '20px', cursor: 'pointer', opacity: 0.4 }}>🧩</div>
                        <div style={{ marginTop: 'auto', marginBottom: '15px', color: '#fff', fontSize: '20px', cursor: 'pointer', opacity: 0.4 }}>⚙️</div>
                    </div>

                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        {/* Верхняя панель вкладок файлов */}
                        <div style={{ display: 'flex', background: '#252526', overflowX: 'auto' }}>
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
                                        color: isAsking ? '#888' : '#c4b5fd',
                                        border: isAsking ? '1px solid #444' : '1px solid #8b5cf6',
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
                        <div style={{ background: '#1e1e1e', padding: '4px 15px', fontSize: '12px', color: '#969696', borderBottom: '1px solid #2d2d2d', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <span>project</span> <span>›</span> 
                            <span style={{color: '#ccc'}}>
                                {activeTab === 'html' ? 'index.html' : activeTab === 'css' ? 'style.css' : 'script.js'}
                            </span>
                        </div>

                        {/* Поля ввода (Сам редактор) */}
                        <div style={{ flex: 1, display: 'flex', position: 'relative', background: '#1e1e1e' }}>
                            {/* Фальшивая панель с номерами строк (Gutter) для красоты */}
                            <div style={{ width: '40px', background: '#1e1e1e', borderRight: '1px solid #2d2d2d', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', padding: '20px 10px 20px 0', color: '#6e7681', fontFamily: "'Fira Code', 'Courier New', monospace", fontSize: '15px', lineHeight: '1.6', userSelect: 'none' }}>
                                {[...Array(15)].map((_, i) => <div key={i}>{i + 1}</div>)}
                            </div>

                            {activeTab === 'html' && (
                                <textarea 
                                    value={htmlCode} onChange={(e) => setHtmlCode(e.target.value)}
                                    style={{ flex: 1, background: 'transparent', color: '#ce9178', fontFamily: "'Fira Code', Consolas, Monaco, 'Courier New', monospace", fontSize: '15px', padding: '20px', border: 'none', resize: 'none', outline: 'none', lineHeight: '1.6', whiteSpace: 'pre' }}
                                    spellCheck="false"
                                />
                            )}
                            {activeTab === 'css' && (
                                <textarea 
                                    value={cssCode} onChange={(e) => setCssCode(e.target.value)}
                                    style={{ flex: 1, background: 'transparent', color: '#9cdcfe', fontFamily: "'Fira Code', Consolas, Monaco, 'Courier New', monospace", fontSize: '15px', padding: '20px', border: 'none', resize: 'none', outline: 'none', lineHeight: '1.6', whiteSpace: 'pre' }}
                                    spellCheck="false"
                                />
                            )}
                            {activeTab === 'js' && (
                                <textarea 
                                    value={jsCode} onChange={(e) => setJsCode(e.target.value)}
                                    style={{ flex: 1, background: 'transparent', color: '#dcdcaa', fontFamily: "'Fira Code', Consolas, Monaco, 'Courier New', monospace", fontSize: '15px', padding: '20px', border: 'none', resize: 'none', outline: 'none', lineHeight: '1.6', whiteSpace: 'pre' }}
                                    spellCheck="false"
                                />
                            )}
                            
                            {/* Окошко с ответом ИИ поверх редактора */}
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
                                            maxWidth: '500px',
                                            background: '#252526',
                                            border: '1px solid #8b5cf6',
                                            borderRadius: '8px',
                                            padding: '0',
                                            color: '#cccccc',
                                            boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
                                            zIndex: 10,
                                            overflow: 'hidden'
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1e1e1e', padding: '10px 15px', borderBottom: '1px solid #333' }}>
                                            <div style={{ fontWeight: '600', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                                                <span style={{color: '#a78bfa'}}>✨</span> Помощник (Gemini)
                                            </div>
                                            <button 
                                                onClick={() => setAiResponse(null)}
                                                style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', fontSize: '14px' }}
                                            >
                                                ✖
                                            </button>
                                        </div>
                                        <div style={{ padding: '15px', lineHeight: '1.5', fontSize: '14px', whiteSpace: 'pre-wrap', maxHeight: '250px', overflowY: 'auto', fontFamily: '"Segoe UI", sans-serif' }}>
                                            {aiResponse}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* ПРАВАЯ ЧАСТЬ - МИНИ-БРАУЗЕР */}
                <div style={{ flex: 0.8, display: 'flex', flexDirection: 'column', background: '#ffffff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', border: '1px solid #e2e8f0' }}>
                    
                    {/* Строка браузера (Safari / Chrome style) */}
                    <div style={{ background: '#f1f5f9', padding: '10px 15px', borderBottom: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                            <div style={{ width: '12px', height: '12px', background: '#ef4444', borderRadius: '50%' }}></div>
                            <div style={{ width: '12px', height: '12px', background: '#eab308', borderRadius: '50%' }}></div>
                            <div style={{ width: '12px', height: '12px', background: '#22c55e', borderRadius: '50%' }}></div>
                        </div>
                        
                        <div style={{ 
                            flex: 1, background: '#e2e8f0', borderRadius: '6px', padding: '4px 0', 
                            textAlign: 'center', fontSize: '12px', color: '#64748b', fontWeight: '600',
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
        </motion.div>
    );
};

Object.assign(window, { CodePlayground });
