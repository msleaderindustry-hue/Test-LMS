function _extends() {
  return _extends = Object.assign ? Object.assign.bind() : function (n) {
    for (var e = 1; e < arguments.length; e++) {
      var t = arguments[e];
      for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
    }
    return n;
  }, _extends.apply(null, arguments);
}
// --- 6_admin.js — Ultimate LMS / обновлённая панель ---
// Полная замена файла. React + существующий Firebase compat.
// JSX подключается тем же способом, что и исходный 6_admin.js.
// Обновление: все пользователи загружаются автоматически, поиск работает по всему списку.
// Страницы по 24 строки используются только для отображения, без дополнительных запросов.
// Активность читает существующий users/{uid}/activity и метки lastSeenAt.
// adminAudit (последние 100 действий) сохраняется в профиле одной транзакцией с изменением.
// Это журнал интерфейса, не защищённый от подделки серверный аудит; доступ задают Firestore Rules.
// Для записи Rules должны разрешать администратору обновление поля adminAudit.
// История тестов без корректных дат не участвует в сравнении периодов.
(function () {
  const {
    useState,
    useEffect,
    useRef,
    useMemo,
    useCallback
  } = React;
  const ADMIN_ICON_PATHS = {
    chat: /*#__PURE__*/React.createElement("path", {
      d: "M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
    }),
    chess: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M8 18l2-6-4 2-2-4 5-5 1-3 4 3c6 1 7 8 4 13H8z"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M6 18h14v4H6z"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "11",
      cy: "8",
      r: ".7"
    })),
    keyboard: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("rect", {
      x: "2",
      y: "6",
      width: "20",
      height: "12",
      rx: "2"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M6 10h.01M10 10h.01M14 10h.01M18 10h.01M6 14h12"
    })),
    zap: /*#__PURE__*/React.createElement("path", {
      d: "M13 2 3 14h9l-1 8 10-12h-9l1-8z"
    }),
    code: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("polyline", {
      points: "16 18 22 12 16 6"
    }), /*#__PURE__*/React.createElement("polyline", {
      points: "8 6 2 12 8 18"
    })),
    layers: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("polygon", {
      points: "12 2 2 7 12 12 22 7 12 2"
    }), /*#__PURE__*/React.createElement("polyline", {
      points: "2 17 12 22 22 17"
    }), /*#__PURE__*/React.createElement("polyline", {
      points: "2 12 12 17 22 12"
    })),
    barChart: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("line", {
      x1: "12",
      y1: "20",
      x2: "12",
      y2: "10"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "18",
      y1: "20",
      x2: "18",
      y2: "4"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "6",
      y1: "20",
      x2: "6",
      y2: "16"
    })),
    user: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "7",
      r: "4"
    })),
    users: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "9",
      cy: "7",
      r: "4"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M23 21v-2a4 4 0 0 0-3-3.87"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M16 3.13a4 4 0 0 1 0 7.75"
    })),
    settings: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "12",
      r: "3"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
    })),
    fileText: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
    }), /*#__PURE__*/React.createElement("polyline", {
      points: "14 2 14 8 20 8"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "16",
      y1: "13",
      x2: "8",
      y2: "13"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "16",
      y1: "17",
      x2: "8",
      y2: "17"
    }), /*#__PURE__*/React.createElement("polyline", {
      points: "10 9 9 9 8 9"
    })),
    ban: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "12",
      r: "10"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "4.93",
      y1: "4.93",
      x2: "19.07",
      y2: "19.07"
    })),
    alertTriangle: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "12",
      y1: "9",
      x2: "12",
      y2: "13"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "12",
      y1: "17",
      x2: "12.01",
      y2: "17"
    })),
    checkCircle: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M22 11.08V12a10 10 0 1 1-5.93-9.14"
    }), /*#__PURE__*/React.createElement("polyline", {
      points: "22 4 12 14.01 9 11.01"
    })),
    lock: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("rect", {
      x: "3",
      y: "11",
      width: "18",
      height: "11",
      rx: "2"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M7 11V7a5 5 0 0 1 10 0v4"
    })),
    info: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "12",
      r: "10"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "12",
      y1: "16",
      x2: "12",
      y2: "12"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "12",
      y1: "8",
      x2: "12.01",
      y2: "8"
    })),
    folder: /*#__PURE__*/React.createElement("path", {
      d: "M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"
    }),
    cloud: /*#__PURE__*/React.createElement("path", {
      d: "M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"
    }),
    x: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("line", {
      x1: "18",
      y1: "6",
      x2: "6",
      y2: "18"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "6",
      y1: "6",
      x2: "18",
      y2: "18"
    })),
    search: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
      cx: "11",
      cy: "11",
      r: "8"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "21",
      y1: "21",
      x2: "16.65",
      y2: "16.65"
    })),
    star: /*#__PURE__*/React.createElement("polygon", {
      points: "12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
    }),
    inbox: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("polyline", {
      points: "22 12 16 12 14 15 10 15 8 12 2 12"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"
    })),
    shield: /*#__PURE__*/React.createElement("path", {
      d: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
    }),
    lightbulb: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M9 18h6"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M10 22h4"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z"
    })),
    check: /*#__PURE__*/React.createElement("polyline", {
      points: "20 6 9 17 4 12"
    }),
    download: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
    }), /*#__PURE__*/React.createElement("polyline", {
      points: "7 10 12 15 17 10"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "12",
      y1: "15",
      x2: "12",
      y2: "3"
    })),
    trash: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("polyline", {
      points: "3 6 5 6 21 6"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M10 11v6M14 11v6M9 6V4h6v2"
    })),
    sparkle: /*#__PURE__*/React.createElement("path", {
      d: "M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z"
    }),
    clock: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "12",
      r: "9"
    }), /*#__PURE__*/React.createElement("polyline", {
      points: "12 7 12 12 15.5 14"
    })),
    eye: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "12",
      r: "2.5"
    })),
    activity: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("polyline", {
      points: "3 12 7 12 10 5 14 19 17 12 21 12"
    }))
  };
  const AdminIcon = ({
    name,
    size = 16,
    color = 'currentColor',
    style = {},
    strokeWidth = 2
  }) => /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: strokeWidth,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: {
      display: 'block',
      flexShrink: 0,
      ...style
    }
  }, ADMIN_ICON_PATHS[name] || null);
  const AVAILABLE_MODULES = [{
    id: 'chat',
    icon: 'chat',
    label: 'Чат',
    color: '#06b6d4'
  }, {
    id: 'ai_chat',
    icon: 'sparkle',
    label: 'ИИ Ассистент',
    color: '#a855f7'
  }, {
    id: 'typing',
    icon: 'keyboard',
    label: 'Печать',
    color: '#818cf8'
  }, {
    id: 'hotkeys',
    icon: 'zap',
    label: 'Хоткеи',
    color: '#fbbf24'
  }, {
    id: 'code',
    icon: 'code',
    label: 'VS School',
    color: '#2dd4bf'
  }, {
    id: 'flashcards',
    icon: 'layers',
    label: 'Карточки',
    color: '#3b82f6'
  }, {
    id: 'excel',
    icon: 'barChart',
    label: 'Excel',
    color: '#10b981'
  }, {
    id: 'chess',
    icon: 'chess',
    label: 'Шахматы',
    color: '#7dd3fc'
  }, {
    id: 'stats',
    icon: 'user',
    label: 'Статистика',
    color: '#f59e0b'
  }];
  const PAGE_SIZE = 24;
  const userNameCollator = new Intl.Collator('ru', {
    sensitivity: 'base'
  });
  // Кэш живёт только в памяти страницы, привязан к администратору и базе.
  // Права по-прежнему проверяются перед каждым подключением списка.
  let directoryCache = null;
  const DIRECTORY_CACHE_TTL = 60 * 1000;
  const MAX_FILE = 350 * 1024;
  const array = value => Array.isArray(value) ? value : [];
  const str = value => typeof value === 'string' ? value : '';
  const number = (value, fallback = 0) => value !== null && value !== '' && Number.isFinite(Number(value)) ? Math.max(0, Number(value)) : fallback;
  const nameOf = user => str(user.nickname) || str(user.email) || 'Без имени';
  const testsOf = user => array(user.assignedTests).filter(test => test && typeof test === 'object');
  const modulesOf = user => user.allowedModules == null ? AVAILABLE_MODULES.map(module => module.id) : array(user.allowedModules);
  const chatModeOf = user => ['all', 'teachers', 'selected'].includes(user?.chatContactMode) ? user.chatContactMode : 'all';
  const chatAllowedOf = user => [...new Set(array(user?.chatAllowedUsers).filter(Boolean).map(String))];
  const firstDefined = (obj, keys) => {
    for (const key of keys) if (obj?.[key] !== undefined && obj?.[key] !== null && obj?.[key] !== '') return obj[key];
    return null;
  };
  const initials = user => nameOf(user).split('@')[0].split(/[\s._-]+/).filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase();
  const average = user => {
    const values = array(user.testHistory).map(entry => entry?.percent).filter(value => value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value))).map(value => Math.min(100, Math.max(0, Number(value))));
    return values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : null;
  };
  function problem(message) {
    const error = new Error(message);
    error.userMessage = message;
    return error;
  }
  function errorText(error) {
    if (error?.userMessage) return error.userMessage;
    if (String(error?.code).includes('permission-denied')) return 'Недостаточно прав для этого действия. Проверьте доступ администратора.';
    if (String(error?.code).includes('unavailable')) return 'Нет связи с базой данных. Проверьте интернет и повторите.';
    if (String(error?.code).includes('resource-exhausted')) return 'Достигнут лимит базы данных. Попробуйте позже.';
    return 'Не удалось сохранить изменения. Попробуйте ещё раз.';
  }
  function normalizeTest(data) {
    if (!Array.isArray(data) || !data.length) throw problem('JSON должен содержать непустой массив вопросов.');
    if (data.length > 300) throw problem('В одном тесте допускается до 300 вопросов.');
    const image = (value, at) => {
      if (value == null || value === '') return null;
      if (typeof value !== 'string' || !/^(https?:\/\/|data:image\/(png|jpeg|jpg|gif|webp);base64,)/i.test(value)) throw problem(`${at}: изображение должно быть HTTP(S)-ссылкой или PNG/JPEG/GIF/WebP в base64.`);
      return value;
    };
    return data.map((item, index) => {
      const at = `Вопрос ${index + 1}`;
      if (!item || typeof item !== 'object' || Array.isArray(item)) throw problem(`${at}: некорректная структура.`);
      const question = str(item.question).trim();
      const questionImg = image(item.questionImg, at);
      if (!question && !questionImg) throw problem(`${at}: добавьте текст или изображение.`);
      if (question.length > 10000) throw problem(`${at}: текст слишком длинный.`);
      if (!Array.isArray(item.variants) || item.variants.length < 2 || item.variants.length > 12) throw problem(`${at}: нужно от 2 до 12 вариантов ответа.`);
      const variants = item.variants.map((variant, vi) => {
        const object = variant && typeof variant === 'object' && !Array.isArray(variant);
        const text = object ? str(variant.text).trim() : typeof variant === 'string' || typeof variant === 'number' ? String(variant).trim() : '';
        const img = object ? image(variant.img, `${at}, вариант ${vi + 1}`) : null;
        if (!text && !img) throw problem(`${at}: вариант ${vi + 1} пуст.`);
        if (text.length > 5000) throw problem(`${at}: вариант ${vi + 1} слишком длинный.`);
        return {
          text,
          img
        };
      });
      const validIndex = typeof item.correctIndex === 'number' || typeof item.correctIndex === 'string' && /^\d+$/.test(item.correctIndex);
      const correctIndex = Number(item.correctIndex);
      if (!validIndex || !Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex >= variants.length) throw problem(`${at}: correctIndex должен быть индексом ответа от 0 до ${variants.length - 1}.`);
      return {
        question,
        questionImg,
        variants,
        correctIndex
      };
    });
  }
  const SUBJECTS = [{
    id: 'tests',
    label: 'Тесты',
    icon: 'fileText'
  }, {
    id: 'hotkeys',
    label: 'Горячие клавиши',
    icon: 'zap'
  }, {
    id: 'typing',
    label: 'Печать',
    icon: 'keyboard'
  }, {
    id: 'excel',
    label: 'Excel',
    icon: 'barChart'
  }];
  const KEY_LABELS = {
    level: 'Уровень',
    xp: 'Опыт (XP)',
    completedLessons: 'Пройдено уроков',
    streak: 'Серия',
    maxWpm: 'Лучшая скорость (WPM)',
    maxCombo: 'Лучшее комбо',
    testsCompleted: 'Завершено тренировок',
    totalScore: 'Всего очков',
    maxScore: 'Лучший результат за подход',
    sessionsPlayed: 'Сессий',
    topic: 'Тема',
    student: 'Ученик',
    date: 'Дата',
    at: 'Дата и время',
    createdAt: 'Создано',
    updatedAt: 'Обновлено',
    percent: 'Результат, %',
    score: 'Очков',
    total: 'Заданий',
    id: 'ID',
    title: 'Название',
    questions: 'Вопросов',
    history: 'История',
    type: 'Тип события',
    section: 'Раздел',
    action: 'Действие',
    label: 'Описание',
    path: 'Страница / путь',
    details: 'Детали',
    duration: 'Длительность',
    device: 'Устройство',
    view: 'Экран'
  };
  function cellValue(v) {
    if (v == null) return '';
    if (typeof v === 'number') return v > 1e12 && v < 1e14 ? new Date(v).toLocaleString('ru-RU') : v;
    if (typeof v === 'boolean') return v ? 'Да' : 'Нет';
    if (typeof v === 'string') return v;
    if (typeof v.toMillis === 'function') return new Date(v.toMillis()).toLocaleString('ru-RU');
    if (Number.isFinite(v.seconds)) return new Date(v.seconds * 1000).toLocaleString('ru-RU');
    if (Array.isArray(v)) return v.map(cellValue).join(', ');
    try {
      return JSON.stringify(v);
    } catch {
      return '';
    }
  }
  function tableSheet(name, items) {
    const list = array(items).filter(x => x && typeof x === 'object');
    if (!list.length) return {
      name,
      rows: [['Данных пока нет']]
    };
    const first = ['topic', 'student', 'date', 'percent'];
    const keys = [...new Set(list.flatMap(x => Object.keys(x)))].sort((a, b) => {
      const i = first.indexOf(a),
        j = first.indexOf(b);
      return (i < 0 ? 99 : i) - (j < 0 ? 99 : j);
    });
    return {
      name,
      rows: [['№', ...keys.map(k => KEY_LABELS[k] || k)], ...list.map((x, i) => [i + 1, ...keys.map(k => cellValue(x[k]))])]
    };
  }
  function objectSheets(label, obj) {
    const rows = [['Параметр', 'Значение']],
      extra = [];
    Object.entries(obj && typeof obj === 'object' ? obj : {}).forEach(([k, v]) => {
      const name = KEY_LABELS[k] || k;
      if (Array.isArray(v) && v.length && v.every(x => x && typeof x === 'object')) {
        extra.push(tableSheet(`${label} · ${name}`, v));
        rows.push([name, `${v.length} записей`]);
      } else rows.push([name, cellValue(v)]);
    });
    if (rows.length === 1) rows.push(['Данных пока нет', '']);
    return [{
      name: label,
      rows
    }, ...extra];
  }
  function colName(i) {
    let s = '';
    for (i++; i > 0; i = Math.floor((i - 1) / 26)) s = String.fromCharCode(65 + (i - 1) % 26) + s;
    return s;
  }
  function buildXlsx(sheets) {
    const xml = v => String(v ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const used = new Set();
    const named = sheets.map(s => {
      const base = (s.name.replace(/[\[\]:*?\/\\]/g, ' ').trim() || 'Лист').slice(0, 31);
      let n = base,
        k = 2;
      while (used.has(n.toLowerCase())) {
        const suf = ' ' + k++;
        n = base.slice(0, 31 - suf.length) + suf;
      }
      used.add(n.toLowerCase());
      return {
        ...s,
        name: n
      };
    });
    const ns = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main';
    const sheetXml = s => {
      const widths = [];
      const rowsXml = s.rows.map((row, r) => `<row r="${r + 1}">${row.map((v, c) => {
        const ref = colName(c) + (r + 1),
          style = r === 0 ? 1 : 0;
        widths[c] = Math.min(60, Math.max(widths[c] || 10, String(v ?? '').length + 2));
        return typeof v === 'number' && Number.isFinite(v) && r > 0 ? `<c r="${ref}" s="${style}"><v>${v}</v></c>` : `<c r="${ref}" t="inlineStr" s="${style}"><is><t xml:space="preserve">${xml(String(v ?? '').slice(0, 32767))}</t></is></c>`;
      }).join('')}</row>`).join('');
      return `<?xml version="1.0" encoding="UTF-8"?><worksheet xmlns="${ns}"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><cols>${widths.map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`).join('')}</cols><sheetData>${rowsXml}</sheetData></worksheet>`;
    };
    const files = {
      '[Content_Types].xml': `<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>${named.map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('')}</Types>`,
      '_rels/.rels': '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>',
      'xl/workbook.xml': `<?xml version="1.0" encoding="UTF-8"?><workbook xmlns="${ns}" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${named.map((s, i) => `<sheet name="${xml(s.name)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join('')}</sheets></workbook>`,
      'xl/_rels/workbook.xml.rels': `<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${named.map((_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join('')}<Relationship Id="rId${named.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`,
      'xl/styles.xml': `<?xml version="1.0" encoding="UTF-8"?><styleSheet xmlns="${ns}"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><color rgb="FFFFFFFF"/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF7048D1"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`
    };
    named.forEach((s, i) => {
      files[`xl/worksheets/sheet${i + 1}.xml`] = sheetXml(s);
    });
    const encoder = new TextEncoder(),
      chunks = [],
      directory = [];
    let offset = 0;
    const crc32 = bytes => {
      let crc = 0xffffffff;
      for (const b of bytes) {
        crc ^= b;
        for (let i = 0; i < 8; i++) crc = crc >>> 1 ^ (crc & 1 ? 0xedb88320 : 0);
      }
      return (crc ^ 0xffffffff) >>> 0;
    };
    for (const [name, content] of Object.entries(files)) {
      const filename = encoder.encode(name),
        data = encoder.encode(content),
        crc = crc32(data);
      const local = new Uint8Array(30 + filename.length),
        lv = new DataView(local.buffer);
      lv.setUint32(0, 0x04034b50, true);
      lv.setUint16(4, 20, true);
      lv.setUint16(6, 0x800, true);
      lv.setUint16(12, 33, true);
      lv.setUint32(14, crc, true);
      lv.setUint32(18, data.length, true);
      lv.setUint32(22, data.length, true);
      lv.setUint16(26, filename.length, true);
      local.set(filename, 30);
      const central = new Uint8Array(46 + filename.length),
        cv = new DataView(central.buffer);
      cv.setUint32(0, 0x02014b50, true);
      cv.setUint16(4, 20, true);
      cv.setUint16(6, 20, true);
      cv.setUint16(8, 0x800, true);
      cv.setUint16(14, 33, true);
      cv.setUint32(16, crc, true);
      cv.setUint32(20, data.length, true);
      cv.setUint32(24, data.length, true);
      cv.setUint16(28, filename.length, true);
      cv.setUint32(42, offset, true);
      central.set(filename, 46);
      chunks.push(local, data);
      directory.push(central);
      offset += local.length + data.length;
    }
    const end = new Uint8Array(22),
      ev = new DataView(end.buffer);
    ev.setUint32(0, 0x06054b50, true);
    ev.setUint16(8, directory.length, true);
    ev.setUint16(10, directory.length, true);
    ev.setUint32(12, directory.reduce((s, x) => s + x.length, 0), true);
    ev.setUint32(16, offset, true);
    return new Blob([...chunks, ...directory, end], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
  }
  const ACTIVITY_SECTIONS = {
    platform: 'Платформа',
    menu: 'Главная',
    tests: 'Тестирование',
    typing: 'Тренажёр печати',
    hotkeys: 'Горячие клавиши',
    flashcards: 'Карточки',
    code: 'VS School',
    excel: 'Excel',
    chess: 'Шахматы',
    chat: 'Чат',
    ai_chat: 'ИИ-ассистент',
    stats: 'Статистика',
    admin: 'Администрирование'
  };
  function activitySheet(items) {
    const rows = array(items).map(item => ({
      at: firstDefined(item, ['at', 'date', 'createdAt', 'time']),
      type: str(item?.type) || str(item?.kind),
      section: str(item?.sectionLabel) || ACTIVITY_SECTIONS[str(item?.section) || str(item?.module)] || str(item?.section) || str(item?.module),
      view: str(item?.view) || str(item?.details?.view),
      action: str(item?.action),
      label: str(item?.label) || str(item?.title) || str(item?.name),
      path: str(item?.path) || str(item?.route),
      details: item?.details ?? item?.meta ?? '',
      duration: item?.duration ?? item?.durationMs ?? '',
      device: str(item?.device)
    }));
    return tableSheet('Активность', rows);
  }
  async function loadActivity(user) {
    const local = array(user?.activityLog);
    if (!window.db || !user?.id) return local;
    try {
      const snap = await window.db.collection('users').doc(user.id).collection('activity').orderBy('at', 'desc').limit(500).get();
      const remote = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      return remote.length ? remote : local;
    } catch {
      return local;
    }
  }
  async function exportUser(user, parts, allUsers = []) {
    const chosen = parts?.length ? parts : SUBJECTS.map(s => s.id);
    const names = SUBJECTS.filter(s => chosen.includes(s.id)).map(s => s.label);
    const activity = await loadActivity(user);
    const excel = user.excelProgress || {},
      typing = user.typingProgress || {},
      hotkeys = user.hotkeyProgress || {};
    const avg = average(user);
    const mode = chatModeOf(user);
    const allowedIds = chatAllowedOf(user);
    const allowedNames = allowedIds.map(id => {
      const found = array(allUsers).find(item => item.id === id || item.uid === id);
      return found ? `${nameOf(found)} (${id})` : id;
    });
    const registered = firstDefined(user, ['createdAt', 'registeredAt', 'registrationDate', 'created']);
    const lastLogin = firstDefined(user, ['lastLoginAt', 'lastLogin', 'lastSignInAt']);
    const lastVisit = firstDefined(user, ['lastVisitAt', 'lastSessionAt', 'lastSeenAt', 'lastActiveAt']);
    const lastSeen = firstDefined(user, ['lastSeenAt', 'lastActiveAt']);
    const sheets = [{
      name: 'Профиль',
      rows: [['Параметр', 'Значение'], ['Ученик', nameOf(user)], ['UID', user.id || user.uid || ''], ['Email', str(user.email)], ['Роль', user.role === 'admin' ? 'Администратор' : 'Студент'], ['Статус', user.isBanned ? 'Заблокирован' : 'Активен'], ['Регистрация', registered ? cellValue(registered) : 'Нет данных'], ['Последний вход', lastLogin ? cellValue(lastLogin) : 'Нет данных'], ['Последний запуск платформы', lastVisit ? cellValue(lastVisit) : 'Нет данных'], ['Последняя активность', lastSeen ? cellValue(lastSeen) : 'Нет данных'], ['Выгружено', new Date().toLocaleString('ru-RU')], ['Разделы отчёта', names.join(', ')]]
    }, {
      name: 'Доступы',
      rows: [['Настройка', 'Значение'], ...AVAILABLE_MODULES.map(module => [`Модуль · ${module.label}`, modulesOf(user).includes(module.id) ? 'Открыт' : 'Закрыт']), ['Подсказки Excel', user.excelHintsEnabled !== false ? 'Включены' : 'Отключены'], ['Подсказки горячих клавиш', user.hotkeyHintsEnabled !== false ? 'Включены' : 'Отключены'], ['Контакты чата', mode === 'all' ? 'Все пользователи' : mode === 'teachers' ? 'Только преподаватели' : 'Только выбранные'], ['Разрешённые контакты', mode === 'selected' ? allowedNames.join(', ') || 'Никто' : 'Определяются режимом']]
    }, {
      name: 'Сводка статистики',
      rows: [['Показатель', 'Значение'], ['Тесты · попыток', array(user.testHistory).length], ['Тесты · средний результат', avg === null ? 'Нет данных' : `${avg}%`], ['Тесты · назначено', testsOf(user).length], ['Excel · уровень', number(excel.level, 1)], ['Excel · XP', number(excel.xp)], ['Excel · пройдено', Array.isArray(excel.completedLessons) ? excel.completedLessons.length : number(excel.completedLessons)], ['Excel · серия', number(excel.streak)], ['Печать · лучшая скорость WPM', number(typing.maxWpm)], ['Печать · лучшее комбо', number(typing.maxCombo)], ['Печать · тренировок', number(typing.testsCompleted)], ['Горячие клавиши · очков', number(hotkeys.totalScore)], ['Горячие клавиши · лучший результат', number(hotkeys.maxScore)], ['Горячие клавиши · сессий', number(hotkeys.sessionsPlayed)], ['Событий активности в отчёте', activity.length]]
    }, activitySheet(activity)];
    if (chosen.includes('tests')) sheets.push(tableSheet('Тесты · история', user.testHistory), tableSheet('Тесты · назначенные', testsOf(user).map(t => ({
      id: String(t.id),
      title: t.title,
      questions: array(t.data).length
    }))));
    if (chosen.includes('hotkeys')) sheets.push(...objectSheets('Горячие клавиши', user.hotkeyProgress));
    if (chosen.includes('typing')) sheets.push(...objectSheets('Печать', user.typingProgress));
    if (chosen.includes('excel')) sheets.push(...objectSheets('Excel', user.excelProgress));
    const url = URL.createObjectURL(buildXlsx(sheets)),
      link = document.createElement('a');
    const who = nameOf(user).split('@')[0].replace(/[^\p{L}\p{N}_-]+/gu, '_').slice(0, 40) || 'user';
    link.href = url;
    link.download = `LMS_${who}_${chosen.length === SUBJECTS.length ? 'полный_отчёт' : chosen.join('-')}.xlsx`;
    document.body.appendChild(link);
    try {
      link.click();
    } finally {
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
  }
  const STYLES = `
.adm-root .adm-maint-toggle{min-height:82px;align-items:center;padding:18px 20px;line-height:1.4}.adm-maint-heading{flex:1;min-width:0}.adm-maint-disclosure{display:inline-flex;align-items:center;justify-content:center;gap:8px;flex-shrink:0;align-self:center;padding:9px 12px;border:1px solid var(--ad-line);border-radius:11px;background:var(--ad-bg);color:var(--ad-accent);font-size:12px;font-weight:600;transition:background .2s,transform .2s}.adm-maint-disclosure svg{display:block;flex-shrink:0;transition:transform .28s ease}.adm-maint-disclosure svg.open{transform:rotate(180deg)}.adm-maint-toggle:hover .adm-maint-disclosure{background:var(--ad-soft)}.adm-maint-toggle:active .adm-maint-disclosure{transform:scale(.96)}.adm-maint-personal{margin:0 0 20px}.adm-maint-personal .adm-maint-body{padding:16px}.adm-maint-personal-row{display:flex;align-items:center;justify-content:space-between;gap:16px}.adm-maint-personal-row p{font-size:12px;color:var(--ad-muted);margin-top:5px}.adm-maint-personal-row button{display:inline-flex;align-items:center;justify-content:center;gap:7px;flex-shrink:0}@media(max-width:500px){.adm-root .adm-maint-toggle{padding:14px 12px;gap:9px}.adm-maint-disclosure{padding:9px}.adm-maint-disclosure>span{display:none}.adm-maint-personal-row{align-items:flex-start;flex-direction:column}.adm-maint-personal-row button{width:100%}}

.adm-maint{margin:0 30px 24px;border:1px solid var(--ad-line);border-radius:20px;background:var(--ad-panel);overflow:hidden}.adm-maint-toggle{display:flex;align-items:center;gap:13px;width:100%;padding:18px 20px;border:0;background:transparent;color:var(--ad-text);text-align:left}.adm-maint-toggle strong{display:block;font-size:15px}.adm-maint-toggle small{display:block;color:var(--ad-muted);font-size:12px;margin-top:3px}.adm-maint-symbol{display:grid;place-items:center;width:40px;height:40px;border-radius:12px;background:var(--ad-soft);color:var(--ad-accent);flex-shrink:0}.adm-maint-chevron{margin-left:auto;transition:transform .25s;font-size:21px}.adm-maint-chevron.open{transform:rotate(180deg)}.adm-maint-body{padding:0 20px 20px;animation:admMaintIn .28s ease both}.adm-maint-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}.adm-maint-grid article{background:var(--ad-bg);border:1px solid var(--ad-line);border-radius:16px;padding:20px;display:flex;flex-direction:column;align-items:flex-start;gap:10px}.adm-maint-grid article>svg{color:var(--ad-accent)}.adm-maint-grid h3,.adm-maint-confirm h3{font-size:16px}.adm-maint-grid p,.adm-maint-confirm p{color:var(--ad-muted);font-size:13px;line-height:1.6}.adm-maint-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:auto;padding-top:10px}.adm-maint-actions button{display:inline-flex;align-items:center;justify-content:center;gap:7px}.adm-maint-confirm{margin-top:16px;padding:20px;border-radius:15px;border:1px solid var(--ad-line);background:var(--ad-bg);display:grid;gap:12px;animation:admMaintIn .25s ease}.adm-maint-confirm label{display:grid;gap:7px;color:var(--ad-muted);font-size:12px}.adm-maint-confirm input{max-width:300px}.adm-maint-status{display:flex;align-items:center;gap:10px;padding:14px 0;color:var(--ad-accent);font-size:13px}.adm-maint-progress{display:grid;gap:6px;margin:12px 0;color:var(--ad-muted);font-size:12px}.adm-maint-progress progress{width:100%;height:8px;accent-color:var(--ad-accent)}@keyframes admMaintIn{from{opacity:0;transform:translateY(-5px)}to{opacity:1;transform:none}}@media(max-width:640px){.adm-maint{margin:0 14px 18px}.adm-maint-grid{grid-template-columns:1fr}.adm-maint-body{padding:0 12px 14px}.adm-maint-toggle{padding:15px 12px}.adm-maint-actions{width:100%}.adm-maint-actions button{flex:1}}@media(prefers-reduced-motion:reduce){.adm-maint *{animation:none!important;transition:none!important}}

    .adm-root{--ad-bg:var(--bg-body,#111620);--ad-panel:var(--bg-panel,#191f2d);--ad-text:var(--text-main,#edf1fa);--ad-muted:var(--text-sec,#a1abc0);--ad-line:var(--glass-border,#2d3546);--ad-accent:#a89aff;--ad-soft:rgba(154,132,255,.12);--ad-green:#55cfa3;--ad-red:#f2929e;--ad-shadow:0 22px 65px #0003;color:var(--ad-text);font:14px/1.5 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;text-align:left;color-scheme:dark;width:100%;min-width:0}
    html.light .adm-root,body.light .adm-root,.theme-light .adm-root,[data-theme="light"] .adm-root{--ad-bg:#fff;--ad-panel:#f6f7fb;--ad-text:#232a3b;--ad-muted:#69758a;--ad-line:#e3e7f0;--ad-accent:#6c53ce;--ad-soft:#f0ecfc;--ad-green:#157653;--ad-red:#bd3e52;--ad-shadow:0 18px 60px #34415b12;color-scheme:light}
    .adm-root *{box-sizing:border-box}.adm-root button,.adm-root input,.adm-root select{font:inherit}.adm-root button{cursor:pointer}.adm-root button:disabled{opacity:.45;cursor:not-allowed}.adm-root :is(button,input,select):focus-visible{outline:2px solid var(--ad-accent);outline-offset:3px}.adm-root h2,.adm-root h3,.adm-root p{margin:0}.adm-root button{text-transform:none;letter-spacing:normal}.adm-shell{width:100%;max-width:1180px;margin:0 auto;background:var(--ad-bg);border:1px solid var(--ad-line);border-radius:24px;box-shadow:var(--ad-shadow);max-height:90vh;max-height:90dvh;overflow:auto;overscroll-behavior:contain;scrollbar-width:thin}
    .adm-head{padding:28px 30px 22px;display:flex;gap:16px;align-items:center}.adm-brand{width:48px;height:48px;display:grid;place-items:center;border:1px solid var(--ad-line);background:var(--ad-soft);border-radius:15px;color:var(--ad-accent);flex-shrink:0}.adm-eyebrow{color:var(--ad-muted);font-size:10px;letter-spacing:1.8px;margin-bottom:3px;font-weight:650}.adm-head h2{font-size:24px;font-weight:680;letter-spacing:-.8px;line-height:1.3}.adm-head p{color:var(--ad-muted);font-size:12px;margin-top:5px}.adm-live{margin-left:auto;display:flex;align-items:center;gap:7px;font-size:11px;color:var(--ad-muted);white-space:nowrap}.adm-dot{width:6px;height:6px;border-radius:50%;background:var(--ad-green)}
    .adm-summary{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;padding:0 30px 25px}.adm-summary-card{border:1px solid var(--ad-line);background:var(--ad-panel);border-radius:15px;padding:15px 17px;display:grid;grid-template-columns:1fr auto;gap:7px;align-items:center}.adm-summary-card span{font-size:11px;color:var(--ad-muted)}.adm-summary-card strong{font-size:27px;font-weight:650;letter-spacing:-1px;line-height:1.2}.adm-summary-card svg{color:var(--ad-accent);grid-column:2;grid-row:1 / 3}
    .adm-workspace{display:grid;grid-template-columns:330px minmax(0,1fr);border-top:1px solid var(--ad-line)}.adm-directory{border-right:1px solid var(--ad-line);padding:20px 14px;min-width:0}.adm-section-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:14px}.adm-section-head h3{font-size:14px;font-weight:650}.adm-count{color:var(--ad-muted);font-size:11px}.adm-search{position:relative}.adm-search>svg{position:absolute;left:12px;top:13px;color:var(--ad-muted)}.adm-input{width:100%;min-width:0;border:1px solid var(--ad-line);border-radius:10px;padding:10px 12px;background:var(--ad-bg);color:var(--ad-text);font-size:12px!important;outline:none}.adm-search .adm-input{padding-left:35px;padding-right:35px}.adm-search .adm-icon-btn{position:absolute;right:4px;top:5px}.adm-filter{display:flex;gap:5px;flex-wrap:wrap;margin:12px 0}.adm-chip{border:1px solid transparent;background:transparent;color:var(--ad-muted);border-radius:7px;padding:6px 8px;font-size:11px!important}.adm-chip.active{background:var(--ad-soft);color:var(--ad-accent);border-color:var(--ad-line)}.adm-sort{display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:10px;color:var(--ad-muted);margin-bottom:12px}.adm-sort select{background:var(--ad-bg);color:var(--ad-muted);border:1px solid var(--ad-line);border-radius:7px;padding:5px;font-size:10px}.adm-users{display:flex;flex-direction:column;gap:5px}.adm-person{display:flex;align-items:center;gap:10px;width:100%;text-align:left;color:var(--ad-text);background:transparent;border:1px solid transparent;border-radius:12px;padding:11px 10px}.adm-person:hover{background:var(--ad-panel)}.adm-person.selected{background:var(--ad-soft);border-color:var(--ad-line)}.adm-avatar{height:36px;width:36px;border-radius:11px;display:grid;place-items:center;background:var(--ad-panel);border:1px solid var(--ad-line);color:var(--ad-accent);font-size:12px;font-weight:700;flex-shrink:0}.adm-avatar.large{height:54px;width:54px;border-radius:17px;font-size:18px}.adm-person-text{flex:1;min-width:0}.adm-person-text strong{display:block;font-size:12px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.adm-person-text small{display:block;color:var(--ad-muted);font-size:10px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.adm-role-dot{width:6px;height:6px;border-radius:50%;background:var(--ad-green);flex-shrink:0}.adm-role-dot.banned{background:var(--ad-red)}.adm-person svg{color:var(--ad-accent)}
    .adm-pagination{display:flex;align-items:center;justify-content:space-between;gap:7px;margin-top:16px;color:var(--ad-muted);font-size:10px}.adm-btn{display:inline-flex;align-items:center;justify-content:center;gap:7px;padding:9px 12px;border:1px solid var(--ad-line);border-radius:9px;background:var(--ad-bg);color:var(--ad-text);font-size:12px!important;line-height:1.5;white-space:normal}.adm-btn:hover{background:var(--ad-panel)}.adm-btn.primary{background:var(--ad-accent);border-color:transparent;color:var(--ad-bg);font-weight:650}.adm-btn.danger{color:var(--ad-red);background:transparent}.adm-icon-btn{border:0;background:transparent;color:var(--ad-muted);padding:6px;border-radius:7px;display:grid;place-items:center}.adm-icon-btn:hover{background:var(--ad-soft);color:var(--ad-accent)}
    .adm-detail{padding:23px 26px 28px;min-width:0}.adm-profile{display:flex;align-items:center;gap:13px}.adm-profile-text{flex:1;min-width:0}.adm-profile h3{font-size:19px;font-weight:650;letter-spacing:-.4px;overflow-wrap:anywhere}.adm-profile p{font-size:12px;color:var(--ad-muted);overflow-wrap:anywhere}.adm-badges{display:flex;gap:6px;flex-wrap:wrap;margin-top:9px}.adm-badge{display:inline-flex;align-items:center;gap:4px;border:1px solid var(--ad-line);border-radius:6px;padding:2px 7px;font-size:10px;color:var(--ad-muted)}.adm-badge.good{color:var(--ad-green)}.adm-badge.bad{color:var(--ad-red)}.adm-badge.accent{color:var(--ad-accent);background:var(--ad-soft)}.adm-tabs{display:flex;gap:20px;overflow:auto;border-bottom:1px solid var(--ad-line);margin:25px 0 22px;scrollbar-width:thin}.adm-tab{border:0;border-bottom:2px solid transparent;display:flex;gap:6px;align-items:center;white-space:nowrap;background:transparent;color:var(--ad-muted);padding:0 0 12px;font-size:12px!important}.adm-tab.active{color:var(--ad-accent);border-bottom-color:var(--ad-accent)}
    .adm-section-label{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:12px}.adm-section-label h3{font-size:13px;font-weight:650}.adm-section-label p{font-size:11px;color:var(--ad-muted);margin-top:3px}.adm-modules{display:grid;grid-template-columns:1fr 1fr;gap:9px}.adm-module{display:flex;align-items:center;gap:10px;padding:13px 12px;border:1px solid var(--ad-line);border-radius:12px;background:var(--ad-bg);color:var(--ad-text);text-align:left;min-width:0}.adm-module:hover{background:var(--ad-panel)}.adm-module>svg{color:var(--ad-muted)}.adm-module.on>svg{color:var(--ad-accent)}.adm-module-name{flex:1;min-width:0;font-size:12px;font-weight:550}.adm-module-name small{display:block;font-size:10px;font-weight:400;color:var(--ad-muted);margin-top:2px}.adm-switch{width:29px;height:17px;border-radius:12px;background:var(--ad-line);padding:3px;flex-shrink:0;transition:background .15s}.adm-switch:before{content:'';display:block;width:11px;height:11px;border-radius:50%;background:var(--ad-bg);box-shadow:0 1px 3px #0003;transition:transform .15s}.on .adm-switch{background:var(--ad-accent)}.on .adm-switch:before{transform:translateX(12px)}.adm-setting{margin-top:18px;padding:15px;border:1px solid var(--ad-line);border-radius:12px;background:var(--ad-panel)}.adm-setting .adm-module{border:0;background:transparent;padding:0;width:100%}.adm-small{color:var(--ad-muted);font-size:11px;line-height:1.6}.adm-divider{height:1px;background:var(--ad-line);margin:22px 0}.adm-action-row{display:flex;align-items:center;justify-content:space-between;gap:15px;padding:14px 0;border-bottom:1px solid var(--ad-line)}.adm-action-row:last-child{border:0}.adm-action-row strong{display:block;font-size:12px;font-weight:600}.adm-action-row p{font-size:11px;color:var(--ad-muted);margin-top:3px}.adm-action-row .adm-btn{flex-shrink:0;max-width:45%}.adm-note{padding:12px;border:1px solid var(--ad-line);border-radius:10px;font-size:11px;color:var(--ad-muted);background:var(--ad-panel);display:flex;gap:8px;align-items:flex-start;margin-top:15px}
    .adm-stat-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.adm-stat{background:var(--ad-panel);border:1px solid var(--ad-line);border-radius:13px;padding:16px}.adm-stat-title{display:flex;align-items:center;gap:7px;font-size:11px;color:var(--ad-muted);margin-bottom:10px}.adm-stat-title svg{color:var(--ad-accent)}.adm-stat strong{font-size:25px;font-weight:650;letter-spacing:-.7px}.adm-stat strong small{font-size:12px;font-weight:400;color:var(--ad-muted);margin-left:4px}.adm-stat p{font-size:11px;color:var(--ad-muted);margin-top:5px}.adm-test-list{display:flex;flex-direction:column;gap:9px;margin-top:16px}.adm-test{display:flex;align-items:center;gap:10px;padding:13px;border:1px solid var(--ad-line);border-radius:11px}.adm-test>svg{color:var(--ad-accent)}.adm-test-text{min-width:0;flex:1}.adm-test strong{display:block;font-size:12px;overflow-wrap:anywhere;font-weight:600}.adm-test small{color:var(--ad-muted);font-size:10px}.adm-empty{padding:40px 18px;text-align:center;color:var(--ad-muted);font-size:12px}.adm-empty svg{margin:0 auto 12px;color:var(--ad-accent)}.adm-empty strong{display:block;font-size:14px;color:var(--ad-text);margin-bottom:5px}.adm-empty .adm-btn{margin-top:14px}.adm-empty.compact{padding:23px 10px}.adm-footer{display:flex;gap:10px;justify-content:space-between;padding:13px 30px;border-top:1px solid var(--ad-line);font-size:10px;color:var(--ad-muted)}.adm-banner{margin:0 30px 20px;padding:12px 14px;border:1px solid var(--ad-line);background:var(--ad-panel);border-radius:12px;display:flex;align-items:center;gap:12px;font-size:12px}.adm-banner span{flex:1}.adm-spinner{width:13px;height:13px;border:2px solid var(--ad-line);border-top-color:var(--ad-accent);display:inline-block;border-radius:50%;animation:adm-spin .7s linear infinite}.adm-saving{font-size:10px;color:var(--ad-muted);display:flex;align-items:center;gap:5px}
    .adm-overlay{position:fixed;inset:0;background:#10172788;backdrop-filter:blur(5px);z-index:10001;display:flex;align-items:center;justify-content:center;padding:18px}.adm-dialog{width:100%;max-width:460px;max-height:90dvh;overflow:auto;background:var(--ad-bg);border:1px solid var(--ad-line);border-radius:20px;padding:24px;box-shadow:var(--ad-shadow);animation:adm-enter .15s ease-out}.adm-dialog h3{font-size:19px;letter-spacing:-.4px;margin:10px 0}.adm-dialog p{font-size:13px;color:var(--ad-muted);line-height:1.6}.adm-dialog>svg{color:var(--ad-accent)}.adm-dialog-actions{display:flex;justify-content:flex-end;gap:9px;margin-top:22px}.adm-dialog label{display:block;font-size:12px;margin:24px 0 8px}.adm-upload{display:block;width:100%;height:auto;min-height:130px;padding:22px 16px;border:1px dashed var(--ad-line);border-radius:12px;background:var(--ad-panel);color:var(--ad-text);text-align:center;margin-top:14px;margin-bottom:8px;line-height:1.5;overflow:visible}.adm-upload svg{margin:0 auto 8px;color:var(--ad-accent)}.adm-upload small{display:block;color:var(--ad-muted);font-size:11px;margin-top:6px}.adm-error{font-size:12px!important;color:var(--ad-red)!important;margin-top:12px!important}.adm-preview{display:flex;align-items:center;gap:8px;background:var(--ad-soft);color:var(--ad-accent);padding:10px;border-radius:9px;font-size:11px;margin-top:12px;overflow-wrap:anywhere}.adm-toasts{position:fixed;right:20px;top:20px;z-index:10005;display:flex;flex-direction:column;gap:8px;max-width:min(360px,calc(100vw - 40px))}.adm-toast{display:flex;gap:9px;align-items:center;background:var(--ad-bg);color:var(--ad-text);border:1px solid var(--ad-line);box-shadow:var(--ad-shadow);border-radius:12px;padding:12px;font-size:12px;animation:adm-enter .2s ease-out}.adm-toast>svg{color:var(--ad-green)}.adm-toast.error>svg{color:var(--ad-red)}.adm-toast span{flex:1}.adm-hidden{position:absolute;width:1px;height:1px;clip:rect(0,0,0,0);overflow:hidden;white-space:nowrap}.adm-skeleton{height:60px;border-radius:11px;background:var(--ad-panel);margin:8px 0;animation:adm-fade 1.2s infinite}
    .adm-subjects{display:grid;grid-template-columns:1fr 1fr;gap:9px}.adm-subject{display:flex;align-items:center;gap:10px;padding:13px 12px;border:1px solid var(--ad-line);border-radius:12px;background:var(--ad-bg);color:var(--ad-text);text-align:left;min-width:0;transition:background .15s,border-color .15s}.adm-subject:hover{background:var(--ad-panel)}.adm-subject.on{border-color:var(--ad-accent);background:var(--ad-soft)}.adm-subject>svg{color:var(--ad-muted)}.adm-subject.on>svg{color:var(--ad-accent)}.adm-subject-all{grid-column:1 / -1}.adm-check{width:18px;height:18px;border-radius:6px;border:1.5px solid var(--ad-line);display:grid;place-items:center;flex-shrink:0;color:transparent}.adm-subject.on .adm-check{background:var(--ad-accent);border-color:var(--ad-accent);color:var(--ad-bg)}.adm-export-actions{display:flex;gap:9px;flex-wrap:wrap;justify-content:flex-end;margin-top:14px}
    .adm-report-box{border:1px solid var(--ad-line);border-radius:16px;background:linear-gradient(135deg,var(--ad-panel),var(--ad-bg));padding:16px;margin-top:4px}.adm-report-head{display:flex;align-items:center;gap:12px;margin-bottom:14px}.adm-report-icon{width:42px;height:42px;border-radius:13px;display:grid;place-items:center;background:var(--ad-soft);color:var(--ad-accent);border:1px solid var(--ad-line);flex-shrink:0}.adm-report-copy{flex:1;min-width:0}.adm-report-copy strong{display:block;font-size:13px}.adm-report-copy small{display:block;color:var(--ad-muted);font-size:10px;margin-top:3px;line-height:1.5}.adm-report-meter{height:5px;border-radius:999px;background:var(--ad-line);overflow:hidden;margin:12px 0 15px}.adm-report-meter>i{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,var(--ad-accent),#66b8d8);transition:width .2s}.adm-export-actions.split{justify-content:space-between;align-items:center}.adm-export-actions.split .adm-btn:first-child{margin-right:auto}.adm-contact-modes{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-bottom:16px}.adm-contact-mode{display:grid!important;grid-template-columns:28px minmax(0,1fr);grid-template-rows:auto auto;column-gap:10px;row-gap:3px;align-items:start;justify-content:stretch!important;min-height:82px;border:1px solid var(--ad-line);background:var(--ad-bg);color:var(--ad-text);border-radius:13px;padding:13px 14px;text-align:left;min-width:0;white-space:normal!important;line-height:1.35}.adm-contact-mode:hover{background:var(--ad-panel)}.adm-contact-mode.on{border-color:var(--ad-accent);background:var(--ad-soft);box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--ad-accent) 18%,transparent)}.adm-contact-mode>svg{grid-column:1;grid-row:1 / 3;color:var(--ad-accent);margin:2px 0 0;align-self:start}.adm-contact-mode strong{grid-column:2;grid-row:1;display:block;font-size:12px;line-height:1.35;min-width:0;overflow-wrap:anywhere}.adm-contact-mode small{grid-column:2;grid-row:2;display:block;color:var(--ad-muted);font-size:10px;line-height:1.45;margin:0;min-width:0;overflow-wrap:anywhere}.adm-contact-toolbar{display:flex;gap:9px;align-items:center;margin-bottom:10px}.adm-contact-toolbar .adm-search{flex:1}.adm-contact-list{display:flex;flex-direction:column;gap:7px;max-height:330px;overflow:auto;scrollbar-width:thin;padding-right:2px}.adm-contact{display:flex;align-items:center;gap:10px;padding:11px;border:1px solid var(--ad-line);border-radius:12px;background:var(--ad-bg);color:var(--ad-text);text-align:left;width:100%}.adm-contact:hover{background:var(--ad-panel)}.adm-contact.on{border-color:var(--ad-accent);background:var(--ad-soft)}.adm-contact.on .adm-check{background:var(--ad-accent);border-color:var(--ad-accent);color:var(--ad-bg)}.adm-contact .adm-avatar{width:32px;height:32px;border-radius:10px}.adm-contact-copy{flex:1;min-width:0}.adm-contact-copy strong{display:block;font-size:11px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.adm-contact-copy small{display:block;color:var(--ad-muted);font-size:9px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.adm-contact-role{font-size:9px;color:var(--ad-muted);padding:3px 6px;border:1px solid var(--ad-line);border-radius:6px;flex-shrink:0}.adm-contact-empty{padding:24px 12px;text-align:center;color:var(--ad-muted);font-size:11px;border:1px dashed var(--ad-line);border-radius:12px}.adm-chat-summary{display:flex;align-items:center;gap:8px;color:var(--ad-muted);font-size:10px;margin-top:12px}.adm-chat-summary svg{color:var(--ad-accent)}
    @media(max-width:620px){.adm-contact-modes{grid-template-columns:1fr}.adm-report-head{flex-wrap:wrap}.adm-report-head>.adm-btn{width:100%}}
    @media(max-width:420px){.adm-subjects{grid-template-columns:1fr}.adm-export-actions.split{flex-direction:column}.adm-export-actions.split .adm-btn{width:100%}}
    @keyframes adm-spin{to{transform:rotate(360deg)}}@keyframes adm-enter{from{opacity:0;transform:translateY(7px)}to{opacity:1;transform:none}}@keyframes adm-fade{50%{opacity:.4}}
    @media(max-width:850px){.adm-workspace{grid-template-columns:280px minmax(0,1fr)}.adm-detail{padding:20px 18px}.adm-tabs{gap:12px}.adm-head{padding:22px}.adm-summary{padding:0 22px 20px;gap:9px}.adm-modules{grid-template-columns:1fr}.adm-live{display:none}}
    @media(max-width:620px){.adm-shell{border-radius:18px;max-height:92dvh}.adm-head{padding:20px 16px}.adm-head h2{font-size:21px}.adm-head p{font-size:11px}.adm-summary{grid-template-columns:1fr 1fr;padding:0 16px 18px}.adm-summary-card{padding:12px}.adm-summary-card strong{font-size:23px}.adm-workspace{grid-template-columns:1fr}.adm-directory{border-right:0;border-bottom:1px solid var(--ad-line);padding:16px}.adm-users{max-height:255px;overflow:auto;scrollbar-width:thin}.adm-detail{padding:20px 16px}.adm-modules{grid-template-columns:1fr 1fr}.adm-module{padding:11px 8px;gap:6px}.adm-module-name{font-size:11px}.adm-module>svg{width:14px}.adm-action-row{align-items:flex-start}.adm-footer{padding:13px 16px;flex-wrap:wrap}.adm-banner{margin:0 16px 16px}.adm-profile h3{font-size:17px}.adm-input{font-size:16px!important}.adm-stat{padding:12px}.adm-dialog{padding:20px}.adm-saving{font-size:9px}}
    @media(max-width:360px){.adm-modules{grid-template-columns:1fr}.adm-tabs{gap:10px}.adm-tab{font-size:11px!important}.adm-action-row{flex-wrap:wrap}.adm-action-row .adm-btn{max-width:100%}}
    @media(prefers-reduced-motion:reduce){.adm-root *{animation:none!important;transition:none!important}}
    /* Motion layer: durations are deliberate; reduced motion disables every effect. */
    .adm-root{--ad-ease:cubic-bezier(.22,1,.36,1);--ad-spring:cubic-bezier(.2,.8,.25,1.15)}
    .adm-shell{animation:adm-shell-in .65s var(--ad-ease) both}
    .adm-head{animation:adm-rise .6s .06s var(--ad-ease) both}
    .adm-brand{position:relative;overflow:hidden;animation:adm-brand-in .8s var(--ad-spring) both}
    .adm-brand:after{content:'';position:absolute;inset:-40%;background:linear-gradient(110deg,transparent 38%,color-mix(in srgb,var(--ad-accent) 30%,transparent) 50%,transparent 62%);transform:translateX(-100%) rotate(12deg);animation:adm-brand-shine 6s 1s ease-in-out infinite;pointer-events:none}
    .adm-dot{animation:adm-live-pulse 2.8s ease-out infinite}
    .adm-summary-card{position:relative;overflow:hidden;animation:adm-rise .6s var(--ad-ease) both;transition:translate .25s var(--ad-ease),border-color .25s,box-shadow .25s}
    .adm-summary-card:nth-child(1){animation-delay:.1s}.adm-summary-card:nth-child(2){animation-delay:.17s}.adm-summary-card:nth-child(3){animation-delay:.24s}.adm-summary-card:nth-child(4){animation-delay:.31s}
    .adm-summary-card:after{content:'';position:absolute;inset:0;pointer-events:none;background:linear-gradient(110deg,transparent 25%,var(--ad-soft) 50%,transparent 75%);transform:translateX(-120%);transition:transform .7s var(--ad-ease)}
    .adm-summary-card strong{font-variant-numeric:tabular-nums}
    .adm-directory{animation:adm-rise .55s .16s var(--ad-ease) both}
    .adm-detail{animation:adm-detail-in .5s var(--ad-ease) both}
    .adm-pane{animation:adm-pane-in .44s var(--ad-ease) both}
    .adm-person{position:relative;overflow:hidden;animation:adm-list-in .44s var(--ad-ease) both;animation-delay:calc(min(var(--ad-order,0),8)*35ms);transition:background .25s,border-color .25s,translate .25s var(--ad-ease)}
    .adm-person:before{content:'';position:absolute;left:0;top:25%;height:50%;width:3px;background:var(--ad-accent);border-radius:5px;transform:scaleY(0);transition:transform .3s var(--ad-spring)}.adm-person.selected:before{transform:scaleY(1)}
    .adm-avatar{transition:background .3s,color .3s,transform .35s var(--ad-spring)}.adm-person.selected .adm-avatar{background:var(--ad-soft);transform:scale(1.06)}
    .adm-root :is(.adm-btn,.adm-icon-btn,.adm-chip,.adm-module,.adm-subject,.adm-contact-mode,.adm-contact,.adm-upload){position:relative;transition:background .25s,border-color .25s,color .25s,box-shadow .25s,translate .25s var(--ad-ease)}
    .adm-root :is(.adm-btn,.adm-icon-btn,.adm-chip,.adm-module,.adm-subject,.adm-contact-mode,.adm-contact,.adm-upload):active:not(:disabled){translate:0 2px;transition-duration:.08s}
    .adm-root :is(.adm-btn,.adm-icon-btn,.adm-chip,.adm-module,.adm-subject,.adm-contact-mode,.adm-contact,.adm-upload)>svg{transition:transform .3s var(--ad-spring),color .25s}
    .adm-tabs{position:relative}.adm-tab{position:relative;border-bottom-color:transparent!important;transition:color .25s}.adm-tab:after{content:'';position:absolute;bottom:0;left:0;right:0;height:2px;background:var(--ad-accent);border-radius:3px;transform:scaleX(0);transform-origin:center;transition:transform .35s var(--ad-ease)}.adm-tab.active:after{transform:scaleX(1)}.adm-tab svg{transition:transform .3s var(--ad-spring)}.adm-tab.active svg{transform:translateY(-1px) scale(1.12)}
    .adm-root :is(.adm-module,.adm-subject,.adm-stat,.adm-test,.adm-contact-mode,.adm-contact){animation:adm-rise .43s var(--ad-ease) both}
    .adm-root :is(.adm-modules,.adm-subjects,.adm-stat-grid,.adm-test-list,.adm-contact-modes,.adm-contact-list)>:nth-child(2){animation-delay:45ms}.adm-root :is(.adm-modules,.adm-subjects,.adm-stat-grid,.adm-test-list,.adm-contact-modes,.adm-contact-list)>:nth-child(3){animation-delay:90ms}.adm-root :is(.adm-modules,.adm-subjects,.adm-stat-grid,.adm-test-list,.adm-contact-list)>:nth-child(4){animation-delay:135ms}.adm-root :is(.adm-modules,.adm-subjects,.adm-test-list,.adm-contact-list)>:nth-child(n+5){animation-delay:180ms}
    .adm-switch{transition:background .3s,box-shadow .3s}.adm-switch:before{transition:transform .38s var(--ad-spring)}.adm-module.on .adm-switch{box-shadow:0 0 0 3px var(--ad-soft)}
    .adm-check{transition:background .25s,border-color .25s,color .25s}.adm-check svg{transform:scale(.4);opacity:0;transition:transform .35s var(--ad-spring),opacity .2s}.on .adm-check svg{transform:scale(1);opacity:1}
    .adm-search{transition:filter .25s}.adm-input{transition:border-color .25s,box-shadow .25s}.adm-input:focus{border-color:var(--ad-accent);box-shadow:0 0 0 3px var(--ad-soft)}.adm-search:focus-within>svg{color:var(--ad-accent);transform:rotate(-8deg);transition:transform .3s,color .3s}
    .adm-report-meter>i{transition:width .55s var(--ad-ease)}.adm-report-box{animation:adm-rise .5s .1s var(--ad-ease) both}
    .adm-preview,.adm-saving,.adm-note,.adm-banner,.adm-empty{animation:adm-rise .35s var(--ad-ease) both}.adm-error{animation:adm-error-in .38s ease-out both}
    .adm-presence{display:contents}.adm-overlay{animation:adm-overlay-in .3s ease-out both}.adm-dialog{transform-origin:50% 55%;animation:adm-dialog-in .5s var(--ad-ease) both}
    .adm-presence.leaving{pointer-events:none}.adm-presence.leaving .adm-overlay{animation:adm-overlay-out .22s ease-in both}.adm-presence.leaving .adm-dialog{animation:adm-dialog-out .22s ease-in both}
    .adm-toast{position:relative;overflow:hidden;animation:adm-toast-in .45s var(--ad-ease) both}.adm-toast:after{content:'';position:absolute;bottom:0;left:0;right:0;height:2px;background:var(--ad-green);transform-origin:left;animation:adm-toast-clock 4.5s linear both}.adm-toast.error:after{background:var(--ad-red)}.adm-toast.leaving{pointer-events:none;animation:adm-toast-out .24s ease-in both}
    .adm-skeleton{position:relative;overflow:hidden;animation:none}.adm-skeleton:after{content:'';position:absolute;inset:0;background:linear-gradient(100deg,transparent,var(--ad-soft),transparent);animation:adm-skeleton-shine 1.5s linear infinite}
    .adm-ripple{position:fixed;border-radius:50%;border:2px solid var(--ad-accent);background:var(--ad-soft);pointer-events:none;z-index:10006;animation:adm-ripple-out .5s ease-out both}
    @media(hover:hover) and (pointer:fine){.adm-summary-card:hover{translate:0 -4px;border-color:var(--ad-accent);box-shadow:0 10px 24px #0001}.adm-summary-card:hover:after{transform:translateX(120%)}.adm-person:hover{translate:2px 0}.adm-root :is(.adm-btn,.adm-module,.adm-subject,.adm-contact-mode,.adm-upload):hover:not(:disabled){translate:0 -2px;box-shadow:0 5px 14px #0001}.adm-root :is(.adm-btn,.adm-icon-btn,.adm-module,.adm-subject,.adm-contact-mode,.adm-upload):hover:not(:disabled)>svg{transform:translateY(-1px) rotate(-5deg)}}
    @keyframes adm-shell-in{from{opacity:0;transform:translateY(20px) scale(.99)}to{opacity:1;transform:none}}
    @keyframes adm-rise{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
    @keyframes adm-detail-in{from{opacity:0;transform:translateX(12px)}to{opacity:1;transform:none}}
    @keyframes adm-pane-in{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
    @keyframes adm-list-in{from{opacity:0;transform:translateX(-10px)}to{opacity:1;transform:none}}
    @keyframes adm-brand-in{from{opacity:0;transform:scale(.7) rotate(-12deg)}to{opacity:1;transform:none}}
    @keyframes adm-brand-shine{0%,65%{transform:translateX(-110%) rotate(12deg)}90%,100%{transform:translateX(110%) rotate(12deg)}}
    @keyframes adm-live-pulse{0%{box-shadow:0 0 0 0 var(--ad-soft)}75%,100%{box-shadow:0 0 0 8px transparent}}
    @keyframes adm-overlay-in{from{opacity:0}to{opacity:1}}@keyframes adm-overlay-out{to{opacity:0}}
    @keyframes adm-dialog-in{from{opacity:0;transform:translateY(25px) scale(.95)}to{opacity:1;transform:none}}@keyframes adm-dialog-out{to{opacity:0;transform:translateY(14px) scale(.98)}}
    @keyframes adm-toast-in{from{opacity:0;transform:translateX(30px) scale(.96)}to{opacity:1;transform:none}}@keyframes adm-toast-out{to{opacity:0;transform:translateX(25px) scale(.97)}}@keyframes adm-toast-clock{to{transform:scaleX(0)}}
    @keyframes adm-error-in{0%{opacity:0;transform:translateX(-4px)}35%{transform:translateX(4px)}65%{transform:translateX(-2px)}100%{opacity:1;transform:none}}
    @keyframes adm-skeleton-shine{from{transform:translateX(-100%)}to{transform:translateX(100%)}}@keyframes adm-ripple-out{from{opacity:.7;transform:scale(.3)}to{opacity:0;transform:scale(1.5)}}
    @media(prefers-reduced-motion:reduce){.adm-root *,.adm-root *:before,.adm-root *:after{animation:none!important;transition:none!important}.adm-ripple{display:none}}
    .adm-summary-card strong>span{font:inherit;color:inherit;letter-spacing:inherit}


    /* Точечное исправление списка: сохраняем исходные цвета и анимации. */
    .adm-root .adm-users{gap:8px;padding:4px 3px 8px;scroll-padding-block:8px}
    .adm-root .adm-person{flex:0 0 auto;height:auto;min-height:64px;max-height:none;padding:12px 10px;line-height:1.4}
    .adm-root .adm-person-text strong{line-height:1.4}
    .adm-root .adm-person-text small{line-height:1.5;margin-top:3px}
    .adm-root .adm-person>.adm-avatar{flex:0 0 36px}
    .adm-root .adm-chip{height:auto;min-height:36px;padding:8px;line-height:1.35}
    .adm-root .adm-search .adm-input{height:44px;min-height:44px;line-height:1.4}
    .adm-root .adm-sort select{height:auto;min-height:36px;min-width:0;max-width:70%;line-height:1.4}
    @media(max-width:620px){
      .adm-root .adm-users{max-height:min(420px,55dvh);overflow-y:auto;overflow-x:hidden;overscroll-behavior-y:auto}
      .adm-root .adm-person{min-height:72px;padding:14px 10px}
      .adm-root .adm-person-text strong{font-size:13px}
      .adm-root .adm-person-text small{font-size:11px}
      .adm-root .adm-filter{gap:6px}
      .adm-root .adm-sort select{font-size:16px}
    }

    /* Новые блоки наследуют палитру панели. */
    .adm-root .adm-seen{display:flex;align-items:center;gap:4px;color:var(--ad-muted);font-size:10px;font-weight:400;line-height:1.5;margin-top:5px;white-space:normal}.adm-root .adm-seen.recent{color:var(--ad-accent)}
    .adm-root .adm-person{min-height:82px}.adm-root .adm-profile-seen{margin:14px 0 18px}.adm-root .adm-profile-seen .adm-seen{font-size:12px;margin-top:0}
    .adm-root .adm-tabs{overflow-x:auto;scrollbar-width:thin;max-width:100%;padding-bottom:4px}.adm-root .adm-tab{flex:0 0 auto;white-space:nowrap;height:auto;min-height:44px}
    .adm-root .adm-insight{border:1px solid var(--ad-line);border-radius:16px;padding:18px;background:var(--ad-soft);margin-bottom:24px;animation:adm-rise .4s var(--ad-ease) both}
    .adm-root .adm-period{display:flex;gap:4px;flex-shrink:0}.adm-root .adm-period-legend{display:flex;flex-wrap:wrap;gap:6px 16px;color:var(--ad-muted);font-size:11px;margin-bottom:14px}
    .adm-root .adm-compare-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
    .adm-root .adm-compare-card{border:1px solid var(--ad-line);background:var(--ad-bg);padding:14px;border-radius:12px;min-width:0}
    .adm-root .adm-compare-card>span{font-size:11px;color:var(--ad-muted)}.adm-root .adm-compare-card>div{display:flex;align-items:center;flex-wrap:wrap;gap:8px;margin:10px 0;font-variant-numeric:tabular-nums}.adm-root .adm-compare-card strong{font-size:25px;color:var(--ad-accent);overflow-wrap:anywhere}.adm-root .adm-compare-card small{font-size:16px;color:var(--ad-muted)}.adm-root .adm-compare-card p{font-size:11px;color:var(--ad-muted)}.adm-root .adm-compare-card .up{color:var(--ad-green)}.adm-root .adm-compare-card .down{color:var(--ad-red)}
    .adm-root .adm-fineprint{font-size:11px;color:var(--ad-muted);line-height:1.6;margin-top:14px}
    .adm-root .adm-activity-summary{display:grid;gap:8px;padding:16px;background:var(--ad-soft);border:1px solid var(--ad-line);border-radius:13px;margin-bottom:20px}.adm-root .adm-activity-summary>span{font-size:12px;color:var(--ad-muted)}
    .adm-root .adm-timeline article{display:flex;gap:12px;padding:16px 0;border-bottom:1px solid var(--ad-line);animation:adm-rise .3s var(--ad-ease) both}.adm-root .adm-timeline article>div{min-width:0;overflow-wrap:anywhere}.adm-root .adm-timeline strong{font-size:13px}.adm-root .adm-timeline p,.adm-root .adm-timeline time{display:block;font-size:11px;color:var(--ad-muted);margin-top:5px}.adm-root .adm-timeline-dot{flex:0 0 8px;width:8px;height:8px;border-radius:50%;margin-top:6px;background:var(--ad-accent);box-shadow:0 0 0 4px var(--ad-soft)}
    @media(max-width:620px){.adm-root .adm-insight{padding:14px}.adm-root .adm-insight .adm-section-label{flex-wrap:wrap;gap:10px}.adm-root .adm-compare-card{padding:12px}.adm-root .adm-compare-card strong{font-size:22px}.adm-root .adm-person{min-height:88px}.adm-root .adm-count{font-size:10px;text-align:right}.adm-root .adm-pagination{flex-wrap:wrap;gap:8px}}
    
.adm-root .adm-maint{border-radius:18px}.adm-root .adm-maint .adm-maint-toggle{height:auto!important;min-height:76px!important;padding:16px 18px!important}.adm-root .adm-maint .adm-maint-body{padding:0 18px 18px}.adm-root .adm-maint button:not(.adm-maint-toggle){height:auto!important;min-height:40px!important;padding:10px 14px!important;font-size:13px!important;line-height:1.3!important;display:inline-flex;align-items:center;justify-content:center;gap:8px;border-radius:11px}.adm-root .adm-maint .adm-maint-options{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;padding-top:2px;margin-bottom:16px}.adm-root .adm-maint-options button{background:var(--ad-bg);border:1px solid var(--ad-line);color:var(--ad-muted);transition:background .2s,border-color .2s,transform .2s}.adm-root .adm-maint-options button.selected{background:var(--ad-soft);border-color:var(--ad-accent);color:var(--ad-accent)}.adm-root .adm-maint-options button:hover{transform:translateY(-2px)}.adm-maint-config{background:var(--ad-bg);padding:18px;border:1px solid var(--ad-line);border-radius:14px}.adm-maint-config h3{font-size:15px}.adm-maint-config p{color:var(--ad-muted);font-size:12px;line-height:1.6;margin-top:5px}.adm-maint-toolbar{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;margin-top:18px}.adm-maint-target{display:grid;gap:10px;min-width:0;flex:1;max-width:460px}.adm-maint-segment{display:inline-flex;gap:4px;padding:4px;background:var(--ad-panel);border:1px solid var(--ad-line);border-radius:12px;width:fit-content;max-width:100%}.adm-root .adm-maint-segment button{background:transparent;border:1px solid transparent;color:var(--ad-muted);min-height:34px!important;padding:7px 12px!important}.adm-root .adm-maint-segment button[aria-pressed=true]{background:var(--ad-soft);color:var(--ad-accent);border-color:var(--ad-line)}.adm-root .adm-maint :is(input,select){height:42px!important;min-height:42px!important;max-width:100%;padding:8px 12px!important;margin:0!important;border-radius:10px;font-size:13px!important;background:var(--ad-bg);color:var(--ad-text);border:1px solid var(--ad-line)}.adm-maint-scope-note{display:flex;align-items:center;gap:8px;color:var(--ad-muted);font-size:13px}.adm-root .adm-maint-confirm{padding:16px;gap:10px;border-radius:14px}.adm-root .adm-maint-confirm h3{font-size:16px}.adm-root .adm-maint-confirm p{font-size:12px;line-height:1.55}.adm-root .adm-maint-confirm label{gap:6px}.adm-root .adm-maint-confirm .adm-maint-actions{justify-content:flex-end;margin-top:0;padding-top:0}.adm-root .adm-maint-confirm input{max-width:300px}.adm-root .adm-maint .adm-error{font-size:12px;line-height:1.6;padding:12px 0 0;overflow-wrap:anywhere}@media(max-width:640px){.adm-root .adm-maint-options{grid-template-columns:repeat(2,minmax(0,1fr))}.adm-maint-toolbar{align-items:stretch;flex-direction:column}.adm-maint-target{max-width:none}.adm-maint-segment{width:100%}.adm-maint-segment button{flex:1}.adm-root .adm-maint .adm-maint-body{padding:0 12px 12px}.adm-root .adm-maint-config{padding:14px}.adm-maint-toolbar>.adm-btn{width:100%}}
`;

  // Keep dialogs mounted until their closing animation finishes.
  function AdminPresence({
    show,
    children,
    immediate = false
  }) {
    const [retained, setRetained] = useState(show);
    const last = useRef(children);
    if (show) last.current = children;
    useEffect(() => {
      if (show) {
        setRetained(true);
        return;
      }
      const delay = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 0 : 240;
      const timer = setTimeout(() => setRetained(false), delay);
      return () => clearTimeout(timer);
    }, [show]);
    if (immediate || !show && !retained) return null;
    return /*#__PURE__*/React.createElement("div", {
      className: `adm-presence ${show ? '' : 'leaving'}`,
      ref: el => {
        if (el) el.inert = !show;
      },
      "aria-hidden": show ? undefined : true
    }, show ? children : last.current);
  }
  function AdminNumber({
    value
  }) {
    const [display, setDisplay] = useState(typeof value === 'number' ? 0 : value);
    const current = useRef(typeof value === 'number' ? 0 : value);
    useEffect(() => {
      if (typeof value !== 'number' || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
        current.current = value;
        setDisplay(value);
        return;
      }
      const from = typeof current.current === 'number' ? current.current : 0;
      if (from === value) {
        current.current = value;
        setDisplay(value);
        return;
      }
      let frame, start;
      const tick = now => {
        if (start === undefined) start = now;
        const t = Math.min(1, (now - start) / 550);
        const next = Math.round(from + (value - from) * (1 - Math.pow(1 - t, 3)));
        current.current = next;
        setDisplay(next);
        if (t < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(frame);
    }, [value]);
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
      "aria-hidden": "true"
    }, display), /*#__PURE__*/React.createElement("span", {
      className: "adm-hidden"
    }, value));
  }
  // The ripple is decorative and never intercepts clicks or writes to Firebase.
  function useAdminRipples(ref) {
    useEffect(() => {
      const root = ref.current;
      if (!root) return;
      const nodes = new Set();
      const handle = event => {
        if (event.button !== 0 || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
        const target = event.target.closest('button');
        if (!target || target.disabled || !root.contains(target) || target.closest('.leaving')) return;
        const ripple = document.createElement('i');
        ripple.className = 'adm-ripple';
        ripple.setAttribute('aria-hidden', 'true');
        const size = Math.min(72, Math.max(36, target.offsetHeight));
        Object.assign(ripple.style, {
          width: `${size}px`,
          height: `${size}px`,
          left: `${event.clientX - size / 2}px`,
          top: `${event.clientY - size / 2}px`
        });
        root.appendChild(ripple);
        nodes.add(ripple);
        const done = () => {
          clearTimeout(ripple._admTimer);
          nodes.delete(ripple);
          ripple.remove();
        };
        ripple.addEventListener('animationend', done, {
          once: true
        });
        ripple.addEventListener('animationcancel', done, {
          once: true
        });
        // Bounded fallback also covers a motion preference change mid-animation.
        const timer = setTimeout(done, 650);
        ripple._admTimer = timer;
      };
      root.addEventListener('pointerdown', handle);
      return () => {
        root.removeEventListener('pointerdown', handle);
        nodes.forEach(node => {
          clearTimeout(node._admTimer);
          node.remove();
        });
      };
    }, [ref]);
  }
  const Btn = ({
    children,
    variant = '',
    ...props
  }) => /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    className: `adm-btn ${variant}`
  }, props), children);
  const IconBtn = ({
    icon = 'x',
    label,
    ...props
  }) => /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    className: "adm-icon-btn",
    title: label,
    "aria-label": label
  }, props), /*#__PURE__*/React.createElement(AdminIcon, {
    name: icon,
    size: 15
  }));
  const Empty = ({
    title,
    children,
    compact = false
  }) => /*#__PURE__*/React.createElement("div", {
    className: `adm-empty ${compact ? 'compact' : ''}`
  }, /*#__PURE__*/React.createElement(AdminIcon, {
    name: "inbox",
    size: 26
  }), /*#__PURE__*/React.createElement("strong", null, title), children);
  function Dialog({
    title,
    children,
    onClose,
    busy
  }) {
    const ref = useRef(null);
    const busyRef = useRef(busy);
    busyRef.current = busy;
    const closeRef = useRef(onClose);
    closeRef.current = onClose;
    useEffect(() => {
      const prior = document.activeElement;
      ref.current?.focus();
      const handle = event => {
        if (event.key === 'Escape') {
          event.preventDefault();
          event.stopPropagation();
          if (!busyRef.current) closeRef.current();
        }
        if (event.key !== 'Tab') return;
        const nodes = Array.from(ref.current?.querySelectorAll('button:not(:disabled),input:not(:disabled),select:not(:disabled),[tabindex="0"]') || []).filter(node => node.getClientRects().length);
        if (!nodes.length) {
          event.preventDefault();
          ref.current?.focus();
          return;
        }
        const first = nodes[0],
          last = nodes[nodes.length - 1];
        if (event.shiftKey && (document.activeElement === first || document.activeElement === ref.current)) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && (document.activeElement === last || !ref.current?.contains(document.activeElement))) {
          event.preventDefault();
          first.focus();
        }
      };
      document.addEventListener('keydown', handle, true);
      return () => {
        document.removeEventListener('keydown', handle, true);
        if (prior?.isConnected) prior.focus();
      };
    }, []);
    return /*#__PURE__*/React.createElement("div", {
      className: "adm-overlay",
      onMouseDown: event => {
        if (event.target === event.currentTarget && !busy) onClose();
      }
    }, /*#__PURE__*/React.createElement("section", {
      className: "adm-dialog",
      ref: ref,
      role: "dialog",
      "aria-modal": "true",
      "aria-label": title,
      tabIndex: -1
    }, /*#__PURE__*/React.createElement(AdminIcon, {
      name: "shield",
      size: 24
    }), /*#__PURE__*/React.createElement("h3", null, title), children));
  }
  function ImportDialog({
    user,
    onClose,
    onSave,
    busy
  }) {
    const [title, setTitle] = useState('');
    const [data, setData] = useState(null);
    const [fileName, setFileName] = useState('');
    const [error, setError] = useState('');
    const [reading, setReading] = useState(false);
    const fileRef = useRef(null),
      sequence = useRef(0),
      alive = useRef(true);
    useEffect(() => {
      alive.current = true;
      return () => {
        alive.current = false;
        sequence.current++;
      };
    }, []);
    async function read(file) {
      if (!file) return;
      const seq = ++sequence.current;
      setData(null);
      setError('');
      setFileName(file.name);
      setReading(true);
      try {
        if (file.size > MAX_FILE) throw problem('Файл больше 350 КБ. Уменьшите тест или используйте ссылки на изображения.');
        let parsed;
        try {
          parsed = JSON.parse((await file.text()).replace(/^\uFEFF/, ''));
        } catch (__lmsCaughtError) {
          window.reportLmsError?.(__lmsCaughtError, {
            "section": "admin",
            "source": "6_admin.js",
            "line": 1029,
            "operation": "caught",
            "handled": true
          });
          throw problem('Не удалось прочитать JSON. Проверьте формат файла.');
        }
        const normalized = normalizeTest(parsed);
        if (!alive.current || sequence.current !== seq) return;
        setData(normalized);
        setTitle(previous => previous || file.name.replace(/\.json$/i, '').slice(0, 100));
      } catch (e) {
        window.reportLmsError?.(e, {
          "section": "admin",
          "source": "6_admin.js",
          "line": 1036,
          "operation": "caught",
          "handled": true
        });
        if (alive.current && sequence.current === seq) setError(errorText(e));
      } finally {
        if (alive.current && sequence.current === seq) setReading(false);
      }
    }
    async function save(event) {
      event.preventDefault();
      if (!title.trim() || !data || busy || reading) return;
      setError('');
      try {
        await onSave({
          title: title.trim(),
          data
        });
      } catch (e) {
        window.reportLmsError?.(e, {
          "section": "admin",
          "source": "6_admin.js",
          "line": 1051,
          "operation": "caught",
          "handled": true
        });
        if (alive.current) setError(errorText(e));
      }
    }
    return /*#__PURE__*/React.createElement(Dialog, {
      title: "\u041D\u0430\u0437\u043D\u0430\u0447\u0438\u0442\u044C \u0442\u0435\u0441\u0442",
      onClose: onClose,
      busy: busy
    }, /*#__PURE__*/React.createElement("p", null, "\u041F\u043E\u043B\u0443\u0447\u0430\u0442\u0435\u043B\u044C: ", nameOf(user), ". \u0417\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u0435 JSON \u0441 \u0432\u043E\u043F\u0440\u043E\u0441\u0430\u043C\u0438, \u0432\u0430\u0440\u0438\u0430\u043D\u0442\u0430\u043C\u0438 \u0438 \u0438\u043D\u0434\u0435\u043A\u0441\u0430\u043C\u0438 \u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u044B\u0445 \u043E\u0442\u0432\u0435\u0442\u043E\u0432."), /*#__PURE__*/React.createElement("form", {
      onSubmit: save
    }, /*#__PURE__*/React.createElement("input", {
      className: "adm-hidden",
      type: "file",
      accept: ".json,application/json",
      ref: fileRef,
      tabIndex: -1,
      "aria-label": "\u0424\u0430\u0439\u043B \u0442\u0435\u0441\u0442\u0430",
      disabled: busy,
      onChange: event => {
        const file = event.target.files?.[0];
        event.target.value = '';
        read(file);
      }
    }), /*#__PURE__*/React.createElement("button", {
      className: "adm-upload",
      type: "button",
      disabled: busy || reading,
      onClick: () => fileRef.current?.click()
    }, /*#__PURE__*/React.createElement(AdminIcon, {
      name: "cloud",
      size: 23
    }), reading ? 'Проверяем файл…' : fileName || 'Выбрать JSON-файл', /*#__PURE__*/React.createElement("small", null, "\u0414\u043E 350 \u041A\u0411 \xB7 \u0434\u043E 300 \u0432\u043E\u043F\u0440\u043E\u0441\u043E\u0432")), data && /*#__PURE__*/React.createElement("div", {
      className: "adm-preview"
    }, /*#__PURE__*/React.createElement(AdminIcon, {
      name: "checkCircle",
      size: 15
    }), "\u041F\u0440\u043E\u0432\u0435\u0440\u0435\u043D\u043E \u0432\u043E\u043F\u0440\u043E\u0441\u043E\u0432: ", data.length), /*#__PURE__*/React.createElement("label", {
      htmlFor: "adm-test-title"
    }, "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 \u0442\u0435\u0441\u0442\u0430"), /*#__PURE__*/React.createElement("input", {
      id: "adm-test-title",
      className: "adm-input",
      autoComplete: "off",
      maxLength: 100,
      value: title,
      onChange: event => setTitle(event.target.value),
      placeholder: "\u041D\u0430\u043F\u0440\u0438\u043C\u0435\u0440: Excel \u2014 \u0431\u0430\u0437\u043E\u0432\u044B\u0435 \u0444\u043E\u0440\u043C\u0443\u043B\u044B",
      disabled: busy
    }), error && /*#__PURE__*/React.createElement("p", {
      className: "adm-error",
      role: "alert"
    }, error), /*#__PURE__*/React.createElement("div", {
      className: "adm-dialog-actions"
    }, /*#__PURE__*/React.createElement(Btn, {
      disabled: busy,
      onClick: onClose
    }, "\u041E\u0442\u043C\u0435\u043D\u0430"), /*#__PURE__*/React.createElement("button", {
      type: "submit",
      className: "adm-btn primary",
      disabled: busy || reading || !data || !title.trim()
    }, busy ? 'Сохраняем…' : 'Назначить тест'))));
  }
  function activityTime(value) {
    if (value == null || value === '') return null;
    if (typeof value.toMillis === 'function') {
      const n = value.toMillis();
      return Number.isFinite(n) ? n : null;
    }
    if (typeof value.seconds === 'number') return value.seconds * 1000;
    if (value instanceof Date) return Number.isFinite(+value) ? +value : null;
    if (typeof value === 'number') return Number.isFinite(value) && value > 0 ? value : null;
    if (typeof value !== 'string') return null;
    const ru = value.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})(?:,?\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
    if (ru) {
      const d = new Date(+ru[3], +ru[2] - 1, +ru[1], +(ru[4] || 0), +(ru[5] || 0), +(ru[6] || 0));
      return d.getFullYear() === +ru[3] && d.getMonth() === +ru[2] - 1 && d.getDate() === +ru[1] ? +d : null;
    }
    if (!/^\d{4}-\d{2}-\d{2}(?:T|$)/.test(value)) return null;
    const n = Date.parse(value);
    return Number.isFinite(n) ? n : null;
  }
  function lastActivity(user) {
    return Math.max(0, ...['lastSeenAt', 'lastActiveAt', 'lastVisitAt', 'lastLoginAt'].map(k => activityTime(user?.[k]) || 0)) || null;
  }
  const dateText = value => {
    const n = activityTime(value);
    return n == null ? 'Нет данных' : new Intl.DateTimeFormat('ru-RU', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(n);
  };
  function Seen({
    user,
    now
  }) {
    const time = lastActivity(user);
    let label = 'Активность не записана';
    if (time) {
      const minutes = Math.max(0, Math.floor((now - time) / 60000));
      label = minutes < 1 ? 'Активность только что' : minutes < 60 ? `Активность ${minutes} мин назад` : minutes < 1440 ? `Активность ${Math.floor(minutes / 60)} ч назад` : `Был(а) ${new Date(time).toLocaleDateString('ru-RU')}`;
    }
    return /*#__PURE__*/React.createElement("span", {
      className: `adm-seen ${time && now - time < 300000 ? 'recent' : ''}`,
      title: time ? dateText(time) : label
    }, /*#__PURE__*/React.createElement(AdminIcon, {
      name: "clock",
      size: 11
    }), label);
  }
  // Один живой список всех пользователей. Страницы ниже — только отображение.
  function useAllUsers(enabled, uid, retry) {
    const [state, setState] = useState({
      rows: null,
      busy: true,
      error: ''
    });
    useEffect(() => {
      if (!enabled) {
        setState({
          rows: null,
          busy: false,
          error: ''
        });
        return;
      }
      const db = window.db;
      const cache = directoryCache?.uid === uid && directoryCache.db === db && Date.now() - directoryCache.at < DIRECTORY_CACHE_TTL ? directoryCache.rows : null;
      let live = true,
        initialized = false;
      const profiles = new Map();
      setState({
        rows: cache,
        busy: true,
        error: ''
      });
      const stop = db.collection('users').onSnapshot({
        includeMetadataChanges: true
      }, snapshot => {
        if (!live || window.auth?.currentUser?.uid !== uid) return;
        const fromCache = !!snapshot.metadata?.fromCache;
        if (!initialized && fromCache && (cache || snapshot.empty)) return;
        let changed = !initialized;
        if (!initialized) {
          snapshot.docs.forEach(doc => profiles.set(doc.id, {
            ...doc.data(),
            id: doc.id
          }));
          initialized = true;
        } else snapshot.docChanges().forEach(change => {
          changed = true;
          if (change.type === 'removed') profiles.delete(change.doc.id);else profiles.set(change.doc.id, {
            ...change.doc.data(),
            id: change.doc.id
          });
        });
        if (changed) {
          const rows = Array.from(profiles.values());
          if (!fromCache) directoryCache = {
            uid,
            db,
            rows,
            at: Date.now()
          };
          setState({
            rows,
            busy: fromCache,
            error: ''
          });
        } else {
          if (!fromCache) directoryCache = {
            uid,
            db,
            rows: Array.from(profiles.values()),
            at: Date.now()
          };
          setState(previous => ({
            ...previous,
            busy: fromCache,
            error: ''
          }));
        }
      }, error => {
        window.reportLmsError?.(error, {
          "section": "admin",
          "source": "6_admin.js",
          "line": 1231,
          "operation": "snapshot",
          "handled": true
        });
        if (!live) return;
        directoryCache = null;
        setState({
          rows: null,
          busy: false,
          error: errorText(error)
        });
      });
      return () => {
        live = false;
        stop();
      };
    }, [enabled, uid, retry]);
    return state;
  }
  function comparePeriods(history, days, end) {
    const span = days * 86400000,
      start = end - span,
      previous = start - span;
    const bins = [[], []];
    let skipped = 0;
    array(history).forEach(row => {
      if (!row || typeof row !== 'object') {
        skipped++;
        return;
      }
      const at = activityTime(firstDefined(row, ['at', 'date', 'createdAt', 'timestamp']));
      const raw = row.percent;
      if (at == null || raw == null || raw === '' || !Number.isFinite(Number(raw)) || Number(raw) < 0 || Number(raw) > 100) {
        skipped++;
        return;
      }
      if (at >= previous && at < end) bins[at >= start ? 1 : 0].push({
        at,
        value: Number(raw)
      });
    });
    const metrics = bins.map(rows => ({
      count: rows.length,
      average: rows.length ? Math.round(rows.reduce((sum, r) => sum + r.value, 0) / rows.length) : null,
      best: rows.length ? Math.max(...rows.map(r => r.value)) : null,
      days: new Set(rows.map(r => new Date(r.at).toLocaleDateString('en-CA'))).size
    }));
    return {
      metrics,
      skipped,
      start,
      previous,
      end
    };
  }
  function ProgressComparison({
    user
  }) {
    const [days, setDays] = useState(7);
    const [end, setEnd] = useState(() => Date.now());
    const data = useMemo(() => comparePeriods(user.testHistory, days, end), [user.testHistory, days, end]);
    const [before, after] = data.metrics;
    const value = (n, unit) => n == null ? '—' : `${n}${unit}`;
    const range = (a, b) => `${new Date(a).toLocaleDateString('ru-RU')} — ${new Date(b - 1).toLocaleDateString('ru-RU')}`;
    return /*#__PURE__*/React.createElement("div", {
      className: "adm-insight"
    }, /*#__PURE__*/React.createElement("div", {
      className: "adm-section-label"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", null, "\u0421\u0440\u0430\u0432\u043D\u0435\u043D\u0438\u0435 \u043F\u0440\u043E\u0433\u0440\u0435\u0441\u0441\u0430"), /*#__PURE__*/React.createElement("p", null, "\u0422\u0435\u0441\u0442\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435 \xB7 \u0434\u0432\u0430 \u043F\u043E\u0441\u043B\u0435\u0434\u043E\u0432\u0430\u0442\u0435\u043B\u044C\u043D\u044B\u0445 \u043F\u0435\u0440\u0438\u043E\u0434\u0430")), /*#__PURE__*/React.createElement("div", {
      className: "adm-period",
      role: "group",
      "aria-label": "\u041F\u0435\u0440\u0438\u043E\u0434 \u0441\u0440\u0430\u0432\u043D\u0435\u043D\u0438\u044F"
    }, [7, 30].map(n => /*#__PURE__*/React.createElement("button", {
      type: "button",
      key: n,
      className: `adm-chip ${days === n ? 'active' : ''}`,
      "aria-pressed": days === n,
      onClick: () => {
        setDays(n);
        setEnd(Date.now());
      }
    }, n, " \u0434\u043D\u0435\u0439")))), /*#__PURE__*/React.createElement("div", {
      className: "adm-period-legend"
    }, /*#__PURE__*/React.createElement("span", null, "\u0420\u0430\u043D\u044C\u0448\u0435: ", range(data.previous, data.start)), /*#__PURE__*/React.createElement("span", null, "\u0421\u0435\u0439\u0447\u0430\u0441: ", range(data.start, data.end))), /*#__PURE__*/React.createElement("div", {
      className: "adm-compare-grid"
    }, [['count', 'Попытки', ''], ['average', 'Средний балл', '%'], ['best', 'Лучший результат', '%'], ['days', 'Дни с тестами', '']].map(([key, label, unit]) => {
      const delta = before[key] == null || after[key] == null ? null : Math.round((after[key] - before[key]) * 10) / 10;
      return /*#__PURE__*/React.createElement("div", {
        className: "adm-compare-card",
        key: key
      }, /*#__PURE__*/React.createElement("span", null, label), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, value(before[key], unit)), /*#__PURE__*/React.createElement("span", {
        "aria-hidden": "true"
      }, "\u2192"), /*#__PURE__*/React.createElement("strong", null, value(after[key], unit))), /*#__PURE__*/React.createElement("p", {
        className: delta > 0 ? 'up' : delta < 0 ? 'down' : ''
      }, delta == null ? 'Недостаточно данных' : delta === 0 ? 'Без изменений' : `${delta > 0 ? '+' : ''}${delta}${unit ? ' п. п.' : ''}`));
    })), !before.count && !after.count && /*#__PURE__*/React.createElement("div", {
      className: "adm-note"
    }, "\u0417\u0430 \u044D\u0442\u0438 \u043F\u0435\u0440\u0438\u043E\u0434\u044B \u043D\u0435\u0442 \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442\u043E\u0432 \u0441 \u0434\u0430\u0442\u0430\u043C\u0438. \u041E\u043D\u0438 \u043F\u043E\u044F\u0432\u044F\u0442\u0441\u044F \u043F\u043E\u0441\u043B\u0435 \u043F\u0440\u043E\u0445\u043E\u0436\u0434\u0435\u043D\u0438\u044F \u0442\u0435\u0441\u0442\u043E\u0432."), /*#__PURE__*/React.createElement("p", {
      className: "adm-fineprint"
    }, "\u041F\u0435\u0440\u0438\u043E\u0434\u044B \u043F\u043E ", days, " \u0441\u0443\u0442\u043E\u043A \u0434\u043E \u043C\u043E\u043C\u0435\u043D\u0442\u0430 \u043E\u0442\u043A\u0440\u044B\u0442\u0438\u044F \u0438\u043B\u0438 \u043F\u0435\u0440\u0435\u043A\u043B\u044E\u0447\u0435\u043D\u0438\u044F. ", data.skipped > 0 ? `Записей без корректной даты или оценки: ${data.skipped}. ` : '', "\u0414\u043B\u044F \u0441\u0440\u0430\u0432\u043D\u0435\u043D\u0438\u044F Excel \u0438 \u043F\u0435\u0447\u0430\u0442\u0438 \u043D\u0443\u0436\u043D\u0430 \u0438\u0441\u0442\u043E\u0440\u0438\u044F \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442\u043E\u0432 \u043F\u043E \u0434\u0430\u0442\u0430\u043C; \u043E\u0431\u0449\u0438\u0435 \u0440\u0435\u043A\u043E\u0440\u0434\u044B \u043D\u0435 \u043F\u043E\u043A\u0430\u0437\u044B\u0432\u0430\u044E\u0442 \u043D\u0435\u0434\u0435\u043B\u044C\u043D\u044B\u0439 \u043F\u0440\u043E\u0433\u0440\u0435\u0441\u0441."));
  }
  function UserActivity({
    user,
    now
  }) {
    useEffect(() => {
      const refresh = () => setRetry(v => v + 1);
      window.addEventListener('lms:activity-cleaned', refresh);
      return () => window.removeEventListener('lms:activity-cleaned', refresh);
    }, []);
    const [state, setState] = useState({
      items: [],
      loading: true,
      error: ''
    });
    const [retry, setRetry] = useState(0);
    useEffect(() => {
      let live = true;
      setState({
        items: [],
        loading: true,
        error: ''
      });
      window.db.collection('users').doc(user.id).collection('activity').orderBy('at', 'desc').limit(20).get().then(snap => {
        if (live) setState({
          items: snap.docs.map(d => ({
            ...d.data(),
            id: d.id
          })),
          loading: false,
          error: ''
        });
      }).catch(e => {
        window.reportLmsError?.(e, {
          "section": "admin",
          "source": "6_admin.js",
          "line": 1360,
          "operation": "promise-catch",
          "handled": true
        });
        if (live) setState({
          items: [],
          loading: false,
          error: errorText(e)
        });
      });
      return () => {
        live = false;
      };
    }, [user.id, retry]);
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      className: "adm-section-label"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", null, "\u041F\u043E\u0441\u043B\u0435\u0434\u043D\u044F\u044F \u0430\u043A\u0442\u0438\u0432\u043D\u043E\u0441\u0442\u044C"), /*#__PURE__*/React.createElement("p", null, "\u0414\u0430\u043D\u043D\u044B\u0435 \u043F\u043E\u0434\u043A\u043B\u044E\u0447\u0451\u043D\u043D\u043E\u0433\u043E \u0442\u0440\u0435\u043A\u0435\u0440\u0430 \u043F\u043B\u0430\u0442\u0444\u043E\u0440\u043C\u044B")), /*#__PURE__*/React.createElement(Btn, {
      disabled: state.loading,
      onClick: () => setRetry(n => n + 1)
    }, "\u041E\u0431\u043D\u043E\u0432\u0438\u0442\u044C")), /*#__PURE__*/React.createElement("div", {
      className: "adm-activity-summary"
    }, /*#__PURE__*/React.createElement(Seen, {
      user: user,
      now: now
    }), /*#__PURE__*/React.createElement("strong", null, dateText(lastActivity(user))), /*#__PURE__*/React.createElement("span", null, "\u041F\u043E\u0441\u043B\u0435\u0434\u043D\u0438\u0439 \u0432\u0445\u043E\u0434: ", dateText(firstDefined(user, ['lastLoginAt', 'lastLogin'])))), state.loading ? /*#__PURE__*/React.createElement("div", {
      className: "adm-skeleton",
      role: "status",
      "aria-label": "\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430 \u0430\u043A\u0442\u0438\u0432\u043D\u043E\u0441\u0442\u0438"
    }) : state.error ? /*#__PURE__*/React.createElement("div", {
      className: "adm-note",
      role: "alert"
    }, state.error, " \u041C\u0435\u0442\u043A\u0438 \u043F\u043E\u0441\u043B\u0435\u0434\u043D\u0435\u0433\u043E \u0432\u0445\u043E\u0434\u0430 \u0434\u043E\u0441\u0442\u0443\u043F\u043D\u044B \u0432\u044B\u0448\u0435.") : !state.items.length ? /*#__PURE__*/React.createElement(Empty, {
      compact: true,
      title: "\u0421\u043E\u0431\u044B\u0442\u0438\u0439 \u043F\u043E\u043A\u0430 \u043D\u0435\u0442"
    }, "\u0416\u0443\u0440\u043D\u0430\u043B \u0437\u0430\u043F\u043E\u043B\u043D\u0438\u0442\u0441\u044F, \u043A\u043E\u0433\u0434\u0430 \u0442\u0440\u0435\u043A\u0435\u0440 \u043D\u0430\u0447\u043D\u0451\u0442 \u0441\u043E\u0445\u0440\u0430\u043D\u044F\u0442\u044C \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u044F \u0443\u0447\u0435\u043D\u0438\u043A\u0430.") : /*#__PURE__*/React.createElement("div", {
      className: "adm-timeline"
    }, state.items.map(item => /*#__PURE__*/React.createElement("article", {
      key: item.id
    }, /*#__PURE__*/React.createElement("span", {
      className: "adm-timeline-dot"
    }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", null, str(item.label) || ACTIVITY_SECTIONS[item.section] || 'Действие на платформе'), /*#__PURE__*/React.createElement("p", null, ACTIVITY_SECTIONS[item.section] || str(item.section), item.action ? ` · ${str(item.action)}` : ''), /*#__PURE__*/React.createElement("time", null, dateText(item.at)))))), /*#__PURE__*/React.createElement("p", {
      className: "adm-fineprint"
    }, "\u041F\u043E\u043A\u0430\u0437\u0430\u043D\u044B \u043F\u043E\u0441\u043B\u0435\u0434\u043D\u0438\u0435 20 \u0441\u043E\u0431\u044B\u0442\u0438\u0439. \u0412\u0440\u0435\u043C\u044F \u0430\u043A\u0442\u0438\u0432\u043D\u043E\u0441\u0442\u0438 \u043D\u0435 \u044F\u0432\u043B\u044F\u0435\u0442\u0441\u044F \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u0438\u0435\u043C, \u0447\u0442\u043E \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C \u0441\u0435\u0439\u0447\u0430\u0441 \u043E\u043D\u043B\u0430\u0439\u043D."));
  }
  function AdminAudit({
    user
  }) {
    const entries = array(user.adminAudit).filter(e => e && typeof e === 'object').slice().reverse();
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      className: "adm-section-label"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", null, "\u0418\u0441\u0442\u043E\u0440\u0438\u044F \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0439 \u0430\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0442\u043E\u0440\u0430"), /*#__PURE__*/React.createElement("p", null, "\u0418\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u044F \u044D\u0442\u043E\u0433\u043E \u043F\u0440\u043E\u0444\u0438\u043B\u044F \u0447\u0435\u0440\u0435\u0437 \u043E\u0431\u043D\u043E\u0432\u043B\u0451\u043D\u043D\u0443\u044E \u043F\u0430\u043D\u0435\u043B\u044C")), /*#__PURE__*/React.createElement("span", {
      className: "adm-badge accent"
    }, entries.length)), !entries.length ? /*#__PURE__*/React.createElement(Empty, {
      compact: true,
      title: "\u041F\u043E\u043A\u0430 \u0431\u0435\u0437 \u0438\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u0439"
    }, "\u041F\u043E\u0441\u043B\u0435 \u043F\u0435\u0440\u0432\u043E\u0433\u043E \u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u0438\u044F \u0437\u0434\u0435\u0441\u044C \u043F\u043E\u044F\u0432\u044F\u0442\u0441\u044F \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0435, \u0430\u0432\u0442\u043E\u0440 \u0438 \u0432\u0440\u0435\u043C\u044F.") : /*#__PURE__*/React.createElement("div", {
      className: "adm-timeline"
    }, entries.map((entry, i) => /*#__PURE__*/React.createElement("article", {
      key: entry.id || i
    }, /*#__PURE__*/React.createElement("span", {
      className: "adm-timeline-dot"
    }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", null, str(entry.action) || 'Профиль изменён'), /*#__PURE__*/React.createElement("p", null, str(entry.actorName) || str(entry.actorUid) || 'Администратор'), /*#__PURE__*/React.createElement("p", null, array(entry.changes).map(c => str(c)).join(' · ')), /*#__PURE__*/React.createElement("time", null, dateText(entry.at)))))), /*#__PURE__*/React.createElement("p", {
      className: "adm-fineprint"
    }, "\u041F\u043E\u0441\u043B\u0435\u0434\u043D\u0438\u0435 100 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0439 \u043D\u0430 \u043F\u0440\u043E\u0444\u0438\u043B\u044C. \u0421\u0442\u0430\u0440\u044B\u0435 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u044F \u0434\u043E \u0443\u0441\u0442\u0430\u043D\u043E\u0432\u043A\u0438 \u043D\u0435 \u0432\u043E\u0441\u0441\u0442\u0430\u043D\u0430\u0432\u043B\u0438\u0432\u0430\u044E\u0442\u0441\u044F. \u0412\u0440\u0435\u043C\u044F \u2014 \u043F\u043E \u0447\u0430\u0441\u0430\u043C \u0443\u0441\u0442\u0440\u043E\u0439\u0441\u0442\u0432\u0430 \u0430\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0442\u043E\u0440\u0430."));
  }
  function auditChanges(current, patch) {
    const out = [];
    if ('role' in patch) out.push(`Роль: ${patch.role === 'admin' ? 'администратор' : 'студент'}`);
    if ('isBanned' in patch) out.push(patch.isBanned ? 'Аккаунт заблокирован' : 'Блокировка снята');
    if ('allowedModules' in patch) {
      const old = modulesOf(current),
        next = array(patch.allowedModules);
      out.push(...AVAILABLE_MODULES.filter(m => old.includes(m.id) !== next.includes(m.id)).map(m => `${m.label}: ${next.includes(m.id) ? 'открыт' : 'закрыт'}`));
    }
    if ('hotkeyHintsEnabled' in patch) out.push(`Подсказки горячих клавиш: ${patch.hotkeyHintsEnabled ? 'включены' : 'выключены'}`);
    if ('excelHintsEnabled' in patch) out.push(`Подсказки Excel: ${patch.excelHintsEnabled ? 'включены' : 'выключены'}`);
    if ('assignedTests' in patch) {
      const old = testsOf(current),
        next = array(patch.assignedTests);
      out.push(`Назначенных тестов: ${old.length} → ${next.length}`);
      next.filter(t => !old.some(o => o.id === t.id)).forEach(t => out.push(`Назначен: ${str(t.title).slice(0, 100) || 'Без названия'}`));
      old.filter(t => !next.some(n => n.id === t.id)).forEach(t => out.push(`Удалён: ${str(t.title).slice(0, 100) || 'Без названия'}`));
    }
    if ('chatContactMode' in patch) out.push(`Контакты: ${{
      all: 'все',
      teachers: 'преподаватели',
      selected: 'выбранные'
    }[patch.chatContactMode] || 'изменены'}`);
    if ('chatAllowedUsers' in patch) out.push(`Выбранных контактов: ${array(patch.chatAllowedUsers).length}`);
    [['testHistory', 'Тесты'], ['excelProgress', 'Excel'], ['typingProgress', 'Печать'], ['hotkeyProgress', 'Хоткеи']].forEach(([key, label]) => {
      if (key in patch) out.push(`${label}: статистика сброшена`);
    });
    return out.slice(0, 20);
  }
  function UserDetails({
    user,
    allUsers,
    now,
    self,
    busy,
    onAction,
    onModule,
    onHints,
    onHotkeyHints,
    onImport,
    onRemove,
    onExport,
    onChatMode,
    onChatUser
  }) {
    const [tab, setTab] = useState('access');
    const [picked, setPicked] = useState([]);
    const [contactSearch, setContactSearch] = useState('');
    const [exporting, setExporting] = useState(false);
    const toggle = id => setPicked(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
    const allPicked = picked.length === SUBJECTS.length;
    const summaries = {
      tests: `${array(user.testHistory).length} попыток`,
      hotkeys: `${number((user.hotkeyProgress || {}).sessionsPlayed)} сессий`,
      typing: `${number((user.typingProgress || {}).testsCompleted)} тренировок`,
      excel: `${number((user.excelProgress || {}).level, 1)} уровень · ${number((user.excelProgress || {}).xp)} XP`
    };
    const tests = testsOf(user),
      avg = average(user);
    const excel = user.excelProgress || {},
      typing = user.typingProgress || {},
      hotkeys = user.hotkeyProgress || {};
    const contactMode = chatModeOf(user),
      allowedContacts = chatAllowedOf(user);
    const contactCandidates = array(allUsers).filter(item => item.id !== user.id).sort((a, b) => userNameCollator.compare(nameOf(a), nameOf(b)));
    const contactQuery = contactSearch.trim().toLocaleLowerCase();
    const filteredContacts = contactCandidates.filter(item => !contactQuery || `${nameOf(item)} ${str(item.email)} ${item.id}`.toLocaleLowerCase().includes(contactQuery));
    const visibleContactCount = contactMode === 'all' ? contactCandidates.length : contactMode === 'teachers' ? contactCandidates.filter(item => item.role === 'admin').length : allowedContacts.filter(id => contactCandidates.some(item => item.id === id)).length;
    const tabs = [['access', 'settings', 'Доступы'], ['tests', 'fileText', `Тесты · ${tests.length}`], ['stats', 'barChart', 'Статистика'], ['chat', 'chat', 'Чат'], ['activity', 'activity', 'Активность'], ['audit', 'clock', 'Журнал'], ['account', 'shield', 'Аккаунт']];
    const download = async parts => {
      if (exporting) return;
      setExporting(true);
      try {
        await onExport(parts);
      } finally {
        setExporting(false);
      }
    };
    return /*#__PURE__*/React.createElement("section", {
      className: "adm-detail",
      "aria-label": `Пользователь ${nameOf(user)}`,
      "aria-busy": busy
    }, /*#__PURE__*/React.createElement("div", {
      className: "adm-profile"
    }, /*#__PURE__*/React.createElement("div", {
      className: "adm-avatar large"
    }, initials(user)), /*#__PURE__*/React.createElement("div", {
      className: "adm-profile-text"
    }, /*#__PURE__*/React.createElement("h3", null, nameOf(user)), /*#__PURE__*/React.createElement("p", null, str(user.email) || 'Email не указан'), /*#__PURE__*/React.createElement("div", {
      className: "adm-badges"
    }, /*#__PURE__*/React.createElement("span", {
      className: `adm-badge ${user.isBanned ? 'bad' : 'good'}`
    }, user.isBanned ? 'Заблокирован' : 'Не заблокирован'), /*#__PURE__*/React.createElement("span", {
      className: "adm-badge"
    }, user.role === 'admin' ? 'Администратор' : 'Студент'), self && /*#__PURE__*/React.createElement("span", {
      className: "adm-badge accent"
    }, "\u042D\u0442\u043E \u0432\u044B"))), busy && /*#__PURE__*/React.createElement("div", {
      className: "adm-saving",
      role: "status"
    }, /*#__PURE__*/React.createElement("i", {
      className: "adm-spinner"
    }), "\u0421\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u0438\u0435")), /*#__PURE__*/React.createElement("div", {
      className: "adm-profile-seen"
    }, /*#__PURE__*/React.createElement(Seen, {
      user: user,
      now: now
    })), /*#__PURE__*/React.createElement("div", {
      className: "adm-tabs",
      role: "tablist",
      "aria-label": "\u0420\u0430\u0437\u0434\u0435\u043B\u044B \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F"
    }, tabs.map(([id, icon, label], index) => /*#__PURE__*/React.createElement("button", {
      key: id,
      type: "button",
      className: `adm-tab ${tab === id ? 'active' : ''}`,
      role: "tab",
      id: `adm-tab-${id}`,
      "aria-controls": `adm-pane-${id}`,
      "aria-selected": tab === id,
      tabIndex: tab === id ? 0 : -1,
      onClick: () => setTab(id),
      onKeyDown: event => {
        const next = event.key === 'ArrowRight' ? (index + 1) % tabs.length : event.key === 'ArrowLeft' ? (index + tabs.length - 1) % tabs.length : event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : -1;
        if (next >= 0) {
          event.preventDefault();
          setTab(tabs[next][0]);
          document.getElementById(`adm-tab-${tabs[next][0]}`)?.focus();
        }
      }
    }, /*#__PURE__*/React.createElement(AdminIcon, {
      name: icon,
      size: 14
    }), label))), /*#__PURE__*/React.createElement("div", {
      key: tab,
      className: "adm-pane",
      role: "tabpanel",
      id: `adm-pane-${tab}`,
      "aria-labelledby": `adm-tab-${tab}`
    }, tab === 'access' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      className: "adm-section-label"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", null, "\u041C\u043E\u0434\u0443\u043B\u0438 \u043F\u043B\u0430\u0442\u0444\u043E\u0440\u043C\u044B"), /*#__PURE__*/React.createElement("p", null, "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u0442\u0435 \u0434\u043E\u0441\u0442\u0443\u043F \u043A \u043A\u0430\u0436\u0434\u043E\u043C\u0443 \u0440\u0430\u0437\u0434\u0435\u043B\u0443.")), /*#__PURE__*/React.createElement("span", {
      className: "adm-count"
    }, AVAILABLE_MODULES.filter(module => modulesOf(user).includes(module.id)).length, " / ", AVAILABLE_MODULES.length)), /*#__PURE__*/React.createElement("div", {
      className: "adm-modules"
    }, AVAILABLE_MODULES.map(module => {
      const on = modulesOf(user).includes(module.id);
      return /*#__PURE__*/React.createElement("button", {
        key: module.id,
        type: "button",
        role: "switch",
        "aria-checked": on,
        "aria-label": `Доступ: ${module.label}`,
        disabled: busy,
        className: `adm-module ${on ? 'on' : ''}`,
        onClick: () => onModule(module.id, !on)
      }, /*#__PURE__*/React.createElement(AdminIcon, {
        name: module.icon,
        size: 18
      }), /*#__PURE__*/React.createElement("span", {
        className: "adm-module-name"
      }, module.label, /*#__PURE__*/React.createElement("small", null, on ? 'Доступ открыт' : 'Доступ закрыт')), /*#__PURE__*/React.createElement("span", {
        className: "adm-switch",
        "aria-hidden": "true"
      }));
    })), /*#__PURE__*/React.createElement("div", {
      className: "adm-setting"
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      role: "switch",
      "aria-label": "\u041F\u043E\u0434\u0441\u043A\u0430\u0437\u043A\u0438 Excel",
      "aria-checked": user.excelHintsEnabled !== false,
      disabled: busy,
      className: `adm-module ${user.excelHintsEnabled !== false ? 'on' : ''}`,
      onClick: () => onHints(user.excelHintsEnabled === false)
    }, /*#__PURE__*/React.createElement(AdminIcon, {
      name: "lightbulb",
      size: 19
    }), /*#__PURE__*/React.createElement("span", {
      className: "adm-module-name"
    }, "\u041F\u043E\u0434\u0441\u043A\u0430\u0437\u043A\u0438 Excel", /*#__PURE__*/React.createElement("small", null, user.excelHintsEnabled !== false ? 'Помощь при выполнении заданий включена' : 'Режим экзамена — подсказки отключены')), /*#__PURE__*/React.createElement("span", {
      className: "adm-switch",
      "aria-hidden": "true"
    }))), /*#__PURE__*/React.createElement("div", {
      className: "adm-setting"
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      role: "switch",
      "aria-label": "\u041F\u043E\u0434\u0441\u043A\u0430\u0437\u043A\u0438 \u0433\u043E\u0440\u044F\u0447\u0438\u0445 \u043A\u043B\u0430\u0432\u0438\u0448",
      "aria-checked": user.hotkeyHintsEnabled !== false,
      disabled: busy,
      className: `adm-module ${user.hotkeyHintsEnabled !== false ? 'on' : ''}`,
      onClick: () => onHotkeyHints(user.hotkeyHintsEnabled === false)
    }, /*#__PURE__*/React.createElement(AdminIcon, {
      name: "keyboard",
      size: 19
    }), /*#__PURE__*/React.createElement("span", {
      className: "adm-module-name"
    }, "\u041F\u043E\u0434\u0441\u043A\u0430\u0437\u043A\u0438 \u0433\u043E\u0440\u044F\u0447\u0438\u0445 \u043A\u043B\u0430\u0432\u0438\u0448", /*#__PURE__*/React.createElement("small", null, user.hotkeyHintsEnabled !== false ? 'Кнопка подсказки доступна ученику' : 'Кнопка скрыта во время тренировки')), /*#__PURE__*/React.createElement("span", {
      className: "adm-switch",
      "aria-hidden": "true"
    }))), user.isBanned && /*#__PURE__*/React.createElement("div", {
      className: "adm-note"
    }, /*#__PURE__*/React.createElement(AdminIcon, {
      name: "lock",
      size: 15
    }), "\u0410\u043A\u043A\u0430\u0443\u043D\u0442 \u0437\u0430\u0431\u043B\u043E\u043A\u0438\u0440\u043E\u0432\u0430\u043D. \u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0430 \u043C\u043E\u0434\u0443\u043B\u0435\u0439 \u043D\u0435 \u0441\u043D\u0438\u043C\u0430\u0435\u0442 \u043E\u0431\u0449\u0443\u044E \u0431\u043B\u043E\u043A\u0438\u0440\u043E\u0432\u043A\u0443.")), tab === 'tests' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      className: "adm-section-label"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", null, "\u041F\u0435\u0440\u0441\u043E\u043D\u0430\u043B\u044C\u043D\u044B\u0435 \u0442\u0435\u0441\u0442\u044B"), /*#__PURE__*/React.createElement("p", null, "\u0417\u0430\u0434\u0430\u043D\u0438\u044F, \u043D\u0430\u0437\u043D\u0430\u0447\u0435\u043D\u043D\u044B\u0435 \u044D\u0442\u043E\u043C\u0443 \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044E.")), /*#__PURE__*/React.createElement(Btn, {
      variant: "primary",
      onClick: onImport,
      disabled: busy
    }, /*#__PURE__*/React.createElement(AdminIcon, {
      name: "cloud",
      size: 14
    }), "\u041D\u0430\u0437\u043D\u0430\u0447\u0438\u0442\u044C")), !tests.length ? /*#__PURE__*/React.createElement(Empty, {
      title: "\u041F\u043E\u043A\u0430 \u043D\u0435\u0442 \u043D\u0430\u0437\u043D\u0430\u0447\u0435\u043D\u043D\u044B\u0445 \u0442\u0435\u0441\u0442\u043E\u0432"
    }, "\u0417\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u0435 \u0444\u0430\u0439\u043B \u0441 \u0432\u043E\u043F\u0440\u043E\u0441\u0430\u043C\u0438, \u0447\u0442\u043E\u0431\u044B \u0434\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u043F\u0435\u0440\u0432\u043E\u0435 \u0437\u0430\u0434\u0430\u043D\u0438\u0435.") : /*#__PURE__*/React.createElement("div", {
      className: "adm-test-list"
    }, tests.map((test, index) => /*#__PURE__*/React.createElement("div", {
      className: "adm-test",
      key: `${test.id}-${index}`
    }, /*#__PURE__*/React.createElement(AdminIcon, {
      name: "fileText",
      size: 19
    }), /*#__PURE__*/React.createElement("div", {
      className: "adm-test-text"
    }, /*#__PURE__*/React.createElement("strong", null, str(test.title) || 'Без названия'), /*#__PURE__*/React.createElement("small", null, array(test.data).length, " \u0432\u043E\u043F\u0440\u043E\u0441\u043E\u0432")), /*#__PURE__*/React.createElement(IconBtn, {
      label: `Удалить тест: ${str(test.title) || 'Без названия'}`,
      disabled: busy || test.id == null,
      onClick: () => onRemove(test)
    }))))), tab === 'stats' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(ProgressComparison, {
      user: user
    }), /*#__PURE__*/React.createElement("div", {
      className: "adm-section-label"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", null, "\u0420\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442\u044B \u043E\u0431\u0443\u0447\u0435\u043D\u0438\u044F"), /*#__PURE__*/React.createElement("p", null, "\u041F\u043E\u043A\u0430\u0437\u0430\u0442\u0435\u043B\u0438 \u0438\u0437 \u043F\u0440\u043E\u0444\u0438\u043B\u044F \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F."))), /*#__PURE__*/React.createElement("div", {
      className: "adm-stat-grid"
    }, /*#__PURE__*/React.createElement("div", {
      className: "adm-stat"
    }, /*#__PURE__*/React.createElement("div", {
      className: "adm-stat-title"
    }, /*#__PURE__*/React.createElement(AdminIcon, {
      name: "barChart",
      size: 16
    }), "Excel"), /*#__PURE__*/React.createElement("strong", null, number(excel.level, 1), /*#__PURE__*/React.createElement("small", null, "\u0443\u0440\u043E\u0432\u0435\u043D\u044C")), /*#__PURE__*/React.createElement("p", null, number(excel.xp), " XP \xB7 ", Array.isArray(excel.completedLessons) ? excel.completedLessons.length : number(excel.completedLessons), " \u0437\u0430\u0434\u0430\u043D\u0438\u0439"), /*#__PURE__*/React.createElement("p", null, "\u0421\u0435\u0440\u0438\u044F: ", number(excel.streak))), /*#__PURE__*/React.createElement("div", {
      className: "adm-stat"
    }, /*#__PURE__*/React.createElement("div", {
      className: "adm-stat-title"
    }, /*#__PURE__*/React.createElement(AdminIcon, {
      name: "keyboard",
      size: 16
    }), "\u041F\u0435\u0447\u0430\u0442\u044C"), /*#__PURE__*/React.createElement("strong", null, number(typing.maxWpm), /*#__PURE__*/React.createElement("small", null, "WPM")), /*#__PURE__*/React.createElement("p", null, "\u0417\u0430\u0432\u0435\u0440\u0448\u0435\u043D\u043E: ", number(typing.testsCompleted)), /*#__PURE__*/React.createElement("p", null, "\u041B\u0443\u0447\u0448\u0435\u0435 \u043A\u043E\u043C\u0431\u043E: ", number(typing.maxCombo))), /*#__PURE__*/React.createElement("div", {
      className: "adm-stat"
    }, /*#__PURE__*/React.createElement("div", {
      className: "adm-stat-title"
    }, /*#__PURE__*/React.createElement(AdminIcon, {
      name: "zap",
      size: 16
    }), "\u0413\u043E\u0440\u044F\u0447\u0438\u0435 \u043A\u043B\u0430\u0432\u0438\u0448\u0438"), /*#__PURE__*/React.createElement("strong", null, number(hotkeys.totalScore), /*#__PURE__*/React.createElement("small", null, "\u043E\u0447\u043A\u043E\u0432")), /*#__PURE__*/React.createElement("p", null, "\u0421\u0435\u0441\u0441\u0438\u0439: ", number(hotkeys.sessionsPlayed)), /*#__PURE__*/React.createElement("p", null, "\u041B\u0443\u0447\u0448\u0438\u0439 \u0437\u0430 \u043F\u043E\u0434\u0445\u043E\u0434: ", number(hotkeys.maxScore))), /*#__PURE__*/React.createElement("div", {
      className: "adm-stat"
    }, /*#__PURE__*/React.createElement("div", {
      className: "adm-stat-title"
    }, /*#__PURE__*/React.createElement(AdminIcon, {
      name: "fileText",
      size: 16
    }), "\u0422\u0435\u0441\u0442\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435"), /*#__PURE__*/React.createElement("strong", null, avg === null ? '—' : `${avg}%`), /*#__PURE__*/React.createElement("p", null, avg === null ? 'Нет корректных оценок' : 'Средний результат'), /*#__PURE__*/React.createElement("p", null, "\u041F\u043E\u043F\u044B\u0442\u043E\u043A \u0432 \u0438\u0441\u0442\u043E\u0440\u0438\u0438: ", array(user.testHistory).length))), /*#__PURE__*/React.createElement("div", {
      className: "adm-divider"
    }), /*#__PURE__*/React.createElement("div", {
      className: "adm-report-box"
    }, /*#__PURE__*/React.createElement("div", {
      className: "adm-report-head"
    }, /*#__PURE__*/React.createElement("div", {
      className: "adm-report-icon"
    }, /*#__PURE__*/React.createElement(AdminIcon, {
      name: "download",
      size: 19
    })), /*#__PURE__*/React.createElement("div", {
      className: "adm-report-copy"
    }, /*#__PURE__*/React.createElement("strong", null, "\u041E\u0442\u0447\u0451\u0442 \u0443\u0447\u0435\u043D\u0438\u043A\u0430 \u0432 Excel"), /*#__PURE__*/React.createElement("small", null, "\u041F\u0440\u043E\u0444\u0438\u043B\u044C, \u0434\u043E\u0441\u0442\u0443\u043F\u044B, \u0441\u0432\u043E\u0434\u043D\u0430\u044F \u0441\u0442\u0430\u0442\u0438\u0441\u0442\u0438\u043A\u0430 \u0438 \u0436\u0443\u0440\u043D\u0430\u043B \u0430\u043A\u0442\u0438\u0432\u043D\u043E\u0441\u0442\u0438 \u0432\u0445\u043E\u0434\u044F\u0442 \u0430\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u0438. \u041D\u0438\u0436\u0435 \u043C\u043E\u0436\u043D\u043E \u0432\u044B\u0431\u0440\u0430\u0442\u044C \u043F\u043E\u0434\u0440\u043E\u0431\u043D\u044B\u0435 \u0440\u0430\u0437\u0434\u0435\u043B\u044B.")), /*#__PURE__*/React.createElement(Btn, {
      variant: "primary",
      disabled: busy || exporting,
      onClick: () => download(SUBJECTS.map(s => s.id))
    }, exporting ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("i", {
      className: "adm-spinner"
    }), "\u0413\u043E\u0442\u043E\u0432\u0438\u043C\u2026") : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(AdminIcon, {
      name: "download",
      size: 14
    }), "\u041F\u043E\u043B\u043D\u044B\u0439 \u043E\u0442\u0447\u0451\u0442"))), /*#__PURE__*/React.createElement("div", {
      className: "adm-section-label"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", null, "\u041F\u043E\u0434\u0440\u043E\u0431\u043D\u044B\u0435 \u0440\u0430\u0437\u0434\u0435\u043B\u044B"), /*#__PURE__*/React.createElement("p", null, "\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0434\u0430\u043D\u043D\u044B\u0435 \u0434\u043B\u044F \u0434\u043E\u043F\u043E\u043B\u043D\u0438\u0442\u0435\u043B\u044C\u043D\u043E\u0439 \u0434\u0435\u0442\u0430\u043B\u0438\u0437\u0430\u0446\u0438\u0438.")), /*#__PURE__*/React.createElement("span", {
      className: "adm-count"
    }, picked.length, " / ", SUBJECTS.length)), /*#__PURE__*/React.createElement("div", {
      className: "adm-report-meter"
    }, /*#__PURE__*/React.createElement("i", {
      style: {
        width: `${picked.length / SUBJECTS.length * 100}%`
      }
    })), /*#__PURE__*/React.createElement("div", {
      className: "adm-subjects",
      role: "group",
      "aria-label": "\u0420\u0430\u0437\u0434\u0435\u043B\u044B \u043E\u0442\u0447\u0451\u0442\u0430"
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      role: "checkbox",
      "aria-checked": allPicked,
      disabled: busy || exporting,
      className: `adm-subject adm-subject-all ${allPicked ? 'on' : ''}`,
      onClick: () => setPicked(allPicked ? [] : SUBJECTS.map(s => s.id))
    }, /*#__PURE__*/React.createElement(AdminIcon, {
      name: "layers",
      size: 18
    }), /*#__PURE__*/React.createElement("span", {
      className: "adm-module-name"
    }, "\u0412\u0441\u0435 \u0440\u0430\u0437\u0434\u0435\u043B\u044B", /*#__PURE__*/React.createElement("small", null, "\u0422\u0435\u0441\u0442\u044B, \u0445\u043E\u0442\u043A\u0435\u0438, \u043F\u0435\u0447\u0430\u0442\u044C \u0438 Excel")), /*#__PURE__*/React.createElement("span", {
      className: "adm-check"
    }, /*#__PURE__*/React.createElement(AdminIcon, {
      name: "check",
      size: 12,
      strokeWidth: 3
    }))), SUBJECTS.map(s => {
      const on = picked.includes(s.id);
      return /*#__PURE__*/React.createElement("button", {
        key: s.id,
        type: "button",
        role: "checkbox",
        "aria-checked": on,
        disabled: busy || exporting,
        className: `adm-subject ${on ? 'on' : ''}`,
        onClick: () => toggle(s.id)
      }, /*#__PURE__*/React.createElement(AdminIcon, {
        name: s.icon,
        size: 18
      }), /*#__PURE__*/React.createElement("span", {
        className: "adm-module-name"
      }, s.label, /*#__PURE__*/React.createElement("small", null, summaries[s.id])), /*#__PURE__*/React.createElement("span", {
        className: "adm-check"
      }, /*#__PURE__*/React.createElement(AdminIcon, {
        name: "check",
        size: 12,
        strokeWidth: 3
      })));
    })), /*#__PURE__*/React.createElement("div", {
      className: "adm-export-actions split"
    }, /*#__PURE__*/React.createElement(Btn, {
      disabled: busy || exporting || !picked.length,
      onClick: () => download(picked)
    }, /*#__PURE__*/React.createElement(AdminIcon, {
      name: "download",
      size: 14
    }), exporting ? 'Готовим файл…' : 'Скачать выбранное'), /*#__PURE__*/React.createElement(Btn, {
      variant: "danger",
      disabled: busy || !picked.length,
      onClick: () => onAction('reset', picked)
    }, /*#__PURE__*/React.createElement(AdminIcon, {
      name: "trash",
      size: 14
    }), "\u0421\u0431\u0440\u043E\u0441\u0438\u0442\u044C \u0432\u044B\u0431\u0440\u0430\u043D\u043D\u043E\u0435")))), tab === 'chat' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      className: "adm-section-label"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", null, "\u041A\u043E\u043D\u0442\u0430\u043A\u0442\u044B \u0432 \u0447\u0430\u0442\u0435"), /*#__PURE__*/React.createElement("p", null, "\u041E\u043F\u0440\u0435\u0434\u0435\u043B\u0438\u0442\u0435, \u043A\u043E\u0433\u043E \u044D\u0442\u043E\u0442 \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C \u0443\u0432\u0438\u0434\u0438\u0442 \u0432 \u0441\u043F\u0438\u0441\u043A\u0435 \u043A\u043E\u043D\u0442\u0430\u043A\u0442\u043E\u0432.")), /*#__PURE__*/React.createElement("span", {
      className: "adm-count"
    }, visibleContactCount, " \u0434\u043E\u0441\u0442\u0443\u043F\u043D\u043E")), /*#__PURE__*/React.createElement("div", {
      className: "adm-contact-modes",
      role: "radiogroup",
      "aria-label": "\u0420\u0435\u0436\u0438\u043C \u043A\u043E\u043D\u0442\u0430\u043A\u0442\u043E\u0432"
    }, [['all', 'users', 'Все пользователи', 'Показывать всех зарегистрированных пользователей.'], ['teachers', 'shield', 'Только преподаватели', 'Оставить в контактах только администраторов.'], ['selected', 'checkCircle', 'Только выбранные', 'Показывать только отмеченные ниже аккаунты.']].map(([id, icon, title, desc]) => /*#__PURE__*/React.createElement("button", {
      key: id,
      type: "button",
      role: "radio",
      "aria-checked": contactMode === id,
      disabled: busy,
      className: `adm-contact-mode ${contactMode === id ? 'on' : ''}`,
      onClick: () => onChatMode(id)
    }, /*#__PURE__*/React.createElement(AdminIcon, {
      name: icon,
      size: 18
    }), /*#__PURE__*/React.createElement("strong", null, title), /*#__PURE__*/React.createElement("small", null, desc)))), contactMode === 'selected' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      className: "adm-contact-toolbar"
    }, /*#__PURE__*/React.createElement("div", {
      className: "adm-search"
    }, /*#__PURE__*/React.createElement(AdminIcon, {
      name: "search",
      size: 15
    }), /*#__PURE__*/React.createElement("input", {
      className: "adm-input",
      value: contactSearch,
      onChange: event => setContactSearch(event.target.value),
      placeholder: "\u041D\u0430\u0439\u0442\u0438 \u0438\u043C\u044F, email \u0438\u043B\u0438 UID",
      "aria-label": "\u041F\u043E\u0438\u0441\u043A \u043A\u043E\u043D\u0442\u0430\u043A\u0442\u0430"
    }), contactSearch && /*#__PURE__*/React.createElement(IconBtn, {
      label: "\u041E\u0447\u0438\u0441\u0442\u0438\u0442\u044C \u043F\u043E\u0438\u0441\u043A",
      onClick: () => setContactSearch('')
    }))), /*#__PURE__*/React.createElement("div", {
      className: "adm-contact-list"
    }, !filteredContacts.length ? /*#__PURE__*/React.createElement("div", {
      className: "adm-contact-empty"
    }, "\u041F\u043E\u0434\u0445\u043E\u0434\u044F\u0449\u0438\u0445 \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u0435\u0439 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u043E.") : filteredContacts.map(contact => {
      const on = allowedContacts.includes(contact.id);
      return /*#__PURE__*/React.createElement("button", {
        type: "button",
        key: contact.id,
        role: "checkbox",
        "aria-checked": on,
        disabled: busy,
        className: `adm-contact ${on ? 'on' : ''}`,
        onClick: () => onChatUser(contact.id, !on)
      }, /*#__PURE__*/React.createElement("span", {
        className: "adm-avatar"
      }, initials(contact)), /*#__PURE__*/React.createElement("span", {
        className: "adm-contact-copy"
      }, /*#__PURE__*/React.createElement("strong", null, nameOf(contact)), /*#__PURE__*/React.createElement("small", null, str(contact.email) || contact.id)), /*#__PURE__*/React.createElement("span", {
        className: "adm-contact-role"
      }, contact.role === 'admin' ? 'Преподаватель' : 'Студент'), /*#__PURE__*/React.createElement("span", {
        className: "adm-check"
      }, /*#__PURE__*/React.createElement(AdminIcon, {
        name: "check",
        size: 12,
        strokeWidth: 3
      })));
    }))), /*#__PURE__*/React.createElement("div", {
      className: "adm-chat-summary"
    }, /*#__PURE__*/React.createElement(AdminIcon, {
      name: "info",
      size: 14
    }), contactMode === 'all' ? 'Сейчас пользователь видит всех, кроме самого себя.' : contactMode === 'teachers' ? 'Сейчас отображаются только аккаунты преподавателей.' : allowedContacts.length ? `Выбрано контактов: ${allowedContacts.length}.` : 'Контакты не выбраны — список чата будет пустым.'), /*#__PURE__*/React.createElement("div", {
      className: "adm-note"
    }, /*#__PURE__*/React.createElement(AdminIcon, {
      name: "shield",
      size: 15
    }), "\u042D\u0442\u043E\u0442 \u0440\u0430\u0437\u0434\u0435\u043B \u0443\u043F\u0440\u0430\u0432\u043B\u044F\u0435\u0442 \u043E\u0442\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u0435\u043C \u043A\u043E\u043D\u0442\u0430\u043A\u0442\u043E\u0432 \u0432 \u0438\u043D\u0442\u0435\u0440\u0444\u0435\u0439\u0441\u0435. \u0414\u043B\u044F \u0436\u0451\u0441\u0442\u043A\u043E\u0433\u043E \u0437\u0430\u043F\u0440\u0435\u0442\u0430 \u043F\u0435\u0440\u0435\u043F\u0438\u0441\u043A\u0438 \u0442\u0430\u043A\u0436\u0435 \u043F\u0440\u043E\u0432\u0435\u0440\u044C\u0442\u0435 Firestore Rules.")), tab === 'activity' && /*#__PURE__*/React.createElement(UserActivity, {
      user: user,
      now: now
    }), tab === 'audit' && /*#__PURE__*/React.createElement(AdminAudit, {
      user: user
    }), tab === 'account' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      className: "adm-section-label"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", null, "\u0423\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u0435 \u0430\u043A\u043A\u0430\u0443\u043D\u0442\u043E\u043C"), /*#__PURE__*/React.createElement("p", null, "\u0418\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u044F \u043F\u0440\u0438\u043C\u0435\u043D\u044F\u044E\u0442\u0441\u044F \u043F\u043E\u0441\u043B\u0435 \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u0438\u044F."))), /*#__PURE__*/React.createElement("div", {
      className: "adm-action-row"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", null, "\u041F\u0440\u0430\u0432\u0430 \u0430\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0442\u043E\u0440\u0430"), /*#__PURE__*/React.createElement("p", null, user.role === 'admin' ? 'Доступ к панели управления выдан.' : 'Пользователь работает с правами студента.')), /*#__PURE__*/React.createElement(Btn, {
      disabled: self || busy,
      onClick: () => onAction('role')
    }, user.role === 'admin' ? 'Снять права' : 'Выдать права')), /*#__PURE__*/React.createElement("div", {
      className: "adm-action-row"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", null, user.isBanned ? 'Снять блокировку' : 'Заблокировать аккаунт'), /*#__PURE__*/React.createElement("p", null, user.isBanned ? 'Разрешить пользователю вернуться к обучению.' : 'Ограничить доступ пользователя к платформе.')), /*#__PURE__*/React.createElement(Btn, {
      variant: user.isBanned ? '' : 'danger',
      disabled: self || busy,
      onClick: () => onAction('ban')
    }, user.isBanned ? 'Разблокировать' : 'Заблокировать')), self && /*#__PURE__*/React.createElement("div", {
      className: "adm-note"
    }, /*#__PURE__*/React.createElement(AdminIcon, {
      name: "info",
      size: 15
    }), "\u0421\u043E\u0431\u0441\u0442\u0432\u0435\u043D\u043D\u044B\u0435 \u043F\u0440\u0430\u0432\u0430 \u0430\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0442\u043E\u0440\u0430 \u0438 \u0431\u043B\u043E\u043A\u0438\u0440\u043E\u0432\u043A\u0443 \u0437\u0434\u0435\u0441\u044C \u0438\u0437\u043C\u0435\u043D\u0438\u0442\u044C \u043D\u0435\u043B\u044C\u0437\u044F."))));
  }
  function cleanupAuditKey(value) {
    if (value === null || typeof value !== 'object') return JSON.stringify(value);
    if (Array.isArray(value)) return '[' + value.map(cleanupAuditKey).join(',') + ']';
    return '{' + Object.keys(value).sort().map(key => JSON.stringify(key) + ':' + cleanupAuditKey(value[key])).join(',') + '}';
  }
  // Explicit paths only. Nothing is deleted before the preview is confirmed.
  const cleanupPathAllowed = (kind, path) => {
    const rules = {
      activity: /^users\/[^/]+\/activity\/[^/]+$/,
      audit: /^users\/[^/]+$/,
      chat: /^private_chats\/[^/]+\/messages\/[^/]+$/,
      finished: /^chessRooms\/[^/]+$/,
      rooms: /^chessRooms\/[^/]+$/,
      driveFinished: /^typeDriveRooms\/[^/]+$/,
      drivePresence: /^typeDrivePresence\/[^/]+$/,
      driveAll: /^(typeDriveRooms|typeDrivePresence)\/[^/]+$/
    };
    return !!rules[kind]?.test(path);
  };
  const driveInactive = d => !d.online || Date.now() - (d.lastSeen?.toMillis?.() || 0) > 90000;
  async function cleanupAdmin(db, uid, guard) {
    guard();
    const snap = await db.collection('users').doc(uid).get({
      source: 'server'
    });
    guard();
    if (!snap.exists || snap.data().role !== 'admin' || snap.data().isBanned) throw Error('Права администратора не подтверждены.');
  }
  async function cleanupPreview(db, uid, kind, guard, progress, targetUid = null) {
    await cleanupAdmin(db, uid, guard);
    const field = window.firebase.firestore.FieldPath.documentId();
    const refs = [],
      auditEntries = {},
      driveVersions = {};
    let total = 0,
      active = 0,
      scanned = 0;
    async function pages(source, visit) {
      let cursor = null;
      const base = source.orderBy(field);
      while (true) {
        guard();
        const page = await (cursor ? base.startAfter(cursor) : base).limit(200).get({
          source: 'server'
        });
        guard();
        scanned += page.size;
        if (scanned > 50000) throw Error('Слишком большой архив для одной проверки. Выберите отдельного пользователя. Ничего не удалено.');
        for (const doc of page.docs) {
          guard();
          await visit(doc);
        }
        progress(total);
        if (page.size < 200) break;
        cursor = page.docs[page.docs.length - 1];
      }
    }
    function collect(doc) {
      if (!doc.exists || !cleanupPathAllowed(kind, doc.ref.path)) return;
      if (targetUid && ['activity', 'audit'].includes(kind) && doc.ref.path.split('/')[1] !== targetUid) return;
      if (kind === 'finished' && !['finished', 'cancelled'].includes(doc.data().status)) return;
      if (kind === 'driveFinished' && !['finished', 'cancelled'].includes(doc.data().stage)) return;
      if (kind === 'drivePresence' && !driveInactive(doc.data())) return;
      if (kind.startsWith('drive')) {
        driveVersions[doc.ref.path] = cleanupAuditKey(doc.data());
        if (doc.ref.path.startsWith('typeDriveRooms/') && !['finished', 'cancelled'].includes(doc.data().stage)) active++;
      }
      if (kind === 'audit') {
        const entries = Array.isArray(doc.data().adminAudit) ? doc.data().adminAudit : [];
        if (!entries.length) return;
        auditEntries[doc.ref.path] = entries.map(cleanupAuditKey);
        total += entries.length;
      } else total++;
      refs.push(doc.ref);
      if (kind === 'rooms' && doc.data().status === 'playing') active++;
    }
    if (kind === 'activity') {
      if (targetUid) await pages(db.collection('users').doc(targetUid).collection('activity'), collect);else await pages(db.collection('users'), async user => {
        await pages(db.collection('users').doc(user.ref.path.split('/')[1]).collection('activity'), collect);
      });
    } else if (kind === 'audit' && targetUid) {
      guard();
      collect(await db.collection('users').doc(targetUid).get({
        source: 'server'
      }));
      guard();
      progress(total);
    } else if (kind.startsWith('drive')) {
      if (kind !== 'drivePresence') await pages(db.collection('typeDriveRooms'), collect);
      if (kind !== 'driveFinished') await pages(db.collection('typeDrivePresence'), collect);
    } else await pages(kind === 'audit' ? db.collection('users') : kind === 'chat' ? db.collectionGroup('messages') : db.collection('chessRooms'), collect);
    return {
      kind,
      refs,
      active,
      total,
      targetUid,
      auditEntries,
      driveVersions,
      created: Date.now()
    };
  }
  function cleanupErrorText(error) {
    if (String(error?.code || '').includes('permission-denied')) return 'Firebase запретил операцию. Проверьте права администратора и правила чтения/удаления для выбранных данных. Правила Firestore автоматически не изменяются.';
    return error?.message || errorText(error);
  }
  async function cleanupExecute(db, uid, plan, guard, progress, stopped) {
    let deleted = 0,
      skipped = 0,
      processed = 0;
    try {
      if (Date.now() - plan.created > 300000) throw Error('Предпросмотр устарел. Проверьте данные заново.');
      for (let i = 0; i < plan.refs.length; i += 40) {
        guard();
        if (stopped()) return {
          deleted,
          skipped,
          processed,
          stopped: true
        };
        const refs = plan.refs.slice(i, i + 40);
        // Read role and current room state in the SAME transaction as deletion.
        const result = await db.runTransaction(async tx => {
          guard();
          const self = await tx.get(db.collection('users').doc(uid));
          if (!self.exists || self.data().role !== 'admin' || self.data().isBanned) throw Error('Права администратора отозваны.');
          const snapshots = [];
          for (const ref of refs) {
            if (!cleanupPathAllowed(plan.kind, ref.path)) throw Error('Недопустимый путь очистки.');
            snapshots.push(await tx.get(ref));
          }
          guard();
          let count = 0,
            skip = 0;
          for (const doc of snapshots) {
            if (!doc.exists) {
              skip++;
              continue;
            }
            if (plan.kind === 'finished' && !['finished', 'cancelled'].includes(doc.data().status)) {
              skip++;
              continue;
            }
            if (plan.kind.startsWith('drive')) {
              const data = doc.data();
              if (plan.kind === 'driveFinished' && !['finished', 'cancelled'].includes(data.stage) || plan.kind === 'drivePresence' && !driveInactive(data) || doc.ref.path.startsWith('typeDrivePresence/') && cleanupAuditKey(data) !== plan.driveVersions[doc.ref.path]) {
                skip++;
                continue;
              }
            }
            if (plan.kind === 'audit') {
              // Remove only entries shown in the preview, preserving later changes.
              const pending = new Map();
              for (const key of plan.auditEntries[doc.ref.path] || []) pending.set(key, (pending.get(key) || 0) + 1);
              const current = Array.isArray(doc.data().adminAudit) ? doc.data().adminAudit : [];
              let removed = 0;
              const retained = current.filter(entry => {
                const key = cleanupAuditKey(entry),
                  n = pending.get(key) || 0;
                if (!n) return true;
                pending.set(key, n - 1);
                removed++;
                return false;
              });
              if (removed) tx.update(doc.ref, {
                adminAudit: retained
              });
              count += removed;
            } else {
              tx.delete(doc.ref);
              count++;
            }
          }
          return {
            count,
            skip
          };
        });
        deleted += result.count;
        skipped += result.skip;
        processed += refs.length;
        progress({
          deleted,
          skipped,
          processed
        });
      }
      return {
        deleted,
        skipped,
        processed,
        stopped: false
      };
    } catch (error) {
      window.reportLmsError?.(error, {
        "section": "admin",
        "source": "6_admin.js",
        "line": 2035,
        "operation": "caught",
        "handled": true
      });
      error.cleanupResult = {
        deleted,
        skipped,
        processed
      };
      throw error;
    }
  }
  function cleanupUnit(count, kind) {
    const forms = kind === 'chat' ? ['сообщение', 'сообщения', 'сообщений'] : ['activity', 'audit'].includes(kind) || kind.startsWith('drive') ? ['запись', 'записи', 'записей'] : ['комната', 'комнаты', 'комнат'];
    const n = Math.abs(count),
      ten = n % 10,
      hundred = n % 100;
    return forms[hundred >= 11 && hundred <= 14 ? 2 : ten === 1 ? 0 : ten >= 2 && ten <= 4 ? 1 : 2];
  }
  // Native top-layer dialog: background is inert; no manual body scroll locks.
  function CleanupModal({
    show,
    busy,
    onClose,
    children
  }) {
    const h = React.createElement;
    const ref = useRef(null),
      last = useRef(null),
      latest = useRef({
        busy,
        onClose
      });
    latest.current = {
      busy,
      onClose
    };
    if (show) last.current = children;
    useEffect(() => {
      const dialog = ref.current;
      let frame, timer;
      if (show) {
        const source = document.querySelector('.adm-root.adm-new');
        const syncTheme = () => {
          if (!source) return;
          const style = getComputedStyle(source);
          ['bg', 'panel', 'text', 'muted', 'line', 'accent', 'soft'].forEach(key => dialog.style.setProperty('--ad-' + key, style.getPropertyValue('--ad-' + key)));
        };
        syncTheme();
        const observer = new MutationObserver(syncTheme);
        for (let el = source; el; el = el.parentElement) observer.observe(el, {
          attributes: true,
          attributeFilter: ['class', 'data-theme']
        });
        if (!dialog.open) dialog.showModal();
        frame = requestAnimationFrame(() => dialog.classList.add('entered'));
        return () => {
          cancelAnimationFrame(frame);
          observer.disconnect();
        };
      }
      dialog.classList.remove('entered');
      timer = setTimeout(() => {
        if (dialog.open) dialog.close();
      }, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 220);
      return () => clearTimeout(timer);
    }, [show]);
    return ReactDOM.createPortal(h('dialog', {
      ref,
      className: 'adm-clean-modal',
      'aria-label': 'Подтверждение очистки',
      'aria-busy': busy,
      onCancel: e => {
        e.preventDefault();
        e.stopPropagation();
        if (!latest.current.busy) latest.current.onClose();
      },
      onClick: e => {
        if (e.target !== e.currentTarget || latest.current.busy) return;
        const r = e.currentTarget.getBoundingClientRect();
        if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) latest.current.onClose();
      }
    }, h('div', {
      className: 'adm-clean-content',
      ref: el => {
        if (el) el.inert = !show;
      }
    }, show ? children : last.current)), document.body);
  }
  function DataMaintenance({
    uid,
    users,
    embedded = false
  }) {
    const [category, setCategory] = useState('activity'),
      [scope, setScope] = useState('all'),
      [targetId, setTargetId] = useState(''),
      [roomMode, setRoomMode] = useState('finished'),
      [driveMode, setDriveMode] = useState('driveFinished');
    const personal = ['activity', 'audit'].includes(category);
    const targetUser = personal && scope === 'one' ? array(users).find(u => u.id === targetId) : null;
    const onlyKind = null;
    function resetPreview() {
      setPlan(null);
      setTyped('');
      setFailure('');
      setMessage('');
      setPhase('idle');
    }
    const [open, setOpen] = useState(embedded || !!onlyKind),
      [phase, setPhase] = useState('idle'),
      [plan, setPlan] = useState(null);
    const [message, setMessage] = useState(''),
      [failure, setFailure] = useState(''),
      [typed, setTyped] = useState('');
    const [counts, setCounts] = useState({
      deleted: 0,
      skipped: 0,
      processed: 0
    });
    const live = useRef(true),
      lock = useRef(false),
      cancel = useRef(false);
    useEffect(() => {
      live.current = true;
      return () => {
        live.current = false;
        cancel.current = true;
      };
    }, []);
    const guard = () => {
      if (!live.current || window.auth?.currentUser?.uid !== uid) throw Error('Аккаунт изменился или панель закрыта. Выполнение остановлено.');
    };
    const busy = phase === 'scan' || phase === 'delete';
    const titles = {
      driveFinished: 'Завершённые заезды TypeDrive',
      drivePresence: 'Неактивные записи присутствия TypeDrive',
      driveAll: 'Все комнаты и присутствие TypeDrive',
      finished: 'Завершённые партии',
      rooms: 'Все шахматные комнаты',
      chat: 'Вся история личных чатов',
      activity: 'История активности',
      audit: 'Журнал администратора'
    };
    async function inspect(kind) {
      if (lock.current) return;
      if (personal && scope === 'one' && !targetUser) {
        setFailure('Выберите пользователя из списка.');
        return;
      }
      lock.current = true;
      cancel.current = false;
      setPlan(null);
      setTyped('');
      setFailure('');
      setMessage('Проверяем данные в Firebase…');
      setPhase('scan');
      setCounts({
        deleted: 0,
        skipped: 0,
        processed: 0
      });
      try {
        const result = await cleanupPreview(window.db, uid, kind, () => {
          guard();
          if (cancel.current) throw Error('Проверка остановлена. Ничего не удалено.');
        }, n => {
          if (live.current) setMessage(`Найдено: ${n}`);
        }, targetUser?.id || null);
        if (live.current) {
          setPlan({
            ...result,
            targetLabel: targetUser ? nameOf(targetUser) : 'Все пользователи'
          });
          setPhase('preview');
          setMessage(result.refs.length ? 'Проверьте объём перед удалением.' : 'Ничего не найдено — база уже чистая.');
        }
      } catch (e) {
        window.reportLmsError?.(e, {
          "section": "admin",
          "source": "6_admin.js",
          "line": 2127,
          "operation": "caught",
          "handled": true
        });
        if (live.current) {
          setPhase('idle');
          setFailure(cleanupErrorText(e));
          setMessage('');
        }
      } finally {
        lock.current = false;
      }
    }
    async function execute() {
      if (lock.current || !plan || typed.trim() !== 'УДАЛИТЬ') return;
      lock.current = true;
      cancel.current = false;
      setPhase('delete');
      setFailure('');
      setMessage('Удаляем подтверждённые данные…');
      try {
        const r = await cleanupExecute(window.db, uid, plan, guard, c => {
          if (live.current) setCounts(c);
        }, () => cancel.current);
        if (live.current) {
          setCounts(r);
          setPhase('done');
          setMessage(`${r.stopped ? 'Остановлено' : r.deleted ? 'Очистка выполнена' : 'Изменений нет'}. Удалено: ${r.deleted}. Пропущено документов: ${r.skipped}.${!r.deleted ? ' Обновите проверку: подтверждённые записи могли измениться или быть удалены ранее.' : ''}`);
          setPlan(null);
          setTyped('');
          window.dispatchEvent(new Event('lms:activity-cleaned'));
        }
      } catch (e) {
        window.reportLmsError?.(e, {
          "section": "admin",
          "source": "6_admin.js",
          "line": 2156,
          "operation": "caught",
          "handled": true
        });
        if (live.current) {
          const r = e.cleanupResult || counts;
          setCounts(r);
          setPhase('done');
          setPlan(null);
          setFailure(`${cleanupErrorText(e)} Подтверждено удалений: ${r.deleted}. При потере связи итог последней порции может быть неизвестен — запустите новую проверку.`);
          setMessage('');
        }
      } finally {
        lock.current = false;
      }
    }
    return /*#__PURE__*/React.createElement("section", {
      className: `adm-maint ${(embedded ? "embedded " : "") + (onlyKind ? 'adm-maint-personal' : '')}`
    }, !onlyKind && /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "adm-maint-toggle",
      "aria-expanded": open,
      onClick: () => setOpen(v => !v)
    }, /*#__PURE__*/React.createElement("span", {
      className: "adm-maint-symbol"
    }, /*#__PURE__*/React.createElement(AdminIcon, {
      name: "settings",
      size: 20
    })), /*#__PURE__*/React.createElement("span", {
      className: "adm-maint-heading"
    }, /*#__PURE__*/React.createElement("strong", null, "\u041E\u0431\u0441\u043B\u0443\u0436\u0438\u0432\u0430\u043D\u0438\u0435 \u0434\u0430\u043D\u043D\u044B\u0445"), /*#__PURE__*/React.createElement("small", null, "\u041A\u043E\u043C\u043D\u0430\u0442\u044B, \u043F\u0435\u0440\u0435\u043F\u0438\u0441\u043A\u0438, \u0430\u043A\u0442\u0438\u0432\u043D\u043E\u0441\u0442\u044C \u0438 \u0436\u0443\u0440\u043D\u0430\u043B")), /*#__PURE__*/React.createElement("span", {
      className: "adm-maint-disclosure"
    }, /*#__PURE__*/React.createElement("span", null, open ? 'Свернуть' : 'Открыть'), /*#__PURE__*/React.createElement("svg", {
      viewBox: "0 0 24 24",
      width: "18",
      height: "18",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      className: open ? 'open' : '',
      "aria-hidden": "true"
    }, /*#__PURE__*/React.createElement("path", {
      d: "m6 9 6 6 6-6"
    })))), /*#__PURE__*/React.createElement(AdminPresence, {
      show: open
    }, /*#__PURE__*/React.createElement("div", {
      className: "adm-maint-body"
    }, /*#__PURE__*/React.createElement("div", {
      className: "adm-maint-options",
      "aria-label": "\u0422\u0438\u043F \u0434\u0430\u043D\u043D\u044B\u0445"
    }, [['activity', 'activity', 'Активность'], ['audit', 'clock', 'Журнал'], ['chess', 'chess', 'Шахматы'], ['chat', 'chat', 'Переписки'], ['drive', 'keyboard', 'TypeDrive']].map(([id, icon, label]) => /*#__PURE__*/React.createElement("button", {
      key: id,
      type: "button",
      disabled: busy,
      className: category === id ? 'selected' : '',
      "aria-pressed": category === id,
      onClick: () => {
        resetPreview();
        setCategory(id);
      }
    }, /*#__PURE__*/React.createElement(AdminIcon, {
      name: icon,
      size: 19
    }), /*#__PURE__*/React.createElement("span", null, label)))), /*#__PURE__*/React.createElement("div", {
      className: "adm-maint-config"
    }, /*#__PURE__*/React.createElement("div", {
      className: "adm-maint-config-head"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", null, {
      activity: 'История активности',
      audit: 'Журнал администратора',
      drive: 'Обслуживание TypeDrive',
      chess: 'Шахматные комнаты',
      chat: 'История переписок'
    }[category]), /*#__PURE__*/React.createElement("p", null, {
      activity: 'События и посещения разделов. Результаты обучения и последний вход сохраняются.',
      audit: 'Записи об изменениях профилей. Настройки и права пользователей сохраняются.',
      drive: 'Комнаты заездов и записи присутствия. Онлайн-участники создают присутствие заново автоматически.',
      chess: 'Освободите список комнат после игры.',
      chat: 'Удаление сообщений всех личных переписок. Доступ к общению сохраняется.'
    }[category]))), /*#__PURE__*/React.createElement("div", {
      className: "adm-maint-toolbar"
    }, /*#__PURE__*/React.createElement("div", {
      className: "adm-maint-target"
    }, personal ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      className: "adm-maint-segment",
      "aria-label": "\u041E\u0431\u043B\u0430\u0441\u0442\u044C \u043E\u0447\u0438\u0441\u0442\u043A\u0438"
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      disabled: busy,
      "aria-pressed": scope === 'all',
      onClick: () => {
        resetPreview();
        setScope('all');
      }
    }, "\u0412\u0441\u0435 \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u0438"), /*#__PURE__*/React.createElement("button", {
      type: "button",
      disabled: busy,
      "aria-pressed": scope === 'one',
      onClick: () => {
        resetPreview();
        setScope('one');
      }
    }, "\u041E\u0434\u0438\u043D \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C")), scope === 'one' && /*#__PURE__*/React.createElement("select", {
      className: "adm-input",
      "aria-label": "\u041F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C \u0434\u043B\u044F \u043E\u0447\u0438\u0441\u0442\u043A\u0438",
      disabled: busy || !users,
      value: targetId,
      onChange: e => {
        resetPreview();
        setTargetId(e.target.value);
      }
    }, /*#__PURE__*/React.createElement("option", {
      value: ""
    }, users ? 'Выберите пользователя…' : 'Загрузка пользователей…'), array(users).map(u => /*#__PURE__*/React.createElement("option", {
      key: u.id,
      value: u.id
    }, nameOf(u), " \xB7 ", u.email || u.id)))) : category === 'drive' ? React.createElement('div', {
      className: 'adm-maint-segment',
      style: {
        flexWrap: 'wrap'
      },
      'aria-label': 'Данные TypeDrive'
    }, [['driveFinished', 'Завершённые заезды'], ['drivePresence', 'Неактивные участники'], ['driveAll', 'Все данные']].map(([id, label]) => React.createElement('button', {
      key: id,
      type: 'button',
      disabled: busy,
      'aria-pressed': driveMode === id,
      onClick: () => {
        resetPreview();
        setDriveMode(id);
      }
    }, label))) : category === 'chess' ? /*#__PURE__*/React.createElement("div", {
      className: "adm-maint-segment",
      "aria-label": "\u041A\u043E\u043C\u043D\u0430\u0442\u044B \u0434\u043B\u044F \u043E\u0447\u0438\u0441\u0442\u043A\u0438"
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      disabled: busy,
      "aria-pressed": roomMode === 'finished',
      onClick: () => {
        resetPreview();
        setRoomMode('finished');
      }
    }, "\u0417\u0430\u0432\u0435\u0440\u0448\u0451\u043D\u043D\u044B\u0435"), /*#__PURE__*/React.createElement("button", {
      type: "button",
      disabled: busy,
      "aria-pressed": roomMode === 'rooms',
      onClick: () => {
        resetPreview();
        setRoomMode('rooms');
      }
    }, "\u0412\u0441\u0435 \u043A\u043E\u043C\u043D\u0430\u0442\u044B")) : /*#__PURE__*/React.createElement("span", {
      className: "adm-maint-scope-note"
    }, /*#__PURE__*/React.createElement(AdminIcon, {
      name: "users",
      size: 16
    }), "\u0412\u0441\u0435 \u043B\u0438\u0447\u043D\u044B\u0435 \u043F\u0435\u0440\u0435\u043F\u0438\u0441\u043A\u0438")), /*#__PURE__*/React.createElement(Btn, {
      variant: "primary",
      disabled: busy || personal && scope === 'one' && !targetUser,
      onClick: () => inspect(category === 'chess' ? roomMode : category === 'drive' ? driveMode : category)
    }, /*#__PURE__*/React.createElement(AdminIcon, {
      name: "search",
      size: 16
    }), "\u041F\u0440\u043E\u0432\u0435\u0440\u0438\u0442\u044C \u0434\u0430\u043D\u043D\u044B\u0435"))), message && /*#__PURE__*/React.createElement("div", {
      className: "adm-maint-status",
      role: "status"
    }, busy && /*#__PURE__*/React.createElement("i", {
      className: "adm-spinner"
    }), message), failure && /*#__PURE__*/React.createElement("p", {
      className: "adm-error",
      role: "alert"
    }, failure), React.createElement(CleanupModal, {
      show: !!(plan && plan.refs.length > 0 && (phase === 'preview' || phase === 'delete')),
      busy: phase === 'delete',
      onClose: resetPreview
    }, plan && React.createElement(React.Fragment, null, React.createElement('div', {
      className: 'adm-clean-top'
    }, React.createElement('span', {
      className: 'adm-clean-mark'
    }, React.createElement(AdminIcon, {
      name: 'alertTriangle',
      size: 24
    })), React.createElement('span', {
      className: 'adm-clean-kicker'
    }, 'ПОДТВЕРЖДЕНИЕ ОЧИСТКИ')), React.createElement('h3', null, titles[plan.kind]), React.createElement('p', null, 'Проверьте выбранные данные. Восстановить их через платформу нельзя.'), React.createElement('div', {
      className: 'adm-clean-summary'
    }, React.createElement('div', null, React.createElement('small', null, 'Область очистки'), React.createElement('strong', null, plan.kind === 'chat' ? 'Все личные переписки' : ['rooms', 'finished', 'driveFinished', 'drivePresence', 'driveAll'].includes(plan.kind) ? titles[plan.kind] : plan.targetLabel)), React.createElement('div', {
      className: 'adm-clean-count'
    }, React.createElement('b', null, plan.total), React.createElement('small', null, cleanupUnit(plan.total, plan.kind)))), plan.kind === 'driveAll' && React.createElement('p', null, 'Незавершённых заездов: ', plan.active, '. Они будут прерваны. Обновлённые после проверки записи присутствия будут пропущены; открытый онлайн-режим создаёт их заново.'), plan.kind === 'rooms' && React.createElement('p', null, 'Активных партий: ', React.createElement('b', null, plan.active), '. Игроки потеряют подключение к удалённым комнатам.'), React.createElement('p', null, ['activity', 'audit'].includes(plan.kind) ? 'Профили и результаты обучения сохранятся. Новые записи после проверки останутся.' : plan.kind === 'chat' ? 'Новые сообщения после проверки останутся.' : 'Комнаты, созданные после проверки, останутся.'), phase === 'delete' ? React.createElement('div', {
      className: 'adm-clean-progress',
      role: 'status'
    }, React.createElement('progress', {
      value: counts.processed,
      max: Math.max(1, plan.refs.length)
    }), React.createElement('p', null, `Обработано ${counts.processed} из ${plan.refs.length}. Удалено: ${counts.deleted}.`), React.createElement('p', null, message), React.createElement('button', {
      type: 'button',
      onClick: () => {
        cancel.current = true;
        setMessage('Останавливаем после текущей операции…');
      }
    }, 'Остановить очистку')) : React.createElement(React.Fragment, null, React.createElement('label', null, 'Для подтверждения введите УДАЛИТЬ', React.createElement('input', {
      value: typed,
      onChange: e => setTyped(e.target.value),
      autoComplete: 'off',
      spellCheck: false,
      placeholder: 'УДАЛИТЬ'
    })), React.createElement('div', {
      className: 'adm-clean-actions'
    }, React.createElement('button', {
      type: 'button',
      onClick: resetPreview,
      autoFocus: true
    }, 'Отмена'), React.createElement('button', {
      type: 'button',
      className: 'danger',
      disabled: typed.trim() !== 'УДАЛИТЬ',
      onClick: execute
    }, React.createElement(AdminIcon, {
      name: 'trash',
      size: 16
    }), 'Удалить'))))), phase === 'delete' && /*#__PURE__*/React.createElement("div", {
      className: "adm-maint-progress"
    }, /*#__PURE__*/React.createElement("progress", {
      value: counts.processed,
      max: Math.max(1, plan?.refs.length || 1)
    }), /*#__PURE__*/React.createElement("span", null, "\u041E\u0431\u0440\u0430\u0431\u043E\u0442\u0430\u043D\u043E ", counts.processed, " \u0438\u0437 ", plan?.refs.length, " \xB7 \u0443\u0434\u0430\u043B\u0435\u043D\u043E ", counts.deleted)), busy && /*#__PURE__*/React.createElement(Btn, {
      onClick: () => {
        cancel.current = true;
        setMessage('Останавливаем после текущей операции…');
      }
    }, "\u041E\u0441\u0442\u0430\u043D\u043E\u0432\u0438\u0442\u044C"))));
  }
  const ADMIN_POLISH_CSS = ".adm-root.adm-new .adm-maint .adm-maint-options{grid-template-columns:repeat(auto-fit,minmax(135px,1fr))}\n/* Shared surface rhythm, stable hover geometry, restrained motion. */\n.adm-new .av-recent,.adm-new .av-shortcut{border:1px solid var(--ad-line);border-radius:15px;padding:14px;gap:12px;margin-top:9px;background:var(--ad-bg);min-height:76px;transition:background .2s,border-color .2s,box-shadow .2s}\n.adm-new .av-recent:hover,.adm-new .av-shortcut:hover{padding:14px;background:var(--ad-soft);border-color:var(--ad-accent);box-shadow:0 5px 16px #00000008}\n.adm-new :is(.av-recent,.av-shortcut)>span:last-child{display:grid;place-items:center;flex-shrink:0;width:28px;height:28px;border-radius:9px;color:var(--ad-accent);transition:transform .2s}\n.adm-new :is(.av-recent,.av-shortcut):hover>span:last-child{transform:translateX(3px)}\n.adm-new :is(.av-recent,.av-shortcut) strong{font-size:13px;line-height:1.55}\n.adm-new .av-recent .adm-seen{margin-top:5px}\n.adm-new .adm-setting{padding:0;border:0;background:transparent;margin-top:12px}\n.adm-new .adm-setting .adm-module{width:100%;min-height:86px;padding:16px;border:1px solid var(--ad-line);border-radius:15px;background:var(--ad-bg);gap:14px;transition:background .22s,border-color .22s}\n.adm-new .adm-setting .adm-module.on{background:var(--ad-soft);border-color:var(--ad-line)}\n.adm-new .adm-setting .adm-module:hover{border-color:var(--ad-accent)}\n.adm-new .adm-setting .adm-module>svg{width:22px;height:22px;flex-shrink:0}\n.adm-new .adm-setting .adm-module-name{font-size:13px;line-height:1.5}\n.adm-new .adm-setting .adm-module-name small{font-size:11px;line-height:1.65;margin-top:4px}\n.adm-new .adm-setting .adm-switch{width:40px;height:24px;padding:3px;box-sizing:border-box}\n.adm-new .adm-setting .adm-switch:before{width:18px;height:18px;background:#fff;transition:transform .25s cubic-bezier(.2,.8,.2,1)}\n.adm-new .adm-setting .on .adm-switch:before{transform:translateX(16px)}\n.adm-new :is(.av-recent,.av-shortcut,.adm-module):focus-visible{outline:2px solid var(--ad-accent);outline-offset:3px}\n.adm-clean-modal{--ad-bg:#101521;--ad-panel:#191e2d;--ad-text:#edf0fa;--ad-muted:#a3aec5;--ad-line:#ffffff25;--ad-accent:#b5a0ff;--ad-soft:#a082fa1c;box-sizing:border-box;width:min(500px,calc(100vw - 28px));max-width:none;max-height:calc(100dvh - 32px);padding:0;margin:auto;border:1px solid var(--ad-line);border-radius:24px;background:var(--ad-panel);color:var(--ad-text);box-shadow:0 32px 100px #0005;overflow:auto;overscroll-behavior:contain;font:400 13px/1.65 Montserrat,system-ui,sans-serif;opacity:0;transform:translateY(18px) scale(.97);transition:opacity .22s,transform .28s cubic-bezier(.2,.8,.2,1)}\n.adm-clean-modal.entered{opacity:1;transform:none}.adm-clean-modal::backdrop{background:#080c1a99;backdrop-filter:blur(7px)}\n.adm-clean-modal *{box-sizing:border-box}.adm-clean-content{padding:26px}.adm-clean-modal h3{font:700 22px/1.3 Montserrat,system-ui,sans-serif;margin:13px 0 8px;letter-spacing:-.5px}.adm-clean-modal p{margin:10px 0;color:var(--ad-muted);overflow-wrap:anywhere}\n.adm-clean-top{display:flex;align-items:center;justify-content:space-between;gap:16px}.adm-clean-mark{display:grid;place-items:center;width:48px;height:48px;border-radius:15px;color:#e47791;background:#e4779118;border:1px solid #e4779130}.adm-clean-kicker{font-size:10px;font-weight:700;letter-spacing:1.3px;color:var(--ad-muted)}\n.adm-clean-summary{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:16px;padding:16px;margin:20px 0;border:1px solid var(--ad-line);border-radius:15px;background:var(--ad-bg)}.adm-clean-summary small{display:block;color:var(--ad-muted);font-size:11px}.adm-clean-summary strong{display:block;font-size:13px;overflow-wrap:anywhere}.adm-clean-count{text-align:right}.adm-clean-count b{font-size:28px;line-height:1.2;color:var(--ad-text);font-variant-numeric:tabular-nums}\n.adm-clean-modal label{display:grid;gap:8px;margin-top:18px;color:var(--ad-text);font-size:12px}.adm-clean-modal input{display:block;width:100%;height:48px;padding:12px 14px;margin:0;border:1px solid var(--ad-line);border-radius:12px;background:var(--ad-bg);color:var(--ad-text);font:500 16px/1.4 Montserrat,system-ui,sans-serif;transition:border-color .2s,box-shadow .2s}.adm-clean-modal input:focus{outline:0;border-color:var(--ad-accent);box-shadow:0 0 0 3px var(--ad-soft)}\n.adm-clean-actions{display:flex;gap:10px;margin-top:22px}.adm-clean-modal button{display:inline-flex;align-items:center;justify-content:center;gap:8px;flex:1;min-width:0;min-height:46px;height:auto;padding:11px 14px;margin:0;border:1px solid var(--ad-line);border-radius:12px;background:var(--ad-bg);color:var(--ad-text);font:600 12px/1.5 Montserrat,system-ui,sans-serif;cursor:pointer;transition:transform .18s,background .18s,opacity .18s}.adm-clean-modal button.danger{background:#b83e60;color:white;border-color:transparent}.adm-clean-modal button:hover:not(:disabled){filter:brightness(1.1)}.adm-clean-modal button:active:not(:disabled){transform:scale(.97)}.adm-clean-modal button:disabled{opacity:.4;cursor:not-allowed}.adm-clean-modal button:focus-visible{outline:2px solid var(--ad-accent);outline-offset:3px}.adm-clean-modal progress{width:100%;height:8px;accent-color:var(--ad-accent)}.adm-clean-progress{padding:16px;background:var(--ad-bg);border-radius:14px;margin-top:18px}\n@media(max-width:480px){.adm-clean-content{padding:21px}.adm-clean-modal h3{font-size:20px}.adm-new .adm-setting .adm-module{padding:14px;gap:10px}.adm-new .adm-setting .adm-module-name{font-size:12px}.adm-new :is(.av-recent,.av-shortcut){padding:12px;gap:10px}.adm-new :is(.av-recent,.av-shortcut):hover{padding:12px}.adm-new :is(.av-recent,.av-shortcut) strong{font-size:12px}}\n@media(prefers-reduced-motion:reduce){.adm-clean-modal,.adm-clean-modal *,.adm-new .adm-setting *{transition:none!important;animation:none!important}}\n.adm-root.adm-new{box-sizing:border-box}\n/* Mobile maintenance: override the original, more specific four-column rule. */\n.adm-root.adm-new .adm-maint .adm-maint-body,\n.adm-root.adm-new .adm-maint .adm-maint-config,\n.adm-root.adm-new .adm-maint .adm-maint-target{min-width:0;max-width:100%;box-sizing:border-box}\n.adm-root.adm-new .adm-maint .adm-maint-options>button{min-width:0;white-space:normal;overflow-wrap:anywhere}\n.adm-root.adm-new .adm-maint .adm-maint-options>button svg{flex-shrink:0}\n.adm-root.adm-new .adm-maint .adm-maint-segment{min-width:0;max-width:100%;box-sizing:border-box}\n.adm-root.adm-new .adm-maint .adm-maint-segment>button{min-width:0;white-space:normal;overflow-wrap:anywhere}\n@media(max-width:640px){\n.adm-root.adm-new .adm-maint .adm-maint-options{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}\n.adm-root.adm-new .adm-maint .adm-maint-options>button{width:100%;min-height:46px!important;padding:10px!important;justify-content:flex-start;font-size:12px!important;gap:8px}\n.adm-root.adm-new .adm-maint .adm-maint-options>button svg{width:17px;height:17px}\n.adm-root.adm-new .adm-maint .adm-maint-config{padding:14px}\n.adm-root.adm-new .adm-maint .adm-maint-segment{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));width:100%;gap:4px}\n.adm-root.adm-new .adm-maint .adm-maint-segment>button{width:100%;max-width:100%;padding:9px 5px!important;font-size:11px!important;line-height:1.5!important}\n.adm-root.adm-new .adm-maint .adm-maint-toolbar{width:100%;min-width:0;align-items:stretch}\n.adm-root.adm-new .adm-maint .adm-maint-toolbar>.adm-btn{width:100%;max-width:100%;font-size:12px!important;padding:12px 8px!important}\n}\n@media(max-width:440px){\n.adm-root.adm-new .av-nav{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;padding:10px 12px}\n.adm-root.adm-new .av-nav>button{flex-direction:row;justify-content:flex-start;gap:8px;min-width:0;padding:10px;font-size:11px;min-height:44px}\n.adm-root.adm-new .av-nav>button svg{flex-shrink:0;width:18px;height:18px}\n}\n";
  const ADMIN_NEW_CSS = ".adm-root.adm-new{--ad-bg:#101521;--ad-panel:#191e2d;--ad-text:#edf0fa;--ad-muted:#a3aec5;--ad-line:rgba(160,175,205,.18);--ad-accent:#b5a0ff;--ad-soft:rgba(160,130,250,.11);font-family:Montserrat,system-ui,sans-serif}\nhtml.light .adm-root.adm-new,body.light .adm-root.adm-new,.theme-light .adm-root.adm-new,[data-theme=light] .adm-root.adm-new{--ad-bg:#f4f5fa;--ad-panel:#fff;--ad-text:#252c40;--ad-muted:#64718a;--ad-line:#dfe3ee;--ad-accent:#7151c7;--ad-soft:#eee9fa}\n.adm-new .adm-shell{max-width:1280px;border-radius:25px;background:var(--ad-bg);max-height:92dvh;box-shadow:0 30px 100px #0003}.adm-new .adm-head{padding:25px 28px;background:var(--ad-panel);border-bottom:1px solid var(--ad-line);gap:15px}.adm-new .adm-head h2{font-size:clamp(21px,2.3vw,28px);letter-spacing:-.8px}.adm-new .adm-head p{font-size:12px;margin-top:5px}.adm-new .adm-eyebrow{font-size:9px;letter-spacing:2px;color:var(--ad-accent)}.adm-new .adm-brand{width:48px;height:48px;border-radius:15px;background:var(--ad-soft);color:var(--ad-accent)}\n.av-nav{display:flex;gap:6px;padding:13px 24px;background:var(--ad-panel);border-bottom:1px solid var(--ad-line)}.adm-new .av-nav button{display:flex;align-items:center;justify-content:center;gap:9px;flex:1;height:auto;min-height:44px;padding:11px 15px;border:1px solid transparent;border-radius:12px;background:transparent;color:var(--ad-muted);font:600 13px/1.4 Montserrat,system-ui,sans-serif;transition:background .22s,color .22s,transform .22s}.adm-new .av-nav button.active{background:var(--ad-soft);color:var(--ad-accent);border-color:var(--ad-line)}.adm-new .av-nav button:hover{background:var(--ad-soft)}.adm-new .av-nav button:active{transform:scale(.97)}.av-stage{padding:24px;min-height:420px}.av-scene[hidden]{display:none!important}.av-scene:not([hidden]){animation:av-enter .32s ease}\n.av-welcome{position:relative;display:flex;align-items:center;justify-content:space-between;gap:20px;padding:28px 30px;border:1px solid var(--ad-line);border-radius:22px;margin-bottom:20px;background:radial-gradient(ellipse at 95% 50%,var(--ad-soft),transparent 65%),var(--ad-panel);overflow:hidden}.av-kicker{color:var(--ad-accent);font-size:10px;letter-spacing:1.8px;font-weight:700}.av-welcome h3{font-size:clamp(24px,3vw,32px);letter-spacing:-1px;margin:10px 0}.av-welcome p{font-size:13px;color:var(--ad-muted);line-height:1.8;max-width:450px}.av-welcome .adm-btn{margin-top:20px}.av-orbit{width:170px;height:150px;position:relative;display:grid;place-items:center;flex-shrink:0;color:var(--ad-accent)}.av-orbit i{position:absolute;width:140px;height:140px;border:1px dashed var(--ad-accent);border-radius:35px;opacity:.25;animation:av-orbit 30s linear infinite}.av-orbit i:nth-child(2){width:110px;height:110px;animation-direction:reverse;border-style:solid}.av-orbit span{display:grid;place-items:center;width:78px;height:78px;border-radius:23px;background:var(--ad-soft);box-shadow:0 0 50px var(--ad-soft);animation:av-float 5s ease-in-out infinite}\n.adm-new .adm-summary{padding:0;margin:0 0 22px;gap:12px}.adm-new .adm-summary-card{padding:19px;border:1px solid var(--ad-line);border-radius:16px;background:var(--ad-panel);box-shadow:none}.adm-new .adm-summary-card strong{font-size:29px}.adm-new .adm-summary-card>span{font-size:11px}.av-grid{display:grid;grid-template-columns:1.1fr 1fr;gap:18px}.av-card{min-width:0;border:1px solid var(--ad-line);border-radius:18px;background:var(--ad-panel);padding:20px}.av-card-head{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:12px}.av-card-head h3{font-size:14px}.av-card-head small,.av-muted{font-size:11px;color:var(--ad-muted)}\n.adm-new .av-recent,.adm-new .av-shortcut{display:flex;align-items:center;gap:12px;min-height:72px;height:auto;width:100%;border:0;border-bottom:1px solid var(--ad-line);border-radius:0;padding:12px 0;background:transparent;color:var(--ad-text);text-align:left;transition:background .2s,padding .2s}.av-recent>span:nth-child(2),.av-shortcut>span:nth-child(2){flex:1;min-width:0}.av-recent strong,.av-shortcut strong{display:block;font-size:12px;overflow-wrap:anywhere}.av-shortcut small{display:block;font-size:11px;line-height:1.7;color:var(--ad-muted);margin-top:5px}.av-icon{display:grid;place-items:center;width:44px;height:44px;border-radius:13px;color:var(--ad-accent);background:var(--ad-soft);flex-shrink:0}.adm-new .av-recent:hover,.adm-new .av-shortcut:hover{padding-left:8px;padding-right:8px;background:var(--ad-soft)}.av-heading{margin:0 0 18px}.av-heading h3{font-size:21px}.av-heading p{font-size:12px;color:var(--ad-muted);margin-top:5px}\n.adm-new .adm-workspace{grid-template-columns:minmax(250px,310px) minmax(0,1fr);border:1px solid var(--ad-line);border-radius:20px;overflow:hidden;background:var(--ad-panel)}.adm-new .adm-directory{padding:20px 16px;background:var(--ad-bg)}.adm-new .adm-person{border:1px solid transparent;border-radius:12px;min-height:82px;padding:13px 11px}.adm-new .adm-person.selected{background:var(--ad-soft);border-color:var(--ad-line);box-shadow:inset 3px 0 var(--ad-accent)}.adm-new .adm-avatar{background:var(--ad-soft);color:var(--ad-accent);border-radius:12px}.adm-new .adm-detail{padding:24px}.adm-new .adm-tabs{gap:5px;padding:5px;border:1px solid var(--ad-line);border-radius:12px;background:var(--ad-bg);margin:22px 0}.adm-new .adm-tab{border:0;border-radius:8px;padding:10px 12px;min-height:40px;font-weight:600}.adm-new .adm-tab.active{background:var(--ad-soft);color:var(--ad-accent)}\n.adm-new .adm-input,.adm-new select{min-height:42px;border:1px solid var(--ad-line);border-radius:11px;background:var(--ad-bg);color:var(--ad-text);box-shadow:none}.adm-new .adm-input:focus{border-color:var(--ad-accent);box-shadow:0 0 0 3px var(--ad-soft)}.adm-new .adm-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;height:auto;min-height:42px;padding:10px 15px;border-radius:11px;font-size:12px;font-weight:600;line-height:1.4}.adm-new .adm-btn.primary{background:linear-gradient(135deg,#8e6ad9,#6d55be);color:#fff;border-color:transparent}.adm-new .adm-action-row{border:1px solid var(--ad-line);background:var(--ad-bg);border-radius:13px;padding:15px;margin:10px 0;gap:16px}.adm-new .adm-action-row>.adm-btn{flex-shrink:0}.adm-new .adm-module{min-height:70px;border-radius:13px}.adm-new .adm-module.on{border-color:var(--ad-accent);background:var(--ad-soft)}\n.adm-new .adm-maint{margin:0;background:var(--ad-panel);border-radius:20px}.adm-new .adm-maint.embedded .adm-maint-disclosure{display:none}.adm-new .adm-maint .adm-maint-body{padding:0 22px 22px}.adm-new .adm-maint-config{padding:22px}.adm-new .adm-maint-confirm{max-width:640px;margin:20px auto 0}.adm-new .adm-maint-actions,.adm-new .adm-dialog-actions{justify-content:flex-end;gap:9px}.adm-new .adm-footer{border-top:1px solid var(--ad-line);background:var(--ad-panel);font-size:10px}.adm-new .av-back{display:none}.av-skeleton{height:180px;border-radius:12px;background:linear-gradient(100deg,var(--ad-bg),var(--ad-soft),var(--ad-bg));background-size:220% 100%;animation:av-shimmer 1.6s linear infinite}\n@keyframes av-enter{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}@keyframes av-orbit{to{transform:rotate(360deg)}}@keyframes av-float{50%{transform:translateY(-6px)}}@keyframes av-shimmer{to{background-position:-220% 0}}\n@media(max-width:760px){.av-stage{padding:14px}.adm-new .adm-head{padding:20px 16px}.av-nav{padding:10px 12px;gap:4px}.adm-new .av-nav button{font-size:11px;padding:10px 8px;gap:6px;min-width:0}.av-grid{grid-template-columns:1fr}.av-welcome{padding:22px}.av-orbit{width:105px;transform:scale(.75);margin-right:-15px}.adm-new .adm-workspace{grid-template-columns:1fr}.adm-new .av-students:not(.profile-open) .adm-detail{display:none}.adm-new .av-students.profile-open .adm-directory{display:none}.adm-new .av-students.profile-open .av-back{display:inline-flex;margin-bottom:12px}.adm-new .adm-detail{padding:18px 14px}.adm-new .adm-users{max-height:58dvh}.adm-new .adm-action-row{flex-wrap:wrap}.adm-new .adm-action-row>.adm-btn{margin-left:auto}}\n@media(max-width:440px){.adm-new .av-nav button{flex-direction:column;font-size:10px;gap:5px}.av-orbit{display:none}.av-welcome h3{font-size:25px}.adm-new .adm-summary{grid-template-columns:1fr 1fr;gap:9px}.adm-new .adm-summary-card{padding:14px}.av-card{padding:16px}.av-card-head{flex-direction:column;align-items:flex-start;gap:4px}.adm-new .adm-live{display:none}}\n@media(prefers-reduced-motion:reduce){.adm-new *,.adm-new *:before{animation:none!important;transition:none!important}}\n";
  function AssignmentDesk({
    users
  }) {
    const [creating, setCreating] = useState(false);
    const formDialog = useRef(null);
    useEffect(() => {
      const d = formDialog.current;
      if (creating && !d.open) d.showModal();
      if (!creating && d.open) d.close();
    }, [creating]);
    const [title, setTitle] = useState(''),
      [text, setText] = useState(''),
      [lang, setLang] = useState('ru'),
      [accuracy, setAccuracy] = useState(95),
      [due, setDue] = useState(''),
      [query, setQuery] = useState(''),
      [chosen, setChosen] = useState(new Set()),
      [rows, setRows] = useState([]),
      [selected, setSelected] = useState(null),
      [progress, setProgress] = useState([]),
      [busy, setBusy] = useState(false),
      [error, setError] = useState(''),
      [loading, setLoading] = useState(true);
    const lock = useRef(false),
      draftId = useRef(null);
    const uid = window.auth?.currentUser?.uid;
    const students = (users || []).filter(u => u.role !== 'admin' && !u.isBanned);
    const visible = students.filter(u => (nameOf(u) + ' ' + (u.email || '')).toLowerCase().includes(query.toLowerCase()));
    useEffect(() => {
      if (!uid) return;
      return window.db.collection('lmsAssignments').where('createdBy', '==', uid).onSnapshot(s => {
        setRows(s.docs.map(d => ({
          id: d.id,
          ...d.data()
        })).sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0)));
        setLoading(false);
      }, e => {
        setError(errorText(e));
        setLoading(false);
      });
    }, [uid]);
    useEffect(() => {
      setProgress([]);
      if (!selected) return;
      return window.db.collection('lmsAssignments').doc(selected.id).collection('progress').onSnapshot(s => setProgress(s.docs.map(d => ({
        id: d.id,
        ...d.data()
      }))), e => setError(errorText(e)));
    }, [selected?.id]);
    const time = useState(Date.now())[0];
    const [clock, setClock] = useState(time);
    useEffect(() => {
      const t = setInterval(() => setClock(Date.now()), 30000);
      return () => clearInterval(t);
    }, []);
    async function save(e) {
      e.preventDefault();
      if (lock.current) return;
      setError('');
      const ids = [...chosen];
      const deadline = new Date(due).getTime();
      if (!title.trim() || text.trim().length < 20 || text.trim().length > 1800 || !ids.length || ids.length > 100 || !Number.isFinite(deadline) || deadline <= Date.now() || accuracy < 50 || accuracy > 100) {
        setError('Укажите название, текст 20–1800 символов, 1–100 учеников, точность 50–100% и будущий срок.');
        return;
      }
      lock.current = true;
      setBusy(true);
      const db = window.db,
        actor = uid;
      const ref = draftId.current ? db.collection('lmsAssignments').doc(draftId.current) : db.collection('lmsAssignments').doc();
      draftId.current = ref.id;
      try {
        await db.runTransaction(async tx => {
          const admin = await tx.get(db.collection('users').doc(actor));
          const existing = await tx.get(ref);
          const profiles = await Promise.all(ids.map(id => tx.get(db.collection('users').doc(id))));
          if (window.auth?.currentUser?.uid !== actor || admin.data()?.role !== 'admin' || admin.data()?.isBanned) throw Error('Права администратора не подтверждены.');
          if (existing.exists) {
            if (existing.data().createdBy !== actor) throw Error('Конфликт задания.');
            return;
          }
          if (profiles.some(p => !p.exists || p.data().isBanned || p.data().role === 'admin' || Array.isArray(p.data().allowedModules) && !p.data().allowedModules.includes('typing'))) throw Error('У части выбранных учеников нет доступа к печати. Обновите выбор.');
          const payload = {
            version: 1,
            title: title.trim(),
            module: 'typing',
            text: text.trim().normalize('NFC'),
            lang,
            minAccuracy: Number(accuracy),
            dueAt: window.firebase.firestore.Timestamp.fromMillis(deadline),
            studentIds: ids,
            studentNames: Object.fromEntries(ids.map(id => [id, nameOf(students.find(u => u.id === id) || {
              id
            })])),
            createdBy: actor,
            createdAt: window.firebase.firestore.FieldValue.serverTimestamp(),
            status: 'assigned'
          };
          tx.set(ref, payload);
        });
        setTitle('');
        setText('');
        setChosen(new Set());
        draftId.current = null;
        setCreating(false);
      } catch (e) {
        setError(errorText(e));
      } finally {
        lock.current = false;
        setBusy(false);
      }
    }
    function state(p) {
      if (p?.status === 'completed') return 'Выполнено';
      if (p?.needsHelp) return 'Нужна помощь';
      if ((selected?.dueAt?.toMillis?.() || Infinity) < clock) return 'Просрочено';
      return p?.status === 'started' ? 'В процессе' : 'Не начато';
    }
    return /*#__PURE__*/React.createElement("section", {
      className: "ad-task"
    }, /*#__PURE__*/React.createElement("style", null, ASSIGNMENT_CSS), /*#__PURE__*/React.createElement("div", {
      className: "av-heading"
    }, /*#__PURE__*/React.createElement("h3", null, "Назначение заданий"), /*#__PURE__*/React.createElement("p", null, "Один текст, понятная цель и общий срок.")), /*#__PURE__*/React.createElement("div", {
      className: "ad-task-notice"
    }, "Ученики увидят задания на главной странице. Результаты обновляются после завершения назначенного текста."), error && /*#__PURE__*/React.createElement("p", {
      className: "adm-error",
      role: "alert"
    }, error), /*#__PURE__*/React.createElement("div", {
      className: "ad-task-toolbar"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("b", null, "Задания и результаты"), /*#__PURE__*/React.createElement("small", null, rows.length, " заданий · обновление в реальном времени")), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "adm-btn primary",
      onClick: () => setCreating(true)
    }, /*#__PURE__*/React.createElement(AdminIcon, {
      name: "plus",
      size: 16
    }), "Создать задание")), /*#__PURE__*/React.createElement("div", {
      className: "ad-task-grid"
    }, ReactDOM.createPortal(/*#__PURE__*/React.createElement("dialog", {
      ref: formDialog,
      className: "ad-task-dialog adm-root",
      onCancel: e => {
        e.preventDefault();
        if (!busy) setCreating(false);
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "ad-task-dialog-head"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "НОВОЕ ЗАДАНИЕ"), /*#__PURE__*/React.createElement("h3", null, "Настрой учебную цель")), /*#__PURE__*/React.createElement("button", {
      type: "button",
      disabled: busy,
      "aria-label": "Закрыть форму",
      onClick: () => setCreating(false)
    }, "×")), error && /*#__PURE__*/React.createElement("p", {
      className: "adm-error",
      role: "alert"
    }, error), /*#__PURE__*/React.createElement("form", {
      className: "av-card ad-task",
      onSubmit: save
    }, /*#__PURE__*/React.createElement("fieldset", {
      disabled: busy
    }, /*#__PURE__*/React.createElement("label", null, "Название", /*#__PURE__*/React.createElement("input", {
      className: "adm-input",
      value: title,
      maxLength: 120,
      required: true,
      onChange: e => setTitle(e.target.value),
      placeholder: "Например: точная печать — урок 1"
    })), /*#__PURE__*/React.createElement("div", {
      className: "ad-task-pair"
    }, /*#__PURE__*/React.createElement("label", null, "Раздел", /*#__PURE__*/React.createElement("select", {
      className: "adm-input",
      value: "typing",
      readOnly: true
    }, /*#__PURE__*/React.createElement("option", {
      value: "typing"
    }, "Тренажёр печати"))), /*#__PURE__*/React.createElement("label", null, "Язык", /*#__PURE__*/React.createElement("select", {
      className: "adm-input",
      value: lang,
      onChange: e => setLang(e.target.value)
    }, /*#__PURE__*/React.createElement("option", {
      value: "ru"
    }, "Русский"), /*#__PURE__*/React.createElement("option", {
      value: "en"
    }, "English")))), /*#__PURE__*/React.createElement("label", null, "Текст задания", /*#__PURE__*/React.createElement("textarea", {
      className: "adm-input",
      value: text,
      onChange: e => setText(e.target.value),
      minLength: 20,
      maxLength: 1800,
      required: true,
      rows: 5,
      placeholder: "Текст, который должны набрать ученики"
    })), /*#__PURE__*/React.createElement("div", {
      className: "ad-task-pair"
    }, /*#__PURE__*/React.createElement("label", null, "Точность, не ниже %", /*#__PURE__*/React.createElement("input", {
      className: "adm-input",
      type: "number",
      min: "50",
      max: "100",
      value: accuracy,
      onChange: e => setAccuracy(Number(e.target.value))
    })), /*#__PURE__*/React.createElement("label", null, "Срок — ваше местное время", /*#__PURE__*/React.createElement("input", {
      className: "adm-input",
      type: "datetime-local",
      required: true,
      value: due,
      onChange: e => setDue(e.target.value)
    }))), /*#__PURE__*/React.createElement("div", {
      className: "ad-task-line"
    }, /*#__PURE__*/React.createElement("b", null, "Получатели · ", chosen.size), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "adm-btn",
      onClick: () => setChosen(new Set())
    }, "Снять выбор")), /*#__PURE__*/React.createElement("input", {
      className: "adm-input",
      "aria-label": "Поиск ученика",
      placeholder: "Найти ученика",
      value: query,
      onChange: e => setQuery(e.target.value)
    }), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "adm-btn",
      onClick: () => setChosen(v => new Set([...v, ...visible.map(u => u.id)].slice(0, 100)))
    }, "Выбрать найденных (до 100)"), /*#__PURE__*/React.createElement("div", {
      className: "ad-task-people"
    }, users === null ? 'Загружаем учеников…' : !visible.length ? 'Ученики не найдены' : visible.map(u => /*#__PURE__*/React.createElement("label", {
      key: u.id
    }, /*#__PURE__*/React.createElement("input", {
      type: "checkbox",
      checked: chosen.has(u.id),
      onChange: () => setChosen(v => {
        const n = new Set(v);
        n.has(u.id) ? n.delete(u.id) : n.size < 100 && n.add(u.id);
        return n;
      })
    }), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("b", null, nameOf(u)), /*#__PURE__*/React.createElement("small", null, u.email || u.id))))), /*#__PURE__*/React.createElement("button", {
      type: "submit",
      className: "adm-btn primary"
    }, busy ? 'Сохраняем…' : 'Сохранить задание')))), document.body), /*#__PURE__*/React.createElement("div", {
      className: "av-card"
    }, /*#__PURE__*/React.createElement("h3", null, "Назначенные задания"), loading ? /*#__PURE__*/React.createElement("p", null, "Загружаем…") : !rows.length ? /*#__PURE__*/React.createElement("div", {
      className: "ad-task-empty"
    }, /*#__PURE__*/React.createElement(AdminIcon, {
      name: "fileText",
      size: 32
    }), /*#__PURE__*/React.createElement("h3", null, "Начните с одного задания"), /*#__PURE__*/React.createElement("p", null, "Выберите учеников, задайте текст и срок.", /*#__PURE__*/React.createElement("br", null), "Здесь появятся их результаты и запросы помощи."), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "adm-btn primary",
      onClick: () => setCreating(true)
    }, "Создать первое задание")) : /*#__PURE__*/React.createElement("div", {
      className: "ad-task-list"
    }, rows.map(r => /*#__PURE__*/React.createElement("button", {
      type: "button",
      key: r.id,
      className: selected?.id === r.id ? 'selected' : '',
      onClick: () => setSelected(r)
    }, /*#__PURE__*/React.createElement("b", null, r.title), /*#__PURE__*/React.createElement("small", null, r.studentIds?.length || 0, " учеников · ", r.lang?.toUpperCase(), " · ", r.minAccuracy, "%"), /*#__PURE__*/React.createElement("small", null, "До ", r.dueAt?.toDate?.().toLocaleString('ru-RU') || '—')))), selected && /*#__PURE__*/React.createElement("div", {
      className: "ad-task-detail"
    }, /*#__PURE__*/React.createElement("h3", null, selected.title), /*#__PURE__*/React.createElement("p", null, "Статусы и результаты обновляются автоматически."), (selected.studentIds || []).map(id => {
      const p = progress.find(x => x.id === id);
      return /*#__PURE__*/React.createElement("div", {
        className: "ad-task-status",
        key: id
      }, /*#__PURE__*/React.createElement("span", null, selected.studentNames?.[id] || id, /*#__PURE__*/React.createElement("small", null, p?.result ? `Точность: ${p.result.accuracy ?? '—'}% · Скорость: ${p.result.wpm ?? '—'} WPM` : '')), /*#__PURE__*/React.createElement("b", null, state(p)));
    })))));
  }
  const ASSIGNMENT_CSS = `.ad-task{min-width:0}.ad-task-grid{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);gap:18px}.ad-task .av-card{min-width:0;padding:22px}.ad-task fieldset{border:0;padding:0;margin:16px 0 0;min-width:0}.ad-task label{display:grid;gap:7px;font-size:12px;margin-bottom:14px}.ad-task .adm-input{width:100%;min-width:0;box-sizing:border-box;margin:0}.ad-task textarea{resize:vertical;line-height:1.6}.ad-task-pair{display:grid;grid-template-columns:1fr 1fr;gap:12px}.ad-task-line{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:12px 0}.ad-task-people{max-height:245px;overflow:auto;scrollbar-width:thin;margin:12px 0 18px}.ad-task-people label{display:flex;align-items:center;gap:10px;padding:10px;border-bottom:1px solid #9988bb22;margin:0}.ad-task-people input{width:16px;height:16px;flex-shrink:0;accent-color:#9876e5}.ad-task small{display:block;opacity:.65;font-size:11px;margin-top:5px;overflow-wrap:anywhere}.ad-task-notice{border:1px solid #aa88ee44;background:#aa88ee0c;padding:13px 16px;border-radius:14px;font-size:12px;line-height:1.6;margin-bottom:18px}.ad-task-list{display:grid;gap:9px;margin-top:16px;max-height:440px;overflow:auto;scrollbar-width:thin}.ad-task-list button{display:block;text-align:left;padding:15px;border:1px solid #9988bb33;border-radius:13px;background:transparent;color:inherit;width:100%;cursor:pointer;transition:background .2s,border-color .2s}.ad-task-list button:hover,.ad-task-list button.selected{background:#aa88ee14;border-color:#aa88ee88}.ad-task-detail{margin-top:20px;padding-top:18px;border-top:1px solid #9988bb33}.ad-task-detail p{font-size:12px;opacity:.7}.ad-task-status{display:flex;justify-content:space-between;gap:12px;padding:13px 0;border-bottom:1px solid #9988bb22;font-size:12px;overflow-wrap:anywhere}.ad-task-status>b{color:#9876e5;flex-shrink:0}.ad-task .adm-btn{min-height:40px;justify-content:center}.ad-task fieldset>.primary{width:100%}@media(max-width:900px){.ad-task-grid{grid-template-columns:1fr}}@media(max-width:480px){.ad-task-pair{grid-template-columns:1fr;gap:0}.ad-task .av-card{padding:16px}.ad-task-status{flex-wrap:wrap}}
.ad-task-grid{grid-template-columns:1fr;align-items:start}.ad-task-toolbar{display:flex;align-items:center;justify-content:space-between;gap:16px;margin:0 0 16px;padding:17px 20px;border:1px solid #a68bd633;border-radius:16px;background:linear-gradient(110deg,#a68bd611,transparent)}.ad-task-toolbar small{margin-top:5px}.ad-task-notice{display:none}.ad-task-list{grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr));max-height:none}.ad-task-empty{display:grid;justify-items:center;gap:12px;padding:40px 18px;text-align:center}.ad-task-empty>svg{color:#a78ade;padding:15px;box-sizing:content-box;border-radius:20px;background:#a78ade14}.ad-task-empty h3{margin:6px 0 0}.ad-task-empty p{line-height:1.8;font-size:12px;opacity:.65;margin:0 0 8px}
.ad-task-dialog{width:min(720px,calc(100vw - 28px));max-width:none;max-height:90dvh;padding:0;border:1px solid #a68bd644;border-radius:22px;background:#191e2e;color:#edf0fa;overflow:auto;scrollbar-width:thin;box-shadow:0 30px 100px #0005;overscroll-behavior:contain}.ad-task-dialog::backdrop{background:#080d1a88;backdrop-filter:blur(6px)}.ad-task-dialog[open]{animation:ad-task-in .25s ease-out}.ad-task-dialog-head{display:flex;justify-content:space-between;align-items:center;gap:15px;padding:22px 24px;border-bottom:1px solid #a68bd633;background:linear-gradient(120deg,#a68bd614,transparent)}.ad-task-dialog-head small{font-size:9px;letter-spacing:1.5px;color:#a78ade}.ad-task-dialog-head h3{font-size:21px;margin:6px 0 0}.ad-task-dialog-head button{display:grid;place-items:center;width:34px;height:34px;min-height:34px;padding:0;border:1px solid #a68bd633;border-radius:10px;background:#a68bd611;color:inherit;font-size:22px;cursor:pointer}.ad-task-dialog .av-card{padding:22px 24px;border:0;background:none}.ad-task-dialog fieldset{margin:0}.ad-task-dialog .adm-input{background:#a68bd608;color:inherit;border:1px solid #a68bd633;border-radius:11px;min-height:42px;padding:11px 13px;font:13px/1.5 inherit}.ad-task-dialog .adm-input:focus{outline:2px solid #a68bd688;outline-offset:1px}.ad-task-dialog label{color:inherit}.ad-task-dialog .adm-btn{display:inline-flex;align-items:center;gap:7px;padding:10px 14px;border:1px solid #a68bd644;border-radius:10px;background:#a68bd60c;color:inherit;font-family:inherit;cursor:pointer}.ad-task-dialog .adm-btn.primary{background:linear-gradient(120deg,#9a75de,#7455bf);color:white;border:0}.ad-task-dialog .ad-task-people{display:grid;grid-template-columns:1fr 1fr;gap:7px;max-height:210px}.ad-task-dialog .ad-task-people label{border:1px solid #a68bd622;border-radius:10px;background:#a68bd606;min-width:0}.ad-task-people label:has(input:checked){background:#a68bd61a;border-color:#a68bd688}.ad-task-dialog .ad-task-people span{min-width:0}.ad-task-dialog .ad-task-people small{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ad-task-dialog .adm-error{margin:15px 24px}
:is(html.light,body.light,.theme-light,[data-theme=light]) .ad-task-dialog{background:#faf9ff;color:#293047}@keyframes ad-task-in{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}@media(max-width:600px){.ad-task-toolbar{align-items:stretch;flex-direction:column}.ad-task-dialog .ad-task-people{grid-template-columns:1fr}.ad-task-dialog .av-card{padding:18px}.ad-task-dialog-head{padding:18px}.ad-task-dialog-head h3{font-size:18px}}@media(prefers-reduced-motion:reduce){.ad-task-dialog[open]{animation:none}}
`;
  function AdminSections({
    children,
    users,
    selectedId,
    selectUser
  }) {
    const h = React.createElement,
      [screen, setScreen] = useState('overview'),
      [visited, setVisited] = useState(new Set(['overview', 'students'])),
      [profile, setProfile] = useState(false);
    const previous = useRef(selectedId);
    useEffect(() => {
      if (selectedId && previous.current !== selectedId) setProfile(true);
      previous.current = selectedId;
    }, [selectedId]);
    const go = id => {
      setScreen(id);
      setVisited(v => new Set([...v, id]));
      setProfile(false);
    };
    const parts = React.Children.toArray(children);
    const names = [['overview', 'Обзор', 'shield'], ['students', 'Ученики', 'users'], ['assignments', 'Задания', 'fileText'], ['diagnostics', 'Диагностика', 'alertTriangle'], ['maintenance', 'Обслуживание', 'settings']];
    const recent = array(users).filter(u => lastActivity(u)).sort((a, b) => lastActivity(b) - lastActivity(a)).slice(0, 5);
    const recentRows = recent.map(u => h('button', {
      type: 'button',
      className: 'av-recent',
      key: u.id,
      onClick: () => {
        go('students');
        selectUser(u.id);
        setProfile(true);
      }
    }, h('span', {
      className: 'adm-avatar'
    }, initials(u)), h('span', null, h('strong', null, nameOf(u)), h(Seen, {
      user: u,
      now: Date.now()
    })), h('span', {
      'aria-hidden': true
    }, '→')));
    const tools = [['diagnostics', 'alertTriangle', 'Диагностика', 'Сбои платформы и повторяющиеся ошибки'], ['maintenance', 'settings', 'Обслуживание данных', 'История, активность, шахматы и TypeDrive']].map(([id, icon, title, desc]) => h('button', {
      type: 'button',
      className: 'av-shortcut',
      key: id,
      onClick: () => go(id)
    }, h('span', {
      className: 'av-icon'
    }, h(AdminIcon, {
      name: icon,
      size: 21
    })), h('span', null, h('strong', null, title), h('small', null, desc)), h('span', {
      'aria-hidden': true
    }, '→')));
    const welcome = h('div', {
      className: 'av-welcome'
    }, h('div', null, h('span', {
      className: 'av-kicker'
    }, 'УЧЕБНОЕ ПРОСТРАНСТВО'), h('h3', null, 'Всё важное — под рукой'), h('p', null, 'Ученики, доступы и состояние платформы в одном месте.'), h('button', {
      type: 'button',
      className: 'adm-btn primary',
      onClick: () => go('students')
    }, h(AdminIcon, {
      name: 'users',
      size: 18
    }), 'Открыть учеников')), h('div', {
      className: 'av-orbit',
      'aria-hidden': true
    }, h('i'), h('i'), h('span', null, h(AdminIcon, {
      name: 'shield',
      size: 36
    }))));
    const overview = h('section', {
      className: 'av-scene',
      hidden: screen !== 'overview'
    }, welcome, parts[2], h('div', {
      className: 'av-grid'
    }, h('section', {
      className: 'av-card'
    }, h('div', {
      className: 'av-card-head'
    }, h('h3', null, 'Недавняя активность'), h('small', null, 'Последние посещения')), users === null ? h('div', {
      className: 'av-skeleton',
      'aria-label': 'Загрузка'
    }) : recent.length ? recentRows : h('p', {
      className: 'av-muted'
    }, 'Здесь появятся последние посещения учеников.')), h('section', {
      className: 'av-card'
    }, h('div', {
      className: 'av-card-head'
    }, h('h3', null, 'Инструменты'), h('small', null, 'Быстрый доступ')), tools)));
    const students = h('section', {
      className: 'av-scene av-students ' + (profile ? 'profile-open' : ''),
      hidden: screen !== 'students'
    }, h('div', {
      className: 'av-heading'
    }, h('h3', null, 'Ученики и доступы'), h('p', null, 'Выберите ученика, чтобы управлять его обучением.')), h('button', {
      type: 'button',
      className: 'adm-btn av-back',
      onClick: () => setProfile(false)
    }, '← К списку учеников'), h('div', {
      onClickCapture: e => {
        if (e.target.closest('.adm-person')) setProfile(true);
      }
    }, parts[3]));
    return h('div', {
      className: 'av'
    }, h('style', null, ADMIN_NEW_CSS + ADMIN_POLISH_CSS), h('nav', {
      className: 'av-nav',
      'aria-label': 'Разделы админки'
    }, names.map(([id, label, icon]) => h('button', {
      key: id,
      type: 'button',
      className: screen === id ? 'active' : '',
      'aria-current': screen === id ? 'page' : undefined,
      onClick: () => go(id)
    }, h(AdminIcon, {
      name: icon,
      size: 18
    }), h('span', null, label)))), h('div', {
      className: 'av-stage'
    }, overview, students, screen === 'assignments' && h(AssignmentDesk, {
      users
    }), visited.has('diagnostics') && h('section', {
      className: 'av-scene',
      hidden: screen !== 'diagnostics'
    }, React.cloneElement(parts[0], {
      embedded: true
    })), visited.has('maintenance') && h('section', {
      className: 'av-scene',
      hidden: screen !== 'maintenance'
    }, React.cloneElement(parts[1], {
      embedded: true
    }))));
  }
  function AdminPanel({
    onKicked
  }) {
    const motionRoot = useRef(null);
    useAdminRipples(motionRoot);
    const [uid, setUid] = useState(window.auth?.currentUser?.uid || null);
    const [authReady, setAuthReady] = useState(!!window.auth?.currentUser || typeof window.auth?.onAuthStateChanged !== 'function');
    const [access, setAccess] = useState({
      state: 'checking',
      uid: null,
      message: ''
    });
    const [retry, setRetry] = useState(0);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const [sort, setSort] = useState('name');
    const [page, setPage] = useState(1);
    const [selectedId, setSelectedId] = useState(null);
    const [pending, setPending] = useState(() => new Set());
    const [confirm, setConfirm] = useState(null);
    const [dialogError, setDialogError] = useState('');
    const [importUid, setImportUid] = useState(null);
    const [toasts, setToasts] = useState([]);
    const alive = useRef(true),
      locks = useRef(new Set()),
      timers = useRef(new Set());
    const actor = useRef(uid),
      accessRef = useRef(access),
      kicked = useRef(null),
      onKickedRef = useRef(onKicked);
    actor.current = uid;
    accessRef.current = access;
    onKickedRef.current = onKicked;
    const ready = access.state === 'ready' && access.uid === uid;
    const directory = useAllUsers(ready, uid, retry);
    const users = directory.rows,
      loadError = directory.error;
    const [now, setNow] = useState(() => Date.now());
    useEffect(() => {
      const timer = setInterval(() => setNow(Date.now()), 60000);
      return () => clearInterval(timer);
    }, []);
    useEffect(() => {
      alive.current = true;
      let style = document.getElementById('ultimate-admin-styles');
      if (!style) {
        style = document.createElement('style');
        style.id = 'ultimate-admin-styles';
        document.head.appendChild(style);
      }
      style.textContent = STYLES;
      return () => {
        alive.current = false;
        timers.current.forEach(clearTimeout);
        timers.current.clear();
      };
    }, []);
    useEffect(() => {
      const auth = window.auth;
      if (!auth) {
        setAccess({
          state: 'error',
          uid: null,
          message: 'Авторизация не подключена. Перезагрузите страницу.'
        });
        return;
      }
      if (typeof auth.onAuthStateChanged === 'function') return auth.onAuthStateChanged(user => {
        if (actor.current !== (user?.uid || null)) directoryCache = null;
        actor.current = user?.uid || null;
        setAuthReady(true);
        setUid(user?.uid || null);
        setConfirm(null);
        setImportUid(null);
      }, () => setAccess({
        state: 'error',
        uid: null,
        message: 'Не удалось проверить авторизацию.'
      }));
    }, [retry]);
    useEffect(() => {
      let live = true;
      if (directoryCache && (directoryCache.uid !== uid || directoryCache.db !== window.db)) directoryCache = null;
      setSelectedId(null);
      if (!window.auth) {
        setAccess({
          state: 'error',
          uid,
          message: 'Авторизация не подключена. Перезагрузите страницу.'
        });
        return;
      }
      if (!authReady) {
        setAccess({
          state: 'checking',
          uid,
          message: ''
        });
        return;
      }
      if (!window.db) {
        setAccess({
          state: 'error',
          uid,
          message: 'База данных не подключена. Перезагрузите страницу.'
        });
        return;
      }
      if (!uid) {
        setAccess({
          state: 'denied',
          uid,
          message: 'Войдите в аккаунт администратора.'
        });
        return;
      }
      setAccess({
        state: 'checking',
        uid,
        message: ''
      });
      const unsubscribe = window.db.collection('users').doc(uid).onSnapshot(snapshot => {
        if (!live) return;
        const user = snapshot.exists ? snapshot.data() : null;
        if (!user || user.role !== 'admin' || user.isBanned) {
          setAccess({
            state: 'denied',
            uid,
            message: user?.isBanned ? 'Аккаунт заблокирован.' : 'Для этой панели нужны права администратора.'
          });
          directoryCache = null;
          setConfirm(null);
          setImportUid(null);
        } else setAccess({
          state: 'ready',
          uid,
          message: ''
        });
      }, error => {
        window.reportLmsError?.(error, {
          "section": "admin",
          "source": "6_admin.js",
          "line": 2481,
          "operation": "snapshot",
          "handled": true
        });
        if (!live) return;
        const denied = String(error.code).includes('permission-denied');
        setAccess({
          state: denied ? 'denied' : 'error',
          uid,
          message: denied ? 'Нет доступа к профилю администратора.' : 'Не удалось проверить права. Проверьте подключение и повторите.'
        });
        directoryCache = null;
        setConfirm(null);
        setImportUid(null);
      });
      return () => {
        live = false;
        unsubscribe();
      };
    }, [uid, retry, authReady]);
    useEffect(() => {
      if (access.state !== 'denied') {
        if (access.state === 'ready') kicked.current = null;
        return;
      }
      const timer = setTimeout(() => {
        if (kicked.current === access.message) return;
        kicked.current = access.message;
        onKickedRef.current?.();
      }, 1400);
      return () => clearTimeout(timer);
    }, [access.state, access.message]);
    useEffect(() => {
      setPage(1);
      setSelectedId(null);
    }, [search, filter, sort]);
    const list = useMemo(() => {
      const q = search.trim().toLocaleLowerCase();
      return array(users).filter(user => (filter !== 'admins' || user.role === 'admin') && (filter !== 'banned' || user.isBanned) && (filter !== 'students' || user.role !== 'admin') && (filter !== 'inactive' || lastActivity(user) != null && now - lastActivity(user) >= 7 * 86400000) && (!q || `${nameOf(user)} ${str(user.email)} ${user.id}`.toLocaleLowerCase().includes(q))).sort((a, b) => {
        if (sort === 'activity') {
          const delta = (lastActivity(b) || 0) - (lastActivity(a) || 0);
          if (delta) return delta;
        }
        if (sort === 'tests') {
          const delta = testsOf(b).length - testsOf(a).length;
          if (delta) return delta;
        }
        if (sort === 'role') {
          const delta = Number(b.role === 'admin') - Number(a.role === 'admin');
          if (delta) return delta;
        }
        return userNameCollator.compare(nameOf(a), nameOf(b)) || a.id.localeCompare(b.id);
      });
    }, [users, search, filter, sort, now]);
    const pageCount = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
    const currentPage = Math.min(page, pageCount);
    const visible = list.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
    const selected = list.find(user => user.id === selectedId) || visible[0] || null;
    const importUser = array(users).find(user => user.id === importUid);
    const stats = useMemo(() => [array(users).length, array(users).filter(user => user.role === 'admin').length, array(users).filter(user => user.isBanned).length, array(users).reduce((sum, user) => sum + testsOf(user).length, 0)], [users]);
    function dismissToast(id) {
      if (!alive.current) return;
      setToasts(previous => previous.map(item => item.id === id ? {
        ...item,
        leaving: true
      } : item));
      const delay = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 0 : 250;
      const timer = setTimeout(() => {
        timers.current.delete(timer);
        if (alive.current) setToasts(previous => previous.filter(item => item.id !== id));
      }, delay);
      timers.current.add(timer);
    }
    function toast(message, type = 'success') {
      if (!alive.current) return;
      const id = `${Date.now()}-${Math.random()}`;
      setToasts(previous => [...previous.slice(-3), {
        id,
        message,
        type
      }]);
      const timer = setTimeout(() => {
        timers.current.delete(timer);
        if (alive.current) dismissToast(id);
      }, 4500);
      timers.current.add(timer);
    }
    // Транзакция читает актуальный профиль и не затирает параллельные изменения.
    // Реальная авторизация должна оставаться в существующих Firestore Rules.
    async function mutate(targetUid, transform, message) {
      const actorUid = actor.current;
      if (!actorUid || accessRef.current.state !== 'ready' || accessRef.current.uid !== actorUid) throw problem('Права администратора не подтверждены.');
      if (locks.current.has(targetUid)) throw problem('Для этого пользователя уже выполняется сохранение.');
      locks.current.add(targetUid);
      setPending(new Set(locks.current));
      try {
        const db = window.db;
        if (!db?.runTransaction) throw problem('Не удалось подключить транзакции Firebase. Проверьте подключение базы данных.');
        const auditId = window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        await db.runTransaction(async transaction => {
          if (!alive.current || actor.current !== actorUid) throw problem('Аккаунт изменился. Откройте панель заново.');
          const selfRef = db.collection('users').doc(actorUid),
            targetRef = db.collection('users').doc(targetUid);
          const selfSnapshot = await transaction.get(selfRef);
          const self = selfSnapshot.exists ? selfSnapshot.data() : null;
          if (!self || self.role !== 'admin' || self.isBanned) throw problem('Права администратора отозваны.');
          const targetSnapshot = targetUid === actorUid ? selfSnapshot : await transaction.get(targetRef);
          if (!targetSnapshot.exists) throw problem('Пользователь уже удалён.');
          const current = targetSnapshot.data();
          const patch = transform(current, actorUid);
          if (!alive.current || actor.current !== actorUid) throw problem('Аккаунт изменился.');
          const changes = auditChanges(current, patch);
          const adminAudit = [...array(current.adminAudit).filter(e => e && typeof e === 'object').slice(-99), {
            id: auditId,
            at: new Date().toISOString(),
            actorUid,
            actorName: nameOf(self).slice(0, 120),
            action: message || 'Настройки изменены',
            changes
          }];
          const updated = {
            ...current,
            ...patch,
            adminAudit
          };
          if (new TextEncoder().encode(JSON.stringify(updated)).length > 850 * 1024) throw problem('Профиль слишком большой. Уменьшите объём назначенных тестов перед сохранением.');
          transaction.update(targetRef, {
            ...patch,
            adminAudit
          });
        });
        if (alive.current && actor.current === actorUid && message) toast(message);
      } finally {
        locks.current.delete(targetUid);
        if (alive.current) setPending(new Set(locks.current));
      }
    }
    function quick(transform, message = 'Настройки сохранены') {
      if (!selected) return;
      mutate(selected.id, transform, message).catch(error => toast(errorText(error), 'error'));
    }
    function ask(kind, parts = []) {
      if (!selected) return;
      if (kind === 'reset' && !parts.length) return;
      const user = selected;
      const names = SUBJECTS.filter(s => parts.includes(s.id)).map(s => s.label).join(', ');
      if (kind !== 'reset' && user.id === actor.current) {
        toast('Собственные права и блокировку изменить нельзя.', 'error');
        return;
      }
      const config = kind === 'role' ? {
        title: user.role === 'admin' ? 'Снять права администратора?' : 'Выдать права администратора?',
        message: `${nameOf(user)} ${user.role === 'admin' ? 'потеряет' : 'получит'} доступ к панели управления.`,
        label: user.role === 'admin' ? 'Снять права' : 'Выдать права',
        danger: true,
        value: user.role !== 'admin',
        expected: user.role
      } : kind === 'ban' ? {
        title: user.isBanned ? 'Снять блокировку?' : 'Заблокировать пользователя?',
        message: `${nameOf(user)} ${user.isBanned ? 'снова получит доступ к платформе.' : 'будет заблокирован на платформе.'}`,
        label: user.isBanned ? 'Разблокировать' : 'Заблокировать',
        danger: !user.isBanned,
        value: !user.isBanned,
        expected: !!user.isBanned
      } : {
        title: 'Сбросить выбранное?',
        message: `У ${nameOf(user)} будет удалено без возможности восстановления: ${names}. Назначенные тесты останутся.`,
        label: 'Сбросить',
        danger: true,
        parts
      };
      setDialogError('');
      setConfirm({
        ...config,
        kind,
        uid: user.id
      });
    }
    async function confirmAction() {
      if (!confirm || locks.current.has(confirm.uid)) return;
      const job = confirm;
      setDialogError('');
      try {
        await mutate(job.uid, (current, actorUid) => {
          if (job.kind === 'role' || job.kind === 'ban') {
            if (job.uid === actorUid) throw problem('Нельзя изменять собственные права или блокировку.');
            if (job.kind === 'role') {
              if (current.role !== job.expected) throw problem('Роль уже изменена другим администратором. Закройте окно и проверьте профиль.');
              return {
                role: job.value ? 'admin' : 'student'
              };
            }
            if (!!current.isBanned !== job.expected) throw problem('Блокировка уже изменена. Закройте окно и проверьте профиль.');
            return {
              isBanned: job.value
            };
          }
          if (job.kind === 'remove') {
            if (current.assignedTests != null && !Array.isArray(current.assignedTests)) throw problem('Список тестов в профиле имеет неверный формат.');
            return {
              assignedTests: array(current.assignedTests).filter(test => test?.id !== job.testId)
            };
          }
          const patch = {};
          if (job.parts.includes('tests')) patch.testHistory = [];
          if (job.parts.includes('excel')) patch.excelProgress = {
            level: 1,
            xp: 0,
            completedLessons: 0,
            streak: 0
          };
          if (job.parts.includes('typing')) patch.typingProgress = {
            maxWpm: 0,
            maxCombo: 0,
            testsCompleted: 0
          };
          if (job.parts.includes('hotkeys')) patch.hotkeyProgress = {
            maxScore: 0,
            totalScore: 0,
            sessionsPlayed: 0,
            history: []
          };
          return patch;
        }, job.kind === 'remove' ? 'Тест удалён' : job.kind === 'reset' ? 'Статистика сброшена' : 'Изменения сохранены');
        if (alive.current) setConfirm(null);
      } catch (error) {
        window.reportLmsError?.(error, {
          "section": "admin",
          "source": "6_admin.js",
          "line": 2703,
          "operation": "caught",
          "handled": true
        });
        if (alive.current) setDialogError(errorText(error));
      }
    }
    async function saveTest(test) {
      const targetUid = importUid,
        actorUid = actor.current;
      // Числовой id сохранён для совместимости с существующим тестовым модулем.
      const id = Date.now() * 1000 + Math.floor(Math.random() * 1000);
      await mutate(targetUid, current => {
        if (current.assignedTests != null && !Array.isArray(current.assignedTests)) throw problem('Список тестов в профиле имеет неверный формат.');
        if (testsOf(current).some(item => item.id === id)) throw problem('Повторите назначение теста.');
        const assignedTests = [...array(current.assignedTests), {
          id,
          title: test.title,
          data: test.data
        }];
        // Консервативный бюджет: вопросы хранятся в одном документе пользователя.
        const bytes = new TextEncoder().encode(JSON.stringify({
          ...current,
          assignedTests
        })).length;
        if (bytes > 700 * 1024) throw problem('Профиль содержит слишком много данных. Удалите ненужные назначенные тесты или уменьшите изображения.');
        return {
          assignedTests
        };
      }, 'Тест назначен');
      if (alive.current && actor.current === actorUid) setImportUid(null);
    }
    const changePage = value => {
      setPage(Math.max(1, Math.min(pageCount, value)));
      setSelectedId(null);
    };
    return /*#__PURE__*/React.createElement("div", {
      className: "adm-root adm-new",
      ref: motionRoot
    }, /*#__PURE__*/React.createElement("div", {
      className: "adm-toasts",
      "aria-live": "polite"
    }, toasts.map(item => /*#__PURE__*/React.createElement("div", {
      key: item.id,
      className: `adm-toast ${item.type} ${item.leaving ? 'leaving' : ''}`
    }, /*#__PURE__*/React.createElement(AdminIcon, {
      name: item.type === 'error' ? 'alertTriangle' : 'checkCircle',
      size: 17
    }), /*#__PURE__*/React.createElement("span", null, item.message), /*#__PURE__*/React.createElement(IconBtn, {
      label: "\u0421\u043A\u0440\u044B\u0442\u044C \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u0435",
      onClick: () => dismissToast(item.id)
    })))), /*#__PURE__*/React.createElement(AdminPresence, {
      immediate: !ready,
      show: !!(ready && confirm)
    }, ready && confirm && /*#__PURE__*/React.createElement(Dialog, {
      title: confirm.title,
      busy: pending.has(confirm.uid),
      onClose: () => setConfirm(null)
    }, /*#__PURE__*/React.createElement("p", null, confirm.message), dialogError && /*#__PURE__*/React.createElement("p", {
      className: "adm-error",
      role: "alert"
    }, dialogError), /*#__PURE__*/React.createElement("div", {
      className: "adm-dialog-actions"
    }, /*#__PURE__*/React.createElement(Btn, {
      disabled: pending.has(confirm.uid),
      onClick: () => setConfirm(null)
    }, "\u041E\u0442\u043C\u0435\u043D\u0430"), /*#__PURE__*/React.createElement(Btn, {
      variant: confirm.danger ? 'danger' : 'primary',
      disabled: pending.has(confirm.uid),
      onClick: confirmAction
    }, pending.has(confirm.uid) ? 'Сохраняем…' : confirm.label)))), /*#__PURE__*/React.createElement(AdminPresence, {
      immediate: !ready,
      show: !!(ready && importUser)
    }, ready && importUser && /*#__PURE__*/React.createElement(ImportDialog, {
      key: importUid,
      user: importUser,
      busy: pending.has(importUid),
      onClose: () => setImportUid(null),
      onSave: saveTest
    })), /*#__PURE__*/React.createElement("main", {
      className: "adm-shell",
      "aria-label": "\u041F\u0430\u043D\u0435\u043B\u044C \u0430\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0442\u043E\u0440\u0430"
    }, /*#__PURE__*/React.createElement("header", {
      className: "adm-head"
    }, /*#__PURE__*/React.createElement("div", {
      className: "adm-brand"
    }, /*#__PURE__*/React.createElement(AdminIcon, {
      name: "shield",
      size: 24
    })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "adm-eyebrow"
    }, "ULTIMATE LMS / ADMIN"), /*#__PURE__*/React.createElement("h2", null, "\u041F\u0430\u043D\u0435\u043B\u044C \u0443\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u044F"), /*#__PURE__*/React.createElement("p", null, "\u041F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u0438, \u0434\u043E\u0441\u0442\u0443\u043F\u044B \u0438 \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442\u044B \u043E\u0431\u0443\u0447\u0435\u043D\u0438\u044F")), ready && !loadError && users && /*#__PURE__*/React.createElement("div", {
      className: "adm-live"
    }, /*#__PURE__*/React.createElement("span", {
      className: "adm-dot"
    }), directory.busy ? 'Обновление…' : 'Автообновление')), !ready ? /*#__PURE__*/React.createElement(Empty, {
      title: access.state === 'checking' ? 'Проверяем права доступа…' : access.state === 'denied' ? 'Доступ ограничен' : 'Не удалось открыть панель'
    }, /*#__PURE__*/React.createElement("p", {
      role: "status"
    }, access.message), access.state === 'error' && /*#__PURE__*/React.createElement(Btn, {
      onClick: () => setRetry(value => value + 1)
    }, "\u041F\u043E\u0432\u0442\u043E\u0440\u0438\u0442\u044C")) : /*#__PURE__*/React.createElement(AdminSections, {
      users,
      selectedId,
      selectUser: setSelectedId,
      key: uid
    }, /*#__PURE__*/React.createElement(window.LmsErrorJournal || (() => null), {
      key: "errors-" + uid
    }), React.createElement(DataMaintenance, {
      key: uid,
      uid: uid,
      users: users
    }), /*#__PURE__*/React.createElement("div", {
      className: "adm-summary"
    }, [['Пользователей', 'users'], ['Администраторов', 'shield'], ['Заблокировано', 'ban'], ['Назначенных тестов', 'fileText']].map(([label, icon], index) => /*#__PURE__*/React.createElement("div", {
      className: "adm-summary-card",
      key: label
    }, /*#__PURE__*/React.createElement("span", null, label), /*#__PURE__*/React.createElement("strong", null, /*#__PURE__*/React.createElement(AdminNumber, {
      value: users === null ? '—' : stats[index]
    })), /*#__PURE__*/React.createElement(AdminIcon, {
      name: icon,
      size: 21
    })))), loadError && users === null ? /*#__PURE__*/React.createElement("div", {
      className: "adm-banner",
      role: "alert"
    }, /*#__PURE__*/React.createElement(AdminIcon, {
      name: "alertTriangle",
      size: 19
    }), /*#__PURE__*/React.createElement("span", null, loadError), /*#__PURE__*/React.createElement(Btn, {
      onClick: () => setRetry(value => value + 1)
    }, "\u041F\u043E\u0432\u0442\u043E\u0440\u0438\u0442\u044C")) : /*#__PURE__*/React.createElement("div", {
      className: "adm-workspace"
    }, /*#__PURE__*/React.createElement("aside", {
      className: "adm-directory",
      "aria-label": "\u0421\u043F\u0438\u0441\u043E\u043A \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u0435\u0439"
    }, /*#__PURE__*/React.createElement("div", {
      className: "adm-section-head"
    }, /*#__PURE__*/React.createElement("h3", null, "\u041F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u0438"), /*#__PURE__*/React.createElement("span", {
      className: "adm-count",
      "aria-live": "polite"
    }, users === null ? 'Загрузка…' : `${list.length} найдено`)), /*#__PURE__*/React.createElement("div", {
      className: "adm-search"
    }, /*#__PURE__*/React.createElement(AdminIcon, {
      name: "search",
      size: 15
    }), /*#__PURE__*/React.createElement("input", {
      className: "adm-input",
      value: search,
      onChange: event => setSearch(event.target.value),
      placeholder: "\u0418\u043C\u044F, email \u0438\u043B\u0438 UID",
      "aria-label": "\u041F\u043E\u0438\u0441\u043A \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u0435\u0439"
    }), search && /*#__PURE__*/React.createElement(IconBtn, {
      label: "\u041E\u0447\u0438\u0441\u0442\u0438\u0442\u044C \u043F\u043E\u0438\u0441\u043A",
      onClick: () => setSearch('')
    })), /*#__PURE__*/React.createElement("div", {
      className: "adm-filter",
      "aria-label": "\u0424\u0438\u043B\u044C\u0442\u0440 \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u0435\u0439"
    }, [['all', 'Все'], ['students', 'Студенты'], ['admins', 'Админы'], ['banned', 'Заблокированы'], ['inactive', 'Не заходили 7 дней']].map(([id, label]) => /*#__PURE__*/React.createElement("button", {
      type: "button",
      key: id,
      className: `adm-chip ${filter === id ? 'active' : ''}`,
      "aria-pressed": filter === id,
      onClick: () => setFilter(id)
    }, label))), /*#__PURE__*/React.createElement("div", {
      className: "adm-sort"
    }, /*#__PURE__*/React.createElement("span", null, "\u0421\u043E\u0440\u0442\u0438\u0440\u043E\u0432\u043A\u0430"), /*#__PURE__*/React.createElement("select", {
      "aria-label": "\u0421\u043E\u0440\u0442\u0438\u0440\u043E\u0432\u043A\u0430 \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u0435\u0439",
      value: sort,
      onChange: event => setSort(event.target.value)
    }, /*#__PURE__*/React.createElement("option", {
      value: "name"
    }, "\u041F\u043E \u0438\u043C\u0435\u043D\u0438"), /*#__PURE__*/React.createElement("option", {
      value: "role"
    }, "\u0410\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0442\u043E\u0440\u044B \u0432\u044B\u0448\u0435"), /*#__PURE__*/React.createElement("option", {
      value: "tests"
    }, "\u0411\u043E\u043B\u044C\u0448\u0435 \u0442\u0435\u0441\u0442\u043E\u0432"), /*#__PURE__*/React.createElement("option", {
      value: "activity"
    }, "\u041F\u043E\u0441\u043B\u0435\u0434\u043D\u044F\u044F \u0430\u043A\u0442\u0438\u0432\u043D\u043E\u0441\u0442\u044C"))), /*#__PURE__*/React.createElement("div", {
      className: "adm-users"
    }, users === null ? /*#__PURE__*/React.createElement("div", {
      role: "status",
      "aria-label": "\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430 \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u0435\u0439"
    }, [0, 1, 2, 3].map(i => /*#__PURE__*/React.createElement("div", {
      key: i,
      className: "adm-skeleton"
    }))) : !visible.length ? /*#__PURE__*/React.createElement(Empty, {
      compact: true,
      title: users.length ? 'Никого не нашли' : 'Пока нет пользователей'
    }, users.length ? 'Измените поиск или фильтр.' : 'Здесь появятся зарегистрированные пользователи.') : visible.map((user, index) => /*#__PURE__*/React.createElement("button", {
      style: {
        '--ad-order': index
      },
      type: "button",
      key: user.id,
      className: `adm-person ${selected?.id === user.id ? 'selected' : ''}`,
      "aria-pressed": selected?.id === user.id,
      onClick: () => setSelectedId(user.id)
    }, /*#__PURE__*/React.createElement("span", {
      className: "adm-avatar"
    }, initials(user)), /*#__PURE__*/React.createElement("span", {
      className: "adm-person-text"
    }, /*#__PURE__*/React.createElement("strong", null, nameOf(user), user.id === uid ? ' · Вы' : ''), /*#__PURE__*/React.createElement("small", null, str(user.email) || user.id), /*#__PURE__*/React.createElement(Seen, {
      user: user,
      now: now
    })), user.role === 'admin' && /*#__PURE__*/React.createElement(AdminIcon, {
      name: "shield",
      size: 13
    }), /*#__PURE__*/React.createElement("span", {
      className: `adm-role-dot ${user.isBanned ? 'banned' : ''}`,
      title: user.isBanned ? 'Заблокирован' : 'Не заблокирован'
    })))), list.length > PAGE_SIZE && /*#__PURE__*/React.createElement("nav", {
      className: "adm-pagination",
      "aria-label": "\u0421\u0442\u0440\u0430\u043D\u0438\u0446\u044B \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u0435\u0439"
    }, /*#__PURE__*/React.createElement(Btn, {
      disabled: currentPage === 1,
      onClick: () => changePage(currentPage - 1)
    }, "\u041D\u0430\u0437\u0430\u0434"), /*#__PURE__*/React.createElement("span", null, currentPage, " / ", pageCount), /*#__PURE__*/React.createElement(Btn, {
      disabled: currentPage === pageCount,
      onClick: () => changePage(currentPage + 1)
    }, "\u0414\u0430\u043B\u0435\u0435"))), selected ? /*#__PURE__*/React.createElement(UserDetails, {
      key: selected.id,
      user: selected,
      allUsers: array(users),
      now: now,
      self: selected.id === uid,
      busy: pending.has(selected.id),
      onAction: ask,
      onExport: async parts => {
        try {
          const exportUid = actor.current;
          await exportUser(selected, parts, array(users));
          if (alive.current && exportUid === actor.current) toast('Отчёт Excel готов');
        } catch (error) {
          window.reportLmsError?.(error, {
            "section": "admin",
            "source": "6_admin.js",
            "line": 2925,
            "operation": "caught",
            "handled": true
          });
          toast(errorText(error), 'error');
        }
      },
      onModule: (moduleId, enabled) => quick(current => {
        const modules = modulesOf(current);
        return {
          allowedModules: enabled ? [...new Set([...modules, moduleId])] : modules.filter(id => id !== moduleId)
        };
      }),
      onHints: enabled => quick(() => ({
        excelHintsEnabled: enabled
      })),
      onHotkeyHints: enabled => quick(() => ({
        hotkeyHintsEnabled: enabled
      }), 'Настройка подсказок сохранена'),
      onChatMode: mode => quick(() => ({
        chatContactMode: mode
      }), 'Настройки чата сохранены'),
      onChatUser: (contactUid, enabled) => quick(current => {
        const currentAllowed = chatAllowedOf(current);
        return {
          chatContactMode: 'selected',
          chatAllowedUsers: enabled ? [...new Set([...currentAllowed, contactUid])] : currentAllowed.filter(id => id !== contactUid)
        };
      }, 'Контакты чата обновлены'),
      onImport: () => setImportUid(selected.id),
      onRemove: test => {
        setDialogError('');
        setConfirm({
          kind: 'remove',
          uid: selected.id,
          testId: test.id,
          title: 'Удалить назначенный тест?',
          message: `«${str(test.title) || 'Без названия'}» будет удалён у ${nameOf(selected)}.`,
          label: 'Удалить тест',
          danger: true
        });
      }
    }) : /*#__PURE__*/React.createElement(Empty, {
      title: users === null ? 'Загружаем профили…' : 'Выберите пользователя'
    }, "\u0417\u0434\u0435\u0441\u044C \u0431\u0443\u0434\u0443\u0442 \u0434\u043E\u0441\u0442\u0443\u043F\u044B, \u0442\u0435\u0441\u0442\u044B, \u0447\u0430\u0442 \u0438 \u0441\u0442\u0430\u0442\u0438\u0441\u0442\u0438\u043A\u0430."))), /*#__PURE__*/React.createElement("footer", {
      className: "adm-footer"
    }, /*#__PURE__*/React.createElement("span", null, "Ultimate LMS"), /*#__PURE__*/React.createElement("span", null, "\u0418\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u044F \u0441\u043E\u0445\u0440\u0430\u043D\u044F\u044E\u0442\u0441\u044F \u043E\u0442\u0434\u0435\u043B\u044C\u043D\u043E \u0434\u043B\u044F \u043A\u0430\u0436\u0434\u043E\u0433\u043E \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F"))));
  }
  Object.assign(window, {
    AdminPanel
  });
})();
