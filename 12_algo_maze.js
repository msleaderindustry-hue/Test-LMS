const { useState, useEffect, useRef } = React;
const { motion, AnimatePresence } = window.Motion;
const { Button } = window;

// ==========================================
// НАСТРОЙКИ КООРДИНАТ (ДЛЯ ЛАБИРИНТА)
// ==========================================
// Точная математика осей: [0,0] - левый верхний угол.
const MOVES = {
    UP:    { dx: 0,  dy: -1, rotate: 0 },
    RIGHT: { dx: 1,  dy: 0,  rotate: 90 },
    DOWN:  { dx: 0,  dy: 1,  rotate: 180 },
    LEFT:  { dx: -1, dy: 0,  rotate: -90 }
};
const DIRS_ORDER = ["UP", "RIGHT", "DOWN", "LEFT"];

// ==========================================
// СТАРТОВЫЕ БАЗЫ (ПОКА ИИ НЕ СГЕНЕРИРОВАЛ НОВОЕ)
// ==========================================
const DEFAULT_LEVELS = {
    js: {
        title: "JS: Основы алгоритма",
        task: "Построй маршрут так, чтобы алгоритм довел робота до флага, обойдя препятствия.",
        gridSize: 5,
        walls: [{x: 1, y: 0}, {x: 1, y: 1}, {x: 1, y: 2}, {x: 3, y: 2}, {x: 3, y: 3}, {x: 3, y: 4}],
        start: { x: 0, y: 0, dir: "DOWN" },
        end: { x: 4, y: 4 },
        palette: [
            { id: 'fwd', label: 'robot.moveForward();', desc: 'Шаг вперед', color: '#0ea5e9' },
            { id: 'left', label: 'robot.turnLeft();', desc: 'Поворот налево', color: '#8b5cf6' },
            { id: 'right', label: 'robot.turnRight();', desc: 'Поворот направо', color: '#f59e0b' }
        ]
    },
    html: {
        title: "HTML: Сборка DOM",
        task: "Собери структуру карточки пользователя. Открой контейнер, добавь картинку, заголовок и закрой контейнер.",
        palette: [
            { id: 'div_close', label: '</div>', desc: 'Закрывающий тег', color: '#475569', code: '</div>\n' },
            { id: 'img', label: '<img src="avatar.png" />', desc: 'Изображение', color: '#10b981', code: '  <img src="avatar.png" style="width:50px; border-radius:50%;" />\n' },
            { id: 'div_open', label: '<div class="card">', desc: 'Начало контейнера', color: '#3b82f6', code: '<div style="padding:15px; background:#1e293b; border-radius:10px; border:1px solid #334155; text-align:center;">\n' },
            { id: 'h3', label: '<h3>Иван Иванов</h3>', desc: 'Заголовок', color: '#f43f5e', code: '  <h3 style="color:#fff; margin:10px 0 0 0;">Иван Иванов</h3>\n' }
        ],
        expected: ['div_open', 'img', 'h3', 'div_close']
    },
    css: {
        title: "CSS: Визуализация",
        task: "Настрой стили для кнопки: добавь синий фон, белый текст и скругленные углы.",
        baseHtml: `<button class="target-btn">Кнопка</button>`,
        palette: [
            { id: 'color', label: 'color: white;', desc: 'Цвет текста', color: '#8b5cf6', code: 'color: white;' },
            { id: 'bg', label: 'background: #3b82f6;', desc: 'Цвет фона', color: '#3b82f6', code: 'background: #3b82f6;' },
            { id: 'border', label: 'border: none;', desc: 'Убрать рамку', color: '#64748b', code: 'border: none;' },
            { id: 'radius', label: 'border-radius: 8px;', desc: 'Скругление', color: '#10b981', code: 'border-radius: 8px;' },
            { id: 'padding', label: 'padding: 10px 20px;', desc: 'Отступы', color: '#f59e0b', code: 'padding: 10px 20px;' }
        ],
        expected: ['bg', 'color', 'radius'] // Проверяем, что хотя бы эти 3 есть
    }
};

