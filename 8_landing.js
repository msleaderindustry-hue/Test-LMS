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
    const filtered = CAPABILITIES.filter(item => (item.label + ' ' + DESCRIPTIONS[item.id].join(' ')).toLowerCase().includes(query.trim().toLowerCase()));
    const current = CAPABILITIES.find(item => item.id === active);
    return /*#__PURE__*/React.createElement("div", {
      className: "ulp",
      ref: root
    }, /*#__PURE__*/React.createElement("div", {
      className: "ulp-ambient",
      "aria-hidden": "true"
    }), /*#__PURE__*/React.createElement("header", {
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
    }, /*#__PURE__*/React.createElement("span", null), "\u0422\u0432\u043E\u044F \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0430\u044F \u0441\u0442\u0443\u043F\u0435\u043D\u044C"), /*#__PURE__*/React.createElement("h1", null, "\u0417\u043D\u0430\u043D\u0438\u044F \u0441\u0442\u0430\u043D\u043E\u0432\u044F\u0442\u0441\u044F", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", null, "\u0432\u043E\u0437\u043C\u043E\u0436\u043D\u043E\u0441\u0442\u044F\u043C\u0438.")), /*#__PURE__*/React.createElement("p", {
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
      className: 'ulp-module ' + (active === item.id ? 'is-active' : ''),
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
      className: "ulp-module-preview",
      "aria-live": "polite"
    }, /*#__PURE__*/React.createElement("div", {
      className: "ulp-preview-content",
      key: active
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
    }, "\u0420\u0430\u0437\u0434\u0435\u043B \u0434\u043E\u0441\u0442\u0443\u043F\u0435\u043D \u0432\u043D\u0443\u0442\u0440\u0438 \u043F\u043B\u0430\u0442\u0444\u043E\u0440\u043C\u044B")), /*#__PURE__*/React.createElement("div", {
      className: "ulp-preview-grid",
      "aria-hidden": "true"
    })))), /*#__PURE__*/React.createElement("section", {
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
    }))), /*#__PURE__*/React.createElement("ol", {
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
