/**
 * Ramadan / Eid Shapes
 * Crescent, Islamic Star, Mosque, Lantern (Fanous), Gift Box, Tasbih (Prayer Beads)
 */

import { CanvasContext, adjustColorBrightness } from './helpers';

export const drawCrescent = (ctx: CanvasContext, size: number, color: string, stroke: boolean) => {
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    const r = size / 2;
    ctx.lineWidth = Math.max(2, size / 15);

    ctx.beginPath();
    ctx.arc(0, 0, r * 0.8, 0.4, Math.PI * 2 - 0.4);
    ctx.arc(r * 0.25, 0, r * 0.6, Math.PI * 2 - 0.6, 0.6, true);
    ctx.closePath();
    stroke ? ctx.stroke() : ctx.fill();
};

export const drawStarIslamic = (ctx: CanvasContext, size: number, color: string, stroke: boolean) => {
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    const r = size / 2;
    ctx.lineWidth = Math.max(1.5, size / 18);

    const points = 8;
    const outerRadius = r * 0.9;
    const innerRadius = r * 0.4;

    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = (i * Math.PI) / points - Math.PI / 2;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.closePath();
    stroke ? ctx.stroke() : ctx.fill();
};

export const drawMosque = (ctx: CanvasContext, size: number, color: string, stroke: boolean) => {
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    const r = size / 2;
    ctx.lineWidth = Math.max(1.5, size / 18);

    ctx.beginPath();
    ctx.moveTo(-r * 0.8, r * 0.6);
    ctx.lineTo(-r * 0.8, r * 0.2);
    ctx.lineTo(-r * 0.6, r * 0.2);
    ctx.lineTo(-r * 0.6, -r * 0.3);
    ctx.lineTo(-r * 0.5, -r * 0.45);
    ctx.lineTo(-r * 0.4, -r * 0.3);
    ctx.lineTo(-r * 0.4, r * 0.2);
    ctx.lineTo(-r * 0.3, r * 0.2);
    ctx.arc(0, r * 0.2, r * 0.3, Math.PI, 0, false);
    ctx.lineTo(r * 0.4, r * 0.2);
    ctx.lineTo(r * 0.4, -r * 0.3);
    ctx.lineTo(r * 0.5, -r * 0.45);
    ctx.lineTo(r * 0.6, -r * 0.3);
    ctx.lineTo(r * 0.6, r * 0.2);
    ctx.lineTo(r * 0.8, r * 0.2);
    ctx.lineTo(r * 0.8, r * 0.6);
    ctx.closePath();
    stroke ? ctx.stroke() : ctx.fill();

    // Crescent on top
    const cSize = r * 0.2;
    const cY = -r * 0.2;
    ctx.beginPath();
    ctx.arc(0, cY, cSize, 0.5, Math.PI * 2 - 0.5);
    ctx.arc(cSize * 0.3, cY, cSize * 0.7, Math.PI * 2 - 0.7, 0.7, true);
    ctx.closePath();
    stroke ? ctx.stroke() : ctx.fill();
};

