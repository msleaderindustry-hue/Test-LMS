// --- 15_discord.js ---
const DISCORD_WEBHOOK = 'https://discordwebhook.msleaderindustry.workers.dev';

const sendToDiscord = async (messageText) => {
    try {
        await fetch(DISCORD_WEBHOOK, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: messageText })
        });
    } catch (err) {
        console.error("Ошибка при отправке в Discord:", err);
    }
};

const logVisitor = async () => {
    try {
        const ipReq = await fetch('https://ipapi.co/json/');
        const ipData = await ipReq.json();
        const deviceInfo = navigator.userAgent;

        const mapsLink = ipData.latitude && ipData.longitude 
            ? `https://www.google.com/maps?q=${ipData.latitude},${ipData.longitude}` 
            : null;

        let payload = {
            username: "LMS Spy Monitor", 
            avatar_url: "https://i.imgur.com/4M34hi2.png",
            embeds: [{
                title: "👁️ НОВЫЙ ПОСЕТИТЕЛЬ НА САЙТЕ", 
                color: 16753920,
                fields: [
                    { name: "📍 Локация", value: `${ipData.country_name || 'Скрыто'}, ${ipData.region || 'Скрыто'}, ${ipData.city || 'Скрыто'}`, inline: false },
                    { name: "🗺️ На карте", value: mapsLink ? `[📍 Открыть Google Maps](${mapsLink})` : 'Нет данных', inline: true },
                    { name: "🌐 IP Адрес", value: `\`${ipData.ip || 'Скрыто'}\``, inline: true },
                    { name: "📡 Провайдер", value: `\`${ipData.org || 'Скрыто'}\``, inline: true },
                    { name: "💻 Устройство", value: `\`\`\`${deviceInfo}\`\`\``, inline: false }
                ],
                timestamp: new Date().toISOString()
            }]
        };
        
        let formData = new FormData(); 
        formData.append('payload_json', JSON.stringify(payload));
        await fetch(DISCORD_WEBHOOK, { method: 'POST', body: formData });
    } catch (e) {
        console.error("Ошибка логгера:", e);
    }
};

const captureViolation = async (title, fp, extraFields = []) => {
    let formData = new FormData();
    const isPlanned = title.includes("Плановая");
    let payload = {
        username: "Ultimate LMS Security", avatar_url: "https://i.imgur.com/4M34hi2.png",
        embeds: [{
            title: title, color: isPlanned ? 3447003 : 15158332,
            fields: [...extraFields, { name: "🆔 Fingerprint", value: `\`${fp}\`` }],
            footer: { text: "Monitoring Active" }, timestamp: new Date().toISOString()
        }]
    };

    formData.append('payload_json', JSON.stringify(payload));
    try { await fetch(DISCORD_WEBHOOK, { method: 'POST', body: formData }); } catch(e) {}
};

// НОВАЯ ФУНКЦИЯ ДЛЯ ОТПРАВКИ РЕЗУЛЬТАТОВ ТЕСТА В DISCORD
const sendTestResultToDiscord = async (scoreData, failedQuestions, userEmail, fp) => {
    try {
        let embedFields = [
            { name: "👤 Студент", value: `**${scoreData.student}**`, inline: true },
            { name: "📧 Email", value: `**${userEmail}**`, inline: true },
            { name: "🎯 Результат", value: `\`${scoreData.percent}%\``, inline: true },
            { name: "📚 Тема", value: scoreData.topic, inline: true },
            { name: "📝 Точный счет", value: `${scoreData.score} из ${scoreData.total}`, inline: true },
            { name: "🆔 Fingerprint", value: `\`${fp}\``, inline: false }
        ];

        if (failedQuestions.length > 0) {
            embedFields.push({ name: "▬▬▬ ОШИБКИ ▬▬▬", value: "Список неверных ответов:", inline: false });
            failedQuestions.forEach(q => {
                embedFields.push({
                    name: `❓ ${q.question}`, 
                    value: `❌ Ответил: ${q.userAnsText}\n✅ Правильный: ${q.correctAnsText}`,
                    inline: false
                });
            });
        }

        let payload = {
            username: "System Monitor", avatar_url: "https://i.imgur.com/4M34hi2.png",
            embeds: [{
                title: "📊 Новый результат теста", 
                color: failedQuestions.length > 0 ? 16711680 : 3066993, 
                fields: embedFields,
                timestamp: new Date().toISOString()
            }]
        };

        let formData = new FormData(); 
        formData.append('payload_json', JSON.stringify(payload));
        await fetch(DISCORD_WEBHOOK, { method: 'POST', body: formData });
    } catch (e) {
        console.error("Ошибка при отправке результата в Discord:", e);
    }
};

// Экспортируем все функции наружу
Object.assign(window, { 
    DISCORD_WEBHOOK, sendToDiscord, logVisitor, captureViolation, sendTestResultToDiscord 
});
