# Ultimate LMS

Учебная платформа с тестами, печатью, сочетаниями клавиш, программированием, карточками, Excel, Word, шахматами, заданиями и чатами. Клиент использует React 18, Firebase Authentication и Firestore. Файлы `1_logic.js` — `20_word.js` подключаются из `index.html`; Excel и Word загружаются по запросу. Общие стили находятся в `styles.css`.

Рабочая страница: [Test-LMS на GitHub Pages](https://msleaderindustry-hue.github.io/Test-LMS/). По уточнению владельца, всего 10 учеников; одновременный вход всех не является обычным режимом.

Обновление `20261119-admin1`: ИИ-чат снова служит учебной поддержке. Планы, предложения ИИ, отчёты, копии и настройки находятся в «Панель администратора → ИИ-управление». Ручное удаление и назначение преподавателя выполняются прямо из админки; удаление сохраняет проверенную копию. Фоновая уборка только предлагает конкретные старые служебные записи и ждёт кнопки владельца в админке. Входы отправляются отдельными уведомлениями Discord, отчёты — оформленными карточками. Пилот, расписание 20:00 ежедневно / воскресенье 20:05 по Ташкенту и бесплатная инфраструктура сохранены.

- [Карта проекта, данные и реализованное поведение](docs/AI_CONTROL_IMPLEMENTATION.md)
- [Бесплатные тарифы и лимиты](docs/FREE_PLAN.md)
- [Развёртывание и проверка на рабочем сайте](docs/DEPLOYMENT.md)

## Локальная проверка

Нужны Node.js 24 или новее, pnpm и Java 21 для эмулятора Firestore. Браузерные проверки используют установленный Chrome; другой Chromium можно указать через `LMS_BROWSER_PATH`.

```sh
pnpm install --frozen-lockfile
pnpm check
pnpm test
pnpm test:rules
pnpm test:browser
pnpm test:runtime
pnpm bench:local
pnpm exec wrangler deploy --dry-run --config wrangler.api.toml
pnpm exec wrangler deploy --dry-run --config wrangler.discord.toml
```

Тесты используют синтетические данные, проект `demo-ultimate-lms` и заглушки внешних сервисов. Они не отправляют сообщения в рабочий Discord и не изменяют производственную базу.

## Структура серверной части

```text
workers/gateway.mjs      # Лёгкий входной Worker, Cron и очередь
workers/runtime.mjs      # Закрытый SQLite Durable Object для Workers Free
workers/api.mjs          # Firebase ID token, права и маршруты API
workers/discord.mjs      # Закрытая отправка через service binding
server/                 # Расчёты, планы, задания, отчёты, очистка, права
server/generated/       # Проверки Word/Excel из существующих тренажёров
lms_api.js              # Авторизованные запросы браузера и события
lms_event_outbox.js      # Очередь событий IndexedDB по UID
lms_control_ui.js        # Панель ИИ-управления, подтверждения, отчёты и копии
firestore.rules         # Раздельный доступ ученика и владельца
firestore.indexes.json   # Индексы новых коллекций
tests/                  # Проверки логики, правил и браузерных сценариев
```

Ключ Gemini, Discord webhook, служебный ключ Firebase и внутренний токен Workers задаются только в серверных секретах. `.dev.vars.example` содержит лишь имена переменных. Публичные настройки Firebase в `index.html` не являются серверным ключом.

После изменения проверок Word/Excel запустите `node scripts/sync-checkers.mjs`; команда `pnpm check` обнаруживает рассинхронизацию. Для выпуска клиента обновите идентификатор в `scripts/version-client.mjs` и выполните этот скрипт.
