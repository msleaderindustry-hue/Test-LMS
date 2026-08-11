const { useState, useEffect } = React;
const { motion, AnimatePresence } = window.Motion;
const { Button } = window;

// ==========================================
// БАЗОВЫЕ УРОВНИ (ИДЕАЛЬНЫЙ WEB-ШАБЛОН)
// ==========================================
const DEFAULT_LEVELS = {
    html: {
        title: "HTML: Карточка профиля",
        task: "Собери структуру карточки: открой контейнер, добавь аватарку, имя, кнопку и закрой контейнер.",
        hiddenCss: "body { display:flex; justify-content:center; align-items:center; height:100vh; background:transparent; font-family:sans-serif; margin:0; } .card { background:#1e293b; padding:25px; border-radius:16px; text-align:center; color:white; box-shadow:0 10px 30px rgba(0,0,0,0.5); border:1px solid #334155; width: 220px; } img { width:90px; height:90px; border-radius:50%; border:3px solid #3b82f6; margin-bottom:15px; } h3 { margin:0 0 15px 0; font-size:22px; } button { width:100%; padding:12px; background:#3b82f6; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:bold; transition:0.2s; } button:hover { background:#2563eb; }",
        palette: [
            { id: 'div_open', label: '<div class="card">', desc: 'ОТКРЫТЬ КАРТОЧКУ', color: '#3b82f6', code: '<div class="card">\n' },
            { id: 'btn', label: '<button>Подписаться</button>', desc: 'КНОПКА', color: '#ec4899', code: '  <button>Подписаться</button>\n' },
            { id: 'name', label: '<h3>Алексей</h3>', desc: 'ЗАГОЛОВОК', color: '#f59e0b', code: '  <h3>Алексей</h3>\n' },
            { id: 'div_close', label: '</div>', desc: 'ЗАКРЫТЬ КАРТОЧКУ', color: '#ef4444', code: '</div>\n' },
            { id: 'img', label: '<img src="avatar.png">', desc: 'АВАТАРКА', color: '#10b981', code: '  <img src="https://i.pravatar.cc/150?img=11" alt="Аватар" />\n' }
        ],
        expected: ['div_open', 'img', 'name', 'btn', 'div_close']
    },
    css: {
        title: "CSS: Неоновая кнопка",
        task: "Сделай кнопку крутой: добавь темный фон, зеленый текст и неоновую тень.",
        baseHtml: "<button class='target-element'>Hover me!</button>",
        hiddenCss: "body { display:flex; justify-content:center; align-items:center; height:100vh; background:transparent; margin:0; } .target-element { padding:15px 35px; font-size:18px; font-weight:bold; border:2px solid #10b981; border-radius:8px; cursor:pointer; transition:0.3s; }",
        palette: [
            { id: 'bg', label: 'background: transparent;', desc: 'ПРОЗРАЧНЫЙ ФОН', color: '#3b82f6', code: 'background: transparent;' },
            { id: 'color', label: 'color: #10b981;', desc: 'ЦВЕТ ТЕКСТА', color: '#10b981', code: 'color: #10b981;' },
            { id: 'shadow', label: 'box-shadow: 0 0 15px #10b981;', desc: 'НЕОНОВАЯ ТЕНЬ', color: '#f59e0b', code: 'box-shadow: 0 0 15px #10b981;' },
            { id: 'transform', label: 'transform: scale(1.1);', desc: 'УВЕЛИЧЕНИЕ', color: '#ec4899', code: 'transform: scale(1.1);' }
        ],
        expected: ['bg', 'color', 'shadow'] 
    },
    js: {
        title: "JS: Клик-интерактив",
        task: "Собери скрипт так, чтобы при клике на кнопку фон страницы менялся на зеленый.",
        baseHtml: "<button id='btn' style='padding:15px 30px; font-size:18px; background:#3b82f6; color:#fff; border:none; border-radius:8px; cursor:pointer; font-weight:bold; box-shadow:0 10px 20px rgba(59,130,246,0.4);'>Сменить фон</button>",
        hiddenCss: "body { display:flex; justify-content:center; align-items:center; height:100vh; background:transparent; transition:background 0.5s ease; margin:0; }",
        palette: [
            { id: 'select', label: "const btn = document.getElementById('btn');", desc: 'НАЙТИ КНОПКУ', color: '#3b82f6', code: "const btn = document.getElementById('btn');\n" },
            { id: 'close', label: "});", desc: 'ЗАКРЫТЬ ФУНКЦИЮ', color: '#ef4444', code: "});\n" },
            { id: 'action', label: "  document.body.style.background = '#10b981';", desc: 'ПОМЕНЯТЬ ФОН', color: '#10b981', code: "  document.body.style.background = '#10b981';\n" },
            { id: 'event', label: "btn.addEventListener('click', () => {", desc: 'СЛУШАТЕЛЬ КЛИКА', color: '#f59e0b', code: "btn.addEventListener('click', () => {\n" }
        ],
        expected: ['select', 'event', 'action', 'close']
    }
};

