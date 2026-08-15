const { useState, useEffect, useRef, useCallback } = React;
const { motion, AnimatePresence } = window.Motion;
const { Button } = window;

// Резервная база
const fallbackTextsData = {
    en: [
        "The universe is an unimaginably vast place, constantly expanding at an accelerating rate. Scientists believe that galaxies are moving further apart every second, driven by a mysterious force known as dark energy. Even with our most advanced telescopes, we have only mapped a tiny fraction of the observable cosmos.",
        "Artificial intelligence has rapidly evolved from simple rule-based algorithms to complex neural networks capable of learning. Today, machine learning models can recognize images, translate languages in real time, and even generate creative artwork, fundamentally changing the way we interact with modern technology."
    ],
    ru: [
        "Космос представляет собой невероятно огромное и таинственное пространство, которое постоянно расширяется с ускорением. Ученые предполагают, что галактики отдаляются друг от друга каждую секунду под воздействием загадочной темной энергии. Даже с помощью самых мощных телескопов мы смогли изучить лишь ничтожно малую часть наблюдаемой Вселенной.",
        "Искусственный интеллект прошел долгий путь развития от простых алгоритмов до сложнейших нейронных сетей, способных к глубокому обучению. Сегодня современные модели могут распознавать изображения, переводить тексты в реальном времени и даже создавать произведения искусства, меняя наш привычный мир."
    ]
};

const layouts = {
    en: [
        ["q","w","e","r","t","y","u","i","o","p", "[", "]"],
        ["a","s","d","f","g","h","j","k","l", ";", "'"],
        ["z","x","c","v","b","n","m", ",", ".", "/"],
        [" "]
    ],
    ru: [
        ["й","ц","у","к","е","н","г","ш","щ","з","х","ъ"],
        ["ф","ы","в","а","п","р","о","л","д","ж","э"],
        ["я","ч","с","м","и","т","ь","б","ю", "."],
        [" "]
    ]
};

// ---------------------------------------------------------------------------
// Design: "Mechanical keycap / terminal desk" theme.
// Self-contained palette + fonts injected once, scoped under .pt-app.
// ---------------------------------------------------------------------------

let fontsInjected = false;
const injectFonts = () => {
    if (fontsInjected || document.getElementById("pt-fonts")) return;
    fontsInjected = true;
    const link = document.createElement("link");
    link.id = "pt-fonts";
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=JetBrains+Mono:wght@400;500;700&display=swap";
    document.head.appendChild(link);
};

