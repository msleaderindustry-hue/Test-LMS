const { useState, useEffect } = React;
const { motion } = window.Motion;

const CodePlayground = () => {
    const [activeTab, setActiveTab] = useState('html');
    
    // Стартовый веселый код для ребенка
    const [htmlCode, setHtmlCode] = useState('<h1>Привет, я юный программист! 🚀</h1>\n<p>Это мой первый настоящий сайт.</p>\n<button onclick="sayHello()">Нажми меня!</button>');
    const [cssCode, setCssCode] = useState('body {\n  font-family: Arial, sans-serif;\n  background: #f0fdf4;\n  text-align: center;\n  padding: 20px;\n}\n\nh1 {\n  color: #0ea5e9;\n}\n\nbutton {\n  background: #10b981;\n  color: white;\n  border: none;\n  padding: 12px 24px;\n  font-size: 18px;\n  border-radius: 12px;\n  cursor: pointer;\n  transition: 0.3s;\n  box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);\n}\n\nbutton:hover {\n  background: #059669;\n  transform: scale(1.05);\n}');
    const [jsCode, setJsCode] = useState('function sayHello() {\n  alert("Ура! Ты написал свой первый скрипт! 🎉");\n}');
    
    const [srcDoc, setSrcDoc] = useState('');

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
            style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '20px', padding: '30px' }}
        >
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '20px', marginBottom: '10px' }}>
                <h2 style={{margin: 0, fontSize: '32px', fontWeight: '800', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'flex', alignItems: 'center', gap: '10px'}}>
                    Code School 💻
                </h2>
            </div>

            <div style={{ display: 'flex', gap: '25px', height: '65vh', minHeight: '500px' }}>
                {/* ЛЕВАЯ ЧАСТЬ - ПРОФЕССИОНАЛЬНЫЙ РЕДАКТОР */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#1e1e2e', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 15px 35px rgba(0,0,0,0.2)' }}>
                    
                    {/* Переключатель вкладок */}
                    <div style={{ display: 'flex', background: '#181825', padding: '10px 10px 0 10px' }}>
                        <button onClick={() => setActiveTab('html')} style={tabStyle(activeTab === 'html', '#e34c26')}>HTML (Каркас)</button>
                        <button onClick={() => setActiveTab('css')} style={tabStyle(activeTab === 'css', '#264de4')}>CSS (Красота)</button>
                        <button onClick={() => setActiveTab('js')} style={tabStyle(activeTab === 'js', '#d4b830')}>JS (Магия)</button>
                    </div>

                    {/* Поля ввода */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
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
