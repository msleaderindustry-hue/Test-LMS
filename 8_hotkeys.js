/**
 * HotkeyTrainer
 * ---------------------------------------------------------------------------
 */
(function () {
    const { useState, useEffect, useRef } = React;
    const { motion, AnimatePresence } = window.Motion;
    const { shuffleArray } = window; // Button убран, используем кастомные кнопки под макет

    const SHIFT_SYMBOL_MAP = {
        '1': '!', '2': '@', '3': '#', '4': '$', '5': '%',
        '6': '^', '7': '&', '8': '*', '9': '(', '0': ')',
        '-': '_', '=': '+', '[': '{', ']': '}', '\\': '|',
        ';': ':', "'": '"', ',': '<', '.': '>', '/': '?', '`': '~'
    };

    const HOTKEYS_DB = [
        { descKey: "undo", key: "z", shift: false, visual: "Ctrl + Z", icon: "↺", color: "#a855f7" },
        { descKey: "copy", key: "c", shift: false, visual: "Ctrl + C", icon: "⎘", color: "#14b8a6" },
        { descKey: "print", key: "p", shift: false, visual: "Ctrl + P", icon: "🖨", color: "#d946ef" },
        { descKey: "selectAll", key: "a", shift: false, visual: "Ctrl + A", icon: "A", color: "#22c55e" },
        { descKey: "paste", key: "v", shift: false, visual: "Ctrl + V", icon: "📋", color: "#3b82f6" },
        { descKey: "findReplace", key: "h", shift: false, visual: "Ctrl + H", icon: "⌕", color: "#f43f5e" },
        { descKey: "cut", key: "x", shift: false, visual: "Ctrl + X", icon: "✂", color: "#eab308" },
        { descKey: "find", key: "f", shift: false, visual: "Ctrl + F", icon: "🔍", color: "#0ea5e9" }
    ];

    const HOTKEY_DESC_TRANSLATIONS = {
        ru: {
            undo: "Отменить последнее действие",
            copy: "Копировать выделенный фрагмент в буфер обмена",
            print: "Открыть диалоговое окно печати",
            selectAll: "Выделить весь текст документа",
            paste: "Вставить содержимое буфера обмена",
            findReplace: "Открыть диалоговое окно замены",
            cut: "Вырезать выделенный фрагмент в буфер обмена",
            find: "Открыть диалоговое окно поиска"
        },
        en: {
            undo: "Undo the last action",
            copy: "Copy selected fragment to clipboard",
            print: "Open print dialog",
            selectAll: "Select all text in document",
            paste: "Paste clipboard contents",
            findReplace: "Open replace dialog",
            cut: "Cut selected fragment to clipboard",
            find: "Open search dialog"
        },
        uz: {
            undo: "Охирги амални бекор қилиш",
            copy: "Ажратилган қисмни буферга нусхалаш",
            print: "Босиб чиқаришни очиш",
            selectAll: "Барча матнни танлаш",
            paste: "Буфердагини қўйиш",
            findReplace: "Алмаштириш ойнасини очиш",
            cut: "Матнни кесиб олиш",
            find: "Қидириш ойнасини очиш"
        }
    };

    const UI_TRANSLATIONS = {
        ru: {
            title: "Хоткеи",
            aiPowered: "AI POWERED",
            subtitleHighlight: "Тренируй стандартную базу из твоих конспектов (Word, Система) ",
            subtitleRest: "или создай персональную для любой другой программы",
            customPanelLabel: "СВОЯ БАЗА ДЛЯ ДРУГОЙ ПРОГРАММЫ",
            generateButton: "Создать базу",
            generating: "Ищем...",
            startTraining: "НАЧАТЬ ТРЕНИРОВКУ",
            theoryStep: "ШАГ 1 ИЗ 2",
            theoryTitle: "Теория: ",
            theoryDesc: "Изучи комбинации, которые встретятся в этой тренировке, а затем закрепи их на практике.",
            exit: "ВЫЙТИ",
            goToPractice: "ПЕРЕЙТИ К ПРАКТИКЕ →",
            doCombination: "ВЫПОЛНИТЕ КОМБИНАЦИЮ",
            finishedTitle: "Отличная работа!",
            repeat: "Пройти ещё раз",
            errorNoTopic: "Сначала введи название программы"
        }
    };

    // Алиасы для других языков (чтобы код был короче, здесь копируем RU структуру, но в реале добавь переводы)
    UI_TRANSLATIONS.en = { ...UI_TRANSLATIONS.ru, title: "Hotkeys", exit: "EXIT", goToPractice: "GO TO PRACTICE →" };
    UI_TRANSLATIONS.uz = { ...UI_TRANSLATIONS.ru, title: "Хоткейлар", exit: "ЧИҚИШ" };

    const LANGS = ["ru", "en", "uz"];
    const LANG_LABEL = { ru: "РУС", en: "ENG", uz: "ЎЗБ" };

    // --- Общие стили ---
    const colors = {
        bgApp: '#0e1015',
        bgPanel: '#15171f',
        border: 'rgba(255,255,255,0.06)',
        purple: '#7c3aed',
        purpleLight: '#8b5cf6',
        textMain: '#ffffff',
        textMuted: '#94a3b8',
        gradientPrimary: 'linear-gradient(90deg, #fcd34d 0%, #f97316 50%, #f43f5e 100%)',
        gradientText: 'linear-gradient(90deg, #fcd34d 0%, #f97316 100%)'
    };

    const LanguageSwitcher = ({ lang, onChange }) => (
        <div style={{ display: 'flex', gap: '8px' }}>
            {LANGS.map((code) => {
                const active = lang === code;
                return (
                    <button
                        key={code}
                        onClick={() => onChange(code)}
                        style={{
                            width: '42px', height: '42px', borderRadius: '50%',
                            background: active ? colors.purple : 'transparent',
                            border: active ? 'none' : `1px solid ${colors.border}`,
                            color: active ? '#fff' : colors.textMuted,
                            fontSize: '11px', fontWeight: '700', cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        {LANG_LABEL[code]}
                    </button>
                );
            })}
        </div>
    );

    const HotkeyTrainer = ({ onBack }) => {
        const [tasks, setTasks] = useState([]);
        const [currentIndex, setCurrentIndex] = useState(0);
        const [score, setScore] = useState(0);
        const [phase, setPhase] = useState('setup'); // 'setup', 'theory', 'practice'
        const [lang, setLang] = useState('ru');
        const [topic, setTopic] = useState("Microsoft Word");
        const [activeHotkeys, setActiveHotkeys] = useState(HOTKEYS_DB);
        const [isGenerating, setIsGenerating] = useState(false);

        const t = UI_TRANSLATIONS[lang];

        const getDesc = (hk) => {
            if (hk.descKey) return HOTKEY_DESC_TRANSLATIONS[lang]?.[hk.descKey] || hk.descKey;
            return hk.desc || '—';
        };

        const openTheory = () => {
            setTasks(shuffleArray([...activeHotkeys]).slice(0, 10));
            setCurrentIndex(0);
            setPhase('theory');
        };

        const startGame = () => setPhase('practice');
        const leaveGame = () => setPhase('setup');

        // Обработчик клавиш (упрощен для примера, логика из твоего оригинала)
        useEffect(() => {
            if (phase !== 'practice') return;
            const handleKeyDown = (e) => {
                if (e.key === 'Escape') return leaveGame();
                if (e.key === "Control" || e.key === "Shift") return;
                
                const isCtrlOrCmd = e.ctrlKey || e.metaKey;
                const currentTask = tasks[currentIndex];
                if (!currentTask || !isCtrlOrCmd) return;

                e.preventDefault();
                const expectedKey = currentTask.key.toLowerCase();
                const pressedKey = e.key.toLowerCase();
                
                if (pressedKey === expectedKey) {
                    if (currentIndex < tasks.length - 1) {
                        setCurrentIndex(prev => prev + 1);
                    } else {
                        // Финиш (можно добавить экран финиша)
                        leaveGame(); 
                    }
                }
            };
            window.addEventListener("keydown", handleKeyDown, { passive: false });
            return () => window.removeEventListener("keydown", handleKeyDown);
        }, [currentIndex, tasks, phase]);

        // === ЭКРАН 1: SETUP ===
        if (phase === 'setup') {
            return (
                <div style={{ background: colors.bgApp, padding: '40px', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: 'sans-serif' }}>
                    <div style={{ background: colors.bgPanel, width: '100%', maxWidth: '600px', borderRadius: '24px', padding: '40px', border: `1px solid ${colors.border}`, position: 'relative', overflow: 'hidden' }}>
                        
                        {/* Свечение на фоне */}
                        <div style={{ position: 'absolute', top: '-150px', left: '-150px', width: '300px', height: '300px', background: colors.purple, filter: 'blur(120px)', opacity: 0.15 }} />

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', position: 'relative' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{ width: '48px', height: '48px', background: colors.gradientPrimary, borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '24px' }}>⚡</div>
                                <h1 style={{ color: '#fff', fontSize: '28px', margin: 0, fontWeight: 800 }}>{t.title}</h1>
                                <span style={{ background: colors.purpleLight, color: '#fff', fontSize: '10px', padding: '4px 10px', borderRadius: '100px', fontWeight: 800, letterSpacing: '0.5px' }}>{t.aiPowered}</span>
                            </div>
                            <LanguageSwitcher lang={lang} onChange={setLang} />
                        </div>

                        <h2 style={{ fontSize: '24px', lineHeight: '1.4', fontWeight: 600, marginBottom: '40px' }}>
                            <span style={{ background: colors.gradientText, WebkitBackgroundClip: 'text', color: 'transparent' }}>{t.subtitleHighlight}</span>
                            <span style={{ color: '#fff' }}>{t.subtitleRest}</span>
                        </h2>

                        <div style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${colors.border}`, borderRadius: '16px', padding: '24px', marginBottom: '32px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: colors.purple }} />
                                <span style={{ color: colors.textMuted, fontSize: '11px', fontWeight: 700, letterSpacing: '1px' }}>{t.customPanelLabel}</span>
                            </div>
                            
                            <div style={{ display: 'flex', gap: '16px' }}>
                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.2)', border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '0 16px' }}>
                                    <div style={{ background: '#2563eb', color: '#fff', width: '24px', height: '24px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', marginRight: '12px' }}>W</div>
                                    <input 
                                        type="text" 
                                        value={topic} 
                                        onChange={(e) => setTopic(e.target.value)}
                                        style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '15px', outline: 'none', width: '100%', padding: '16px 0' }}
                                    />
                                    <span style={{ color: colors.textMuted }}>⌄</span>
                                </div>
                                <button style={{ background: colors.purpleLight, color: '#fff', border: 'none', borderRadius: '12px', padding: '0 24px', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>
                                    {t.generateButton}
                                </button>
                            </div>
                        </div>

                        <button onClick={openTheory} style={{ width: '100%', padding: '20px', background: colors.gradientPrimary, border: 'none', borderRadius: '12px', color: '#000', fontSize: '16px', fontWeight: 800, cursor: 'pointer', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                            🚀 {t.startTraining}
                        </button>
                    </div>
                </div>
            );
        }

        // === ЭКРАН 2: THEORY ===
        if (phase === 'theory') {
            return (
                <div style={{ background: colors.bgApp, padding: '40px', minHeight: '100vh', display: 'flex', justifyContent: 'center', fontFamily: 'sans-serif' }}>
                    <div style={{ background: colors.bgPanel, width: '100%', maxWidth: '900px', borderRadius: '24px', padding: '40px', border: `1px solid ${colors.border}` }}>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                            <button onClick={leaveGame} style={{ background: 'transparent', border: 'none', color: colors.textMuted, cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                ← Выйти
                            </button>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '16px' }}>
                                <LanguageSwitcher lang={lang} onChange={setLang} />
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '10px', color: colors.textMuted, fontWeight: 700, letterSpacing: '1px', marginBottom: '8px' }}>{t.theoryStep}</div>
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                        <div style={{ width: '40px', height: '4px', background: colors.purple, borderRadius: '2px' }} />
                                        <div style={{ width: '40px', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ marginBottom: '40px' }}>
                            <h2 style={{ fontSize: '28px', color: '#fff', margin: '0 0 12px 0', fontWeight: 700 }}>
                                {t.theoryTitle} <span style={{ color: colors.purpleLight }}>{topic}</span>
                            </h2>
                            <p style={{ color: colors.textMuted, fontSize: '15px', maxWidth: '500px', lineHeight: '1.5', margin: 0 }}>
                                {t.theoryDesc}
                            </p>
                        </div>

                        {/* Сетка карточек 2 колонки */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '40px' }}>
                            {tasks.map((hk, i) => (
                                <div key={i} style={{ background: 'rgba(0,0,0,0.2)', border: `1px solid ${colors.border}`, borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `${hk.color || colors.purple}1A`, display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '20px', color: hk.color || colors.purple }}>
                                        {hk.icon || '⌘'}
                                    </div>
                                    <div>
                                        <div style={{ color: '#fff', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>{getDesc(hk)}</div>
                                        <div style={{ display: 'inline-block', background: '#1e293b', color: '#38bdf8', fontSize: '12px', fontWeight: 700, padding: '4px 10px', borderRadius: '6px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                                            {hk.visual}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <button onClick={leaveGame} style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', border: 'none', borderRadius: '12px', padding: '16px 32px', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>
                                {t.exit}
                            </button>
                            <button onClick={startGame} style={{ background: colors.gradientPrimary, color: '#000', border: 'none', borderRadius: '12px', padding: '16px 32px', fontSize: '14px', fontWeight: 800, cursor: 'pointer' }}>
                                {t.goToPractice}
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        // === ЭКРАН 3: PRACTICE ===
        const currentTask = tasks[currentIndex];
        return (
            <div style={{ background: colors.bgApp, padding: '40px', minHeight: '100vh', display: 'flex', justifyContent: 'center', fontFamily: 'sans-serif' }}>
                <div style={{ background: colors.bgPanel, width: '100%', maxWidth: '900px', borderRadius: '24px', padding: '40px', border: `1px solid ${colors.border}`, display: 'flex', flexDirection: 'column' }}>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '60px' }}>
                        <button onClick={leaveGame} style={{ background: 'transparent', border: 'none', color: colors.textMuted, cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            ← Выйти
                        </button>
                        <h2 style={{ fontSize: '20px', color: '#fff', margin: 0, fontWeight: 700 }}>
                            Хоткеи: <span style={{ color: colors.purpleLight }}>{topic}</span>
                        </h2>
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px 16px', borderRadius: '20px', color: '#fff', fontSize: '13px', fontWeight: 600 }}>
                            {currentIndex + 1} / {tasks.length}
                        </div>
                    </div>

                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                        <div style={{ color: colors.textMuted, fontSize: '12px', fontWeight: 700, letterSpacing: '1px', marginBottom: '24px' }}>
                            {t.doCombination}
                        </div>
                        <div style={{ color: '#fff', fontSize: '32px', fontWeight: 800, textAlign: 'center', marginBottom: '40px' }}>
                            «{getDesc(currentTask)}»
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '80px' }}>
                            <div style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '16px 24px', color: '#fff', fontSize: '24px', fontWeight: 600 }}>
                                Ctrl
                            </div>
                            <div style={{ color: colors.textMuted, fontSize: '24px' }}>+</div>
                            {currentTask.shift && (
                                <>
                                    <div style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '16px 24px', color: '#fff', fontSize: '24px', fontWeight: 600 }}>Shift</div>
                                    <div style={{ color: colors.textMuted, fontSize: '24px' }}>+</div>
                                </>
                            )}
                            <div style={{ background: 'transparent', border: `2px dashed ${colors.purpleLight}`, borderRadius: '12px', padding: '16px 32px', color: colors.purpleLight, fontSize: '24px', fontWeight: 600 }}>
                                ?
                            </div>
                        </div>

                        {/* Точки прогресса снизу */}
                        <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                            {tasks.map((_, idx) => (
                                <div key={idx} style={{
                                    width: idx === currentIndex ? '32px' : '16px',
                                    height: '6px',
                                    borderRadius: '3px',
                                    background: idx <= currentIndex ? colors.purpleLight : 'rgba(255,255,255,0.1)',
                                    transition: 'all 0.3s'
                                }} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    Object.assign(window, { HotkeyTrainer });
})();