export const drawLanternRamadan = (ctx: CanvasContext, size: number, color: string, stroke: boolean) => {
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    const r = size / 2;
    ctx.lineWidth = Math.max(1.5, size / 18);

    // Handle
    ctx.beginPath();
    ctx.arc(0, -r * 0.85, r * 0.12, Math.PI, 0);
    stroke ? ctx.stroke() : ctx.fill();

    // Cap
    ctx.beginPath();
    ctx.arc(0, -r * 0.65, r * 0.2, Math.PI, 0);
    ctx.lineTo(r * 0.2, -r * 0.55);
    ctx.lineTo(-r * 0.2, -r * 0.55);
    ctx.closePath();
    stroke ? ctx.stroke() : ctx.fill();

    // Body
    ctx.beginPath();
    ctx.moveTo(-r * 0.2, -r * 0.55);
    ctx.bezierCurveTo(-r * 0.5, -r * 0.4, -r * 0.55, r * 0.1, -r * 0.35, r * 0.45);
    ctx.lineTo(-r * 0.15, r * 0.6);
    ctx.lineTo(r * 0.15, r * 0.6);
    ctx.lineTo(r * 0.35, r * 0.45);
    ctx.bezierCurveTo(r * 0.55, r * 0.1, r * 0.5, -r * 0.4, r * 0.2, -r * 0.55);
    ctx.closePath();
    stroke ? ctx.stroke() : ctx.fill();

    if (!stroke) {
        ctx.strokeStyle = adjustColorBrightness(color, -30);
        ctx.lineWidth = Math.max(1, size / 40);
        for (let i = -1; i <= 1; i++) {
            ctx.beginPath();
            ctx.moveTo(i * r * 0.15, -r * 0.5);
            ctx.lineTo(i * r * 0.12, r * 0.5);
            ctx.stroke();
        }
    }
};

export const drawKetupat = (ctx: CanvasContext, size: number, color: string, stroke: boolean) => {
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    const r = size / 2;
    ctx.lineWidth = Math.max(1.5, size / 18);

    // Box
    ctx.beginPath();
    ctx.roundRect(-r * 0.55, -r * 0.3, r * 1.1, r * 0.9, r * 0.08);
    stroke ? ctx.stroke() : ctx.fill();

    // Lid
    if (!stroke) ctx.fillStyle = adjustColorBrightness(color, 15);
    ctx.beginPath();
    ctx.roundRect(-r * 0.6, -r * 0.5, r * 1.2, r * 0.25, r * 0.05);
    stroke ? ctx.stroke() : ctx.fill();

    // Ribbon
    ctx.fillStyle = stroke ? color : adjustColorBrightness(color, -30);
    ctx.strokeStyle = stroke ? color : adjustColorBrightness(color, -30);
    ctx.beginPath();
    ctx.rect(-r * 0.1, -r * 0.5, r * 0.2, r * 1.1);
    stroke ? ctx.stroke() : ctx.fill();

    // Bow
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.ellipse(-r * 0.25, -r * 0.6, r * 0.18, r * 0.12, -0.3, 0, Math.PI * 2);
    stroke ? ctx.stroke() : ctx.fill();
    ctx.beginPath();
    ctx.ellipse(r * 0.25, -r * 0.6, r * 0.18, r * 0.12, 0.3, 0, Math.PI * 2);
    stroke ? ctx.stroke() : ctx.fill();
    ctx.beginPath();
    ctx.arc(0, -r * 0.55, r * 0.1, 0, Math.PI * 2);
    stroke ? ctx.stroke() : ctx.fill();
};

export const drawDates = (ctx: CanvasContext, size: number, color: string, stroke: boolean) => {
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    const r = size / 2;
    ctx.lineWidth = Math.max(1.5, size / 18);

    // Tasbih beads in circle
    const beadCount = 8;
    const beadRadius = r * 0.12;
    const circleRadius = r * 0.5;

    for (let i = 0; i < beadCount; i++) {
        const angle = (i / beadCount) * Math.PI * 2 - Math.PI / 2;
        const x = Math.cos(angle) * circleRadius;
        const y = Math.sin(angle) * circleRadius;
        ctx.beginPath();
        ctx.arc(x, y, beadRadius, 0, Math.PI * 2);
        stroke ? ctx.stroke() : ctx.fill();
    }

    // Imamah bead
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.75, beadRadius * 0.8, beadRadius * 1.2, 0, 0, Math.PI * 2);
    stroke ? ctx.stroke() : ctx.fill();

    // Tassel
    if (!stroke) {
        ctx.beginPath();
        ctx.moveTo(0, -r * 0.88);
        ctx.lineTo(0, -r * 0.98);
        ctx.lineWidth = Math.max(1, size / 30);
        ctx.stroke();
    }
};
