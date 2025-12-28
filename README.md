# Test LMS
# Ultimate LMS: Exam Mode

Легковесная клиентская платформа для проведения тестирования и аналитики. Приложение реализовано на **React 18** (через CDN) с использованием ES6+ модулей, без необходимости сборки (Webpack/Vite).

## Технический стек

* **Core:** React 18, ReactDOM 18 (UMD)
* **UI/Animations:** Framer Motion, CSS Variables (Glassmorphism)
* **Math Rendering:** MathJax (LaTeX support)
* **Analytics:** Chart.js
* **Security:** Canvas Fingerprinting (Session validation)

## Функциональность

* **Exam System:** Таймер, рандомизация вопросов/ответов, навигация по вопросам.
* **Data Handling:** Импорт тестов через JSON, локальное сохранение (LocalStorage).
* **UX:** Адаптивный дизайн, переключение тем (Dark/Light), анимации переходов.
* **Analytics:** Визуализация результатов, история прохождения, режим работы над ошибками.

## Структура проекта

```text
.
├── index.html    # Entry point & CDN dependencies
├── app.js        # Application logic (React components & State)
├── styles.css    # Global styles & Animations
└── README.md     # Documentation
