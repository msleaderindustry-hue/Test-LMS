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

    const tabStyle = (isActive, color) => ({
        flex: 1,
        padding: '12px 10px',
        border: 'none',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        background: isActive ? color : 'transparent',
        color: isActive ? '#fff' : '#a1a1aa',
        borderTopLeftRadius: '12px',
        borderTopRightRadius: '12px',
        borderBottomLeftRadius: '0',
        borderBottomRightRadius: '0',
        fontSize: '15px'
    });

    return (
        <motion.div 
            className="glass-panel"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5 }}
            style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '20px', padding: '30px', position: 'relative' }}
        >
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '20px', marginBottom: '10px' }}>
                <h2 style={{margin: 0, fontSize: '32px', fontWeight: '800', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'flex', alignItems: 'center', gap: '10px'}}>
                    Code School 💻
                </h2>
            </div>

            <div style={{ display: 'flex', gap: '25px', height: '65vh', minHeight: '500px' }}>
                {/* ЛЕВАЯ ЧАСТЬ - ПРОФЕССИОНАЛЬНЫЙ РЕДАКТОР */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#1e1e2e', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 15px 35px rgba(0,0,0,0.2)' }}>
                    
                    {/* Переключатель вкладок и КНОПКА ИИ */}
                    <div style={{ display: 'flex', alignItems: 'center', background: '#181825', padding: '10px 10px 0 10px', gap: '5px' }}>
                        <button onClick={() => setActiveTab('html')} style={tabStyle(activeTab === 'html', '#e34c26')}>HTML</button>
                        <button onClick={() => setActiveTab('css')} style={tabStyle(activeTab === 'css', '#264de4')}>CSS</button>
                        <button onClick={() => setActiveTab('js')} style={tabStyle(activeTab === 'js', '#d4b830')}>JS</button>
                        
                        {/* Кнопка вызова ИИ */}
                        <button 
                            onClick={askAI}
                            disabled={isAsking}
                            style={{
                                marginLeft: 'auto',
                                padding: '8px 15px',
                                background: 'linear-gradient(90deg, #8b5cf6, #d946ef)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: 'bold',
                                cursor: isAsking ? 'not-allowed' : 'pointer',
                                fontSize: '13px',
                                opacity: isAsking ? 0.7 : 1,
                                marginBottom: '10px' // выравниваем по высоте с вкладками
                            }}
                        >
                            {isAsking ? '🤔 Думает...' : '✨ Спросить наставника'}
                        </button>
                    </div>

                    {/* Поля ввода */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
                        {activeTab === 'html' && (
                            <textarea 
                                value={htmlCode} onChange={(e) => setHtmlCode(e.target.value)}
                                style={{ flex: 1, background: '#1e1e2e', color: '#ff8a65', fontFamily: "'Courier New', Courier, monospace", fontSize: '17px', padding: '20px', border: 'none', resize: 'none', outline: 'none', lineHeight: '1.5' }}
                                spellCheck="false"
                            />
                        )}
                        {activeTab === 'css' && (
                            <textarea 
                                value={cssCode} onChange={(e) => setCssCode(e.target.value)}
                                style={{ flex: 1, background: '#1e1e2e', color: '#82aaff', fontFamily: "'Courier New', Courier, monospace", fontSize: '17px', padding: '20px', border: 'none', resize: 'none', outline: 'none', lineHeight: '1.5' }}
                                spellCheck="false"
                            />
                        )}
                        {activeTab === 'js' && (
                            <textarea 
                                value={jsCode} onChange={(e) => setJsCode(e.target.value)}
                                style={{ flex: 1, background: '#1e1e2e', color: '#fdd835', fontFamily: "'Courier New', Courier, monospace", fontSize: '17px', padding: '20px', border: 'none', resize: 'none', outline: 'none', lineHeight: '1.5' }}
                                spellCheck="false"
                            />
                        )}
                        
                        {/* Окошко с ответом ИИ поверх редактора */}
                        <AnimatePresence>
                            {aiResponse && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 20 }}
                                    style={{
                                        position: 'absolute',
                                        bottom: '20px',
                                        left: '20px',
                                        right: '20px',
                                        background: 'rgba(30, 30, 46, 0.95)',
                                        border: '1px solid #8b5cf6',
                                        borderRadius: '12px',
                                        padding: '20px',
                                        color: '#e2e8f0',
                                        boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                                        zIndex: 10
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                        <div style={{ fontWeight: 'bold', color: '#a78bfa', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span>🤖</span> AI Наставник
                                        </div>
                                        <button 
                                            onClick={() => setAiResponse(null)}
                                            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '16px' }}
                                        >
                                            ✖
                                        </button>
                                    </div>
                                    <div style={{ lineHeight: '1.6', fontSize: '15px', whiteSpace: 'pre-wrap' }}>
                                        {aiResponse}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* ПРАВАЯ ЧАСТЬ - РЕЗУЛЬТАТ */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#ffffff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 15px 35px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
                    <div style={{ background: '#f8fafc', padding: '12px 15px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '12px', height: '12px', background: '#ff5f56', borderRadius: '50%' }}></div>
                        <div style={{ width: '12px', height: '12px', background: '#ffbd2e', borderRadius: '50%' }}></div>
                        <div style={{ width: '12px', height: '12px', background: '#27c93f', borderRadius: '50%' }}></div>
                        <span style={{ marginLeft: '10px', fontSize: '13px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Результат твоего кода</span>
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
