// --- 11_tests_module.js ---
(function () {
  const {
    useState,
    useEffect,
    useRef,
    memo
  } = React;
  const {
    motion,
    AnimatePresence
  } = window.Motion;
  const {
    Button,
    Input,
    captureViolation,
    sendTestResultToDiscord,
    shuffleArray
  } = window;
  const ActionIcon = ({
    name
  }) => /*#__PURE__*/React.createElement("svg", {
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true"
  }, {
    play: /*#__PURE__*/React.createElement("path", {
      d: "m9 5 11 7-11 7V5Z"
    }),
    back: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "m9 6-6 6 6 6M3 12h18"
    })),
    close: /*#__PURE__*/React.createElement("path", {
      d: "m6 6 12 12M18 6 6 18"
    }),
    print: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M7 8V3h10v5M7 17H4V9h16v8h-3"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M7 14h10v7H7zM17 11h.01"
    })),
    upload: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M12 16V3m-5 5 5-5 5 5M4 15v6h16v-6"
    })),
    review: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("rect", {
      x: "4",
      y: "3",
      width: "16",
      height: "18",
      rx: "3"
    }), /*#__PURE__*/React.createElement("path", {
      d: "m8 9 2 2 5-5M8 16h8"
    })),
    repeat: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M20 4v6h-6"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M20 10a8 8 0 1 0-1 8"
    }))
  }[name]);
  const TestIcon = ({
    name,
    size = 20
  }) => /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true"
  }, {
    check: /*#__PURE__*/React.createElement("path", {
      d: "m5 12 4 4L19 6"
    }),
    arrow: /*#__PURE__*/React.createElement("path", {
      d: "M4 12h16m-6-6 6 6-6 6"
    }),
    clock: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "12",
      r: "9"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M12 7v5l3 2"
    })),
    list: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("rect", {
      x: "4",
      y: "3",
      width: "16",
      height: "18",
      rx: "3"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M8 8h8M8 12h8M8 16h5"
    })),
    close: /*#__PURE__*/React.createElement("path", {
      d: "m6 6 12 12M18 6 6 18"
    }),
    spark: /*#__PURE__*/React.createElement("path", {
      d: "m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5z"
    }),
    repeat: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M20 4v6h-6"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M20 10a8 8 0 1 0-1 8"
    })),
    save: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M7 3v5h8V3M7 21v-8h10v8"
    }))
  }[name] || /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "8"
  }));
  const safeImage = value => typeof value === 'string' && /^(https?:\/\/|data:image\/(png|jpeg|gif|webp);base64,|blob:)/i.test(value) ? value : null;
  function cleanHTML(value) {
    const doc = new DOMParser().parseFromString(String(value || ''), 'text/html');
    const allowed = new Set(['P', 'BR', 'B', 'STRONG', 'I', 'EM', 'U', 'S', 'SUB', 'SUP', 'SPAN', 'DIV', 'UL', 'OL', 'LI', 'TABLE', 'THEAD', 'TBODY', 'TR', 'TH', 'TD', 'CODE', 'PRE', 'BLOCKQUOTE']);
    for (const el of [...doc.body.querySelectorAll('*')]) {
      if (['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED', 'SVG', 'MATH', 'LINK', 'META'].includes(el.tagName)) {
        el.remove();
        continue;
      }
      if (!allowed.has(el.tagName)) {
        el.replaceWith(...el.childNodes);
        continue;
      }
      for (const a of [...el.attributes]) el.removeAttribute(a.name);
    }
    return doc.body.innerHTML;
  }
  function normalizeTests(data) {
    if (!Array.isArray(data) || !data.length || data.length > 5000) throw Error('Файл должен содержать от 1 до 5000 вопросов.');
    return data.map((q, i) => {
      if (!q || !Array.isArray(q.variants) || q.variants.length < 2 || q.variants.length > 12 || !Number.isInteger(q.correctIndex) || q.correctIndex < 0 || q.correctIndex >= q.variants.length) throw Error(`Проверь варианты и correctIndex в вопросе ${i + 1}.`);
      const variants = q.variants.map(v => {
        const obj = typeof v === 'string' ? {
          text: v
        } : v;
        if (!obj || typeof obj !== 'object') throw Error(`Неверный вариант в вопросе ${i + 1}.`);
        const text = cleanHTML(obj.text),
          img = safeImage(obj.img);
        if (!text.trim() && !img) throw Error(`Пустой вариант в вопросе ${i + 1}.`);
        return {
          text,
          img
        };
      });
      const question = cleanHTML(q.question),
        questionImg = safeImage(q.questionImg);
      if (!question.trim() && !questionImg) throw Error(`Вопрос ${i + 1} пустой.`);
      return {
        ...q,
        question,
        questionImg,
        variants
      };
    });
  }
  const shuffled = items => {
    const a = [...items];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  const shuffledQuestion = q => {
    const variants = shuffled(q.variants.map((v, i) => ({
      ...v,
      _isCorrectOriginal: i === q.correctIndex
    })));
    return {
      ...q,
      variants,
      correctIndex: variants.findIndex(v => v._isCorrectOriginal)
    };
  };
  const TestQuestionCard = memo(({
    question,
    index,
    answers,
    onAnswer,
    locked = false,
    leaving = false
  }) => {
    const cardRef = useRef(null);
    if (window.useMathJax) window.useMathJax(cardRef, [question]);
    if (!question) return null;
    const answered = Number.isInteger(answers[index]);
    return /*#__PURE__*/React.createElement("article", {
      ref: cardRef,
      className: `tx-question ${leaving ? 'tx-leaving' : 'tx-arriving'}`
    }, /*#__PURE__*/React.createElement("div", {
      className: "tx-question-top"
    }, /*#__PURE__*/React.createElement("span", {
      className: "tx-eyebrow"
    }, "\u0412\u041E\u041F\u0420\u041E\u0421 ", String(index + 1).padStart(2, '0')), /*#__PURE__*/React.createElement("span", {
      className: "tx-caption"
    }, "\u041E\u0434\u0438\u043D \u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u044B\u0439 \u043E\u0442\u0432\u0435\u0442")), /*#__PURE__*/React.createElement("div", {
      className: "tx-question-text",
      dangerouslySetInnerHTML: {
        __html: question.question
      }
    }), question.questionImg && /*#__PURE__*/React.createElement("img", {
      src: question.questionImg,
      className: "tx-question-image",
      alt: "\u0418\u043B\u043B\u044E\u0441\u0442\u0440\u0430\u0446\u0438\u044F \u043A \u0432\u043E\u043F\u0440\u043E\u0441\u0443"
    }), /*#__PURE__*/React.createElement("div", {
      className: "tx-options"
    }, question.variants.map((v, i) => {
      const selected = answers[index] === i,
        correct = i === question.correctIndex;
      return /*#__PURE__*/React.createElement("button", {
        type: "button",
        key: i,
        disabled: answered || locked,
        className: `tx-option ${answered && correct ? 'correct' : ''} ${answered && selected && !correct ? 'wrong' : ''} ${selected ? 'selected' : ''}`,
        onClick: () => onAnswer(i),
        style: {
          '--option-delay': `${i * 35}ms`
        }
      }, /*#__PURE__*/React.createElement("span", {
        className: "tx-option-index"
      }, answered && correct ? /*#__PURE__*/React.createElement(TestIcon, {
        name: "check",
        size: 17
      }) : answered && selected ? /*#__PURE__*/React.createElement(TestIcon, {
        name: "close",
        size: 17
      }) : String(i + 1).padStart(2, '0')), /*#__PURE__*/React.createElement("span", {
        className: "tx-option-content"
      }, v.img && /*#__PURE__*/React.createElement("img", {
        src: v.img,
        alt: `Изображение варианта ${i + 1}`
      }), /*#__PURE__*/React.createElement("span", {
        dangerouslySetInnerHTML: {
          __html: v.text
        }
      })), answered && (selected || correct) && /*#__PURE__*/React.createElement("span", {
        className: "tx-option-status"
      }, correct ? 'Верный ответ' : 'Твой ответ'));
    })), answered && /*#__PURE__*/React.createElement("div", {
      className: `tx-answer-note ${answers[index] === question.correctIndex ? 'correct' : 'wrong'}`,
      role: "status"
    }, /*#__PURE__*/React.createElement(TestIcon, {
      name: answers[index] === question.correctIndex ? 'check' : 'close',
      size: 17
    }), answers[index] === question.correctIndex ? 'Верно. Продолжаем!' : 'Ответ принят. Правильный вариант выделен.'));
  });
  const ReviewView = ({
    questions,
    answers,
    onBack
  }) => {
    const reviewRef = useRef(null);
    const [onlyMistakes, setOnlyMistakes] = useState(true);
    if (window.useMathJax) window.useMathJax(reviewRef, [questions]);
    const rows = questions.map((q, i) => ({
      q,
      i
    })).filter(({
      q,
      i
    }) => !onlyMistakes || answers[i] !== q.correctIndex);
    return /*#__PURE__*/React.createElement("div", {
      className: "tx-tests"
    }, /*#__PURE__*/React.createElement("section", {
      ref: reviewRef,
      className: "tx-panel tx-review tx-enter"
    }, /*#__PURE__*/React.createElement("header", {
      className: "tx-page-heading"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
      className: "tx-eyebrow"
    }, "\u0420\u0410\u0417\u0411\u041E\u0420 \u041F\u0420\u041E\u0425\u041E\u0416\u0414\u0415\u041D\u0418\u042F"), /*#__PURE__*/React.createElement("h2", null, "\u0420\u0430\u0431\u043E\u0442\u0430 \u043D\u0430\u0434 \u043E\u0448\u0438\u0431\u043A\u0430\u043C\u0438"), /*#__PURE__*/React.createElement("p", null, "\u0421\u0440\u0430\u0432\u043D\u0438 \u0441\u0432\u043E\u0439 \u043E\u0442\u0432\u0435\u0442 \u0441 \u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u044B\u043C.")), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "tx-button",
      onClick: onBack
    }, "\u041A \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442\u0443")), /*#__PURE__*/React.createElement("div", {
      className: "tx-tabs"
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      "aria-pressed": onlyMistakes,
      onClick: () => setOnlyMistakes(true)
    }, "\u041E\u0448\u0438\u0431\u043A\u0438 \u0438 \u043F\u0440\u043E\u043F\u0443\u0441\u043A\u0438"), /*#__PURE__*/React.createElement("button", {
      type: "button",
      "aria-pressed": !onlyMistakes,
      onClick: () => setOnlyMistakes(false)
    }, "\u0412\u0441\u0435 \u0432\u043E\u043F\u0440\u043E\u0441\u044B")), !rows.length && /*#__PURE__*/React.createElement("div", {
      className: "tx-empty"
    }, /*#__PURE__*/React.createElement(TestIcon, {
      name: "check",
      size: 30
    }), /*#__PURE__*/React.createElement("h3", null, "\u0412\u0441\u0435 \u043E\u0442\u0432\u0435\u0442\u044B \u0432\u0435\u0440\u043D\u044B\u0435"), /*#__PURE__*/React.createElement("p", null, "\u041C\u043E\u0436\u043D\u043E \u043F\u043E\u0441\u043C\u043E\u0442\u0440\u0435\u0442\u044C \u0432\u0435\u0441\u044C \u0442\u0435\u0441\u0442 \u043D\u0430 \u0432\u043A\u043B\u0430\u0434\u043A\u0435 \xAB\u0412\u0441\u0435 \u0432\u043E\u043F\u0440\u043E\u0441\u044B\xBB.")), /*#__PURE__*/React.createElement("div", {
      className: "tx-review-list"
    }, rows.map(({
      q,
      i
    }) => /*#__PURE__*/React.createElement("article", {
      className: "tx-review-card",
      key: i
    }, /*#__PURE__*/React.createElement("div", {
      className: "tx-review-meta"
    }, /*#__PURE__*/React.createElement("span", null, "\u0412\u043E\u043F\u0440\u043E\u0441 ", i + 1), /*#__PURE__*/React.createElement("span", null, answers[i] == null ? 'Пропущен' : answers[i] === q.correctIndex ? 'Верно' : 'Ошибка')), /*#__PURE__*/React.createElement("div", {
      className: "tx-question-text",
      dangerouslySetInnerHTML: {
        __html: q.question
      }
    }), q.questionImg && /*#__PURE__*/React.createElement("img", {
      src: q.questionImg,
      className: "tx-question-image",
      alt: "\u0418\u043B\u043B\u044E\u0441\u0442\u0440\u0430\u0446\u0438\u044F \u0432\u043E\u043F\u0440\u043E\u0441\u0430"
    }), q.variants.map((v, j) => /*#__PURE__*/React.createElement("div", {
      key: j,
      className: `tx-review-option ${j === q.correctIndex ? 'correct' : j === answers[i] ? 'wrong' : ''}`
    }, /*#__PURE__*/React.createElement("span", null, j + 1, "."), /*#__PURE__*/React.createElement("div", null, v.img && /*#__PURE__*/React.createElement("img", {
      src: v.img,
      alt: "\u0418\u043B\u043B\u044E\u0441\u0442\u0440\u0430\u0446\u0438\u044F \u0432\u0430\u0440\u0438\u0430\u043D\u0442\u0430"
    }), /*#__PURE__*/React.createElement("div", {
      dangerouslySetInnerHTML: {
        __html: v.text
      }
    })), j === q.correctIndex && /*#__PURE__*/React.createElement(TestIcon, {
      name: "check",
      size: 18
    }))))))));
  };
  const FinishConfirm = ({
    remaining,
    onContinue,
    onFinish
  }) => {
    const ref = useRef(null);
    useEffect(() => {
      const el = ref.current;
      el.showModal();
      return () => {
        if (el.open) el.close();
      };
    }, []);
    return /*#__PURE__*/React.createElement("dialog", {
      className: "tx-confirm-dialog",
      ref: ref,
      "aria-labelledby": "tx-confirm-title",
      onCancel: e => {
        e.preventDefault();
        onContinue();
      },
      onClick: e => {
        if (e.target === e.currentTarget) {
          const r = e.currentTarget.getBoundingClientRect();
          if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) onContinue();
        }
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "tx-confirm-symbol"
    }, /*#__PURE__*/React.createElement(TestIcon, {
      name: "clock",
      size: 26
    })), /*#__PURE__*/React.createElement("h3", {
      id: "tx-confirm-title"
    }, "\u0417\u0430\u0432\u0435\u0440\u0448\u0438\u0442\u044C \u0442\u0435\u0441\u0442?"), /*#__PURE__*/React.createElement("p", null, "\u041E\u0441\u0442\u0430\u043B\u043E\u0441\u044C \u0431\u0435\u0437 \u043E\u0442\u0432\u0435\u0442\u0430: ", /*#__PURE__*/React.createElement("b", null, remaining), ".", /*#__PURE__*/React.createElement("br", null), "\u041C\u043E\u0436\u043D\u043E \u0432\u0435\u0440\u043D\u0443\u0442\u044C\u0441\u044F \u043A \u0432\u043E\u043F\u0440\u043E\u0441\u0430\u043C \u0438\u043B\u0438 \u043F\u043E\u0441\u043C\u043E\u0442\u0440\u0435\u0442\u044C \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442."), /*#__PURE__*/React.createElement("div", {
      className: "tx-confirm-actions"
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "tx-button primary",
      autoFocus: true,
      onClick: onContinue
    }, "\u041F\u0440\u043E\u0434\u043E\u043B\u0436\u0438\u0442\u044C \u0442\u0435\u0441\u0442"), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "tx-button tx-finish-danger",
      onClick: onFinish
    }, "\u0414\u0430, \u0437\u0430\u0432\u0435\u0440\u0448\u0438\u0442\u044C")));
  };
  const AnimatedHeader = () => {
    const stageRef = useRef(null);
    const tagOldRef = useRef(null);
    const tagNewRef = useRef(null);
    const wandRef = useRef(null);
    const phrases = ['Увидь свой прогресс.', 'Каждый шаг — новый опыт.', 'Учись. Пробуй. Достигай.'];
    useEffect(() => {
      const stage = stageRef.current,
        tagOld = tagOldRef.current,
        tagNew = tagNewRef.current,
        wand = wandRef.current;
      if (!stage || !tagOld || !tagNew || !wand) return;
      let index = 0,
        ambientTimer = null,
        transitionTimeout = null,
        rafId = null;
      const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
      const easeInOutCubic = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      function spawnSparkle(x, y, size) {
        const s = document.createElement('span');
        s.className = 'tx-sparkle';
        s.style.left = x + 'px';
        s.style.top = y + 'px';
        const scale = size || 0.7 + Math.random() * 0.7;
        s.style.width = 13 * scale + 'px';
        s.style.height = 13 * scale + 'px';
        stage.appendChild(s);
        s.addEventListener('animationend', () => s.remove());
      }
      // Range измеряет сами буквы, а не растянутую CSS-сцену.
      function textLines(element) {
        const range = document.createRange();
        range.selectNodeContents(element);
        const origin = stage.getBoundingClientRect();
        return Array.from(range.getClientRects()).filter(r => r.width > 0 && r.height > 0).map(r => ({left:r.left-origin.left,right:r.right-origin.left,top:r.top-origin.top,bottom:r.bottom-origin.top,width:r.width}));
      }
      function runWandTransition() {
        const nextIndex = (index + 1) % phrases.length;
        tagNew.textContent = phrases[nextIndex];
        const initialLines = textLines(tagNew);
        const total = initialLines.reduce((sum,line)=>sum+line.width,0);
        const duration = 700 + total * 1.2;
        const start = performance.now();
        let lastSparkle = 0;
        function frame(now) {
          const t = Math.min(1, (now - start) / duration);
          const eased = easeInOutCubic(t);
          const lines = textLines(tagNew);
          if (!lines.length) { scheduleNext(); return; }
          let distance = lines.reduce((sum,line)=>sum+line.width,0) * eased;
          let line = lines[lines.length-1];
          for (const candidate of lines) {
            line = candidate;
            if (distance <= candidate.width) break;
            distance -= candidate.width;
          }
          const x = t === 1 ? line.right : line.left + clamp(distance,0,line.width);
          const y = (line.top + line.bottom) / 2;
          wand.style.opacity = String(Math.min(1,t*10));
          wand.style.transform = `translate(${x - 12}px, ${y - 12}px) rotate(${t * 220}deg)`;
          const width = stage.clientWidth;
          const top = Math.max(0,line.top-3), bottom = line.bottom+3;
          tagNew.style.clipPath = `polygon(0 0, ${width}px 0, ${width}px ${top}px, ${x}px ${top}px, ${x}px ${bottom}px, 0 ${bottom}px)`;
          tagOld.style.opacity = String(1-eased);
          if (now - lastSparkle > 45) {
            spawnSparkle(x,y,0.65);
            lastSparkle = now;
          }
          if (t < 1) rafId = requestAnimationFrame(frame);
          else {
            index = nextIndex;
            tagOld.textContent = phrases[index];
            tagOld.style.opacity = '1';
            tagOld.style.clipPath = 'inset(0 0 0 0)';
            tagNew.style.clipPath = 'inset(0 100% 0 0)';
            fadeOutWand(x,y);
          }
        }
        rafId = requestAnimationFrame(frame);
      }
      function fadeOutWand(fromX, fromY) {
        spawnSparkle(fromX, fromY, 1.1);
        const duration = 500;
        const start = performance.now();
        function fadeFrame(now) {
          const t = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - t, 3);
          wand.style.transform = `translate(${fromX - 12}px, ${fromY - 12}px) rotate(${220 + eased * 40}deg) scale(${1 - eased * 0.3})`;
          wand.style.opacity = String(1 - t);
          if (t < 1) {
            rafId = requestAnimationFrame(fadeFrame);
          } else {
            wand.style.opacity = '0';
            stage.style.width = '';
            scheduleNext();
          }
        }
        rafId = requestAnimationFrame(fadeFrame);
      }
      function ambientSparkle() {
        const lines = textLines(tagOld);
        if (!lines.length) return;
        const line = lines[Math.floor(Math.random()*lines.length)];
        spawnSparkle(line.left+Math.random()*line.width,(line.top+line.bottom)/2,0.55+Math.random()*0.4);
      }
      let firstRun = true;
      function scheduleNext() {
        ambientTimer = setInterval(ambientSparkle, 900);
        transitionTimeout = setTimeout(() => {
          clearInterval(ambientTimer);
          runWandTransition();
        }, firstRun ? 1500 : 2800);
        firstRun = false;
      }
      tagOld.textContent = phrases[0];
      tagNew.textContent = phrases[0];
      scheduleNext();
      return () => {
        clearInterval(ambientTimer);
        clearTimeout(transitionTimeout);
        if (rafId) cancelAnimationFrame(rafId);
      };
    }, []);
    return /*#__PURE__*/React.createElement("header", {
      className: "tx-hero"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
      className: "tx-eyebrow"
    }, "ULTIMATE LMS \xB7 \u0422\u0415\u0421\u0422\u0418\u0420\u041E\u0412\u0410\u041D\u0418\u0415"), /*#__PURE__*/React.createElement("h1", null, "\u041F\u0440\u043E\u0432\u0435\u0440\u044C \u0437\u043D\u0430\u043D\u0438", /*#__PURE__*/React.createElement("span", {
      className: "tx-cap-letter"
    }, "\u044F", /*#__PURE__*/React.createElement("svg", {
      className: "tx-cap",
      viewBox: "0 0 64 64",
      fill: "none",
      "aria-hidden": "true"
    }, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("linearGradient", {
      id: "txCapGrad",
      x1: "0",
      y1: "0",
      x2: "64",
      y2: "64",
      gradientUnits: "userSpaceOnUse"
    }, /*#__PURE__*/React.createElement("stop", {
      offset: "0%",
      stopColor: "#7ab8ff"
    }), /*#__PURE__*/React.createElement("stop", {
      offset: "100%",
      stopColor: "#8a5bff"
    }))), /*#__PURE__*/React.createElement("path", {
      d: "M32 10L58 22L32 34L6 22L32 10Z",
      fill: "url(#txCapGrad)"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M18 27V40C18 40 24 46 32 46C40 46 46 40 46 40V27L32 34L18 27Z",
      fill: "#3a4bcf"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M56 24V38",
      stroke: "#1c2a99",
      strokeWidth: "2.5",
      strokeLinecap: "round"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "56",
      cy: "40",
      r: "2.6",
      fill: "#1c2a99"
    }))), ".", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
      className: "tx-wand-stage",
      ref: stageRef
    }, /*#__PURE__*/React.createElement("span", {
      className: "tx-wand-text",
      ref: tagOldRef
    }, phrases[0]), /*#__PURE__*/React.createElement("span", {
      className: "tx-wand-text new",
      ref: tagNewRef,
      "aria-hidden": "true"
    }, phrases[0]), /*#__PURE__*/React.createElement("span", {
      className: "tx-wand",
      ref: wandRef,
      "aria-hidden": "true"
    }, /*#__PURE__*/React.createElement("svg", {
      viewBox: "0 0 24 24",
      fill: "currentColor"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M12 2l2.2 7.8L22 12l-7.8 2.2L12 22l-2.2-7.8L2 12l7.8-2.2L12 2z"
    }))))), /*#__PURE__*/React.createElement("p", null, "\u0412\u044B\u0431\u0435\u0440\u0438 \u043D\u0430\u0431\u043E\u0440, \u043D\u0430\u0441\u0442\u0440\u043E\u0439 \u0432\u0440\u0435\u043C\u044F \u0438 \u043F\u0435\u0440\u0435\u0445\u043E\u0434\u0438 \u043A \u0432\u043E\u043F\u0440\u043E\u0441\u0430\u043C.")), /*#__PURE__*/React.createElement("div", {
      className: "tx-hero-art",
      "aria-hidden": "true"
    }, /*#__PURE__*/React.createElement("span", null), /*#__PURE__*/React.createElement("span", null), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(TestIcon, {
      name: "list",
      size: 48
    }))));
  };

  // --- КОМПОНЕНТ SWIPE-TO-DELETE ---
  const SwipeableRow = ({
    children,
    rowKey,
    registerClose,
    onArm,
    onDismiss,
    onClick
  }) => {
    const itemRef = useRef(null);
    const hintRef = useRef(null);
    const stateRef = useRef({
      dragging: false,
      axis: null,
      startX: 0,
      startY: 0,
      baseX: 0,
      armed: false,
      overDismiss: false,
      suppressNextClick: false
    });
    const dismissTimer = useRef(null),
      dismissed = useRef(false);
    const OPEN = 84,
      DISMISS = 190;
    const vibrate = ms => {
      if (navigator.vibrate) {
        try {
          navigator.vibrate(ms);
        } catch (e) {}
      }
    };
    const setX = x => {
      const item = itemRef.current,
        hint = hintRef.current;
      if (!item || !hint) return;
      item.style.transform = `translateX(${x}px)`;
      item.dataset.x = x;
      const absX = Math.abs(x);
      hint.style.opacity = Math.min(1, absX / OPEN);
      const openP = Math.min(1, absX / OPEN);
      const dismissP = Math.max(0, Math.min(1, (absX - OPEN) / (DISMISS - OPEN)));
      hint.style.setProperty('--icon-scale', (0.8 + openP * 0.2 + dismissP * 0.25).toFixed(3));
      hint.style.filter = `brightness(${1 + dismissP * 0.18})`;
      const s = stateRef.current;
      const nowArmed = absX >= OPEN * 0.5;
      if (nowArmed && !s.armed) vibrate(9);
      s.armed = nowArmed;
      const nowOver = absX >= DISMISS;
      if (nowOver && !s.overDismiss) vibrate(16);
      s.overDismiss = nowOver;
    };
    const close = () => setX(0);
    const animateOutAndDismiss = () => {
      const item = itemRef.current;
      if (!item || dismissed.current) return;
      dismissed.current = true;
      item.style.transition = 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.3s ease';
      item.style.transform = 'translateX(-120%) scale(0.95)';
      item.style.opacity = '0';
      dismissTimer.current = setTimeout(() => {
        onDismiss && onDismiss();
      }, 280);
    };
    useEffect(() => {
      if (registerClose) registerClose(rowKey, close);
      const el = itemRef.current;
      const guard = e => {
        if (stateRef.current.suppressNextClick) {
          e.preventDefault();
          e.stopPropagation();
          stateRef.current.suppressNextClick = false;
        }
      };
      el.addEventListener('click', guard, true);
      return () => {
        el.removeEventListener('click', guard, true);
        clearTimeout(dismissTimer.current);
        registerClose?.(rowKey, null);
      };
    }, []);
    const onDown = e => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      const s = stateRef.current;
      s.dragging = true;
      s.axis = null;
      s.startX = e.clientX;
      s.startY = e.clientY;
      s.baseX = parseFloat(itemRef.current.dataset.x) || 0;
      itemRef.current.style.transition = 'none';
      itemRef.current.setPointerCapture(e.pointerId);
    };
    const onMove = e => {
      const s = stateRef.current;
      if (!s.dragging) return;
      const dx = e.clientX - s.startX,
        dy = e.clientY - s.startY;
      if (s.axis === null) {
        if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
        s.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
        if (s.axis === 'y') {
          s.dragging = false;
          return;
        }
        if (onArm) onArm();
      }
      if (s.axis !== 'x') return;
      let x = s.baseX + dx;
      if (x > 0) x *= 0.25;
      setX(x);
    };
    const onUp = e => {
      const s = stateRef.current;
      if (!s.dragging) return;
      s.dragging = false;
      const item = itemRef.current;
      item.style.transition = 'transform 0.32s cubic-bezier(0.32, 0.72, 0, 1)';
      if (item.hasPointerCapture(e.pointerId)) item.releasePointerCapture(e.pointerId);
      if (s.axis === 'x') {
        const x = parseFloat(item.dataset.x) || 0;
        if (Math.abs(x) > 4) s.suppressNextClick = true;
        if (x < -DISMISS) {
          vibrate(20);
          animateOutAndDismiss();
        } else if (x < -OPEN * 0.5) {
          setX(-OPEN);
          if (hintRef.current) {
            hintRef.current.classList.add('armed-pop');
            setTimeout(() => hintRef.current && hintRef.current.classList.remove('armed-pop'), 320);
          }
        } else {
          close();
        }
      } else {
        if (onClick) onClick();
      }
      s.axis = null;
    };
    const handleHintClick = e => {
      e.stopPropagation();
      const x = parseFloat(itemRef.current.dataset.x) || 0;
      if (Math.abs(x) < OPEN * 0.6) return;
      vibrate(20);
      animateOutAndDismiss();
    };
    return /*#__PURE__*/React.createElement("div", {
      className: "tlms-swrow-track"
    }, /*#__PURE__*/React.createElement("div", {
      className: "tlms-swrow-hint",
      ref: hintRef,
      onClick: handleHintClick
    }, /*#__PURE__*/React.createElement("svg", {
      width: "18",
      height: "18",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "#fff",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M3 6h18"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"
    })), /*#__PURE__*/React.createElement("span", null, "\u0423\u0434\u0430\u043B\u0438\u0442\u044C")), /*#__PURE__*/React.createElement("div", {
      className: "tlms-swrow-item",
      ref: itemRef,
      "data-x": "0",
      role: "button",
      tabIndex: 0,
      onKeyDown: e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      },
      onPointerDown: onDown,
      onPointerMove: onMove,
      onPointerUp: onUp,
      onPointerCancel: e => {
        stateRef.current.dragging = false;
        stateRef.current.axis = null;
        close();
        if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
      }
    }, children));
  };
  const TestsLMS = ({
    view,
    setView,
    currentSet,
    tests,
    setTests,
    user,
    history = [],
    setHistory,
    fp,
    sets = [],
    addSet,
    deleteSet,
    openSet,
    teacherTests = [],
    openTeacherAssignedTest,
    removeTeacherTestStudent
  }) => {
    // --- ЛОКАЛЬНЫЕ СОСТОЯНИЯ ТЕСТА ---
    const [testSession, setTestSession] = useState({
      questions: [],
      currentIdx: 0,
      answers: [],
      score: 0
    });
    const [isResultSaved, setIsResultSaved] = useState(false);
    const [timeLeft, setTimeLeft] = useState(1200);
    const [customTime, setCustomTime] = useState('20');
    const [customQCount, setCustomQCount] = useState('');
    const [isAnimating, setIsAnimating] = useState(false);
    const [isNavOpen, setIsNavOpen] = useState(true);

    // --- СОСТОЯНИЯ ДЛЯ ЭКРАНА НАСТРОЕК ТЕСТА ---
    const [shakeTime, setShakeTime] = useState(false);
    const [shakeQ, setShakeQ] = useState(false);
    const [bumpTime, setBumpTime] = useState(false);
    const [bumpQ, setBumpQ] = useState(false);
    const [isStarting, setIsStarting] = useState(false);

    // --- СОСТОЯНИЯ ДЛЯ СВАЙПА, ДОБАВЛЕНИЯ И ОТМЕНЫ (UNDO) ---
    const [pendingDelete, setPendingDelete] = useState(null);

    // --- Состояния для поля добавления ---
    const [addFocused, setAddFocused] = useState(false);
    const [addVal, setAddVal] = useState('');
    const [addShake, setAddShake] = useState(false);
    const [addDone, setAddDone] = useState(false);
    const closeRegistryRef = useRef({});
    const registerClose = (key, fn) => {
      if (fn) closeRegistryRef.current[key] = fn;else delete closeRegistryRef.current[key];
    };
    const closeOthers = exceptKey => {
      Object.entries(closeRegistryRef.current).forEach(([k, fn]) => {
        if (k !== String(exceptKey) && fn) fn();
      });
    };
    useEffect(() => {
      const handler = e => {
        if (!e.target.closest('.tlms-swrow-track')) {
          Object.values(closeRegistryRef.current).forEach(fn => fn && fn());
        }
      };
      document.addEventListener('pointerdown', handler);
      return () => document.removeEventListener('pointerdown', handler);
    }, []);
    const requestDelete = (key, label, commitFn) => {
      if (pendingDelete) {
        clearTimeout(pendingDelete.timer);
        pendingDelete.commitFn();
      }
      const timer = setTimeout(() => {
        commitFn();
        setPendingDelete(null);
      }, 3500);
      setPendingDelete({
        key,
        label,
        commitFn,
        timer
      });
    };
    const undoDelete = () => {
      if (!pendingDelete) return;
      clearTimeout(pendingDelete.timer);
      setPendingDelete(null);
    };
    const handleAddNewSet = () => {
      const val = addVal.trim();
      if (!val) {
        setAddShake(true);
        setTimeout(() => setAddShake(false), 380);
        return;
      }

      // ИСПРАВЛЕНИЕ: Убираем новое имя из скрытых, вдруг оно там застряло
      setAddDone(true);
      setTimeout(() => setAddDone(false), 550);
      addSet(val);
      setAddVal('');
    };
    const [questionLeaving, setQuestionLeaving] = useState(false);
    const [notice, setNotice] = useState(null),
      [confirmFinish, setConfirmFinish] = useState(false),
      [saving, setSaving] = useState(false),
      [saveError, setSaveError] = useState(''),
      [studentName, setStudentName] = useState(''),
      [syncMessage, setSyncMessage] = useState('');
    const sessionRef = useRef(testSession),
      advanceTimer = useRef(null),
      switchTimer = useRef(null),
      answerLock = useRef(false),
      launchLock = useRef(false),
      finished = useRef(false),
      deadline = useRef(0),
      durationRef = useRef(1200),
      viewRef = useRef(view),
      setRef = useRef(currentSet),
      alive = useRef(true),
      savingRef = useRef(false),
      savedRef = useRef(false),
      resultRecord = useRef(null);
    viewRef.current = view;
    setRef.current = currentSet;
    const commitSession = s => {
      sessionRef.current = s;
      setTestSession(s);
    };
    useEffect(() => {
      alive.current = true;
      return () => {
        alive.current = false;
        finished.current = true;
        clearTimeout(advanceTimer.current);
        clearTimeout(switchTimer.current);
      };
    }, []);
    useEffect(() => {
      if (view !== 'test') {
        clearTimeout(advanceTimer.current);
        clearTimeout(switchTimer.current);
        answerLock.current = false;
        setIsAnimating(false);
        setQuestionLeaving(false);
        setConfirmFinish(false);
      }
    }, [view]);
    useEffect(() => {
      if (!notice || notice.error) return;
      const id = setTimeout(() => setNotice(null), 3000);
      return () => clearTimeout(id);
    }, [notice]);
    // --- АНТИЧИТ ---
    useEffect(() => {
      if (view !== 'test') return;
      const handleVisibility = () => {
        if (document.hidden && typeof captureViolation === 'function') captureViolation("⚠️ ВНИМАНИЕ: Смена вкладки / Сворачивание", fp);
      };
      const handleBlur = () => {
        if (typeof captureViolation === 'function') captureViolation("⚠️ ВНИМАНИЕ: Потеря фокуса (переход в другое окно)", fp);
      };
      const handlePaste = e => {
        if (typeof captureViolation === 'function') captureViolation("📋 ПЕРЕХВАТ: Попытка вставки (Paste)", fp, [{
          name: "Содержимое",
          value: `\`\`\`${e.clipboardData.getData('text') || 'пусто'}\`\`\``
        }]);
      };
      window.addEventListener('visibilitychange', handleVisibility);
      window.addEventListener('blur', handleBlur);
      window.addEventListener('paste', handlePaste);
      return () => {
        window.removeEventListener('visibilitychange', handleVisibility);
        window.removeEventListener('blur', handleBlur);
        window.removeEventListener('paste', handlePaste);
      };
    }, [view, fp]);
    useEffect(() => {
      if (view !== 'test' || !deadline.current) return;
      const tick = () => {
        const left = Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000));
        setTimeLeft(left);
        if (left === 0) finishTest();
      };
      tick();
      const timer = setInterval(tick, 250);
      document.addEventListener('visibilitychange', tick);
      return () => {
        clearInterval(timer);
        document.removeEventListener('visibilitychange', tick);
      };
    }, [view]);
    const formatTime = s => {
      const m = Math.floor(s / 60);
      const sec = s % 60;
      return `${m}:${sec < 10 ? '0' + sec : sec}`;
    };

    // --- ЛОГИКА ТЕСТА ---
    const importJSON = async e => {
      const file = e.target.files?.[0];
      e.target.value = '';
      if (!file) return;
      if (file.size > 10 * 1024 * 1024) {
        setNotice({
          error: true,
          text: 'Файл слишком большой. Максимум — 10 МБ.'
        });
        return;
      }
      const setName = currentSet;
      try {
        const normalized = normalizeTests(JSON.parse(await file.text()));
        if (!alive.current || viewRef.current !== 'set_menu' || setRef.current !== setName) return;
        localStorage.setItem('tests_' + setName, JSON.stringify(normalized));
        setTests(normalized);
        setNotice({
          text: `Импортировано вопросов: ${normalized.length}`
        });
      } catch (err) {
        if (alive.current) setNotice({
          error: true,
          text: err instanceof SyntaxError ? 'Не удалось прочитать JSON. Проверь формат файла.' : err.message
        });
      }
    };
    const startTest = () => {
      if (tests.length === 0) return setNotice({
        error: true,
        text: 'Сначала импортируй вопросы в этот набор.'
      });
      setCustomQCount(tests.length.toString());
      setCustomTime('20');
      setView('timer_setup');
    };
    const updateTime = delta => {
      let val = parseInt(customTime) || 20;
      val += delta;
      if (val < 5 || val > 180) {
        setShakeTime(true);
        setTimeout(() => setShakeTime(false), 400);
        return;
      }
      setCustomTime(val.toString());
      setBumpTime(true);
      setTimeout(() => setBumpTime(false), 220);
    };
    const updateQCount = delta => {
      let val = parseInt(customQCount) || tests.length;
      val += delta;
      const maxQ = tests.length;
      if (val < 1 || val > maxQ) {
        setShakeQ(true);
        setTimeout(() => setShakeQ(false), 400);
        return;
      }
      setCustomQCount(val.toString());
      setBumpQ(true);
      setTimeout(() => setBumpQ(false), 220);
    };
    const handleCancelSetup = () => {
      setCustomTime('20');
      setCustomQCount(tests.length.toString());
      setView('set_menu');
    };
    const launchTestWithTimer = () => {
      if (launchLock.current) return;
      launchLock.current = true;
      try {
        const valid = normalizeTests(tests),
          mins = Math.max(5, Math.min(180, parseInt(customTime) || 20)),
          count = Math.max(1, Math.min(valid.length, parseInt(customQCount) || 1));
        const qs = shuffled(valid).slice(0, count).map(shuffledQuestion);
        beginSession(qs, mins);
      } catch (e) {
        setNotice({
          error: true,
          text: e.message
        });
      } finally {
        launchLock.current = false;
        setIsStarting(false);
      }
    };
    const beginSession = (qs, mins) => {
      clearTimeout(advanceTimer.current);
      clearTimeout(switchTimer.current);
      finished.current = false;
      answerLock.current = false;
      setIsAnimating(false);
      setQuestionLeaving(false);
      setConfirmFinish(false);
      setIsResultSaved(false);
      savedRef.current = false;
      resultRecord.current = null;
      setSaveError('');
      setSyncMessage('');
      setStudentName('');
      setCustomTime(String(mins));
      durationRef.current = mins * 60;
      deadline.current = Date.now() + mins * 60000;
      setTimeLeft(mins * 60);
      commitSession({
        questions: qs,
        currentIdx: 0,
        answers: qs.map(() => null),
        score: 0
      });
      setView('test');
    };
    const changeQuestion = i => {
      const before = sessionRef.current;
      if (i < 0 || i >= before.questions.length || i === before.currentIdx) {
        answerLock.current = false;
        setIsAnimating(false);
        return;
      }
      answerLock.current = true;
      setIsAnimating(true);
      setQuestionLeaving(true);
      clearTimeout(switchTimer.current);
      switchTimer.current = setTimeout(() => {
        if (finished.current || viewRef.current !== 'test') return;
        commitSession({
          ...sessionRef.current,
          currentIdx: i
        });
        setQuestionLeaving(false);
        answerLock.current = false;
        setIsAnimating(false);
      }, 190);
    };
    const handleAnswer = variantIdx => {
      const s = sessionRef.current;
      if (finished.current || answerLock.current || !s.questions[s.currentIdx] || s.answers[s.currentIdx] !== null || !Number.isInteger(variantIdx) || variantIdx < 0 || variantIdx >= s.questions[s.currentIdx].variants.length) return;
      answerLock.current = true;
      const idx = s.currentIdx;
      commitSession({
        ...s,
        answers: s.answers.map((a, i) => i === idx ? variantIdx : a)
      });
      setIsAnimating(true);
      clearTimeout(advanceTimer.current);
      advanceTimer.current = setTimeout(() => {
        if (finished.current || viewRef.current !== 'test') return;
        changeQuestion(idx + 1);
      }, 750);
    };
    const handleNavClick = i => {
      const s = sessionRef.current;
      if (finished.current || answerLock.current || !Number.isInteger(i) || i < 0 || i >= s.questions.length || i === s.currentIdx) return;
      changeQuestion(i);
    };
    const finishTest = () => {
      if (finished.current || !sessionRef.current.questions.length) return;
      finished.current = true;
      clearTimeout(advanceTimer.current);
      clearTimeout(switchTimer.current);
      answerLock.current = false;
      setIsAnimating(false);
      setQuestionLeaving(false);
      setConfirmFinish(false);
      const s = sessionRef.current,
        score = s.questions.reduce((n, q, i) => n + (s.answers[i] === q.correctIndex ? 1 : 0), 0);
      commitSession({
        ...s,
        score
      });
      setView('result');
      void saveResult({
        ...s,
        score
      });
    };
    const requestFinish = () => {
      if (sessionRef.current.answers.some(a => a === null)) setConfirmFinish(true);else finishTest();
    };
    useEffect(() => {
      if (view !== 'test') return;
      const onKey = e => {
        if (e.defaultPrevented || e.repeat || e.isComposing || e.ctrlKey || e.altKey || e.metaKey || e.target.closest('input,textarea,select,button,[contenteditable=true]') || confirmFinish) return;
        const s = sessionRef.current;
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          handleNavClick(s.currentIdx + 1);
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          handleNavClick(s.currentIdx - 1);
        } else if (/^[1-9]$/.test(e.key)) {
          e.preventDefault();
          handleAnswer(Number(e.key) - 1);
        }
      };
      window.addEventListener('keydown', onKey);
      return () => window.removeEventListener('keydown', onKey);
    }, [view, confirmFinish]);
    const restartMistakes = () => {
      const s = sessionRef.current,
        wrong = s.questions.filter((q, i) => s.answers[i] !== q.correctIndex).map(shuffledQuestion);
      if (wrong.length) beginSession(wrong, Math.max(5, Math.min(180, parseInt(customTime) || 20)));
    };
    // Один стабильный ID на прохождение: повтор синхронизации не создаёт дубликат.
    const saveResult = async completed => {
      if (savingRef.current) return;
      const s = completed || sessionRef.current;
      if (!s.questions.length) return;
      savingRef.current = true;
      setSaving(true);
      setSaveError('');
      setSyncMessage('Сохраняем результат…');
      const account = user || window.auth?.currentUser;
      if (!resultRecord.current) {
        resultRecord.current = {
          record: {
            id: Date.now(),
            date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString().slice(0, 5),
            student: account?.nickname?.trim() || account?.displayName?.trim() || account?.email || 'Гость',
            percent: Math.round(s.score / s.questions.length * 100),
            score: s.score,
            total: s.questions.length,
            topic: currentSet
          },
          account,
          questions: s.questions,
          answers: s.answers,
          local: false,
          cloud: false,
          discord: false
        };
      }
      const job = resultRecord.current,
        record = job.record,
        owner = job.account,
        issues = [];
      const ref = owner?.uid && window.db ? window.db.collection('users').doc(owner.uid) : null;
      try {
        if (ref && !job.cloud) {
          try {
            const mergeProfile = doc => {
              const profile = doc.exists ? doc.data() : {};
              record.student = profile.nickname?.trim() || owner.nickname?.trim() || owner.displayName?.trim() || owner.email || 'Гость';
              return {
                testHistory: [...(Array.isArray(profile.testHistory) ? profile.testHistory : []).filter(r => r.id !== record.id), record]
              };
            };
            if (typeof window.db.runTransaction === 'function') await window.db.runTransaction(async tx => {
              const doc = await tx.get(ref);
              tx.set(ref, mergeProfile(doc), {
                merge: true
              });
            });else {
              const doc = await ref.get();
              await ref.set(mergeProfile(doc), {
                merge: true
              });
            }
            job.cloud = true;
          } catch (e) {
            issues.push('Не удалось синхронизировать статистику с аккаунтом.');
          }
        } else if (owner?.uid && !ref) issues.push('Подключение к статистике аккаунта недоступно.');
        if (alive.current) setStudentName(record.student);
        // Локальная история и состояние родителя сохраняют исходный формат статистики.
        let local = [];
        try {
          local = JSON.parse(localStorage.getItem('test_history_v1') || '[]');
        } catch (e) {}
        const merged = new Map();
        for (const row of [...(Array.isArray(local) ? local : []), ...(Array.isArray(history) ? history : []), record]) merged.set(row.id, row);
        try {
          localStorage.setItem('test_history_v1', JSON.stringify([...merged.values()]));
          job.local = true;
        } catch (e) {
          if (!job.cloud) issues.push('Браузер не разрешил сохранить историю.');
        }
        setHistory?.(prev => [...(Array.isArray(prev) ? prev : []).filter(r => r.id !== record.id), record]);
        savedRef.current = job.local || job.cloud;
        if (alive.current) setIsResultSaved(savedRef.current);
        if (!job.discord) {
          if (typeof sendTestResultToDiscord === 'function') {
            const failed = job.questions.flatMap((q, i) => job.answers[i] === q.correctIndex ? [] : [{
              question: q.question.replace(/<[^>]+>/g, ''),
              userAnsText: q.variants[job.answers[i]]?.text || 'Пропустил',
              correctAnsText: q.variants[q.correctIndex]?.text || ''
            }]);
            try {
              const response = await sendTestResultToDiscord(record, failed, owner?.email || 'Неизвестно', fp);
              if (response === false || response?.ok === false) throw Error('Discord');
              job.discord = true;
            } catch (e) {
              issues.push('Не удалось отправить результат в Discord.');
            }
          } else issues.push('Функция отправки в Discord не подключена.');
        }
        if (alive.current) {
          setSyncMessage(job.cloud ? 'Результат сохранён в статистике аккаунта.' : job.local ? 'Результат сохранён в истории этого браузера.' : 'Сохранение не завершено.');
          setSaveError(issues.join(' '));
        }
      } finally {
        savingRef.current = false;
        if (alive.current) setSaving(false);
      }
    };
    const handlePrint = () => {
      const area = document.getElementById('printArea');
      if (!area) {
        setNotice({
          error: true,
          text: 'Не найдена область печати printArea.'
        });
        return;
      }
      let html = `<div class="print-header"><h1>ТЕСТ: ${cleanHTML(currentSet)}</h1><div style="display:flex;justify-content:space-between"><div>ФИО: <div class="print-input"></div></div><div>Оценка: <div class="print-input"></div></div></div></div>`;
      const printTests = normalizeTests(tests).map(t => ({
        ...t,
        variants: shuffleArray([...t.variants])
      }));
      printTests.forEach((t, i) => {
        html += `<div class="print-q"><h4>${i + 1}. ${t.question}</h4>`;
        if (t.questionImg) html += `<img src="${t.questionImg}" style="max-width:200px;display:block;">`;
        t.variants.forEach(v => {
          html += `<div class="print-var">${v.text} ${v.img ? '(см. рис)' : ''}</div>`;
        });
        html += `</div>`;
      });
      area.innerHTML = html;
      if (window.MathJax) {
        MathJax.typesetPromise([area]).then(() => {
          window.print();
        });
      } else {
        window.print();
      }
    };
    const resultPercent = testSession.questions.length > 0 ? Math.round(testSession.score / testSession.questions.length * 100) : 0;
    const circleRadius = 80;
    const circleCircumference = 2 * Math.PI * circleRadius;
    const circleStrokeDashoffset = circleCircumference - resultPercent / 100 * circleCircumference;
    const totalTestTime = durationRef.current;
    const timePercent = totalTestTime > 0 ? Math.max(0, Math.min(1, timeLeft / totalTestTime)) : 1;
    const timerRadius = 18;
    const timerCircumference = 2 * Math.PI * timerRadius;
    const timerDashoffset = timerCircumference * (1 - timePercent);
    const timerStateClass = timePercent <= 0.1 ? 'danger' : timePercent <= 0.3 ? 'warning' : '';
    return /*#__PURE__*/React.createElement("section", {
      className: "tx-tests",
      "aria-label": "\u0422\u0435\u0441\u0442\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435"
    }, notice && /*#__PURE__*/React.createElement("div", {
      className: `tx-notice ${notice.error ? 'error' : ''}`,
      role: notice.error ? 'alert' : 'status'
    }, /*#__PURE__*/React.createElement("span", null, notice.text), /*#__PURE__*/React.createElement("button", {
      type: "button",
      "aria-label": "\u0417\u0430\u043A\u0440\u044B\u0442\u044C \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u0435",
      onClick: () => setNotice(null)
    }, /*#__PURE__*/React.createElement(TestIcon, {
      name: "close",
      size: 16
    }))), /*#__PURE__*/React.createElement(AnimatePresence, {
      mode: "wait"
    }, view === 'menu' && /*#__PURE__*/React.createElement(motion.div, {
      key: "menu",
      initial: {
        opacity: 0
      },
      animate: {
        opacity: 1
      },
      exit: {
        opacity: 0
      },
      className: "glass-panel tx-menu",
      style: {
        width: '100%'
      }
    }, /*#__PURE__*/React.createElement(AnimatedHeader, null), /*#__PURE__*/React.createElement("style", {
      dangerouslySetInnerHTML: {
        __html: `
                            .tlms-swrow-track{ position:relative; border-radius:18px; overflow:hidden; }
                            .tlms-swrow-hint{
                              position:absolute; inset:0; border-radius:18px;
                              background: linear-gradient(135deg,#f36767,#dc2626);
                              display:flex; align-items:center; justify-content:flex-end;
                              padding-right:20px; gap:8px; opacity:0; cursor:pointer;
                            }
                            .tlms-swrow-hint svg{ width:18px; height:18px; transform:scale(var(--icon-scale,1)); transition:transform .12s ease; }
                            .tlms-swrow-hint span{ color:#fff; font-size:13px; font-weight:700; white-space:nowrap; }
                            .tlms-swrow-hint.armed-pop{ animation: tlmsArmedPop .32s cubic-bezier(.34,1.56,.64,1); }
                            @keyframes tlmsArmedPop{ 0%{transform:scale(1);} 40%{transform:scale(1.05);} 100%{transform:scale(1);} }
                            .tlms-swrow-item{ position:relative; touch-action:pan-y; transform:translateX(0);
                              transition:transform .32s cubic-bezier(.32,.72,0,1); will-change:transform; cursor: pointer; }
                            .tlms-swrow-item.dragging{ transition:none; cursor: grabbing; }

                            /* Точно как в HTML прототипе для поля карточек и добавления */
                            .tlms-item {
                            display:flex; align-items:center; gap:16px;
                            background: var(--bg-panel);
                            border: 1px solid var(--item-border);
                            border-radius:18px;
                            padding:11px 14px 11px 14px;
                            transition: background 0.1s ease;
                                }
                            .tlms-item:active {
                                opacity: 0.75;
                            }
                            .tlms-icon-box {
                                width:44px; height:44px; min-width:44px; border-radius:13px;
                                display:flex; align-items:center; justify-content:center;
                                box-shadow: inset 0 1px 0 rgba(255,255,255,.2), 0 4px 10px rgba(0,0,0,.3);
                            }
                            .tlms-item-label {
                                flex:1; font-size:16px; font-weight:700; color:var(--text-main); word-break: break-word;
                            }
                            .tlms-undo-row {
                                display:flex; align-items:center; justify-content:space-between; gap:10px;
                                background: rgba(243,103,103,.07);
                                border: 1px solid rgba(243,103,103,.32);
                                border-radius:18px;
                                padding:9px 10px 9px 14px;
                                position:relative; overflow:hidden;
                            }
                            .tlms-undo-left {
                                display:flex; align-items:center; gap:10px; min-width:0;
                            }
                            .tlms-undo-icon {
                                width:28px; height:28px; min-width:28px; border-radius:9px;
                                background:rgba(243,103,103,.16); color:#f36767;
                                display:flex; align-items:center; justify-content:center;
                            }
                            .tlms-undo-text {
                                font-size:14px; font-weight:600; color:var(--text-main);
                                white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
                            }
                            .tlms-undo-text b { font-weight:800; }
                            .tlms-undo-btn {
                                background:none; border:none; color:#8b5cf6; font-weight:800; font-size:13.5px;
                                padding:7px 10px; border-radius:9px; cursor:pointer; white-space:nowrap; flex-shrink:0;
                                transition: background .15s ease, transform .15s ease;
                            }
                            .tlms-undo-btn:hover { background:rgba(139,92,246,.14); }
                            .tlms-undo-btn:active { transform:scale(.93); }
                            .tlms-undo-bar {
                                position:absolute; left:0; bottom:0; height:2.5px;
                                background:linear-gradient(90deg,#f36767,#dc2626);
                                width:100%; transform-origin:left;
                                animation: tlmsUndoShrink 3.5s linear forwards;
                            }
                            @keyframes tlmsUndoShrink { from{ transform:scaleX(1); } to{ transform:scaleX(0); } }

                           .tlms-add-row {
                              display:flex; align-items:center; gap:10px;
                              background: var(--bg-panel);
                              border: 1px solid var(--item-border);
                              border-radius:18px;
                              padding:6px 10px 6px 16px;
                              transition: box-shadow .2s ease, border-color .2s ease;
                              margin-bottom: 20px;
                            }
                            .tlms-add-row.focused { border-color: rgba(139,92,246,.55); box-shadow: 0 0 0 3px rgba(139,92,246,.16); }
                            .tlms-add-row.shake { animation: tlmsShakeX .38s ease; }
                            @keyframes tlmsShakeX { 0%,100%{ transform: translateX(0); } 25%{ transform: translateX(-6px); } 75%{ transform: translateX(6px); } }
                            .tlms-add-input {
                              flex:1; min-width:0; background:none; border:none; outline:none;
                              color:var(--text-main); font-size:15.5px; font-family:inherit;
                            }
                            .tlms-add-input::placeholder { color: var(--text-sec); }
                            .tlms-add-btn {
                              width:44px; height:44px; min-width:44px; border:none; border-radius:13px;
                              background: linear-gradient(150deg,#8b5cf6,#7c3aed);
                              color:#fff; display:flex; align-items:center; justify-content:center;
                              cursor:pointer; position:relative;
                              transition: opacity .2s ease, transform .32s cubic-bezier(.34,1.56,.64,1), box-shadow .2s ease;
                              opacity:0; transform: scale(.3) rotate(-25deg); pointer-events:none; box-shadow:none;
                            }
                            .tlms-add-btn.visible { opacity:1; transform: scale(1) rotate(0); pointer-events:auto; box-shadow: 0 6px 16px rgba(124,58,237,.35); }
                            .tlms-add-btn.visible:active { transform: scale(.88); }
                            .tlms-add-btn svg { width:19px; height:19px; position:absolute; transition: opacity .18s ease, transform .3s cubic-bezier(.34,1.56,.64,1); }
                            .tlms-add-btn .ic-plus { opacity:1; transform: rotate(0) scale(1); }
                            .tlms-add-btn .ic-check { opacity:0; transform: rotate(-45deg) scale(.5); }
                            .tlms-add-btn.done .ic-plus { opacity:0; transform: rotate(45deg) scale(.5); }
                            .tlms-add-btn.done .ic-check { opacity:1; transform: rotate(0) scale(1); }

                        `
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        maxHeight: 300,
        overflowY: 'auto',
        margin: '0 0 10px 0',
        paddingRight: 5
      }
    }, /*#__PURE__*/React.createElement(AnimatePresence, {
      initial: false
    }, teacherTests?.map(test => /*#__PURE__*/React.createElement(motion.div, {
      key: test.id,
      layout: true,
      initial: {
        opacity: 0,
        y: -8,
        scale: 0.96
      },
      animate: {
        opacity: 1,
        y: 0,
        scale: 1
      },
      exit: {
        opacity: 0,
        x: -60,
        height: 0,
        marginBottom: 0,
        scale: 0.97
      },
      transition: {
        duration: 0.3,
        ease: [0.32, 0.72, 0, 1]
      },
      style: {
        overflow: 'hidden',
        marginBottom: 10
      }
    }, pendingDelete && pendingDelete.key === test.id ? /*#__PURE__*/React.createElement("div", {
      className: "tlms-undo-row"
    }, /*#__PURE__*/React.createElement("div", {
      className: "tlms-undo-left"
    }, /*#__PURE__*/React.createElement("div", {
      className: "tlms-undo-icon"
    }, /*#__PURE__*/React.createElement("svg", {
      width: "14",
      height: "14",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M3 6h18"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"
    }))), /*#__PURE__*/React.createElement("div", {
      className: "tlms-undo-text"
    }, "\xAB", /*#__PURE__*/React.createElement("b", null, pendingDelete.label), "\xBB \u0443\u0434\u0430\u043B\u0435\u043D\u043E")), /*#__PURE__*/React.createElement("button", {
      className: "tlms-undo-btn",
      onClick: undoDelete
    }, "\u041E\u0442\u043C\u0435\u043D\u0438\u0442\u044C"), /*#__PURE__*/React.createElement("div", {
      className: "tlms-undo-bar",
      "aria-hidden": "true",
      key: pendingDelete.key
    })) : /*#__PURE__*/React.createElement(SwipeableRow, {
      rowKey: test.id,
      registerClose: registerClose,
      onArm: () => closeOthers(test.id),
      onDismiss: () => requestDelete(test.id, test.title, () => removeTeacherTestStudent(test.id, test.title)),
      onClick: () => openTeacherAssignedTest(test)
    }, /*#__PURE__*/React.createElement("div", {
      className: "tlms-item"
    }, /*#__PURE__*/React.createElement("div", {
      className: "tlms-icon-box",
      style: {
        background: 'linear-gradient(150deg, #38bdf8, #0ea5e9)'
      }
    }, /*#__PURE__*/React.createElement("svg", {
      width: "20",
      height: "20",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "#fff",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: '11px',
        fontWeight: 700,
        color: '#38bdf8',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        marginBottom: '2px'
      }
    }, "\u041E\u043F\u0443\u0431\u043B\u0438\u043A\u043E\u0432\u0430\u043D"), /*#__PURE__*/React.createElement("div", {
      className: "tlms-item-label"
    }, test.title))))))), /*#__PURE__*/React.createElement(AnimatePresence, {
      initial: false
    }, sets?.map(name => /*#__PURE__*/React.createElement(motion.div, {
      key: name,
      layout: true,
      initial: {
        opacity: 0,
        y: -8,
        scale: 0.96
      },
      animate: {
        opacity: 1,
        y: 0,
        scale: 1
      },
      exit: {
        opacity: 0,
        x: -60,
        height: 0,
        marginBottom: 0,
        scale: 0.97
      },
      transition: {
        duration: 0.3,
        ease: [0.32, 0.72, 0, 1]
      },
      style: {
        overflow: 'hidden',
        marginBottom: 10
      }
    }, pendingDelete && pendingDelete.key === name ? /*#__PURE__*/React.createElement("div", {
      className: "tlms-undo-row"
    }, /*#__PURE__*/React.createElement("div", {
      className: "tlms-undo-left"
    }, /*#__PURE__*/React.createElement("div", {
      className: "tlms-undo-icon"
    }, /*#__PURE__*/React.createElement("svg", {
      width: "14",
      height: "14",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M3 6h18"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"
    }))), /*#__PURE__*/React.createElement("div", {
      className: "tlms-undo-text"
    }, "\xAB", /*#__PURE__*/React.createElement("b", null, pendingDelete.label), "\xBB \u0443\u0434\u0430\u043B\u0435\u043D\u043E")), /*#__PURE__*/React.createElement("button", {
      className: "tlms-undo-btn",
      onClick: undoDelete
    }, "\u041E\u0442\u043C\u0435\u043D\u0438\u0442\u044C"), /*#__PURE__*/React.createElement("div", {
      className: "tlms-undo-bar",
      "aria-hidden": "true",
      key: pendingDelete.key
    })) : /*#__PURE__*/React.createElement(SwipeableRow, {
      rowKey: name,
      registerClose: registerClose,
      onArm: () => closeOthers(name),
      onDismiss: () => requestDelete(name, name, () => deleteSet(name)),
      onClick: () => openSet(name)
    }, /*#__PURE__*/React.createElement("div", {
      className: "tlms-item"
    }, /*#__PURE__*/React.createElement("div", {
      className: "tlms-icon-box",
      style: {
        background: 'linear-gradient(150deg, #a78bfa, #7c3aed)'
      }
    }, /*#__PURE__*/React.createElement("svg", {
      width: "20",
      height: "20",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "#fff",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-1.2-1.8A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"
    }))), /*#__PURE__*/React.createElement("div", {
      className: "tlms-item-label"
    }, name))))))), /*#__PURE__*/React.createElement("div", {
      className: `tlms-add-row ${addFocused ? 'focused' : ''} ${addShake ? 'shake' : ''}`
    }, /*#__PURE__*/React.createElement("input", {
      className: "tlms-add-input",
      placeholder: "\u041D\u043E\u0432\u044B\u0439 \u0442\u0435\u0441\u0442",
      value: addVal,
      onChange: e => setAddVal(e.target.value),
      onFocus: () => setAddFocused(true),
      onBlur: () => setAddFocused(false),
      onKeyDown: e => {
        if (e.key === 'Enter') handleAddNewSet();
      },
      maxLength: 48,
      autoComplete: "off"
    }), /*#__PURE__*/React.createElement("button", {
      className: `tlms-add-btn ${addVal.trim().length > 0 ? 'visible' : ''} ${addDone ? 'done' : ''}`,
      onClick: handleAddNewSet
    }, /*#__PURE__*/React.createElement("svg", {
      className: "ic-plus",
      viewBox: "0 0 24 24",
      fill: "none"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M12 5v14M5 12h14",
      stroke: "#fff",
      strokeWidth: "2.4",
      strokeLinecap: "round"
    })), /*#__PURE__*/React.createElement("svg", {
      className: "ic-check",
      viewBox: "0 0 24 24",
      fill: "none"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M5 13l4 4L19 7",
      stroke: "#fff",
      strokeWidth: "2.6",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    })))), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: 'center',
        fontSize: 12,
        color: 'var(--text-sec)',
        opacity: 0.7
      }
    }, "\xA9 2026 Ultimate LMS Platform. All Rights Reserved.")), view === 'set_menu' && /*#__PURE__*/React.createElement(motion.div, {
      key: "set",
      initial: {
        opacity: 0,
        y: 12
      },
      animate: {
        opacity: 1,
        y: 0
      },
      exit: {
        opacity: 0
      },
      className: "tx-panel tx-set"
    }, /*#__PURE__*/React.createElement("header", {
      className: "tx-page-heading"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
      className: "tx-eyebrow"
    }, "\u0422\u0412\u041E\u0419 \u041D\u0410\u0411\u041E\u0420"), /*#__PURE__*/React.createElement("h2", null, currentSet), /*#__PURE__*/React.createElement("p", null, "\u041F\u043E\u0434\u0433\u043E\u0442\u043E\u0432\u044C \u0432\u043E\u043F\u0440\u043E\u0441\u044B \u0438 \u0432\u044B\u0431\u0435\u0440\u0438 \u0443\u0434\u043E\u0431\u043D\u044B\u0439 \u0442\u0435\u043C\u043F."))), /*#__PURE__*/React.createElement("div", {
      className: "tx-set-body"
    }, /*#__PURE__*/React.createElement("div", {
      className: "tx-set-visual"
    }, /*#__PURE__*/React.createElement(TestIcon, {
      name: "list",
      size: 52
    }), /*#__PURE__*/React.createElement("strong", null, tests.length), /*#__PURE__*/React.createElement("span", null, "\u0432\u043E\u043F\u0440\u043E\u0441\u043E\u0432 \u0432 \u043D\u0430\u0431\u043E\u0440\u0435")), /*#__PURE__*/React.createElement("div", {
      className: "tx-set-controls"
    }, /*#__PURE__*/React.createElement("h3", null, "\u0413\u043E\u0442\u043E\u0432 \u043A \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0435 \u0437\u043D\u0430\u043D\u0438\u0439?"), /*#__PURE__*/React.createElement("p", null, "\u0412\u0440\u0435\u043C\u044F \u0438 \u043A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u043E \u0432\u043E\u043F\u0440\u043E\u0441\u043E\u0432 \u043C\u043E\u0436\u043D\u043E \u043D\u0430\u0441\u0442\u0440\u043E\u0438\u0442\u044C \u043F\u0435\u0440\u0435\u0434 \u043D\u0430\u0447\u0430\u043B\u043E\u043C."), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "tx-button primary tx-start-action tx-fx tx-fx-play",
      onClick: startTest
    }, "\u041D\u0430\u0441\u0442\u0440\u043E\u0438\u0442\u044C \u0442\u0435\u0441\u0442", /*#__PURE__*/React.createElement(TestIcon, {
      name: "arrow"
    })))), /*#__PURE__*/React.createElement("footer", {
      className: "tx-set-toolbar"
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "tx-link tx-fx tx-fx-back",
      onClick: () => setView('menu')
    }, React.createElement(ActionIcon, {
      name: "back"
    }), "\u0414\u0440\u0443\u0433\u043E\u0439 \u043D\u0430\u0431\u043E\u0440"), /*#__PURE__*/React.createElement("div", {
      className: "tx-tools"
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "tx-button tx-fx tx-fx-print",
      onClick: handlePrint,
      disabled: !tests.length
    }, React.createElement(ActionIcon, {
      name: "print"
    }), "\u041F\u0435\u0447\u0430\u0442\u044C \u0432\u043E\u043F\u0440\u043E\u0441\u043E\u0432"), /*#__PURE__*/React.createElement("label", {
      className: "tx-button tx-upload tx-fx tx-fx-upload"
    }, React.createElement(ActionIcon, {
      name: "upload"
    }), "\u0418\u043C\u043F\u043E\u0440\u0442 JSON", /*#__PURE__*/React.createElement("input", {
      type: "file",
      accept: ".json,application/json",
      onChange: importJSON,
      "aria-label": "\u0418\u043C\u043F\u043E\u0440\u0442 JSON"
    }))))), view === 'timer_setup' && /*#__PURE__*/React.createElement(motion.div, {
      key: "setup",
      initial: {
        opacity: 0,
        y: 12
      },
      animate: {
        opacity: 1,
        y: 0
      },
      exit: {
        opacity: 0
      },
      className: "tx-panel"
    }, /*#__PURE__*/React.createElement("header", {
      className: "tx-page-heading"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
      className: "tx-eyebrow"
    }, "\u041F\u0415\u0420\u0415\u0414 \u0421\u0422\u0410\u0420\u0422\u041E\u041C"), /*#__PURE__*/React.createElement("h2", null, "\u0422\u0432\u043E\u0439 \u0442\u0435\u0441\u0442. \u0422\u0432\u043E\u0439 \u0442\u0435\u043C\u043F."), /*#__PURE__*/React.createElement("p", null, currentSet)), /*#__PURE__*/React.createElement("span", {
      className: "tx-badge"
    }, /*#__PURE__*/React.createElement(TestIcon, {
      name: "spark",
      size: 15
    }), "\u0412\u043E\u043F\u0440\u043E\u0441\u044B \u043F\u0435\u0440\u0435\u043C\u0435\u0448\u0438\u0432\u0430\u044E\u0442\u0441\u044F")), /*#__PURE__*/React.createElement("div", {
      className: "tx-settings tx-settings-rows"
    }, /*#__PURE__*/React.createElement("div", {
      className: "tx-setting tx-setting-row"
    }, /*#__PURE__*/React.createElement("span", {
      className: "tx-setting-icon"
    }, /*#__PURE__*/React.createElement(TestIcon, {
      name: "clock",
      size: 24
    })), /*#__PURE__*/React.createElement("label", {
      htmlFor: "tx-minutes"
    }, "\u0412\u0440\u0435\u043C\u044F \u043D\u0430 \u043F\u0440\u043E\u0445\u043E\u0436\u0434\u0435\u043D\u0438\u0435"), /*#__PURE__*/React.createElement("p", null, "\u041E\u0442 5 \u0434\u043E 180 \u043C\u0438\u043D\u0443\u0442"), /*#__PURE__*/React.createElement("div", {
      className: `tx-stepper tx-stepper-compact ${shakeTime ? 'shake' : ''}`
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      "aria-label": "\u0423\u043C\u0435\u043D\u044C\u0448\u0438\u0442\u044C \u0432\u0440\u0435\u043C\u044F",
      onClick: () => updateTime(-5)
    }, "\u2212"), /*#__PURE__*/React.createElement("input", {
      id: "tx-minutes",
      type: "number",
      min: "5",
      max: "180",
      value: customTime,
      onChange: e => setCustomTime(e.target.value),
      onBlur: () => setCustomTime(String(Math.max(5, Math.min(180, parseInt(customTime) || 20))))
    }), /*#__PURE__*/React.createElement("span", null, "\u043C\u0438\u043D"), /*#__PURE__*/React.createElement("button", {
      type: "button",
      "aria-label": "\u0423\u0432\u0435\u043B\u0438\u0447\u0438\u0442\u044C \u0432\u0440\u0435\u043C\u044F",
      onClick: () => updateTime(5)
    }, "+"))), /*#__PURE__*/React.createElement("div", {
      className: "tx-setting tx-setting-row"
    }, /*#__PURE__*/React.createElement("span", {
      className: "tx-setting-icon"
    }, /*#__PURE__*/React.createElement(TestIcon, {
      name: "list",
      size: 24
    })), /*#__PURE__*/React.createElement("label", {
      htmlFor: "tx-count"
    }, "\u041A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u043E \u0432\u043E\u043F\u0440\u043E\u0441\u043E\u0432"), /*#__PURE__*/React.createElement("p", null, "\u0414\u043E\u0441\u0442\u0443\u043F\u043D\u043E \u0434\u043E ", tests.length, " \u0437\u0430 \u043F\u043E\u0434\u0445\u043E\u0434"), /*#__PURE__*/React.createElement("div", {
      className: `tx-stepper tx-stepper-compact ${shakeQ ? 'shake' : ''}`
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      "aria-label": "\u041C\u0435\u043D\u044C\u0448\u0435 \u0432\u043E\u043F\u0440\u043E\u0441\u043E\u0432",
      onClick: () => updateQCount(-1)
    }, "\u2212"), /*#__PURE__*/React.createElement("input", {
      id: "tx-count",
      type: "number",
      min: "1",
      max: tests.length,
      value: customQCount,
      onChange: e => setCustomQCount(e.target.value),
      onBlur: () => setCustomQCount(String(Math.max(1, Math.min(tests.length, parseInt(customQCount) || 1))))
    }), /*#__PURE__*/React.createElement("span", null, "\u0448\u0442"), /*#__PURE__*/React.createElement("button", {
      type: "button",
      "aria-label": "\u0411\u043E\u043B\u044C\u0448\u0435 \u0432\u043E\u043F\u0440\u043E\u0441\u043E\u0432",
      onClick: () => updateQCount(1)
    }, "+")))), /*#__PURE__*/React.createElement("footer", {
      className: "tx-panel-footer"
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "tx-link tx-fx tx-fx-close",
      onClick: handleCancelSetup
    }, React.createElement(ActionIcon, {
      name: "close"
    }), "\u041E\u0442\u043C\u0435\u043D\u0430"), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "tx-button primary tx-fx tx-fx-play",
      disabled: isStarting || !tests.length,
      onClick: launchTestWithTimer
    }, "\u041D\u0430\u0447\u0430\u0442\u044C \u0442\u0435\u0441\u0442", /*#__PURE__*/React.createElement(TestIcon, {
      name: "arrow"
    })))), view === 'test' && /*#__PURE__*/React.createElement(motion.div, {
      key: "test",
      initial: {
        opacity: 0
      },
      animate: {
        opacity: 1
      },
      exit: {
        opacity: 0
      },
      className: "tx-running"
    }, /*#__PURE__*/React.createElement("header", {
      className: "tx-test-heading"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
      className: "tx-eyebrow"
    }, "\u041F\u0420\u041E\u0412\u0415\u0420\u041A\u0410 \u0417\u041D\u0410\u041D\u0418\u0419"), /*#__PURE__*/React.createElement("h2", null, currentSet)), /*#__PURE__*/React.createElement("span", {
      className: "tx-counter"
    }, testSession.currentIdx + 1, /*#__PURE__*/React.createElement("small", null, " / ", testSession.questions.length))), /*#__PURE__*/React.createElement("div", {
      className: "tx-test-layout"
    }, /*#__PURE__*/React.createElement("div", {
      className: "tx-main"
    }, /*#__PURE__*/React.createElement(TestQuestionCard, {
      key: testSession.currentIdx,
      question: testSession.questions[testSession.currentIdx],
      index: testSession.currentIdx,
      answers: testSession.answers,
      locked: isAnimating,
      leaving: questionLeaving,
      onAnswer: handleAnswer
    })), /*#__PURE__*/React.createElement("aside", {
      className: "tx-sidebar"
    }, /*#__PURE__*/React.createElement("div", {
      className: `tx-time ${timerStateClass}`
    }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(TestIcon, {
      name: "clock",
      size: 19
    }), "\u041E\u0441\u0442\u0430\u043B\u043E\u0441\u044C \u0432\u0440\u0435\u043C\u0435\u043D\u0438"), /*#__PURE__*/React.createElement("strong", {
      role: "timer",
      "aria-label": "\u041E\u0441\u0442\u0430\u0432\u0448\u0435\u0435\u0441\u044F \u0432\u0440\u0435\u043C\u044F"
    }, formatTime(timeLeft)), /*#__PURE__*/React.createElement("div", {
      className: "tx-time-bar"
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: `${timePercent * 100}%`
      }
    }))), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "tx-nav-toggle",
      "aria-expanded": isNavOpen,
      onClick: () => setIsNavOpen(v => !v)
    }, "\u041A\u0430\u0440\u0442\u0430 \u0432\u043E\u043F\u0440\u043E\u0441\u043E\u0432", /*#__PURE__*/React.createElement("span", null, isNavOpen ? '−' : '+')), isNavOpen && /*#__PURE__*/React.createElement("div", {
      className: "tx-map"
    }, testSession.questions.map((q, i) => /*#__PURE__*/React.createElement("button", {
      type: "button",
      key: i,
      "aria-label": `Вопрос ${i + 1}${testSession.answers[i] == null ? ', без ответа' : testSession.answers[i] === q.correctIndex ? ', верно' : ', ошибка'}`,
      "aria-current": i === testSession.currentIdx ? 'step' : undefined,
      disabled: isAnimating,
      className: `${testSession.answers[i] == null ? '' : testSession.answers[i] === q.correctIndex ? 'correct' : 'wrong'}`,
      onClick: () => handleNavClick(i)
    }, i + 1))), /*#__PURE__*/React.createElement("div", {
      className: "tx-sidebar-progress"
    }, /*#__PURE__*/React.createElement("span", null, "\u041E\u0442\u0432\u0435\u0442\u043E\u0432 ", /*#__PURE__*/React.createElement("b", null, testSession.answers.filter(a => a !== null).length, " / ", testSession.questions.length)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("i", {
      style: {
        width: `${testSession.answers.filter(a => a !== null).length / Math.max(1, testSession.questions.length) * 100}%`
      }
    }))), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "tx-button primary",
      onClick: requestFinish
    }, "\u0417\u0430\u0432\u0435\u0440\u0448\u0438\u0442\u044C \u0442\u0435\u0441\u0442"), confirmFinish && /*#__PURE__*/React.createElement(FinishConfirm, {
      remaining: testSession.answers.filter(a => a === null).length,
      onContinue: () => setConfirmFinish(false),
      onFinish: finishTest
    })))), view === 'result' && /*#__PURE__*/React.createElement(motion.div, {
      key: "result",
      initial: {
        opacity: 0,
        y: 15
      },
      animate: {
        opacity: 1,
        y: 0
      },
      exit: {
        opacity: 0
      },
      className: "tx-panel tx-result"
    }, /*#__PURE__*/React.createElement("header", {
      className: "tx-page-heading"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
      className: "tx-eyebrow"
    }, "\u041F\u041E\u0414\u0425\u041E\u0414 \u0417\u0410\u0412\u0415\u0420\u0428\u0401\u041D"), /*#__PURE__*/React.createElement("h2", null, resultPercent >= 80 ? 'Отличная работа!' : 'Твой результат'), /*#__PURE__*/React.createElement("p", null, currentSet)), /*#__PURE__*/React.createElement("span", {
      className: "tx-result-check"
    }, /*#__PURE__*/React.createElement(TestIcon, {
      name: "check",
      size: 25
    }))), /*#__PURE__*/React.createElement("div", {
      className: "tx-result-grid"
    }, /*#__PURE__*/React.createElement("div", {
      className: "tx-result-score"
    }, /*#__PURE__*/React.createElement("div", {
      className: "tx-ring"
    }, /*#__PURE__*/React.createElement("svg", {
      viewBox: "0 0 200 200",
      "aria-hidden": "true"
    }, /*#__PURE__*/React.createElement("circle", {
      cx: "100",
      cy: "100",
      r: "80",
      className: "tx-ring-track"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "100",
      cy: "100",
      r: "80",
      className: "tx-ring-value",
      strokeDasharray: circleCircumference,
      strokeDashoffset: circleStrokeDashoffset,
      style: {
        '--ring-length': circleCircumference,
        '--ring-end': circleStrokeDashoffset
      }
    })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", null, resultPercent, "%"), /*#__PURE__*/React.createElement("span", null, "\u041F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u044B\u0445 \u043E\u0442\u0432\u0435\u0442\u043E\u0432"))), /*#__PURE__*/React.createElement("div", {
      className: "tx-result-metrics"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", null, testSession.score), /*#__PURE__*/React.createElement("span", null, "\u0412\u0435\u0440\u043D\u043E")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", null, testSession.answers.filter((a, i) => a !== null && a !== testSession.questions[i].correctIndex).length), /*#__PURE__*/React.createElement("span", null, "\u041E\u0448\u0438\u0431\u043A\u0438")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", null, testSession.answers.filter(a => a === null).length), /*#__PURE__*/React.createElement("span", null, "\u041F\u0440\u043E\u043F\u0443\u0441\u043A\u0438")))), /*#__PURE__*/React.createElement("div", {
      className: "tx-result-next"
    }, /*#__PURE__*/React.createElement("span", {
      className: "tx-eyebrow"
    }, "\u0421\u041B\u0415\u0414\u0423\u042E\u0429\u0418\u0419 \u0428\u0410\u0413"), /*#__PURE__*/React.createElement("h3", null, testSession.score === testSession.questions.length ? 'Так держать!' : 'Закрепим результат?'), /*#__PURE__*/React.createElement("p", null, "\u041F\u043E\u0441\u043C\u043E\u0442\u0440\u0438 \u0440\u0430\u0437\u0431\u043E\u0440 \u043E\u0442\u0432\u0435\u0442\u043E\u0432 \u0438\u043B\u0438 \u0435\u0449\u0451 \u0440\u0430\u0437 \u043F\u0440\u043E\u0439\u0434\u0438 \u0432\u043E\u043F\u0440\u043E\u0441\u044B, \u043A\u043E\u0442\u043E\u0440\u044B\u0435 \u0432\u044B\u0437\u0432\u0430\u043B\u0438 \u0442\u0440\u0443\u0434\u043D\u043E\u0441\u0442\u0438."), /*#__PURE__*/React.createElement("div", {
      className: "tx-result-action-stack"
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "tx-button primary tx-fx tx-fx-review",
      onClick: () => setView('review')
    }, /*#__PURE__*/React.createElement(TestIcon, {
      name: "list"
    }), "\u0420\u0430\u0437\u043E\u0431\u0440\u0430\u0442\u044C \u043E\u0442\u0432\u0435\u0442\u044B"), testSession.score < testSession.questions.length && /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "tx-button tx-fx tx-fx-repeat",
      onClick: restartMistakes,
      disabled: saving
    }, /*#__PURE__*/React.createElement(TestIcon, {
      name: "repeat"
    }), "\u041F\u043E\u0432\u0442\u043E\u0440\u0438\u0442\u044C \u043E\u0448\u0438\u0431\u043A\u0438")))), /*#__PURE__*/React.createElement("footer", {
      className: "tx-result-bottom"
    }, /*#__PURE__*/React.createElement("div", {
      className: "tx-autosave",
      role: "status"
    }, /*#__PURE__*/React.createElement("span", {
      className: saving ? 'tx-save-spinner' : ''
    }, /*#__PURE__*/React.createElement(TestIcon, {
      name: isResultSaved && !saving ? 'check' : 'save',
      size: 20
    })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", null, saving ? 'Сохраняем автоматически…' : isResultSaved ? 'Прогресс сохранён' : 'Не удалось сохранить'), /*#__PURE__*/React.createElement("p", null, studentName && /*#__PURE__*/React.createElement("span", null, studentName, " \xB7 "), syncMessage), saveError && /*#__PURE__*/React.createElement("p", {
      className: "tx-save-error"
    }, saveError), saveError && !saving && /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "tx-link",
      onClick: () => saveResult()
    }, "\u041F\u043E\u0432\u0442\u043E\u0440\u0438\u0442\u044C \u0441\u0438\u043D\u0445\u0440\u043E\u043D\u0438\u0437\u0430\u0446\u0438\u044E"))), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "tx-button tx-fx tx-fx-back",
      onClick: () => setView('menu'),
      disabled: saving
    }, "\u041A \u043D\u0430\u0431\u043E\u0440\u0430\u043C", /*#__PURE__*/React.createElement(TestIcon, {
      name: "arrow",
      size: 18
    })))), view === 'review' && /*#__PURE__*/React.createElement(motion.div, {
      key: "review",
      initial: {
        opacity: 0
      },
      animate: {
        opacity: 1
      },
      exit: {
        opacity: 0
      }
    }, /*#__PURE__*/React.createElement(ReviewView, {
      questions: testSession.questions,
      answers: testSession.answers,
      onBack: () => setView('result')
    }))));
  };
  Object.assign(window, {
    TestsLMS,
    TestQuestionCard,
    ReviewView
  });
})();
