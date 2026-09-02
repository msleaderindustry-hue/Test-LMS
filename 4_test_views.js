const { useState, useEffect, useRef, useMemo, memo } = React;
const { motion, AnimatePresence } = window.Motion;
const { Button } = window;

/* =========================================================================
   ХЕЛПЕРЫ
   ========================================================================= */

// Надёжно повышает/понижает alpha у строки вида "rgba(r,g,b,a)".
// Старый вариант делал bgRgba.replace('0.05','0.15') — ломался на любом другом значении.
const withAlpha = (rgba, alpha) => {
  const match = /rgba?\(([^)]+)\)/.exec(rgba || '');
  if (!match) return rgba;
  const [r, g, b] = match[1].split(',').map(s => s.trim());
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// Безопасный JSON.parse для localStorage — раньше битые данные роняли весь экран статистики.
const safeParseJSON = (raw, fallback) => {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? { ...fallback, ...parsed } : fallback;
  } catch {
    return fallback;
  }
};

// Единая палитра статусов, завязанная на var(--text-main) вместо жёстко
// прописанного тёмного текста — раньше #064e3b/#7f1d1d "слепли" на тёмной теме.
const STATUS = {
  success: { border: '#10b981', bg: 'rgba(16, 185, 129, 0.16)' },
  error: { border: '#ef4444', bg: 'rgba(239, 68, 68, 0.16)' },
  neutral: { border: 'rgba(148, 163, 184, 0.35)', bg: 'rgba(148, 163, 184, 0.08)' },
};

