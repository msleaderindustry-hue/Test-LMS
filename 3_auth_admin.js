// --- ВЫНЕСЕННЫЕ КОМПОНЕНТЫ ---
const { useState, useEffect, useRef } = React;
const { motion, AnimatePresence } = window.Motion;
const { Button } = window;

// ============================================================================
// --- ТИТУЛЬНЫЙ ЭКРАН (WELCOME SCREEN) ---
// ============================================================================
const WelcomeScreen = ({ onEnter }) => {
    const stageRef = useRef(null);
    const canvasRef = useRef(null);
    const contentRef = useRef(null);
    const cgRef = useRef(null);
    const cdRef = useRef(null);
    const c1Ref = useRef(null);
    const c2Ref = useRef(null);
    const c3Ref = useRef(null);

    useEffect(() => {
        let mouse = { x: -9999, y: -9999 };
        
        const handleMouseMove = (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
            
            if (cgRef.current && cdRef.current) {
                cgRef.current.style.left = e.clientX + 'px';
                cgRef.current.style.top = e.clientY + 'px';
                cdRef.current.style.left = e.clientX + 'px';
                cdRef.current.style.top = e.clientY + 'px';
            }
            if (contentRef.current) {
                const x = (e.clientX / window.innerWidth - 0.5) * 2;
                const y = (e.clientY / window.innerHeight - 0.5) * 2;
                contentRef.current.style.transform = `rotateY(${x * 3}deg) rotateX(${-y * 3}deg)`;
            }
        };
        
        const handleMouseLeave = () => {
            mouse.x = -9999;
            mouse.y = -9999;
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseleave', handleMouseLeave);

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let w, h, particles = [];
        const COUNT = 70;
        const MAXDIST = 140;
        let animationId;

        const resize = () => {
            w = canvas.width = window.innerWidth;
            h = canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resize);
        resize();

        const initParticles = () => {
            particles = [];
            for(let i = 0; i < COUNT; i++) {
                particles.push({
                    x: Math.random() * w,
                    y: Math.random() * h,
                    vx: (Math.random() - 0.5) * 0.35,
                    vy: (Math.random() - 0.5) * 0.35,
                    r: 1 + Math.random() * 1.6
                });
            }
        };
        initParticles();

        const step = () => {
            ctx.clearRect(0, 0, w, h);

            for(const p of particles){
                p.x += p.vx; p.y += p.vy;
                if(p.x < 0 || p.x > w) p.vx *= -1;
                if(p.y < 0 || p.y > h) p.vy *= -1;

                const dx = mouse.x - p.x, dy = mouse.y - p.y;
                const d = Math.sqrt(dx*dx + dy*dy);
                if(d < 160){
                    p.x -= dx * 0.0016; p.y -= dy * 0.0016;
                }
            }

            for(let i = 0; i < particles.length; i++){
                for(let j = i + 1; j < particles.length; j++){
                    const a = particles[i], b = particles[j];
                    const dx = a.x - b.x, dy = a.y - b.y;
                    const dist = Math.sqrt(dx*dx + dy*dy);
                    if(dist < MAXDIST){
                        const op = (1 - dist / MAXDIST) * 0.5;
                        ctx.strokeStyle = `rgba(139,92,246,${op*0.5})`;
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
                        ctx.stroke();
                    }
                }
                const dxm = particles[i].x - mouse.x, dym = particles[i].y - mouse.y;
                const dm = Math.sqrt(dxm*dxm + dym*dym);
                if(dm < 180){
                    ctx.strokeStyle = `rgba(34,211,238,${(1 - dm/180) * 0.6})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(mouse.x, mouse.y);
                    ctx.stroke();
                }
            }

            for(const p of particles){
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(219,213,255,0.85)';
                ctx.fill();
            }

            animationId = requestAnimationFrame(step);
        };
        step();

        const animateCount = (el, target, dur) => {
            if (!el) return;
            const start = performance.now();
            const tick = (now) => {
                const p = Math.min(1, (now - start) / dur);
                const eased = 1 - Math.pow(1 - p, 3);
                el.textContent = Math.round(eased * target).toLocaleString('ru-RU');
                if(p < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
        };

        const timeoutId = setTimeout(() => {
            animateCount(c1Ref.current, 12480, 1400);
            animateCount(c2Ref.current, 3200, 1400);
            animateCount(c3Ref.current, 87, 1200);
        }, 1250);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseleave', handleMouseLeave);
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationId);
            clearTimeout(timeoutId);
        };
    }, []);

    const handleEnterClick = () => {
        if (stageRef.current) {
            stageRef.current.style.transition = 'opacity .5s ease, transform .5s ease';
            stageRef.current.style.opacity = '0';
            stageRef.current.style.transform = 'scale(1.03)';
            
            setTimeout(() => {
                if (onEnter) onEnter();
            }, 500);
        }
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 9999, background: '#08070f' }}>
            <style dangerouslySetInnerHTML={{__html: `
                @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700;800&family=Inter:wght@400;500;600&display=swap');
                
                :root{
                    --bg: #08070f;
                    --bg-2: #0e0c1c;
                    --card: rgba(20,18,34,0.55);
                    --card-border: rgba(255,255,255,0.09);
                    --text-main: #f3f1fb;
                    --text-sec: #9b97b8;
                    --violet: #8b5cf6;
                    --violet-2: #b767f0;
                    --cyan: #22d3ee;
                    --amber-a: #f7c948;
                    --amber-b: #f98b4a;
                }
                
                .welcome-wrapper {
                    height:100%;
                    background: var(--bg);
                    overflow: hidden;
                    font-family:'Inter', system-ui, sans-serif;
                    cursor: none;
                }

                .stage{ position:relative; width:100%; height:100vh; }
                canvas#net{ position:absolute; inset:0; display:block; }

                .glow{ position:absolute; border-radius:50%; filter: blur(90px); pointer-events:none; opacity:.55; }
                .glow.g1{ width:520px; height:520px; background: radial-gradient(circle, var(--violet), transparent 70%); top:-140px; left:-120px; animation: drift1 14s ease-in-out infinite; }
                .glow.g2{ width:480px; height:480px; background: radial-gradient(circle, var(--cyan), transparent 70%); bottom:-160px; right:-100px; animation: drift2 16s ease-in-out infinite; }
                .glow.g3{ width:360px; height:360px; background: radial-gradient(circle, var(--amber-b), transparent 70%); top:40%; right:15%; opacity:.28; animation: drift1 20s ease-in-out infinite reverse; }
                @keyframes drift1{ 0%,100%{ transform: translate(0,0); } 50%{ transform: translate(60px,40px); } }
                @keyframes drift2{ 0%,100%{ transform: translate(0,0); } 50%{ transform: translate(-50px,-50px); } }

                .cursor-glow{
                    position: fixed; width: 320px; height: 320px; border-radius:50%;
                    background: radial-gradient(circle, rgba(139,92,246,0.14), transparent 65%);
                    pointer-events:none; z-index: 3;
                    transform: translate(-50%,-50%);
                    transition: opacity .3s ease;
                }
                .cursor-dot{
                    position: fixed; width: 8px; height: 8px; border-radius: 50%;
                    background: var(--cyan); box-shadow: 0 0 14px 3px rgba(34,211,238,0.7);
                    pointer-events:none; z-index: 4; transform: translate(-50%,-50%);
                }

                .menu-btn{
                    position:absolute; top:26px; left:26px; z-index:5;
                    width:46px; height:46px; border-radius:14px;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid var(--card-border);
                    backdrop-filter: blur(6px);
                    display:flex; flex-direction:column; align-items:center; justify-content:center; gap:4px;
                    opacity:0; animation: fadeIn .6s ease .9s forwards;
                }
                .menu-btn span{ width:18px; height:2px; background:#e8e6f5; border-radius:2px; }

                .content{
                    position:relative; z-index: 2;
                    height:100%;
                    display:flex; flex-direction:column; align-items:center; justify-content:center;
                    text-align:center;
                    padding: 20px;
                    perspective: 1200px;
                }

                .eyebrow{
                    font-family:'Space Grotesk', sans-serif;
                    font-size: 12px; letter-spacing: 4px; text-transform:uppercase;
                    color: var(--text-sec);
                    display:flex; align-items:center; gap:10px;
                    margin-bottom: 26px;
                    opacity:0; animation: fadeUp .7s ease .1s forwards;
                }
                .eyebrow .pulse{
                    width:6px; height:6px; border-radius:50%; background: var(--cyan);
                    box-shadow: 0 0 10px 2px rgba(34,211,238,0.8);
                    animation: pulse 1.6s ease-in-out infinite;
                }
                @keyframes pulse{ 0%,100%{ opacity:1; transform:scale(1);} 50%{ opacity:.4; transform:scale(1.6);} }

                .title{
                    font-family:'Space Grotesk', sans-serif;
                    font-weight: 800;
                    font-size: clamp(42px, 8vw, 88px);
                    line-height: 1.02;
                    letter-spacing: -1.5px;
                    margin-bottom: 22px;
                    color: var(--text-main);
                }
                .title .line{ overflow:hidden; display:block; }
                .title .line span{
                    display:inline-block;
                    background: linear-gradient(100deg, #ffffff 10%, var(--violet-2) 55%, var(--cyan) 100%);
                    -webkit-background-clip:text; background-clip:text; color:transparent;
                    transform: translateY(110%);
                    animation: riseWord .8s cubic-bezier(.16,1,.3,1) forwards;
                }
                @keyframes riseWord{ to{ transform: translateY(0); } }

                .subtitle{
                    max-width: 480px;
                    font-size: 17px; line-height: 1.65;
                    color: var(--text-sec);
                    margin-bottom: 42px;
                    opacity:0; animation: fadeUp .7s ease .85s forwards;
                }

                .cta-row{
                    display:flex; align-items:center; gap:18px; flex-wrap:wrap; justify-content:center;
                    opacity:0; animation: fadeUp .7s ease 1s forwards;
                }

                .cta{
                    position:relative;
                    display:inline-flex; align-items:center; justify-content:center; gap:10px;
                    padding: 18px 44px;
                    border-radius: 999px;
                    border: none;
                    cursor: none;
                    font-family:'Space Grotesk', sans-serif;
                    font-weight:700; font-size:16px; letter-spacing:.3px;
                    color:#1c1206;
                    background: linear-gradient(100deg, var(--amber-a), var(--amber-b));
                    box-shadow: 0 0 0 rgba(249,139,74,0.0);
                    transition: transform .12s ease, box-shadow .25s ease;
                    overflow: hidden;
                }
                .cta::before{
                    content:''; position:absolute; inset:-2px; border-radius: 999px;
                    background: conic-gradient(from 0deg, var(--amber-a), var(--amber-b), var(--violet-2), var(--cyan), var(--amber-a));
                    z-index:-1; opacity:0; filter: blur(10px);
                    transition: opacity .3s ease;
                }
                .cta:hover::before{ opacity:.9; }
                .cta:hover{ box-shadow: 0 16px 40px rgba(249,139,74,0.35); }
                .cta svg{ width:18px; height:18px; transition: transform .2s ease; }
                .cta:hover svg{ transform: translateX(4px); }

                .ghost-btn{
                    padding: 18px 30px;
                    border-radius: 999px;
                    border: 1px solid var(--card-border);
                    background: rgba(255,255,255,0.03);
                    color: var(--text-main);
                    font-family:'Space Grotesk', sans-serif; font-weight:600; font-size:15px;
                    cursor:none;
                    backdrop-filter: blur(6px);
                    transition: background .2s ease, border-color .2s ease, transform .12s ease;
                }
                .ghost-btn:hover{ background: rgba(255,255,255,0.07); border-color: rgba(255,255,255,0.2); }

                .stat-row{
                    display:flex; gap:46px; margin-top: 64px;
                    opacity:0; animation: fadeUp .7s ease 1.15s forwards;
                }
                .stat{ text-align:center; }
                .stat b{
                    display:block; font-family:'Space Grotesk', sans-serif; font-weight:700;
                    font-size: 30px;
                    background: linear-gradient(100deg, var(--cyan), var(--violet-2));
                    -webkit-background-clip:text; background-clip:text; color:transparent;
                }
                .stat span{ font-size: 12px; letter-spacing:1px; text-transform:uppercase; color: var(--text-sec); }

                @keyframes fadeUp{ from{ opacity:0; transform: translateY(16px);} to{ opacity:1; transform: translateY(0);} }
                @keyframes fadeIn{ to{ opacity:1; } }

                .scanline{
                    position:absolute; left:0; right:0; height:2px;
                    background: linear-gradient(90deg, transparent, var(--cyan), transparent);
                    top: 0; z-index: 6; opacity:.8;
                    animation: scan 2.4s ease-in-out .2s 1;
                }
                @keyframes scan{
                    0%{ top: 30%; opacity:0; }
                    10%{ opacity:.9; }
                    90%{ opacity:.9; }
                    100%{ top: 72%; opacity:0; }
                }

                .footer-note{
                    position:absolute; bottom: 22px; left:0; right:0; text-align:center;
                    font-size: 11px; color: var(--text-sec); opacity:0;
                    animation: fadeIn .6s ease 1.3s forwards;
                    letter-spacing:.5px;
                }
            `}} />

            <div className="welcome-wrapper">
                <div className="stage" id="stage" ref={stageRef}>
                    <canvas id="net" ref={canvasRef}></canvas>
                    <div className="glow g1"></div>
                    <div className="glow g2"></div>
                    <div className="glow g3"></div>
                    <div className="scanline"></div>

                    <div className="menu-btn"><span></span><span></span><span></span></div>

                    <div className="content" id="content" ref={contentRef}>
                        <div className="eyebrow"><span className="pulse"></span> ULTIMATE LMS · EXAM MODE</div>
                        <h1 className="title">
                            <span className="line"><span style={{animationDelay: '.15s'}}>Знания.</span></span>
                            <span className="line"><span style={{animationDelay: '.3s'}}>Проверка.</span></span>
                            <span className="line"><span style={{animationDelay: '.45s'}}>Результат.</span></span>
                        </h1>
                        <p className="subtitle">Платформа для тестов и тренажёров, которая помнит твой прогресс — и умеет удивлять с первой секунды.</p>

                        <div className="cta-row">
                            <button className="cta" id="enterBtn" onClick={handleEnterClick}>
                                Войти в платформу
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M13 6l6 6-6 6"/></svg>
                            </button>
                            <button className="ghost-btn">Как это работает</button>
                        </div>

                        <div className="stat-row">
                            <div className="stat"><b ref={c1Ref}>0</b><span>тестов пройдено</span></div>
                            <div className="stat"><b ref={c2Ref}>0</b><span>учеников</span></div>
                            <div className="stat"><b ref={c3Ref}>0</b><span>% средняя точность</span></div>
                        </div>
                    </div>

                    <div className="footer-note">© 2026 Alisher. All Rights Reserved.</div>
                </div>

                <div className="cursor-glow" id="cg" ref={cgRef}></div>
                <div className="cursor-dot" id="cd" ref={cdRef}></div>
            </div>
        </div>
    );
};

// ============================================================================
// --- ЭКРАН АВТОРИЗАЦИИ ---
// ============================================================================
const AuthScreen = React.memo(() => {
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleGoogleSignIn = async () => {
        setError('');
        setIsLoading(true);
        try {
            const provider = new window.firebase.auth.GoogleAuthProvider();
            const result = await window.auth.signInWithPopup(provider);
            const user = result.user;

            const userDoc = await window.db.collection('users').doc(user.uid).get();

            if (!userDoc.exists) {
                await window.db.collection('users').doc(user.uid).set({
                    email: user.email,
                    role: 'student',
                    isBanned: false,
                    registeredAt: new Date().toISOString(),
                    allowedModules: ['chat', 'typing', 'hotkeys', 'code', 'flashcards', 'excel', 'algo'],
                    excelHintsEnabled: true // По умолчанию подсказки включены
                });
            }
        } catch (err) {
            console.error(err);
            let errMsg = "Произошла ошибка при авторизации.";
            if (err.code === 'auth/popup-closed-by-user') {
                errMsg = "Вы закрыли окно авторизации. Попробуйте снова.";
            } else if (err.code === 'auth/network-request-failed') {
                errMsg = "Ошибка сети. Проверьте интернет-соединение.";
            } else if (err.code === 'auth/operation-not-allowed') {
                errMsg = "Вход через Google не включен в настройках Firebase!";
            }
            setError(errMsg);
            setIsLoading(false);
        }
    };

    return (
        <motion.div
            key="auth"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="glass-panel"
            style={{
                width: '100%', maxWidth: '400px', textAlign: 'center', padding: '44px 32px',
                borderRadius: '28px', boxShadow: '0 20px 60px -15px rgba(0,0,0,0.18)',
                position: 'relative', overflow: 'hidden'
            }}
        >
            <div style={{
                position: 'absolute', top: '-60px', right: '-60px', width: '160px', height: '160px',
                borderRadius: '50%', background: 'radial-gradient(circle, rgba(56,189,248,0.16), transparent 70%)',
                pointerEvents: 'none'
            }} />

            <div style={{
                width: '64px', height: '64px', borderRadius: '20px', margin: '0 auto 22px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px',
                background: 'linear-gradient(135deg, #38bdf8 0%, #6366f1 100%)',
                boxShadow: '0 10px 25px -8px rgba(99,102,241,0.55)'
            }}>
                🔐
            </div>

            <h2 style={{ margin: '0 0 8px', fontSize: '22px', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.3px' }}>
                Вход в систему
            </h2>
            <p style={{ margin: '0 0 28px', fontSize: '13px', color: 'var(--text-sec)', fontWeight: 600, lineHeight: 1.5 }}>
                Используйте рабочий аккаунт Google, чтобы продолжить
            </p>

            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
                        animate={{ opacity: 1, height: 'auto', marginBottom: '16px' }}
                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                        style={{
                            color: '#ef4444', fontSize: '13px', background: 'rgba(239, 68, 68, 0.08)',
                            padding: '12px 14px', borderRadius: '14px', border: '1px solid rgba(239, 68, 68, 0.25)',
                            fontWeight: '600', textAlign: 'left'
                        }}
                    >
                        ⚠️ {error}
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.015, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                    width: '100%', height: '54px', borderRadius: '16px', border: '1px solid var(--glass-border)',
                    background: 'var(--bg-panel)', color: 'var(--text-main)', fontSize: '15px', fontWeight: '800',
                    cursor: isLoading ? 'not-allowed' : 'pointer', boxShadow: '0 6px 18px rgba(0,0,0,0.06)',
                    opacity: isLoading ? 0.65 : 1, transition: '0.2s'
                }}
            >
                {isLoading ? (
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                        style={{ width: 18, height: 18, borderRadius: '50%', border: '2.5px solid var(--glass-border)', borderTopColor: '#38bdf8' }}
                    />
                ) : (
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: 22, height: 22 }} />
                )}
                {isLoading ? 'Входим…' : 'Продолжить с Google'}
            </motion.button>

            <div style={{ marginTop: '22px', fontSize: '11.5px', color: 'var(--text-sec)', opacity: 0.75, fontWeight: 600, letterSpacing: '0.2px' }}>
                Доступ разрешён только для подтверждённых аккаунтов
            </div>
        </motion.div>
    );
});

// СПИСОК ВСЕХ МОДУЛЕЙ ДЛЯ ВЫДАЧИ ДОСТУПА
const AVAILABLE_MODULES = [
    { id: 'chat', icon: '💬', label: 'Чат', color: '#06b6d4' },
    { id: 'typing', icon: '⌨️', label: 'Печать', color: '#818cf8' },
    { id: 'hotkeys', icon: '⚡', label: 'Хоткеи', color: '#fbbf24' },
    { id: 'code', icon: '💻', label: 'VS School', color: '#2dd4bf' },
    { id: 'flashcards', icon: '🎴', label: 'Карточки', color: '#3b82f6' },
    { id: 'excel', icon: '📊', label: 'Excel', color: '#10b981' },
    { id: 'algo', icon: '🧩', label: 'Конструктор', color: '#0ea5e9' }
];

const TABS = [
    { id: 'control', icon: '👤', label: 'Управление', color: '#38bdf8' },
    { id: 'settings', icon: '⚙️', label: 'Настройки', color: '#a855f7' },
    { id: 'tests', icon: '📝', label: 'Тесты', color: '#10b981' }
];

// --- КОМПОНЕНТ: КАРТОЧКА ПОЛЬЗОВАТЕЛЯ С ВКЛАДКАМИ ---
const UserAdminCard = ({ u, currentUserUid, toggleAdmin, toggleBan, handleAssignTestFile, toggleExcelHints, toggleModuleAccess, hasAccess, removeTest }) => {
    const [activeTab, setActiveTab] = useState('control');
    const testCount = (u.assignedTests && u.assignedTests.length) || 0;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={{
                background: 'var(--bg-body)', border: '1px solid var(--glass-border)', borderRadius: '22px',
                padding: '22px', boxShadow: '0 10px 30px rgba(0,0,0,0.04)'
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                <div style={{
                    width: '50px', height: '50px', borderRadius: '16px', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px',
                    background: u.isBanned ? 'rgba(239, 68, 68, 0.1)' : 'linear-gradient(135deg, rgba(56,189,248,0.18), rgba(99,102,241,0.18))',
                    border: `1.5px solid ${u.isBanned ? 'rgba(239,68,68,0.4)' : 'var(--glass-border)'}`
                }}>
                    {u.isBanned ? '🚫' : '👤'}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{
                        fontWeight: 800, fontSize: '15.5px', color: 'var(--text-main)', marginBottom: '5px',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                    }}>
                        {u.nickname || u.email}
                    </div>
                    <div style={{ fontSize: '11px', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.3px', color: u.isBanned ? '#ef4444' : '#10b981' }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: u.isBanned ? '#ef4444' : '#10b981', display: 'inline-block' }} />
                            {u.isBanned ? 'Заблокирован' : 'Активен'}
                        </span>
                        {u.role === 'admin' && (
                            <span style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)', color: '#fff', padding: '2px 7px', borderRadius: '6px', fontWeight: 800, fontSize: '10px', letterSpacing: '0.3px' }}>
                                АДМИН
                            </span>
                        )}
                        <span style={{ color: 'var(--text-sec)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.email}</span>
                    </div>
                </div>
            </div>

            <div className="modern-scroll" style={{ display: 'flex', gap: '6px', marginBottom: '20px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '14px', overflowX: 'auto' }}>
                {TABS.map(tab => {
                    const isActive = activeTab === tab.id;
                    return (
                        <div
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                position: 'relative', cursor: 'pointer', padding: '8px 15px', borderRadius: '12px',
                                fontWeight: 800, fontSize: '12.5px', transition: 'color 0.2s', whiteSpace: 'nowrap',
                                color: isActive ? tab.color : 'var(--text-sec)', display: 'flex', alignItems: 'center', gap: '6px'
                            }}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId={`tab-bg-${u.id}`}
                                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                                    style={{
                                        position: 'absolute', inset: 0, borderRadius: '12px',
                                        background: `${tab.color}17`, border: `1px solid ${tab.color}40`
                                    }}
                                />
                            )}
                            <span style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                {tab.icon} {tab.label}{tab.id === 'tests' ? ` (${testCount})` : ''}
                            </span>
                        </div>
                    );
                })}
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.18 }}
                >
                    {activeTab === 'control' && (
                        <div>
                            {u.id !== currentUserUid ? (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', width: '100%' }}>
                                    <div style={{ display: 'flex' }}>
                                        <Button
                                            variant={u.role === 'admin' ? "orange" : "muted"}
                                            style={{ width: '100%', whiteSpace: 'nowrap', height: '44px', padding: '0 15px', borderRadius: '13px', fontSize: '11px', fontWeight: 800, margin: 0, textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center', textTransform: 'uppercase', letterSpacing: '0.3px' }}
                                            onClick={() => toggleAdmin(u.id, u.role)}
                                        >
                                            {u.role === 'admin' ? "Снять админа" : "Дать админа"}
                                        </Button>
                                    </div>
                                    <div style={{ display: 'flex' }}>
                                        <label style={{
                                            width: '100%', whiteSpace: 'nowrap', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white', borderRadius: '13px', padding: '0 15px', height: '44px',
                                            fontSize: '11px', fontWeight: 800, transition: '0.2s', boxShadow: '0 6px 16px rgba(0, 242, 254, 0.25)', margin: 0, textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.3px'
                                        }}>
                                            📁 Назначить тест
                                            <input type="file" accept=".json" style={{ display: 'none' }} onChange={(e) => handleAssignTestFile(e, u.id)} />
                                        </label>
                                    </div>
                                    <div style={{ display: 'flex' }}>
                                        <Button
                                            variant={u.isBanned ? "green" : "red"}
                                            style={{ width: '100%', whiteSpace: 'nowrap', height: '44px', padding: '0 15px', borderRadius: '13px', fontSize: '11px', fontWeight: 800, margin: 0, textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center', textTransform: 'uppercase', letterSpacing: '0.3px' }}
                                            onClick={() => toggleBan(u.id, u.isBanned)}
                                        >
                                            {u.isBanned ? "Разбанить" : "Забанить"}
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div style={{
                                    padding: '16px', background: 'rgba(245, 158, 11, 0.08)', border: '1px dashed #f59e0b',
                                    borderRadius: '14px', color: '#d97706', fontSize: '13px', fontWeight: 600, textAlign: 'center'
                                }}>
                                    ⚠️ Вы не можете изменять базовые права собственного аккаунта
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div style={{ background: 'var(--bg-panel)', borderRadius: '16px', padding: '16px', border: '1px solid var(--glass-border)' }}>
                                <div style={{ fontSize: '11px', color: 'var(--text-sec)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
                                    ⚙️ Настройки режимов
                                </div>
                                <Button
                                    variant={u.excelHintsEnabled !== false ? "green" : "red"}
                                    onClick={() => toggleExcelHints(u.id, u)}
                                    style={{ width: '100%', maxWidth: '360px', height: '44px', borderRadius: '12px', fontSize: '11.5px', fontWeight: 800, margin: 0, textTransform: 'uppercase', letterSpacing: '0.3px' }}
                                >
                                    {u.excelHintsEnabled !== false ? "💡 Подсказки Excel: включены" : "🔒 Подсказки Excel: режим экзамена"}
                                </Button>
                            </div>

                            <div style={{ background: 'var(--bg-panel)', borderRadius: '16px', padding: '16px', border: '1px solid var(--glass-border)' }}>
                                <div style={{ fontSize: '11px', color: 'var(--text-sec)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
                                    Доступ к модулям платформы
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {AVAILABLE_MODULES.map(module => {
                                        const access = hasAccess(u, module.id);
                                        return (
                                            <motion.div
                                                key={module.id}
                                                whileHover={{ scale: 1.03 }}
                                                whileTap={{ scale: 0.97 }}
                                                onClick={() => toggleModuleAccess(u.id, u, module.id)}
                                                style={{
                                                    display: 'inline-flex', alignItems: 'center', gap: '7px',
                                                    padding: '7px 13px', borderRadius: '11px',
                                                    cursor: 'pointer', transition: 'background 0.2s, border-color 0.2s',
                                                    background: access ? `${module.color}17` : 'var(--bg-body)',
                                                    border: `1.5px solid ${access ? `${module.color}55` : 'var(--glass-border)'}`,
                                                    color: access ? module.color : 'var(--text-sec)',
                                                    opacity: access ? 1 : 0.55,
                                                    width: 'auto'
                                                }}
                                            >
                                                <span style={{ fontSize: '14px', filter: access ? 'none' : 'grayscale(100%)' }}>{module.icon}</span>
                                                <span style={{ fontSize: '12px', fontWeight: 800 }}>{module.label}</span>
                                                {access && <span style={{ fontSize: '10px' }}>✓</span>}
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'tests' && (
                        <div>
                            {testCount === 0 ? (
                                <div style={{
                                    padding: '24px 18px', textAlign: 'center', color: 'var(--text-sec)', fontSize: '13px', fontWeight: 600,
                                    background: 'var(--bg-panel)', borderRadius: '14px', border: '1px dashed var(--glass-border)', lineHeight: 1.6
                                }}>
                                    📭 Нет назначенных персональных тестов<br />
                                    Перейдите во вкладку «Управление», чтобы назначить новый тест
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                    {u.assignedTests.map(test => (
                                        <div key={test.id} style={{
                                            background: 'var(--bg-panel)', border: '1px dashed #3b82f6', color: '#3b82f6', fontSize: '13px', fontWeight: 700,
                                            display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '8px 12px 8px 14px', borderRadius: '12px', width: 'auto'
                                        }}>
                                            <span>☁️ {test.title}</span>
                                            <div
                                                onClick={() => removeTest(u.id, test.id)}
                                                style={{
                                                    cursor: 'pointer', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', width: '20px', height: '20px',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontSize: '10px', transition: '0.2s'
                                                }}
                                            >
                                                ✖
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </motion.div>
    );
};

// --- АДМИН-ПАНЕЛЬ ---
const AdminPanel = ({ onKicked }) => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        if (!window.db) return;
        const unsub = window.db.collection('users').onSnapshot(snap => {
            setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });
        return () => unsub();
    }, []);

    useEffect(() => {
        if (users.length === 0) return;
        const currentUserId = window.auth?.currentUser?.uid;
        if (!currentUserId) return;

        const currentUserData = users.find(u => u.id === currentUserId);
        if (currentUserData && currentUserData.role !== 'admin') {
            alert("Ваши права администратора были отозваны! Вы переведены в режим студента.");
            if (onKicked) onKicked();
        }
    }, [users, onKicked]);

    const toggleBan = async (uid, currentStatus) => {
        try { await window.db.collection('users').doc(uid).update({ isBanned: !currentStatus }); } catch (e) { alert("Ошибка при изменении статуса"); }
    };

    const toggleAdmin = async (uid, currentRole) => {
        try {
            const newRole = currentRole === 'admin' ? 'student' : 'admin';
            await window.db.collection('users').doc(uid).update({ role: newRole });
        } catch (e) { alert("Ошибка при изменении роли"); }
    };

    const toggleModuleAccess = async (uid, user, moduleId) => {
        let currentModules = user.allowedModules;
        if (!currentModules) currentModules = AVAILABLE_MODULES.map(m => m.id);

        let newModules;
        if (currentModules.includes(moduleId)) {
            newModules = currentModules.filter(id => id !== moduleId);
        } else {
            newModules = [...currentModules, moduleId];
        }

        try { await window.db.collection('users').doc(uid).update({ allowedModules: newModules }); }
        catch (e) { alert("Ошибка при обновлении доступов."); }
    };

    const toggleExcelHints = async (uid, user) => {
        const currentStatus = user.excelHintsEnabled !== false;
        try {
            await window.db.collection('users').doc(uid).update({ excelHintsEnabled: !currentStatus });
        } catch (e) {
            alert("Ошибка при обновлении настроек тренажера.");
        }
    };

    const hasAccess = (user, moduleId) => {
        if (!user.allowedModules) return true;
        return user.allowedModules.includes(moduleId);
    };

    const handleAssignTestFile = (e, uid) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (ev) => {
            try {
                const data = JSON.parse(ev.target.result);
                const title = prompt("Введите название теста:", "Тест от преподавателя");
                if (!title) return;

                const normalized = data.map(t => ({
                    question: t.question || '', questionImg: t.questionImg || null,
                    variants: (t.variants || []).map(v => typeof v === 'object' ? v : { text: String(v), img: null }),
                    correctIndex: t.correctIndex
                }));

                const currentUser = users.find(u => u.id === uid);
                const currentTests = currentUser.assignedTests || [];
                const newTest = { id: Date.now(), title: title.trim(), data: normalized };

                await window.db.collection('users').doc(uid).update({ assignedTests: [...currentTests, newTest] });
                alert("✅ Тест успешно загружен и добавлен студенту!");
            } catch (err) { alert("Ошибка чтения JSON файла!"); }
        };
        reader.readAsText(file);
        e.target.value = null;
    };

    const removeTest = async (uid, testId) => {
        if (confirm("Удалить этот тест у студента?")) {
            try {
                const currentUser = users.find(u => u.id === uid);
                const updatedTests = (currentUser.assignedTests || []).filter(t => t.id !== testId);
                await window.db.collection('users').doc(uid).update({ assignedTests: updatedTests });
            } catch (e) { alert("Ошибка при удалении теста"); }
        }
    };

    const currentUserUid = window.auth?.currentUser?.uid;
    const adminCount = users.filter(u => u.role === 'admin').length;
    const bannedCount = users.filter(u => u.isBanned).length;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="glass-panel"
            style={{ width: '100%', maxWidth: '1000px', maxHeight: '90vh', overflowY: 'auto', padding: '32px', borderRadius: '26px' }}
        >
            <header style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px',
                borderBottom: '1px solid var(--glass-border)', paddingBottom: '22px', marginBottom: '28px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{
                        width: '52px', height: '52px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '24px', background: 'linear-gradient(135deg, #ef4444, #f97316)', boxShadow: '0 10px 24px -8px rgba(239,68,68,0.5)'
                    }}>
                        🛡️
                    </div>
                    <div style={{ textAlign: 'left' }}>
                        <h2 style={{ margin: 0, fontSize: '23px', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>Панель управления</h2>
                        <div style={{ fontSize: '13px', color: 'var(--text-sec)', fontWeight: 600 }}>Настройка доступов и тестов</div>
                    </div>
                </div>

                {users.length > 0 && (
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <div style={{ padding: '8px 14px', borderRadius: '12px', background: 'var(--bg-body)', border: '1px solid var(--glass-border)', fontSize: '12px', fontWeight: 800, color: 'var(--text-sec)' }}>
                            👥 {users.length} всего
                        </div>
                        <div style={{ padding: '8px 14px', borderRadius: '12px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', fontSize: '12px', fontWeight: 800, color: '#d97706' }}>
                            ⭐ {adminCount} админ{adminCount === 1 ? '' : adminCount >= 2 && adminCount <= 4 ? 'а' : 'ов'}
                        </div>
                        {bannedCount > 0 && (
                            <div style={{ padding: '8px 14px', borderRadius: '12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', fontSize: '12px', fontWeight: 800, color: '#ef4444' }}>
                                🚫 {bannedCount} забанен{bannedCount === 1 ? '' : 'о'}
                            </div>
                        )}
                    </div>
                )}
            </header>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {users.length === 0 && (
                    <div style={{ textAlign: 'center', color: 'var(--text-sec)', padding: '50px 20px', fontWeight: 600, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                            style={{ width: 28, height: 28, borderRadius: '50%', border: '3px solid var(--glass-border)', borderTopColor: '#ef4444' }}
                        />
                        Загрузка пользователей базы данных…
                    </div>
                )}

                {users.map(u => (
                    <UserAdminCard
                        key={u.id}
                        u={u}
                        currentUserUid={currentUserUid}
                        toggleAdmin={toggleAdmin}
                        toggleBan={toggleBan}
                        handleAssignTestFile={handleAssignTestFile}
                        toggleExcelHints={toggleExcelHints}
                        toggleModuleAccess={toggleModuleAccess}
                        hasAccess={hasAccess}
                        removeTest={removeTest}
                    />
                ))}
            </div>
        </motion.div>
    );
};

// Экспортируем все три компонента, включая новый WelcomeScreen
Object.assign(window, { WelcomeScreen, AuthScreen, AdminPanel });
