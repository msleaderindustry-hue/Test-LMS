const { useState, useEffect } = React;
const { motion, AnimatePresence } = window.Motion;
const { Button } = window;

// ==========================================
// БАЗА УРОВНЕЙ ДЛЯ 3 ЯЗЫКОВ
// ==========================================
const LEVELS = {
    html: {
        title: "HTML: Построй карточку",
        task: "Собери структуру профиля. Порядок важен: сначала открой контейнер, затем добавь фото, затем имя, и закрой контейнер.",
        palette: [
            { id: 'div_open', label: '📦 Открыть контейнер', code: '<div class="profile">\n', color: '#3b82f6' },
            { id: 'img', label: '🖼️ Картинка профиля', code: '  <img src="avatar.png" alt="Фото">\n', color: '#0ea5e9' },
            { id: 'h2', label: '📝 Заголовок (Имя)', code: '  <h2>Алишер</h2>\n', color: '#0284c7' },
            { id: 'div_close', label: '🛑 Закрыть контейнер', code: '</div>\n', color: '#1e3a8a' }
        ],
        checkWin: (workspace) => {
            const currentIds = workspace.map(b => b.id).join(',');
            return currentIds === 'div_open,img,h2,div_close';
        }
    },
    css: {
        title: "CSS: Покрась круг",
        task: "Добавь блоки стилей, чтобы сделать элемент красным, круглым и расположить текст ровно по центру.",
        baseHtml: `<div class="target-box">JS</div>`,
        palette: [
            { id: 'bg', label: '🎨 Цвет: Красный', code: '  background-color: #ef4444;\n', color: '#f43f5e' },
            { id: 'radius', label: '⭕ Форма: Круг', code: '  border-radius: 50%;\n', color: '#e11d48' },
            { id: 'flex', label: '📦 Режим: Flex', code: '  display: flex;\n', color: '#be123c' },
            { id: 'center1', label: '↔️ Центр по горизонтали', code: '  justify-content: center;\n', color: '#9f1239' },
            { id: 'center2', label: '↕️ Центр по вертикали', code: '  align-items: center;\n', color: '#881337' }
        ],
        checkWin: (workspace) => {
            // В CSS порядок не так важен, главное собрать все 5 свойств
            return workspace.length === 5 && new Set(workspace.map(b => b.id)).size === 5;
        }
    },
    js: {
        title: "JS: Алгоритм Лабиринта",
        task: "Собери алгоритм из блоков, чтобы робот дошел до флага 🚩.",
        gridSize: 5,
        walls: [{x: 1, y: 0}, {x: 1, y: 1}, {x: 1, y: 2}, {x: 3, y: 2}, {x: 3, y: 3}, {x: 3, y: 4}],
        start: { x: 0, y: 0, dir: "DOWN" },
        end: { x: 4, y: 4 },
        palette: [
            { id: 'forward', label: '⬆️ Шаг вперед', code: 'robot.moveForward();\n', color: '#f59e0b' },
            { id: 'left', label: '↩️ Повернуть налево', code: 'robot.turnLeft();\n', color: '#d97706' },
            { id: 'right', label: '↪️ Повернуть направо', code: 'robot.turnRight();\n', color: '#b45309' }
        ],
        // JS проверяется интерпретатором, а не просто списком блоков
    }
};

const DIRS = {
    UP: { dx: 0, dy: -1, rotate: 0 },
    RIGHT: { dx: 1, dy: 0, rotate: 90 },
    DOWN: { dx: 0, dy: 1, rotate: 180 },
    LEFT: { dx: -1, dy: 0, rotate: 270 }
};

