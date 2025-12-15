/**
 * New Year Shapes
 * Firework, Champagne, Clock, Balloon, Party Hat, Party Popper, Starburst
 */

import { CanvasContext, adjustColorBrightness } from './helpers';

export const drawFirework = (ctx: CanvasContext, size: number, color: string, stroke: boolean) => {
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    const r = size / 2;
    ctx.lineWidth = Math.max(2, size / 15);
    ctx.lineCap = 'round';

    const rays = 12;
    for (let i = 0; i < rays; i++) {
        const angle = (i / rays) * Math.PI * 2;
        const innerR = r * 0.15;
        const outerR = r * (0.7 + Math.random() * 0.25);
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle) * innerR, Math.sin(angle) * innerR);
        ctx.lineTo(Math.cos(angle) * outerR, Math.sin(angle) * outerR);
        ctx.stroke();
    }

    if (!stroke) {
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.15, 0, Math.PI * 2);
        ctx.fill();
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2 + Math.PI / 8;
            const dist = r * 0.85;
            ctx.beginPath();
            ctx.arc(Math.cos(angle) * dist, Math.sin(angle) * dist, r * 0.06, 0, Math.PI * 2);
            ctx.fill();
        }
    }
};

export const drawChampagne = (ctx: CanvasContext, size: number, color: string, stroke: boolean) => {
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    const r = size / 2;
    ctx.lineWidth = Math.max(1, size / 20);

    ctx.beginPath();
    ctx.moveTo(-r * 0.35, -r * 0.5);
    ctx.quadraticCurveTo(-r * 0.4, r * 0.1, -r * 0.08, r * 0.2);
    ctx.lineTo(r * 0.08, r * 0.2);
    ctx.quadraticCurveTo(r * 0.4, r * 0.1, r * 0.35, -r * 0.5);
    ctx.lineTo(-r * 0.35, -r * 0.5);
    ctx.closePath();
    stroke ? ctx.stroke() : ctx.fill();

    ctx.beginPath();
    ctx.rect(-r * 0.04, r * 0.2, r * 0.08, r * 0.45);
    stroke ? ctx.stroke() : ctx.fill();

    ctx.beginPath();
    ctx.ellipse(0, r * 0.7, r * 0.2, r * 0.08, 0, 0, Math.PI * 2);
    stroke ? ctx.stroke() : ctx.fill();

    if (!stroke) {
        ctx.fillStyle = '#FFFFFF';
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.arc(-r * 0.12, -r * 0.2, r * 0.05, 0, Math.PI * 2);
        ctx.arc(r * 0.08, -r * 0.35, r * 0.04, 0, Math.PI * 2);
        ctx.arc(-r * 0.05, 0, r * 0.03, 0, Math.PI * 2);
        ctx.arc(r * 0.15, -r * 0.1, r * 0.035, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
};

export const drawClockNY = (ctx: CanvasContext, size: number, color: string, stroke: boolean) => {
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    const r = size / 2;
    ctx.lineWidth = Math.max(2, size / 15);

    ctx.beginPath();
    ctx.arc(0, 0, r * 0.85, 0, Math.PI * 2);
    stroke ? ctx.stroke() : ctx.fill();

    if (!stroke) {
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.7, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(1, size / 25);
    for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle) * r * 0.55, Math.sin(angle) * r * 0.55);
        ctx.lineTo(Math.cos(angle) * r * 0.65, Math.sin(angle) * r * 0.65);
        ctx.stroke();
    }

    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(2, size / 12);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -r * 0.35);
    ctx.stroke();
    ctx.lineWidth = Math.max(1, size / 18);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -r * 0.5);
    ctx.stroke();
};