// ОБНОВЛЕНО: Исправлены селекторы для светлой темы.
const ptStyles = `
.pt-app {
    /* DARK THEME (DEFAULT) */
    --pt-bg: #14151f;
    --pt-panel: #1a1c29;
    --pt-panel-bot: #16171f;
    --pt-panel-alt: #232538;
    --pt-border: rgba(255,255,255,0.08);
    --pt-border-soft: rgba(255,255,255,0.05);
    --pt-text: #eef0f7;
    --pt-text-dim: #888ca6;
    --pt-text-faint: #565a72;
    --pt-amber: #ffb84a;
    --pt-violet: #8b7cff;
    --pt-violet-soft: #a78bfa;
    --pt-teal: #2dd4bf;
    --pt-coral: #ff6b7a;
    
    --pt-well-bg: radial-gradient(120% 140% at 0% 0%, #1c1e2c 0%, #15161f 70%);
    --pt-ai-panel-bg: linear-gradient(180deg, rgba(139,124,255,0.08), rgba(139,124,255,0.03));
    --pt-ai-panel-border: rgba(139,124,255,0.25);
    --pt-overlay-bg: rgba(15,16,24,0.86);

    --pt-key-bg: linear-gradient(180deg, #262838, #1b1d2a);
    --pt-key-shadow: 0 3px 0 rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04);
    
    --pt-key-target-bg: linear-gradient(180deg, #4a3a1c, #33280f);
    --pt-key-target-border: rgba(255,184,74,0.5);
    --pt-key-target-shadow: 0 3px 0 rgba(0,0,0,0.4), 0 0 16px rgba(255,184,74,0.35), inset 0 1px 0 rgba(255,255,255,0.06);

    --pt-key-hit-bg: linear-gradient(180deg, #2f5a44, #1e3c2d);
    --pt-key-hit-text: #7de8b6;
    --pt-key-hit-shadow: inset 0 1px 0 rgba(255,255,255,0.05);

    --pt-key-miss-bg: linear-gradient(180deg, #5c2733, #3c1720);
    --pt-key-miss-text: #ff98a2;
    --pt-key-miss-shadow: inset 0 1px 0 rgba(255,255,255,0.05);

    --pt-char-current-bg: var(--pt-amber);
    --pt-char-current-text: #17181f;
    --pt-char-current-shadow: 0 0 0 3px rgba(255,184,74,0.22);
    
    --pt-stat-shadow: 0 2px 0 rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.03);

    --pt-mono: 'JetBrains Mono', ui-monospace, monospace;
    --pt-display: 'Space Grotesk', system-ui, sans-serif;
    font-family: var(--pt-display);
    color: var(--pt-text);
}

/* LIGHT THEME VARIABLES - убраны невалидные псевдоклассы */
.light .pt-app,
.light-theme .pt-app,
.theme-light .pt-app,
.light-mode .pt-app,
[data-theme="light"] .pt-app,
[data-bs-theme="light"] .pt-app {
    --pt-bg: #f3f4f6;
    --pt-panel: #ffffff;
    --pt-panel-bot: #f9fafb;
    --pt-panel-alt: #f3f4f6;
    --pt-border: rgba(0,0,0,0.08);
    --pt-border-soft: rgba(0,0,0,0.04);
    --pt-text: #111827;
    --pt-text-dim: #4b5563;
    --pt-text-faint: #9ca3af;
    --pt-amber: #f59e0b;
    --pt-violet: #6d5ae0;
    --pt-violet-soft: #8b7cff;
    --pt-teal: #0d9488;
    --pt-coral: #e11d48;

    --pt-well-bg: radial-gradient(120% 140% at 0% 0%, #ffffff 0%, #f3f4f6 70%);
    --pt-ai-panel-bg: linear-gradient(180deg, rgba(109,90,224,0.06), rgba(109,90,224,0.02));
    --pt-ai-panel-border: rgba(109,90,224,0.2);
    --pt-overlay-bg: rgba(255,255,255,0.85);

    --pt-key-bg: linear-gradient(180deg, #ffffff, #f3f4f6);
    --pt-key-shadow: 0 3px 0 rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,1);
    
    --pt-key-target-bg: linear-gradient(180deg, #fffbeb, #fef3c7);
    --pt-key-target-border: rgba(245,158,11,0.5);
    --pt-key-target-shadow: 0 3px 0 rgba(0,0,0,0.1), 0 0 12px rgba(245,158,11,0.2), inset 0 1px 0 rgba(255,255,255,0.8);

    --pt-key-hit-bg: linear-gradient(180deg, #ecfdf5, #d1fae5);
    --pt-key-hit-text: #065f46;
    --pt-key-hit-shadow: inset 0 1px 0 rgba(255,255,255,0.8);

    --pt-key-miss-bg: linear-gradient(180deg, #fff1f2, #ffe4e6);
    --pt-key-miss-text: #be123c;
    --pt-key-miss-shadow: inset 0 1px 0 rgba(255,255,255,0.8);

    --pt-char-current-bg: var(--pt-amber);
    --pt-char-current-text: #17181f;
    --pt-char-current-shadow: 0 0 0 3px rgba(245,158,11,0.2);
    
    --pt-stat-shadow: 0 2px 0 rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,1);
}

/* Переключение по настройкам системы ОС (если нет жестких темных классов на body) */
@media (prefers-color-scheme: light) {
    :root:not([data-theme="dark"]):not([data-bs-theme="dark"]) body:not(.dark):not(.dark-theme):not(.dark-mode) .pt-app {
        --pt-bg: #f3f4f6;
        --pt-panel: #ffffff;
        --pt-panel-bot: #f9fafb;
        --pt-panel-alt: #f3f4f6;
        --pt-border: rgba(0,0,0,0.08);
        --pt-border-soft: rgba(0,0,0,0.04);
        --pt-text: #111827;
        --pt-text-dim: #4b5563;
        --pt-text-faint: #9ca3af;
        --pt-amber: #f59e0b;
        --pt-violet: #6d5ae0;
        --pt-violet-soft: #8b7cff;
        --pt-teal: #0d9488;
        --pt-coral: #e11d48;

        --pt-well-bg: radial-gradient(120% 140% at 0% 0%, #ffffff 0%, #f3f4f6 70%);
        --pt-ai-panel-bg: linear-gradient(180deg, rgba(109,90,224,0.06), rgba(109,90,224,0.02));
        --pt-ai-panel-border: rgba(109,90,224,0.2);
        --pt-overlay-bg: rgba(255,255,255,0.85);

        --pt-key-bg: linear-gradient(180deg, #ffffff, #f3f4f6);
        --pt-key-shadow: 0 3px 0 rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,1);
        
        --pt-key-target-bg: linear-gradient(180deg, #fffbeb, #fef3c7);
        --pt-key-target-border: rgba(245,158,11,0.5);
        --pt-key-target-shadow: 0 3px 0 rgba(0,0,0,0.1), 0 0 12px rgba(245,158,11,0.2), inset 0 1px 0 rgba(255,255,255,0.8);

        --pt-key-hit-bg: linear-gradient(180deg, #ecfdf5, #d1fae5);
        --pt-key-hit-text: #065f46;
        --pt-key-hit-shadow: inset 0 1px 0 rgba(255,255,255,0.8);

        --pt-key-miss-bg: linear-gradient(180deg, #fff1f2, #ffe4e6);
        --pt-key-miss-text: #be123c;
        --pt-key-miss-shadow: inset 0 1px 0 rgba(255,255,255,0.8);

        --pt-char-current-bg: var(--pt-amber);
        --pt-char-current-text: #17181f;
        --pt-char-current-shadow: 0 0 0 3px rgba(245,158,11,0.2);
        
        --pt-stat-shadow: 0 2px 0 rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,1);
    }
}

.pt-panel {
    background: linear-gradient(180deg, var(--pt-panel), var(--pt-panel-bot));
    border: 1px solid var(--pt-border);
    border-radius: 20px;
}
.pt-eyebrow {
    font-family: var(--pt-mono);
    font-size: 11px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--pt-text-faint);
}
.pt-tab {
    padding: 10px 22px;
    border-radius: 9px;
    border: none;
    cursor: pointer;
    font-family: var(--pt-display);
    font-weight: 600;
    font-size: 14px;
    transition: background .15s ease, color .15s ease;
    background: transparent;
    color: var(--pt-text-dim);
}
.pt-tab.pt-tab-active {
    background: var(--pt-panel-alt);
    color: var(--pt-text);
    box-shadow: inset 0 0 0 1px var(--pt-border);
}
.pt-stat {
    background: var(--pt-panel-alt);
    border: 1px solid var(--pt-border-soft);
    border-radius: 14px;
    padding: 14px 26px;
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 116px;
    flex: 1;
    box-shadow: var(--pt-stat-shadow);
}
.pt-stat-label {
    font-family: var(--pt-mono);
    font-size: 10px;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: var(--pt-text-faint);
    margin-bottom: 6px;
}
.pt-stat-value {
    font-family: var(--pt-mono);
    font-size: 22px;
    font-weight: 700;
}
.pt-ai-badge {
    font-family: var(--pt-mono);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 1.5px;
    color: #14151f; /* Всегда темный для контраста с золотым фоном */
    padding: 5px 11px;
    border-radius: 999px;
    text-transform: uppercase;
    background: linear-gradient(110deg, var(--pt-amber), #ffd98a, var(--pt-amber));
    background-size: 220% 100%;
    animation: pt-shimmer 4s linear infinite;
}
@keyframes pt-shimmer { to { background-position: -220% 0; } }
.pt-ai-panel {
    display: flex;
    flex-wrap: wrap;
    gap: 14px;
    align-items: center;
    background: var(--pt-ai-panel-bg);
    border: 1px solid var(--pt-ai-panel-border);
    padding: 14px 18px;
    border-radius: 16px;
}
.pt-ai-input {
    flex: 1 1 auto;
    min-width: 200px;
    padding: 13px 18px;
    border-radius: 11px;
    border: 1px solid var(--pt-border);
    outline: none;
    background: var(--pt-bg);
    color: var(--pt-text);
    font-family: var(--pt-display);
    font-size: 15px;
}
.pt-ai-input::placeholder { color: var(--pt-text-faint); }
.pt-ai-input:focus { border-color: var(--pt-violet-soft); }
.pt-btn-ai {
    white-space: nowrap;
    padding: 0 26px;
    height: 48px;
    background: linear-gradient(135deg, var(--pt-violet), #6d5ae0);
    color: #fff;
    border: none;
    border-radius: 11px;
    font-family: var(--pt-display);
    font-weight: 700;
    font-size: 13px;
    letter-spacing: .4px;
    cursor: pointer;
    transition: filter .15s ease, transform .1s ease;
    box-shadow: 0 6px 18px rgba(109,90,224,0.35);
}
.pt-btn-ai:hover:not(:disabled) { filter: brightness(1.1); transform: translateY(-1px); }
.pt-btn-ai:disabled { cursor: not-allowed; opacity: .6; }
.pt-text-well {
    background: var(--pt-well-bg);
    border: 1px solid var(--pt-border);
    border-radius: 18px;
    padding: 36px 38px;
    position: relative;
    min-height: 220px;
}
.pt-text-display {
    white-space: pre-wrap;
    word-break: break-word;
    display: block;
    line-height: 1.9;
    max-height: 200px;
    overflow-y: auto;
    padding-right: 10px;
    font-family: var(--pt-mono);
    font-size: 19px;
}
.pt-char { color: var(--pt-text-faint); transition: color .1s ease; }
.pt-char-correct { color: var(--pt-text-dim); }
.pt-char-current {
    color: var(--pt-char-current-text);
    background: var(--pt-char-current-bg);
    border-radius: 3px;
    box-shadow: var(--pt-char-current-shadow);
    animation: pt-cursor-pulse 1.1s ease-in-out infinite;
}
@keyframes pt-cursor-pulse { 0%,100% { opacity: 1; } 50% { opacity: .5; } }
.pt-progress-track {
    height: 6px;
    border-radius: 999px;
    background: var(--pt-panel-alt);
    overflow: hidden;
    margin-top: 22px;
}
.pt-progress-fill {
    height: 100%;
    border-radius: 999px;
    background: linear-gradient(90deg, var(--pt-amber), var(--pt-violet));
    transition: width .15s ease;
}
.pt-overlay {
    position: absolute; inset: 0;
    background: var(--pt-overlay-bg);
    backdrop-filter: blur(10px);
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    border-radius: 18px;
    z-index: 10;
    text-align: center;
}
.pt-keyboard { display: flex; flex-direction: column; gap: 8px; align-items: center; }
.pt-key-row { display: flex; gap: 6px; }
.pt-key {
    min-width: 42px;
    height: 42px;
    padding: 0 4px;
    display: flex; align-items: center; justify-content: center;
    background: var(--pt-key-bg);
    border-radius: 8px;
    border: 1px solid var(--pt-border-soft);
    box-shadow: var(--pt-key-shadow);
    color: var(--pt-text-dim);
    font-family: var(--pt-mono);
    font-size: 13px;
    text-transform: uppercase;
    transition: transform .08s ease, box-shadow .08s ease, background .15s ease, color .15s ease;
    user-select: none;
}
.pt-key-space { min-width: 260px; }
.pt-key-target {
    background: var(--pt-key-target-bg);
    border-color: var(--pt-key-target-border);
    color: var(--pt-amber);
    box-shadow: var(--pt-key-target-shadow);
}
.pt-key-hit {
    transform: translateY(3px);
    background: var(--pt-key-hit-bg);
    color: var(--pt-key-hit-text);
    box-shadow: var(--pt-key-hit-shadow);
}
.pt-key-miss {
    transform: translateY(3px);
    background: var(--pt-key-miss-bg);
    color: var(--pt-key-miss-text);
    box-shadow: var(--pt-key-miss-shadow);
}
`;

