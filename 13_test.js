// --- 13_test.js ---
// Импортируем нужные библиотеки напрямую из window (как в оригинале)
const { motion, AnimatePresence, Button, Input, GooeyText, TestQuestionCard } = window;

// --- 0. LANDING VIEW (ПРИВЕТСТВЕННЫЙ ЭКРАН) ---
const LandingView = window.React.forwardRef(({ onLogin }, ref) => (
    <motion.div 
        ref={ref} 
        key="landing" 
        initial={{opacity: 0, y: 30, scale: 0.98}} 
        animate={{opacity: 1, y: 0, scale: 1}} 
        exit={{opacity: 0, y: -30, scale: 0.98}} 
        transition={{duration: 0.4, ease: "easeOut"}} 
        className="glass-panel" 
        style={{
            width: '100%', 
            maxWidth: '900px', 
            textAlign: 'center', 
            padding: '50px 30px', 
            margin: '20px', 
            borderRadius: '24px'
        }}
    >
        <h1 style={{
            fontSize: '48px', 
            margin: '0 0 15px 0', 
            background: 'linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent', 
            fontWeight: 800
        }}>
            Ultimate LMS Platform
        </h1>
        <p style={{
            fontSize: '18px', 
            color: 'var(--text-sec)', 
            marginBottom: '45px', 
            lineHeight: '1.6', 
            maxWidth: '650px', 
            margin: '0 auto 45px auto'
        }}>
            Инновационная образовательная платформа для быстрого и эффективного обучения. Оттачивайте навыки, решайте тесты и пишите код в единой современной экосистеме.
        </p>
        
        <div style={{
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '20px', 
            marginBottom: '45px'
        }}>
            {[
                {icon: '📝', title: 'Умные тесты', desc: 'Интерактивные задания с глубокой аналитикой ошибок'},
                {icon: '⌨️', title: 'Тренажер печати', desc: 'Развивайте скорость и точность набора текста'},
                {icon: '💻', title: 'Редактор кода', desc: 'Полноценная среда для программирования (VS School)'},
                {icon: '🎴', title: 'Flash Карточки', desc: 'Запоминайте сложную информацию в 2 раза быстрее'}
            ].map((feature, i) => (
                <motion.div 
                    key={i} 
                    whileHover={{scale: 1.05, y: -5}} 
                    style={{
                        background: 'rgba(128,128,128,0.05)', 
                        padding: '25px 20px', 
                        borderRadius: '20px', 
                        border: '1px solid var(--glass-border)', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        boxShadow: '0 8px 32px rgba(0,0,0,0.05)'
                    }}
                >
                    <div style={{fontSize: '46px', marginBottom: '15px'}}>{feature.icon}</div>
                    <h3 style={{margin: '0 0 10px 0', fontSize: '18px', color: 'var(--text-main)'}}>{feature.title}</h3>
                    <p style={{margin: 0, fontSize: '14px', color: 'var(--text-sec)'}}>{feature.desc}</p>
                </motion.div>
            ))}
        </div>
        
        <motion.div whileHover={{scale: 1.05}} whileTap={{scale: 0.95}} style={{display: 'inline-block'}}>
            <Button 
                onClick={onLogin} 
                style={{
                    fontSize: '20px', 
                    padding: '18px 50px', 
                    height: 'auto', 
                    background: 'linear-gradient(135deg, #a855f7 0%, #3b82f6 100%)', 
                    border: 'none', 
                    borderRadius: '30px', 
                    color: '#fff', 
                    boxShadow: '0 10px 25px rgba(168, 85, 247, 0.4)', 
                    fontWeight: 'bold', 
                    textTransform: 'uppercase', 
                    letterSpacing: '1px'
                }}
            >
                🚀 Вход / Регистрация
            </Button>
        </motion.div>
    </motion.div>
));

// --- 1. ЭКРАН ЗАГРУЗКИ ---
const LoadingView = () => (
    <motion.div key="loading" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="glass-panel" style={{textAlign:'center', width: '100%', maxWidth: '400px', padding: '40px 20px'}}>
        <h2 style={{marginBottom: 20}}>Загрузка системы</h2>
        <motion.div animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }} style={{ background: 'var(--text-sec)', height: '20px', width: '80%', margin: '0 auto 15px auto', borderRadius: '10px' }} />
        <motion.div animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }} style={{ background: 'var(--text-sec)', height: '20px', width: '60%', margin: '0 auto 15px auto', borderRadius: '10px' }} />
        <motion.div animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }} style={{ background: 'var(--text-sec)', height: '45px', width: '100%', margin: '0 auto', borderRadius: '14px' }} />
    </motion.div>
);