export const drawBalloon = (ctx: CanvasContext, size: number, color: string, stroke: boolean) => {
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    const r = size / 2;
    ctx.lineWidth = Math.max(1, size / 20);

    ctx.beginPath();
    ctx.ellipse(0, -r * 0.15, r * 0.55, r * 0.7, 0, 0, Math.PI * 2);
    stroke ? ctx.stroke() : ctx.fill();

    ctx.beginPath();
    ctx.moveTo(-r * 0.1, r * 0.5);
    ctx.lineTo(0, r * 0.65);
    ctx.lineTo(r * 0.1, r * 0.5);
    ctx.closePath();
    stroke ? ctx.stroke() : ctx.fill();

    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(1, size / 30);
    ctx.beginPath();
    ctx.moveTo(0, r * 0.65);
    ctx.quadraticCurveTo(r * 0.15, r * 0.8, -r * 0.1, r * 0.95);
    ctx.stroke();

    if (!stroke) {
        ctx.fillStyle = '#FFFFFF';
        ctx.globalAlpha = 0.4;
        ctx.beginPath();
        ctx.ellipse(-r * 0.2, -r * 0.35, r * 0.12, r * 0.2, -0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
};

export const drawPartyHat = (ctx: CanvasContext, size: number, color: string, stroke: boolean) => {
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    const r = size / 2;
    ctx.lineWidth = Math.max(1, size / 20);

    ctx.beginPath();
    ctx.moveTo(0, -r * 0.8);
    ctx.lineTo(r * 0.55, r * 0.55);
    ctx.lineTo(-r * 0.55, r * 0.55);
    ctx.closePath();
    stroke ? ctx.stroke() : ctx.fill();

    if (!stroke) {
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(-r * 0.15, r * 0.1, r * 0.08, 0, Math.PI * 2);
        ctx.arc(r * 0.1, r * 0.3, r * 0.07, 0, Math.PI * 2);
        ctx.arc(-r * 0.05, r * 0.45, r * 0.06, 0, Math.PI * 2);
        ctx.arc(r * 0.2, r * 0.05, r * 0.05, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(0, -r * 0.8, r * 0.18, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = adjustColorBrightness(color, -30);
        ctx.beginPath();
        ctx.ellipse(0, r * 0.55, r * 0.55, r * 0.08, 0, 0, Math.PI * 2);
        ctx.fill();
    }
};

export const drawPartyPopper = (ctx: CanvasContext, size: number, color: string, stroke: boolean) => {
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    const r = size / 2;
    ctx.lineWidth = Math.max(1, size / 20);

    ctx.beginPath();
    ctx.moveTo(0, r * 0.9);
    ctx.lineTo(-r * 0.35, -r * 0.1);
    ctx.lineTo(r * 0.35, -r * 0.1);
    ctx.closePath();
    stroke ? ctx.stroke() : ctx.fill();

    if (!stroke) {
        ctx.fillStyle = adjustColorBrightness(color, -30);
        ctx.beginPath();
        ctx.ellipse(0, -r * 0.1, r * 0.38, r * 0.1, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = Math.max(2, size / 12);
        ctx.lineCap = 'round';
        const burstAngles = [-2.5, -2.0, -1.5, -1.0, -0.5];
        burstAngles.forEach((angle, i) => {
            const len = r * (0.35 + (i % 2) * 0.15);
            ctx.strokeStyle = ['#FFD700', '#FF6B6B', '#4ECDC4', '#A855F7', '#FF6B6B'][i];
            ctx.beginPath();
            ctx.moveTo(0, -r * 0.2);
            ctx.lineTo(Math.cos(angle) * len, -r * 0.2 + Math.sin(angle) * len);
            ctx.stroke();
        });

        const confetti = [
            { x: -r * 0.5, y: -r * 0.5, c: '#FFD700' },
            { x: r * 0.4, y: -r * 0.4, c: '#FF6B6B' },
            { x: -r * 0.2, y: -r * 0.7, c: '#4ECDC4' },
            { x: r * 0.15, y: -r * 0.65, c: '#A855F7' },
            { x: -r * 0.4, y: -r * 0.3, c: '#FFFFFF' },
            { x: r * 0.5, y: -r * 0.6, c: '#FFD700' },
        ];
        confetti.forEach(c => {
            ctx.fillStyle = c.c;
            ctx.beginPath();
            ctx.arc(c.x, c.y, r * 0.06, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = Math.max(1, size / 20);
        ctx.beginPath();
        ctx.moveTo(-r * 0.22, r * 0.35);
        ctx.lineTo(r * 0.22, r * 0.35);
        ctx.stroke();
    }
};

export const drawStarburst = (ctx: CanvasContext, size: number, color: string, stroke: boolean) => {
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    const r = size / 2;
    ctx.lineWidth = Math.max(1, size / 20);

    const points = 8;
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
        const angle = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
        const radius = i % 2 === 0 ? r * 0.9 : r * 0.4;
        if (i === 0) {
            ctx.moveTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
        } else {
            ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
        }
    }
    ctx.closePath();
    stroke ? ctx.stroke() : ctx.fill();

    if (!stroke) {
        ctx.fillStyle = '#FFFFFF';
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
};
