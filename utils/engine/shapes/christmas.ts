/**
 * Christmas Shapes
 * Tree, Gift, Snowflake, Bell, Candycane, Santa Hat
 */

import { CanvasContext, adjustColorBrightness } from './helpers';

export const drawXmasTree = (ctx: CanvasContext, size: number, color: string, stroke: boolean) => {
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    const r = size / 2;
    ctx.lineWidth = Math.max(1, size / 20);

    ctx.beginPath();
    ctx.moveTo(0, -r * 0.9);
    ctx.lineTo(r * 0.7, r * 0.5);
    ctx.lineTo(-r * 0.7, r * 0.5);
    ctx.closePath();
    stroke ? ctx.stroke() : ctx.fill();

    if (!stroke) {
        ctx.fillStyle = adjustColorBrightness(color, -50);
    }
    ctx.beginPath();
    ctx.rect(-r * 0.15, r * 0.5, r * 0.3, r * 0.35);
    stroke ? ctx.stroke() : ctx.fill();

    if (!stroke) {
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(0, -r * 0.85, r * 0.12, 0, Math.PI * 2);
        ctx.fill();
    }
};

export const drawGift = (ctx: CanvasContext, size: number, color: string, stroke: boolean) => {
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    const r = size / 2;
    ctx.lineWidth = Math.max(1, size / 20);

    ctx.beginPath();
    ctx.roundRect(-r * 0.7, -r * 0.5, r * 1.4, r * 1.1, r * 0.08);
    stroke ? ctx.stroke() : ctx.fill();

    if (!stroke) {
        ctx.fillStyle = adjustColorBrightness(color, -20);
    }
    ctx.beginPath();
    ctx.roundRect(-r * 0.75, -r * 0.7, r * 1.5, r * 0.25, r * 0.05);
    stroke ? ctx.stroke() : ctx.fill();

    ctx.fillStyle = '#FFD700';
    ctx.strokeStyle = '#FFD700';
    ctx.beginPath();
    ctx.rect(-r * 0.1, -r * 0.7, r * 0.2, r * 1.3);
    stroke ? ctx.stroke() : ctx.fill();

    ctx.beginPath();
    ctx.rect(-r * 0.7, -r * 0.15, r * 1.4, r * 0.2);
    stroke ? ctx.stroke() : ctx.fill();
};

export const drawSnowflake = (ctx: CanvasContext, size: number, color: string, stroke: boolean) => {
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    const r = size / 2;
    ctx.lineWidth = Math.max(2, size / 12);
    ctx.lineCap = 'round';

    for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(angle) * r * 0.8, Math.sin(angle) * r * 0.8);
        ctx.stroke();

        const branchLen = r * 0.25;
        const branchPos = r * 0.5;
        const branchAngle = Math.PI / 6;
        const bx = Math.cos(angle) * branchPos;
        const by = Math.sin(angle) * branchPos;

        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(bx + Math.cos(angle + branchAngle) * branchLen, by + Math.sin(angle + branchAngle) * branchLen);
        ctx.moveTo(bx, by);
        ctx.lineTo(bx + Math.cos(angle - branchAngle) * branchLen, by + Math.sin(angle - branchAngle) * branchLen);
        ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(0, 0, r * 0.1, 0, Math.PI * 2);
    ctx.fill();
};

export const drawBell = (ctx: CanvasContext, size: number, color: string, stroke: boolean) => {
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    const r = size / 2;
    ctx.lineWidth = Math.max(1, size / 20);

    if (!stroke) {
        ctx.fillStyle = adjustColorBrightness(color, -40);
        ctx.beginPath();
        ctx.arc(0, r * 0.25, r * 0.12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = color;
    }

    ctx.beginPath();
    ctx.moveTo(-r * 0.6, r * 0.4);
    ctx.quadraticCurveTo(-r * 0.6, -r * 0.3, -r * 0.2, -r * 0.6);
    ctx.quadraticCurveTo(0, -r * 0.75, r * 0.2, -r * 0.6);
    ctx.quadraticCurveTo(r * 0.6, -r * 0.3, r * 0.6, r * 0.4);
    ctx.lineTo(-r * 0.6, r * 0.4);
    ctx.closePath();
    stroke ? ctx.stroke() : ctx.fill();

    ctx.beginPath();
    ctx.ellipse(0, r * 0.4, r * 0.65, r * 0.15, 0, 0, Math.PI * 2);
    stroke ? ctx.stroke() : ctx.fill();

    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(2, size / 15);
    ctx.beginPath();
    ctx.arc(0, -r * 0.7, r * 0.12, Math.PI, 0);
    ctx.stroke();
};

export const drawCandycane = (ctx: CanvasContext, size: number, color: string, stroke: boolean) => {
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    const r = size / 2;
    const thickness = Math.max(3, size / 6);
    ctx.lineWidth = thickness;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(r * 0.15, r * 0.9);
    ctx.lineTo(r * 0.15, -r * 0.2);
    ctx.arc(-r * 0.25, -r * 0.2, r * 0.4, 0, Math.PI, true);
    ctx.stroke();

    if (!stroke) {
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = thickness * 0.35;
        ctx.lineCap = 'butt';

        const stripeGap = size / 7;
        for (let y = r * 0.85; y > -r * 0.15; y -= stripeGap) {
            ctx.beginPath();
            ctx.moveTo(r * 0.15 - thickness / 2.5, y);
            ctx.lineTo(r * 0.15 + thickness / 2.5, y - stripeGap * 0.6);
            ctx.stroke();
        }

        const hookRadius = r * 0.4;
        const hookCenter = { x: -r * 0.25, y: -r * 0.2 };
        for (let angle = 0.15; angle < Math.PI - 0.1; angle += 0.35) {
            const cx = hookCenter.x + Math.cos(angle) * hookRadius;
            const cy = hookCenter.y - Math.sin(angle) * hookRadius;
            const perpX = Math.sin(angle);
            const perpY = Math.cos(angle);
            const halfWidth = thickness / 2.5;
            ctx.beginPath();
            ctx.moveTo(cx - perpX * halfWidth, cy - perpY * halfWidth);
            ctx.lineTo(cx + perpX * halfWidth, cy + perpY * halfWidth);
            ctx.stroke();
        }
    }
};

export const drawSantaHat = (ctx: CanvasContext, size: number, color: string, stroke: boolean) => {
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    const r = size / 2;
    ctx.lineWidth = Math.max(1, size / 20);

    ctx.beginPath();
    ctx.moveTo(-r * 0.7, r * 0.5);
    ctx.quadraticCurveTo(-r * 0.3, -r * 0.2, r * 0.5, -r * 0.7);
    ctx.quadraticCurveTo(r * 0.6, -r * 0.5, r * 0.7, r * 0.1);
    ctx.lineTo(r * 0.7, r * 0.5);
    ctx.lineTo(-r * 0.7, r * 0.5);
    ctx.closePath();
    stroke ? ctx.stroke() : ctx.fill();

    if (!stroke) {
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.roundRect(-r * 0.75, r * 0.35, r * 1.5, r * 0.25, r * 0.1);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(r * 0.55, -r * 0.65, r * 0.2, 0, Math.PI * 2);
        ctx.fill();
    }
};