const StatCard = ({ label, value, color }) => (
    <div className="pt-stat">
        <span className="pt-stat-label">{label}</span>
        <span className="pt-stat-value" style={{ color }}>{value}</span>
    </div>
);

const TypingTest = ({ onBack }) => {
    const [lang, setLang] = useState('en');
    const [text, setText] = useState("");
    const [currentIndex, setCurrentIndex] = useState(0);
    const [errors, setErrors] = useState(0);
    const [combo, setCombo] = useState(0);
    const [maxCombo, setMaxCombo] = useState(0);
    const [startTime, setStartTime] = useState(null);
    const [endTime, setEndTime] = useState(null);
    const [pressedKey, setPressedKey] = useState(null);
    const [isErrorKey, setIsErrorKey] = useState(false);
    const [shake, setShake] = useState(false);

    // AI
    const [topic, setTopic] = useState("Искусственный интеллект");
    const [isGenerating, setIsGenerating] = useState(false);

    const textContainerRef = useRef(null);

    useEffect(() => {
        injectFonts();
    }, []);

    const generateLocalText = useCallback((currentLang) => {
        const list = fallbackTextsData[currentLang];
        return list[Math.floor(Math.random() * list.length)] + " ";
    }, []);

    // При первой загрузке или смене языка грузим локальный текст
    useEffect(() => {
        resetGame(lang, generateLocalText(lang));
    }, [lang, generateLocalText]);

    const resetGame = (currentLang = lang, newText = null) => {
        if (newText) setText(newText);
        setCurrentIndex(0);
        setErrors(0);
        setCombo(0);
        setMaxCombo(0);
        setStartTime(null);
        setEndTime(null);
        setPressedKey(null);
    };

    // ФУНКЦИЯ ОБРАЩЕНИЯ К PROXY-СЕРВЕРУ
    const fetchAIText = async () => {
        if (!topic.trim()) return alert("Введите тему!");

        setIsGenerating(true);
        resetGame(lang, " "); // Очищаем текст перед загрузкой

        const promptLang = lang === 'ru' ? 'русском' : 'английском';
        const prompt = `Сгенерируй один интересный абзац для тренажера слепой печати на тему: "${topic}". 
        Язык: ${promptLang}. 
        Объем текста: около 70-80 слов. 
        Условия: Используй заглавные буквы, запятые и точки. 
        СТРОГО ЗАПРЕЩЕНО использовать кавычки, дефисы, тире, скобки, цифры, двоеточия, эмодзи и любые другие спецсимволы. Только буквы, пробелы, запятые и точки. 
        Сразу выведи только текст, без приветствий и пояснений.`;

        try {
            console.log("🚀 Отправляем запрос на Cloudflare...");
            const response = await fetch("https://gemini-proxy-lms.msleaderindustry.workers.dev", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });

            const data = await response.json();

            console.log("📦 СЫРОЙ ОТВЕТ ОТ СЕРВЕРА:", data);

            if (data.error) {
                throw new Error(data.error.message || "Неизвестная ошибка API");
            }

            if (!data.candidates || data.candidates.length === 0) {
                throw new Error("Google не вернул текст (ответ пуст).");
            }

            let aiText = data.candidates[0].content.parts[0].text.trim();

            aiText = aiText.replace(/[*#_"«»()\[\]\-—0-9]/g, '');
            aiText = aiText.replace(/\s+/g, ' ');

            resetGame(lang, aiText + " ");

        } catch (error) {
            console.error("❌ ПРИЧИНА ОШИБКИ:", error.message);
            alert("Ошибка генерации: " + error.message);
            resetGame(lang, generateLocalText(lang));
        } finally {
            setIsGenerating(false);
        }
    };

    // Скролл к текущему символу без 'smooth'/'center', чтобы не трясло
    useEffect(() => {
        if (textContainerRef.current) {
            const currentElement = textContainerRef.current.querySelector('.pt-char-current');
            if (currentElement) {
                currentElement.scrollIntoView({ behavior: 'auto', block: 'nearest' });
            }
        }
    }, [currentIndex]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            // Игнорируем нажатия клавиш, если мы печатаем в инпуте
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            if (isGenerating) return;
            if (e.key === "Shift" || e.key === "Control" || e.key === "Alt" || e.key === "Meta" || e.key === "Backspace" || e.key === "CapsLock") return;
            if (e.key === " ") e.preventDefault();
            if (currentIndex >= text.length) return;

            const actualKey = e.key;
            const visualKey = e.key.toLowerCase();

            setPressedKey(visualKey);

            if (!startTime) setStartTime(Date.now());

            const expectedChar = text[currentIndex];

            if (actualKey === expectedChar) {
                setIsErrorKey(false);
                const newCombo = combo + 1;
                setCombo(newCombo);
                if (newCombo > maxCombo) setMaxCombo(newCombo);

                const nextIndex = currentIndex + 1;
                setCurrentIndex(nextIndex);
                if (nextIndex === text.length) setEndTime(Date.now());
            } else {
                setIsErrorKey(true);
                setErrors(prev => prev + 1);
                setCombo(0);
                setShake(true);
                setTimeout(() => setShake(false), 300);
            }

            setTimeout(() => { setPressedKey(null); setIsErrorKey(false); }, 150);
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [currentIndex, text, startTime, combo, maxCombo, isGenerating]);

    const calculateStats = () => {
        if (currentIndex === 0) return { wpm: 0, accuracy: 100 };
        const timeElapsed = endTime ? (endTime - startTime) / 1000 / 60 : (Date.now() - startTime) / 1000 / 60;
        const wordsTyped = currentIndex / 5;
        const wpm = timeElapsed > 0 ? Math.round(wordsTyped / timeElapsed) : 0;
        const totalAttempts = currentIndex + errors;
        const accuracy = totalAttempts > 0 ? Math.round((currentIndex / totalAttempts) * 100) : 100;
        return { wpm, accuracy };
    };

    const stats = calculateStats();
    const expectedKey = text[currentIndex]?.toLowerCase();
    const currentLayout = layouts[lang];
    const progress = (currentIndex / text.length) * 100;

    return (
        <motion.div
            className="pt-app pt-panel"
            initial={{ opacity: 0, y: 30 }}
            animate={shake ? { x: [-10, 10, -10, 10, 0], opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
            transition={shake ? { duration: 0.3 } : { duration: 0.6, ease: "easeOut" }}
            style={{ width: '100%', maxWidth: '1200px', display: 'flex', flexDirection: 'column', gap: '25px', padding: '32px' }}
        >
            <style>{ptStyles}</style>

            {/* ШАПКА */}
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <h2 style={{ margin: 0, fontFamily: 'var(--pt-display)', fontSize: '34px', fontWeight: '700', color: 'var(--pt-text)', letterSpacing: '-0.5px', display: 'flex', alignItems: 'baseline', gap: '2px' }}>
                            Pro<span style={{ color: 'var(--pt-amber)' }}>Type</span>
                            <motion.span
                                animate={{ opacity: [1, 0, 1] }}
                                transition={{ duration: 1.1, repeat: Infinity }}
                                style={{ display: 'inline-block', width: '4px', height: '26px', background: 'var(--pt-amber)', marginLeft: '4px', borderRadius: '1px' }}
                            />
                        </h2>
                        <span className="pt-ai-badge">AI Powered</span>
                    </div>

                    <div style={{ display: 'flex', background: 'var(--pt-bg)', borderRadius: '12px', padding: '5px', border: '1px solid var(--pt-border)', width: 'fit-content' }}>
                        <button
                            onClick={() => setLang('en')}
                            className={`pt-tab ${lang === 'en' ? 'pt-tab-active' : ''}`}
                        >English</button>
                        <button
                            onClick={() => setLang('ru')}
                            className={`pt-tab ${lang === 'ru' ? 'pt-tab-active' : ''}`}
                        >Русский</button>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <StatCard label="Комбо" value={`x${combo}`} color="var(--pt-text)" />
                    <StatCard label="Точность" value={`${stats.accuracy}%`} color={stats.accuracy < 90 ? "var(--pt-coral)" : "var(--pt-teal)"} />
                    <StatCard label="Скорость" value={`${stats.wpm} WPM`} color="var(--pt-amber)" />
                </div>
            </header>

            {/* AI ПАНЕЛЬ ГЕНЕРАЦИИ ТЕКСТА */}
            <div className="pt-ai-panel">
                <span style={{ fontSize: '22px' }}>✨</span>

                <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Тема для текста"
                    className="pt-ai-input"
                    disabled={isGenerating}
                />

                <button
                    onClick={fetchAIText}
                    disabled={isGenerating}
                    className="pt-btn-ai"
                    style={{ flexGrow: window.innerWidth < 600 ? 1 : 0 }}
                >
                    {isGenerating ? "Генерация..." : "Сгенерировать текст"}
                </button>
            </div>

            {/* КОНТЕЙНЕР ТЕКСТА */}
            <div className="pt-text-well">
                {isGenerating ? (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--pt-text-dim)' }}
                    >
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} style={{ fontSize: '36px', marginBottom: '14px' }}>⚙️</motion.div>
                        <div style={{ fontFamily: 'var(--pt-display)', fontSize: '17px' }}>Пишем уникальный текст...</div>
                    </motion.div>
                ) : (
                    <>
                        <div className="pt-text-display" ref={textContainerRef}>
                            {text.split('').map((char, index) => {
                                let statusClass = "pt-char";
                                if (index < currentIndex) statusClass = "pt-char pt-char-correct";
                                else if (index === currentIndex) statusClass = "pt-char pt-char-current";

                                return <span key={index} className={statusClass}>{char}</span>;
                            })}
                        </div>
                        <div className="pt-progress-track">
                            <div className="pt-progress-fill" style={{ width: `${progress || 0}%` }}></div>
                        </div>
                    </>
                )}

                <AnimatePresence>
                    {currentIndex === text.length && text.length > 5 && !isGenerating && (
                        <motion.div
                            className="pt-overlay"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <div className="pt-eyebrow" style={{ marginBottom: '10px' }}>Готово</div>
                            <h2 style={{ fontFamily: 'var(--pt-display)', fontSize: '44px', margin: '0 0 10px', color: 'var(--pt-text)' }}>Отличный результат!</h2>
                            <p style={{ fontFamily: 'var(--pt-mono)', fontSize: '17px', color: 'var(--pt-text-dim)', marginBottom: '28px' }}>
                                Скорость: <strong style={{ color: "var(--pt-amber)" }}>{stats.wpm} WPM</strong> &nbsp;·&nbsp;
                                Макс. комбо: <strong style={{ color: "var(--pt-violet-soft)" }}>x{maxCombo}</strong>
                            </p>
                            <div style={{ display: 'flex', gap: '15px' }}>
                                <Button variant="primary" onClick={() => fetchAIText()} style={{ width: '200px' }}>Новый AI-текст</Button>
                                <Button variant="muted" onClick={() => resetGame(lang, generateLocalText(lang))} style={{ width: '200px' }}>Обычный текст</Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* КЛАВИАТУРА */}
            <div className="pt-keyboard" style={{ opacity: isGenerating ? 0.5 : 1, pointerEvents: isGenerating ? 'none' : 'auto' }}>
                {currentLayout.map((row, rIndex) => (
                    <div key={`${lang}-${rIndex}`} className="pt-key-row">
                        {row.map((key, kIndex) => {
                            const isSpace = key === " ";
                            const isTarget = key === expectedKey;
                            const isActive = key === pressedKey;

                            let classNames = "pt-key";
                            if (isSpace) classNames += " pt-key-space";
                            if (isTarget) classNames += " pt-key-target";
                            if (isActive) classNames += isErrorKey ? " pt-key-miss" : " pt-key-hit";

                            return (
                                <div key={`${lang}-${key}-${kIndex}`} className={classNames}>
                                    {isSpace ? "SPACE" : key}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </motion.div>
    );
}

Object.assign(window, { TypingTest });
