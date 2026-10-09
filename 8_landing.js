function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// --- 13_landing.js — Ultimate LMS ---
(function () {
  const {
    useState,
    useEffect,
    useRef
  } = React;
  const CAPABILITIES = [{
    id: 'tests',
    label: 'Тесты и экзамены',
    icon: /*#__PURE__*/React.createElement("svg", {
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M9 11l3 3L22 4"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"
    }))
  }, {
    id: 'flashcards',
    label: 'Флеш-карты',
    icon: /*#__PURE__*/React.createElement("svg", {
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("rect", {
      x: "3",
      y: "6",
      width: "14",
      height: "10",
      rx: "2"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M7 3h14v10"
    }))
  }, {
    id: 'excel',
    label: 'Тренажёр Excel',
    icon: /*#__PURE__*/React.createElement("svg", {
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("rect", {
      x: "3",
      y: "3",
      width: "18",
      height: "18",
      rx: "2"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "3",
      y1: "9",
      x2: "21",
      y2: "9"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "3",
      y1: "15",
      x2: "21",
      y2: "15"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "9",
      y1: "3",
      x2: "9",
      y2: "21"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "15",
      y1: "3",
      x2: "15",
      y2: "21"
    }))
  }, {
    id: 'chat',
    label: 'ИИ-чат поддержки',
    icon: /*#__PURE__*/React.createElement("svg", {
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M21 11.5a8.4 8.4 0 0 1-9 8.4A8.9 8.9 0 0 1 3 12a8.4 8.4 0 0 1 8.5-8.5A8.4 8.4 0 0 1 21 11.5z"
    }))
  }, {
    id: 'typing',
    label: 'Тренажёр печати',
    icon: /*#__PURE__*/React.createElement("svg", {
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("rect", {
      x: "2",
      y: "6",
      width: "20",
      height: "12",
      rx: "2"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M6 10h.01M10 10h.01M14 10h.01M18 10h.01M8 14h8"
    }))
  }, {
    id: 'playground',
    label: 'Кодовая песочница',
    icon: /*#__PURE__*/React.createElement("svg", {
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("polyline", {
      points: "16 18 22 12 16 6"
    }), /*#__PURE__*/React.createElement("polyline", {
      points: "8 6 2 12 8 18"
    }))
  }, {
    id: 'hotkeys',
    label: 'Горячие клавиши',
    icon: /*#__PURE__*/React.createElement("svg", {
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("rect", {
      x: "2",
      y: "7",
      width: "20",
      height: "10",
      rx: "2"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M6 11h.01M10 11h.01M14 11h.01M18 11h.01M8 14h8"
    }))
  }, {
    id: 'account',
    label: 'Личный кабинет',
    icon: /*#__PURE__*/React.createElement("svg", {
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "8",
      r: "4"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M4 21c0-4 4-6 8-6s8 2 8 6"
    }))
  }];
  const BAR_HEIGHTS = [35, 60, 42, 82, 52, 95, 68];
  const LEGAL_TEXTS = {
    privacy: {
      title: "Политика конфиденциальности",
      content: "Ваша конфиденциальность очень важна для нас. Мы собираем минимально необходимое количество данных (email, имя, статистика обучения) исключительно для обеспечения работы платформы Ultimate LMS. Мы не передаем ваши данные третьим лицам. Использование платформы подразумевает ваше согласие на обработку этих данных."
    },
    terms: {
      title: "Условия использования",
      content: "Платформа Ultimate LMS предоставляется «как есть». Администрация оставляет за собой право блокировать пользователей за нарушение правил (читы, передача аккаунта, оскорбления в чате). Копирование материалов платформы без разрешения запрещено. Приятного обучения!"
    }
  };
  const DESCRIPTIONS = {
    tests: ['Проверь себя. Увидь результат.', 'Проходи тесты по изученным темам и возвращайся к вопросам, которые требуют внимания.', 'Проверка знаний'],
    flashcards: ['Запоминай небольшими шагами.', 'Повторяй слова и понятия с помощью карточек: сначала вспомни ответ, затем переверни карточку.', 'Повторение'],
    excel: ['От формулы — к пониманию.', 'Разбирайся с таблицами, функциями и расчётами на практических заданиях.', 'Работа с данными'],
    chat: ['Вопросы помогают двигаться дальше.', 'Обсуди сложную тему с ИИ-помощником и разберись в последовательности решения.', 'Помощь в обучении'],
    typing: ['Печатай увереннее.', 'Тренируй точность и скорость набора на последовательных упражнениях.', 'Практика печати'],
    playground: ['Идея. Код. Результат.', 'Пиши код, экспериментируй и проверяй, как работают твои решения.', 'Программирование'],
    hotkeys: ['Меньше кликов. Больше навыка.', 'Изучай сочетания клавиш для Windows, Word и Excel и закрепляй их на практике.', 'Горячие клавиши'],
    account: ['Твой путь — в одном месте.', 'Возвращайся к своим результатам и следи за прогрессом в личном кабинете.', 'Личный кабинет']
  };
  function Icon({
    name = 'arrow',
    ...props
  }) {
    const paths = {
      arrow: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
        d: "M4 12h15M13 6l6 6-6 6"
      })),
      close: /*#__PURE__*/React.createElement("path", {
        d: "m6 6 12 12M18 6 6 18"
      }),
      spark: /*#__PURE__*/React.createElement("path", {
        d: "m12 3 2.4 6.6L21 12l-6.6 2.4L12 21l-2.4-6.6L3 12l6.6-2.4Z"
      }),
      check: /*#__PURE__*/React.createElement("path", {
        d: "m5 12 4 4L19 6"
      }),
      search: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
        cx: "10",
        cy: "10",
        r: "6"
      }), /*#__PURE__*/React.createElement("path", {
        d: "m15 15 5 5"
      })),
      cap: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
        d: "m2 9 10-5 10 5-10 5-10-5ZM6 11v6c4 3 8 3 12 0v-6M22 9v7"
      })),
      menu: /*#__PURE__*/React.createElement("path", {
        d: "M4 7h16M4 12h16M4 17h16"
      }),
      flip: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
        d: "M4 8h12l-3-3M20 16H8l3 3M4 8v7M20 16V9"
      }))
    };
    return /*#__PURE__*/React.createElement("svg", _extends({
      viewBox: "0 0 24 24",
      width: "20",
      height: "20",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.7",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      "aria-hidden": "true"
    }, props), paths[name] || paths.spark);
  }
  function LegalDialog({
    type,
    onClose
  }) {
    const ref = useRef(null);
    useEffect(() => {
      const dialog = ref.current;
      dialog.showModal();
      return () => dialog.close();
    }, []);
    return /*#__PURE__*/React.createElement("dialog", {
      className: "ulp-dialog",
      ref: ref,
      onCancel: onClose,
      onClick: e => {
        if (e.target === e.currentTarget) onClose();
      },
      "aria-labelledby": "ulp-legal-title"
    }, /*#__PURE__*/React.createElement("div", {
      className: "ulp-dialog-inner"
    }, /*#__PURE__*/React.createElement("div", {
      className: "ulp-dialog-head"
    }, /*#__PURE__*/React.createElement("span", {
      className: "ulp-kicker"
    }, "ULTIMATE LMS"), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "ulp-icon-btn",
      onClick: onClose,
      "aria-label": "\u0417\u0430\u043A\u0440\u044B\u0442\u044C"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "close"
    }))), /*#__PURE__*/React.createElement("h2", {
      id: "ulp-legal-title"
    }, LEGAL_TEXTS[type].title), /*#__PURE__*/React.createElement("p", null, LEGAL_TEXTS[type].content), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "ulp-btn ulp-primary",
      onClick: onClose
    }, "\u041F\u043E\u043D\u044F\u0442\u043D\u043E", /*#__PURE__*/React.createElement(Icon, {
      name: "check"
    }))));
  }
  // Each module has its own lightweight SVG scene; no timers or network requests.
  function ModuleScene({
    type
  }) {
    const label = {
      tests: 'Проверка знаний',
      flashcards: 'Запоминание',
      excel: 'Работа с формулами',
      chat: 'Объяснение шаг за шагом',
      typing: 'Ритм и точность',
      playground: 'От кода к результату',
      hotkeys: 'Навык в одном сочетании',
      account: 'Твой учебный маршрут'
    }[type];
    return /*#__PURE__*/React.createElement("div", {
      className: 'ulp-module-scene scene-' + type,
      "aria-hidden": "true"
    }, /*#__PURE__*/React.createElement("span", {
      className: "ulp-scene-caption"
    }, label, /*#__PURE__*/React.createElement("i", null)), /*#__PURE__*/React.createElement("svg", {
      viewBox: "0 0 420 200",
      fill: "none"
    }, /*#__PURE__*/React.createElement("ellipse", {
      cx: "210",
      cy: "179",
      rx: "134",
      ry: "10",
      fill: "currentColor",
      opacity: ".07"
    }), /*#__PURE__*/React.createElement("circle", {
      className: "ms-halo",
      cx: "210",
      cy: "100",
      r: "78",
      stroke: "currentColor",
      opacity: ".12",
      strokeDasharray: "3 7"
    }), type === 'tests' && /*#__PURE__*/React.createElement("g", {
      className: "ms-hover"
    }, /*#__PURE__*/React.createElement("rect", {
      className: "ms-paper",
      x: "105",
      y: "21",
      width: "210",
      height: "149",
      rx: "16"
    }), /*#__PURE__*/React.createElement("text", {
      className: "ms-heading",
      x: "125",
      y: "48"
    }, "\u041F\u0440\u043E\u0432\u0435\u0440\u044C \u0441\u0432\u043E\u0438 \u0437\u043D\u0430\u043D\u0438\u044F"), [0, 1, 2].map(n => /*#__PURE__*/React.createElement("g", {
      key: n
    }, /*#__PURE__*/React.createElement("rect", {
      className: "ms-row",
      x: "124",
      y: 61 + n * 31,
      width: "172",
      height: "25",
      rx: "7"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "137",
      cy: 74 + n * 31,
      r: "5",
      stroke: "currentColor",
      opacity: ".4"
    }), /*#__PURE__*/React.createElement("path", {
      className: 'ms-draw ms-delay-' + n,
      d: `m133 ${74 + n * 31} 3 3 6-7`,
      stroke: "currentColor",
      strokeWidth: "2"
    }), /*#__PURE__*/React.createElement("path", {
      d: `M153 ${74 + n * 31}h${90 - n * 14}`,
      stroke: "currentColor",
      opacity: ".25",
      strokeWidth: "4",
      strokeLinecap: "round"
    }))), /*#__PURE__*/React.createElement("g", {
      className: "ms-badge"
    }, /*#__PURE__*/React.createElement("circle", {
      cx: "318",
      cy: "52",
      r: "22",
      fill: "currentColor"
    }), /*#__PURE__*/React.createElement("path", {
      d: "m307 52 7 7 14-16",
      stroke: "white",
      strokeWidth: "3",
      strokeLinecap: "round"
    }))), type === 'flashcards' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("rect", {
      className: "ms-back-card",
      x: "116",
      y: "36",
      width: "186",
      height: "124",
      rx: "17",
      transform: "rotate(-12 209 98)"
    }), /*#__PURE__*/React.createElement("rect", {
      className: "ms-back-card",
      x: "116",
      y: "36",
      width: "186",
      height: "124",
      rx: "17",
      transform: "rotate(9 209 98)"
    }), /*#__PURE__*/React.createElement("g", {
      className: "ms-flip"
    }, /*#__PURE__*/React.createElement("rect", {
      className: "ms-paper",
      x: "116",
      y: "31",
      width: "188",
      height: "130",
      rx: "17"
    }), /*#__PURE__*/React.createElement("text", {
      className: "ms-label",
      x: "210",
      y: "59",
      textAnchor: "middle"
    }, "\u0421\u041B\u041E\u0412\u041E \u2192 \u0417\u041D\u0410\u0427\u0415\u041D\u0418\u0415"), /*#__PURE__*/React.createElement("g", {
      className: "ms-front-word"
    }, /*#__PURE__*/React.createElement("text", {
      className: "ms-big",
      x: "210",
      y: "105",
      textAnchor: "middle"
    }, "discover"), /*#__PURE__*/React.createElement("text", {
      className: "ms-small",
      x: "210",
      y: "131",
      textAnchor: "middle"
    }, "\u041F\u043E\u043F\u0440\u043E\u0431\u0443\u0439 \u0432\u0441\u043F\u043E\u043C\u043D\u0438\u0442\u044C")), /*#__PURE__*/React.createElement("g", {
      className: "ms-back-word"
    }, /*#__PURE__*/React.createElement("text", {
      className: "ms-big",
      x: "210",
      y: "105",
      textAnchor: "middle"
    }, "\u043E\u0442\u043A\u0440\u044B\u0432\u0430\u0442\u044C"), /*#__PURE__*/React.createElement("text", {
      className: "ms-small",
      x: "210",
      y: "131",
      textAnchor: "middle"
    }, "\u0415\u0449\u0451 \u043E\u0434\u043D\u043E \u043D\u043E\u0432\u043E\u0435 \u0441\u043B\u043E\u0432\u043E")))), type === 'excel' && /*#__PURE__*/React.createElement("g", {
      className: "ms-hover"
    }, /*#__PURE__*/React.createElement("rect", {
      className: "ms-paper",
      x: "82",
      y: "26",
      width: "254",
      height: "144",
      rx: "15"
    }), /*#__PURE__*/React.createElement("rect", {
      className: "ms-row",
      x: "94",
      y: "38",
      width: "230",
      height: "25",
      rx: "6"
    }), /*#__PURE__*/React.createElement("text", {
      className: "ms-mono",
      x: "105",
      y: "55"
    }, "\u0192x  =\u0421\u0423\u041C\u041C(A1:A3)"), ['A', 'B', 'C'].map((x, n) => /*#__PURE__*/React.createElement("text", {
      key: x,
      className: "ms-small",
      x: 141 + n * 74,
      y: "83",
      textAnchor: "middle"
    }, x)), [0, 1, 2].map(n => /*#__PURE__*/React.createElement("g", {
      key: n
    }, /*#__PURE__*/React.createElement("path", {
      d: `M101 ${90 + n * 22}h217`,
      stroke: "currentColor",
      opacity: ".18"
    }), /*#__PURE__*/React.createElement("text", {
      className: "ms-small",
      x: "118",
      y: 106 + n * 22
    }, n + 1), /*#__PURE__*/React.createElement("text", {
      className: "ms-mono",
      x: "140",
      y: 106 + n * 22
    }, [12, 8, 5][n]))), /*#__PURE__*/React.createElement("path", {
      d: "M173 68v88M247 68v88",
      stroke: "currentColor",
      opacity: ".18"
    }), /*#__PURE__*/React.createElement("rect", {
      className: "ms-cell",
      x: "130",
      y: "90",
      width: "42",
      height: "66",
      rx: "4",
      stroke: "currentColor"
    }), /*#__PURE__*/React.createElement("g", {
      className: "ms-result"
    }, /*#__PURE__*/React.createElement("rect", {
      x: "263",
      y: "116",
      width: "93",
      height: "47",
      rx: "12",
      fill: "currentColor"
    }), /*#__PURE__*/React.createElement("text", {
      x: "309",
      y: "146",
      textAnchor: "middle",
      fill: "white",
      fontSize: "24",
      fontWeight: "700"
    }, "25"))), type === 'chat' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("g", {
      className: "ms-chat-question"
    }, /*#__PURE__*/React.createElement("rect", {
      className: "ms-paper",
      x: "124",
      y: "28",
      width: "217",
      height: "48",
      rx: "16"
    }), /*#__PURE__*/React.createElement("text", {
      className: "ms-heading",
      x: "141",
      y: "57"
    }, "\u041A\u0430\u043A \u0440\u0430\u0437\u043E\u0431\u0440\u0430\u0442\u044C\u0441\u044F \u0432 \u0442\u0435\u043C\u0435?")), /*#__PURE__*/React.createElement("g", {
      className: "ms-chat-answer"
    }, /*#__PURE__*/React.createElement("rect", {
      className: "ms-paper",
      x: "78",
      y: "87",
      width: "252",
      height: "79",
      rx: "16"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "102",
      cy: "109",
      r: "9",
      fill: "currentColor",
      opacity: ".2"
    }), /*#__PURE__*/React.createElement("text", {
      className: "ms-heading",
      x: "120",
      y: "114"
    }, "\u0414\u0430\u0432\u0430\u0439 \u043F\u043E \u0448\u0430\u0433\u0430\u043C."), /*#__PURE__*/React.createElement("path", {
      className: "ms-code-line",
      d: "M100 135h189M100 147h139",
      stroke: "currentColor",
      opacity: ".4",
      strokeWidth: "4",
      strokeLinecap: "round"
    })), [0, 1, 2].map(n => /*#__PURE__*/React.createElement("circle", {
      key: n,
      className: "ms-dot",
      style: {
        animationDelay: n * .18 + 's'
      },
      cx: 288 + n * 12,
      cy: "151",
      r: "3",
      fill: "currentColor"
    }))), type === 'typing' && /*#__PURE__*/React.createElement("g", {
      className: "ms-hover"
    }, /*#__PURE__*/React.createElement("rect", {
      className: "ms-paper",
      x: "78",
      y: "31",
      width: "264",
      height: "132",
      rx: "17"
    }), /*#__PURE__*/React.createElement("text", {
      className: "ms-label",
      x: "99",
      y: "55"
    }, "\u0422\u041E\u0427\u041D\u041E\u0421\u0422\u042C \u041D\u0410\u0427\u0418\u041D\u0410\u0415\u0422\u0421\u042F \u0421 \u041F\u0420\u0410\u041A\u0422\u0418\u041A\u0418"), 'Учись каждый день'.split('').map((letter, n) => /*#__PURE__*/React.createElement("text", {
      key: n,
      className: "ms-letter",
      style: {
        animationDelay: n * .12 + 's'
      },
      x: 98 + n * 13,
      y: "96",
      fontSize: "20",
      fill: "currentColor",
      fontFamily: "monospace"
    }, letter)), /*#__PURE__*/React.createElement("path", {
      d: "M98 114h220",
      stroke: "currentColor",
      opacity: ".15",
      strokeWidth: "4",
      strokeLinecap: "round"
    }), /*#__PURE__*/React.createElement("path", {
      className: "ms-type-track",
      d: "M98 114h220",
      stroke: "currentColor",
      strokeWidth: "4",
      strokeLinecap: "round"
    }), /*#__PURE__*/React.createElement("text", {
      className: "ms-small",
      x: "99",
      y: "144"
    }, "\u041A\u0430\u0436\u0434\u043E\u0435 \u043D\u0430\u0436\u0430\u0442\u0438\u0435 \u2014 \u0448\u0430\u0433 \u0432\u043F\u0435\u0440\u0451\u0434")), type === 'playground' && /*#__PURE__*/React.createElement("g", {
      className: "ms-hover"
    }, /*#__PURE__*/React.createElement("rect", {
      className: "ms-paper",
      x: "84",
      y: "24",
      width: "252",
      height: "144",
      rx: "15"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M84 53h252",
      stroke: "currentColor",
      opacity: ".18"
    }), [0, 1, 2].map(n => /*#__PURE__*/React.createElement("circle", {
      key: n,
      cx: 101 + n * 11,
      cy: "39",
      r: "3",
      fill: "currentColor",
      opacity: .3 + n * .2
    })), /*#__PURE__*/React.createElement("text", {
      className: "ms-label",
      x: "237",
      y: "42"
    }, "HELLO.JS"), /*#__PURE__*/React.createElement("text", {
      className: "ms-mono",
      x: "106",
      y: "78"
    }, "const learn = () => ", '{'), /*#__PURE__*/React.createElement("g", {
      className: "ms-code-line"
    }, /*#__PURE__*/React.createElement("text", {
      className: "ms-mono",
      x: "121",
      y: "103"
    }, "return \"\u041D\u043E\u0432\u044B\u0439 \u043D\u0430\u0432\u044B\u043A\";")), /*#__PURE__*/React.createElement("text", {
      className: "ms-mono",
      x: "106",
      y: "126"
    }, '};'), /*#__PURE__*/React.createElement("g", {
      className: "ms-result"
    }, /*#__PURE__*/React.createElement("rect", {
      x: "241",
      y: "135",
      width: "110",
      height: "35",
      rx: "10",
      fill: "currentColor"
    }), /*#__PURE__*/React.createElement("text", {
      fill: "white",
      fontSize: "11",
      fontWeight: "600",
      x: "296",
      y: "157",
      textAnchor: "middle"
    }, "\u2713 \u0413\u043E\u0442\u043E\u0432\u043E"))), type === 'hotkeys' && /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("text", {
      className: "ms-label",
      x: "210",
      y: "43",
      textAnchor: "middle"
    }, "\u041E\u0414\u041D\u041E \u0421\u041E\u0427\u0415\u0422\u0410\u041D\u0418\u0415. \u041C\u0415\u041D\u042C\u0428\u0415 \u0414\u0415\u0419\u0421\u0422\u0412\u0418\u0419."), [['Ctrl', 90, 76], ['Shift', 182, 76], ['N', 275, 56]].map(([key, x, w], n) => /*#__PURE__*/React.createElement("g", {
      key: key,
      className: "ms-key",
      style: {
        animationDelay: n * .3 + 's'
      }
    }, /*#__PURE__*/React.createElement("rect", {
      x: x,
      y: "81",
      width: w,
      height: "62",
      rx: "12",
      fill: "currentColor",
      opacity: ".2"
    }), /*#__PURE__*/React.createElement("rect", {
      className: "ms-paper",
      x: x,
      y: "74",
      width: w,
      height: "62",
      rx: "12"
    }), /*#__PURE__*/React.createElement("text", {
      className: "ms-big",
      x: x + w / 2,
      y: "112",
      textAnchor: "middle",
      style: {
        fontSize: 20
      }
    }, key))), /*#__PURE__*/React.createElement("text", {
      className: "ms-small",
      x: "174",
      y: "112",
      textAnchor: "middle"
    }, "+"), /*#__PURE__*/React.createElement("text", {
      className: "ms-small",
      x: "267",
      y: "112",
      textAnchor: "middle"
    }, "+"), /*#__PURE__*/React.createElement("text", {
      className: "ms-small",
      x: "210",
      y: "171",
      textAnchor: "middle"
    }, "\u0421\u043E\u0437\u0434\u0430\u0442\u044C \u043F\u0430\u043F\u043A\u0443 \u0432 \u041F\u0440\u043E\u0432\u043E\u0434\u043D\u0438\u043A\u0435")), type === 'account' && /*#__PURE__*/React.createElement("g", {
      className: "ms-hover"
    }, /*#__PURE__*/React.createElement("rect", {
      className: "ms-paper",
      x: "86",
      y: "25",
      width: "249",
      height: "146",
      rx: "16"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "118",
      cy: "55",
      r: "16",
      fill: "currentColor",
      opacity: ".17"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M108 61c0-10 20-10 20 0M123 48a5 5 0 1 1-10 0 5 5 0 0 1 10 0",
      stroke: "currentColor",
      strokeWidth: "2"
    }), /*#__PURE__*/React.createElement("text", {
      className: "ms-heading",
      x: "143",
      y: "51"
    }, "\u0422\u0432\u043E\u0439 \u0443\u0447\u0435\u0431\u043D\u044B\u0439 \u043F\u0443\u0442\u044C"), /*#__PURE__*/React.createElement("text", {
      className: "ms-small",
      x: "143",
      y: "67"
    }, "\u0428\u0430\u0433 \u0437\u0430 \u0448\u0430\u0433\u043E\u043C"), /*#__PURE__*/React.createElement("path", {
      d: "M106 144h207",
      stroke: "currentColor",
      opacity: ".2"
    }), [28, 48, 39, 64, 52, 77].map((h, n) => /*#__PURE__*/React.createElement("rect", {
      key: n,
      className: "ms-bar",
      style: {
        animationDelay: n * .16 + 's',
        transformOrigin: `${122 + n * 31}px 143px`
      },
      x: 113 + n * 31,
      y: 143 - h * .8,
      width: "19",
      height: h * .8,
      rx: "5",
      fill: "currentColor",
      opacity: .35 + n * .1
    })), /*#__PURE__*/React.createElement("text", {
      className: "ms-label",
      x: "211",
      y: "161",
      textAnchor: "middle"
    }, "\u0423\u0427\u0418\u0421\u042C \u0412 \u0421\u0412\u041E\u0401\u041C \u0422\u0415\u041C\u041F\u0415"))));
  }
