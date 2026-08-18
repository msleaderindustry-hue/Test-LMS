// --- 13_test.js ---
// Импортируем нужные библиотеки напрямую из window (как в оригинале)
const { motion, AnimatePresence, Button, Input, GooeyText, TestQuestionCard } = window;

// --- 0. ОБЩИЕ ХЕЛПЕРЫ ДИЗАЙНА ---
const cardTransition = { type: 'spring', stiffness: 260, damping: 26 };

// --- 1. ЭКРАН ЗАГРУЗКИ ---
const LoadingView = () => (
    <motion.div key="loading" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="glass-panel" style={{textAlign:'center', width: '100%', maxWidth: '400px', padding: '44px 26px', position:'relative', overflow:'hidden'}}>
        <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }}
            style={{ width: 46, height: 46, margin: '0 auto 22px auto', borderRadius: '50%', border: '3px solid rgba(118,75,162,0.15)', borderTopColor: '#764ba2' }}
        />
        <h2 style={{marginBottom: 22, fontWeight: 800, letterSpacing: '-0.02em'}}>Загрузка системы</h2>
        {[ '80%', '60%', '100%' ].map((w, i) => (
            <motion.div
                key={i}
                animate={{ opacity: [0.25, 0.7, 0.25] }}
                transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.18 }}
                style={{
                    background: 'linear-gradient(90deg, rgba(118,75,162,0.35), rgba(0,198,255,0.35))',
                    height: i === 2 ? '46px' : '16px',
                    width: w,
                    margin: '0 auto 13px auto',
                    borderRadius: i === 2 ? '14px' : '999px'
                }}
            />
        ))}
    </motion.div>
);

// --- 2. ГЛАВНОЕ МЕНЮ ---
const MainMenu = ({ setView, teacherTests, openTeacherAssignedTest, removeTeacherTestStudent, sets, openSet, deleteSet, addSet }) => (
    <motion.div key="menu" initial={{opacity:0, y:8}} animate={{opacity:1, y:0}} exit={{opacity:0}} className="glass-panel" style={{width:'100%', maxWidth:'800px'}}>
        <GooeyText texts={["Learn Without Limits", "Build Your Future", "Ultimate LMS Platform"]} style={{margin:'0 0 28px 0', paddingTop: 10}} morphTime={1} cooldownTime={1.5} />

        <div style={{display:'flex', justifyContent:'center', marginBottom:28}}>
            <Button variant="orange" style={{maxWidth:320, boxShadow:'0 8px 24px rgba(237,137,54,0.28)'}} onClick={() => setView('stats')}>📊 Статистика</Button>
        </div>

        {(teacherTests.length > 0 || sets.length > 0) && (
            <div style={{fontSize:12, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--text-sec)', opacity:0.65, margin:'0 4px 10px 4px'}}>
                Мои тесты
            </div>
        )}

        <div style={{maxHeight:320, overflowY:'auto', margin:'0 0 22px 0', paddingRight:6, display:'flex', flexDirection:'column', gap:10}}>
            {teacherTests.map(test => (
                <motion.div key={test.id} whileHover={{ x: 3 }} style={{display:'flex', gap:10}}>
                    <Button variant="muted" onClick={() => openTeacherAssignedTest(test)} style={{ flex:1, justifyContent:'flex-start', textAlign:'left', padding:'12px 16px', minWidth: 0, height: 'auto', minHeight: '56px', wordBreak: 'break-word', border: '1px solid rgba(0,198,255,0.55)', background:'linear-gradient(135deg, rgba(0,198,255,0.08), rgba(118,75,162,0.06))' }}>
                        <span style={{marginRight:10, fontSize:18}}>☁️</span>
                        <span style={{wordBreak:'break-word', lineHeight:'1.35', color: '#00c6ff', fontWeight: 700}}>{test.title}</span>
                    </Button>
                    <Button variant="red" style={{width:56, padding:0, flexShrink:0, borderRadius:14}} onClick={() => removeTeacherTestStudent(test.id, test.title)}>🗑</Button>
                </motion.div>
            ))}

            {sets.map(name => (
                <motion.div key={name} whileHover={{ x: 3 }} style={{display:'flex', gap:10}}>
                    <Button variant="muted" onClick={() => openSet(name)} style={{ flex:1, justifyContent:'flex-start', textAlign:'left', padding:'12px 16px', minWidth: 0, height: 'auto', minHeight: '56px', wordBreak: 'break-word' }}>
                        <span style={{marginRight:10, fontSize:18}}>📂</span>
                        <span style={{wordBreak:'break-word', lineHeight:'1.35'}}>{name}</span>
                    </Button>
                    <Button variant="red" style={{width:56, padding:0, flexShrink:0, borderRadius:14}} onClick={() => deleteSet(name)}>🗑</Button>
                </motion.div>
            ))}

            {teacherTests.length === 0 && sets.length === 0 && (
                <div style={{textAlign:'center', padding:'26px 10px', color:'var(--text-sec)', fontSize:14, opacity:0.7}}>
                    Пока нет ни одного теста — создайте первый ниже 👇
                </div>
            )}
        </div>

        <div style={{display:'flex', gap:10, alignItems: 'center', padding:'14px', borderRadius:16, background:'rgba(128,128,128,0.06)', border:'1px dashed var(--glass-border)'}}>
            <Input id="newSetName" placeholder="Название нового теста" style={{margin:0, flex:1}} />
            <Button style={{width:56, padding:0, margin:0, borderRadius:14}} onClick={() => { const el=document.getElementById('newSetName'); addSet(el.value); el.value=''; }}>➕</Button>
        </div>
        <div style={{marginTop: 26, textAlign: 'center', fontSize: 12, color: 'var(--text-sec)', opacity: 0.6, letterSpacing:'0.02em'}}>© 2025 Alisher. All Rights Reserved.</div>
    </motion.div>
);

// --- 3. НАСТРОЙКИ ВЫБРАННОГО ТЕСТА ---
const SetMenu = ({ setView, currentSet, handlePrint, importJSON, startTest, testsLength }) => (
    <motion.div key="set" initial={{opacity:0, y:8}} animate={{opacity:1, y:0}} exit={{opacity:0}} className="glass-panel" style={{width:'100%', maxWidth:'600px'}}>
        <Button variant="muted" style={{width:'auto', padding:'0 22px', height:38, minHeight:38, fontSize:13, borderRadius:12}} onClick={() => setView('menu')}>⬅ Назад</Button>
        <h2 style={{textAlign:'center', margin:'22px 0 6px 0', fontSize:26, fontWeight:800, letterSpacing:'-0.02em'}}>{currentSet}</h2>
        <p style={{textAlign:'center', color:'var(--text-sec)', margin:'0 0 26px 0', fontSize:14}}>Вопросов в базе: <b>{testsLength}</b></p>

        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:26, alignItems:'stretch'}}>
            <Button variant="primary" style={{borderRadius:14}} onClick={handlePrint}>🖨️ Печать</Button>
            <label className="import-label" style={{background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color:'white', borderRadius:14, boxShadow:'0 6px 18px rgba(79,172,254,0.3)'}}>
                📥 Импорт <input type="file" style={{display:'none'}} accept=".json" onChange={importJSON} />
            </label>
        </div>
        <Button onClick={startTest} style={{fontSize:18, height:62, borderRadius:16, fontWeight:800, boxShadow:'0 10px 26px rgba(118,75,162,0.32)'}}>▶ НАЧАТЬ ТЕСТ</Button>
    </motion.div>
);

