const { useState, useEffect, useRef, useLayoutEffect, memo } = React;
const { motion, AnimatePresence } = window.Motion;

// --- ЛОГИКА DISCORD ---
// Безопасная ссылка на ваш Cloudflare Worker (скрывает реальный токен)
const DISCORD_WEBHOOK = 'https://discordwebhook.msleaderindustry.workers.dev';

// Удобная функция для отправки сообщений в Discord
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


// --- УТИЛИТЫ ---
async function sha256hex(str) {
    const buf = new TextEncoder().encode(str);
    const hashBuf = await crypto.subtle.digest('SHA-256', buf);
    return Array.from(new Uint8Array(hashBuf))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

function canvasFingerprint() {
    try {
        const c = document.createElement('canvas');
        const ctx = c.getContext('2d');
        
        c.width = 200;
        c.height = 50;
        ctx.textBaseline = 'top';
        ctx.font = "16px Arial";
        
        ctx.fillStyle = '#f60';
        ctx.fillRect(125, 1, 62, 20);
        
        ctx.fillStyle = '#069';
        ctx.fillText('test-λ', 2, 2);
        
        ctx.fillStyle = 'rgba(102,204,0,0.7)';
        ctx.fillText('test-λ', 4, 24);
        
        return c.toDataURL();
    } catch (e) {
        return '';
    }
}

async function computeFingerprint() {
    const parts = [
        navigator.userAgent || '',
        navigator.platform || '',
        screen.width + 'x' + screen.height,
        navigator.language || '',
        String(navigator.hardwareConcurrency || ''),
        await sha256hex(canvasFingerprint())
    ];
    return await sha256hex(parts.join('|'));
}

function shuffleArray(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function useMathJax(contentRef, dependencies = []) {
    useLayoutEffect(() => {
        if (window.MathJax && contentRef.current) {
            window.MathJax.typesetPromise([contentRef.current]).catch(err => console.log(err));
        }
    }, dependencies);
}


// --- СВЯЗЬ ФАЙЛОВ ---
Object.assign(window, {
    useState, useEffect, useRef, useLayoutEffect, memo, motion, AnimatePresence,
    DISCORD_WEBHOOK, sendToDiscord, sha256hex, canvasFingerprint, computeFingerprint, shuffleArray, useMathJax
});