const AlgoMazeLMS = ({ onBack }) => {
    const [mode, setMode] = useState('html'); // html, css, js
    const [workspace, setWorkspace] = useState([]); // Сюда падают выбранные блоки
    
    // Состояния для JS Лабиринта
    const [robot, setRobot] = useState({ ...LEVELS.js.start });
    const [jsStatus, setJsStatus] = useState("IDLE"); // IDLE, RUNNING, CRASHED
    
    // Состояние победы (Показ финального кода)
    const [showWinModal, setShowWinModal] = useState(false);

    // Сброс при смене режима
    useEffect(() => {
        setWorkspace([]);
        setShowWinModal(false);
        if (mode === 'js') {
            setRobot({ ...LEVELS.js.start });
            setJsStatus("IDLE");
        }
    }, [mode]);

    // Проверка победы на лету (Для HTML и CSS)
    useEffect(() => {
        if (mode === 'html' || mode === 'css') {
            if (LEVELS[mode].checkWin(workspace)) {
                setTimeout(() => {
                    setShowWinModal(true);
                    window.confetti && window.confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
                }, 300);
            }
        }
    }, [workspace, mode]);

    // Управление блоками
    const addBlock = (block) => {
        if (jsStatus === "RUNNING" || showWinModal) return;
        setWorkspace([...workspace, block]);
    };

    const removeBlock = (index) => {
        if (jsStatus === "RUNNING" || showWinModal) return;
        setWorkspace(workspace.filter((_, i) => i !== index));
    };

    // ==========================================
    // ИНТЕРПРЕТАТОР ДЛЯ JS ЛАБИРИНТА
    // ==========================================
    const runJsMaze = async () => {
        if (workspace.length === 0) return alert("Добавь блоки в рабочую область!");
        setJsStatus("RUNNING");
        let currRobot = { ...LEVELS.js.start };
        setRobot(currRobot);

        const delay = (ms) => new Promise(res => setTimeout(res, ms));

        for (let i = 0; i < workspace.length; i++) {
            const block = workspace[i];
            await delay(500);

            if (block.id === "forward") {
                currRobot.x += DIRS[currRobot.dir].dx;
                currRobot.y += DIRS[currRobot.dir].dy;
            } else if (block.id === "left") {
                const order = ["UP", "LEFT", "DOWN", "RIGHT"];
                currRobot.dir = order[(order.indexOf(currRobot.dir) + 1) % 4];
            } else if (block.id === "right") {
                const order = ["UP", "RIGHT", "DOWN", "LEFT"];
                currRobot.dir = order[(order.indexOf(currRobot.dir) + 1) % 4];
            }

            setRobot({ ...currRobot });

            const isOut = currRobot.x < 0 || currRobot.y < 0 || currRobot.x >= LEVELS.js.gridSize || currRobot.y >= LEVELS.js.gridSize;
            const hitWall = LEVELS.js.walls.some(w => w.x === currRobot.x && w.y === currRobot.y);

            if (isOut || hitWall) {
                setJsStatus("CRASHED");
                return;
            }

            if (currRobot.x === LEVELS.js.end.x && currRobot.y === LEVELS.js.end.y) {
                setTimeout(() => {
                    setShowWinModal(true);
                    window.confetti && window.confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
                }, 400);
                return;
            }
        }
        setJsStatus("CRASHED");
    };

    // ==========================================
    // ГЕНЕРАТОР ИТОГОВОГО КОДА (Для Модалки)
    // ==========================================
    const generateFinalCode = () => {
        let code = "";
        if (mode === 'html') {
            code = workspace.map(b => b.code).join('');
        } else if (mode === 'css') {
            code = `.target-box {\n${workspace.map(b => b.code).join('')}}`;
        } else if (mode === 'js') {
            code = `function solveMaze(robot) {\n${workspace.map(b => "  " + b.code).join('')}}`;
        }
        return code;
    };

    // ==========================================
    // ОТРИСОВКА ВИЗУАЛЬНОГО РЕЗУЛЬТАТА
    // ==========================================
    const renderPreview = () => {
        if (mode === 'html') {
            // Для HTML просто показываем заглушку того, как это выглядит структурно
            const hasDiv = workspace.some(b => b.id === 'div_open');
            const hasImg = workspace.some(b => b.id === 'img');
            const hasH2 = workspace.some(b => b.id === 'h2');
            
            return (
                <div style={{ padding: '20px', border: hasDiv ? '2px dashed #3b82f6' : 'none', borderRadius: '12px', minHeight: '150px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                    {hasDiv && <div style={{color: '#3b82f6', fontSize: '12px', fontWeight: 'bold'}}>Контейнер</div>}
                    {hasImg && <div style={{width: '60px', height: '60px', background: '#e2e8f0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px'}}>👤</div>}
                    {hasH2 && <h2 style={{color: 'var(--text-main)', margin: 0}}>Алишер</h2>}
                </div>
            );
        } 
        else if (mode === 'css') {
            // Для CSS собираем свойства и применяем их к объекту
            const appliedStyles = workspace.reduce((acc, block) => {
                if(block.id === 'bg') acc.backgroundColor = '#ef4444';
                if(block.id === 'radius') acc.borderRadius = '50%';
                if(block.id === 'flex') acc.display = 'flex';
                if(block.id === 'center1') acc.justifyContent = 'center';
                if(block.id === 'center2') acc.alignItems = 'center';
                return acc;
            }, {});

            return (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', borderRadius: '16px' }}>
                    <div style={{ width: '100px', height: '100px', background: '#334155', color: '#fff', fontSize: '24px', fontWeight: 'bold', transition: 'all 0.4s ease', ...appliedStyles }}>
                        JS
                    </div>
                </div>
            );
        }
        else if (mode === 'js') {
            // Для JS рисуем сетку лабиринта
            let cells = [];
            for (let y = 0; y < LEVELS.js.gridSize; y++) {
                for (let x = 0; x < LEVELS.js.gridSize; x++) {
                    const isWall = LEVELS.js.walls.some(w => w.x === x && w.y === y);
                    const isEnd = LEVELS.js.end.x === x && LEVELS.js.end.y === y;
                    const isRobot = robot.x === x && robot.y === y;
                    cells.push(
                        <div key={`${x}-${y}`} style={{ width: '100%', height: '100%', background: isWall ? '#334155' : 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', borderRadius: '8px' }}>
                            {isWall && <span style={{fontSize: '20px'}}>🧱</span>}
                            {isEnd && <span style={{fontSize: '20px'}}>🚩</span>}
                            {isRobot && <motion.div animate={{ rotate: DIRS[robot.dir].rotate }} style={{ position: 'absolute', fontSize: '24px', zIndex: 10 }}>{jsStatus === "CRASHED" ? "💥" : "🤖"}</motion.div>}
                        </div>
                    );
                }
            }
            return (
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${LEVELS.js.gridSize}, 1fr)`, gridTemplateRows: `repeat(${LEVELS.js.gridSize}, 1fr)`, width: '250px', height: '250px', gap: '2px', background: 'var(--bg-panel)', padding: '10px', borderRadius: '16px' }}>
                    {cells}
                </div>
            );
        }
    };

    return (
        <motion.div 
            className="glass-panel"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ width: '100%', maxWidth: '1200px', padding: '30px', margin: '0 auto', borderRadius: '24px', position: 'relative' }}
        >
            {/* ШАПКА */}
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '20px', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 900, color: mode === 'html' ? '#3b82f6' : mode === 'css' ? '#f43f5e' : '#10b981' }}>Blockly Студия</h2>
                    <span style={{ fontSize: '10px', fontWeight: 900, background: mode === 'html' ? '#3b82f6' : mode === 'css' ? '#f43f5e' : '#10b981', color: '#ffffff', padding: '4px 10px', borderRadius: '10px', letterSpacing: '1px' }}>ВИЗУАЛЬНЫЕ БЛОКИ</span>
                </div>
            </header>

            {/* ВКЛАДКИ РЕЖИМОВ */}
            <div style={{display: 'flex', background: 'var(--bg-panel)', borderRadius: '12px', padding: '6px', gap: '6px', marginBottom: '25px', border: '1px solid var(--glass-border)', flexWrap: 'wrap'}}>
                <button onClick={()=>setMode('html')} style={{flex: 1, minWidth: '120px', padding: '12px', borderRadius: '8px', background: mode === 'html' ? '#3b82f6' : 'transparent', color: mode==='html'?'#fff':'var(--text-sec)', border: 'none', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s'}}>🌐 HTML Блоки</button>
                <button onClick={()=>setMode('css')} style={{flex: 1, minWidth: '120px', padding: '12px', borderRadius: '8px', background: mode === 'css' ? '#f43f5e' : 'transparent', color: mode==='css'?'#fff':'var(--text-sec)', border: 'none', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s'}}>🎨 CSS Блоки</button>
                <button onClick={()=>setMode('js')} style={{flex: 1, minWidth: '120px', padding: '12px', borderRadius: '8px', background: mode === 'js' ? '#10b981' : 'transparent', color: mode==='js'?'#fff':'var(--text-sec)', border: 'none', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s'}}>🤖 JS Лабиринт</button>
            </div>

            {/* ИНФО О ЗАДАЧЕ */}
            <div style={{ background: 'var(--bg-body)', padding: '20px', borderRadius: '16px', border: '1px solid var(--glass-border)', marginBottom: '20px' }}>
                <h3 style={{ margin: '0 0 10px 0', color: 'var(--text-main)', fontSize: '20px' }}>{LEVELS[mode].title}</h3>
                <p style={{ margin: 0, color: 'var(--text-sec)', fontSize: '15px', lineHeight: '1.5', fontWeight: 'bold' }}>🎯 Задание: <span style={{fontWeight: 'normal'}}>{LEVELS[mode].task}</span></p>
            </div>

            {/* 3 КОЛОНКИ: Палитра -> Рабочая зона -> Результат */}
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'stretch' }}>
                
                {/* 1. ПАЛИТРА БЛОКОВ */}
                <div style={{ flex: '1 1 250px', background: 'var(--bg-panel)', borderRadius: '16px', padding: '20px', border: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-sec)', textTransform: 'uppercase', marginBottom: '5px' }}>Доступные блоки</div>
                    {LEVELS[mode].palette.map((block) => (
                        <motion.button 
                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}
                            key={block.id} 
                            onClick={() => addBlock(block)}
                            style={{ width: '100%', textAlign: 'left', padding: '12px 15px', background: block.color, color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                        >
                            {block.label}
                        </motion.button>
                    ))}
                </div>

                {/* 2. РАБОЧАЯ ЗОНА (Алгоритм ученика) */}
                <div style={{ flex: '1 1 300px', background: '#1e293b', borderRadius: '16px', padding: '20px', border: '2px dashed #475569', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontSize: '12px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '15px', display: 'flex', justifyContent: 'space-between' }}>
                        <span>Ваша программа</span>
                        <span style={{cursor: 'pointer', color: '#ef4444'}} onClick={() => {setWorkspace([]); setRobot({...LEVELS.js.start}); setJsStatus("IDLE");}}>Очистить</span>
                    </div>
                    
                    <div className="modern-scroll" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', minHeight: '200px', overflowY: 'auto' }}>
                        <AnimatePresence>
                            {workspace.length === 0 && <div style={{textAlign: 'center', opacity: 0.5, color: '#fff', marginTop: '40px'}}>Кликай по блокам слева, чтобы собрать код 👇</div>}
                            {workspace.map((block, idx) => (
                                <motion.div 
                                    initial={{opacity: 0, x: -20}} animate={{opacity: 1, x: 0}} exit={{opacity: 0, scale: 0.8}}
                                    key={`${idx}-${block.id}`} onClick={() => removeBlock(idx)}
                                    style={{ padding: '12px 15px', background: block.color, color: '#fff', borderRadius: '10px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '14px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                                >
                                    <span>{block.label}</span>
                                    <span style={{opacity: 0.5}}>✖</span>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Кнопка запуска (Актуальна для JS, для HTML/CSS проверка автоматическая, но можно оставить для единообразия) */}
                    {mode === 'js' && (
                        <Button variant="green" onClick={runJsMaze} disabled={jsStatus === "RUNNING"} style={{ marginTop: '15px', background: '#10b981' }}>
                            ▶ ЗАПУСТИТЬ ЛАБИРИНТ
                        </Button>
                    )}
                </div>

                {/* 3. РЕЗУЛЬТАТ (Live) */}
                <div style={{ flex: '1 1 250px', background: '#fff', borderRadius: '16px', border: '3px solid var(--glass-border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <div style={{ background: '#f1f5f9', padding: '8px 15px', fontSize: '12px', fontWeight: 'bold', color: '#64748b', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <div style={{width: '10px', height: '10px', background: '#ef4444', borderRadius: '50%'}}></div><div style={{width: '10px', height: '10px', background: '#f59e0b', borderRadius: '50%'}}></div><div style={{width: '10px', height: '10px', background: '#10b981', borderRadius: '50%'}}></div>
                        <span style={{marginLeft: '10px'}}>Результат</span>
                    </div>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: mode === 'js' ? 'var(--bg-body)' : '#fff', padding: '20px' }}>
                        {renderPreview()}
                    </div>
                </div>
            </div>

            {/* МОДАЛЬНОЕ ОКНО ПОБЕДЫ (С показом настоящего кода) */}
            <AnimatePresence>
                {showWinModal && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '24px', padding: '20px' }}
                    >
                        <motion.div initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }} style={{ background: 'var(--bg-panel)', padding: '40px', borderRadius: '24px', maxWidth: '600px', width: '100%', textAlign: 'center', border: '1px solid var(--glass-border)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
                            <div style={{ fontSize: '60px', marginBottom: '10px' }}>🎉</div>
                            <h2 style={{ color: '#10b981', fontSize: '32px', margin: '0 0 10px 0' }}>Уровень пройден!</h2>
                            <p style={{ color: 'var(--text-sec)', fontSize: '16px', marginBottom: '20px' }}>Ты успешно решил задачу визуальными блоками. А вот так этот же алгоритм выглядит <b>в настоящем коде</b>:</p>
                            
                            <div style={{ background: '#0f172a', padding: '20px', borderRadius: '12px', textAlign: 'left', overflowX: 'auto', border: '1px solid #334155' }}>
                                <pre style={{ margin: 0, color: mode === 'html' ? '#38bdf8' : mode === 'css' ? '#f43f5e' : '#fba11b', fontFamily: "'Fira Code', monospace", fontSize: '15px', lineHeight: '1.5' }}>
                                    <code>{generateFinalCode()}</code>
                                </pre>
                            </div>

                            <Button variant="primary" onClick={() => {setShowWinModal(false); setWorkspace([]); if(mode==='js') setRobot({...LEVELS.js.start});}} style={{ marginTop: '25px', width: '200px', height: '50px', fontSize: '16px' }}>
                                Закрыть
                            </Button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </motion.div>
    );
};

Object.assign(window, { AlgoMazeLMS });
