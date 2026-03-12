const { useState, useEffect, useRef, useLayoutEffect, memo } = React;
const { motion, AnimatePresence } = window.Motion;

// --- КОНСТАНТЫ И ЛОГИКА ---
const SECRET_KEY = "MySuperSecretKey_2025_v1";
const DEFAULT_GEMINI_KEY = "AIzaSyDq3H5pwX28iu1iC3nDcShyTQZa5ibj4dE"; 
const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1481534100194983958/L107VBFTCX5FYQFfAyiJu7PsTOhbsrNX9yOmRLExoj-B-a9okiGuyweAPmYzPcU09rEj";

async function sha256hex(str){const buf = new TextEncoder().encode(str);const hashBuf = await crypto.subtle.digest('SHA-256', buf);return Array.from(new Uint8Array(hashBuf)).map(b=>b.toString(16).padStart(2,'0')).join('');}
async function hmacSign(secret, message){const enc = new TextEncoder();const key = await crypto.subtle.importKey("raw", enc.encode(secret), {name:"HMAC", hash:"SHA-256"}, false, ["sign"]);const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));return Array.from(new Uint8Array(sig)).map(b=>b.toString(16).padStart(2,"0")).join("");}
function canvasFingerprint(){try{const c=document.createElement('canvas'),ctx=c.getContext('2d');c.width=200;c.height=50;ctx.textBaseline='top';ctx.font="16px Arial";ctx.fillStyle='#f60';ctx.fillRect(125,1,62,20);ctx.fillStyle='#069';ctx.fillText('test-λ',2,2);ctx.fillStyle='rgba(102,204,0,0.7)';ctx.fillText('test-λ',4,24);return c.toDataURL();}catch(e){return '';}}
async function computeFingerprint(){const parts=[navigator.userAgent||'',navigator.platform||'',screen.width+'x'+screen.height,navigator.language||'',String(navigator.hardwareConcurrency||''),await sha256hex(canvasFingerprint())];return await sha256hex(parts.join('|'));}
function shuffleArray(arr) { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; }

function useMathJax(contentRef, dependencies = []) {
  useLayoutEffect(() => {
    if (window.MathJax && contentRef.current) {
      window.MathJax.typesetPromise([contentRef.current]).catch(err => console.log(err));
    }
  }, dependencies);
}

async function fetchAIExplanation(questionText, variants, correctIndex, userIndex, questionImg, apiKey) {
    if(!apiKey) return "⚠️ Ключ API не найден.";
    const prompt = `Ты — преподаватель. Объясни ошибку. Вопрос: "${questionText.replace(/<[^>]*>?/gm, '')}" Варианты: ${variants.map((v, i) => `${i+1}. ${v.text}`).join('\n')} Правильный №${correctIndex + 1}. Студент ответил №${userIndex + 1}. Кратко, используй LaTeX $...$.`;
    const parts = [{ text: prompt }];
    if (questionImg && questionImg.startsWith('data:image')) {
        try { parts.push({ inlineData: { mimeType: questionImg.split(';')[0].split(':')[1], data: questionImg.split(',')[1] } }); } catch (e) {}
    }
    const models = ['gemini-2.0-flash', 'gemini-1.5-flash'];
    for (const modelName of models) {
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: parts }] })
            });
            const data = await response.json();
            if (data.candidates) return data.candidates[0].content.parts[0].text;
        } catch (e) {}
    }
    return "⚠️ AI временно недоступен.";
}

// --- UI КОМПОНЕНТЫ ---
const Button = ({ children, onClick, variant = 'primary', style, className }) => {
  const vars = {
    primary: 'linear-gradient(135deg, #4158D0 0%, #C850C0 100%)',
    green: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    teal: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    red: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    orange: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
    muted: 'rgba(128,128,128,0.15)'
  };
  return (
    <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={onClick} style={{ background: vars[variant], color: variant==='muted'?'var(--text-main)':'white', borderRadius: '14px', padding: '0 20px', fontWeight: 700, fontSize: '15px', width: '100%', border:'none', cursor:'pointer', minHeight:'50px', ...style }} className={className}>
      {children}
    </motion.button>
  );
};

const Input = (props) => (
  <input {...props} style={{ width: '100%', padding: '0 18px', borderRadius: '14px', border: '2px solid transparent', background: 'var(--input-bg)', color: 'var(--text-main)', fontSize: '16px', fontWeight: 500, height:'54px', marginBottom: '12px', boxSizing:'border-box', ...props.style }} />
);

