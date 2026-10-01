// --- 15_discord.js ---
// Ultimate LMS — Discord notifications / visitor logger
// IP, геолокация, провайдер и Google Maps сохранены.
//
// Рекомендуемый порядок подключения:
// 1) Firebase / core
// 2) activity_tracker.js
// 3) 15_discord.js
//
// Настоящий Discord webhook/token должен оставаться только внутри Cloudflare Worker.

(function () {
    'use strict';

    // =========================================================
    // CONFIG
    // =========================================================

    const DISCORD_WEBHOOK =
        window.LMSCore?.config?.discordWorker ||
        'https://discordwebhook.msleaderindustry.workers.dev';

    const REQUEST_TIMEOUT = 10000;
    const IP_INFO_URL = 'https://ipapi.co/json/';
    const VISITOR_SESSION_KEY = 'ultimate_lms_visitor_logged_v2';

    const MAX_FIELD_NAME = 250;
    const MAX_FIELD_VALUE = 1000;
    const MAX_CONTENT = 1800;
    const MAX_FAILED_QUESTIONS_IN_DISCORD = 7;

    // =========================================================
    // HELPERS
    // =========================================================

    function cleanText(value, maxLength = MAX_FIELD_VALUE, fallback = 'Нет данных') {
        const text = String(value ?? '').trim();
        if (!text) return fallback;

        const cleaned = text.replace(
            /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g,
            ''
        );

        return cleaned.length > maxLength
            ? cleaned.slice(0, Math.max(0, maxLength - 1)) + '…'
            : cleaned;
    }

    function inlineCode(value, maxLength = 900) {
        const safe = cleanText(value, maxLength).replace(/`/g, "'");
        return `\`${safe}\``;
    }

    function codeBlock(value, maxLength = 900) {
        const safe = cleanText(value, maxLength).replace(/```/g, "'''");
        return `\`\`\`${safe}\`\`\``;
    }

    function safeNumber(value, fallback = 0) {
        const n = Number(value);
        return Number.isFinite(n) ? n : fallback;
    }

    function safePercent(value) {
        return Math.max(
            0,
            Math.min(100, Math.round(safeNumber(value, 0)))
        );
    }

    function safeFields(fields = []) {
        if (!Array.isArray(fields)) return [];

        return fields
            .filter(Boolean)
            .slice(0, 24)
            .map(field => ({
                name: cleanText(field?.name, MAX_FIELD_NAME, 'Поле'),
                value: cleanText(field?.value, MAX_FIELD_VALUE),
                inline: Boolean(field?.inline)
            }));
    }

    // =========================================================
    // ЕДИНАЯ ОТПРАВКА В CLOUDFLARE WORKER
    // =========================================================

    async function postDiscord(payload, options = {}) {
        const controller = new AbortController();

        const timeout = setTimeout(
            () => controller.abort(),
            safeNumber(options.timeout, REQUEST_TIMEOUT)
        );

        try {
            const response = await fetch(DISCORD_WEBHOOK, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                signal: controller.signal,
                body: JSON.stringify({
                    ...payload,

                    // Запрещаем случайные @everyone / @here
                    // из пользовательского текста.
                    allowed_mentions: {
                        parse: []
                    }
                })
            });

            if (!response.ok) {
                let details = '';

                try {
                    details = await response.text();
                } catch (_) {}

                throw new Error(
                    `Discord Worker HTTP ${response.status}` +
                    (details ? `: ${cleanText(details, 300, '')}` : '')
                );
            }

            return {
                ok: true,
                status: response.status
            };
        } catch (error) {
            if (error?.name === 'AbortError') {
                console.error(
                    '[Ultimate LMS Discord] Превышено время ожидания ответа Worker.'
                );

                return {
                    ok: false,
                    error: 'timeout'
                };
            }

            console.error(
                '[Ultimate LMS Discord] Ошибка отправки:',
                error
            );

            return {
                ok: false,
                error
            };
        } finally {
            clearTimeout(timeout);
        }
    }

    // =========================================================
    // ОБЫЧНОЕ СООБЩЕНИЕ
    // =========================================================

    const sendToDiscord = async (messageText) => {
        const message = cleanText(
            messageText,
            MAX_CONTENT,
            'Пустое сообщение'
        );

        return postDiscord({
            content: message
        });
    };

    // =========================================================
    // IP / VISITOR LOGGER
    // IP, город, регион, страна, провайдер и карта СОХРАНЕНЫ.
    // =========================================================

    const logVisitor = async (options = {}) => {
        try {
            // По умолчанию одно уведомление на вкладку/сессию.
            // force:true позволяет отправить повторно вручную.
            if (!options.force) {
                try {
                    if (
                        sessionStorage.getItem(VISITOR_SESSION_KEY) === '1'
                    ) {
                        return {
                            ok: true,
                            skipped: true,
                            reason: 'already-logged'
                        };
                    }
                } catch (_) {}
            }

            const controller = new AbortController();

            const timeout = setTimeout(
                () => controller.abort(),
                REQUEST_TIMEOUT
            );

            let ipData;

            try {
                const ipReq = await fetch(IP_INFO_URL, {
                    method: 'GET',
                    headers: {
                        Accept: 'application/json'
                    },
                    signal: controller.signal,
                    cache: 'no-store'
                });

                if (!ipReq.ok) {
                    throw new Error(
                        `ipapi HTTP ${ipReq.status}`
                    );
                }

                ipData = await ipReq.json();
            } finally {
                clearTimeout(timeout);
            }

            const deviceInfo =
                navigator.userAgent ||
                'Неизвестное устройство';

            const latitude = Number(ipData?.latitude);
            const longitude = Number(ipData?.longitude);

            const hasCoordinates =
                Number.isFinite(latitude) &&
                Number.isFinite(longitude);

            const mapsLink = hasCoordinates
                ? `https://www.google.com/maps?q=${encodeURIComponent(latitude)},${encodeURIComponent(longitude)}`
                : null;

            const currentUser =
                window.auth?.currentUser || null;

            const fields = [
                {
                    name: '📍 Локация',
                    value: cleanText(
                        `${ipData?.country_name || 'Скрыто'}, ${ipData?.region || 'Скрыто'}, ${ipData?.city || 'Скрыто'}`,
                        500
                    ),
                    inline: false
                },
                {
                    name: '🗺️ На карте',
                    value: mapsLink
                        ? `[📍 Открыть Google Maps](${mapsLink})`
                        : 'Нет данных',
                    inline: true
                },
                {
                    name: '🌐 IP Адрес',
                    value: inlineCode(
                        ipData?.ip || 'Скрыто',
                        300
                    ),
                    inline: true
                },
                {
                    name: '📡 Провайдер',
                    value: inlineCode(
                        ipData?.org ||
                        ipData?.asn ||
                        'Скрыто',
                        500
                    ),
                    inline: true
                },
                {
                    name: '💻 Устройство',
                    value: codeBlock(
                        deviceInfo,
                        900
                    ),
                    inline: false
                }
            ];

            // Если пользователь уже вошёл — добавляем имя и email.
            if (currentUser?.email) {
                fields.splice(0, 0, {
                    name: '👤 Пользователь',
                    value: cleanText(
                        currentUser.displayName ||
                        currentUser.email ||
                        'Студент',
                        300
                    ),
                    inline: true
                });

                fields.splice(1, 0, {
                    name: '📧 Email',
                    value: cleanText(
                        currentUser.email,
                        300
                    ),
                    inline: true
                });
            }

            const payload = {
                username: 'LMS Spy Monitor',
                avatar_url: 'https://i.imgur.com/4M34hi2.png',

                embeds: [{
                    title: '👁️ НОВЫЙ ПОСЕТИТЕЛЬ НА САЙТЕ',
                    color: 16753920,
                    fields: safeFields(fields),
                    timestamp: new Date().toISOString()
                }]
            };

            const result = await postDiscord(payload);

            if (result.ok) {
                try {
                    sessionStorage.setItem(
                        VISITOR_SESSION_KEY,
                        '1'
                    );
                } catch (_) {}
            }

            return result;
        } catch (error) {
            console.error(
                '[Ultimate LMS Visitor Logger]',
                error
            );

            return {
                ok: false,
                error
            };
        }
    };

    // =========================================================
    // НАРУШЕНИЯ / СОБЫТИЯ БЕЗОПАСНОСТИ
    // =========================================================

    const captureViolation = async (
        title,
        fp,
        extraFields = []
    ) => {
        try {
            const isPlanned =
                String(title || '').includes('Плановая');

            const fields =
                safeFields(extraFields);

            if (fp) {
                fields.push({
                    name: '🆔 Fingerprint',
                    value: inlineCode(fp, 300),
                    inline: false
                });
            }

            const payload = {
                username: 'Ultimate LMS Security',
                avatar_url: 'https://i.imgur.com/4M34hi2.png',

                embeds: [{
                    title: cleanText(
                        title,
                        250,
                        'Событие безопасности'
                    ),

                    color: isPlanned
                        ? 3447003
                        : 15158332,

                    fields: fields.slice(0, 25),

                    footer: {
                        text: 'Monitoring Active'
                    },

                    timestamp: new Date().toISOString()
                }]
            };

            return await postDiscord(payload);
        } catch (error) {
            console.error(
                '[Ultimate LMS Security]',
                error
            );

            return {
                ok: false,
                error
            };
        }
    };

    // =========================================================
    // РЕЗУЛЬТАТ ТЕСТА
    // =========================================================

    const sendTestResultToDiscord = async (
        scoreData = {},
        failedQuestions = [],
        userEmail = '',
        fp = ''
    ) => {
        try {
            const failed =
                Array.isArray(failedQuestions)
                    ? failedQuestions
                    : [];

            const percent =
                safePercent(scoreData.percent);

            const score =
                safeNumber(scoreData.score);

            const total =
                safeNumber(scoreData.total);

            const embedFields = [
                {
                    name: '👤 Студент',
                    value: `**${cleanText(
                        scoreData.student,
                        300,
                        'Неизвестно'
                    )}**`,
                    inline: true
                },
                {
                    name: '📧 Email',
                    value: `**${cleanText(
                        userEmail,
                        300,
                        'Не указан'
                    )}**`,
                    inline: true
                },
                {
                    name: '🎯 Результат',
                    value: inlineCode(
                        `${percent}%`,
                        100
                    ),
                    inline: true
                },
                {
                    name: '📚 Тема',
                    value: cleanText(
                        scoreData.topic,
                        700,
                        'Без темы'
                    ),
                    inline: true
                },
                {
                    name: '📝 Точный счет',
                    value: `${score} из ${total}`,
                    inline: true
                }
            ];

            if (fp) {
                embedFields.push({
                    name: '🆔 Fingerprint',
                    value: inlineCode(
                        fp,
                        300
                    ),
                    inline: false
                });
            }

            if (failed.length > 0) {
                embedFields.push({
                    name: '▬▬▬ ОШИБКИ ▬▬▬',
                    value:
                        `Всего неверных ответов: **${failed.length}**`,
                    inline: false
                });

                const shownErrors =
                    failed.slice(
                        0,
                        MAX_FAILED_QUESTIONS_IN_DISCORD
                    );

                shownErrors.forEach(
                    (q, index) => {
                        const question = cleanText(
                            q?.question,
                            230,
                            `Вопрос ${index + 1}`
                        );

                        const userAnswer = cleanText(
                            q?.userAnsText,
                            330,
                            'Нет ответа'
                        );

                        const correctAnswer = cleanText(
                            q?.correctAnsText,
                            330,
                            'Не указано'
                        );

                        embedFields.push({
                            name:
                                `❓ ${index + 1}. ${question}`,

                            value:
                                `❌ Ответил: ${userAnswer}\n` +
                                `✅ Правильный: ${correctAnswer}`,

                            inline: false
                        });
                    }
                );

                if (
                    failed.length >
                    shownErrors.length
                ) {
                    embedFields.push({
                        name: '📎 Остальные ошибки',
                        value:
                            `Ещё **${failed.length - shownErrors.length}** ` +
                            'ошибок не показаны в Discord, чтобы сообщение не превысило лимит.',
                        inline: false
                    });
                }
            }

            const payload = {
                username: 'System Monitor',
                avatar_url: 'https://i.imgur.com/4M34hi2.png',

                embeds: [{
                    title: '📊 Новый результат теста',

                    color:
                        failed.length > 0
                            ? 16711680
                            : 3066993,

                    fields:
                        safeFields(embedFields),

                    timestamp:
                        new Date().toISOString()
                }]
            };

            const result =
                await postDiscord(payload);

            // Если activity_tracker.js подключён,
            // сохраняем факт завершения теста.
            if (
                result.ok &&
                typeof window.trackLmsActivity === 'function'
            ) {
                try {
                    await window.trackLmsActivity(
                        'test',
                        'tests',
                        {
                            action: 'completed',
                            label: cleanText(
                                scoreData.topic,
                                200,
                                'Тест'
                            ),
                            details: {
                                score,
                                total,
                                percent,
                                failedCount:
                                    failed.length
                            }
                        }
                    );
                } catch (trackerError) {
                    console.warn(
                        '[Ultimate LMS Tracker]',
                        trackerError
                    );
                }
            }

            return result;
        } catch (error) {
            console.error(
                '[Ultimate LMS Test Result]',
                error
            );

            return {
                ok: false,
                error
            };
        }
    };

    // =========================================================
    // ЭКСПОРТ
    // =========================================================

    Object.assign(window, {
        DISCORD_WEBHOOK,
        sendToDiscord,
        logVisitor,
        captureViolation,
        sendTestResultToDiscord
    });

})();
