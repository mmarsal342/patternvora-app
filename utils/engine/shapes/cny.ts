/**
 * Chinese New Year (CNY) Shapes
 * Lantern, Dragon (coin), Angpao, Cloud, Firecracker, Fan
 */

import { CanvasContext, adjustColorBrightness } from './helpers';

/**
 * Draw a Chinese Lantern - Simple iconic shape
 */
export const drawLantern = (
    ctx: CanvasContext,
    size: number,
    color: string,
    stroke: boolean
) => {
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    const r = size / 2;
    ctx.lineWidth = Math.max(1, size / 20);

    // Main lantern body - simple rounded rectangle
    ctx.beginPath();
    ctx.roundRect(-r * 0.6, -r * 0.7, r * 1.2, r * 1.4, r * 0.3);
    stroke ? ctx.stroke() : ctx.fill();

    // Top cap
    if (!stroke) {
        ctx.fillStyle = adjustColorBrightness(color, -30);
    }
    ctx.beginPath();
    ctx.roundRect(-r * 0.4, -r * 0.85, r * 0.8, r * 0.2, r * 0.05);
    stroke ? ctx.stroke() : ctx.fill();

    // Bottom cap
    ctx.beginPath();
    ctx.roundRect(-r * 0.35, r * 0.65, r * 0.7, r * 0.15, r * 0.05);
    stroke ? ctx.stroke() : ctx.fill();

    // Single tassel line
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, r * 0.8);
    ctx.lineTo(0, r * 1.1);
    ctx.stroke();
};

/**
 * Draw a Dragon - Coin-like circular motif
 */
export const drawDragon = (
    ctx: CanvasContext,
    size: number,
    color: string,
    stroke: boolean
) => {
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    const r = size / 2;
    ctx.lineWidth = Math.max(2, size / 15);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.arc(0, 0, r * 0.85, 0, Math.PI * 2);
    stroke ? ctx.stroke() : ctx.fill();

    if (!stroke) {
        ctx.save();
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.roundRect(-r * 0.25, -r * 0.25, r * 0.5, r * 0.5, r * 0.05);
        ctx.fill();
        ctx.restore();

        ctx.fillStyle = color;
        const dotCount = 8;
        const dotRadius = r * 0.08;
        const dotDistance = r * 0.6;
        for (let i = 0; i < dotCount; i++) {
            const angle = (i / dotCount) * Math.PI * 2;
            const x = Math.cos(angle) * dotDistance;
            const y = Math.sin(angle) * dotDistance;
            ctx.beginPath();
            ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
            ctx.fill();
        }
    }
};

/**
 * Draw an Angpao (Red Envelope)
 */
export const drawAngpao = (
    ctx: CanvasContext,
    size: number,
    color: string,
    stroke: boolean
) => {
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    const w = size * 0.65;
    const h = size * 0.85;
    ctx.lineWidth = Math.max(1, size / 25);

    ctx.beginPath();
    ctx.roundRect(-w / 2, -h / 2, w, h, size * 0.06);
    stroke ? ctx.stroke() : ctx.fill();

    if (!stroke) {
        ctx.fillStyle = adjustColorBrightness(color, -25);
        ctx.beginPath();
        ctx.moveTo(-w / 2, -h / 2);
        ctx.lineTo(0, -h * 0.05);
        ctx.lineTo(w / 2, -h / 2);
        ctx.closePath();
        ctx.fill();
    }

    ctx.fillStyle = '#FFD700';
    ctx.strokeStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(0, h * 0.12, size * 0.12, 0, Math.PI * 2);
    stroke ? ctx.stroke() : ctx.fill();
};

/**
 * Draw a Chinese Cloud
 */
export const drawCloudCN = (
    ctx: CanvasContext,
    size: number,
    color: string,
    stroke: boolean
) => {
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    const r = size / 2;
    ctx.lineWidth = Math.max(1, size / 20);

    ctx.beginPath();
    ctx.arc(-r * 0.45, 0, r * 0.4, Math.PI * 0.7, Math.PI * 1.9);
    ctx.arc(r * 0.1, -r * 0.1, r * 0.5, Math.PI * 1.1, Math.PI * 1.95);
    ctx.arc(r * 0.55, r * 0.05, r * 0.35, Math.PI * 1.2, Math.PI * 0.3);
    ctx.quadraticCurveTo(r * 0.3, r * 0.4, -r * 0.1, r * 0.35);
    ctx.quadraticCurveTo(-r * 0.5, r * 0.35, -r * 0.7, r * 0.1);
    ctx.closePath();
    stroke ? ctx.stroke() : ctx.fill();
};

/**
 * Draw a Firecracker
 */
export const drawFirecracker = (
    ctx: CanvasContext,
    size: number,
    color: string,
    stroke: boolean
) => {
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    const w = size * 0.28;
    const h = size * 0.75;
    ctx.lineWidth = Math.max(1, size / 25);

    ctx.beginPath();
    ctx.roundRect(-w / 2, -h / 2, w, h, w * 0.15);
    stroke ? ctx.stroke() : ctx.fill();

    if (!stroke) {
        ctx.fillStyle = adjustColorBrightness(color, 40);
    }
    ctx.beginPath();
    ctx.rect(-w * 0.6, -h / 2 - h * 0.02, w * 1.2, h * 0.12);
    stroke ? ctx.stroke() : ctx.fill();

    ctx.beginPath();
    ctx.rect(-w * 0.6, h / 2 - h * 0.1, w * 1.2, h * 0.12);
    stroke ? ctx.stroke() : ctx.fill();

    ctx.strokeStyle = adjustColorBrightness(color, -40);
    ctx.lineWidth = Math.max(1, size / 30);
    ctx.beginPath();
    ctx.moveTo(0, -h / 2);
    ctx.quadraticCurveTo(w * 0.8, -h * 0.65, w * 0.3, -h * 0.8);
    ctx.stroke();

    if (!stroke) {
        ctx.fillStyle = '#FFEB3B';
        ctx.beginPath();
        ctx.arc(w * 0.3, -h * 0.8, size * 0.05, 0, Math.PI * 2);
        ctx.fill();
    }
};

/**
 * Draw a Chinese Folding Fan
 */
export const drawFan = (
    ctx: CanvasContext,
    size: number,
    color: string,
    stroke: boolean
) => {
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    const r = size / 2;

    ctx.beginPath();
    ctx.moveTo(0, r * 0.3);
    ctx.arc(0, r * 0.3, r * 0.9, Math.PI * 1.2, Math.PI * 1.8);
    ctx.lineTo(0, r * 0.3);
    ctx.closePath();
    stroke ? ctx.stroke() : ctx.fill();

    ctx.beginPath();
    ctx.rect(-size * 0.04, r * 0.2, size * 0.08, r * 0.5);
    ctx.fill();

    ctx.lineWidth = Math.max(1, size / 40);
    ctx.beginPath();
    const ribCount = 7;
    for (let i = 0; i <= ribCount; i++) {
        const angle = Math.PI * 1.2 + (i / ribCount) * Math.PI * 0.6;
        ctx.moveTo(0, r * 0.3);
        ctx.lineTo(
            Math.cos(angle) * r * 0.85,
            r * 0.3 + Math.sin(angle) * r * 0.85
        );
    }
    ctx.stroke();
};
