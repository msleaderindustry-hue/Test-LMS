const { useState, useEffect } = React;
const { motion, AnimatePresence } = window.Motion;
const { Button } = window;

// ==========================================
// КООРДИНАТЫ И ВЕКТОРЫ ДВИЖЕНИЯ (JS ЛАБИРИНТ)
// ==========================================
const MOVES = {
    UP:    { dx: 0,  dy: -1, rotate: 0 },
    RIGHT: { dx: 1,  dy: 0,  rotate: 90 },
    DOWN:  { dx: 0,  dy: 1,  rotate: 180 },
    LEFT:  { dx: -1, dy: 0,  rotate: -90 }
};
const DIRS_ORDER = ["UP", "RIGHT", "DOWN", "LEFT"];

// ==========================================
// БАЗОВЫЕ УРОВНИ (ИДЕАЛЬНЫЙ ШАБЛОН)
// ==========================================
const DEFAULT_LEVELS = {
    js: {
        title: "JS: Змейка",
        task: "Пройдите сложный лабиринт, используя команды движения и поворотов, чтобы добраться до финиша.",
        gridSize: 5,
        walls: [{x: 1, y: 0}, {x: 1, y: 1}, {x: 1, y: 2}, {x: 3, y: 2}, {x: 3, y: 3}, {x: 3, y: 4}],
        start: { x: 0, y: 0, dir: "DOWN" },
        end: { x: 4, y: 4 },
        palette: [
            { id: 'fwd', label: 'robot.moveForward();', desc: 'ШАГ', color: '#0ea5e9' },
            { id: 'left', label: 'robot.turnLeft();', desc: 'ВЛЕВО', color: '#8b5cf6' },
            { id: 'right', label: 'robot.turnRight();', desc: 'ВПРАВО', color: '#f59e0b' }
        ]
    },
    html: {
        title: "HTML: Сборка карточки",
        task: "Соберите HTML-структуру карточки. Не забудьте открыть контейнер в начале и закрыть его в конце!",
        hiddenCss: `body { font-family: sans-serif; background: #0f172a; margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; color: #fff; } .card { background: #1e293b; width: 280px; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5); border: 1px solid #334155; } .photo { width: 100%; height: auto; display: block; } .content { padding: 20px; } h3 { margin: 0 0 10px 0; font-size: 20px; } p { color: #94a3b8; font-size: 14px; margin: 0 0 20px 0; line-height: 1.5; } .buy { width: 100%; padding: 12px; border-radius: 8px; background: #6366f1; color: #fff; border: none; font-weight: bold; cursor: pointer; }`,
        palette: [
            { id: 'h3', label: '<h3 class="title">Товар</h3>', desc: 'ЗАГОЛОВОК', color: '#0ea5e9', code: '  <h3 class="title">Товар</h3>\n' },
            { id: 'div_close', label: '</div>', desc: 'ЗАКРЫТЬ КОНТЕЙНЕР', color: '#ef4444', code: '</div>\n' },
            { id: 'div_open', label: '<div class="card">', desc: 'ОТКРЫТЬ КОНТЕЙНЕР', color: '#3b82f6', code: '<div class="card">\n' },
            { id: 'btn', label: '<button class="buy">Купить</button>', desc: 'КНОПКА', color: '#10b981', code: '  <button class="buy">Купить</button>\n' }
        ],
        expected: ['div_open', 'h3', 'btn', 'div_close']
    },
    css: {
        title: "CSS: Стилизация кнопки",
        task: "Добавьте стили, чтобы кнопка стала зеленой, с белым текстом и без рамок.",
        baseHtml: `<button class="target-btn">Отправить</button>`,
        hiddenCss: `body { font-family: sans-serif; background: #0f172a; margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; } .target-btn { transition: all 0.3s ease; font-weight: bold; font-size: 18px; border: 2px dashed #475569; padding: 10px; color: #94a3b8; }`,
        palette: [
            { id: 'color', label: 'color: #ffffff;', desc: 'ЦВЕТ ТЕКСТА', color: '#8b5cf6', code: 'color: #ffffff;' },
            { id: 'bg', label: 'background: #10b981;', desc: 'ЦВЕТ ФОНА', color: '#10b981', code: 'background: #10b981;' },
            { id: 'padding', label: 'padding: 12px 24px;', desc: 'ВНУТРЕННИЕ ОТСТУПЫ', color: '#f59e0b', code: 'padding: 12px 24px;' },
            { id: 'border', label: 'border: none;', desc: 'УБРАТЬ РАМКУ', color: '#ef4444', code: 'border: none;' }
        ],
        expected: ['bg', 'color', 'border'] 
    }
};

