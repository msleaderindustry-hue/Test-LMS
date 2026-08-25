/**
 * HotkeyTrainer - Redesigned UI
 * ---------------------------------------------------------------------------
 */
(function () {
    const { useState, useEffect, useRef } = React;
    const { motion, AnimatePresence } = window.Motion;
    const { shuffleArray } = window;

    // === БАЗА И ЛОГИКА (НЕ ТРОГАЕМ) ===
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
            alignRight: "Поправить текст по правому краю", alignLeft: "Поправить текст по левому краю",
            undo: "Отменить последнее действие", cut: "Вырезать текст", alignCenter: "Поправить текст по центру",
            selectAll: "Выделить весь текст", italic: "Курсив", print: "Открыть принтер",
            underline: "Линия под текстом", save: "Сохранить", copy: "Копировать", paste: "Вставить",
            openFile: "Открыть файл", closeDoc: "Выйти из документа", find: "Найти", findReplace: "Найти и заменить",
            redo: "Перейти к истории (Redo)", hyperlink: "Вставить гиперссылку", fontSmaller: "Уменьшить размер шрифта",
            fontBigger: "Увеличить размер шрифта", doubleUnderline: "Двойное подчёркивание", allCaps: "Все прописные",
            underlineWords: "Подчёркивание только слов", newTab: "Открыть новую вкладку", newFile: "Создать новый файл или окно", bold: "Жирный текст"
        },
        en: {
            alignRight: "Align text to the right", alignLeft: "Align text to the left", undo: "Undo the last action",
            cut: "Cut text", alignCenter: "Center-align text", selectAll: "Select all text", italic: "Italic",
            print: "Open print dialog", underline: "Underline text", save: "Save", copy: "Copy", paste: "Paste",
            openFile: "Open file", closeDoc: "Close the document", find: "Find", findReplace: "Find and replace",
            redo: "Redo", hyperlink: "Insert a hyperlink", fontSmaller: "Decrease font size", fontBigger: "Increase font size",
            doubleUnderline: "Double underline", allCaps: "All caps", underlineWords: "Underline words only",
            newTab: "Open a new tab", newFile: "Create a new file or window", bold: "Bold text"
        },
        uz: {
            alignRight: "Матнни ўнг томонга текислаш", alignLeft: "Матнни чап томонга текислаш", undo: "Охирги амални бекор қилиш",
            cut: "Матнни кесиб олиш", alignCenter: "Матнни марказга текислаш", selectAll: "Барча матнни танлаш",
            italic: "Қия ёзув (курсив)", print: "Босиб чиқаришни очиш", underline: "Матн остига чизиқ тортиш",
            save: "Сақлаш", copy: "Нусха олиш", paste: "Қўйиш", openFile: "Файлни очиш", closeDoc: "Ҳужжатни ёпиш",
            find: "Қидириш", findReplace: "Қидириш ва алмаштириш", redo: "Қайта бажариш (Redo)", hyperlink: "Гиперҳавола қўйиш",
            fontSmaller: "Шрифт ўлчамини кичрайтириш", fontBigger: "Шрифт ўлчамини катталаштириш", doubleUnderline: "Икки қатор тагига чизиш",
            allCaps: "Барча ҳарфларни бош ҳарф қилиш", underlineWords: "Фақат сўзларни тагига чизиш", newTab: "Янги ойна (вкладка) очиш",
            newFile: "Янги файл ёки ойна яратиш", bold: "Қалин (bold) матн"
        }
    };

    const UI_TRANSLATIONS = {
        ru: {
            langName: "Русский", title: "Хоткеи", aiPowered: "AI POWERED",
            subtitleGrad: "Тренируй стандартную базу из твоих конспектов (Word, Система)", subtitleWhite: " или создай персональную для любой другой программы",
            customPanelLabel: "СВОЯ БАЗА ДЛЯ ДРУГОЙ ПРОГРАММЫ", inputPlaceholder: "Напр. Word, Excel, Photoshop...",
            generateButton: "Создать базу", generating: "Ищем…", loadedSuccess: (topic) => `База «${topic}» загружена`,
            startTraining: "НАЧАТЬ ТРЕНИРОВКУ", theoryStep: "ШАГ 1 ИЗ 2", theoryTitle: "Теория:",
            theoryDesc: "Изучи комбинации, которые встретятся в этой тренировке, а затем закрепи их на практике.",
            exit: "ВЫЙТИ", goToPractice: "ПЕРЕЙТИ К ПРАКТИКЕ →", doCombination: "ВЫПОЛНИТЕ КОМБИНАЦИЮ",
            finishedTitle: "Отличная работа!", finishedDesc: (score, total) => `Закреплено ${score} из ${total} горячих клавиш`,
            repeat: "Пройти ещё раз", errorNoTopic: "Сначала введи название программы", errorFailed: "Не удалось получить список клавиш."
        },
        en: {
            langName: "English", title: "Hotkeys", aiPowered: "AI POWERED",
            subtitleGrad: "Practice the standard set from your notes (Word, System)", subtitleWhite: " or create a custom one for any other program",
            customPanelLabel: "CUSTOM SET FOR ANOTHER PROGRAM", inputPlaceholder: "e.g. Word, Excel, Photoshop...",
            generateButton: "Generate set", generating: "Generating…", loadedSuccess: (topic) => `"${topic}" set loaded`,
            startTraining: "START TRAINING", theoryStep: "STEP 1 OF 2", theoryTitle: "Theory:",
            theoryDesc: "Study the combinations you'll be tested on, then lock them in with practice.",
            exit: "EXIT", goToPractice: "GO TO PRACTICE →", doCombination: "PERFORM THE COMBINATION",
            finishedTitle: "Great job!", finishedDesc: (score, total) => `Locked in ${score} of ${total} hotkeys`,
            repeat: "Try again", errorNoTopic: "Enter a program name first", errorFailed: "Couldn't fetch the hotkey set."
        },
        uz: {
            langName: "O'zbek", title: "Хоткейлар", aiPowered: "AI POWERED",
            subtitleGrad: "Конспектларингиздаги стандарт базани (Word, Тизим) машқ қилинг", subtitleWhite: " ёки бошқа дастур учун ўзингизникини яратинг",
            customPanelLabel: "БОШҚА ДАСТУР УЧУН ЎЗ БАЗАНГИЗ", inputPlaceholder: "Масалан: Word, Excel...",
            generateButton: "База яратиш", generating: "Излаяпмиз…", loadedSuccess: (topic) => `«${topic}» базаси юкланди`,
            startTraining: "МАШҚНИ БОШЛАШ", theoryStep: "1-ҚАДАМ, 2 ТАДАН", theoryTitle: "Назария:",
            theoryDesc: "Ушбу машқда учрайдиган комбинацияларни ўрганинг, сўнг уларни амалиётда мустаҳкамланг.",
            exit: "ЧИҚИШ", goToPractice: "АМАЛИЁТГА ЎТИШ →", doCombination: "КОМБИНАЦИЯНИ БАЖАРИНГ",
            finishedTitle: "Ажойиб натижа!", finishedDesc: (score, total) => `${total} тадан ${score} та мустаҳкамланди`,
            repeat: "Яна такрорлаш", errorNoTopic: "Аввал дастур номини киритинг", errorFailed: "Хоткейлар рўйхатини олиб бўлмади."
        }
    };

    const AI_LANG_HINT = { ru: "русском", en: "английском (English)", uz: "узбекском языке кириллицей" };
    const LANGS = ["ru", "en", "uz"];
    const LANG_LABEL = { ru: "РУС", en: "ENG", uz: "ЎЗБ" };

    // === ДИЗАЙН СИСТЕМА (THEME) ===
    const theme = {
        colors: {
            bgApp: '#0B1020',
            bgPanel: '#151B2E',
            bgPanelSec: '#101629',
            purple: '#8B5CF6',
            purpleDark: '#6D28D9',
            yellow: '#F6D365',
            orange: '#FDA085',
            blue: '#38BDF8',
            text: '#F8FAFC',
            textSec: '#94A3B8',
            border: 'rgba(148,163,184,0.16)'
        },
        gradients: {
            primary: 'linear-gradient(135deg, #F6D365 0%, #FDA085 100%)',
            secondary: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)'
        },
        shadows: {
            purple: '0 10px 30px rgba(109,40,217,0.35)',
            orange: '0 10px 30px rgba(253,160,133,0.25)'
        }
    };

    // === ИКОНКИ (SVG) ===
    const SvgIcon = ({ name, color }) => {
        const props = { stroke: color || theme.colors.purple, strokeWidth: "2", fill: "none", strokeLinecap: "round", strokeLinejoin: "round", width: "22", height: "22" };
        switch (name) {
            case 'undo': return <svg {...props}><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>;
            case 'copy': return <svg {...props}><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>;
            case 'paste': return <svg {...props}><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/></svg>;
            case 'cut': return <svg {...props}><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" x2="8.12" y1="4" y2="15.88"/><line x1="14.47" x2="20" y1="14.48" y2="20"/><line x1="8.12" x2="12" y1="8.12" y2="12"/></svg>;
            case 'print': return <svg {...props}><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>;
            case 'find': case 'findReplace': return <svg {...props}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>;
            case 'save': return <svg {...props}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;
            default: return <svg {...props}><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><path d="M9 3v18"/><path d="M15 3v18"/></svg>; // fallback
        }
    };

    const getIconConfig = (descKey) => {
        const conf = {
            undo: { name: 'undo', color: theme.colors.purple },
            copy: { name: 'copy', color: theme.colors.blue },
            paste: { name: 'paste', color: '#10b981' },
            cut: { name: 'cut', color: theme.colors.orange },
            print: { name: 'print', color: '#ec4899' },
            find: { name: 'find', color: theme.colors.blue },
            findReplace: { name: 'findReplace', color: '#f43f5e' },
            save: { name: 'save', color: '#14b8a6' },
        };
        return conf[descKey] || { name: 'default', color: theme.colors.purple };
    };

    // === UI КОМПОНЕНТЫ ===
    const AppLogo = () => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: theme.gradients.primary, width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', color: '#000', boxShadow: '0 4px 14px rgba(253,160,133,0.4)' }}>⚡</div>
            <span style={{ fontSize: '22px', fontWeight: '900', color: theme.colors.text }}>Хоткеи</span>
            <span style={{ background: theme.gradients.secondary, padding: '4px 10px', borderRadius: '8px', fontSize: '10px', fontWeight: '800', color: '#fff', letterSpacing: '0.5px' }}>AI POWERED</span>
        </div>
    );

    const LanguageSwitcher = ({ lang, onChange }) => (
        <div style={{ display: 'flex', gap: '8px' }}>
            {LANGS.map(code => {
                const active = lang === code;
                return (
                    <motion.button
                        key={code} onClick={() => onChange(code)}
                        whileHover={{ y: active ? 0 : -2 }} whileTap={{ scale: 0.95 }}
                        style={{
                            padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '800', transition: 'all 0.2s',
                            background: active ? theme.gradients.secondary : 'transparent',
                            color: active ? '#fff' : theme.colors.textSec,
                            border: active ? 'none' : `1px solid ${theme.colors.border}`,
                            boxShadow: active ? theme.shadows.purple : 'none'
                        }}>
                        {LANG_LABEL[code]}
                    </motion.button>
                );
            })}
        </div>
    );

    const GlassPanel = ({ children, style, maxWidth = '800px' }) => (
        <motion.div
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: "easeOut" }}
            style={{
                background: theme.colors.bgPanel, border: `1px solid ${theme.colors.border}`, borderRadius: '24px',
                padding: '40px', width: '100%', maxWidth, margin: '0 auto', position: 'relative', overflow: 'hidden',
                boxShadow: '0 20px 40px rgba(0,0,0,0.2)', ...style
            }}>
            {children}
        </motion.div>
    );

    const GradientButton = ({ children, variant = 'primary', onClick, disabled, style }) => (
        <motion.button
            onClick={onClick} disabled={disabled}
            whileHover={!disabled ? { y: -2 } : {}} whileTap={!disabled ? { scale: 0.97 } : {}}
            style={{
                background: variant === 'primary' ? theme.gradients.primary : theme.gradients.secondary,
                boxShadow: variant === 'primary' ? theme.shadows.orange : theme.shadows.purple,
                color: variant === 'primary' ? '#000' : '#fff',
                border: 'none', borderRadius: '16px', padding: '0 32px', height: '56px', fontSize: '15px',
                fontWeight: '800', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.7 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', ...style
            }}>
            {children}
        </motion.button>
    );

    const HotkeyCard = ({ hk, getDesc }) => {
        const iconConf = getIconConfig(hk.descKey);
        return (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                style={{ background: theme.colors.bgPanelSec, border: `1px solid ${theme.colors.border}`, borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `${iconConf.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <SvgIcon name={iconConf.name} color={iconConf.color} />
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ color: theme.colors.text, fontSize: '14px', fontWeight: '600', marginBottom: '8px', lineHeight: 1.3 }}>{getDesc(hk)}</div>
                    <div style={{ display: 'inline-block', background: 'rgba(0,0,0,0.3)', border: `1px solid ${theme.colors.border}`, color: theme.colors.blue, padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', fontFamily: 'monospace' }}>
                        {hk.visual}
                    </div>
                </div>
            </motion.div>
        );
    };

    const KeyCap = ({ children, outline, active, isTarget }) => (
        <motion.div
            animate={active ? { scale: [1, 1.05, 1], boxShadow: `0 0 20px ${theme.colors.purpleDark}` } : {}}
            style={{
                padding: '16px 24px', borderRadius: '12px', fontSize: '20px', fontWeight: '800', fontFamily: 'monospace',
                background: outline ? 'transparent' : 'rgba(255,255,255,0.03)',
                border: isTarget ? `2px dashed ${theme.colors.purpleLight}` : `1px solid ${theme.colors.border}`,
                color: outline ? theme.colors.purpleLight : theme.colors.text,
                display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '60px'
            }}>
            {children}
        </motion.div>
    );

    const ProgressKeys = ({ total, currentIndex }) => (
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '40px', flexWrap: 'wrap' }}>
            {Array.from({ length: total }).map((_, i) => (
                <div key={i} style={{
                    width: '24px', height: '8px', borderRadius: '4px', transition: 'all 0.3s ease',
                    background: i < currentIndex ? theme.gradients.primary : i === currentIndex ? theme.colors.purpleLight : 'rgba(255,255,255,0.1)',
                    boxShadow: i === currentIndex ? `0 0 12px ${theme.colors.purpleLight}` : 'none'
                }} />
            ))}
        </div>
    );

    const HotkeyVisual = () => (
        <motion.div
            animate={{ y: [-5, 5, -5] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            style={{ position: 'relative', width: '120px', height: '120px', marginLeft: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', transformStyle: 'preserve-3d', transform: 'perspective(600px) rotateX(25deg) rotateY(-15deg)' }}>
            <div style={{ position: 'absolute', inset: -20, background: theme.colors.purpleDark, filter: 'blur(40px)', opacity: 0.4, borderRadius: '50%' }} />
            <div style={{ width: '90px', height: '90px', background: 'rgba(255,255,255,0.05)', border: `1px solid ${theme.colors.purpleLight}`, borderRadius: '20px', boxShadow: `inset 0 0 20px ${theme.colors.purpleDark}, 0 20px 30px rgba(0,0,0,0.5)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', color: theme.colors.text }}>⚡</div>
        </motion.div>
    );

    const ErrorBanner = ({ children }) => (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto', marginTop: 12 }} exit={{ opacity: 0, height: 0 }}
            style={{ fontSize: '13px', color: '#ef4444', fontWeight: '700', padding: '10px 14px', background: 'rgba(239,68,68,0.1)', borderRadius: '10px', border: '1px solid rgba(239,68,68,0.2)' }}>
            {children}
        </motion.div>
    );

    // === ГЛАВНЫЙ КОМПОНЕНТ ===
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
            if (hk.descKey) return HOTKEY_DESC_TRANSLATIONS[lang]?.[hk.descKey] ?? HOTKEY_DESC_TRANSLATIONS.ru[hk.descKey] ?? hk.descKey;
            return hk.desc ?? '—';
        };

        const generateAIHotkeys = async () => {
            const cleanTopic = topic.trim();
            if (!cleanTopic) return setGenError(t.errorNoTopic);
            setGenError(null); setIsGenerating(true);
            abortRef.current?.abort(); const controller = new AbortController(); abortRef.current = controller;

            const prompt = `Ты — техническая справочная система, а не творческий помощник. Твоя единственная задача — точно воспроизвести ОФИЦИАЛЬНО ЗАДОКУМЕНТИРОВАННЫЕ горячие клавиши программы "${cleanTopic}", без каких-либо фантазий, догадок или "правдоподобных" комбинаций. Верни 10 горячих клавиш (с Ctrl или Cmd, некоторые могут дополнительно включать Shift) для программы "${cleanTopic}".
            СТРОГИЕ ПРАВИЛА:
            1. НЕ ПРИДУМЫВАЙ комбинации. Используй только те горячие клавиши, которые реально существуют.
            2. От 5 до 10 комбинаций.
            3. Никакой отсебятины: поле "desc" должно точно описывать действие на ${AI_LANG_HINT[lang]}.
            4. Поле "key" — ТОЛЬКО ОДНА строчная буква или цифра.
            5. Не повторяй одну и ту же комбинацию дважды.
            6. Верни ТОЛЬКО чистый валидный JSON-массив объектов. Без markdown.
            Формат строго такой:
            [ {"desc": "Описание", "key": "c", "shift": false, "visual": "Ctrl + C"} ]`;

            try {
                const response = await fetch("https://gemini-proxy-lms.msleaderindustry.workers.dev", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }), signal: controller.signal });
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const data = await response.json();
                if (data.error) throw new Error(data.error.message || "API error");
                const aiText = (data.candidates?.[0]?.content?.parts?.[0]?.text ?? '').trim();
                const jsonMatch = aiText.match(/\[[\s\S]*\]/);
                if (!jsonMatch) throw new Error("No JSON array");
                const parsed = JSON.parse(jsonMatch[0]);
                const validated = parsed.filter(hk => hk?.key?.trim()).map(hk => ({ desc: hk.desc.trim(), key: hk.key.trim().toLowerCase().slice(0, 1), shift: !!hk.shift, visual: hk.visual || `Ctrl${hk.shift ? ' + Shift' : ''} + ${hk.key.trim().toUpperCase()}` }));
                if (validated.length === 0) throw new Error("No valid hotkeys");
                setActiveHotkeys(validated); setIsCustomBase(true);
            } catch (error) {
                if (error.name === 'AbortError') return;
                setGenError(t.errorFailed); setActiveHotkeys(HOTKEYS_DB); setIsCustomBase(false);
            } finally { setIsGenerating(false); }
        };

        const openTheory = () => { setTasks(shuffleArray([...activeHotkeys]).slice(0, Math.min(10, activeHotkeys.length))); setCurrentIndex(0); setScore(0); setIsFinished(false); setPhase('theory'); };
        const startGame = () => setPhase('practice');
        const resetGame = () => { setTasks(shuffleArray([...activeHotkeys]).slice(0, Math.min(10, activeHotkeys.length))); setCurrentIndex(0); setScore(0); setIsFinished(false); setPhase('practice'); };
        const leaveGame = () => { setPhase('setup'); setActiveHotkeys(HOTKEYS_DB); setIsCustomBase(false); setGenError(null); };

        useEffect(() => {
            if (phase !== 'practice' || isFinished || tasks.length === 0) return;
            const handleKeyDown = (e) => {
                if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
                if (e.key === 'Escape') return leaveGame();
                if (["Control", "Meta", "Shift", "Alt"].includes(e.key)) return;

                const currentTask = tasks[currentIndex];
                if (!currentTask || !(e.ctrlKey || e.metaKey)) { setShake(true); setTimeout(() => setShake(false), 300); return; }
                e.preventDefault();

                const expectedKey = currentTask.key.toLowerCase();
                const pressedKey = e.key.toLowerCase();
                const keyMatches = pressedKey === expectedKey || pressedKey === (SHIFT_SYMBOL_MAP[expectedKey] || expectedKey);

                if (e.shiftKey === !!currentTask.shift && keyMatches) {
                    setSuccessPulse(true); setScore(p => p + 1); setTimeout(() => setSuccessPulse(false), 200);
                    if (currentIndex < tasks.length - 1) setCurrentIndex(p => p + 1); else setIsFinished(true);
                } else { setShake(true); setTimeout(() => setShake(false), 300); }
            };
            window.addEventListener("keydown", handleKeyDown, { passive: false });
            return () => window.removeEventListener("keydown", handleKeyDown);
        }, [currentIndex, tasks, isFinished, phase]);

        // === ИНЖЕКЦИЯ СТИЛЕЙ СКОЛЛБАРА ===
        useEffect(() => {
            if (!document.getElementById('hotkey-scroll-style')) {
                const style = document.createElement('style');
                style.id = 'hotkey-scroll-style';
                style.innerHTML = `
                    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.3); border-radius: 999px; }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(139,92,246,0.6); }
                `;
                document.head.appendChild(style);
            }
        }, []);


        // ----------------- РЕНДЕР -----------------
        return (
            <div style={{ minHeight: '100vh', background: theme.colors.bgApp, padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', 'SF Pro Display', sans-serif" }}>
                
                {phase === 'setup' && (
                    <GlassPanel maxWidth="700px">
                        <div style={{ position: 'absolute', top: '-100px', right: '-50px', width: '300px', height: '300px', background: theme.colors.purple, filter: 'blur(100px)', opacity: 0.15, pointerEvents: 'none' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px', flexWrap: 'wrap', gap: '20px' }}>
                            <AppLogo />
                            <LanguageSwitcher lang={lang} onChange={setLang} />
                        </div>
                        <h1 style={{ fontSize: '36px', fontWeight: '900', lineHeight: 1.3, marginBottom: '40px', maxWidth: '560px' }}>
                            <span style={{ background: theme.gradients.primary, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{t.subtitleGrad}</span>
                            <span style={{ color: theme.colors.text }}>{t.subtitleWhite}</span>
                        </h1>
                        <div style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${theme.colors.border}`, borderRadius: '20px', padding: '24px', marginBottom: '32px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: theme.colors.purple }} />
                                <span style={{ color: theme.colors.textSec, fontSize: '11px', fontWeight: '800', letterSpacing: '1px' }}>{t.customPanelLabel}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                                <div style={{ flex: '1 1 240px', display: 'flex', alignItems: 'center', background: theme.colors.bgPanelSec, border: `1px solid ${theme.colors.border}`, borderRadius: '16px', padding: '0 16px' }}>
                                    <div style={{ background: '#2563EB', color: '#fff', width: '28px', height: '28px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px', marginRight: '12px' }}>{topic.charAt(0).toUpperCase() || 'W'}</div>
                                    <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !isGenerating) generateAIHotkeys(); }} placeholder={t.inputPlaceholder} disabled={isGenerating} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '16px', fontWeight: '600', width: '100%', padding: '18px 0', outline: 'none' }} />
                                    <span style={{ color: theme.colors.textSec }}>˅</span>
                                </div>
                                <GradientButton variant="secondary" onClick={generateAIHotkeys} disabled={isGenerating} style={{ flex: '0 0 auto' }}>
                                    {isGenerating ? t.generating : t.generateButton}
                                </GradientButton>
                            </div>
                            <AnimatePresence>
                                {isCustomBase && !isGenerating && !genError && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: '#10b981', fontWeight: '700', fontSize: '14px', marginTop: '16px' }}>✓ {t.loadedSuccess(topic)}</motion.div>}
                                {genError && <ErrorBanner>{genError}</ErrorBanner>}
                            </AnimatePresence>
                        </div>
                        <GradientButton variant="primary" onClick={openTheory} style={{ width: '100%', height: '64px', fontSize: '18px' }}>
                            🚀 {t.startTraining}
                        </GradientButton>
                    </GlassPanel>
                )}

                {phase === 'theory' && (
                    <GlassPanel maxWidth="960px">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px', flexWrap: 'wrap', gap: '20px' }}>
                            <button onClick={leaveGame} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: 'none', color: theme.colors.textSec, cursor: 'pointer', fontSize: '14px', fontWeight: '700' }}>
                                <span style={{ fontSize: '18px' }}>←</span> {t.exit}
                            </button>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '16px' }}>
                                <LanguageSwitcher lang={lang} onChange={setLang} />
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '11px', color: theme.colors.textSec, fontWeight: '800', letterSpacing: '1px', marginBottom: '8px' }}>{t.theoryStep}</div>
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                        <div style={{ width: '40px', height: '4px', background: theme.colors.purpleLight, borderRadius: '2px' }} />
                                        <div style={{ width: '40px', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div style={{ marginBottom: '32px' }}>
                            <h2 style={{ fontSize: '32px', fontWeight: '800', margin: '0 0 12px 0', color: theme.colors.text }}>{t.theoryTitle} <span style={{ background: theme.gradients.secondary, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{isCustomBase ? topic : "Microsoft Word"}</span></h2>
                            <p style={{ color: theme.colors.textSec, fontSize: '15px', maxWidth: '600px', lineHeight: '1.6', margin: 0 }}>{t.theoryDesc}</p>
                        </div>
                        <div className="custom-scrollbar" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px', maxHeight: '440px', overflowY: 'auto', paddingRight: '8px', marginBottom: '40px' }}>
                            {tasks.map((hk, i) => <HotkeyCard key={i} hk={hk} getDesc={getDesc} />)}
                        </div>
                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                            <GradientButton variant="secondary" onClick={leaveGame} style={{ flex: '0 0 160px', background: 'rgba(255,255,255,0.05)', boxShadow: 'none' }}>{t.exit}</GradientButton>
                            <GradientButton variant="primary" onClick={startGame} style={{ flex: '1 1 200px' }}>{t.goToPractice}</GradientButton>
                        </div>
                    </GlassPanel>
                )}

                {phase === 'practice' && tasks.length > 0 && !isFinished && (
                    <GlassPanel maxWidth="960px" style={{ minHeight: '600px', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '60px', flexWrap: 'wrap', gap: '20px' }}>
                            <button onClick={leaveGame} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: 'none', color: theme.colors.textSec, cursor: 'pointer', fontSize: '14px', fontWeight: '700' }}><span style={{ fontSize: '18px' }}>←</span> {t.exit}</button>
                            <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0, color: theme.colors.text }}>Хоткеи: <span style={{ color: theme.colors.purpleLight }}>{isCustomBase ? topic : "Microsoft Word"}</span></h2>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                                <LanguageSwitcher lang={lang} onChange={setLang} />
                                <div style={{ background: theme.colors.bgPanelSec, border: `1px solid ${theme.colors.border}`, padding: '8px 16px', borderRadius: '12px', color: theme.colors.text, fontSize: '14px', fontWeight: '800' }}>{currentIndex + 1} / {tasks.length}</div>
                            </div>
                        </div>
                        
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                                <div style={{ color: theme.colors.textSec, fontSize: '13px', fontWeight: '800', letterSpacing: '2px', marginBottom: '16px' }}>{t.doCombination}</div>
                                <motion.div key={currentIndex} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ fontSize: '36px', fontWeight: '900', color: successPulse ? '#10b981' : theme.colors.text }}>«{getDesc(tasks[currentIndex])}»</motion.div>
                            </div>
                            
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '40px' }}>
                                <motion.div animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}} style={{ display: 'flex', alignItems: 'center', gap: '24px', flex: 1, justifyContent: 'center' }}>
                                    <KeyCap>Ctrl</KeyCap>
                                    <div style={{ color: theme.colors.textSec, fontSize: '28px', opacity: 0.5 }}>+</div>
                                    {tasks[currentIndex].shift && (
                                        <><KeyCap>Shift</KeyCap><div style={{ color: theme.colors.textSec, fontSize: '28px', opacity: 0.5 }}>+</div></>
                                    )}
                                    <KeyCap outline isTarget active={successPulse}>?</KeyCap>
                                </motion.div>
                                <HotkeyVisual />
                            </div>
                        </div>
                        <ProgressKeys total={tasks.length} currentIndex={currentIndex} />
                    </GlassPanel>
                )}

                {phase === 'practice' && isFinished && (
                    <GlassPanel maxWidth="600px" style={{ textAlign: 'center', padding: '60px 40px' }}>
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} style={{ width: '80px', height: '80px', background: 'rgba(16,185,129,0.2)', color: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', margin: '0 auto 32px' }}>✓</motion.div>
                        <h2 style={{ fontSize: '36px', fontWeight: '900', color: theme.colors.text, margin: '0 0 16px 0' }}>{t.finishedTitle}</h2>
                        <p style={{ fontSize: '18px', color: theme.colors.textSec, marginBottom: '40px' }}>{t.finishedDesc(score, tasks.length)}</p>
                        <GradientButton variant="primary" onClick={resetGame} style={{ width: '100%', maxWidth: '300px', margin: '0 auto' }}>{t.repeat}</GradientButton>
                    </GlassPanel>
                )}
            </div>
        );
    };

    Object.assign(window, { HotkeyTrainer });
})();