const AlgoMazeLMS = ({ onBack }) => {
    const [mode, setMode] = useState('js'); // js, html, css
    const [workspace, setWorkspace] = useState([]); 
    const [level, setLevel] = useState(DEFAULT_LEVELS['js']);
    
    const [robot, setRobot] = useState({ ...DEFAULT_LEVELS.js.start });
    const [execStatus, setExecStatus] = useState("IDLE"); // IDLE, RUNNING, WON, CRASHED
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
        if (mode === 'js') setRobot({ ...defaultLvl.start });
    }, [mode]);

    // Проверка победы (HTML / CSS) в реальном времени
    useEffect(() => {
        if (mode === 'js' || execStatus === "WON" || workspace.length === 0) return;

        let isWin = false;
        if (mode === 'html') {
            const currentIds = workspace.map(b => b.id).join(',');
            const expectedIds = level.expected.join(',');
            isWin = (currentIds === expectedIds);
        } else if (mode === 'css') {
            const currentSet = new Set(workspace.map(b => b.id));
            isWin = level.expected.every(id => currentSet.has(id));
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
    // ГЕНЕРАТОР ИИ (ТРИ РАЗНЫХ ПРОМПТА)
    // ==========================================
    const generateAILevel = async () => {
        if (!topic.trim()) return alert("Введите тему задачи!");
        setIsGenerating(true);
        setExecStatus("IDLE");
        setWorkspace([]);

        let prompt = "";
        if (mode === 'js') {
            prompt = `Создай сложный лабиринт для алгоритма: "${topic}".
            Верни JSON: {"title":"Имя","task":"Задача","gridSize":6,"walls":[{"x":1,"y":1}],"start":{"x":0,"y":0,"dir":"RIGHT"},"end":{"x":5,"y":5}, "palette":[{"id":"fwd","label":"robot.moveForward();","desc":"Шаг","color":"#0ea5e9"},{"id":"left","label":"robot.turnLeft();","desc":"Влево","color":"#8b5cf6"},{"id":"right","label":"robot.turnRight();","desc":"Вправо","color":"#f59e0b"}]}
            Критично: Координаты (0 до gridSize-1). Путь должен существовать.`;
        } else if (mode === 'html') {
            prompt = `Создай задачу на сборку HTML: "${topic}".
            Верни JSON: {"title":"Имя","task":"Задача","expected":["id1","id2","id3"],"palette":[{"id":"id1","label":"<div class='box'>","desc":"Контейнер","code":"<div style='background:#333; padding:20px;'>\\n","color":"#3b82f6"}]}
            Критично: В palette должно быть 4-6 блоков (вперемешку). expected - правильный порядок их id. В 'code' пиши реальный HTML (с инлайн-стилями для красоты).`;
        } else if (mode === 'css') {
            prompt = `Создай задачу на CSS: "${topic}".
            Верни JSON: {"title":"Имя","task":"Задача","baseHtml":"<div class='target'>Текст</div>","expected":["id1","id2"],"palette":[{"id":"id1","label":"color: red;","desc":"Текст","code":"color: red;","color":"#f43f5e"}]}
            Критично: baseHtml - стартовый HTML. palette - 5-7 CSS свойств вперемешку. expected - id свойств, обязательных для победы.`;
        }

        try {
            const response = await fetch("https://gemini-proxy-lms.msleaderindustry.workers.dev", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });
            const data = await response.json();
            const jsonMatch = data.candidates[0].content.parts[0].text.trim().match(/\{[\s\S]*\}/);
            const parsed = JSON.parse(jsonMatch[0]);
            
            setLevel(parsed);
            if (mode === 'js') setRobot({ ...parsed.start });
        } catch (e) {
            console.error(e);
            alert("Ошибка ИИ. Попробуйте еще раз.");
        } finally {
            setIsGenerating(false);
        }
    };

    // ==========================================
    // ИНТЕРПРЕТАТОР ЛАБИРИНТА (JS)
    // ==========================================
    const executeJsMaze = async () => {
        if (workspace.length === 0) return alert("Собери алгоритм!");
        setExecStatus("RUNNING");
        let currRobot = { ...level.start };
        setRobot(currRobot);

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

            // Проверка коллизий
            const outOfBounds = currRobot.x < 0 || currRobot.y < 0 || currRobot.x >= level.gridSize || currRobot.y >= level.gridSize;
            const hitWall = level.walls.some(w => w.x === currRobot.x && w.y === currRobot.y);

            if (outOfBounds || hitWall) {
                setExecStatus("CRASHED");
                return;
            }

            // Проверка финиша
            if (currRobot.x === level.end.x && currRobot.y === level.end.y) {
                setExecStatus("WON");
                setTimeout(() => {
                    setShowWinModal(true);
                    window.confetti && window.confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
                }, 500);
                return;
            }
        }
        setExecStatus("CRASHED"); // Команды кончились, но финиш не достигнут
    };

    // ==========================================
    // УПРАВЛЕНИЕ БЛОКАМИ
    // ==========================================
    const addBlock = (b) => {
        if (execStatus === "RUNNING" || execStatus === "WON") return;
        setWorkspace([...workspace, b]);
    };
    const removeBlock = (idx) => {
        if (execStatus === "RUNNING" || execStatus === "WON") return;
        setWorkspace(workspace.filter((_, i) => i !== idx));
    };

    // ==========================================
    // РЕНДЕР ПРЕВЬЮ
    // ==========================================
    const renderPreview = () => {
        if (mode === 'js') {
            let cells = [];
            for (let y = 0; y < level.gridSize; y++) {
                for (let x = 0; x < level.gridSize; x++) {
                    const isWall = level.walls.some(w => w.x === x && w.y === y);
                    const isEnd = level.end.x === x && level.end.y === y;
                    const isRobot = robot.x === x && robot.y === y;
                    cells.push(
                        <div key={`${x}-${y}`} style={{ width: '100%', height: '100%', background: isWall ? '#334155' : 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', borderRadius: '6px' }}>
                            {isWall && <span style={{fontSize: '20px'}}>🧱</span>}
                            {isEnd && <span style={{fontSize: '20px'}}>🚩</span>}
                            {isRobot && <motion.div animate={{ rotate: MOVES[robot.dir].rotate }} style={{ position: 'absolute', fontSize: '26px', zIndex: 10 }}>{execStatus === "CRASHED" ? "💥" : "🤖"}</motion.div>}
                        </div>
                    );
                }
            }
            return (
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${level.gridSize}, 1fr)`, gridTemplateRows: `repeat(${level.gridSize}, 1fr)`, width: '250px', height: '250px', gap: '2px', background: '#0f172a', padding: '10px', borderRadius: '12px' }}>
                    {cells}
                </div>
            );
        }

        if (mode === 'html') {
            const compiledHtml = workspace.map(b => b.code).join('');
            return (
                <div style={{ width: '100%', padding: '20px', background: '#0f172a', borderRadius: '12px', minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div dangerouslySetInnerHTML={{ __html: compiledHtml }} />
                </div>
            );
        }

        if (mode === 'css') {
            const compiledCss = workspace.map(b => b.code).join(' ');
            return (
                <div style={{ width: '100%', padding: '20px', background: '#0f172a', borderRadius: '12px', minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                    <style>{`
                        .preview-wrap .target-element { 
                            transition: all 0.3s ease; 
                            padding: 10px; background: #334155; color: #fff; border-radius: 4px; /* Default */
                            ${compiledCss} 
                        }
                    `}</style>
                    <div className="preview-wrap" dangerouslySetInnerHTML={{ __html: level.baseHtml.replace(/class=["']/g, `class="target-element `) }} />
                </div>
            );
        }
    };

    return (
        <motion.div className="glass-panel" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%', maxWidth: '1200px', padding: '30px', margin: '0 auto', borderRadius: '24px', position: 'relative' }}>
            
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '20px', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 900, color: '#3b82f6' }}>Visual Builder</h2>
                    <span style={{ fontSize: '10px', fontWeight: 900, background: 'linear-gradient(90deg, #3b82f6, #0ea5e9)', color: '#ffffff', padding: '4px 10px', borderRadius: '10px', letterSpacing: '1px' }}>КОНСТРУКТОР БЕЗ КОДА</span>
                </div>
            </header>

            {/* ВКЛАДКИ */}
            <div style={{display: 'flex', background: 'var(--bg-panel)', borderRadius: '12px', padding: '6px', gap: '6px', marginBottom: '20px', border: '1px solid var(--glass-border)', flexWrap: 'wrap'}}>
                <button onClick={()=>setMode('js')} style={{flex: 1, minWidth: '150px', padding: '12px', borderRadius: '8px', background: mode === 'js' ? '#3b82f6' : 'transparent', color: mode==='js'?'#fff':'var(--text-sec)', border: 'none', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s'}}>🤖 Логика (JS)</button>
                <button onClick={()=>setMode('html')} style={{flex: 1, minWidth: '150px', padding: '12px', borderRadius: '8px', background: mode === 'html' ? '#f59e0b' : 'transparent', color: mode==='html'?'#fff':'var(--text-sec)', border: 'none', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s'}}>🏗️ Структура (HTML)</button>
                <button onClick={()=>setMode('css')} style={{flex: 1, minWidth: '150px', padding: '12px', borderRadius: '8px', background: mode === 'css' ? '#f43f5e' : 'transparent', color: mode==='css'?'#fff':'var(--text-sec)', border: 'none', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s'}}>🎨 Стили (CSS)</button>
            </div>

            {/* ИИ ПАНЕЛЬ */}
            <div style={{ display: 'flex', gap: '10px', background: 'var(--bg-panel)', border: '1px solid var(--glass-border)', padding: '15px', borderRadius: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Попроси ИИ создать новую задачу (напр: Лабиринт-змейка или Красивая кнопка)" style={{ flex: 1, minWidth: '200px', padding: '10px 15px', borderRadius: '10px', border: '1px solid var(--glass-border)', background: 'var(--bg-body)', color: 'var(--text-main)', outline: 'none' }} disabled={isGenerating} />
                <Button variant="primary" onClick={generateAILevel} disabled={isGenerating} style={{ padding: '0 20px', height: '42px', background: '#3b82f6' }}>{isGenerating ? "🧠 Генерируем..." : "✨ Создать"}</Button>
            </div>

            <div style={{ background: 'var(--bg-body)', padding: '20px', borderRadius: '16px', border: '1px solid var(--glass-border)', marginBottom: '20px' }}>
                <h3 style={{ margin: '0 0 10px 0', color: 'var(--text-main)', fontSize: '20px' }}>{level.title}</h3>
                <p style={{ margin: 0, color: 'var(--text-sec)', fontSize: '15px', lineHeight: '1.5', fontWeight: 'bold' }}>🎯 Задача: <span style={{fontWeight: 'normal'}}>{level.task}</span></p>
            </div>

            {/* ТРИ КОЛОНКИ: Блоки -> Сборка -> Результат */}
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'stretch' }}>
                
                {/* 1. ПАЛИТРА БЛОКОВ */}
                <div style={{ flex: '1 1 250px', background: 'var(--bg-panel)', borderRadius: '16px', padding: '20px', border: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-sec)', textTransform: 'uppercase', marginBottom: '10px' }}>Доступные фрагменты</div>
                    {level.palette.map((block) => (
                        <motion.button 
                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}
                            key={block.id} onClick={() => addBlock(block)}
                            style={{ width: '100%', textAlign: 'left', padding: '12px 15px', background: '#1e293b', border: `1px solid ${block.color}`, borderRadius: '10px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '4px' }}
                        >
                            <span style={{ fontSize: '11px', color: block.color, fontWeight: 'bold', textTransform: 'uppercase' }}>{block.desc}</span>
                            <span style={{ fontSize: '14px', color: '#e2e8f0', fontFamily: 'monospace', fontWeight: 'bold' }}>{block.label}</span>
                        </motion.button>
                    ))}
                </div>

                {/* 2. РАБОЧАЯ ЗОНА (Сборка) */}
                <div style={{ flex: '1 1 350px', background: '#0f172a', borderRadius: '16px', padding: '20px', border: '2px dashed #334155', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontSize: '12px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '15px', display: 'flex', justifyContent: 'space-between' }}>
                        <span>Среда сборки</span>
                        <span style={{cursor: 'pointer', color: '#ef4444'}} onClick={() => {setWorkspace([]); if(mode==='js'){setRobot({...level.start}); setExecStatus("IDLE");}}}>🗑️ Очистить</span>
                    </div>
                    
                    <div className="modern-scroll" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', minHeight: '200px', overflowY: 'auto' }}>
                        <AnimatePresence>
                            {workspace.length === 0 && <div style={{textAlign: 'center', color: '#64748b', marginTop: '40px', fontWeight: 'bold'}}>Кликай по фрагментам слева, чтобы собрать код 👇</div>}
                            {workspace.map((block, idx) => (
                                <motion.div 
                                    initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, scale: 0.9}}
                                    key={`${idx}-${block.id}`} onClick={() => removeBlock(idx)}
                                    style={{ padding: '12px 15px', background: block.color, color: '#fff', borderRadius: '10px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.2)' }}
                                >
                                    <span style={{fontFamily: 'monospace', fontSize: '14px', fontWeight: 'bold'}}>{block.label}</span>
                                    <span style={{opacity: 0.6, fontSize: '12px'}}>✖</span>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {mode === 'js' && (
                        <Button variant="green" onClick={executeJsMaze} disabled={execStatus === "RUNNING"} style={{ marginTop: '15px', background: '#10b981', height: '50px', fontSize: '16px' }}>
                            ▶ ЗАПУСТИТЬ АЛГОРИТМ
                        </Button>
                    )}
                </div>

                {/* 3. РЕЗУЛЬТАТ (Live) */}
                <div style={{ flex: '1 1 250px', background: '#fff', borderRadius: '16px', border: '3px solid var(--glass-border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <div style={{ background: '#f1f5f9', padding: '8px 15px', fontSize: '12px', fontWeight: 'bold', color: '#64748b', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <div style={{width: '10px', height: '10px', background: '#ef4444', borderRadius: '50%'}}></div><div style={{width: '10px', height: '10px', background: '#f59e0b', borderRadius: '50%'}}></div><div style={{width: '10px', height: '10px', background: '#10b981', borderRadius: '50%'}}></div>
                        <span style={{marginLeft: '10px'}}>Live Preview</span>
                    </div>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: mode === 'js' ? '#1e293b' : '#fff', padding: '20px' }}>
                        {renderPreview()}
                    </div>
                </div>
            </div>

            {/* МОДАЛЬНОЕ ОКНО ПОБЕДЫ */}
            <AnimatePresence>
                {showWinModal && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '24px', padding: '20px' }}
                    >
                        <motion.div initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }} style={{ background: 'var(--bg-panel)', padding: '40px', borderRadius: '24px', maxWidth: '600px', width: '100%', textAlign: 'center', border: '1px solid var(--glass-border)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
                            <div style={{ fontSize: '60px', marginBottom: '10px' }}>🎉</div>
                            <h2 style={{ color: '#10b981', fontSize: '32px', margin: '0 0 10px 0' }}>Идеально!</h2>
                            <p style={{ color: 'var(--text-sec)', fontSize: '16px', marginBottom: '20px' }}>Ты собрал логику визуально. А вот так это выглядит <b>в настоящем коде</b>:</p>
                            
                            <div style={{ background: '#0f172a', padding: '20px', borderRadius: '12px', textAlign: 'left', overflowX: 'auto', border: '1px solid #334155' }}>
                                <pre style={{ margin: 0, color: mode === 'html' ? '#38bdf8' : mode === 'css' ? '#f43f5e' : '#fba11b', fontFamily: "'Fira Code', monospace", fontSize: '15px', lineHeight: '1.5' }}>
                                    <code>
                                        {mode === 'html' ? workspace.map(b => b.code).join('') : mode === 'css' ? `.element {\n${workspace.map(b => "  " + b.code).join('\n')}\n}` : `function runRobot() {\n${workspace.map(b => "  " + b.label).join('\n')}\n}`}
                                    </code>
                                </pre>
                            </div>

                            <Button variant="primary" onClick={() => {setShowWinModal(false); setWorkspace([]); if(mode==='js') {setRobot({...level.start}); setExecStatus("IDLE");}}} style={{ marginTop: '25px', width: '200px', height: '50px', fontSize: '16px', background: '#3b82f6' }}>
                                Продолжить
                            </Button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

Object.assign(window, { AlgoMazeLMS });
