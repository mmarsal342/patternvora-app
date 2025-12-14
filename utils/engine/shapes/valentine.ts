/**
 * Valentine Shapes
 * Heart, Rose, Love Letter, Ring
 */

import { CanvasContext, adjustColorBrightness } from './helpers';

export const drawHeart = (ctx: CanvasContext, size: number, color: string, stroke: boolean) => {
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    const r = size / 2;
    ctx.lineWidth = Math.max(2, size / 15);

    ctx.beginPath();
    ctx.moveTo(0, r * 0.3);
    ctx.bezierCurveTo(-r * 0.5, -r * 0.3, -r * 0.9, r * 0.1, -r * 0.5, r * 0.5);
    ctx.quadraticCurveTo(-r * 0.2, r * 0.75, 0, r * 0.9);
    ctx.quadraticCurveTo(r * 0.2, r * 0.75, r * 0.5, r * 0.5);
    ctx.bezierCurveTo(r * 0.9, r * 0.1, r * 0.5, -r * 0.3, 0, r * 0.3);
    ctx.closePath();
    stroke ? ctx.stroke() : ctx.fill();

    if (!stroke) {
        ctx.fillStyle = '#FFFFFF';
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.ellipse(-r * 0.25, r * 0.15, r * 0.12, r * 0.18, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
};

export const drawRose = (ctx: CanvasContext, size: number, color: string, stroke: boolean) => {
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    const r = size / 2;
    ctx.lineWidth = Math.max(1, size / 20);

    const petalCount = 5;
    for (let i = 0; i < petalCount; i++) {
        const angle = (i / petalCount) * Math.PI * 2;
        const px = Math.cos(angle) * r * 0.35;
        const py = Math.sin(angle) * r * 0.35;
        ctx.beginPath();
        ctx.ellipse(px, py, r * 0.45, r * 0.35, angle, 0, Math.PI * 2);
        stroke ? ctx.stroke() : ctx.fill();
    }

    if (!stroke) {
        ctx.fillStyle = adjustColorBrightness(color, -40);
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.25, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = adjustColorBrightness(color, -60);
        ctx.lineWidth = Math.max(1, size / 25);
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.12, 0, Math.PI * 1.5);
        ctx.stroke();
    }
};

export const drawLoveLetter = (ctx: CanvasContext, size: number, color: string, stroke: boolean) => {
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    const r = size / 2;
    ctx.lineWidth = Math.max(1, size / 20);

    ctx.beginPath();
    ctx.roundRect(-r * 0.7, -r * 0.45, r * 1.4, r * 1.0, r * 0.05);
    stroke ? ctx.stroke() : ctx.fill();

    if (!stroke) {
        ctx.fillStyle = adjustColorBrightness(color, -20);
    }
    ctx.beginPath();
    ctx.moveTo(-r * 0.7, -r * 0.45);
    ctx.lineTo(0, r * 0.15);
    ctx.lineTo(r * 0.7, -r * 0.45);
    ctx.closePath();
    stroke ? ctx.stroke() : ctx.fill();

    if (!stroke) {
        ctx.fillStyle = '#E91E63';
        ctx.beginPath();
        ctx.moveTo(0, -r * 0.15);
        ctx.bezierCurveTo(-r * 0.12, -r * 0.28, -r * 0.25, -r * 0.18, -r * 0.12, -r * 0.05);
        ctx.quadraticCurveTo(-r * 0.05, r * 0.02, 0, r * 0.1);
        ctx.quadraticCurveTo(r * 0.05, r * 0.02, r * 0.12, -r * 0.05);
        ctx.bezierCurveTo(r * 0.25, -r * 0.18, r * 0.12, -r * 0.28, 0, -r * 0.15);
        ctx.fill();
    }
};

export const drawRing = (ctx: CanvasContext, size: number, _color: string, stroke: boolean) => {
    const r = size / 2;

    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = Math.max(2, size / 10);
    ctx.beginPath();
    ctx.arc(0, r * 0.2, r * 0.45, 0, Math.PI * 2);
    ctx.stroke();

    if (!stroke) {
        ctx.fillStyle = '#87CEEB';
        ctx.beginPath();
        ctx.moveTo(-r * 0.2, -r * 0.7);
        ctx.lineTo(r * 0.2, -r * 0.7);
        ctx.lineTo(r * 0.25, -r * 0.5);
        ctx.lineTo(0, -r * 0.2);
        ctx.lineTo(-r * 0.25, -r * 0.5);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.moveTo(-r * 0.12, -r * 0.65);
        ctx.lineTo(r * 0.08, -r * 0.65);
        ctx.lineTo(r * 0.1, -r * 0.5);
        ctx.lineTo(-r * 0.1, -r * 0.5);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;
    }
};