// --- 2. ГЛАВНОЕ МЕНЮ ---
const MainMenu = ({ setView, teacherTests, openTeacherAssignedTest, removeTeacherTestStudent, sets, openSet, deleteSet, addSet }) => (
    <motion.div key="menu" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="glass-panel" style={{width:'100%', maxWidth:'800px'}}>
        <GooeyText texts={["Learn Without Limits", "Build Your Future", "Ultimate LMS Platform"]} style={{margin:'0 0 25px 0', paddingTop: 10}} morphTime={1} cooldownTime={1.5} />
        
        <div style={{display:'flex', justifyContent:'center', marginBottom:25}}>
            <Button variant="orange" style={{maxWidth:300}} onClick={() => setView('stats')}>📊 Статистика</Button>
        </div>

        <div style={{maxHeight:300, overflowY:'auto', margin:'0 0 20px 0', paddingRight:5}}>
            {teacherTests.map(test => (
                <div key={test.id} style={{display:'flex', gap:10, marginBottom:10}}>
                    <Button variant="muted" onClick={() => openTeacherAssignedTest(test)} style={{ flex:1, justifyContent:'flex-start', textAlign:'left', padding:'10px 15px', minWidth: 0, height: 'auto', minHeight: '54px', wordBreak: 'break-word', border: '1px solid #00c6ff' }}>
                        <span style={{marginRight:8}}>☁️</span>
                        <span style={{wordBreak:'break-word', lineHeight:'1.3', color: '#00c6ff', fontWeight: 700}}>{test.title}</span>
                    </Button>
                    <Button variant="red" style={{width:60, padding:0, flexShrink:0}} onClick={() => removeTeacherTestStudent(test.id, test.title)}>🗑</Button>
                </div>
            ))}

            {sets.map(name => (
                <div key={name} style={{display:'flex', gap:10, marginBottom:10}}>
                    <Button variant="muted" onClick={() => openSet(name)} style={{ flex:1, justifyContent:'flex-start', textAlign:'left', padding:'10px 15px', minWidth: 0, height: 'auto', minHeight: '54px', wordBreak: 'break-word' }}>
                        <span style={{marginRight:8}}>📂</span>
                        <span style={{wordBreak:'break-word', lineHeight:'1.3'}}>{name}</span>
                    </Button>
                    <Button variant="red" style={{width:60, padding:0, flexShrink:0}} onClick={() => deleteSet(name)}>🗑</Button>
                </div>
            ))}
        </div>
        <div style={{display:'flex', gap:10, alignItems: 'center'}}>
            <Input id="newSetName" placeholder="Новый тест" style={{margin:0, flex:1}} />
            <Button style={{width:60, padding:0, margin:0}} onClick={() => { const el=document.getElementById('newSetName'); addSet(el.value); el.value=''; }}>➕</Button>
        </div>
        <div style={{marginTop: 30, textAlign: 'center', fontSize: 12, color: 'var(--text-sec)', opacity: 0.7}}>© 2025 Alisher. All Rights Reserved.</div>
    </motion.div>
);

// --- 3. НАСТРОЙКИ ВЫБРАННОГО ТЕСТА ---
const SetMenu = ({ setView, currentSet, handlePrint, importJSON, startTest, testsLength }) => (
    <motion.div key="set" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="glass-panel" style={{width:'100%', maxWidth:'600px'}}>
        <Button variant="muted" style={{width:'auto', padding:'0 25px', height:40, minHeight:40, fontSize:13}} onClick={() => setView('menu')}>⬅ Назад</Button>
        <h2 style={{textAlign:'center', margin:'20px 0', fontSize:24}}>{currentSet}</h2>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:15, marginBottom:25, alignItems:'stretch'}}>
            <Button variant="primary" onClick={handlePrint}>🖨️ Печать</Button>
            <label className="import-label" style={{background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color:'white'}}>
                📥 Импорт <input type="file" style={{display:'none'}} accept=".json" onChange={importJSON} />
            </label>
        </div>
        <Button onClick={startTest} style={{fontSize:18, height:60}}>▶ НАЧАТЬ ТЕСТ</Button>
        <p style={{textAlign:'center', color:'var(--text-sec)', marginTop:15}}>Вопросов: <b>{testsLength}</b></p>
    </motion.div>
);

