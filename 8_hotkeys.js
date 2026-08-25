/**
 * HotkeyTrainer
 * ---------------------------------------------------------------------------
 * ВАЖНО: Бизнес-логика, AI-генерация, локализация и обработка клавиатуры 
 * сохранены в исходном виде. Обновлен только UI/UX слой согласно новому 
 * дизайн-макету (Glassmorphism, Navy background, Neon accents).
 * ---------------------------------------------------------------------------
 */
(function () {
    const { useState, useEffect, useRef } = React;
    const { motion, AnimatePresence } = window.Motion;
    const { shuffleArray } = window; // Button убран, так как используем кастомный GradientButton

    // Соответствие "цифра/символ" -> символ
    const SHIFT_SYMBOL_MAP = {
        '1': '!', '2': '@', '3': '#', '4': '$', '5': '%',
        '6': '^', '7': '&', '8': '*', '9': '(', '0': ')',
        '-': '_', '=': '+', '[': '{', ']': '}', '\\': '|',
        ';': ':', "'": '"', ',': '<', '.': '>', '/': '?', '`': '~'
    };

    // Штатная база горячих клавиш
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
            copy: "Копия",
            paste: "Вставить",
            openFile: "Открыть файл",
            closeDoc: "Выйти из документа",
            find: "Найти",
            findReplace: "Найти и заменить",
            redo: "Перейти к истории (Redo)",
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
            copy: "Copy",
            paste: "Paste",
            openFile: "Open file",
            closeDoc: "Close the document",
            find: "Find",
            findReplace: "Find and replace",
            redo: "Redo",
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
            copy: "Нусха олиш",
            paste: "Қўйиш",
            openFile: "Файлни очиш",
            closeDoc: "Ҳужжатни ёпиш",
            find: "Қидириш",
            findReplace: "Қидириш ва алмаштириш",
            redo: "Қайта бажариш (Redo)",
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
            subtitle: "Тренируй стандартную базу из твоих конспектов (Word, Система) или создай персональную для любой другой программы",
            customPanelLabel: "Своя база для другой программы",
            inputPlaceholder: "Напр. Word, Excel, Photoshop...",
            generateButton: "Создать базу",
            generating: "Ищем…",
            loadedSuccess: (topic) => `База «${topic}» загружена`,
            startTraining: "НАЧАТЬ ТРЕНИРОВКУ",
            theoryStep: "Шаг 1 из 2",
            theoryTitle: "Теория",
            theoryDesc: "Изучи комбинации, которые встретятся в этой тренировке, а затем закрепи их на практике.",
            exit: "Выйти",
            goToPractice: "ПЕРЕЙТИ К ПРАКТИКЕ",
            doCombination: "Выполните комбинацию",
            escToExit: "Esc — выйти",
            finishedTitle: "Отличная работа!",
            finishedDesc: (score, total) => `Закреплено ${score} из ${total} горячих клавиш`,
            repeat: "Пройти ещё раз",
            errorNoTopic: "Сначала введи название программы",
            errorFailed: "Не удалось получить список клавиш. Попробуй переформулировать запрос или повтори позже",
            defaultBaseName: null
        },
        en: {
            langName: "English",
            title: "Hotkeys",
            aiPowered: "AI POWERED",
            subtitle: "Practice the standard set from your notes (Word, System), or create a custom one for any other program",
            customPanelLabel: "Custom set for another program",
            inputPlaceholder: "e.g. Word, Excel, Photoshop...",
            generateButton: "Generate set",
            generating: "Generating…",
            loadedSuccess: (topic) => `"${topic}" set loaded`,
            startTraining: "START TRAINING",
            theoryStep: "Step 1 of 2",
            theoryTitle: "Theory",
            theoryDesc: "Study the combinations you'll be tested on, then lock them in with practice.",
            exit: "Exit",
            goToPractice: "GO TO PRACTICE",
            doCombination: "Perform the combination",
            escToExit: "Esc to exit",
            finishedTitle: "Great job!",
            finishedDesc: (score, total) => `You locked in ${score} of ${total} hotkeys`,
            repeat: "Try again",
            errorNoTopic: "Enter a program name first",
            errorFailed: "Couldn't fetch the hotkey set. Try rephrasing the topic or retry later",
            defaultBaseName: null
        },
        uz: {
            langName: "O'zbek (кирилл)",
            title: "Хоткейлар",
            aiPowered: "AI POWERED",
            subtitle: "Конспектларингиздаги стандарт базани (Word, Тизим) машқ қилинг ёки бошқа дастур учун ўзингизникини яратинг",
            customPanelLabel: "Бошқа дастур учун ўз базангиз",
            inputPlaceholder: "Масалан: Word, Excel, Photoshop...",
            generateButton: "База яратиш",
            generating: "Излаяпмиз…",
            loadedSuccess: (topic) => `«${topic}» базаси юкланди`,
            startTraining: "МАШҚНИ БОШЛАШ",
            theoryStep: "1-қадам, 2 тадан",
            theoryTitle: "Назария",
            theoryDesc: "Ушбу машқда учрайдиган комбинацияларни ўрганинг, сўнг уларни амалиётда мустаҳкамланг.",
            exit: "Чиқиш",
            goToPractice: "АМАЛИЁТГА ЎТИШ",
            doCombination: "Комбинацияни бажаринг",
            escToExit: "Esc — чиқиш",
            finishedTitle: "Ажойиб натижа!",
            finishedDesc: (score, total) => `${total} тадан ${score} та хоткей мустаҳкамланди`,
            repeat: "Яна бир бор такрорлаш",
            errorNoTopic: "Аввал дастур номини киритинг",
            errorFailed: "Хоткейлар рўйхатини олиб бўлмади. Мавзуни бошқача ёзиб кўринг ёки кейинроқ қайта уриниб кўринг",
            defaultBaseName: null
        }
    };

    const AI_LANG_HINT = {
        ru: "русском",
        en: "английском (English)",
        uz: "узбекском языке кириллицей (o'zbek tilida, kirill alifbosida)"
    };

    const LANGS = ["ru", "en", "uz"];
    const LANG_LABEL = { ru: "РУС", en: "ENG", uz: "ЎЗБ" };

    // ==========================================
    // UI COMPONENTS & DESIGN SYSTEM
    // ==========================================

    const AppStyles = () => (
        <style>{`
            .ht-app-container {
                --bg-main: #0B1020;
                --bg-panel: #151B2E;
                --bg-panel-sec: #101629;
                --text-main: #F8FAFC;
                --text-sec: #94A3B8;
                --border: rgba(148,163,184,0.16);
                --purple: #8B5CF6;
                --purple-dark: #6D28D9;
                --yellow: #F6D365;
                --orange: #FDA085;
                --blue: #38BDF8;
                
                background: var(--bg-main);
                color: var(--text-main);
                font-family: 'Inter', 'Manrope', 'SF Pro Display', sans-serif;
                min-height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
                box-sizing: border-box;
            }
            .ht-app-container * { box-sizing: border-box; }
            .ht-glass-panel {
                background: var(--bg-panel);
                border: 1px solid var(--border);
                border-radius: 24px;
                box-shadow: 0 24px 48px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05);
                width: 100%;
                position: relative;
                overflow: hidden;
            }
            .ht-custom-scroll::-webkit-scrollbar {
                width: 5px;
            }
            .ht-custom-scroll::-webkit-scrollbar-track {
                background: transparent;
            }
            .ht-custom-scroll::-webkit-scrollbar-thumb {
                background: rgba(139,92,246,0.5);
                border-radius: 999px;
            }
            .ht-input-field {
                background: var(--bg-panel-sec);
                border: 1px solid var(--border);
                color: var(--text-main);
                transition: border-color 0.2s ease, box-shadow 0.2s ease;
            }
            .ht-input-field:focus {
                border-color: var(--purple);
                box-shadow: 0 0 0 3px rgba(139,92,246,0.2);
                outline: none;
            }
            .ht-visual-key-anim {
                animation: floatKey 5s ease-in-out infinite;
            }
            @keyframes floatKey {
                0%, 100% { transform: perspective(800px) rotateX(25deg) rotateY(-15deg) rotateZ(5deg) translateY(0); }
                50% { transform: perspective(800px) rotateX(25deg) rotateY(-15deg) rotateZ(5deg) translateY(-12px); }
            }
            @media (max-width: 650px) {
                .ht-setup-header { flex-direction: column; align-items: flex-start !important; gap: 16px; }
                .ht-hero-text { font-size: 24px !important; }
                .ht-input-group { flex-direction: column; }
                .ht-theory-grid { grid-template-columns: 1fr !important; }
                .ht-practice-layout { flex-direction: column !important; align-items: center; }
                .ht-practice-visual { display: none; }
                .ht-theory-buttons { flex-direction: column; }
            }
        `}</style>
    );

    const AppLogo = () => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
                width: '44px', height: '44px', borderRadius: '12px',
                background: 'linear-gradient(135deg, var(--yellow), var(--orange))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(253,160,133,0.4)'
            }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0B1020" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                </svg>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '20px', fontWeight: 900, letterSpacing: '-0.5px' }}>Хоткеи</span>
                <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--purple)', letterSpacing: '1px' }}>AI POWERED</span>
            </div>
        </div>
    );

    const LanguageSwitcher = ({ lang, onChange }) => (
        <div style={{ display: 'flex', gap: '6px' }}>
            {LANGS.map((code) => {
                const active = lang === code;
                return (
                    <motion.button
                        key={code}
                        type="button"
                        whileHover={{ y: active ? 0 : -2 }}
                        whileTap={{ scale: 0.94 }}
                        onClick={() => onChange(code)}
                        style={{
                            padding: '8px 14px', borderRadius: '8px',
                            border: active ? '1px solid transparent' : '1px solid var(--border)',
                            background: active ? 'linear-gradient(135deg, var(--purple), var(--purple-dark))' : 'transparent',
                            color: active ? '#fff' : 'var(--text-sec)',
                            fontSize: '12px', fontWeight: 800, cursor: 'pointer',
                            boxShadow: active ? '0 8px 24px rgba(139,92,246,0.35)' : 'none'
                        }}
                    >
                        {LANG_LABEL[code]}
                    </motion.button>
                );
            })}
        </div>
    );

    const GradientButton = ({ variant = 'primary', style, children, disabled, ...props }) => {
        const isPrimary = variant === 'primary';
        return (
            <motion.button
                whileHover={disabled ? {} : { y: -2, filter: 'brightness(1.05)' }}
                whileTap={disabled ? {} : { scale: 0.97 }}
                disabled={disabled}
                style={{
                    background: isPrimary ? 'linear-gradient(135deg, var(--yellow), var(--orange))' : 'linear-gradient(135deg, var(--purple), var(--purple-dark))',
                    boxShadow: isPrimary ? '0 10px 30px rgba(253,160,133,0.35)' : '0 10px 30px rgba(109,40,217,0.35)',
                    color: isPrimary ? '#0B1020' : '#fff',
                    border: 'none', borderRadius: '16px',
                    fontWeight: 800, cursor: disabled ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    opacity: disabled ? 0.7 : 1,
                    ...style
                }}
                {...props}
            >
                {children}
            </motion.button>
        );
    };

    const KeyCap = ({ children, active, isSmall }) => (
        <div style={{
            padding: isSmall ? '6px 12px' : '14px 24px',
            background: 'linear-gradient(180deg, var(--bg-panel-sec) 0%, var(--bg-main) 100%)',
            border: `1px solid ${active ? 'var(--blue)' : 'var(--border)'}`,
            borderBottom: `3px solid ${active ? 'var(--blue)' : 'var(--border)'}`,
            borderRadius: isSmall ? '8px' : '14px',
            fontSize: isSmall ? '13px' : '24px',
            fontWeight: 800,
            fontFamily: "'SF Mono', 'JetBrains Mono', monospace",
            color: active ? 'var(--blue)' : 'var(--text-main)',
            boxShadow: active ? '0 0 16px rgba(56,189,248,0.4), inset 0 0 8px rgba(56,189,248,0.2)' : '0 4px 10px rgba(0,0,0,0.2)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            minWidth: isSmall ? 'auto' : '64px',
            transition: 'all 0.2s ease'
        }}>
            {children}
        </div>
    );

    const ProgressKeys = ({ total, currentIndex }) => (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {Array.from({ length: total }).map((_, i) => {
                const done = i < currentIndex;
                const active = i === currentIndex;
                return (
                    <motion.div
                        key={i}
                        animate={active ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                        transition={active ? { repeat: Infinity, duration: 1.5 } : {}}
                        style={{
                            width: '28px', height: '10px', borderRadius: '4px',
                            background: done ? 'linear-gradient(90deg, var(--yellow), var(--orange))' : (active ? 'var(--blue)' : '#1E293B'),
                            boxShadow: done ? '0 0 10px rgba(253,160,133,0.5)' : (active ? '0 0 14px rgba(56,189,248,0.6)' : 'none'),
                            border: active ? '1px solid rgba(56,189,248,0.8)' : '1px solid rgba(148,163,184,0.1)'
                        }}
                    />
                );
            })}
        </div>
    );

    const HotkeyVisual = () => (
        <div style={{ perspective: '1000px', width: '140px', height: '140px', display: 'flex', justifyContent: 'center', alignItems: 'center' }} className="ht-practice-visual">
            <div className="ht-visual-key-anim" style={{
                width: '100px', height: '100px', borderRadius: '20px',
                background: 'linear-gradient(135deg, var(--bg-panel), var(--bg-main))',
                border: '1px solid rgba(139,92,246,0.4)',
                boxShadow: '20px 20px 40px rgba(0,0,0,0.5), inset 2px 2px 5px rgba(255,255,255,0.1), 0 0 30px rgba(139,92,246,0.15)',
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                color: 'var(--purple)'
            }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                </svg>
            </div>
        </div>
    );

    // Helper for icons in Theory cards
    const getIconInfo = (descKey) => {
        const iconStyle = { strokeWidth: 2, fill: "none", stroke: "currentColor", width: 20, height: 20 };
        switch(descKey) {
            case 'undo': return { svg: <svg {...iconStyle}><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>, color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)' };
            case 'copy': return { svg: <svg {...iconStyle}><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>, color: '#38BDF8', bg: 'rgba(56,189,248,0.1)' };
            case 'paste': return { svg: <svg {...iconStyle}><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg>, color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' };
            case 'cut': return { svg: <svg {...iconStyle}><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" x2="8.12" y1="4" y2="15.88"/><line x1="14.47" x2="20" y1="14.48" y2="20"/><line x1="8.12" x2="12" y1="8.12" y2="12"/></svg>, color: '#FDA085', bg: 'rgba(253,160,133,0.1)' };
            case 'print': return { svg: <svg {...iconStyle}><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>, color: '#D946EF', bg: 'rgba(217,70,239,0.1)' };
            case 'find': return { svg: <svg {...iconStyle}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>, color: '#38BDF8', bg: 'rgba(56,189,248,0.1)' };
            case 'bold': return { svg: <svg {...iconStyle}><path d="M14 12a4 4 0 0 0 0-8H6v8"/><path d="M15 20a4 4 0 0 0 0-8H6v8Z"/></svg>, color: '#10B981', bg: 'rgba(16,185,129,0.1)' };
            default: return { svg: <svg {...iconStyle}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>, color: '#94A3B8', bg: 'rgba(148,163,184,0.1)' };
        }
    };

    const ErrorBanner = ({ children }) => (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            style={{
                fontSize: '13px', color: '#EF4444', fontWeight: 700, textAlign: 'center',
                background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: '12px', padding: '12px', lineHeight: 1.5
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

        const splitHeroText = (subtitle, l) => {
            let p1 = subtitle, p2 = "";
            if (l === 'ru' && subtitle.includes(' или ')) {
                [p1, p2] = subtitle.split(' или '); p2 = 'или ' + p2;
            } else if (l === 'en' && subtitle.includes(', or ')) {
                [p1, p2] = subtitle.split(', or '); p2 = 'or ' + p2;
            } else if (l === 'uz' && subtitle.includes(' ёки ')) {
                [p1, p2] = subtitle.split(' ёки '); p2 = 'ёки ' + p2;
            }
            return { p1, p2 };
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

СТРОГИЕ ПРАВИЛА (нарушение недопустимо):
1. НЕ ПРИДУМЫВАЙ комбинации. Используй только те горячие клавиши, которые реально существуют и задокументированы в официальной справке/документации программы "${cleanTopic}". Если не уверен, что комбинация существует именно в этой программе — не включай её.
2. Если для "${cleanTopic}" в принципе не существует 10 разных официальных комбинаций с Ctrl/Cmd — верни столько, сколько действительно существует (не меньше 5, не выдумывая недостающие).
3. Никакой отсебятины в описаниях: поле "desc" должно точно и нейтрально описывать действие, без выдуманных деталей. Напиши поле "desc" на ${AI_LANG_HINT[lang]}.
4. Поле "key" — ТОЛЬКО ОДНА строчная английская буква или цифра (физическая клавиша, которая нажимается вместе с Ctrl, без символов вроде "!" или "(" — если нужна цифра, пиши саму цифру).
5. Не повторяй одну и ту же комбинацию дважды.
6. Верни ТОЛЬКО чистый валидный JSON-массив объектов. Без markdown, без пояснений, без текста до или после массива.

Формат строго такой:
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
            setActiveHotkeys(HOTKEYS_DB);
            setIsCustomBase(false);
            setGenError(null);
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

        // === RENDER ===
        const { p1, p2 } = splitHeroText(t.subtitle, lang);

        return (
            <div className="ht-app-container">
                <AppStyles />

                {/* 1. SETUP PHASE */}
                {phase === 'setup' && (
                    <motion.div
                        className="ht-glass-panel"
                        initial={{ opacity: 0, scale: 0.98, y: 15 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                        style={{ maxWidth: '820px', padding: '48px 40px' }}
                    >
                        <div style={{ position: 'absolute', top: '-100px', left: '20%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(139,92,246,0.15), transparent 70%)', pointerEvents: 'none' }} />
                        <div style={{ position: 'absolute', bottom: '-100px', right: '-50px', width: '250px', height: '250px', background: 'radial-gradient(circle, rgba(253,160,133,0.1), transparent 70%)', pointerEvents: 'none' }} />
                        
                        <header className="ht-setup-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', position: 'relative', zIndex: 10 }}>
                            <AppLogo />
                            <LanguageSwitcher lang={lang} onChange={setLang} />
                        </header>

                        <div className="ht-hero-text" style={{ fontSize: '36px', fontWeight: 900, lineHeight: 1.25, marginBottom: '40px', maxWidth: '640px' }}>
                            <span style={{ background: 'linear-gradient(135deg, var(--yellow), var(--orange))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                {p1}
                            </span>
                            {p2 && <span style={{ color: 'var(--text-main)', display: 'block' }}>{p2}</span>}
                        </div>

                        <div style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '20px', padding: '24px', marginBottom: '32px' }}>
                            <div style={{ fontSize: '11px', color: 'var(--text-sec)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.4px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--purple)', display: 'inline-block' }} />
                                {t.customPanelLabel}
                            </div>
                            <div className="ht-input-group" style={{ display: 'flex', gap: '12px' }}>
                                <div style={{ position: 'relative', flex: 1 }}>
                                    <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-sec)' }}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                                    </div>
                                    <input
                                        className="ht-input-field"
                                        type="text"
                                        value={topic}
                                        onChange={(e) => setTopic(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter' && !isGenerating) generateAIHotkeys(); }}
                                        placeholder={t.inputPlaceholder}
                                        disabled={isGenerating}
                                        style={{ width: '100%', padding: '16px 16px 16px 44px', borderRadius: '14px', fontSize: '15px', fontWeight: 600 }}
                                    />
                                </div>
                                <GradientButton variant="secondary" onClick={generateAIHotkeys} disabled={isGenerating} style={{ padding: '0 28px', height: '54px' }}>
                                    {isGenerating ? (
                                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', display: 'inline-block', marginRight: 8 }} />
                                    ) : null}
                                    {isGenerating ? t.generating : t.generateButton}
                                </GradientButton>
                            </div>

                            <AnimatePresence>
                                {isCustomBase && !isGenerating && !genError && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto', marginTop: 16 }} exit={{ opacity: 0, height: 0, marginTop: 0 }} style={{ fontSize: '14px', color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                                        {t.loadedSuccess(topic)}
                                    </motion.div>
                                )}
                                {genError && <ErrorBanner key="err">{genError}</ErrorBanner>}
                            </AnimatePresence>
                        </div>

                        <GradientButton variant="primary" onClick={openTheory} style={{ width: '100%', maxWidth: '500px', height: '60px', fontSize: '16px', margin: '0 auto', gap: '8px' }}>
                            <span style={{ fontSize: '20px' }}>🚀</span> {t.startTraining}
                        </GradientButton>
                    </motion.div>
                )}

                {/* 2. THEORY PHASE */}
                {phase === 'theory' && (
                    <motion.div
                        className="ht-glass-panel"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ maxWidth: '900px', padding: '36px' }}
                    >
                        <header style={{ borderBottom: '1px solid var(--border)', paddingBottom: '20px', marginBottom: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                <button onClick={leaveGame} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'var(--text-sec)', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>
                                    ← {t.exit}
                                </button>
                                <LanguageSwitcher lang={lang} onChange={setLang} />
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--text-sec)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.6px', marginBottom: '8px' }}>
                                {t.theoryStep}
                            </div>
                            <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 900, background: 'linear-gradient(135deg, var(--purple), var(--blue))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                {t.theoryTitle}: <span style={{ color: 'var(--text-main)', WebkitTextFillColor: 'var(--text-main)' }}>{isCustomBase ? topic : 'Microsoft Word'}</span>
                            </h2>
                            <p style={{ fontSize: '15px', color: 'var(--text-sec)', fontWeight: 500, marginTop: '12px', marginBottom: 0 }}>
                                {t.theoryDesc}
                            </p>
                        </header>

                        <div className="ht-theory-grid ht-custom-scroll" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', maxHeight: '420px', overflowY: 'auto', paddingRight: '8px', marginBottom: '28px' }}>
                            {tasks.map((hk, i) => {
                                const info = getIconInfo(hk.descKey);
                                return (
                                    <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.04, 0.4) }} style={{
                                        display: 'flex', flexDirection: 'column', padding: '20px', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '16px'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: info.bg, color: info.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                {info.svg}
                                            </div>
                                            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)', lineHeight: '1.3' }}>
                                                {getDesc(hk)}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '6px' }}>
                                            {/* Render visual keys */}
                                            {hk.visual.split(' + ').map((keyPart, j) => (
                                                <KeyCap key={j} isSmall>{keyPart}</KeyCap>
                                            ))}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>

                        <div className="ht-theory-buttons" style={{ display: 'flex', gap: '16px' }}>
                            <GradientButton variant="secondary" onClick={leaveGame} style={{ flex: '0 0 160px', height: '56px', background: 'var(--bg-panel-sec)', border: '1px solid var(--border)', boxShadow: 'none', color: 'var(--text-main)' }}>
                                {t.exit}
                            </GradientButton>
                            <GradientButton variant="primary" onClick={startGame} style={{ flex: 1, height: '56px', fontSize: '16px' }}>
                                {t.goToPractice} →
                            </GradientButton>
                        </div>
                    </motion.div>
                )}

                {/* 3. PRACTICE PHASE */}
                {phase === 'practice' && tasks.length > 0 && !isFinished && (
                    <motion.div
                        className="ht-glass-panel"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={shake ? { x: [-10, 10, -10, 10, 0], opacity: 1, scale: 1 } : { opacity: 1, scale: 1 }}
                        transition={shake ? { duration: 0.3 } : { duration: 0.4 }}
                        style={{ maxWidth: '1000px', padding: '36px' }}
                    >
                        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '20px', marginBottom: '40px' }}>
                            <button onClick={leaveGame} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'var(--text-sec)', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>
                                ← {t.exit}
                            </button>
                            <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-sec)' }}>
                                {t.title}: <span style={{ color: 'var(--text-main)' }}>{isCustomBase ? topic : 'Microsoft Word'}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{ padding: '6px 14px', borderRadius: '999px', background: 'var(--bg-panel-sec)', border: '1px solid var(--border)', fontFamily: "monospace", fontSize: '14px', fontWeight: 800 }}>
                                    <span style={{ color: 'var(--text-main)' }}>{Math.min(currentIndex + 1, tasks.length)}</span>
                                    <span style={{ color: 'var(--text-sec)', opacity: 0.5, margin: '0 4px' }}>/</span>
                                    <span style={{ color: 'var(--text-sec)' }}>{tasks.length}</span>
                                </div>
                                <LanguageSwitcher lang={lang} onChange={setLang} />
                            </div>
                        </header>

                        <div className="ht-practice-layout" style={{ display: 'flex', gap: '40px', justifyContent: 'space-between', alignItems: 'center', padding: '20px 0 60px 0' }}>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '32px' }}>
                                <div style={{ fontSize: '13px', color: 'var(--text-sec)', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 800 }}>
                                    {t.doCombination}
                                </div>
                                <motion.div
                                    key={currentIndex}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, scale: successPulse ? 1.03 : 1, y: 0 }}
                                    style={{ fontSize: '38px', fontWeight: 900, color: successPulse ? '#10B981' : 'var(--text-main)', lineHeight: 1.2, transition: 'color 0.2s' }}
                                >
                                    «{getDesc(tasks[currentIndex])}»
                                </motion.div>

                                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap', marginTop: '10px' }}>
                                    <KeyCap>Ctrl</KeyCap>
                                    <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--text-sec)', opacity: 0.4 }}>+</div>
                                    {tasks[currentIndex].shift && (
                                        <>
                                            <KeyCap>Shift</KeyCap>
                                            <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--text-sec)', opacity: 0.4 }}>+</div>
                                        </>
                                    )}
                                    <motion.div
                                        animate={{ opacity: [0.7, 1, 0.7], boxShadow: ['0 0 10px rgba(56,189,248,0.2)', '0 0 24px rgba(56,189,248,0.5)', '0 0 10px rgba(56,189,248,0.2)'] }}
                                        transition={{ repeat: Infinity, duration: 1.5 }}
                                    >
                                        <KeyCap active glowColor="var(--blue)">?</KeyCap>
                                    </motion.div>
                                </div>
                            </div>
                            <HotkeyVisual />
                        </div>

                        <ProgressKeys total={tasks.length} currentIndex={currentIndex} />
                    </motion.div>
                )}

                {/* 4. FINISHED PHASE */}
                {phase === 'practice' && isFinished && (
                    <motion.div
                        className="ht-glass-panel"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{ maxWidth: '600px', padding: '64px 40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}
                    >
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                            style={{
                                width: '96px', height: '96px', borderRadius: '50%', background: 'linear-gradient(135deg, #34D399, #10B981)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                                boxShadow: '0 20px 40px rgba(16,185,129,0.4), inset 0 2px 4px rgba(255,255,255,0.4)'
                            }}
                        >
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        </motion.div>
                        
                        <div>
                            <h2 style={{ fontSize: '42px', margin: '0 0 12px 0', fontWeight: 900, color: '#10B981', letterSpacing: '-0.5px' }}>
                                {t.finishedTitle}
                            </h2>
                            <p style={{ fontSize: '18px', color: 'var(--text-sec)', fontWeight: 600, margin: 0 }}>
                                {t.finishedDesc(score, tasks.length)}
                            </p>
                        </div>

                        <GradientButton variant="primary" onClick={resetGame} style={{ width: '100%', maxWidth: '320px', height: '56px', fontSize: '16px', marginTop: '16px' }}>
                            {t.repeat}
                        </GradientButton>
                    </motion.div>
                )}
            </div>
        );
    };

    Object.assign(window, { HotkeyTrainer });
})();
