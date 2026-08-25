/**
 * HotkeyTrainer (Updated UI)
 * ---------------------------------------------------------------------------
 */
(function () {
    const { useState, useEffect, useRef } = React;
    const { motion, AnimatePresence } = window.Motion;
    const { Button, shuffleArray } = window;

    const SHIFT_SYMBOL_MAP = {
        '1': '!', '2': '@', '3': '#', '4': '$', '5': '%',
        '6': '^', '7': '&', '8': '*', '9': '(', '0': ')',
        '-': '_', '=': '+', '[': '{', ']': '}', '\\': '|',
        ';': ':', "'": '"', ',': '<', '.': '>', '/': '?', '`': '~'
    };

    const HOTKEYS_DB = [
        { descKey: "alignRight", key: "r", shift: false, visual: "Ctrl + R" },
        { descKey: "alignLeft", key: "l", shift: false, visual: "Ctrl + L" },
        { descKey: "undo", key: "z", shift: false, visual: "Ctrl + Z" },
        { descKey: "cut", key: "x", shift: false, visual: "Ctrl + X" },
        { descKey: "alignCenter", key: "e", shift: false, visual: "Ctrl + E" },
        { descKey: "selectAll", key: "a", shift: false, visual: "Ctrl + A" },
        { descKey: "italic", key: "i", shift: false, visual: "Ctrl + I" },
        { descKey: "print", key: "p", shift: false, visual: "Ctrl + P" },
        { descKey: "underline", key: "u", shift: false, visual: "Ctrl + U" },
        { descKey: "save", key: "s", shift: false, visual: "Ctrl + S" },
        { descKey: "copy", key: "c", shift: false, visual: "Ctrl + C" },
        { descKey: "paste", key: "v", shift: false, visual: "Ctrl + V" },
        { descKey: "openFile", key: "o", shift: false, visual: "Ctrl + O" },
        { descKey: "closeDoc", key: "w", shift: false, visual: "Ctrl + W" },
        { descKey: "find", key: "f", shift: false, visual: "Ctrl + F" },
        { descKey: "findReplace", key: "h", shift: false, visual: "Ctrl + H" },
        { descKey: "redo", key: "y", shift: false, visual: "Ctrl + Y" },
        { descKey: "hyperlink", key: "k", shift: false, visual: "Ctrl + K" },
        { descKey: "fontSmaller", key: "1", shift: true, visual: "Ctrl + Shift + 1" },
        { descKey: "fontBigger", key: "9", shift: true, visual: "Ctrl + Shift + 9" },
        { descKey: "doubleUnderline", key: "d", shift: true, visual: "Ctrl + Shift + D" },
        { descKey: "allCaps", key: "a", shift: true, visual: "Ctrl + Shift + A" },
        { descKey: "underlineWords", key: "w", shift: true, visual: "Ctrl + Shift + W" },
        { descKey: "newTab", key: "t", shift: false, visual: "Ctrl + T" },
        { descKey: "newFile", key: "n", shift: false, visual: "Ctrl + N" },
        { descKey: "bold", key: "b", shift: false, visual: "Ctrl + B" }
    ];

    const HOTKEY_DESC_TRANSLATIONS = {
        ru: {
            alignRight: "Поправить текст по правому краю",
            alignLeft: "Поправить текст по левому краю",
            undo: "Отменить последнее действие",
            cut: "Вырезать текст",
            alignCenter: "Поправить текст по центру",
            selectAll: "Выделить весь текст",
            italic: "Курсив",
            print: "Открыть принтер",
            underline: "Линия под текстом",
            save: "Сохранить",
            copy: "Копировать выделенный фрагмент в буфер обмена",
            paste: "Вставить содержимое буфера обмена",
            openFile: "Открыть файл",
            closeDoc: "Выйти из документа",
            find: "Открыть диалоговое окно поиска",
            findReplace: "Открыть диалоговое окно замены",
            redo: "Повторить последнее действие",
            hyperlink: "Вставить гиперссылку",
            fontSmaller: "Уменьшить размер шрифта",
            fontBigger: "Увеличить размер шрифта",
            doubleUnderline: "Двойное подчёркивание",
            allCaps: "Все прописные",
            underlineWords: "Подчёркивание только слов",
            newTab: "Открыть новую вкладку",
            newFile: "Создать новый файл или окно",
            bold: "Жирный текст"
        },
        en: {
            alignRight: "Align text to the right",
            alignLeft: "Align text to the left",
            undo: "Undo the last action",
            cut: "Cut text",
            alignCenter: "Center-align text",
            selectAll: "Select all text",
            italic: "Italic",
            print: "Open print dialog",
            underline: "Underline text",
            save: "Save",
            copy: "Copy selected fragment to clipboard",
            paste: "Paste clipboard contents",
            openFile: "Open file",
            closeDoc: "Close the document",
            find: "Open search dialog",
            findReplace: "Open replace dialog",
            redo: "Repeat last action",
            hyperlink: "Insert a hyperlink",
            fontSmaller: "Decrease font size",
            fontBigger: "Increase font size",
            doubleUnderline: "Double underline",
            allCaps: "All caps",
            underlineWords: "Underline words only",
            newTab: "Open a new tab",
            newFile: "Create a new file or window",
            bold: "Bold text"
        },
        uz: {
            alignRight: "Матнни ўнг томонга текислаш",
            alignLeft: "Матнни чап томонга текислаш",
            undo: "Охирги амални бекор қилиш",
            cut: "Матнни кесиб олиш",
            alignCenter: "Матнни марказга текислаш",
            selectAll: "Барча матнни танлаш",
            italic: "Қия ёзув (курсив)",
            print: "Босиб чиқаришни очиш",
            underline: "Матн остига чизиқ тортиш",
            save: "Сақлаш",
            copy: "Ажратилган қисмни буферга нусхалаш",
            paste: "Буфердагини қўйиш",
            openFile: "Файлни очиш",
            closeDoc: "Ҳужжатни ёпиш",
            find: "Қидириш ойнасини очиш",
            findReplace: "Алмаштириш ойнасини очиш",
            redo: "Охирги амални такрорлаш",
            hyperlink: "Гиперҳавола қўйиш",
            fontSmaller: "Шрифт ўлчамини кичрайтириш",
            fontBigger: "Шрифт ўлчамини катталаштириш",
            doubleUnderline: "Икки қатор тагига чизиш",
            allCaps: "Барча ҳарфларни бош ҳарф қилиш",
            underlineWords: "Фақат сўзларни тагига чизиш",
            newTab: "Янги ойна (вкладка) очиш",
            newFile: "Янги файл ёки ойна яратиш",
            bold: "Қалин (bold) матн"
        }
    };

    const UI_TRANSLATIONS = {
        ru: {
            langName: "Русский",
            title: "Хоткеи",
            aiPowered: "AI POWERED",
            subtitleGrad: "Тренируй стандартную базу из твоих конспектов (Word, Система)",
            subtitleWhite: " или создай персональную для любой другой программы",
            customPanelLabel: "СВОЯ БАЗА ДЛЯ ДРУГОЙ ПРОГРАММЫ",
            inputPlaceholder: "Напр. Word, Excel, Photoshop...",
            generateButton: "Создать базу",
            generating: "Ищем…",
            loadedSuccess: (topic) => `База «${topic}» загружена`,
            startTraining: "НАЧАТЬ ТРЕНИРОВКУ",
            theoryStep: "ШАГ 1 ИЗ 2",
            theoryTitle: "Теория:",
            theoryDesc: "Изучи комбинации, которые встретятся в этой тренировке, а затем закрепи их на практике.",
            exit: "Выйти",
            goToPractice: "ПЕРЕЙТИ К ПРАКТИКЕ →",
            doCombination: "ВЫПОЛНИТЕ КОМБИНАЦИЮ",
            escToExit: "Esc — выйти",
            finishedTitle: "Отличная работа!",
            finishedDesc: (score, total) => `Закреплено ${score} из ${total} горячих клавиш`,
            repeat: "Пройти ещё раз",
            errorNoTopic: "Сначала введи название программы",
            errorFailed: "Не удалось получить список. Попробуй переформулировать запрос",
            defaultBaseName: null
        },
        en: {
            langName: "English",
            title: "Hotkeys",
            aiPowered: "AI POWERED",
            subtitleGrad: "Practice the standard set from your notes (Word, System)",
            subtitleWhite: " or create a custom one for any other program",
            customPanelLabel: "CUSTOM SET FOR ANOTHER PROGRAM",
            inputPlaceholder: "e.g. Word, Excel, Photoshop...",
            generateButton: "Generate set",
            generating: "Generating…",
            loadedSuccess: (topic) => `"${topic}" set loaded`,
            startTraining: "START TRAINING",
            theoryStep: "STEP 1 OF 2",
            theoryTitle: "Theory:",
            theoryDesc: "Study the combinations you'll be tested on, then lock them in with practice.",
            exit: "Exit",
            goToPractice: "GO TO PRACTICE →",
            doCombination: "PERFORM THE COMBINATION",
            escToExit: "Esc to exit",
            finishedTitle: "Great job!",
            finishedDesc: (score, total) => `You locked in ${score} of ${total} hotkeys`,
            repeat: "Try again",
            errorNoTopic: "Enter a program name first",
            errorFailed: "Couldn't fetch the hotkey set. Try rephrasing",
            defaultBaseName: null
        },
        uz: {
            langName: "O'zbek",
            title: "Хоткейлар",
            aiPowered: "AI POWERED",
            subtitleGrad: "Конспектларингиздаги стандарт базани (Word, Тизим) машқ қилинг",
            subtitleWhite: " ёки бошқа дастур учун ўзингизникини яратинг",
            customPanelLabel: "БОШҚА ДАСТУР УЧУН ЎЗ БАЗАНГИЗ",
            inputPlaceholder: "Масалан: Word, Excel...",
            generateButton: "База яратиш",
            generating: "Излаяпмиз…",
            loadedSuccess: (topic) => `«${topic}» базаси юкланди`,
            startTraining: "МАШҚНИ БОШЛАШ",
            theoryStep: "1-ҚАДАМ, 2 ТАДАН",
            theoryTitle: "Назария:",
            theoryDesc: "Ушбу машқда учрайдиган комбинацияларни ўрганинг, сўнг уларни амалиётда мустаҳкамланг.",
            exit: "Чиқиш",
            goToPractice: "АМАЛИЁТГА ЎТИШ →",
            doCombination: "КОМБИНАЦИЯНИ БАЖАРИНГ",
            escToExit: "Esc — чиқиш",
            finishedTitle: "Ажойиб натижа!",
            finishedDesc: (score, total) => `${total} тадан ${score} та мустаҳкамланди`,
            repeat: "Яна бир бор такрорлаш",
            errorNoTopic: "Аввал дастур номини киритинг",
            errorFailed: "Хоткейлар рўйхатини олиб бўлмади",
            defaultBaseName: null
        }
    };

    const AI_LANG_HINT = {
        ru: "русском",
        en: "английском (English)",
        uz: "узбекском языке кириллицей"
    };

    const LANGS = ["ru", "en", "uz"];
    const LANG_LABEL = { ru: "РУС", en: "ENG", uz: "ЎЗБ" };

    const bgPanelColor = 'rgba(25, 25, 35, 0.6)';
    const bgBodyColor = '#0f0f13';
    const accentPurple = '#8b5cf6';

    const keycapStyle = (accent, muted) => ({
        padding: '12px 20px',
        background: 'transparent',
        border: accent ? `1px dashed ${accent}` : '1px solid rgba(255,255,255,0.1)',
        borderRadius: '8px',
        fontSize: '20px',
        fontWeight: '600',
        fontFamily: "'SF Mono', 'JetBrains Mono', ui-monospace, monospace",
        color: accent || '#fff',
        boxShadow: muted ? 'none' : 'inset 0 0 10px rgba(255,255,255,0.02)',
        minWidth: '26px',
        textAlign: 'center',
        opacity: muted ? 0.45 : 1
    });

    // Круглый переключатель языков как на макете
    const LanguageSwitcher = ({ lang, onChange, style }) => (
        <div style={{ display: 'flex', gap: '8px', ...style }}>
            {LANGS.map((code) => {
                const active = lang === code;
                return (
                    <motion.button
                        key={code}
                        type="button"
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onChange(code)}
                        style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            border: active ? 'none' : '1px solid rgba(255,255,255,0.1)',
                            background: active ? accentPurple : 'transparent',
                            color: active ? '#fff' : 'rgba(255,255,255,0.6)',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        {LANG_LABEL[code]}
                    </motion.button>
                );
            })}
        </div>
    );

    // Полоса прогресса из черточек (нижняя часть экрана практики)
    const KeyRow = ({ total, currentIndex }) => (
        <div style={{ display: 'flex', gap: '8px', width: '100%', justifyContent: 'center' }}>
            {Array.from({ length: total }).map((_, i) => {
                const active = i === currentIndex;
                const done = i < currentIndex;
                return (
                    <div
                        key={i}
                        style={{
                            width: active ? '32px' : '16px',
                            height: '4px',
                            borderRadius: '2px',
                            background: done || active ? accentPurple : 'rgba(139, 92, 246, 0.2)',
                            transition: 'all 0.3s ease'
                        }}
                    />
                );
            })}
        </div>
    );

    const ErrorBanner = ({ children }) => (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            style={{
                fontSize: '13px', color: '#ef4444', fontWeight: 600, textAlign: 'left',
                padding: '10px 0', lineHeight: 1.5
            }}
        >
            {children}
        </motion.div>
    );

    const HotkeyTrainer = ({ onBack }) => {
        const [tasks, setTasks] = useState([]);
        const [currentIndex, setCurrentIndex] = useState(0);
        const [score, setScore] = useState(0);
        const [shake, setShake] = useState(false);
        const [successPulse, setSuccessPulse] = useState(false);
        const [isFinished, setIsFinished] = useState(false);
        const [phase, setPhase] = useState('setup');

        const [lang, setLang] = useState('ru');
        const t = UI_TRANSLATIONS[lang];

        const [topic, setTopic] = useState("Microsoft Word");
        const [isGenerating, setIsGenerating] = useState(false);
        const [activeHotkeys, setActiveHotkeys] = useState(HOTKEYS_DB);
        const [isCustomBase, setIsCustomBase] = useState(false);
        const [genError, setGenError] = useState(null);

        const abortRef = useRef(null);
        useEffect(() => () => abortRef.current?.abort(), []);

        const getDesc = (hk) => {
            if (hk.descKey) {
                return HOTKEY_DESC_TRANSLATIONS[lang]?.[hk.descKey]
                    ?? HOTKEY_DESC_TRANSLATIONS.ru[hk.descKey]
                    ?? hk.descKey;
            }
            return hk.desc ?? '—';
        };

        const generateAIHotkeys = async () => {
            const cleanTopic = topic.trim();
            if (!cleanTopic) {
                setGenError(t.errorNoTopic);
                return;
            }

            setGenError(null);
            setIsGenerating(true);
            abortRef.current?.abort();
            const controller = new AbortController();
            abortRef.current = controller;

            const prompt = `Ты — техническая справочная система, а не творческий помощник. Твоя единственная задача — точно воспроизвести ОФИЦИАЛЬНО ЗАДОКУМЕНТИРОВАННЫЕ горячие клавиши программы "${cleanTopic}", без каких-либо фантазий, догадок или "правдоподобных" комбинаций.

Верни 10 горячих клавиш (с Ctrl или Cmd, некоторые могут дополнительно включать Shift) для программы "${cleanTopic}".

СТРОГИЕ ПРАВИЛА:
1. НЕ ПРИДУМЫВАЙ комбинации. Только те, что есть в официальной справке.
2. Верни от 5 до 10 реально существующих шорткатов.
3. Поле "desc" должно точно описывать действие на ${AI_LANG_HINT[lang]}.
4. Поле "key" — ТОЛЬКО ОДНА строчная английская буква или цифра.
5. Не повторяй комбинации.
6. Верни ТОЛЬКО чистый валидный JSON-массив объектов. Формат строго такой:
[
  {"desc": "Описание действия", "key": "c", "shift": false, "visual": "Ctrl + C"},
  {"desc": "Сохранить как", "key": "s", "shift": true, "visual": "Ctrl + Shift + S"}
]`;

            try {
                const response = await fetch("https://gemini-proxy-lms.msleaderindustry.workers.dev", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
                    signal: controller.signal
                });

                if (!response.ok) throw new Error(`HTTP ${response.status}`);

                const data = await response.json();
                if (data.error) throw new Error(data.error.message || "API error");
                if (!data.candidates?.length) throw new Error("Empty AI response");

                const aiText = (data.candidates[0]?.content?.parts?.[0]?.text ?? '').trim();
                const jsonMatch = aiText.match(/\[[\s\S]*\]/);
                if (!jsonMatch) throw new Error("No JSON array in AI response");

                const parsed = JSON.parse(jsonMatch[0]);
                if (!Array.isArray(parsed)) throw new Error("Not an array");

                const validated = parsed
                    .filter(hk => hk && typeof hk.key === 'string' && hk.key.trim().length > 0 && typeof hk.desc === 'string')
                    .map(hk => ({
                        desc: hk.desc.trim(),
                        key: hk.key.trim().toLowerCase().slice(0, 1),
                        shift: !!hk.shift,
                        visual: typeof hk.visual === 'string' && hk.visual.trim() ? hk.visual : `Ctrl${hk.shift ? ' + Shift' : ''} + ${hk.key.trim().toUpperCase()}`
                    }));

                if (validated.length === 0) throw new Error("No valid hotkeys after validation");

                setActiveHotkeys(validated);
                setIsCustomBase(true);
            } catch (error) {
                if (error.name === 'AbortError') return;
                console.error("HotkeyTrainer: generation failed —", error);
                setGenError(t.errorFailed);
                setActiveHotkeys(HOTKEYS_DB);
                setIsCustomBase(false);
            } finally {
                setIsGenerating(false);
            }
        };

        const openTheory = () => {
            setTasks(shuffleArray([...activeHotkeys]).slice(0, Math.min(10, activeHotkeys.length)));
            setCurrentIndex(0);
            setScore(0);
            setIsFinished(false);
            setPhase('theory');
        };

        const startGame = () => setPhase('practice');
        const resetGame = () => {
            setTasks(shuffleArray([...activeHotkeys]).slice(0, Math.min(10, activeHotkeys.length)));
            setCurrentIndex(0);
            setScore(0);
            setIsFinished(false);
            setPhase('practice');
        };

        const leaveGame = () => {
            setPhase('setup');
        };

        useEffect(() => {
            if (phase !== 'practice' || isFinished || tasks.length === 0) return;

            const handleKeyDown = (e) => {
                if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

                if (e.key === 'Escape') {
                    e.preventDefault();
                    leaveGame();
                    return;
                }
                if (e.key === "Control" || e.key === "Meta" || e.key === "Shift" || e.key === "Alt") return;

                const isCtrlOrCmd = e.ctrlKey || e.metaKey;
                const currentTask = tasks[currentIndex];
                if (!currentTask) return;

                if (!isCtrlOrCmd) {
                    setShake(true);
                    setTimeout(() => setShake(false), 300);
                    return;
                }

                e.preventDefault();

                const requiresShift = !!currentTask.shift;
                const isShiftPressed = e.shiftKey;
                const pressedKey = e.key.toLowerCase();
                const expectedKey = currentTask.key.toLowerCase();
                const expectedShiftedKey = SHIFT_SYMBOL_MAP[expectedKey] || expectedKey;
                const keyMatches = pressedKey === expectedKey || pressedKey === expectedShiftedKey;

                if (isShiftPressed === requiresShift && keyMatches) {
                    setSuccessPulse(true);
                    setScore(prev => prev + 1);
                    setTimeout(() => setSuccessPulse(false), 200);

                    if (currentIndex < tasks.length - 1) {
                        setCurrentIndex(prev => prev + 1);
                    } else {
                        setIsFinished(true);
                    }
                } else {
                    setShake(true);
                    setTimeout(() => setShake(false), 300);
                }
            };

            window.addEventListener("keydown", handleKeyDown, { passive: false });
            return () => window.removeEventListener("keydown", handleKeyDown);
        }, [currentIndex, tasks, isFinished, phase]);


        const BaseCardStyle = {
            background: bgPanelColor,
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '16px',
            color: '#fff',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
        };


        // === ФАЗА НАСТРОЙКИ (SETUP) ===
        if (phase === 'setup') {
            return (
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{ ...BaseCardStyle, maxWidth: '600px', margin: '0 auto', padding: '40px', position: 'relative', overflow: 'hidden' }}
                >
                    {/* Эффекты свечения на фоне */}
                    <div style={{ position: 'absolute', top: '-100px', left: '-50px', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(139,92,246,0.15), transparent 70%)', pointerEvents: 'none' }} />
                    
                    {/* Шапка */}
                    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', position: 'relative', zIndex: 2 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                                width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)', fontSize: '20px', color: '#000'
                            }}>
                                ⚡
                            </div>
                            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 800 }}>{t.title}</h2>
                            <span style={{
                                fontSize: '10px', fontWeight: '800', background: 'rgba(139, 92, 246, 0.2)', color: accentPurple,
                                padding: '4px 8px', borderRadius: '6px', letterSpacing: '0.5px'
                            }}>
                                {t.aiPowered}
                            </span>
                        </div>
                        <LanguageSwitcher lang={lang} onChange={setLang} />
                    </header>

                    {/* Заголовок */}
                    <h1 style={{ fontSize: '26px', fontWeight: 700, lineHeight: 1.4, marginBottom: '40px', textAlign: 'left' }}>
                        <span style={{
                            background: 'linear-gradient(90deg, #f6d365 0%, #fda085 100%)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                        }}>
                            {t.subtitleGrad}
                        </span>
                        {t.subtitleWhite}
                    </h1>

                    {/* Блок выбора базы */}
                    <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '12px', padding: '24px', marginBottom: '32px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontWeight: 700, letterSpacing: '1px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: accentPurple }} />
                            {t.customPanelLabel}
                        </div>
                        
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            <div style={{ 
                                flex: 1, display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', 
                                borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', padding: '0 16px' 
                            }}>
                                <span style={{ background: '#1d4ed8', color: '#fff', fontSize: '12px', padding: '4px 6px', borderRadius: '4px', fontWeight: 800, marginRight: '12px' }}>W</span>
                                <input
                                    type="text"
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter' && !isGenerating) generateAIHotkeys(); }}
                                    placeholder={t.inputPlaceholder}
                                    style={{
                                        background: 'transparent', border: 'none', color: '#fff', fontSize: '15px', fontWeight: 500,
                                        width: '100%', padding: '14px 0', outline: 'none'
                                    }}
                                    disabled={isGenerating}
                                />
                                <span style={{ opacity: 0.5 }}>⌄</span>
                            </div>
                            <motion.button
                                whileHover={{ scale: isGenerating ? 1 : 1.02 }}
                                whileTap={{ scale: isGenerating ? 1 : 0.98 }}
                                onClick={generateAIHotkeys}
                                disabled={isGenerating}
                                style={{
                                    padding: '0 24px', background: accentPurple, border: 'none', color: '#fff',
                                    borderRadius: '8px', fontWeight: '600', fontSize: '14px', cursor: isGenerating ? 'not-allowed' : 'pointer',
                                    opacity: isGenerating ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: '8px'
                                }}
                            >
                                {isGenerating ? t.generating : t.generateButton}
                            </motion.button>
                        </div>
                        
                        <AnimatePresence>
                            {isCustomBase && !isGenerating && !genError && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                    style={{ fontSize: '13px', color: '#34d399', fontWeight: 600, padding: '10px 0' }}
                                >
                                    ✓ {t.loadedSuccess(topic)}
                                </motion.div>
                            )}
                            {genError && <ErrorBanner key="err">{genError}</ErrorBanner>}
                        </AnimatePresence>
                    </div>

                    <button
                        onClick={openTheory}
                        style={{
                            width: '100%', padding: '18px', background: 'linear-gradient(90deg, #f6d365 0%, #fda085 100%)',
                            border: 'none', borderRadius: '12px', color: '#000', fontSize: '16px', fontWeight: 800, cursor: 'pointer',
                            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px',
                            boxShadow: '0 8px 20px rgba(253,160,133,0.3)'
                        }}
                    >
                        🚀 {t.startTraining}
                    </button>
                </motion.div>
            );
        }

        // === ФАЗА ТЕОРИИ (THEORY) ===
        if (phase === 'theory') {
            return (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ ...BaseCardStyle, maxWidth: '900px', margin: '0 auto', padding: '32px' }}>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                        <button onClick={leaveGame} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                            <span>←</span> {t.exit}
                        </button>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '16px' }}>
                            <LanguageSwitcher lang={lang} onChange={setLang} />
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', fontWeight: 800, letterSpacing: '1px', marginBottom: '8px' }}>{t.theoryStep}</div>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                    <div style={{ width: '30px', height: '4px', background: accentPurple, borderRadius: '2px' }} />
                                    <div style={{ width: '30px', height: '4px', background: 'rgba(139,92,246,0.2)', borderRadius: '2px' }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginBottom: '32px' }}>
                        <h2 style={{ fontSize: '28px', fontWeight: 700, margin: '0 0 12px 0' }}>
                            {t.theoryTitle} <span style={{ color: accentPurple }}>{isCustomBase ? topic : "Microsoft Word"}</span>
                        </h2>
                        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', margin: 0, maxWidth: '600px' }}>
                            {t.theoryDesc}
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '16px', marginBottom: '32px' }}>
                        {tasks.map((hk, i) => (
                            <div key={i} style={{
                                display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '16px',
                                background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px'
                            }}>
                                <div style={{
                                    width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px',
                                    border: '1px solid rgba(255,255,255,0.1)'
                                }}>
                                    ⌨️
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', lineHeight: 1.3 }}>
                                        {getDesc(hk)}
                                    </div>
                                    <div style={{
                                        display: 'inline-block', padding: '4px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.1)', fontSize: '12px', fontFamily: 'monospace', color: accentPurple, fontWeight: 600
                                    }}>
                                        {hk.visual}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <button onClick={leaveGame} style={{ padding: '14px 32px', background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                            {t.exit.toUpperCase()}
                        </button>
                        <button onClick={startGame} style={{ padding: '14px 32px', background: 'linear-gradient(90deg, #f6d365 0%, #fda085 100%)', border: 'none', borderRadius: '8px', color: '#000', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>
                            {t.goToPractice}
                        </button>
                    </div>
                </motion.div>
            );
        }

        // === ФАЗА ПРАКТИКИ (PRACTICE) ===
        if (tasks.length === 0) return null;
        const currentTask = tasks[currentIndex];

        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ ...BaseCardStyle, maxWidth: '900px', margin: '0 auto', padding: '32px', position: 'relative', overflow: 'hidden' }}>
                
                {/* Эффект свечения справа снизу, имитирующий 3D кнопку из макета */}
                <div style={{ position: 'absolute', bottom: '-50px', right: '-50px', width: '250px', height: '250px', background: 'radial-gradient(circle, rgba(139,92,246,0.15), transparent 70%)', pointerEvents: 'none' }} />

                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '60px' }}>
                    <button onClick={leaveGame} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                        <span>←</span> {t.exit}
                    </button>
                    
                    <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>
                        {t.title}: <span style={{ color: accentPurple }}>{isCustomBase ? topic : "Microsoft Word"}</span>
                    </h2>
                    
                    <div style={{ padding: '6px 16px', background: 'rgba(255,255,255,0.05)', borderRadius: '20px', fontSize: '13px', fontWeight: 600, border: '1px solid rgba(255,255,255,0.1)' }}>
                        {Math.min(currentIndex + 1, tasks.length)} / {tasks.length}
                    </div>
                </header>

                {!isFinished ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: '40px' }}>
                        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontWeight: 700, letterSpacing: '1px', marginBottom: '16px' }}>
                            {t.doCombination}
                        </div>
                        
                        <motion.div
                            key={currentIndex}
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            style={{ fontSize: '32px', fontWeight: 800, textAlign: 'center', marginBottom: '60px', color: successPulse ? '#34d399' : '#fff' }}
                        >
                            «{getDesc(currentTask)}»
                        </motion.div>

                        <motion.div 
                            animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
                            transition={{ duration: 0.4 }}
                            style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '60px' }}
                        >
                            <div style={keycapStyle(null)}>Ctrl</div>
                            <div style={{ fontSize: '24px', fontWeight: '400', color: 'rgba(255,255,255,0.4)' }}>+</div>
                            {currentTask.shift && (
                                <>
                                    <div style={keycapStyle(null)}>Shift</div>
                                    <div style={{ fontSize: '24px', fontWeight: '400', color: 'rgba(255,255,255,0.4)' }}>+</div>
                                </>
                            )}
                            <div style={keycapStyle(accentPurple)}>
                                ?
                            </div>
                        </motion.div>

                        <KeyRow total={tasks.length} currentIndex={currentIndex} />
                    </div>
                ) : (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', padding: '40px 0' }}>
                        <div style={{ fontSize: '48px', marginBottom: '24px' }}>🎉</div>
                        <h2 style={{ fontSize: '32px', margin: '0 0 16px 0', color: '#34d399' }}>{t.finishedTitle}</h2>
                        <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.6)', marginBottom: '32px' }}>
                            {t.finishedDesc(score, tasks.length)}
                        </p>
                        <button onClick={resetGame} style={{ padding: '14px 40px', background: 'linear-gradient(90deg, #f6d365 0%, #fda085 100%)', border: 'none', borderRadius: '8px', color: '#000', fontSize: '15px', fontWeight: 700, cursor: 'pointer' }}>
                            {t.repeat}
                        </button>
                    </motion.div>
                )}
            </motion.div>
        );
    };

    Object.assign(window, { HotkeyTrainer });
})();