// --- 4. НАСТРОЙКИ ТАЙМЕРА И КОЛИЧЕСТВА ---
const TimerSetup = ({ customTime, setCustomTime, customQCount, setCustomQCount, testsLength, launchTestWithTimer, setView }) => (
    <motion.div key="timer" initial={{scale:0.92, opacity:0}} animate={{scale:1, opacity:1}} transition={cardTransition} className="glass-panel" style={{width:'100%', maxWidth:400, textAlign:'center'}}>
        <h2 style={{marginTop:0, marginBottom:22, fontWeight:800, letterSpacing:'-0.02em'}}>⚙️ Параметры теста</h2>

        <div style={{marginBottom:16, textAlign:'left', padding:16, borderRadius:16, background:'rgba(128,128,128,0.06)'}}>
            <label style={{fontSize:13, fontWeight:700, color:'var(--text-sec)', marginBottom:8, display:'flex', alignItems:'center', gap:6}}>⏱️ Время (минуты)</label>
            <Input type="number" value={customTime} onChange={e => setCustomTime(e.target.value)} style={{textAlign:'center', fontSize:22, fontWeight:800, margin:0}} />
        </div>
        <div style={{marginBottom:22, textAlign:'left', padding:16, borderRadius:16, background:'rgba(128,128,128,0.06)'}}>
            <label style={{fontSize:13, fontWeight:700, color:'var(--text-sec)', marginBottom:8, display:'flex', alignItems:'center', gap:6}}>🔢 Количество вопросов <span style={{opacity:0.6, fontWeight:500}}>(макс. {testsLength})</span></label>
            <Input type="number" value={customQCount} onChange={e => setCustomQCount(e.target.value)} style={{textAlign:'center', fontSize:22, fontWeight:800, margin:0}} />
        </div>

        <Button variant="green" onClick={launchTestWithTimer} style={{borderRadius:14, fontWeight:800}}>Начать</Button>
        <Button variant="muted" onClick={() => setView('set_menu')} style={{borderRadius:14, marginTop:10}}>Отмена</Button>
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
                <div className="sidebar-timer" style={{background:'linear-gradient(135deg, rgba(118,75,162,0.14), rgba(0,198,255,0.14))', borderRadius:16, fontWeight:800, letterSpacing:'0.02em'}}>
                    ⏳ {formatTime(timeLeft)}
                </div>
                <div className="nav-grid-wrapper">
                    <div className="nav-grid-compact">
                        {testSession.questions.map((_, i) => {
                            let c = 'var(--nav-item-bg)'; let txt='var(--nav-item-text)';
                            if(i===testSession.currentIdx) { c='#764ba2'; txt='white'; }
                            else if(testSession.answers[i]!==null) { c = testSession.answers[i]===testSession.questions[i].correctIndex ? '#48bb78' : '#f56565'; txt='white'; }
                            const itemClass = `nav-item ${isAnimating ? 'disabled' : ''}`;
                            return (
                                <motion.div
                                    key={i}
                                    whileHover={ isAnimating ? {} : { scale: 1.08 } }
                                    whileTap={ isAnimating ? {} : { scale: 0.94 } }
                                    className={itemClass}
                                    style={{background:c, color:txt, borderRadius:10, fontWeight:700}}
                                    onClick={()=>handleNavClick(i)}
                                >
                                    {i+1}
                                </motion.div>
                            )
                        })}
                    </div>
                </div>
                <Button variant="green" onClick={finishTest} style={{marginTop:14, borderRadius:14, fontWeight:800}}>✅ Завершить</Button>
            </div>
        </div>
    </div>
);

