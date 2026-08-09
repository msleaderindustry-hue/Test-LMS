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

// ==========================================
// ХЕЛПЕРЫ БЕЗОПАСНОСТИ И ВАЛИДАЦИИ
// ==========================================

// Грубая, но полезная зачистка HTML перед dangerouslySetInnerHTML.
// Контент может прийти от ИИ (внешний прокси) — доверять ему нельзя.
const sanitizeHtml = (html) => {
    if (typeof html !== 'string') return "";
    return html
        .replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
        .replace(/\son\w+\s*=\s*"[^"]*"/gi, "")
        .replace(/\son\w+\s*=\s*'[^']*'/gi, "")
        .replace(/\son\w+\s*=\s*[^\s>]+/gi, "")
        .replace(/javascript\s*:/gi, "");
};

// Добавляет класс target-element в первый тег baseHtml,
// даже если у ИИ-сгенерированной разметки вообще нет атрибута class.
const injectTargetClass = (html) => {
    const safe = sanitizeHtml(html);
    if (!safe) return safe;
    if (/class\s*=\s*["']/.test(safe)) {
        return safe.replace(/class\s*=\s*["']/, (m) => `${m}target-element `);
    }
    return safe.replace(/^(<[a-zA-Z][a-zA-Z0-9]*)/, `$1 class="target-element"`);
};

// Проверяет и нормализует JSON, пришедший от ИИ, под конкретный режим.
// Бросает Error с понятным текстом, если структура не годится —
// в таком случае UI покажет ошибку и НЕ будет заменять текущий уровень.
const validateLevel = (mode, data) => {
    if (!data || typeof data !== 'object') throw new Error("ИИ вернул пустой или некорректный ответ");
    if (!data.title || !data.task || !Array.isArray(data.palette) || data.palette.length === 0) {
        throw new Error("В ответе ИИ не хватает title/task/palette");
    }

    if (mode === 'js') {
        let gridSize = Number(data.gridSize);
        if (!Number.isInteger(gridSize)) gridSize = 5;
        gridSize = Math.min(Math.max(gridSize, 3), 8);

        const clamp = (v, max) => Math.min(Math.max(Number.isInteger(v) ? v : 0, 0), max - 1);

        const rawStart = data.start || {};
        const rawEnd = data.end || {};
        const start = { x: clamp(rawStart.x, gridSize), y: clamp(rawStart.y, gridSize) };
        const end = { x: clamp(rawEnd.x, gridSize), y: clamp(rawEnd.y, gridSize) };
        const dir = DIRS_ORDER.includes(rawStart.dir) ? rawStart.dir : "DOWN";

        if (start.x === end.x && start.y === end.y) {
            throw new Error("Старт и финиш совпадают — уровень нерешаем");
        }

        const walls = Array.isArray(data.walls)
            ? data.walls
                .filter(w => w && Number.isInteger(w.x) && Number.isInteger(w.y) && w.x >= 0 && w.x < gridSize && w.y >= 0 && w.y < gridSize)
                .filter(w => !(w.x === start.x && w.y === start.y) && !(w.x === end.x && w.y === end.y))
            : [];

        const palette = data.palette.filter(p => p && p.id && p.label);
        const requiredIds = ['fwd', 'left', 'right'];
        if (!requiredIds.every(id => palette.some(p => p.id === id))) {
            throw new Error("В палитре не хватает базовых команд робота (fwd/left/right)");
        }

        return {
            title: String(data.title),
            task: String(data.task),
            gridSize, walls,
            start: { ...start, dir },
            end,
            palette
        };
    }

    if (mode === 'html') {
        const palette = data.palette
            .filter(p => p && p.id && p.label && typeof p.code === 'string')
            .map(p => ({ ...p, code: sanitizeHtml(p.code) }));
        const expected = Array.isArray(data.expected)
            ? data.expected.filter(id => palette.some(p => p.id === id))
            : [];
        if (palette.length < 2 || expected.length < 2) {
            throw new Error("Некорректная HTML-задача: мало блоков или expected не совпадает с palette");
        }
        return { title: String(data.title), task: String(data.task), palette, expected };
    }

    if (mode === 'css') {
        const palette = data.palette.filter(p => p && p.id && p.label && typeof p.code === 'string');
        const expected = Array.isArray(data.expected)
            ? data.expected.filter(id => palette.some(p => p.id === id))
            : [];
        const baseHtml = (typeof data.baseHtml === 'string' && data.baseHtml.trim())
            ? data.baseHtml
            : DEFAULT_LEVELS.css.baseHtml;
        if (palette.length < 2 || expected.length < 1) {
            throw new Error("Некорректная CSS-задача: мало свойств или expected пуст");
        }
        return { title: String(data.title), task: String(data.task), baseHtml, palette, expected };
    }

    throw new Error("Неизвестный режим уровня");
};

const AlgoMazeLMS = ({ onBack }) => {
    const [mode, setMode] = useState('js'); // js, html, css
    const [workspace, setWorkspace] = useState([]);
    const [level, setLevel] = useState(DEFAULT_LEVELS['js']);

    const [robot, setRobot] = useState({ ...DEFAULT_LEVELS.js.start });
    const [execStatus, setExecStatus] = useState("IDLE"); // IDLE, RUNNING, WON, CRASHED
    const [crashReason, setCrashReason] = useState(null); // "wall" | "bounds" | "incomplete" | null
    const [showWinModal, setShowWinModal] = useState(false);

    // AI
    const [topic, setTopic] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiError, setAiError] = useState("");

    const runTokenRef = useRef(0); // защита от гонок при переключении режима во время выполнения

    // Смена режима
    useEffect(() => {
        runTokenRef.current += 1; // отменяем любой идущий async-прогон
        const defaultLvl = DEFAULT_LEVELS[mode];
        setLevel(defaultLvl);
        setWorkspace([]);
        setExecStatus("IDLE");
        setCrashReason(null);
        setShowWinModal(false);
        setAiError("");
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
        if (!topic.trim() || isGenerating) return;
        setIsGenerating(true);
        setAiError("");
        setExecStatus("IDLE");
        setCrashReason(null);
        setWorkspace([]);

        let prompt = "";
        if (mode === 'js') {
            prompt = `Создай сложный лабиринт для алгоритма: "${topic}".
            Верни JSON: {"title":"Имя","task":"Задача","gridSize":6,"walls":[{"x":1,"y":1}],"start":{"x":0,"y":0,"dir":"RIGHT"},"end":{"x":5,"y":5}, "palette":[{"id":"fwd","label":"robot.moveForward();","desc":"Шаг","color":"#0ea5e9"},{"id":"left","label":"robot.turnLeft();","desc":"Влево","color":"#8b5cf6"},{"id":"right","label":"robot.turnRight();","desc":"Вправо","color":"#f59e0b"}]}
            Критично: Координаты (0 до gridSize-1). Путь должен существовать. Отвечай ТОЛЬКО валидным JSON без пояснений и markdown.`;
        } else if (mode === 'html') {
            prompt = `Создай задачу на сборку HTML: "${topic}".
            Верни JSON: {"title":"Имя","task":"Задача","expected":["id1","id2","id3"],"palette":[{"id":"id1","label":"<div class='box'>","desc":"Контейнер","code":"<div style='background:#333; padding:20px;'>\\n","color":"#3b82f6"}]}
            Критично: В palette должно быть 4-6 блоков (вперемешку). expected - правильный порядок их id. В 'code' пиши реальный HTML (с инлайн-стилями для красоты). Отвечай ТОЛЬКО валидным JSON без пояснений и markdown.`;
        } else if (mode === 'css') {
            prompt = `Создай задачу на CSS: "${topic}".
            Верни JSON: {"title":"Имя","task":"Задача","baseHtml":"<div class='target'>Текст</div>","expected":["id1","id2"],"palette":[{"id":"id1","label":"color: red;","desc":"Текст","code":"color: red;","color":"#f43f5e"}]}
            Критично: baseHtml - стартовый HTML. palette - 5-7 CSS свойств вперемешку. expected - id свойств, обязательных для победы. Отвечай ТОЛЬКО валидным JSON без пояснений и markdown.`;
        }

        try {
            const response = await fetch("https://gemini-proxy-lms.msleaderindustry.workers.dev", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });

            if (!response.ok) {
                throw new Error(`Сервер ИИ ответил ошибкой (${response.status})`);
            }

            const data = await response.json();
            const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!rawText) throw new Error("ИИ не вернул текст ответа");

            const jsonMatch = rawText.trim().match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error("Не удалось найти JSON в ответе ИИ");

            const parsed = JSON.parse(jsonMatch[0]);
            const validated = validateLevel(mode, parsed);

            setLevel(validated);
            if (mode === 'js') setRobot({ ...validated.start });
        } catch (e) {
            console.error(e);
            setAiError(e.message || "Ошибка ИИ. Попробуйте еще раз или измените формулировку темы.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleTopicKeyDown = (e) => {
        if (e.key === 'Enter' && !isGenerating) {
            e.preventDefault();
            generateAILevel();
        }
    };

    // ==========================================
    // ИНТЕРПРЕТАТОР ЛАБИРИНТА (JS)
    // ==========================================
    const executeJsMaze = async () => {
        if (workspace.length === 0) { setAiError(""); setCrashReason("empty"); return; }
        const myToken = ++runTokenRef.current;

        setExecStatus("RUNNING");
        setCrashReason(null);
        let currRobot = { ...level.start };
        setRobot(currRobot);

        const delay = (ms) => new Promise(res => setTimeout(res, ms));

        for (let i = 0; i < workspace.length; i++) {
            const block = workspace[i];
            await delay(400);
            if (runTokenRef.current !== myToken) return; // режим/уровень сменились — прерываем

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
            const hitWall = !outOfBounds && level.walls.some(w => w.x === currRobot.x && w.y === currRobot.y);

            if (outOfBounds || hitWall) {
                setExecStatus("CRASHED");
                setCrashReason(outOfBounds ? "bounds" : "wall");
                return;
            }

            // Проверка финиша
            if (currRobot.x === level.end.x && currRobot.y === level.end.y) {
                setExecStatus("WON");
                setTimeout(() => {
                    if (runTokenRef.current !== myToken) return;
                    setShowWinModal(true);
                    window.confetti && window.confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
                }, 500);
                return;
            }
        }

        // Команды кончились, но финиш не достигнут
        setExecStatus("CRASHED");
        setCrashReason("incomplete");
    };

    // ==========================================
    // УПРАВЛЕНИЕ БЛОКАМИ
    // ==========================================
    const addBlock = (b) => {
        if (execStatus === "RUNNING" || execStatus === "WON") return;
        setWorkspace([...workspace, b]);
        setCrashReason(null);
        if (execStatus === "CRASHED") setExecStatus("IDLE");
    };
    const removeBlock = (idx) => {
        if (execStatus === "RUNNING" || execStatus === "WON") return;
        setWorkspace(workspace.filter((_, i) => i !== idx));
        setCrashReason(null);
        if (execStatus === "CRASHED") setExecStatus("IDLE");
    };
    const clearWorkspace = () => {
        runTokenRef.current += 1;
        setWorkspace([]);
        setCrashReason(null);
        if (mode === 'js') { setRobot({ ...level.start }); }
        setExecStatus("IDLE");
    };

    // ==========================================
    // СТАТУС-БАННЕР (только для JS-режима)
    // ==========================================
    const renderStatusBanner = () => {
        if (mode !== 'js') return null;
        let text = null, color = null;
        if (execStatus === "CRASHED") {
            if (crashReason === "wall") { text = "💥 Робот врезался в препятствие."; color = "#ef4444"; }
            else if (crashReason === "bounds") { text = "💥 Робот выехал за пределы поля."; color = "#ef4444"; }
            else if (crashReason === "incomplete") { text = "🤔 Команды закончились, а робот не дошёл до флага."; color = "#f59e0b"; }
            else if (crashReason === "empty") { text = "Сначала собери алгоритм из блоков слева."; color = "#f59e0b"; }
        } else if (execStatus === "WON" && !showWinModal) {
            text = "🎉 Флаг достигнут!"; color = "#10b981";
        }
        if (!text) return null;
        return (
            <div style={{ marginTop: '10px', padding: '10px 14px', borderRadius: '10px', background: `${color}22`, border: `1px solid ${color}55`, color, fontSize: '13px', fontWeight: 'bold' }}>
                {text}
            </div>
        );
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
            const compiledHtml = workspace.map(b => sanitizeHtml(b.code)).join('');
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
                    <div className="preview-wrap" dangerouslySetInnerHTML={{ __html: injectTargetClass(level.baseHtml) }} />
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
                {onBack && (
                    <button type="button" onClick={onBack} style={{ background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-sec)', borderRadius: '10px', padding: '8px 16px', cursor: 'pointer', fontWeight: 'bold' }}>← Назад</button>
                )}
            </header>

            {/* ВКЛАДКИ */}
            <div style={{display: 'flex', background: 'var(--bg-panel)', borderRadius: '12px', padding: '6px', gap: '6px', marginBottom: '20px', border: '1px solid var(--glass-border)', flexWrap: 'wrap'}}>
                <button type="button" onClick={()=>setMode('js')} style={{flex: 1, minWidth: '150px', padding: '12px', borderRadius: '8px', background: mode === 'js' ? '#3b82f6' : 'transparent', color: mode==='js'?'#fff':'var(--text-sec)', border: 'none', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s'}}>🤖 Логика (JS)</button>
                <button type="button" onClick={()=>setMode('html')} style={{flex: 1, minWidth: '150px', padding: '12px', borderRadius: '8px', background: mode === 'html' ? '#f59e0b' : 'transparent', color: mode==='html'?'#fff':'var(--text-sec)', border: 'none', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s'}}>🏗️ Структура (HTML)</button>
                <button type="button" onClick={()=>setMode('css')} style={{flex: 1, minWidth: '150px', padding: '12px', borderRadius: '8px', background: mode === 'css' ? '#f43f5e' : 'transparent', color: mode==='css'?'#fff':'var(--text-sec)', border: 'none', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s'}}>🎨 Стили (CSS)</button>
            </div>

            {/* ИИ ПАНЕЛЬ */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: 'var(--bg-panel)', border: '1px solid var(--glass-border)', padding: '15px', borderRadius: '16px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        onKeyDown={handleTopicKeyDown}
                        placeholder="Попроси ИИ создать новую задачу (напр: Лабиринт-змейка или Красивая кнопка)"
                        style={{ flex: 1, minWidth: '200px', padding: '10px 15px', borderRadius: '10px', border: '1px solid var(--glass-border)', background: 'var(--bg-body)', color: 'var(--text-main)', outline: 'none' }}
                        disabled={isGenerating}
                    />
                    <Button variant="primary" onClick={generateAILevel} disabled={isGenerating || !topic.trim()} style={{ padding: '0 20px', height: '42px', background: '#3b82f6' }}>
                        {isGenerating ? "🧠 Генерируем..." : "✨ Создать"}
                    </Button>
                </div>
                {aiError && (
                    <div style={{ padding: '10px 14px', borderRadius: '10px', background: '#ef444422', border: '1px solid #ef444455', color: '#ef4444', fontSize: '13px', fontWeight: 'bold' }}>
                        ⚠️ {aiError}
                    </div>
                )}
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
                            type="button"
                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}
                            key={block.id} onClick={() => addBlock(block)}
                            disabled={execStatus === "RUNNING" || execStatus === "WON"}
                            style={{ width: '100%', textAlign: 'left', padding: '12px 15px', background: '#1e293b', border: `1px solid ${block.color}`, borderRadius: '10px', cursor: (execStatus === "RUNNING" || execStatus === "WON") ? 'not-allowed' : 'pointer', opacity: (execStatus === "RUNNING" || execStatus === "WON") ? 0.5 : 1, display: 'flex', flexDirection: 'column', gap: '4px' }}
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
                        <span style={{cursor: 'pointer', color: '#ef4444'}} onClick={clearWorkspace}>🗑️ Очистить</span>
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
                        <>
                            <Button variant="green" onClick={executeJsMaze} disabled={execStatus === "RUNNING" || execStatus === "WON"} style={{ marginTop: '15px', background: '#10b981', height: '50px', fontSize: '16px' }}>
                                ▶ ЗАПУСТИТЬ АЛГОРИТМ
                            </Button>
                            {renderStatusBanner()}
                        </>
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

                            <Button type="button" variant="primary" onClick={() => { setShowWinModal(false); clearWorkspace(); }} style={{ marginTop: '25px', width: '200px', height: '50px', fontSize: '16px', background: '#3b82f6' }}>
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