const TestQuestionCard = memo(({ question, index, answers, onAnswer }) => {
     const cardRef = useRef(null);
     useMathJax(cardRef, [question]); 
     if (!question) return null;
     return (
       <motion.div ref={cardRef} key={index} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="glass-panel" style={{width: '100%'}}>
          <h3 style={{textAlign:'center', marginBottom:15, opacity:0.6, fontSize:14}}>ВОПРОС {index+1}</h3>
          <div style={{fontSize:18, marginBottom:20, fontWeight:600}} dangerouslySetInnerHTML={{__html: question.question}} />
          {question.questionImg && <img src={question.questionImg} className="question-image" />}
          <div style={{display:'flex', flexDirection:'column', gap:10}}>
            {question.variants.map((v, i) => {
               const isAnswered = answers[index] !== null;
               const isSelected = answers[index] === i;
               const isCorrect = question.correctIndex === i;
               let st = {};
               if(isAnswered) {
                 if(isCorrect) st = {background: '#d1fae5', borderColor: '#10b981', color: '#064e3b'};
                 else if(isSelected) st = {background: '#fee2e2', borderColor: '#ef4444', color: '#7f1d1d'};
                 else if(isCorrect) st = {borderColor: '#10b981', opacity: 0.7};
               }
               return (
                 <motion.div key={i} className="variant-item" onClick={() => !isAnswered && onAnswer(i)} style={{ pointerEvents: isAnswered ? 'none' : 'auto', ...st }}>
                    {v.img && <img src={v.img} style={{maxWidth:200, borderRadius:8}} />}
                    <span dangerouslySetInnerHTML={{__html: v.text}} />
                 </motion.div>
               )
            })}
          </div>
       </motion.div>
     );
});

const ReviewView = ({ questions, answers, onBack }) => {
      const reviewRef = useRef(null);
      const [explanations, setExplanations] = useState({});
      useMathJax(reviewRef, [questions, explanations]);
      return (
          <motion.div ref={reviewRef} initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass-panel review-container">
              <div className="review-header"><h2 style={{textAlign:'center'}}>Работа над ошибками</h2></div>
              <div className="review-content">
                  {questions.map((q, i) => (
                      <div key={i} style={{background: 'var(--variant-default)', padding:20, borderRadius:20, marginBottom:15, border: answers[i] === q.correctIndex ? '2px solid #10b981' : '2px solid #ef4444'}}>
                          <strong>Вопрос {i+1}</strong>
                          <div style={{margin:'10px 0'}} dangerouslySetInnerHTML={{__html: q.question}}></div>
                          {q.variants.map((v, vi) => {
                              let s = {padding:10, borderRadius:10, margin:'5px 0', border:'1px solid #ddd'};
                              if(vi === q.correctIndex) s = {background:'#d1fae5', border:'1px solid #10b981'};
                              if(vi === answers[i] && vi !== q.correctIndex) s = {background:'#fee2e2', border:'1px solid #ef4444'};
                              return <div key={vi} style={s} dangerouslySetInnerHTML={{__html: v.text}}></div>
                          })}
                      </div>
                  ))}
              </div>
              <div className="review-footer"><Button onClick={onBack} style={{width:'auto', padding:'0 40px'}}>В меню</Button></div>
          </motion.div>
      )
};