// --- 6. ЭКРАН РЕЗУЛЬТАТОВ ---
const TestResultView = ({ testSession, isResultSaved, saveResult, setView, restartMistakes }) => {
    const pct = Math.round(testSession.score / testSession.questions.length * 100);
    const ringColor = pct >= 80 ? '#48bb78' : pct >= 50 ? '#764ba2' : '#f56565';
    return (
    <motion.div key="res" initial={{scale:0.94, opacity:0}} animate={{scale:1, opacity:1}} transition={cardTransition} className="glass-panel" style={{textAlign:'center', width:'100%', maxWidth:500}}>
        <h2 style={{marginBottom:18, fontWeight:800, letterSpacing:'-0.02em'}}>{pct>=50?'Отлично!':'Результат'}</h2>

        <motion.div
            initial={{ rotate: -90 }}
            style={{
                width: 168, height: 168, margin: '0 auto 20px auto', borderRadius: '50%',
                background: `conic-gradient(${ringColor} ${pct * 3.6}deg, rgba(128,128,128,0.14) 0deg)`,
                display:'flex', alignItems:'center', justifyContent:'center'
            }}
        >
            <div style={{width:132, height:132, borderRadius:'50%', background:'var(--bg-panel, #fff)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
                <span style={{fontSize:40, fontWeight:800, lineHeight:1}}>{pct}%</span>
                <span style={{fontSize:12, color:'var(--text-sec)', marginTop:4}}>верно</span>
            </div>
        </motion.div>

        <div style={{padding:'12px', background:'rgba(128,128,128,0.08)', borderRadius:'14px', marginBottom:'22px'}}>
            <p style={{fontSize:16, color:'var(--text-main)', margin:0, fontWeight:700}}>Правильно: {testSession.score} из {testSession.questions.length}</p>
        </div>

        <div style={{background:'rgba(128,128,128,0.05)', padding:24, borderRadius:20, margin:'24px 0', border:'1px solid var(--glass-border)'}}>
            {!isResultSaved ? (
                <>
                    <Input id="sName" placeholder="Введите ваше имя" style={{textAlign:'center', marginTop:0, marginBottom:15}} />
                    <Button variant="teal" onClick={()=>saveResult(document.getElementById('sName').value)} style={{borderRadius:14, fontWeight:700}}>💾 Сохранить результат</Button>
                </>
            ) : (
                <motion.div initial={{scale:0.85, opacity:0}} animate={{scale:1, opacity:1}} style={{color:'#10b981', fontWeight:800, fontSize:17, padding:'14px 0'}}>✅ Результат успешно сохранён!</motion.div>
            )}
        </div>

        <div style={{display:'flex', gap:10, flexWrap:'wrap', justifyContent:'center'}}>
            <Button variant="orange" style={{borderRadius:14}} onClick={()=>setView('review')}>🧐 Ошибки</Button>
            {testSession.score < testSession.questions.length && ( <Button variant="red" style={{borderRadius:14}} onClick={restartMistakes}>🔄 Повторить ошибки</Button> )}
            <Button style={{borderRadius:14}} onClick={()=>setView('menu')}>🏠 Меню</Button>
        </div>
    </motion.div>
    );
};

// Экспортируем все компоненты в window для использования в 6_app.js
Object.assign(window, { LoadingView, MainMenu, SetMenu, TimerSetup, ActiveTestView, TestResultView });