const WebBuilderLMS = ({ onBack }) => {
    const [mode, setMode] = useState('html'); // html, css, js
    const [workspace, setWorkspace] = useState([]); 
    const [level, setLevel] = useState(DEFAULT_LEVELS['html']);
    
    const [execStatus, setExecStatus] = useState("IDLE"); // IDLE, WON
    const [showWinModal, setShowWinModal] = useState(false);

    // AI
    const [topic, setTopic] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);

    // Смена режима
    useEffect(() => {
        const defaultLvl = DEFAULT_LEVELS[mode];
        setLevel(defaultLvl);
        setWorkspace([]);
        setExecStatus("IDLE");
        setShowWinModal(false);
    }, [mode]);

    // Проверка логики победы (порядок блоков)
    useEffect(() => {
        if (execStatus === "WON" || workspace.length === 0) return;

        let isWin = false;
        const currentIds = workspace.map(b => b.id).join(',');
        const expectedIds = (level.expected || []).join(',');

        if (mode === 'html' || mode === 'js') {
            isWin = (currentIds === expectedIds);
        } else if (mode === 'css') {
            const currentSet = new Set(workspace.map(b => b.id));
            const expectedList = level.expected || [];
            isWin = expectedList.length > 0 && expectedList.every(id => currentSet.has(id));
        }

        if (isWin) {
            setExecStatus("WON");
            setTimeout(() => {
                setShowWinModal(true);
                window.confetti && window.confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
            }, 500);
        }
    }, [workspace, mode, level, execStatus]);

    // ==========================================
    // ЖЕСТКИЕ ПРОМПТЫ ДЛЯ ИИ
    // ==========================================
    const generateAILevel = async () => {
        if (!topic.trim()) return alert("Введите тему задачи!");
        setIsGenerating(true);
        setExecStatus("IDLE");
        setWorkspace([]);

        let prompt = "";
        if (mode === 'html') {
            prompt = `Создай задачу-конструктор по HTML на тему: "${topic}". Верни ТОЛЬКО валидный JSON:
            {"title":"Название","task":"Описание задачи","hiddenCss":"body{background:transparent; color:#333; display:flex; justify-content:center; align-items:center; height:100vh; margin:0;} .container{background:#fff; padding:20px; border-radius:12px;}","expected":["id_open","id_text","id_close"],"palette":[{"id":"id_open","label":"<div class='container'>","desc":"ОТКРЫТЬ КОНТЕЙНЕР","code":"<div class='container'>\\n","color":"#3b82f6"},{"id":"id_close","label":"</div>","desc":"ЗАКРЫТЬ КОНТЕЙНЕР","code":"</div>\\n","color":"#ef4444"}]}
            КРИТИЧЕСКИ ВАЖНО:
            1. Ты ОБЯЗАН создавать ЗАКРЫВАЮЩИЕ ТЕГИ (</div>, </button>, </h1>) как отдельные блоки в palette! Без них структура сломается.
            2. В palette должно быть 5-7 блоков В ПЕРЕМЕШАННОМ ПОРЯДКЕ.
            3. expected должен содержать правильный порядок ID (открытие -> контент -> закрытие).`;
        } else if (mode === 'css') {
            prompt = `Создай задачу-конструктор по CSS на тему: "${topic}". Верни ТОЛЬКО валидный JSON:
            {"title":"Название","task":"Описание задачи","baseHtml":"<div class='target-element'>Текст</div>","hiddenCss":"body{background:transparent; display:flex; justify-content:center; align-items:center; height:100vh;}","expected":["id1","id2"],"palette":[{"id":"id1","label":"color: white;","desc":"ЦВЕТ ТЕКСТА","code":"color: white;","color":"#8b5cf6"}]}
            КРИТИЧНО: palette должен содержать 5-7 CSS свойств. baseHtml обязательно с классом 'target-element'. expected - ID свойств, которые ученик должен добавить.`;
        } else if (mode === 'js') {
            prompt = `Создай задачу-конструктор по JavaScript на тему: "${topic}". Верни ТОЛЬКО валидный JSON:
            {"title":"Название","task":"Описание задачи","baseHtml":"<button id='btn' style='padding:15px; border-radius:8px;'>Кликни</button>","hiddenCss":"body{background:transparent; display:flex; justify-content:center; align-items:center; height:100vh; margin:0; transition:0.3s;}","expected":["id1","id2","id3","id4"],"palette":[{"id":"id1","label":"const btn = document.getElementById('btn');","desc":"НАЙТИ КНОПКУ","code":"const btn = document.getElementById('btn');\\n","color":"#3b82f6"},{"id":"id4","label":"});","desc":"ЗАКРЫТЬ","code":"});\\n","color":"#ef4444"}]}
            КРИТИЧНО: Разбей простой скрипт (например, изменение цвета по клику, или алерт) на 4-6 логических блоков. В palette дай их В ПЕРЕМЕШАННОМ порядке. expected - правильный логический порядок ID.`;
        }

        try {
            const response = await fetch("https://gemini-proxy-lms.msleaderindustry.workers.dev", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });
            const data = await response.json();
            let rawText = data.candidates[0].content.parts[0].text.trim();
            
            const jsonMatch = rawText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error("JSON не найден");
            
            const parsed = JSON.parse(jsonMatch[0]);
            setLevel(parsed);
        } catch (e) {
            console.error("Ошибка ИИ:", e);
            alert("ИИ сгенерировал код с ошибкой. Пожалуйста, попробуйте еще раз.");
        } finally {
            setIsGenerating(false);
        }
    };

    const addBlock = (b) => {
        if (execStatus === "WON") return;
        setWorkspace([...workspace, b]);
    };
    const removeBlock = (idx) => {
        if (execStatus === "WON") return;
        setWorkspace(workspace.filter((_, i) => i !== idx));
    };

    // ==========================================
    // ПРЕДПРОСМОТР (IFRAME)
    // ==========================================
    const renderPreview = () => {
        let compiledHtml = "";
        let compiledCss = "";
        let compiledJs = "";

        const safeStyles = level.hiddenCss || `body { background: transparent; color: inherit; font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }`;

        if (mode === 'html') {
            compiledHtml = workspace.map(b => b.code).join('');
        } else if (mode === 'css') {
            compiledHtml = level.baseHtml || '';
            compiledCss = `.target-element { transition: all 0.3s ease; ${workspace.map(b => b.code).join(' ')} }`;
        } else if (mode === 'js') {
            compiledHtml = level.baseHtml || '';
            compiledJs = workspace.map(b => b.code).join('');
        }
        
        const srcDoc = `<!DOCTYPE html><html><head><style>${safeStyles} ${compiledCss}</style></head><body>${compiledHtml}<script>${compiledJs}<\/script></body></html>`;

        return (
            <iframe srcDoc={srcDoc} sandbox="allow-scripts allow-modals" style={{ width: '100%', height: '100%', border: 'none', background: 'transparent' }} />
        );
    };

    const generateFinalCode = () => {
        if (mode === 'html') return workspace.map(b => b.code).join('');
        if (mode === 'css') return `.target-element {\n${workspace.map(b => "  " + b.code).join('\n')}\n}`;
        if (mode === 'js') return `<script>\n${workspace.map(b => "  " + b.code).join('')}</script>`;
        return "";
    };

    return (
        <motion.div className="glass-panel" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%', maxWidth: '1200px', padding: '20px', margin: '0 auto', borderRadius: '16px' }}>
            
            <header style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ margin: 0, fontSize: '26px', fontWeight: 900, color: 'var(--text-main)' }}>{level?.title}</h2>
                    <span style={{ fontSize: '10px', fontWeight: 900, background: 'linear-gradient(90deg, #3b82f6, #0ea5e9)', color: '#ffffff', padding: '6px 12px', borderRadius: '10px', letterSpacing: '1px' }}>КОНСТРУКТОР САЙТОВ</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-sec)', fontSize: '14px', marginTop: '5px' }}>
                    <span style={{color: '#ef4444', fontSize: '18px'}}>🎯</span> <b style={{color: 'var(--text-main)'}}>Задача:</b> {level?.task}
                </div>
            </header>

            <div style={{display: 'flex', gap: '10px', marginBottom: '20px'}}>
                <Button variant="muted" onClick={()=>setMode('html')} style={{border: mode === 'html' ? '1px solid #0ea5e9' : '1px solid var(--glass-border)', color: mode==='html'?'#0ea5e9':'var(--text-sec)'}}>🏗️ Структура (HTML)</Button>
                <Button variant="muted" onClick={()=>setMode('css')} style={{border: mode === 'css' ? '1px solid #8b5cf6' : '1px solid var(--glass-border)', color: mode==='css'?'#8b5cf6':'var(--text-sec)'}}>🎨 Дизайн (CSS)</Button>
                <Button variant="muted" onClick={()=>setMode('js')} style={{border: mode === 'js' ? '1px solid #f59e0b' : '1px solid var(--glass-border)', color: mode==='js'?'#f59e0b':'var(--text-sec)'}}>⚡ Интерактив (JS)</Button>
            </div>

            <div style={{ display: 'flex', gap: '10px', background: 'var(--bg-body)', border: '1px solid var(--glass-border)', padding: '15px', borderRadius: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{fontSize: '20px'}}>🧠</span>
                <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Попроси ИИ создать новую задачу (напр: Кнопка лайка, Модальное окно)" style={{ flex: 1, minWidth: '200px', padding: '10px 15px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-panel)', color: 'var(--text-main)', outline: 'none' }} disabled={isGenerating} />
                <Button variant="primary" onClick={generateAILevel} disabled={isGenerating} style={{ padding: '0 20px', height: '42px', background: '#3b82f6', border: 'none', color: '#fff', fontWeight: 'bold', borderRadius: '8px' }}>{isGenerating ? "Генерируем..." : "Создать"}</Button>
            </div>

            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'stretch' }}>
                
                {/* 1. ПАЛИТРА БЛОКОВ */}
                <div style={{ flex: '1 1 250px', background: 'var(--bg-body)', borderRadius: '12px', border: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '15px', fontSize: '11px', fontWeight: 800, color: 'var(--text-sec)', textTransform: 'uppercase', borderBottom: '1px solid var(--glass-border)' }}>Доступные фрагменты кода</div>
                    <div className="modern-scroll" style={{ padding: '15px', display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', maxHeight: '450px' }}>
                        {(level?.palette || []).map((block) => (
                            <motion.button 
                                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}
                                key={block.id} onClick={() => addBlock(block)}
                                style={{ width: '100%', textAlign: 'left', padding: '12px 15px', background: 'var(--bg-panel)', border: `1px solid ${block.color}`, borderRadius: '8px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '4px' }}
                            >
                                <span style={{ fontSize: '10px', color: block.color, fontWeight: 'bold', textTransform: 'uppercase' }}>{block.desc}</span>
                                <span style={{ fontSize: '13px', color: 'var(--text-main)', fontFamily: 'monospace', fontWeight: 'bold' }}>{block.label}</span>
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* 2. РАБОЧАЯ ЗОНА */}
                <div style={{ flex: '1 1 350px', background: 'var(--bg-body)', borderRadius: '12px', border: '1px dashed var(--glass-border)', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)' }}>
                        <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-sec)', textTransform: 'uppercase' }}>Среда сборки</span>
                        <span style={{cursor: 'pointer', color: '#ef4444', fontSize: '12px', fontWeight: 'bold'}} onClick={() => {setWorkspace([]); setExecStatus("IDLE");}}>🗑️ ОЧИСТИТЬ</span>
                    </div>
                    
                    <div className="modern-scroll" style={{ flex: 1, padding: '15px', display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto' }}>
                        <AnimatePresence>
                            {workspace.length === 0 && <div style={{textAlign: 'center', color: 'var(--text-sec)', marginTop: '40px', fontWeight: 'bold', fontSize: '14px'}}>Кликай по фрагментам слева, чтобы собрать код 👇</div>}
                            {workspace.map((block, idx) => (
                                <motion.div 
                                    initial={{opacity: 0, scale: 0.9}} animate={{opacity: 1, scale: 1}} exit={{opacity: 0, scale: 0.9}}
                                    key={`${idx}-${block.id}`} onClick={() => removeBlock(idx)}
                                    style={{ padding: '12px 15px', background: 'var(--bg-panel)', border: `1px solid ${block.color}`, borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                >
                                    <span style={{fontFamily: 'monospace', fontSize: '13px', color: 'var(--text-main)', fontWeight: 'bold'}}>{block.label}</span>
                                    <span style={{color: 'var(--text-sec)', fontSize: '14px'}}>✖</span>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>

                {/* 3. РЕЗУЛЬТАТ */}
                <div style={{ flex: '1 1 250px', background: 'var(--bg-body)', borderRadius: '12px', border: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <div style={{ background: 'var(--bg-panel)', padding: '8px 15px', display: 'flex', alignItems: 'center', gap: '6px', borderBottom: '1px solid var(--glass-border)' }}>
                        <div style={{width: 10, height: 10, borderRadius: '50%', background: '#ef4444'}}></div>
                        <div style={{width: 10, height: 10, borderRadius: '50%', background: '#f59e0b'}}></div>
                        <div style={{width: 10, height: 10, borderRadius: '50%', background: '#10b981'}}></div>
                        <span style={{marginLeft: 10, fontSize: 12, fontWeight: 'bold', color: 'var(--text-sec)'}}>Live Preview</span>
                    </div>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-body)' }}>
                        {renderPreview()}
                    </div>
                </div>
            </div>

            {/* МОДАЛКА ПОБЕДЫ */}
            <AnimatePresence>
                {showWinModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'absolute', inset: 0, background: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(5px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '16px' }}>
                        <motion.div initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }} style={{ background: 'var(--bg-panel)', padding: '40px', borderRadius: '24px', maxWidth: '600px', width: '100%', textAlign: 'center', border: '1px solid var(--glass-border)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
                            <div style={{ fontSize: '60px', marginBottom: '10px' }}>🎉</div>
                            <h2 style={{ color: '#10b981', fontSize: '32px', margin: '0 0 10px 0' }}>Идеально!</h2>
                            <p style={{ color: 'var(--text-sec)', fontSize: '16px', marginBottom: '20px' }}>Ты собрал рабочий код визуально. А вот так это выглядит <b>в настоящем редакторе</b>:</p>
                            <div style={{ background: 'var(--bg-body)', padding: '20px', borderRadius: '12px', textAlign: 'left', overflowX: 'auto', border: '1px solid var(--glass-border)' }}>
                                <pre style={{ margin: 0, color: mode === 'html' ? '#38bdf8' : mode === 'css' ? '#f43f5e' : '#fba11b', fontFamily: "'Fira Code', monospace", fontSize: '14px', lineHeight: '1.5' }}><code>{generateFinalCode()}</code></pre>
                            </div>
                            <Button variant="primary" onClick={() => {setShowWinModal(false); setWorkspace([]); setExecStatus("IDLE");}} style={{ marginTop: '25px', width: '200px', height: '50px', fontSize: '16px', background: '#3b82f6' }}>Продолжить</Button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

Object.assign(window, { WebBuilderLMS });