// --- 4. НАСТРОЙКИ ТАЙМЕРА И КОЛИЧЕСТВА ---
const TimerSetup = ({ customTime, setCustomTime, customQCount, setCustomQCount, testsLength, launchTestWithTimer, setView }) => (
    <motion.div key="timer" initial={{scale:0.9}} animate={{scale:1}} className="glass-panel" style={{width:'100%', maxWidth:400, textAlign:'center'}}>
        <h2 style={{marginTop:0}}>⚙️ Параметры теста</h2>
        <div style={{marginBottom:15, textAlign:'left'}}>
            <label style={{fontSize:14, fontWeight:600, color:'var(--text-sec)', marginBottom:5, display:'block'}}>⏱️ Время (минуты):</label>
            <Input type="number" value={customTime} onChange={e => setCustomTime(e.target.value)} style={{textAlign:'center', fontSize:20, fontWeight:800}} />
        </div>
        <div style={{marginBottom:15, textAlign:'left'}}>
            <label style={{fontSize:14, fontWeight:600, color:'var(--text-sec)', marginBottom:5, display:'block'}}>🔢 Количество вопросов (Макс: {testsLength}):</label>
            <Input type="number" value={customQCount} onChange={e => setCustomQCount(e.target.value)} style={{textAlign:'center', fontSize:20, fontWeight:800}} />
        </div>
        <Button variant="green" onClick={launchTestWithTimer} style={{marginTop:20}}>Начать</Button>
        <Button variant="muted" onClick={() => setView('set_menu')}>Отмена</Button>
    </motion.div>
);

// --- 5. ПРОЦЕСС ТЕСТА (АКТИВНЫЙ ТЕСТ) ---
const ActiveTestView = ({ testSession, handleAnswer, formatTime, timeLeft, isAnimating, handleNavClick, finishTest }) => (
    <div key="test-wrapper" className="test-layout">
        <div className="question-column">
            <AnimatePresence mode="wait">
                <TestQuestionCard key={testSession.currentIdx} question={testSession.questions[testSession.currentIdx]} index={testSession.currentIdx} answers={testSession.answers} onAnswer={handleAnswer} />
            </AnimatePresence>
        </div>
        <div className="sidebar-column">
            <div className="sidebar-content">
                <div className="sidebar-timer">⏳ {formatTime(timeLeft)}</div>
                <div className="nav-grid-wrapper">
                    <div className="nav-grid-compact">
                        {testSession.questions.map((_, i) => {
                            let c = 'var(--nav-item-bg)'; let txt='var(--nav-item-text)';
                            if(i===testSession.currentIdx) { c='#764ba2'; txt='white'; }
                            else if(testSession.answers[i]!==null) { c = testSession.answers[i]===testSession.questions[i].correctIndex ? '#48bb78' : '#f56565'; txt='white'; }
                            const itemClass = `nav-item ${isAnimating ? 'disabled' : ''}`;
                            return ( <div key={i} className={itemClass} style={{background:c, color:txt}} onClick={()=>handleNavClick(i)}>{i+1}</div> )
                        })}
                    </div>
                </div>
                <Button variant="green" onClick={finishTest} style={{marginTop:10}}>Завершить</Button>
            </div>
        </div>
    </div>
);

// --- 6. ЭКРАН РЕЗУЛЬТАТОВ ---
const TestResultView = ({ testSession, isResultSaved, saveResult, setView, restartMistakes }) => (
    <motion.div key="res" initial={{scale:0.95}} animate={{scale:1}} className="glass-panel" style={{textAlign:'center', width:'100%', maxWidth:500}}>
        <h2 style={{marginBottom:5}}>{testSession.score/testSession.questions.length>=0.5?'Отлично!':'Результат'}</h2>
        <h1 style={{fontSize:64, margin:'10px 0', background:'var(--primary-grad)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent'}}>
            {Math.round(testSession.score/testSession.questions.length*100)}%
        </h1>
        <div style={{padding:'10px', background:'rgba(128,128,128,0.1)', borderRadius:'14px', marginBottom:'20px'}}>
            <p style={{fontSize:18, color:'var(--text-main)', margin:0, fontWeight:700}}>Правильно: {testSession.score} из {testSession.questions.length}</p>
        </div>
        <div style={{background:'rgba(128,128,128,0.05)', padding:25, borderRadius:20, margin:'25px 0', border:'1px solid var(--glass-border)'}}>
            {!isResultSaved ? (
                <>
                    <Input id="sName" placeholder="Введите ваше имя" style={{textAlign:'center', marginTop:0, marginBottom:15}} />
                    <Button variant="teal" onClick={()=>saveResult(document.getElementById('sName').value)}>💾 Сохранить</Button>
                </>
            ) : (
                <motion.div initial={{scale:0.8}} animate={{scale:1}} style={{color:'#10b981', fontWeight:'bold', fontSize:18, padding:'15px 0'}}>✅ Результат успешно сохранен!</motion.div>
            )}
        </div>
        <div style={{display:'flex', gap:10, flexWrap:'wrap', justifyContent:'center'}}>
            <Button variant="orange" onClick={()=>setView('review')}>🧐 Ошибки</Button>
            {testSession.score < testSession.questions.length && ( <Button variant="red" onClick={restartMistakes}>🔄 Повторить ошибки</Button> )}
            <Button onClick={()=>setView('menu')}>🏠 Меню</Button>
        </div>
    </motion.div>
);

// Экспортируем все компоненты в window для использования в 6_app.js
Object.assign(window, { LandingView, LoadingView, MainMenu, SetMenu, TimerSetup, ActiveTestView, TestResultView });
