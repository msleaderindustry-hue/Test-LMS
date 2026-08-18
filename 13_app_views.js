const { React, window } = window;
const { motion, AnimatePresence } = window.Motion;
const { Button, Input, GooeyText, TestQuestionCard } = window;

// --- 1. ЭКРАН ЗАГРУЗКИ ---
const LoadingView = React.memo(() => (
    <motion.div key="loading" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="glass-panel" style={{textAlign:'center', width: '100%', maxWidth: '400px', padding: '40px 20px'}}>
        <h2 style={{marginBottom: 20}}>Загрузка системы</h2>
        <motion.div animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }} style={{ background: 'var(--text-sec)', height: '20px', width: '80%', margin: '0 auto 15px auto', borderRadius: '10px' }} />
        <motion.div animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }} style={{ background: 'var(--text-sec)', height: '20px', width: '60%', margin: '0 auto 15px auto', borderRadius: '10px' }} />
        <motion.div animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }} style={{ background: 'var(--text-sec)', height: '45px', width: '100%', margin: '0 auto', borderRadius: '14px' }} />
    </motion.div>
));

// --- 2. ГЛАВНОЕ МЕНЮ ---
const MainMenu = React.memo(({ setView, teacherTests, openTeacherAssignedTest, removeTeacherTestStudent, sets, openSet, deleteSet, addSet }) => (
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
));

// --- 3. НАСТРОЙКИ ВЫБРАННОГО ТЕСТА ---
const SetMenu = React.memo(({ setView, currentSet, handlePrint, importJSON, startTest, testsLength }) => (
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
));

// --- 4. НАСТРОЙКИ ТАЙМЕРА И КОЛИЧЕСТВА ---
const TimerSetup = React.memo(({ customTime, setCustomTime, customQCount, setCustomQCount, testsLength, launchTestWithTimer, setView }) => (
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
));

// --- 5. ПРОЦЕСС ТЕСТА (АКТИВНЫЙ ТЕСТ) ---
const ActiveTestView = React.memo(({ testSession, handleAnswer, formatTime, timeLeft, isAnimating, handleNavClick, finishTest }) => (
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
));

// --- 6. ЭКРАН РЕЗУЛЬТАТОВ ---
const TestResultView = React.memo(({ testSession, isResultSaved, saveResult, setView, restartMistakes }) => (
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
));

Object.assign(window, { LoadingView, MainMenu, SetMenu, TimerSetup, ActiveTestView, TestResultView });