const StatsView = ({ history, setHistory, onBack }) => {
    const sorted = [...history].sort((a,b) => b.percent - a.percent);
    return (
        <motion.div initial={{opacity:0}} animate={{opacity:1}} className="glass-panel" style={{width:'100%', maxWidth:800, overflowY:'auto'}}>
            <Button variant="muted" style={{width:'auto', height:40}} onClick={onBack}>⬅ Назад</Button>
            <h2 style={{textAlign:'center'}}>Рейтинг</h2>
            <table style={{width:'100%', borderCollapse:'collapse'}}>
                <tbody>
                    {sorted.map(h => (
                        <tr key={h.id} style={{borderBottom:'1px solid #eee'}}>
                            <td style={{padding:15}}><b>{h.student}</b><br/><small>{h.topic} • {h.date}</small></td>
                            <td style={{textAlign:'right', fontWeight:800, color:h.percent>=50?'#10b981':'#ef4444'}}>{h.percent}%</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </motion.div>
    )
};

function App() {
  const [view, setView] = useState('loading'); 
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [sets, setSets] = useState([]);
  const [currentSet, setCurrentSet] = useState(null);
  const [tests, setTests] = useState([]);
  const [history, setHistory] = useState([]);
  const [fp, setFp] = useState('');
  const [licenseInput, setLicenseInput] = useState('');
  const [testSession, setTestSession] = useState({ questions: [], currentIdx: 0, answers: [], score: 0 });
  const [isResultSaved, setIsResultSaved] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1200);
  const [customTime, setCustomTime] = useState('20'); 
  const [customQCount, setCustomQCount] = useState(''); 

  // --- МОДУЛЬ КОНТРОЛЯ (DISCORD) ---
  useEffect(() => {
    if (!fp) return;
    const sendLog = async (evt, msg) => {
      try {
        await fetch(DISCORD_WEBHOOK_URL, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: "Control", embeds: [{ title: "Событие", fields: [{name:"Тип", value:evt}, {name:"Инфо", value:msg || 'N/A'}] }] })
        });
      } catch(e){}
    };
    const hBlur = () => { if(view === 'test') sendLog('ВКЛАДКА', 'Переключился'); };
    const hResize = () => { if(window.outerWidth-window.innerWidth > 160) sendLog('КОНСОЛЬ', 'Открыл F12'); };
    window.addEventListener('blur', hBlur);
    window.addEventListener('resize', hResize);
    return () => { window.removeEventListener('blur', hBlur); window.removeEventListener('resize', hResize); };
  }, [fp, view]);

  useEffect(() => { document.body.className = theme; localStorage.setItem('theme', theme); }, [theme]);
  
  useEffect(() => {
    async function init() {
      const f = await computeFingerprint(); setFp(f);
      const saved = localStorage.getItem('license_v1');
      if(saved && JSON.parse(saved).fingerprint === f) { loadData(); setView('menu'); } 
      else { setView('license'); }
    }
    init();
  }, []);

  const loadData = () => {
    setSets(JSON.parse(localStorage.getItem('sets') || '["Тест 1"]'));
    setHistory(JSON.parse(localStorage.getItem('history') || '[]'));
  };

  const handleLicense = async () => {
    const key = await hmacSign(SECRET_KEY, fp);
    if(licenseInput.trim() === key) {
      localStorage.setItem('license_v1', JSON.stringify({fingerprint: fp, license: key}));
      loadData(); setView('menu');
    } else alert('Неверный ключ');
  };

  const openSet = (n) => { setCurrentSet(n); setTests(JSON.parse(localStorage.getItem('tests_'+n) || '[]')); setView('set_menu'); };

  const handlePrint = () => {
      const area = document.getElementById('printArea');
      if (!area) return;
      let html = `<h1>${currentSet}</h1>`;
      tests.forEach((q, i) => {
          html += `<p><b>${i+1}. ${q.question}</b></p><ul>`;
          q.variants.forEach(v => { html += `<li>${v.text}</li>`; });
          html += `</ul>`;
      });
      area.innerHTML = html;
      if (window.MathJax) window.MathJax.typesetPromise([area]).then(() => window.print());
      else window.print();
  };

  const startTest = () => {
    let qCount = parseInt(customQCount) || tests.length;
    let selected = shuffleArray(tests).slice(0, qCount).map(t => {
      let vars = shuffleArray(t.variants.map((v, i) => ({...v, ok: i === t.correctIndex})));
      return {...t, variants: vars, correctIndex: vars.findIndex(v => v.ok)};
    });
    setTestSession({ questions: selected, currentIdx: 0, answers: new Array(selected.length).fill(null), score: 0 });
    setTimeLeft(parseInt(customTime) * 60);
    setIsResultSaved(false);
    setView('test');
  };

  const saveResult = async (name) => {
    if(!name) return;
    const p = Math.round((testSession.score / testSession.questions.length) * 100);
    try {
        await fetch(DISCORD_WEBHOOK_URL, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: "Exam", embeds: [{ title: "Сдан тест", fields: [{name:"Студент", value:name}, {name:"Балл", value:p+'%'}] }] })
        });
    } catch(e){}
    const rec = { id: Date.now(), student: name, date: new Date().toLocaleString(), percent: p, topic: currentSet };
    const nh = [...history, rec]; setHistory(nh);
    localStorage.setItem('history', JSON.stringify(nh));
    setIsResultSaved(true);
  };

  return (
    <>
      <div id="themeBtn" onClick={() => setTheme(theme==='dark'?'light':'dark')} style={{position:'absolute', top:20, right:20, cursor:'pointer', fontSize:24}}>
        {theme==='dark'?'☀️':'🌙'}
      </div>

      <div style={{minHeight: '100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:20}}>
        <AnimatePresence mode="wait">
          {view === 'license' && (
            <motion.div key="lic" className="glass-panel" style={{maxWidth:400, textAlign:'center'}}>
               <h2>🔐 Вход</h2>
               <p style={{fontSize:12, wordBreak:'break-all'}}>{fp}</p>
               <Input placeholder="Ключ" value={licenseInput} onChange={e=>setLicenseInput(e.target.value)} />
               <Button onClick={handleLicense} variant="green">Войти</Button>
            </motion.div>
          )}

          {view === 'menu' && (
            <motion.div key="menu" className="glass-panel" style={{width:'100%', maxWidth:600}}>
              <h2 style={{textAlign:'center'}}>Мои Тесты</h2>
              {sets.map(s => <Button key={s} variant="muted" onClick={()=>openSet(s)} style={{marginBottom:10}}>{s}</Button>)}
              <Button variant="orange" onClick={()=>setView('stats')}>📊 Рейтинг</Button>
            </motion.div>
          )}

          {view === 'set_menu' && (
            <motion.div key="set" className="glass-panel" style={{maxWidth:500, textAlign:'center'}}>
              <h2>{currentSet}</h2>
              <div style={{display:'flex', gap:10, marginBottom:20}}>
                <Button onClick={handlePrint} variant="teal">🖨 Печать</Button>
                <Button onClick={()=>setView('menu')} variant="muted">Назад</Button>
              </div>
              <Input type="number" placeholder="Время (мин)" value={customTime} onChange={e=>setCustomTime(e.target.value)} />
              <Button onClick={startTest} variant="green">▶ Начать тест</Button>
            </motion.div>
          )}

          {view === 'test' && (
            <div key="test" className="test-layout" style={{display:'flex', gap:20, width:'100%', maxWidth:1000}}>
               <div style={{flex:2}}><TestQuestionCard question={testSession.questions[testSession.currentIdx]} index={testSession.currentIdx} answers={testSession.answers} onAnswer={(v)=>{
                   const na = [...testSession.answers]; na[testSession.currentIdx] = v;
                   setTestSession({...testSession, answers: na});
                   setTimeout(() => { if(testSession.currentIdx < testSession.questions.length-1) setTestSession(s => ({...s, currentIdx: s.currentIdx+1})); }, 600);
               }} /></div>
               <div className="glass-panel" style={{flex:1, textAlign:'center'}}>
                  <div style={{fontSize:24, fontWeight:800, marginBottom:20}}>⏳ {Math.floor(timeLeft/60)}:{(timeLeft%60).toString().padStart(2,'0')}</div>
                  <div style={{display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:5}}>
                    {testSession.questions.map((_, i) => (
                      <div key={i} onClick={()=>setTestSession({...testSession, currentIdx:i})} style={{padding:10, borderRadius:8, cursor:'pointer', background: i===testSession.currentIdx ? '#764ba2' : (testSession.answers[i]!==null?'#48bb78':'#eee'), color: i===testSession.currentIdx||testSession.answers[i]!==null?'white':'black'}}>{i+1}</div>
                    ))}
                  </div>
                  <Button variant="red" onClick={()=>setView('result')} style={{marginTop:20}}>Завершить</Button>
               </div>
            </div>
          )}

          {view === 'result' && (
            <motion.div key="res" className="glass-panel" style={{maxWidth:400, textAlign:'center'}}>
               <h1>{Math.round(testSession.score/testSession.questions.length*100)}%</h1>
               {!isResultSaved ? (
                 <>
                   <Input id="userName" placeholder="Твое имя" />
                   <Button onClick={()=>saveResult(document.getElementById('userName').value)} variant="green">Сохранить</Button>
                 </>
               ) : <p style={{color:'#10b981'}}>✅ Сохранено</p>}
               <Button onClick={()=>setView('menu')} style={{marginTop:10}}>В меню</Button>
            </motion.div>
          )}

          {view === 'review' && <ReviewView questions={testSession.questions} answers={testSession.answers} onBack={()=>setView('menu')} />}
          {view === 'stats' && <StatsView history={history} setHistory={setHistory} onBack={()=>setView('menu')} />}
        </AnimatePresence>
      </div>
      <div id="printArea" style={{display:'none'}}></div>
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