// Плавный счётчик для цифр в карточках статистики — маленькая деталь, которая
// делает открытие вкладки живее, без лишней навязчивой анимации.
const CountUp = ({ value, duration = 500 }) => {
  const [display, setDisplay] = useState(typeof value === 'number' ? value : 0);
  const prevValue = useRef(display);

  useEffect(() => {
    const to = typeof value === 'number' ? value : 0;
    const from = prevValue.current;
    if (from === to) { setDisplay(to); return; }
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(from + (to - from) * eased);
      setDisplay(current);
      if (progress < 1) { raf = requestAnimationFrame(tick); }
      else { prevValue.current = to; }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return <>{display}</>;
};

/* =========================================================================
   TestQuestionCard
   ========================================================================= */

const TestQuestionCard = memo(({ question, index, answers, onAnswer }) => {
  const cardRef = useRef(null);
  if (window.useMathJax) window.useMathJax(cardRef, [question]);

  // Цифры 1–9 выбирают вариант ответа, пока вопрос ещё не отвечен.
  useEffect(() => {
    if (!question || answers[index] !== null) return;
    const handler = (e) => {
      const num = parseInt(e.key, 10);
      if (!Number.isNaN(num) && num >= 1 && num <= question.variants.length) {
        onAnswer(num - 1);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [question, index, answers, onAnswer]);

  if (!question) return null;

  return (
    <motion.div ref={cardRef} key={index} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="glass-panel" style={{ width: '100%', display: 'block' }}>
      <h3 style={{ textAlign: 'center', marginBottom: 15, opacity: 0.6, fontSize: 14, textTransform: 'uppercase' }}>Вопрос {index + 1}</h3>
      <div style={{ fontSize: 18, marginBottom: 20, fontWeight: 600 }} dangerouslySetInnerHTML={{ __html: question.question }} />
      {question.questionImg && <img src={question.questionImg} alt="Иллюстрация к вопросу" className="question-image" />}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }} role="radiogroup" aria-label={`Варианты ответа на вопрос ${index + 1}`}>
        {question.variants.map((v, i) => {
          const isAnswered = answers[index] !== null;
          const isSelected = answers[index] === i;
          const isCorrect = question.correctIndex === i;

          let styleOverride = {};
          let animationProps = { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, transition: { delay: i * 0.06 } };

          if (isAnswered) {
            if (isCorrect) {
              styleOverride = { background: STATUS.success.bg, borderColor: STATUS.success.border };
              if (isSelected) animationProps.animate = { opacity: 1, x: 0, scale: [1, 1.05, 1] };
            } else if (isSelected) {
              styleOverride = { background: STATUS.error.bg, borderColor: STATUS.error.border };
              animationProps.animate = { opacity: 1, x: [-5, 5, -5, 5, 0] };
              animationProps.transition = { duration: 0.3 };
            } else {
              // Прочие неверные варианты просто приглушаем — раньше здесь была
              // "мёртвая" ветка `question.correctIndex === i`, которая никогда
              // не выполнялась (isCorrect уже перехватывал этот случай выше).
              styleOverride = { opacity: 0.5 };
            }
          }

          return (
            <motion.div
              key={i}
              {...animationProps}
              className="variant-item"
              role="radio"
              aria-checked={isSelected}
              aria-disabled={isAnswered}
              tabIndex={isAnswered ? -1 : 0}
              onClick={() => !isAnswered && onAnswer(i)}
              onKeyDown={(e) => {
                if (!isAnswered && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  onAnswer(i);
                }
              }}
              style={{ pointerEvents: isAnswered ? 'none' : 'auto', display: 'flex', alignItems: 'flex-start', gap: 12, cursor: isAnswered ? 'default' : 'pointer', ...styleOverride }}
              whileHover={!isAnswered ? { scale: 1.01 } : {}}
            >
              <span style={{ flexShrink: 0, width: 22, height: 22, borderRadius: '50%', border: '1.5px solid currentColor', opacity: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, marginTop: 1 }}>{i + 1}</span>
              <span style={{ flex: 1 }}>
                {v.img && <img src={v.img} alt="" style={{ display: 'block', maxWidth: 200, marginBottom: 8, borderRadius: 8 }} />}
                <span dangerouslySetInnerHTML={{ __html: v.text || '' }} />
              </span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
});

/* =========================================================================
   ReviewView
   ========================================================================= */

const ReviewView = ({ questions, answers, onBack }) => {
  const reviewRef = useRef(null);
  if (window.useMathJax) window.useMathJax(reviewRef, [questions]);

  return (
    <motion.div ref={reviewRef} key="review" initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass-panel review-container">
      <div className="review-header"><h2 style={{ textAlign: 'center', margin: 0 }}>Работа над ошибками</h2></div>
      <div className="review-content">
        {questions.map((q, i) => {
          const userAns = answers[i];
          const isSkipped = userAns === null || userAns === undefined;
          const isCorrect = !isSkipped && userAns === q.correctIndex;
          const status = isSkipped ? STATUS.neutral : (isCorrect ? STATUS.success : STATUS.error);
          const label = isSkipped ? 'ПРОПУЩЕНО' : (isCorrect ? 'ВЕРНО' : 'ОШИБКА');
          const labelColor = isSkipped ? 'var(--text-sec)' : (isCorrect ? '#059669' : '#b91c1c');

          return (
            <div key={i} style={{ background: 'var(--variant-default)', padding: 25, borderRadius: 20, marginBottom: 20, border: `2px solid ${status.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 15 }}>
                <strong>Вопрос {i + 1}</strong>
                <span style={{ color: labelColor, fontWeight: 'bold' }}>{label}</span>
              </div>
              <div style={{ marginBottom: 20, fontSize: 16 }} dangerouslySetInnerHTML={{ __html: q.question }}></div>
              {q.questionImg && <img src={q.questionImg} alt="Иллюстрация к вопросу" className="question-image" style={{ maxWidth: '100%', maxHeight: 200, display: 'block', margin: '0 auto 15px auto', borderRadius: 10 }} />}
              {q.variants.map((v, vi) => {
                let style = { padding: '10px 15px', borderRadius: 10, margin: '5px 0', border: '2px solid transparent', background: 'var(--glass-bg)', opacity: 0.8, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 8 };
                if (vi === q.correctIndex) { style.background = STATUS.success.bg; style.borderColor = STATUS.success.border; style.opacity = 1; }
                if (vi === userAns && !isCorrect) { style.background = STATUS.error.bg; style.borderColor = STATUS.error.border; style.opacity = 1; }
                return (
                  <div key={vi} style={style}>
                    {vi === userAns && <span title={isCorrect ? 'Ваш ответ' : 'Ваш ответ (неверный)'}>{isCorrect ? '✓' : '✕'}</span>}
                    <span dangerouslySetInnerHTML={{ __html: v.text || 'Изображение' }}></span>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
      <div className="review-footer"><Button onClick={onBack} style={{ boxShadow: '0 5px 15px rgba(0,0,0,0.1)', width: 'auto', padding: '0 40px' }}>В меню</Button></div>
    </motion.div>
  );
};

/* =========================================================================
   СТАТИСТИКА: Вкладки и Карточки
   ========================================================================= */

const TabBtn = ({ active, label, icon, gradient, onClick }) => {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      aria-pressed={active}
      style={{
        flex: 1, minWidth: 120, height: 46, borderRadius: 14, border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        fontWeight: 800, fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5,
        background: active ? gradient : 'var(--text-main)',
        color: active ? '#fff' : 'var(--bg-panel)',
        boxShadow: active ? '0 8px 16px -4px rgba(0,0,0,0.25)' : '0 4px 6px rgba(0,0,0,0.05)',
        transition: 'background 0.3s ease, box-shadow 0.3s ease'
      }}
    >
      <span style={{ fontSize: 16 }} aria-hidden="true">{icon}</span> {label}
    </motion.button>
  );
};

const StatCard = ({ title, value, prefix = '', suffix = '', icon, color, bgRgba, fullWidth }) => {
  const isNumeric = typeof value === 'number';
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 300 }}
      style={{
        background: bgRgba,
        border: `1px solid ${withAlpha(bgRgba, 0.35)}`,
        borderRadius: 20, padding: '24px 20px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', gridColumn: fullWidth ? '1 / -1' : 'auto',
        minHeight: 140
      }}
    >
      <div style={{ fontSize: 11, color: 'var(--text-sec)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
        {title}
      </div>
      <div style={{ fontSize: 46, fontWeight: 900, color: color, display: 'flex', alignItems: 'center', gap: 8, lineHeight: 1 }}>
        {icon && <span aria-hidden="true">{icon}</span>}
        {prefix}{isNumeric ? <CountUp value={value} /> : value}{suffix}
      </div>
    </motion.div>
  );
};

const StatsView = ({ history, setHistory, userData }) => {
  const [activeTab, setActiveTab] = useState('tests');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const deleteTimeoutRef = useRef(null);
  const sortedHistory = [...history].sort((a, b) => b.percent - a.percent);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  // Читаем localStorage заново при каждом заходе на вкладку — раньше данные
  // "замораживались" в момент маунта и не обновлялись, пока сдавал тест печати.
  const excelStats = userData?.excelProgress || { level: 1, xp: 0, completedLessons: 0, streak: 0 };
  const typingStats = useMemo(
    () => safeParseJSON(localStorage.getItem('typing_stats'), { maxWpm: 0, maxCombo: 0, testsCompleted: 0 }),
    [activeTab]
  );
  const hotkeyStats = useMemo(
    () => safeParseJSON(localStorage.getItem('hotkey_stats'), { maxScore: 0, sessionsPlayed: 0 }),
    [activeTab]
  );

  useEffect(() => () => clearTimeout(deleteTimeoutRef.current), []);

  const requestDelete = (id) => {
    setConfirmDeleteId(id);
    clearTimeout(deleteTimeoutRef.current);
    deleteTimeoutRef.current = setTimeout(() => setConfirmDeleteId(null), 3000);
  };

  const confirmDelete = (id) => {
    clearTimeout(deleteTimeoutRef.current);
    const nh = history.filter(i => i.id !== id);
    setHistory(nh);
    localStorage.setItem('test_history_v1', JSON.stringify(nh));
    setConfirmDeleteId(null);
  };

  // Отрисовка графика (только для вкладки Тесты)
  useEffect(() => {
    if (activeTab === 'tests' && chartRef.current && sortedHistory.length > 0) {
      if (chartInstance.current) chartInstance.current.destroy();
      const ctx = chartRef.current.getContext('2d');
      const top10 = sortedHistory.slice(0, 10);
      chartInstance.current = new window.Chart(ctx, {
        type: 'bar',
        data: {
          labels: top10.map(i => i.student),
          datasets: [{
            label: '%',
            data: top10.map(i => i.percent),
            // Цвет столбца повторяет логику таблицы ниже (зелёный/красный по
            // порогу 50%), так график и таблица говорят на одном языке.
            backgroundColor: top10.map(i => (i.percent >= 50 ? '#10b981' : '#ef4444')),
            borderRadius: 8,
            barPercentage: 0.6
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true, max: 100,
              grid: { color: 'rgba(255,255,255,0.05)', drawBorder: false },
              ticks: { color: '#64748b', font: { weight: '600' } }
            },
            x: {
              grid: { display: false, drawBorder: false },
              ticks: { color: '#64748b', font: { weight: '600' } }
            }
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                title: (items) => top10[items[0].dataIndex]?.topic || items[0].label,
                label: (item) => `${item.parsed.y}%`
              }
            }
          },
          responsive: true,
          maintainAspectRatio: false
        }
      });
    }
    return () => { if (chartInstance.current) chartInstance.current.destroy(); };
  }, [activeTab, sortedHistory]);

  return (
    <motion.div key="stats" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel" style={{ width: '100%', maxWidth: 850, maxHeight: '85vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', padding: '36px 40px', borderRadius: 28 }}>

      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <h2 style={{ margin: 0, fontSize: 26, fontWeight: 900, color: 'var(--text-main)' }}>📊 Мой Прогресс</h2>
      </div>

      <div className="modern-scroll" style={{ display: 'flex', gap: 12, marginBottom: 28, overflowX: 'auto', paddingBottom: 8 }} role="tablist">
        <TabBtn active={activeTab === 'tests'} gradient="linear-gradient(135deg, #a855f7 0%, #c084fc 100%)" icon="📝" label="Тесты" onClick={() => setActiveTab('tests')} />
        <TabBtn active={activeTab === 'excel'} gradient="linear-gradient(135deg, #10b981 0%, #34d399 100%)" icon="📊" label="Excel" onClick={() => setActiveTab('excel')} />
        <TabBtn active={activeTab === 'typing'} gradient="linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)" icon="⌨️" label="Печать" onClick={() => setActiveTab('typing')} />
        <TabBtn active={activeTab === 'hotkeys'} gradient="linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)" icon="⚡" label="Хоткеи" onClick={() => setActiveTab('hotkeys')} />
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'tests' && (
          <motion.div key="t-tests" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.2 }}>
            {sortedHistory.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 20px' }}>
                <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.5 }} aria-hidden="true">📝</div>
                <p style={{ color: 'var(--text-sec)', fontWeight: 600, margin: 0 }}>Вы ещё не проходили тесты</p>
                <p style={{ color: 'var(--text-sec)', fontSize: 13, marginTop: 6, opacity: 0.8 }}>Результаты появятся здесь сразу после первой попытки</p>
              </div>
            ) : (
              <>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: 20, borderRadius: 20, marginBottom: 25, height: 240, border: '1px solid rgba(255,255,255,0.05)' }}>
                  <canvas ref={chartRef}></canvas>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 10 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-sec)', fontSize: 12, textTransform: 'uppercase' }}>
                      <th style={{ textAlign: 'left', padding: '12px 10px' }}>Тест / Дата</th>
                      <th style={{ padding: '12px 10px', textAlign: 'right' }}>%</th>
                      <th style={{ padding: '12px 10px', width: 70 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedHistory.map((h, i) => (
                      <tr key={h.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '16px 10px' }}>
                          <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--text-main)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                            {i === 0 && <span title="Лучший результат" aria-hidden="true">🏆</span>}
                            {h.topic}
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--text-sec)' }}>{h.student} • {h.date}</div>
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: '900', fontSize: 16, color: h.percent >= 50 ? '#10b981' : '#ef4444' }}>{h.percent}%</td>
                        <td style={{ textAlign: 'right', paddingRight: 10 }}>
                          {confirmDeleteId === h.id ? (
                            <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                              <button onClick={() => confirmDelete(h.id)} aria-label="Подтвердить удаление" style={{ border: 'none', background: STATUS.error.bg, color: '#ef4444', borderRadius: 6, fontSize: 12, fontWeight: 700, padding: '4px 8px', cursor: 'pointer' }}>Удалить</button>
                              <button onClick={() => setConfirmDeleteId(null)} aria-label="Отменить удаление" style={{ border: 'none', background: 'transparent', color: 'var(--text-sec)', fontSize: 12, cursor: 'pointer' }}>Отмена</button>
                            </span>
                          ) : (
                            <button onClick={() => requestDelete(h.id)} aria-label="Удалить запись" style={{ border: 'none', background: 'transparent', color: 'var(--text-sec)', fontSize: 18, cursor: 'pointer', transition: 'color 0.2s' }}>✕</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </motion.div>
        )}

        {activeTab === 'excel' && (
          <motion.div key="t-excel" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.2 }} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 15 }}>
            <StatCard title="Текущий уровень" value={excelStats.level} color="#10b981" bgRgba="rgba(16, 185, 129, 0.05)" />
            <StatCard title="Заработано XP" value={excelStats.xp} icon="⚡" color="#3b82f6" bgRgba="rgba(59, 130, 246, 0.05)" />
            <StatCard title="Решено формул" value={excelStats.completedLessons} color="#f59e0b" bgRgba="rgba(245, 158, 11, 0.05)" />
            <StatCard title="Серия без ошибок" value={excelStats.streak} icon="🔥" color="#ef4444" bgRgba="rgba(239, 68, 68, 0.05)" />
          </motion.div>
        )}

        {activeTab === 'typing' && (
          <motion.div key="t-typing" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.2 }} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 15 }}>
            <StatCard title="Рекорд скорости" value={typingStats.maxWpm} suffix=" WPM" color="#a855f7" bgRgba="rgba(168, 85, 247, 0.05)" />
            <StatCard title="Лучшее комбо" value={typingStats.maxCombo} prefix="x" color="#0ea5e9" bgRgba="rgba(14, 165, 233, 0.05)" />
            <StatCard title="Пройдено текстов" value={typingStats.testsCompleted} color="var(--text-main)" bgRgba="var(--nav-item-bg)" fullWidth={true} />
          </motion.div>
        )}

        {activeTab === 'hotkeys' && (
          <motion.div key="t-hotkeys" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.2 }} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 15 }}>
            <StatCard title="Рекорд за сессию" value={hotkeyStats.maxScore} icon="⚡" color="#f59e0b" bgRgba="rgba(245, 158, 11, 0.05)" />
            <StatCard title="Сыграно сессий" value={hotkeyStats.sessionsPlayed} color="#22c55e" bgRgba="rgba(34, 197, 94, 0.05)" />
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};

Object.assign(window, { TestQuestionCard, ReviewView, StatsView });