function mountLandingEffects(scope) {
 if (!scope) return () => {};
 let alive=true;
 const owned=[],listeners=[],observers=[],animations=new Set(),frames=new Set(),timers=new Set();
 const snapshots=Array.from(scope.querySelectorAll('*')).map(el=>[el,el.getAttribute('style'),Array.from(el.attributes).filter(a=>a.name.startsWith('data-wow')||a.name==='data-scrolled'||a.name==='data-active'||a.name==='data-tilting'||a.name==='data-mag-on').map(a=>[a.name,a.value])]);
 const hadBodyClass=document.body.classList.contains('ulp-wow-active');
 document.body.classList.add('ulp-wow-active');
 function listen(target,type,fn,opts){target.addEventListener(type,fn,opts);listeners.push(()=>target.removeEventListener(type,fn,opts));}
 function requestAnimationFrame(fn){if(!alive)return 0;let id=window.requestAnimationFrame(t=>{frames.delete(id);if(alive)fn(t)});frames.add(id);return id;}
 function cancelAnimationFrame(id){window.cancelAnimationFrame(id);frames.delete(id);}
 function setTimeout(fn,ms){let id=window.setTimeout(()=>{timers.delete(id);if(alive)fn()},ms);timers.add(id);return id;}
 function observeIntersection(fn,opts){const o=new IntersectionObserver(fn,opts);observers.push(o);return o;}
 function observeMutation(fn){const o=new MutationObserver(fn);observers.push(o);return o;}
 function trackAnimation(a){animations.add(a);a.finished.then(()=>animations.delete(a),()=>animations.delete(a));return a;}
 function cleanup(){if(!alive)return;alive=false;listeners.forEach(fn=>fn());frames.forEach(id=>window.cancelAnimationFrame(id));timers.forEach(id=>window.clearTimeout(id));observers.forEach(o=>o.disconnect());animations.forEach(a=>a.cancel());owned.forEach(el=>el.remove());
 snapshots.forEach(([el,style,attrs])=>{if(style===null)el.removeAttribute('style');else el.setAttribute('style',style);Array.from(el.attributes).forEach(a=>{if(a.name.startsWith('data-wow')||['data-scrolled','data-active','data-tilting','data-mag-on'].includes(a.name))el.removeAttribute(a.name)});attrs.forEach(([k,v])=>el.setAttribute(k,v));});
 if(!hadBodyClass)document.body.classList.remove('ulp-wow-active');}
 try {
 if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches){const tpl=document.createElement('template');tpl.innerHTML="<div id=\"wow-intro\" aria-hidden=\"true\"><i class=\"p p1\"></i><i class=\"p p2\"></i><i class=\"ln\"></i><div class=\"lg\"><svg viewBox=\"0 0 80 80\"><defs><linearGradient id=\"wowg\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\"><stop offset=\"0\" stop-color=\"#7ab8ff\"/><stop offset=\".55\" stop-color=\"#b66cff\"/><stop offset=\"1\" stop-color=\"#ff7ac6\"/></linearGradient></defs><circle cx=\"40\" cy=\"40\" r=\"36\"/><path class=\"sp\" d=\"M40 18l5.5 16.5L62 40l-16.5 5.5L40 62l-5.5-16.5L18 40l16.5-5.5z\"/></svg><span class=\"tx\">ULTIMATE LMS</span></div></div>";const intro=tpl.content.firstElementChild;document.body.appendChild(intro);owned.push(intro);}
 (function(){
'use strict';

if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){var i0=document.getElementById('wow-intro');if(i0)i0.remove();return;}
var FINE=window.matchMedia('(hover:hover) and (pointer:fine)').matches;
var $=function(s,r){return (r||scope).querySelector(s)};
var $$=function(s,r){return Array.prototype.slice.call((r||scope).querySelectorAll(s))};
var isDark=function(){return document.body.classList.contains('dark')};
var rand=function(a,b){return a+Math.random()*(b-a)};
var DPR=Math.min(window.devicePixelRatio||1,2);
var W=innerWidth,H=innerHeight;
var mx=-9999,my=-9999,nx=0,ny=0,glx=W/2,gly=H/3,gx=W/2,gy=H/3,moved=false;

setTimeout(function(){var i=document.getElementById('wow-intro');if(i)i.remove()},2700);

/* ---------- базовые элементы ---------- */
function mk(tag,id){var e=document.createElement(tag);if(id)e.id=id;document.body.appendChild(e);owned.push(e);return e}
var prog=mk('div','wow-progress');
var glow=mk('div','wow-glow');
var glare=mk('div','wow-glare');
var fxc=mk('canvas','wow-fx');var fx2=fxc.getContext('2d');
var net=null,nx2=null,P=[];

function size(){
  W=innerWidth;H=innerHeight;
  fxc.width=W*DPR;fxc.height=H*DPR;fx2.setTransform(DPR,0,0,DPR,0,0);
  if(net){net.width=W*DPR;net.height=H*DPR;nx2.setTransform(DPR,0,0,DPR,0,0);initP()}
}
function initP(){
  var n=Math.round(Math.min(95,W*H/15000));if(W<760)n=Math.min(n,34);
  P=[];for(var i=0;i<n;i++)P.push({x:rand(0,W),y:rand(0,H),vx:rand(-.22,.22),vy:rand(-.22,.22),ex:0,ey:0,r:rand(1.2,2.8),big:i%11===0})
}

/* ---------- эффекты: искры, конфетти, кольца ---------- */
var FX=[];var HUES=[265,285,310,200,330,45];
function spark(x,y,vx,vy,sz,life,hue){if(FX.length>=400)return;FX.push({t:'s',x:x,y:y,vx:vx,vy:vy,sz:sz,life:life,age:0,hue:hue,rot:rand(0,6.28),vr:rand(-.006,.006),g:.00003})}
function ring(x,y,maxR,hue,life){FX.push({t:'r',x:x,y:y,maxR:maxR,hue:hue,life:life||800,age:0})}
var CONF=['#7ab8ff','#a04dd4','#ff7ac6','#ffd27a','#74e0b8','#ffffff','#8058e5'];
function confetti(x,y,n){
  if(FX.length>300)return;n=FINE?n:Math.min(n,35);
  ring(x,y,170,285,900);ring(x,y,110,200,700);
  for(var i=0;i<n;i++){var a=rand(-Math.PI,0)+rand(-.5,.5),sp=rand(.25,1.15);
    FX.push({t:'c',x:x,y:y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-.15,w:rand(5,10),h:rand(3,6),rot:rand(0,6.28),vr:rand(-.02,.02),life:rand(1400,2400),age:0,col:CONF[i%CONF.length],g:.0016,fl:rand(.004,.012)});}
  for(var j=0;j<26;j++){var b=rand(0,6.283),s2=rand(.2,.8);spark(x,y,Math.cos(b)*s2,Math.sin(b)*s2,rand(5,11),rand(600,1100),HUES[j%HUES.length])}
}
function star(c,x,y,r,rot){c.beginPath();for(var i=0;i<8;i++){var a=rot+i*Math.PI/4,rr=i%2?r*.32:r;c.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr)}c.closePath();c.fill()}
function drawFX(dt){
  fx2.clearRect(0,0,W,H);var d=isDark(),L=d?72:58;
  for(var i=FX.length-1;i>=0;i--){var p=FX[i];p.age+=dt;
    if(p.age>=p.life){FX.splice(i,1);continue}
    var k=p.age/p.life;
    if(p.t==='r'){var e=1-Math.pow(1-k,3);fx2.strokeStyle='hsla('+p.hue+',95%,'+L+'%,'+(1-k)*.8+')';fx2.lineWidth=4*(1-k)+.5;fx2.beginPath();fx2.arc(p.x,p.y,p.maxR*e,0,6.283);fx2.stroke();continue}
    p.vy+=p.g*dt;p.vx*=Math.pow(.997,dt);p.vy*=Math.pow(.998,dt);p.x+=p.vx*dt;p.y+=p.vy*dt;p.rot+=p.vr*dt;
    if(p.t==='s'){fx2.fillStyle='hsla('+p.hue+',95%,'+L+'%,'+(1-k)+')';star(fx2,p.x,p.y,p.sz*(1-k*.5),p.rot)}
    else{fx2.save();fx2.translate(p.x,p.y);fx2.rotate(p.rot);fx2.scale(1,Math.cos(p.age*p.fl*6));fx2.globalAlpha=k>.7?(1-k)/.3:1;fx2.fillStyle=p.col;fx2.fillRect(-p.w/2,-p.h/2,p.w,p.h);fx2.restore()}
  }
}

/* ---------- сеть частиц на фоне ---------- */
function drawNet(dt){
  nx2.clearRect(0,0,W,H);var d=isDark(),col=d?'197,160,255':'128,82,217',LINK=135,i,j,p,q;
  for(i=0;i<P.length;i++){p=P[i];
    var ddx=p.x-mx,ddy=p.y-my,dd=Math.sqrt(ddx*ddx+ddy*ddy);
    if(dd<150&&dd>0){var f=(1-dd/150)*.9;p.ex+=ddx/dd*f*.06*dt/16;p.ey+=ddy/dd*f*.06*dt/16}
    p.ex*=.94;p.ey*=.94;
    p.x+=(p.vx+p.ex)*dt*.06*3;p.y+=(p.vy+p.ey)*dt*.06*3;
    if(p.x<-20)p.x=W+20;else if(p.x>W+20)p.x=-20;if(p.y<-20)p.y=H+20;else if(p.y>H+20)p.y=-20;}
  nx2.lineWidth=1;
  for(i=0;i<P.length;i++){p=P[i];
    for(j=i+1;j<P.length;j++){q=P[j];var dx=p.x-q.x,dy=p.y-q.y,ds=dx*dx+dy*dy;
      if(ds<LINK*LINK){nx2.strokeStyle='rgba('+col+','+((1-Math.sqrt(ds)/LINK)*(d?.4:.26))+')';nx2.beginPath();nx2.moveTo(p.x,p.y);nx2.lineTo(q.x,q.y);nx2.stroke()}}
    var mdx=p.x-mx,mdy=p.y-my,md=Math.sqrt(mdx*mdx+mdy*mdy);
    if(md<190){nx2.strokeStyle='rgba(255,122,198,'+((1-md/190)*(d?.7:.5))+')';nx2.beginPath();nx2.moveTo(p.x,p.y);nx2.lineTo(mx,my);nx2.stroke()}}
  for(i=0;i<P.length;i++){p=P[i];
    if(p.big){nx2.shadowColor='rgba('+col+',.9)';nx2.shadowBlur=14}else nx2.shadowBlur=0;
    nx2.fillStyle='rgba('+col+','+(p.big?.95:.6)+')';nx2.beginPath();nx2.arc(p.x,p.y,p.big?p.r+1.4:p.r,0,6.283);nx2.fill()}
  nx2.shadowBlur=0;
}

/* ---------- параллакс ---------- */
var PAR=[];
function reg(sel,mxD,myD,sD){$$(sel).forEach(function(el){PAR.push({el:el,mx:mxD,my:myD,s:sD,x:0,y:0})})}
function updPar(){
  var rects=[],i,p,r;
  for(i=0;i<PAR.length;i++){p=PAR[i];r=p.el.getBoundingClientRect();rects.push(r)}
  for(i=0;i<PAR.length;i++){p=PAR[i];r=rects[i];
    if(r.bottom<-300||r.top>H+300)continue;
    var rel=(r.top+r.height/2-p.y)-H/2;
    var tx=nx*p.mx,ty=ny*p.my+rel*p.s;
    p.x+=(tx-p.x)*.07;p.y+=(ty-p.y)*.07;
    p.el.style.translate=p.x.toFixed(1)+'px '+p.y.toFixed(1)+'px';}
}

/* ---------- главный цикл ---------- */
var raf=0,last=performance.now(),sy=-1;
function frame(t){
  var dt=Math.min(40,t-last);last=t;
  if(nx2)drawNet(dt);
  drawFX(dt);
  glx+=(gx-glx)*.1;gly+=(gy-gly)*.1;
  glow.style.transform='translate3d('+(glx-280)+'px,'+(gly-280)+'px,0)';
  var y=window.scrollY||0;
  if(y!==sy){sy=y;var m=document.documentElement.scrollHeight-H;prog.style.transform='scaleX('+(m>0?Math.min(1,y/m):0)+')'}
  if(PAR.length)updPar();
  raf=requestAnimationFrame(frame)
}
listen(document,'visibilitychange',function(){cancelAnimationFrame(raf);if(!document.hidden){last=performance.now();raf=requestAnimationFrame(frame)}});
listen(window,'resize',size);

/* ---------- указатель: свет, след, наклон, магнит ---------- */
var TILT=[['.ulp-workspace',7,1],['.ulp-module',11,1.045],['.ulp-steps li',8,1.03],['.ulp-final',3,1],['.ulp-module-preview',4,1],['.ulp-learning-art',8,1.02]];
var MAG='.ulp-btn,.ulp-icon-btn';
var cur=null,cfg=null,mag=null,trail=0,lx=0,ly=0;
function leaveTilt(el){if(!el)return;el.removeAttribute('data-tilting');el.style.setProperty('--rx','0deg');el.style.setProperty('--ry','0deg');el.style.setProperty('--sc','1');glare.style.opacity=0}
function leaveMag(el){if(!el)return;el.removeAttribute('data-mag-on');
  var x=el.style.getPropertyValue('--mgx')||'0px',y=el.style.getPropertyValue('--mgy')||'0px';
  el.style.setProperty('--mgx','0px');el.style.setProperty('--mgy','0px');
  if(el.animate&&(x!=='0px'||y!=='0px'))trackAnimation(el.animate([{translate:x+' '+y},{translate:'0px 0px'}],{duration:450,easing:'cubic-bezier(.2,1.6,.4,1)'}))}
listen(scope,'pointermove',function(e){
  if(e.pointerType==='touch')return;
  mx=e.clientX;my=e.clientY;gx=mx;gy=my;nx=(mx/W-.5)*2;ny=(my/H-.5)*2;
  if(!moved){moved=true;glow.classList.add('on');lx=mx;ly=my}
  if(!FINE)return;
  trail+=Math.hypot(mx-lx,my-ly);lx=mx;ly=my;
  while(trail>18){trail-=18;spark(mx+rand(-4,4),my+rand(-4,4),rand(-.05,.05),rand(-.02,.1),rand(3,7.5),rand(550,950),HUES[(Math.random()*HUES.length)|0])}
  var t=e.target,el=null,c=null,i;
  if(t&&t.closest){for(i=0;i<TILT.length;i++){var f=t.closest(TILT[i][0]);if(f){el=f;c=TILT[i];break}}}
  if(el!==cur){leaveTilt(cur);cur=el;cfg=c;if(el){el.setAttribute('data-wow-tilt','');el.setAttribute('data-tilting','')}}
  if(cur){var r=cur.getBoundingClientRect(),px=(mx-r.left)/r.width,py=(my-r.top)/r.height;
    cur.style.setProperty('--ry',((px-.5)*2*cfg[1]).toFixed(2)+'deg');
    cur.style.setProperty('--rx',((.5-py)*2*cfg[1]).toFixed(2)+'deg');
    cur.style.setProperty('--sc',cfg[2]);
    var cs=getComputedStyle(cur);
    glare.style.cssText='opacity:1;left:'+r.left+'px;top:'+r.top+'px;width:'+r.width+'px;height:'+r.height+'px;border-radius:'+cs.borderRadius+';background:radial-gradient(circle at '+(px*100)+'% '+(py*100)+'%,rgba(255,255,255,'+(isDark()?.2:.42)+'),rgba(190,140,255,.14) 30%,transparent 62%)';}
  var mt=t&&t.closest?t.closest(MAG):null;
  if(mt!==mag){leaveMag(mag);mag=mt;if(mt)mt.setAttribute('data-mag-on','')}
  if(mag){var b=mag.getBoundingClientRect();mag.style.setProperty('--mgx',((mx-(b.left+b.width/2))*.22).toFixed(1)+'px');mag.style.setProperty('--mgy',((my-(b.top+b.height/2))*.3).toFixed(1)+'px')}
},{passive:true});
listen(document,'mouseout',function(e){if(e.relatedTarget)return;leaveTilt(cur);cur=null;leaveMag(mag);mag=null;mx=my=-9999});
listen(scope,'pointerdown',function(e){
  var b=e.target&&e.target.closest?e.target.closest('.ulp-primary'):null;
  if(b)confetti(e.clientX,e.clientY,95);
  else{ring(e.clientX,e.clientY,70,HUES[(Math.random()*5)|0],650);for(var i=0;i<7;i++){var a=rand(0,6.283);spark(e.clientX,e.clientY,Math.cos(a)*.35,Math.sin(a)*.35,rand(4,8),rand(500,800),HUES[i%HUES.length])}}
},true);

/* ---------- инициализация после рендера React ---------- */
function setup(){
  var ulp=$('.ulp'),amb=$('.ulp-amb')||$('.ulp-ambient')||ulp;
  net=document.createElement('canvas');net.className='wow-net';amb.insertBefore(net,amb.firstChild);owned.push(net);nx2=net.getContext('2d');
  for(var i=0;i<5;i++){var s=document.createElement('i');s.className='wow-shoot';s.style.cssText='--x:'+(55+i*10+rand(-4,4))+'%;--y:'+(70+i*95+rand(0,40))+'px;--d:'+(2.5+i*1.7+rand(0,1.2)).toFixed(1)+'s';amb.appendChild(s);owned.push(s)}
  size();
  // каскадное появление групп
  var groups=[$('.ulp-module-list'),$('.ulp-steps'),$('.ulp-path'),(function(){var d=$('.ulp-faq details');return d?d.parentNode:null})()].filter(Boolean);
  groups.forEach(function(g){g.setAttribute('data-wow-group','');Array.prototype.forEach.call(g.children,function(c,i){c.style.setProperty('--i',i)})});
  if('IntersectionObserver' in window){var io=observeIntersection(function(es){es.forEach(function(en){if(en.isIntersecting){en.target.setAttribute('data-wow-in','');io.unobserve(en.target)}})},{threshold:.12});groups.forEach(function(g){io.observe(g)})}
  else groups.forEach(function(g){g.setAttribute('data-wow-in','')});
  // параллакс
  reg('.ulp-floating-formula',-28,-20,-.03);reg('.ulp-floating-keys',32,24,-.05);reg('.ulp-scene-cap',-38,-26,-.06);
  reg('.ulp-orbit',16,12,0);reg('.ulp-orbit-second',-20,-14,0);
  reg('.ulp-aura-one',0,0,.14);reg('.ulp-aura-two',0,0,-.09);reg('.ulp-aura-three',0,0,.08);
  reg('.ulp-final-art',0,0,-.05);reg('.ulp-learning-art',0,0,.03);
  raf=requestAnimationFrame(frame);
}

size();setup();
})();

