const { useState, useEffect } = React;
const { motion } = window.Motion;
const { Button } = window;

const CodePlayground = ({ onBack }) => {
    const [activeTab, setActiveTab] = useState('html');
    
    // Стартовый веселый код для ребенка
    const [htmlCode, setHtmlCode] = useState('<h1>Привет, я юный программист! 🚀</h1>\n<p>Это мой первый настоящий сайт.</p>\n<button onclick="sayHello()">Нажми меня!</button>');
    const [cssCode, setCssCode] = useState('body {\n  font-family: Arial, sans-serif;\n  background: #f0fdf4;\n  text-align: center;\n  padding: 20px;\n}\n\nh1 {\n  color: #0ea5e9;\n}\n\nbutton {\n  background: #10b981;\n  color: white;\n  border: none;\n  padding: 10px 20px;\n  font-size: 18px;\n  border-radius: 10px;\n  cursor: pointer;\n}\n\nbutton:hover {\n  background: #059669;\n  transform: scale(1.1);\n}');
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
        }, 350); // Небольшая задержка, чтобы не компилировать на каждую букву
        return () => clearTimeout(timeout);
    }, [htmlCode, cssCode, jsCode]);

    return (
        <motion.div 
            className="glass-panel"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5 }}
            style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '20px', padding: '30px' }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '15px' }}>
                <Button variant="muted" onClick={onBack} style={{width: 'fit-content', padding: '0 20px', height: '40px', minHeight: '40px'}}>⬅ В меню</Button>
                <h2 style={{margin: 0, fontSize: '28px', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
                    Code School 💻
                </h2>
            </div>

            <div style={{ display: 'flex', gap: '20px', height: '600px' }}>
                {/* ЛЕВАЯ ЧАСТЬ - РЕДАКТОР */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', background: 'rgba(0,0,0,0.2)', borderRadius: '16px', padding: '15px', border: '1px solid var(--glass-border)' }}>
                    
                    {/* Переключатель вкладок */}
                    <div style={{ display: 'flex', gap: '10px', background: 'rgba(0,0,0,0.3)', padding: '5px', borderRadius: '12px' }}>
                        <button 
                            onClick={() => setActiveTab('html')}
                            style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', transition: '0.3s', background: activeTab === 'html' ? '#e34c26' : 'transparent', color: activeTab === 'html' ? '#fff' : 'var(--text-sec)' }}
                        >HTML (Каркас)</button>
                        <button 
                            onClick={() => setActiveTab('css')}
                            style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', transition: '0.3s', background: activeTab === 'css' ? '#264de4' : 'transparent', color: activeTab === 'css' ? '#fff' : 'var(--text-sec)' }}
                        >CSS (Красота)</button>
                        <button 
                            onClick={() => setActiveTab('js')}
                            style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', transition: '0.3s', background: activeTab === 'js' ? '#f0db4f' : 'transparent', color: activeTab === 'js' ? '#333' : 'var(--text-sec)' }}
                        >JS (Магия)</button>
                    </div>

                    {/* Поля ввода */}
                    {activeTab === 'html' && (
                        <textarea 
                            value={htmlCode} onChange={(e) => setHtmlCode(e.target.value)}
                            style={{ flex: 1, background: '#1e1e1e', color: '#e34c26', fontFamily: 'monospace', fontSize: '16px', padding: '15px', borderRadius: '10px', border: 'none', resize: 'none', outline: 'none' }}
                            spellCheck="false"
                        />
                    )}
                    {activeTab === 'css' && (
                        <textarea 
                            value={cssCode} onChange={(e) => setCssCode(e.target.value)}
                            style={{ flex: 1, background: '#1e1e1e', color: '#264de4', fontFamily: 'monospace', fontSize: '16px', padding: '15px', borderRadius: '10px', border: 'none', resize: 'none', outline: 'none' }}
                            spellCheck="false"
                        />
                    )}
                    {activeTab === 'js' && (
                        <textarea 
                            value={jsCode} onChange={(e) => setJsCode(e.target.value)}
                            style={{ flex: 1, background: '#1e1e1e', color: '#f0db4f', fontFamily: 'monospace', fontSize: '16px', padding: '15px', borderRadius: '10px', border: 'none', resize: 'none', outline: 'none' }}
                            spellCheck="false"
                        />
                    )}
                </div>

                {/* ПРАВАЯ ЧАСТЬ - РЕЗУЛЬТАТ */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', background: '#fff', borderRadius: '16px', overflow: 'hidden', border: '4px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ background: '#ddd', padding: '10px 15px', color: '#333', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ display: 'inline-block', width: '12px', height: '12px', background: '#ff5f56', borderRadius: '50%' }}></span>
                        <span style={{ display: 'inline-block', width: '12px', height: '12px', background: '#ffbd2e', borderRadius: '50%' }}></span>
                        <span style={{ display: 'inline-block', width: '12px', height: '12px', background: '#27c93f', borderRadius: '50%' }}></span>
                        <span style={{ marginLeft: '10px', fontSize: '14px', opacity: 0.7 }}>Результат твоего кода:</span>
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