const AlgoMazeLMS = ({ onBack }) => {
    const [mode, setMode] = useState('js'); 
    const [workspace, setWorkspace] = useState([]); 
    const [level, setLevel] = useState(DEFAULT_LEVELS['js']);
    
    const [robot, setRobot] = useState({ ...DEFAULT_LEVELS.js.start });
    const [execStatus, setExecStatus] = useState("IDLE"); 
    const [showWinModal, setShowWinModal] = useState(false);

    // AI
    const [topic, setTopic] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        const defaultLvl = DEFAULT_LEVELS[mode];
        setLevel(defaultLvl);
        setWorkspace([]);
        setExecStatus("IDLE");
        setShowWinModal(false);
        if (mode === 'js') setRobot({ ...defaultLvl.start });
    }, [mode]);

    useEffect(() => {
        if (mode === 'js' || execStatus === "WON" || workspace.length === 0) return;

        let isWin = false;
        if (mode === 'html') {
            const currentIds = workspace.map(b => b.id).join(',');
            const expectedIds = (level.expected || []).join(',');
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
    // ЖЕСТКИЕ ПРОМПТЫ ДЛЯ ИИ (ИСПРАВЛЕНО)
    // ==========================================
    const generateAILevel = async () => {
        if (!topic.trim()) return alert("Введите тему задачи!");
        setIsGenerating(true);
        setExecStatus("IDLE");
        setWorkspace([]);

        let prompt = "";
        if (mode === 'js') {
            prompt = `Создай уровень лабиринта: "${topic}". Верни ТОЛЬКО валидный JSON:
            {"title":"Название","task":"Задача","gridSize":6,"walls":[{"x":1,"y":1}],"start":{"x":0,"y":0,"dir":"RIGHT"},"end":{"x":5,"y":5},"palette":[{"id":"fwd","label":"robot.moveForward();","desc":"ШАГ","color":"#0ea5e9"},{"id":"left","label":"robot.turnLeft();","desc":"ВЛЕВО","color":"#8b5cf6"},{"id":"right","label":"robot.turnRight();","desc":"ВПРАВО","color":"#f59e0b"}]}
            КРИТИЧНО: Лабиринт ДОЛЖЕН БЫТЬ ПРОХОДИМЫМ. Координаты от 0 до gridSize-1.`;
        } else if (mode === 'html') {
            prompt = `Создай задачу по сборке HTML: "${topic}". Верни ТОЛЬКО валидный JSON:
            {"title":"Название","task":"Собери структуру.","hiddenCss":"body{background:#0f172a; color:#fff; display:flex; justify-content:center; align-items:center; height:100vh; margin:0;} .container{background:#1e293b; padding:20px; border-radius:12px;}","expected":["id_open","id_title","id_close"],"palette":[{"id":"id_open","label":"<div class='container'>","desc":"ОТКРЫТЬ БЛОК","code":"<div class='container'>\\n","color":"#3b82f6"}]}
            КРИТИЧЕСКИЕ ПРАВИЛА:
            1. Ты ОБЯЗАН добавлять ЗАКРЫВАЮЩИЕ ТЕГИ (</div>, </p>, </b>, </button>) как ОТДЕЛЬНЫЕ элементы в массиве palette! Это самое важное правило!
            2. Используй ОДИНАРНЫЕ кавычки для атрибутов (class='...').
            3. Сделай 6-8 блоков в palette в ПЕРЕМЕШАННОМ порядке.
            4. expected - правильный порядок ID.`;
        } else if (mode === 'css') {
            prompt = `Создай задачу по CSS: "${topic}". Верни ТОЛЬКО валидный JSON:
            {"title":"Название","task":"Задача","baseHtml":"<div class='target-element'>Текст</div>","hiddenCss":"body{background:#0f172a; display:flex; justify-content:center; align-items:center; height:100vh;}","expected":["id1","id2"],"palette":[{"id":"id1","label":"color: white;","desc":"ЦВЕТ ТЕКСТА","code":"color: white;","color":"#8b5cf6"}]}
            КРИТИЧНО: palette должен содержать 5-7 CSS свойств. baseHtml используй с классом 'target-element'.`;
        }

        try {
            console.log("Запрос к ИИ...");
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
            if (mode === 'js') setRobot({ ...parsed.start });
        } catch (e) {
            console.error("Ошибка ИИ:", e);
            alert("ИИ сгенерировал код с ошибкой формата. Попробуйте еще раз!");
        } finally {
            setIsGenerating(false);
        }
    };

    const executeJsMaze = async () => {
        if (workspace.length === 0) return alert("Собери алгоритм!");
        setExecStatus("RUNNING");
        let currRobot = { ...(level.start || {x:0, y:0, dir:'RIGHT'}) };
        setRobot(currRobot);

        const gridSize = level.gridSize || 5;
        const walls = level.walls || [];
        const end = level.end || {x: gridSize-1, y: gridSize-1};

        const delay = (ms) => new Promise(res => setTimeout(res, ms));

        for (let i = 0; i < workspace.length; i++) {
            const block = workspace[i];
            await delay(400);

            if (block.id === 'fwd') {
                currRobot.x += MOVES[currRobot.dir].dx;
                currRobot.y += MOVES[currRobot.dir].dy;
            } else if (block.id === 'left') {
                currRobot.dir = DIRS_ORDER[(DIRS_ORDER.indexOf(currRobot.dir) + 3) % 4]; 
            } else if (block.id === 'right') {
                currRobot.dir = DIRS_ORDER[(DIRS_ORDER.indexOf(currRobot.dir) + 1) % 4];
            }

            setRobot({ ...currRobot });

            const outOfBounds = currRobot.x < 0 || currRobot.y < 0 || currRobot.x >= gridSize || currRobot.y >= gridSize;
            const hitWall = walls.some(w => w.x === currRobot.x && w.y === currRobot.y);

            if (outOfBounds || hitWall) {
                setExecStatus("CRASHED");
                return;
            }

            if (currRobot.x === end.x && currRobot.y === end.y) {
                setExecStatus("WON");
                setTimeout(() => {
                    setShowWinModal(true);
                    window.confetti && window.confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
                }, 500);
                return;
            }
        }
        setExecStatus("CRASHED"); 
    };

    const addBlock = (b) => {
        if (execStatus === "RUNNING" || execStatus === "WON") return;
        setWorkspace([...workspace, b]);
    };
    const removeBlock = (idx) => {
        if (execStatus === "RUNNING" || execStatus === "WON") return;
        setWorkspace(workspace.filter((_, i) => i !== idx));
    };

    const renderPreview = () => {
        if (mode === 'js') {
            const size = level.gridSize || 5;
            const walls = level.walls || [];
            const end = level.end || {x: size-1, y: size-1};

            let cells = [];
            for (let y = 0; y < size; y++) {
                for (let x = 0; x < size; x++) {
                    const isWall = walls.some(w => w.x === x && w.y === y);
                    const isEnd = end.x === x && end.y === y;
                    const isRobot = robot.x === x && robot.y === y;
                    cells.push(
                        <div key={`${x}-${y}`} style={{ width: '100%', height: '100%', background: isWall ? 'rgba(255,255,255,0.05)' : 'transparent', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                            {isWall && <span style={{fontSize: '20px'}}>🧱</span>}
                            {isEnd && <span style={{fontSize: '20px', color: '#ef4444'}}>🚩</span>}
                            {isRobot && <motion.animate animate={{ rotate: MOVES[robot.dir].rotate }} style={{ position: 'absolute', fontSize: '28px', zIndex: 10 }}>{execStatus === "CRASHED" ? "💥" : "🤖"}</motion.animate>}
                        </div>
                    );
                }
            }
            return (
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${size}, 1fr)`, gridTemplateRows: `repeat(${size}, 1fr)`, width: '250px', height: '250px', background: '#0f172a', borderRadius: '12px', overflow: 'hidden' }}>
                    {cells}
                </div>
            );
        }

        const compiledHtml = mode === 'html' ? workspace.map(b => b.code).join('') : (level.baseHtml || '');
        const compiledCss = mode === 'css' ? `.target-element { ${workspace.map(b => b.code).join(' ')} }` : '';
        const safeStyles = level.hiddenCss || `body { background: #0f172a; color: #fff; font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }`;
        
        const srcDoc = `<!DOCTYPE html><html><head><style>${safeStyles} ${compiledCss}</style></head><body>${compiledHtml}</body></html>`;

        return (
            <iframe srcDoc={srcDoc} sandbox="allow-scripts" style={{ width: '100%', height: '100%', border: 'none', background: '#0f172a' }} />
        );
    };

    const generateFinalCode = () => {
        if (mode === 'html') return workspace.map(b => b.code).join('');
        if (mode === 'css') return `.element {\n${workspace.map(b => "  " + b.code).join('\n')}\n}`;
        if (mode === 'js') return `function runRobot() {\n${workspace.map(b => "  " + b.label).join('\n')}\n}`;
        return "";
    };

    return (
        <motion.div className="glass-panel" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%', maxWidth: '1200px', padding: '20px', margin: '0 auto', borderRadius: '16px', background: '#1e293b' }}>
            
            <header style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '20px' }}>
                <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 900, color: '#f8fafc' }}>{level?.title}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '14px' }}>
                    <span style={{color: '#ef4444'}}>🎯</span> <b>Задача:</b> {level?.task}
                </div>
            </header>

            <div style={{display: 'flex', gap: '10px', marginBottom: '20px'}}>
                <Button variant="muted" onClick={()=>setMode('js')} style={{border: mode === 'js' ? '1px solid #3b82f6' : '1px solid #334155', color: mode==='js'?'#3b82f6':'#94a3b8'}}>JS Лабиринт</Button>
                <Button variant="muted" onClick={()=>setMode('html')} style={{border: mode === 'html' ? '1px solid #0ea5e9' : '1px solid #334155', color: mode==='html'?'#0ea5e9':'#94a3b8'}}>HTML Блоки</Button>
                <Button variant="muted" onClick={()=>setMode('css')} style={{border: mode === 'css' ? '1px solid #8b5cf6' : '1px solid #334155', color: mode==='css'?'#8b5cf6':'#94a3b8'}}>CSS Стили</Button>
            </div>

            <div style={{ display: 'flex', gap: '10px', background: '#0f172a', border: '1px solid #3b82f6', padding: '15px', borderRadius: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{fontSize: '20px'}}>🤖</span>
                <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Попроси ИИ создать новую задачу (напр: Кнопка покупки)" style={{ flex: 1, minWidth: '200px', padding: '10px 15px', borderRadius: '8px', border: '1px solid #334155', background: '#1e293b', color: '#f8fafc', outline: 'none' }} disabled={isGenerating} />
                <Button variant="primary" onClick={generateAILevel} disabled={isGenerating} style={{ padding: '0 20px', height: '42px', background: '#3b82f6', border: 'none', color: '#fff', fontWeight: 'bold', borderRadius: '8px' }}>{isGenerating ? "Генерируем..." : "Создать"}</Button>
            </div>

            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'stretch' }}>
                
                {/* 1. ПАЛИТРА БЛОКОВ */}
                <div style={{ flex: '1 1 250px', background: '#0f172a', borderRadius: '12px', border: '1px solid #1e293b', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '15px', fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', borderBottom: '1px solid #1e293b' }}>Доступные фрагменты</div>
                    <div className="modern-scroll" style={{ padding: '15px', display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', maxHeight: '400px' }}>
                        {(level?.palette || []).map((block) => (
                            <motion.div 
                                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}
                                key={block.id} onClick={() => addBlock(block)}
                                style={{ width: '100%', padding: '12px 15px', background: '#1e293b', border: `1px solid ${block.color}`, borderRadius: '8px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '4px' }}
                            >
                                <span style={{ fontSize: '10px', color: block.color, fontWeight: 'bold', textTransform: 'uppercase' }}>{block.desc}</span>
                                <span style={{ fontSize: '13px', color: '#f8fafc', fontFamily: 'monospace', fontWeight: 'bold' }}>{block.label}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* 2. РАБОЧАЯ ЗОНА */}
                <div style={{ flex: '1 1 350px', background: '#0f172a', borderRadius: '12px', border: '1px dashed #334155', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b' }}>
                        <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Среда сборки</span>
                        <span style={{cursor: 'pointer', color: '#ef4444', fontSize: '12px', fontWeight: 'bold'}} onClick={() => {setWorkspace([]); if(mode==='js'){setRobot({...level.start}); setExecStatus("IDLE");}}}>🗑️ ОЧИСТИТЬ</span>
                    </div>
                    
                    <div className="modern-scroll" style={{ flex: 1, padding: '15px', display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto' }}>
                        <AnimatePresence>
                            {workspace.length === 0 && <div style={{textAlign: 'center', color: '#475569', marginTop: '40px', fontWeight: 'bold', fontSize: '14px'}}>Кликай по фрагментам слева, чтобы собрать код 👇</div>}
                            {workspace.map((block, idx) => (
                                <motion.div 
                                    initial={{opacity: 0, scale: 0.9}} animate={{opacity: 1, scale: 1}} exit={{opacity: 0, scale: 0.9}}
                                    key={`${idx}-${block.id}`} onClick={() => removeBlock(idx)}
                                    style={{ padding: '12px 15px', background: '#1e293b', border: `1px solid ${block.color}`, borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                >
                                    <span style={{fontFamily: 'monospace', fontSize: '13px', color: '#f8fafc', fontWeight: 'bold'}}>{block.label}</span>
                                    <span style={{color: '#64748b', fontSize: '14px'}}>✖</span>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {mode === 'js' && (
                        <div style={{ padding: '15px', borderTop: '1px solid #1e293b' }}>
                            <Button variant="green" onClick={executeJsMaze} disabled={execStatus === "RUNNING"} style={{ width: '100%', background: '#10b981', height: '44px', fontSize: '14px', borderRadius: '8px' }}>
                                ▶ ЗАПУСТИТЬ АЛГОРИТМ
                            </Button>
                        </div>
                    )}
                </div>

                {/* 3. РЕЗУЛЬТАТ */}
                <div style={{ flex: '1 1 250px', background: '#0f172a', borderRadius: '12px', border: '1px solid #334155', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <div style={{ background: '#f8fafc', padding: '10px 15px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{width: 10, height: 10, borderRadius: '50%', background: '#ef4444'}}></div>
                        <div style={{width: 10, height: 10, borderRadius: '50%', background: '#f59e0b'}}></div>
                        <div style={{width: 10, height: 10, borderRadius: '50%', background: '#10b981'}}></div>
                        <span style={{marginLeft: 10, fontSize: 12, fontWeight: 'bold', color: '#475569'}}>Live Preview</span>
                    </div>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a' }}>
                        {renderPreview()}
                    </div>
                </div>
            </div>

            {/* МОДАЛКА ПОБЕДЫ */}
            <AnimatePresence>
                {showWinModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(5px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '16px' }}>
                        <motion.div initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }} style={{ background: '#1e293b', padding: '40px', borderRadius: '24px', maxWidth: '600px', width: '100%', textAlign: 'center', border: '1px solid #334155', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
                            <div style={{ fontSize: '60px', marginBottom: '10px' }}>🎉</div>
                            <h2 style={{ color: '#10b981', fontSize: '32px', margin: '0 0 10px 0' }}>Идеально!</h2>
                            <p style={{ color: '#cbd5e1', fontSize: '16px', marginBottom: '20px' }}>Ты собрал логику визуально. А вот так это выглядит <b>в настоящем коде</b>:</p>
                            <div style={{ background: '#0f172a', padding: '20px', borderRadius: '12px', textAlign: 'left', overflowX: 'auto', border: '1px solid #334155' }}>
                                <pre style={{ margin: 0, color: mode === 'html' ? '#38bdf8' : mode === 'css' ? '#f43f5e' : '#fba11b', fontFamily: "'Fira Code', monospace", fontSize: '14px', lineHeight: '1.5' }}><code>{generateFinalCode()}</code></pre>
                            </div>
                            <Button variant="primary" onClick={() => {setShowWinModal(false); setWorkspace([]); if(mode==='js') {setRobot({...level.start}); setExecStatus("IDLE");}}} style={{ marginTop: '25px', width: '200px', height: '50px', fontSize: '16px', background: '#3b82f6' }}>Продолжить</Button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

Object.assign(window, { AlgoMazeLMS });