(function(){
'use strict';

var $=function(s,r){return (r||scope).querySelector(s)};
var $$=function(s,r){return Array.prototype.slice.call((r||scope).querySelectorAll(s))};
var IDS=['ulp-modules','ulp-about','ulp-faq'];
function init(){
  var header=$('.ulp-header'),navBtns=$$('.ulp-desktop-nav button');
  var top=document.createElement('button');top.id='wow-top';top.type='button';top.setAttribute('aria-label','Наверх');
  top.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
  document.body.appendChild(top);owned.push(top);
  listen(top,'click',function(){window.scrollTo({top:0,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'})});
  var tick=false;
  function update(){
    tick=false;var y=window.scrollY||0,de=document.documentElement,m=de.scrollHeight-innerHeight;
    if(header){if(y>12)header.setAttribute('data-scrolled','');else header.removeAttribute('data-scrolled')}
    top.classList.toggle('show',y>700);top.style.setProperty('--p',m>0?Math.min(100,y/m*100).toFixed(1):0);
    var cur=-1;IDS.forEach(function(id,i){var el=document.getElementById(id);if(el&&el.getBoundingClientRect().top<innerHeight*.4)cur=i});
    navBtns.forEach(function(b,i){if(i===cur)b.setAttribute('data-active','');else b.removeAttribute('data-active')});
  }
  listen(window,'scroll',function(){if(!tick){tick=true;requestAnimationFrame(update)}},{passive:true});
  update();
  listen(document,'keydown',function(e){
    if(e.key!=='/'||e.ctrlKey||e.metaKey||e.altKey)return;
    var t=e.target&&e.target.tagName||'';if(/input|textarea|select/i.test(t)||(e.target&&e.target.isContentEditable))return;
    var inp=$('.ulp-search input');if(inp){e.preventDefault();inp.focus({preventScroll:true});inp.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'center'})}
  });
  listen(scope,'pointermove',function(e){
    var m=e.target&&e.target.closest?e.target.closest('.ulp-module'):null;
    if(m){var r=m.getBoundingClientRect();m.style.setProperty('--mx',(e.clientX-r.left)+'px');m.style.setProperty('--my',(e.clientY-r.top)+'px')}
  },{passive:true});
}

init();
})();

 }catch(error){cleanup();console.warn('[Landing effects]',error);}
 return cleanup;
}

  const LandingView = ({
    onLogin
  }) => {
    const [menu, setMenu] = useState(false),
      [active, setActive] = useState('tests'),
      [query, setQuery] = useState(''),
      [flipped, setFlipped] = useState(false),
      [legal, setLegal] = useState(null);
    const root = useRef(null),
      legalTrigger = useRef(null);
    useEffect(() => {
      const elements = root.current.querySelectorAll('[data-reveal]');
      if (!window.IntersectionObserver) return;
      const observer = new IntersectionObserver(entries => entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('ulp-visible');
          observer.unobserve(entry.target);
        }
      }), {
        threshold: .08
      });
      elements.forEach(el => {
        el.classList.add('ulp-observed');
        observer.observe(el);
      });
      return () => observer.disconnect();
    }, []);
    const go = id => {
      setMenu(false);
      root.current.querySelector('#' + id)?.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        block: 'start'
      });
    };
    const login = () => {
      setMenu(false);
      if (typeof onLogin === 'function') onLogin();
    };
    const showLegal = (type, e) => {
      legalTrigger.current = e.currentTarget;
      setLegal(type);
    };
    const closeLegal = () => {
      setLegal(null);
      requestAnimationFrame(() => legalTrigger.current?.focus());
    };
    useEffect(() => {
      let release = mountLandingEffects(root.current);
      const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
      const change = () => { release(); release = mountLandingEffects(root.current); };
      preference.addEventListener('change', change);
      return () => { preference.removeEventListener('change', change); release(); };
    }, []);
    const filtered = CAPABILITIES.filter(item => (item.label + ' ' + DESCRIPTIONS[item.id].join(' ')).toLowerCase().includes(query.trim().toLowerCase()));
    const current = CAPABILITIES.find(item => item.id === active);
    return /*#__PURE__*/React.createElement("div", {
      className: "ulp",
      ref: root
    }, /*#__PURE__*/React.createElement("div", {
      className: "ulp-ambient",
      "aria-hidden": "true"
    }, /*#__PURE__*/React.createElement("i", {
      className: "ulp-aura ulp-aura-one"
    }), /*#__PURE__*/React.createElement("i", {
      className: "ulp-aura ulp-aura-two"
    }), /*#__PURE__*/React.createElement("i", {
      className: "ulp-aura ulp-aura-three"
    })), /*#__PURE__*/React.createElement("div", {
      className: "ulp-stars",
      "aria-hidden": "true"
    }, Array.from({
      length: 12
    }, (_, i) => /*#__PURE__*/React.createElement("i", {
      key: i,
      style: {
        left: (i * 37 + 11) % 100 + '%',
        top: (i * 19 + 3) % 91 + '%',
        animationDelay: -i * .7 + 's'
      }
    }))), /*#__PURE__*/React.createElement("header", {
      className: "ulp-header"
    }, /*#__PURE__*/React.createElement("div", {
      className: "ulp-shell ulp-nav"
    }, /*#__PURE__*/React.createElement("a", {
      className: "ulp-brand",
      href: "#ulp-home",
      "aria-label": "Ultimate LMS \u2014 \u043D\u0430\u0447\u0430\u043B\u043E"
    }, /*#__PURE__*/React.createElement("span", {
      className: "ulp-brand-icon"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "cap"
    })), /*#__PURE__*/React.createElement("span", null, "Ultimate", /*#__PURE__*/React.createElement("span", {
      className: "ulp-brand-light"
    }, " LMS"), /*#__PURE__*/React.createElement("small", null, "\u041F\u0420\u041E\u0421\u0422\u0420\u0410\u041D\u0421\u0422\u0412\u041E \u0414\u041B\u042F \u0420\u041E\u0421\u0422\u0410"))), /*#__PURE__*/React.createElement("nav", {
      className: "ulp-desktop-nav",
      "aria-label": "\u041E\u0441\u043D\u043E\u0432\u043D\u0430\u044F \u043D\u0430\u0432\u0438\u0433\u0430\u0446\u0438\u044F"
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => go('ulp-modules')
    }, "\u0412\u043E\u0437\u043C\u043E\u0436\u043D\u043E\u0441\u0442\u0438"), /*#__PURE__*/React.createElement("button", {
      onClick: () => go('ulp-about')
    }, "\u041A\u0430\u043A \u044D\u0442\u043E \u0440\u0430\u0431\u043E\u0442\u0430\u0435\u0442"), /*#__PURE__*/React.createElement("button", {
      onClick: () => go('ulp-faq')
    }, "\u0412\u043E\u043F\u0440\u043E\u0441\u044B")), /*#__PURE__*/React.createElement("div", {
      className: "ulp-nav-actions"
    }, /*#__PURE__*/React.createElement("button", {
      className: "ulp-btn ulp-secondary ulp-login",
      onClick: login
    }, "\u0412\u043E\u0439\u0442\u0438", /*#__PURE__*/React.createElement(Icon, {
      name: "arrow"
    })), /*#__PURE__*/React.createElement("button", {
      className: "ulp-icon-btn ulp-menu-btn",
      "aria-label": menu ? 'Закрыть меню' : 'Открыть меню',
      "aria-expanded": menu,
      "aria-controls": "ulp-mobile-menu",
      onClick: () => setMenu(!menu)
    }, /*#__PURE__*/React.createElement(Icon, {
      name: menu ? 'close' : 'menu'
    })))), /*#__PURE__*/React.createElement("div", {
      id: "ulp-mobile-menu",
      className: 'ulp-mobile-menu ' + (menu ? 'is-open' : ''),
      inert: menu ? undefined : '',
      "aria-hidden": !menu
    }, /*#__PURE__*/React.createElement("nav", {
      "aria-label": "\u041C\u043E\u0431\u0438\u043B\u044C\u043D\u0430\u044F \u043D\u0430\u0432\u0438\u0433\u0430\u0446\u0438\u044F"
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => go('ulp-modules')
    }, "\u0412\u043E\u0437\u043C\u043E\u0436\u043D\u043E\u0441\u0442\u0438", /*#__PURE__*/React.createElement(Icon, {
      name: "arrow"
    })), /*#__PURE__*/React.createElement("button", {
      onClick: () => go('ulp-about')
    }, "\u041A\u0430\u043A \u044D\u0442\u043E \u0440\u0430\u0431\u043E\u0442\u0430\u0435\u0442", /*#__PURE__*/React.createElement(Icon, {
      name: "arrow"
    })), /*#__PURE__*/React.createElement("button", {
      onClick: () => go('ulp-faq')
    }, "\u0412\u043E\u043F\u0440\u043E\u0441\u044B", /*#__PURE__*/React.createElement(Icon, {
      name: "arrow"
    }))))), /*#__PURE__*/React.createElement("main", {
      id: "ulp-home"
    }, /*#__PURE__*/React.createElement("section", {
      className: "ulp-shell ulp-hero"
    }, /*#__PURE__*/React.createElement("div", {
      className: "ulp-hero-copy"
    }, /*#__PURE__*/React.createElement("div", {
      className: "ulp-pill"
    }, /*#__PURE__*/React.createElement("span", null), "\u0422\u0432\u043E\u044F \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0430\u044F \u0441\u0442\u0443\u043F\u0435\u043D\u044C"), /*#__PURE__*/React.createElement("h1", null, React.createElement("span",{className:"wow-word",style:{"--w":0}},"Знания"), " ", React.createElement("span",{className:"wow-word",style:{"--w":1}},"становятся"), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
      className: "ulp-spectrum", style: {"--w": 2}
    }, "\u0432\u043E\u0437\u043C\u043E\u0436\u043D\u043E\u0441\u0442\u044F\u043C\u0438.")), /*#__PURE__*/React.createElement("p", {
      className: "ulp-lead"
    }, "\u0418\u0437\u0443\u0447\u0430\u0439. \u041F\u0440\u043E\u0431\u0443\u0439. \u041F\u043E\u043B\u0443\u0447\u0430\u0439 \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442.", /*#__PURE__*/React.createElement("br", null), "\u0422\u0435\u0441\u0442\u044B, \u0442\u0440\u0435\u043D\u0430\u0436\u0451\u0440\u044B \u0438 \u043F\u043E\u043C\u043E\u0449\u044C \u0418\u0418 \u2014 \u0432 \u043E\u0434\u043D\u043E\u043C \u043F\u0440\u043E\u0441\u0442\u0440\u0430\u043D\u0441\u0442\u0432\u0435, \u0433\u0434\u0435 \u0442\u0435\u043E\u0440\u0438\u044F \u043F\u0440\u0435\u0432\u0440\u0430\u0449\u0430\u0435\u0442\u0441\u044F \u0432 \u043D\u0430\u0432\u044B\u043A."), /*#__PURE__*/React.createElement("div", {
      className: "ulp-actions"
    }, /*#__PURE__*/React.createElement("button", {
      className: "ulp-btn ulp-primary",
      onClick: login
    }, "\u041D\u0430\u0447\u0430\u0442\u044C \u043E\u0431\u0443\u0447\u0435\u043D\u0438\u0435", /*#__PURE__*/React.createElement(Icon, {
      name: "arrow"
    })), /*#__PURE__*/React.createElement("button", {
      className: "ulp-btn ulp-secondary",
      onClick: () => go('ulp-modules')
    }, "\u0427\u0442\u043E \u0432\u043D\u0443\u0442\u0440\u0438", /*#__PURE__*/React.createElement(Icon, {
      name: "spark"
    }))), /*#__PURE__*/React.createElement("div", {
      className: "ulp-hero-meta"
    }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(Icon, {
      name: "check"
    }), "\u0411\u0435\u0437 \u0443\u0441\u0442\u0430\u043D\u043E\u0432\u043A\u0438"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(Icon, {
      name: "check"
    }), "\u041D\u0430 \u043A\u043E\u043C\u043F\u044C\u044E\u0442\u0435\u0440\u0435 \u0438 \u0442\u0435\u043B\u0435\u0444\u043E\u043D\u0435"))), /*#__PURE__*/React.createElement("div", {
      className: "ulp-scene"
    }, /*#__PURE__*/React.createElement("div", {
      className: "ulp-orbit",
      "aria-hidden": "true"
    }), /*#__PURE__*/React.createElement("div", {
      className: "ulp-orbit ulp-orbit-second",
      "aria-hidden": "true"
    }), /*#__PURE__*/React.createElement("div", {
      className: "ulp-scene-cap",
      "aria-hidden": "true"
    }, /*#__PURE__*/React.createElement("svg", {
      viewBox: "0 0 100 86",
      fill: "none"
    }, /*#__PURE__*/React.createElement("path", {
      d: "m50 8 46 23-46 24L4 31 50 8Z",
      fill: "#a788ff"
    }), /*#__PURE__*/React.createElement("path", {
      d: "m50 12 35 19-35 18-35-18 35-19Z",
      fill: "#bda6ff"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M22 47v18c17 14 39 14 56 0V47L50 62 22 47Z",
      fill: "#8460e2"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M90 34v31",
      stroke: "#fbc978",
      strokeWidth: "4"
    }), /*#__PURE__*/React.createElement("path", {
      d: "m90 60-5 14h10l-5-14Z",
      fill: "#fbc978"
    }))), /*#__PURE__*/React.createElement("div", {
      className: "ulp-mini-tag"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "spark"
    }), "\u041C\u0430\u043B\u0435\u043D\u044C\u043A\u0438\u0435 \u0448\u0430\u0433\u0438. \u0411\u043E\u043B\u044C\u0448\u0438\u0435 \u043E\u0442\u043A\u0440\u044B\u0442\u0438\u044F."), /*#__PURE__*/React.createElement("div", {
      className: "ulp-workspace"
    }, /*#__PURE__*/React.createElement("div", {
      className: "ulp-workspace-top"
    }, /*#__PURE__*/React.createElement("span", {
      className: "ulp-window-dots"
    }, /*#__PURE__*/React.createElement("i", null), /*#__PURE__*/React.createElement("i", null), /*#__PURE__*/React.createElement("i", null)), /*#__PURE__*/React.createElement("span", null, "\u0422\u0432\u043E\u0451 \u043F\u0440\u043E\u0441\u0442\u0440\u0430\u043D\u0441\u0442\u0432\u043E \u0437\u043D\u0430\u043D\u0438\u0439"), /*#__PURE__*/React.createElement(Icon, {
      name: "cap"
    })), /*#__PURE__*/React.createElement("div", {
      className: "ulp-workspace-body"
    }, /*#__PURE__*/React.createElement("div", {
      className: "ulp-scene-heading"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
      className: "ulp-kicker"
    }, "\u041F\u041E\u041F\u0420\u041E\u0411\u0423\u0419 \u041F\u0420\u042F\u041C\u041E \u0417\u0414\u0415\u0421\u042C"), /*#__PURE__*/React.createElement("h2", null, "\u041E\u0434\u0438\u043D \u0448\u0430\u0433 \u043A \u043D\u043E\u0432\u043E\u043C\u0443.")), /*#__PURE__*/React.createElement("span", {
      className: "ulp-scene-count"
    }, "01 / 03")), /*#__PURE__*/React.createElement("button", {
      className: 'ulp-demo-card ' + (flipped ? 'is-flipped' : ''),
      onClick: () => setFlipped(!flipped),
      "aria-label": flipped ? 'Показать вопрос' : 'Перевернуть карточку и показать ответ',
      "aria-pressed": flipped
    }, /*#__PURE__*/React.createElement("span", {
      className: "ulp-card-rotator"
    }, /*#__PURE__*/React.createElement("span", {
      className: "ulp-card-face"
    }, /*#__PURE__*/React.createElement("span", {
      className: "ulp-kicker"
    }, "\u041A\u0410\u0420\u0422\u041E\u0427\u041A\u0410 \u0417\u041D\u0410\u041D\u0418\u0419"), /*#__PURE__*/React.createElement("strong", null, "\u0427\u0442\u043E \u0437\u043D\u0430\u0447\u0438\u0442", /*#__PURE__*/React.createElement("br", null), "\xABto discover\xBB?"), /*#__PURE__*/React.createElement("span", {
      className: "ulp-card-hint"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "flip"
    }), "\u041D\u0430\u0436\u043C\u0438, \u0447\u0442\u043E\u0431\u044B \u0443\u0437\u043D\u0430\u0442\u044C")), /*#__PURE__*/React.createElement("span", {
      className: "ulp-card-face ulp-card-back"
    }, /*#__PURE__*/React.createElement("span", {
      className: "ulp-kicker"
    }, "\u041D\u041E\u0412\u041E\u0415 \u0421\u041B\u041E\u0412\u041E"), /*#__PURE__*/React.createElement("strong", null, "\u041E\u0442\u043A\u0440\u044B\u0432\u0430\u0442\u044C.", /*#__PURE__*/React.createElement("br", null), "\u0423\u0437\u043D\u0430\u0432\u0430\u0442\u044C \u043D\u043E\u0432\u043E\u0435."), /*#__PURE__*/React.createElement("span", {
      className: "ulp-card-hint"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "check"
    }), "Discover something new.")))), /*#__PURE__*/React.createElement("div", {
      className: "ulp-scene-bottom"
    }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(Icon, {
      name: "check"
    }), "\u0423\u0447\u0438\u0441\u044C \u0432 \u0441\u0432\u043E\u0451\u043C \u0442\u0435\u043C\u043F\u0435"), /*#__PURE__*/React.createElement("div", {
      className: "ulp-progress"
    }, /*#__PURE__*/React.createElement("i", null))))), /*#__PURE__*/React.createElement("div", {
      className: "ulp-floating ulp-floating-formula"
    }, /*#__PURE__*/React.createElement("span", {
      className: "ulp-float-icon"
    }, "\u0192x"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("small", null, "\u041E\u0442 \u0438\u0434\u0435\u0438 \u043A \u043F\u0440\u0430\u043A\u0442\u0438\u043A\u0435"), /*#__PURE__*/React.createElement("b", null, "=\u0421\u0423\u041C\u041C(A1:A5)"))), /*#__PURE__*/React.createElement("div", {
      className: "ulp-floating ulp-floating-keys"
    }, /*#__PURE__*/React.createElement("kbd", null, "Ctrl"), /*#__PURE__*/React.createElement("span", null, "+"), /*#__PURE__*/React.createElement("kbd", null, "Shift"), /*#__PURE__*/React.createElement(Icon, {
      name: "spark"
    })))), /*#__PURE__*/React.createElement("section", {
      className: "ulp-shell ulp-path",
      "aria-label": "\u0412\u043E\u0437\u043C\u043E\u0436\u043D\u043E\u0441\u0442\u0438 \u043E\u0431\u0443\u0447\u0435\u043D\u0438\u044F",
      "data-reveal": true
    }, [['01', 'Понимай', 'Разбирайся в новых темах'], ['02', 'Практикуй', 'Закрепляй знания действием'], ['03', 'Развивайся', 'Следи за своими результатами']].map(([n, title, desc]) => /*#__PURE__*/React.createElement("div", {
      key: n
    }, /*#__PURE__*/React.createElement("span", null, n), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", null, title), /*#__PURE__*/React.createElement("p", null, desc)), /*#__PURE__*/React.createElement(Icon, {
      name: "arrow"
    })))), /*#__PURE__*/React.createElement("section", {
      className: "ulp-shell ulp-section",
      id: "ulp-modules",
      "data-reveal": true
    }, /*#__PURE__*/React.createElement("div", {
      className: "ulp-section-head"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
      className: "ulp-kicker"
    }, "\u0412\u041E\u0417\u041C\u041E\u0416\u041D\u041E\u0421\u0422\u0418 \u041F\u041B\u0410\u0422\u0424\u041E\u0420\u041C\u042B"), /*#__PURE__*/React.createElement("h2", null, "\u041D\u0430\u0439\u0434\u0438 \u0441\u0432\u043E\u0439 ", /*#__PURE__*/React.createElement("span", null, "\u0441\u043F\u043E\u0441\u043E\u0431 \u0443\u0447\u0438\u0442\u044C\u0441\u044F.")), /*#__PURE__*/React.createElement("p", null, "\u0412\u044B\u0431\u0435\u0440\u0438 \u043D\u0430\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u0435 \u0438 \u043F\u043E\u0441\u043C\u043E\u0442\u0440\u0438, \u0447\u0442\u043E \u043C\u043E\u0436\u043D\u043E \u0434\u0435\u043B\u0430\u0442\u044C \u0432\u043D\u0443\u0442\u0440\u0438.")), /*#__PURE__*/React.createElement("label", {
      className: "ulp-search"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "search"
    }), /*#__PURE__*/React.createElement("input", {
      value: query,
      onChange: e => setQuery(e.target.value),
      placeholder: "\u041D\u0430\u0439\u0442\u0438 \u043D\u0430\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u0435",
      "aria-label": "\u041D\u0430\u0439\u0442\u0438 \u043D\u0430\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u0435",
      type: "search"
    }))), /*#__PURE__*/React.createElement("div", {
      className: "ulp-explorer"
    }, /*#__PURE__*/React.createElement("div", {
      className: "ulp-module-list",
      role: "group",
      "aria-label": "\u041D\u0430\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u044F \u043E\u0431\u0443\u0447\u0435\u043D\u0438\u044F"
    }, filtered.map(item => /*#__PURE__*/React.createElement("button", {
      key: item.id,
      className: 'ulp-module ulp-color-' + item.id + ' ' + (active === item.id ? 'is-active' : ''),
      onClick: () => setActive(item.id),
      "aria-pressed": active === item.id
    }, /*#__PURE__*/React.createElement("span", {
      className: "ulp-module-icon"
    }, item.icon), /*#__PURE__*/React.createElement("span", null, item.label), /*#__PURE__*/React.createElement(Icon, {
      name: "arrow"
    }))), !filtered.length && /*#__PURE__*/React.createElement("div", {
      className: "ulp-empty",
      role: "status"
    }, "\u041D\u0438\u0447\u0435\u0433\u043E \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u043E.", /*#__PURE__*/React.createElement("button", {
      className: "ulp-text-btn",
      onClick: () => setQuery('')
    }, "\u041F\u043E\u043A\u0430\u0437\u0430\u0442\u044C \u0432\u0441\u0435 \u043D\u0430\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u044F"))), /*#__PURE__*/React.createElement("div", {
      className: "ulp-module-preview ulp-color-" + active,
      "aria-live": "polite"
    }, /*#__PURE__*/React.createElement("div", {
      className: "ulp-preview-content",
      key: active
    }, /*#__PURE__*/React.createElement(ModuleScene, {
      type: active
    }), /*#__PURE__*/React.createElement("div", {
      className: "ulp-preview-copy"
    }, /*#__PURE__*/React.createElement("span", {
      className: "ulp-preview-symbol",
      "aria-hidden": "true"
    }, current.icon), /*#__PURE__*/React.createElement("span", {
      className: "ulp-kicker"
    }, DESCRIPTIONS[active][2]), /*#__PURE__*/React.createElement("h3", null, DESCRIPTIONS[active][0]), /*#__PURE__*/React.createElement("p", null, DESCRIPTIONS[active][1]), /*#__PURE__*/React.createElement("button", {
      className: "ulp-btn ulp-primary",
      onClick: login
    }, "\u0412\u043E\u0439\u0442\u0438 \u0438 \u043F\u043E\u043F\u0440\u043E\u0431\u043E\u0432\u0430\u0442\u044C", /*#__PURE__*/React.createElement(Icon, {
      name: "arrow"
    })), /*#__PURE__*/React.createElement("span", {
      className: "ulp-preview-note"
    }, "\u0420\u0430\u0437\u0434\u0435\u043B \u0434\u043E\u0441\u0442\u0443\u043F\u0435\u043D \u0432\u043D\u0443\u0442\u0440\u0438 \u043F\u043B\u0430\u0442\u0444\u043E\u0440\u043C\u044B"))), /*#__PURE__*/React.createElement("div", {
      className: "ulp-preview-grid",
      "aria-hidden": "true"
    }), /*#__PURE__*/React.createElement("span", {
      className: "ulp-preview-orbit",
      "aria-hidden": "true"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "spark"
    }))))), /*#__PURE__*/React.createElement("section", {
      className: "ulp-shell ulp-section ulp-about",
      id: "ulp-about",
      "data-reveal": true
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
      className: "ulp-kicker"
    }, "\u041E\u0422 \u041F\u0415\u0420\u0412\u041E\u0413\u041E \u0428\u0410\u0413\u0410 \u041A \u041D\u0410\u0412\u042B\u041A\u0423"), /*#__PURE__*/React.createElement("h2", null, "\u0412\u0441\u0451 \u043D\u0430\u0447\u0438\u043D\u0430\u0435\u0442\u0441\u044F", /*#__PURE__*/React.createElement("br", null), "\u0441 ", /*#__PURE__*/React.createElement("span", null, "\u043B\u044E\u0431\u043E\u043F\u044B\u0442\u0441\u0442\u0432\u0430.")), /*#__PURE__*/React.createElement("p", null, "\u041D\u0435 \u043D\u0443\u0436\u043D\u043E \u043F\u0435\u0440\u0435\u043A\u043B\u044E\u0447\u0430\u0442\u044C\u0441\u044F \u043C\u0435\u0436\u0434\u0443 \u0434\u0435\u0441\u044F\u0442\u043A\u043E\u043C \u0441\u0435\u0440\u0432\u0438\u0441\u043E\u0432. \u0412\u044B\u0431\u0435\u0440\u0438 \u0442\u0435\u043C\u0443, \u043F\u043E\u0442\u0440\u0435\u043D\u0438\u0440\u0443\u0439\u0441\u044F \u0438 \u0432\u0435\u0440\u043D\u0438\u0441\u044C \u043A \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442\u0430\u043C \u2014 \u0432\u0441\u0451 \u0437\u0434\u0435\u0441\u044C."), /*#__PURE__*/React.createElement("button", {
      className: "ulp-btn ulp-secondary",
      onClick: login
    }, "\u041E\u0442\u043A\u0440\u044B\u0442\u044C \u043F\u043B\u0430\u0442\u0444\u043E\u0440\u043C\u0443", /*#__PURE__*/React.createElement(Icon, {
      name: "arrow"
    })), /*#__PURE__*/React.createElement("div", {
      className: "ulp-learning-art",
      "aria-hidden": "true"
    }, /*#__PURE__*/React.createElement("svg", {
      viewBox: "0 0 500 230",
      fill: "none"
    }, /*#__PURE__*/React.createElement("ellipse", {
      cx: "248",
      cy: "195",
      rx: "186",
      ry: "17",
      fill: "currentColor",
      opacity: ".07"
    }), /*#__PURE__*/React.createElement("g", {
      className: "ulp-art-book"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M89 164 233 125l176 33-145 50L89 177Z",
      fill: "#7451cd"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M99 161 239 124l159 32v13l-137 43-162-39Z",
      fill: "#e9ddff"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M90 151 232 112l177 37-145 49-174-37Z",
      fill: "#ad86ef"
    }), /*#__PURE__*/React.createElement("path", {
      d: "m248 126 135 28-119 35-128-27 112-36Z",
      fill: "#c3a4f6"
    })), /*#__PURE__*/React.createElement("g", {
      className: "ulp-art-screen"
    }, /*#__PURE__*/React.createElement("rect", {
      x: "167",
      y: "24",
      width: "210",
      height: "128",
      rx: "15",
      fill: "#55409a"
    }), /*#__PURE__*/React.createElement("rect", {
      x: "175",
      y: "32",
      width: "194",
      height: "108",
      rx: "9",
      fill: "#24203e"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "190",
      cy: "44",
      r: "3",
      fill: "#fb92bb"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "201",
      cy: "44",
      r: "3",
      fill: "#ffd482"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "212",
      cy: "44",
      r: "3",
      fill: "#66dcc5"
    }), /*#__PURE__*/React.createElement("path", {
      d: "m209 69-17 15 17 15M331 69l17 15-17 15m-67-35-14 42",
      stroke: "#bb9aff",
      strokeWidth: "5",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }), /*#__PURE__*/React.createElement("path", {
      className: "ulp-art-line",
      d: "M222 121h93",
      stroke: "#78dddc",
      strokeWidth: "4",
      strokeLinecap: "round"
    }), /*#__PURE__*/React.createElement("path", {
      d: "m160 152-15 9h252l-14-9",
      fill: "#9183c7"
    })), /*#__PURE__*/React.createElement("g", {
      className: "ulp-art-note"
    }, /*#__PURE__*/React.createElement("rect", {
      x: "79",
      y: "36",
      width: "65",
      height: "81",
      rx: "12",
      fill: "#ffe7ad"
    }), /*#__PURE__*/React.createElement("path", {
      d: "m94 65 9 9 19-22",
      stroke: "#c58d37",
      strokeWidth: "4",
      strokeLinecap: "round"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M94 90h35M94 99h23",
      stroke: "#d6a75c",
      strokeWidth: "3",
      strokeLinecap: "round"
    })), /*#__PURE__*/React.createElement("g", {
      className: "ulp-art-spark",
      stroke: "#a084ee",
      strokeWidth: "3"
    }, /*#__PURE__*/React.createElement("path", {
      d: "m420 75 4 12 12 4-12 4-4 12-4-12-12-4 12-4Z"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M125 136v14m-7-7h14M395 29v16m-8-8h16"
    }))), /*#__PURE__*/React.createElement("span", null, "\u041F\u0440\u043E\u0431\u0443\u0439. \u0421\u043E\u0437\u0434\u0430\u0432\u0430\u0439. \u041E\u0442\u043A\u0440\u044B\u0432\u0430\u0439."))), /*#__PURE__*/React.createElement("ol", {
      className: "ulp-steps"
    }, [['Войди в свой аккаунт', 'Твоё обучение и результаты будут связаны с твоим профилем.'], ['Выбери, что интересно', 'От слов и формул до программирования и горячих клавиш.'], ['Практикуйся и проверяй себя', 'Закрепляй материал упражнениями и обращайся к ИИ, если нужна подсказка.']].map(([title, desc], i) => /*#__PURE__*/React.createElement("li", {
      key: title
    }, /*#__PURE__*/React.createElement("span", null, "0", i + 1), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", null, title), /*#__PURE__*/React.createElement("p", null, desc)))))), /*#__PURE__*/React.createElement("section", {
      className: "ulp-shell ulp-section ulp-faq",
      id: "ulp-faq",
      "data-reveal": true
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
      className: "ulp-kicker"
    }, "\u0415\u0429\u0401 \u041F\u0410\u0420\u0410 \u0414\u0415\u0422\u0410\u041B\u0415\u0419"), /*#__PURE__*/React.createElement("h2", null, "\u041F\u0440\u0435\u0436\u0434\u0435 \u0447\u0435\u043C ", /*#__PURE__*/React.createElement("span", null, "\u043D\u0430\u0447\u0430\u0442\u044C."))), /*#__PURE__*/React.createElement("div", null, [['Нужно ли что-то устанавливать?', 'Нет. Платформа работает в браузере на компьютере или телефоне. Для онлайн-функций требуется интернет.'], ['С чего начать обучение?', 'Войди в аккаунт и выбери нужный раздел. Можно начать с теста по знакомой теме или с тренажёра, который хочется освоить.'], ['Для чего нужен ИИ-помощник?', 'Он помогает разобраться в материале и объясняет ход рассуждений. Ответы ИИ стоит проверять, особенно в сложных заданиях.']].map(([q, a]) => /*#__PURE__*/React.createElement("details", {
      key: q
    }, /*#__PURE__*/React.createElement("summary", null, q, /*#__PURE__*/React.createElement(Icon, {
      name: "arrow"
    })), /*#__PURE__*/React.createElement("p", null, a))))), /*#__PURE__*/React.createElement("section", {
      className: "ulp-shell ulp-final",
      "data-reveal": true
    }, /*#__PURE__*/React.createElement("span", {
      className: "ulp-final-art",
      "aria-hidden": "true"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "spark"
    })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
      className: "ulp-kicker"
    }, "\u0422\u0412\u041E\u0401 \u0412\u0420\u0415\u041C\u042F \u0423\u0427\u0418\u0422\u042C\u0421\u042F"), /*#__PURE__*/React.createElement("h2", null, "\u0421\u043B\u0435\u0434\u0443\u044E\u0449\u0435\u0435 \u043E\u0442\u043A\u0440\u044B\u0442\u0438\u0435 \u2014 \u0442\u0432\u043E\u0451."), /*#__PURE__*/React.createElement("p", null, "\u041D\u0430\u0447\u043D\u0438 \u0441 \u043E\u0434\u043D\u043E\u0433\u043E \u0432\u043E\u043F\u0440\u043E\u0441\u0430. \u041F\u0440\u043E\u0434\u043E\u043B\u0436\u0438 \u043D\u043E\u0432\u044B\u043C \u043D\u0430\u0432\u044B\u043A\u043E\u043C.")), /*#__PURE__*/React.createElement("button", {
      className: "ulp-btn ulp-primary",
      onClick: login
    }, "\u041D\u0430\u0447\u0430\u0442\u044C \u0441\u0435\u0439\u0447\u0430\u0441", /*#__PURE__*/React.createElement(Icon, {
      name: "arrow"
    })))), /*#__PURE__*/React.createElement("footer", {
      className: "ulp-shell ulp-footer"
    }, /*#__PURE__*/React.createElement("span", null, "\xA9 ", new Date().getFullYear(), " Ultimate LMS"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("button", {
      onClick: e => showLegal('privacy', e)
    }, "\u041A\u043E\u043D\u0444\u0438\u0434\u0435\u043D\u0446\u0438\u0430\u043B\u044C\u043D\u043E\u0441\u0442\u044C"), /*#__PURE__*/React.createElement("button", {
      onClick: e => showLegal('terms', e)
    }, "\u0423\u0441\u043B\u043E\u0432\u0438\u044F \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u043D\u0438\u044F"))), legal && /*#__PURE__*/React.createElement(LegalDialog, {
      type: legal,
      onClose: closeLegal
    }));
  };
  Object.assign(window, {
    LandingView
  });
})();
