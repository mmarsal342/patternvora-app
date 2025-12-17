/**
 * Seasonal Shapes - SVG Generation
 * Converts seasonal shapes to SVG path strings
 */

import { SEASONAL_SHAPES } from './types';

type SeasonalShapeType = typeof SEASONAL_SHAPES[number];

// Helper to adjust color brightness
const adjustColorBrightness = (hex: string, amount: number): string => {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, Math.max(0, ((num >> 16) & 0xff) + amount));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amount));
    const b = Math.min(255, Math.max(0, (num & 0xff) + amount));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
};

// ============ CHRISTMAS SHAPES ============

const svgSnowflake = (size: number, color: string): string => {
    const r = size / 2;
    const strokeWidth = Math.max(2, size / 12);
    let paths = '';

    for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const endX = cos * r * 0.8;
        const endY = sin * r * 0.8;

        paths += `<line x1="0" y1="0" x2="${endX}" y2="${endY}" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round"/>`;

        const branchLen = r * 0.25;
        const branchPos = r * 0.5;
        const branchAngle = Math.PI / 6;
        const bx = cos * branchPos;
        const by = sin * branchPos;

        paths += `<line x1="${bx}" y1="${by}" x2="${bx + Math.cos(angle + branchAngle) * branchLen}" y2="${by + Math.sin(angle + branchAngle) * branchLen}" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round"/>`;
        paths += `<line x1="${bx}" y1="${by}" x2="${bx + Math.cos(angle - branchAngle) * branchLen}" y2="${by + Math.sin(angle - branchAngle) * branchLen}" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round"/>`;
    }

    paths += `<circle cx="0" cy="0" r="${r * 0.1}" fill="${color}"/>`;
    return paths;
};

const svgXmasTree = (size: number, color: string): string => {
    const r = size / 2;
    let svg = '';
    svg += `<polygon points="0,${-r * 0.9} ${r * 0.7},${r * 0.5} ${-r * 0.7},${r * 0.5}" fill="${color}"/>`;
    svg += `<rect x="${-r * 0.15}" y="${r * 0.5}" width="${r * 0.3}" height="${r * 0.35}" fill="${adjustColorBrightness(color, -50)}"/>`;
    svg += `<circle cx="0" cy="${-r * 0.85}" r="${r * 0.12}" fill="#FFD700"/>`;
    return svg;
};

const svgGift = (size: number, color: string): string => {
    const r = size / 2;
    let svg = '';
    svg += `<rect x="${-r * 0.7}" y="${-r * 0.5}" width="${r * 1.4}" height="${r * 1.1}" rx="${r * 0.08}" fill="${color}"/>`;
    svg += `<rect x="${-r * 0.75}" y="${-r * 0.7}" width="${r * 1.5}" height="${r * 0.25}" rx="${r * 0.05}" fill="${adjustColorBrightness(color, -20)}"/>`;
    svg += `<rect x="${-r * 0.1}" y="${-r * 0.7}" width="${r * 0.2}" height="${r * 1.3}" fill="#FFD700"/>`;
    svg += `<rect x="${-r * 0.7}" y="${-r * 0.15}" width="${r * 1.4}" height="${r * 0.2}" fill="#FFD700"/>`;
    return svg;
};

const svgBell = (size: number, color: string): string => {
    const r = size / 2;
    let svg = '';
    svg += `<circle cx="0" cy="${r * 0.25}" r="${r * 0.12}" fill="${adjustColorBrightness(color, -40)}"/>`;
    svg += `<path d="M ${-r * 0.6} ${r * 0.4} Q ${-r * 0.6} ${-r * 0.3} ${-r * 0.2} ${-r * 0.6} Q 0 ${-r * 0.75} ${r * 0.2} ${-r * 0.6} Q ${r * 0.6} ${-r * 0.3} ${r * 0.6} ${r * 0.4} Z" fill="${color}"/>`;
    svg += `<ellipse cx="0" cy="${r * 0.4}" rx="${r * 0.65}" ry="${r * 0.15}" fill="${color}"/>`;
    svg += `<path d="M ${-r * 0.12} ${-r * 0.7} A ${r * 0.12} ${r * 0.12} 0 0 1 ${r * 0.12} ${-r * 0.7}" fill="none" stroke="${color}" stroke-width="${Math.max(2, size / 15)}"/>`;
    return svg;
};

const svgCandycane = (size: number, color: string): string => {
    const r = size / 2;
    const thickness = Math.max(3, size / 6);
    let svg = '';
    svg += `<path d="M ${r * 0.15} ${r * 0.9} L ${r * 0.15} ${-r * 0.2} A ${r * 0.4} ${r * 0.4} 0 0 0 ${-r * 0.65} ${-r * 0.2}" fill="none" stroke="${color}" stroke-width="${thickness}" stroke-linecap="round"/>`;
    return svg;
};

const svgSantaHat = (size: number, color: string): string => {
    const r = size / 2;
    let svg = '';
    svg += `<path d="M ${-r * 0.7} ${r * 0.5} Q ${-r * 0.3} ${-r * 0.2} ${r * 0.5} ${-r * 0.7} Q ${r * 0.6} ${-r * 0.5} ${r * 0.7} ${r * 0.1} L ${r * 0.7} ${r * 0.5} Z" fill="${color}"/>`;
    svg += `<rect x="${-r * 0.75}" y="${r * 0.35}" width="${r * 1.5}" height="${r * 0.25}" rx="${r * 0.1}" fill="#FFFFFF"/>`;
    svg += `<circle cx="${r * 0.55}" cy="${-r * 0.65}" r="${r * 0.2}" fill="#FFFFFF"/>`;
    return svg;
};

// ============ VALENTINE SHAPES ============

const svgHeart = (size: number, color: string): string => {
    const r = size / 2;
    const d = `M 0 ${r * 0.3} 
               C ${-r * 0.5} ${-r * 0.3}, ${-r} ${-r * 0.3}, ${-r} ${r * 0.1}
               C ${-r} ${r * 0.6}, 0 ${r}, 0 ${r}
               C 0 ${r}, ${r} ${r * 0.6}, ${r} ${r * 0.1}
               C ${r} ${-r * 0.3}, ${r * 0.5} ${-r * 0.3}, 0 ${r * 0.3} Z`;
    return `<path d="${d}" fill="${color}"/>`;
};

const svgRose = (size: number, color: string): string => {
    const r = size / 2;
    let svg = '';
    const petalCount = 5;
    for (let i = 0; i < petalCount; i++) {
        const angle = (i / petalCount) * Math.PI * 2;
        const px = Math.cos(angle) * r * 0.35;
        const py = Math.sin(angle) * r * 0.35;
        const rotation = (angle * 180) / Math.PI;
        svg += `<ellipse cx="${px}" cy="${py}" rx="${r * 0.45}" ry="${r * 0.35}" transform="rotate(${rotation} ${px} ${py})" fill="${color}"/>`;
    }
    svg += `<circle cx="0" cy="0" r="${r * 0.25}" fill="${adjustColorBrightness(color, -40)}"/>`;
    return svg;
};

const svgLoveLetter = (size: number, color: string): string => {
    const r = size / 2;
    let svg = '';
    svg += `<rect x="${-r * 0.7}" y="${-r * 0.45}" width="${r * 1.4}" height="${r * 1.0}" rx="${r * 0.05}" fill="${color}"/>`;
    svg += `<polygon points="${-r * 0.7},${-r * 0.45} 0,${r * 0.15} ${r * 0.7},${-r * 0.45}" fill="${adjustColorBrightness(color, -20)}"/>`;
    svg += `<path d="M 0 ${-r * 0.15} C ${-r * 0.12} ${-r * 0.28} ${-r * 0.25} ${-r * 0.18} ${-r * 0.12} ${-r * 0.05} Q ${-r * 0.05} ${r * 0.02} 0 ${r * 0.1} Q ${r * 0.05} ${r * 0.02} ${r * 0.12} ${-r * 0.05} C ${r * 0.25} ${-r * 0.18} ${r * 0.12} ${-r * 0.28} 0 ${-r * 0.15} Z" fill="#E91E63"/>`;
    return svg;
};

const svgRing = (size: number, _color: string): string => {
    const r = size / 2;
    let svg = '';
    svg += `<circle cx="0" cy="${r * 0.2}" r="${r * 0.45}" fill="none" stroke="#FFD700" stroke-width="${Math.max(2, size / 10)}"/>`;
    svg += `<polygon points="${-r * 0.2},${-r * 0.7} ${r * 0.2},${-r * 0.7} ${r * 0.25},${-r * 0.5} 0,${-r * 0.2} ${-r * 0.25},${-r * 0.5}" fill="#87CEEB"/>`;
    return svg;
};

// ============ CNY SHAPES ============

const svgLantern = (size: number, color: string): string => {
    const r = size / 2;
    let svg = '';
    svg += `<ellipse cx="0" cy="0" rx="${r * 0.6}" ry="${r * 0.8}" fill="${color}"/>`;
    svg += `<rect x="${-r * 0.3}" y="${-r * 0.9}" width="${r * 0.6}" height="${r * 0.15}" fill="${adjustColorBrightness(color, -30)}"/>`;
    svg += `<rect x="${-r * 0.3}" y="${r * 0.75}" width="${r * 0.6}" height="${r * 0.15}" fill="${adjustColorBrightness(color, -30)}"/>`;
    svg += `<line x1="0" y1="${r * 0.9}" x2="0" y2="${r}" stroke="${adjustColorBrightness(color, -50)}" stroke-width="2"/>`;
    return svg;
};

const svgDragon = (size: number, color: string): string => {
    const r = size / 2;
    let svg = '';
    svg += `<circle cx="0" cy="0" r="${r * 0.85}" fill="${color}"/>`;
    svg += `<rect x="${-r * 0.25}" y="${-r * 0.25}" width="${r * 0.5}" height="${r * 0.5}" rx="${r * 0.05}" fill="${adjustColorBrightness(color, 40)}"/>`;
    const dotCount = 8;
    const dotRadius = r * 0.08;
    const dotDistance = r * 0.6;
    for (let i = 0; i < dotCount; i++) {
        const angle = (i / dotCount) * Math.PI * 2;
        const x = Math.cos(angle) * dotDistance;
        const y = Math.sin(angle) * dotDistance;
        svg += `<circle cx="${x}" cy="${y}" r="${dotRadius}" fill="${adjustColorBrightness(color, -30)}"/>`;
    }
    return svg;
};

const svgAngpao = (size: number, color: string): string => {
    const w = size * 0.65;
    const h = size * 0.85;
    let svg = '';
    svg += `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="${size * 0.06}" fill="${color}"/>`;
    svg += `<polygon points="${-w / 2},${-h / 2} 0,${-h * 0.05} ${w / 2},${-h / 2}" fill="${adjustColorBrightness(color, -25)}"/>`;
    svg += `<circle cx="0" cy="${h * 0.12}" r="${size * 0.12}" fill="#FFD700"/>`;
    return svg;
};

const svgCloudCN = (size: number, color: string): string => {
    const r = size / 2;
    const d = `M ${-r * 0.7} ${r * 0.1} 
               A ${r * 0.4} ${r * 0.4} 0 0 1 ${-r * 0.45} ${-r * 0.3}
               A ${r * 0.5} ${r * 0.5} 0 0 1 ${r * 0.1} ${-r * 0.4}
               A ${r * 0.35} ${r * 0.35} 0 0 1 ${r * 0.55} ${-r * 0.1}
               Q ${r * 0.3} ${r * 0.4} ${-r * 0.1} ${r * 0.35}
               Q ${-r * 0.5} ${r * 0.35} ${-r * 0.7} ${r * 0.1} Z`;
    return `<path d="${d}" fill="${color}"/>`;
};

const svgFirecracker = (size: number, color: string): string => {
    const w = size * 0.28;
    const h = size * 0.75;
    let svg = '';
    svg += `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="${w * 0.15}" fill="${color}"/>`;
    svg += `<rect x="${-w * 0.6}" y="${-h / 2 - h * 0.02}" width="${w * 1.2}" height="${h * 0.12}" fill="${adjustColorBrightness(color, 40)}"/>`;
    svg += `<rect x="${-w * 0.6}" y="${h / 2 - h * 0.1}" width="${w * 1.2}" height="${h * 0.12}" fill="${adjustColorBrightness(color, 40)}"/>`;
    svg += `<path d="M 0 ${-h / 2} Q ${w * 0.8} ${-h * 0.65} ${w * 0.3} ${-h * 0.8}" fill="none" stroke="${adjustColorBrightness(color, -40)}" stroke-width="${Math.max(1, size / 30)}"/>`;
    svg += `<circle cx="${w * 0.3}" cy="${-h * 0.8}" r="${size * 0.05}" fill="#FFEB3B"/>`;
    return svg;
};

const svgFan = (size: number, color: string): string => {
    const r = size / 2;
    let svg = '';
    svg += `<path d="M 0 ${r * 0.3} L ${Math.cos(Math.PI * 1.2) * r * 0.9} ${r * 0.3 + Math.sin(Math.PI * 1.2) * r * 0.9} A ${r * 0.9} ${r * 0.9} 0 0 1 ${Math.cos(Math.PI * 1.8) * r * 0.9} ${r * 0.3 + Math.sin(Math.PI * 1.8) * r * 0.9} Z" fill="${color}"/>`;
    svg += `<rect x="${-size * 0.04}" y="${r * 0.2}" width="${size * 0.08}" height="${r * 0.5}" fill="${adjustColorBrightness(color, -40)}"/>`;
    const ribCount = 7;
    for (let i = 0; i <= ribCount; i++) {
        const angle = Math.PI * 1.2 + (i / ribCount) * Math.PI * 0.6;
        svg += `<line x1="0" y1="${r * 0.3}" x2="${Math.cos(angle) * r * 0.85}" y2="${r * 0.3 + Math.sin(angle) * r * 0.85}" stroke="${adjustColorBrightness(color, -30)}" stroke-width="${Math.max(1, size / 40)}"/>`;
    }
    return svg;
};

// ============ NEW YEAR SHAPES ============

const svgFirework = (size: number, color: string): string => {
    const r = size / 2;
    let svg = '';
    const rays = 12;

    for (let i = 0; i < rays; i++) {
        const angle = (i / rays) * Math.PI * 2;
        const innerR = r * 0.2;
        const outerR = r * 0.7;
        const x1 = Math.cos(angle) * innerR;
        const y1 = Math.sin(angle) * innerR;
        const x2 = Math.cos(angle) * outerR;
        const y2 = Math.sin(angle) * outerR;

        svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="2" stroke-linecap="round"/>`;
        svg += `<circle cx="${x2}" cy="${y2}" r="${r * 0.05}" fill="${color}"/>`;
    }

    svg += `<circle cx="0" cy="0" r="${r * 0.15}" fill="${color}"/>`;
    return svg;
};

const svgChampagne = (size: number, color: string): string => {
    const r = size / 2;
    let svg = '';
    svg += `<path d="M ${-r * 0.35} ${-r * 0.5} Q ${-r * 0.4} ${r * 0.1} ${-r * 0.08} ${r * 0.2} L ${r * 0.08} ${r * 0.2} Q ${r * 0.4} ${r * 0.1} ${r * 0.35} ${-r * 0.5} Z" fill="${color}"/>`;
    svg += `<rect x="${-r * 0.04}" y="${r * 0.2}" width="${r * 0.08}" height="${r * 0.45}" fill="${color}"/>`;
    svg += `<ellipse cx="0" cy="${r * 0.7}" rx="${r * 0.2}" ry="${r * 0.08}" fill="${color}"/>`;
    svg += `<circle cx="${-r * 0.12}" cy="${-r * 0.2}" r="${r * 0.05}" fill="#FFFFFF" opacity="0.6"/>`;
    svg += `<circle cx="${r * 0.08}" cy="${-r * 0.35}" r="${r * 0.04}" fill="#FFFFFF" opacity="0.6"/>`;
    return svg;
};

const svgClockNY = (size: number, color: string): string => {
    const r = size / 2;
    let svg = '';
    svg += `<circle cx="0" cy="0" r="${r * 0.85}" fill="${color}"/>`;
    svg += `<circle cx="0" cy="0" r="${r * 0.7}" fill="#FFFFFF"/>`;
    for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
        svg += `<line x1="${Math.cos(angle) * r * 0.55}" y1="${Math.sin(angle) * r * 0.55}" x2="${Math.cos(angle) * r * 0.65}" y2="${Math.sin(angle) * r * 0.65}" stroke="${color}" stroke-width="${Math.max(1, size / 25)}"/>`;
    }
    svg += `<line x1="0" y1="0" x2="0" y2="${-r * 0.35}" stroke="${color}" stroke-width="${Math.max(2, size / 12)}" stroke-linecap="round"/>`;
    svg += `<line x1="0" y1="0" x2="0" y2="${-r * 0.5}" stroke="${color}" stroke-width="${Math.max(1, size / 18)}" stroke-linecap="round"/>`;
    return svg;
};

const svgBalloon = (size: number, color: string): string => {
    const r = size / 2;
    let svg = '';
    svg += `<ellipse cx="0" cy="${-r * 0.2}" rx="${r * 0.6}" ry="${r * 0.7}" fill="${color}"/>`;
    svg += `<polygon points="${-r * 0.08},${r * 0.45} ${r * 0.08},${r * 0.45} 0,${r * 0.55}" fill="${adjustColorBrightness(color, -30)}"/>`;
    svg += `<path d="M 0 ${r * 0.55} Q ${r * 0.1} ${r * 0.75} 0 ${r}" fill="none" stroke="#666" stroke-width="1"/>`;
    return svg;
};

const svgPartyHat = (size: number, color: string): string => {
    const r = size / 2;
    let svg = '';
    svg += `<polygon points="0,${-r * 0.8} ${r * 0.55},${r * 0.55} ${-r * 0.55},${r * 0.55}" fill="${color}"/>`;
    svg += `<circle cx="${-r * 0.15}" cy="${r * 0.1}" r="${r * 0.08}" fill="#FFFFFF"/>`;
    svg += `<circle cx="${r * 0.1}" cy="${r * 0.3}" r="${r * 0.07}" fill="#FFFFFF"/>`;
    svg += `<circle cx="${-r * 0.05}" cy="${r * 0.45}" r="${r * 0.06}" fill="#FFFFFF"/>`;
    svg += `<circle cx="0" cy="${-r * 0.8}" r="${r * 0.18}" fill="#FFFFFF"/>`;
    svg += `<ellipse cx="0" cy="${r * 0.55}" rx="${r * 0.55}" ry="${r * 0.08}" fill="${adjustColorBrightness(color, -30)}"/>`;
    return svg;
};

const svgPartyPopper = (size: number, color: string): string => {
    const r = size / 2;
    let svg = '';
    svg += `<polygon points="0,${r * 0.9} ${-r * 0.35},${-r * 0.1} ${r * 0.35},${-r * 0.1}" fill="${color}"/>`;
    svg += `<ellipse cx="0" cy="${-r * 0.1}" rx="${r * 0.38}" ry="${r * 0.1}" fill="${adjustColorBrightness(color, -30)}"/>`;
    const confetti = [
        { x: -r * 0.5, y: -r * 0.5, c: '#FFD700' },
        { x: r * 0.4, y: -r * 0.4, c: '#FF6B6B' },
        { x: -r * 0.2, y: -r * 0.7, c: '#4ECDC4' },
        { x: r * 0.15, y: -r * 0.65, c: '#A855F7' },
    ];
    confetti.forEach(c => {
        svg += `<circle cx="${c.x}" cy="${c.y}" r="${r * 0.06}" fill="${c.c}"/>`;
    });
    return svg;
};

const svgStarburst = (size: number, color: string): string => {
    return svgStar(size, color, 8);
};

const svgStar = (size: number, color: string, points: number = 5): string => {
    const r = size / 2;
    const innerR = r * 0.4;
    let pathPoints = '';

    for (let i = 0; i < points * 2; i++) {
        const radius = i % 2 === 0 ? r : innerR;
        const angle = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        pathPoints += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
    }
    pathPoints += ' Z';

    return `<path d="${pathPoints}" fill="${color}"/>`;
};

// ============ RAMADAN SHAPES ============

const svgCrescent = (size: number, color: string): string => {
    const r = size / 2;
    return `<path d="M 0 ${-r} A ${r} ${r} 0 1 1 0 ${r} A ${r * 0.7} ${r * 0.7} 0 1 0 0 ${-r}" fill="${color}"/>`;
};

const svgMosque = (size: number, color: string): string => {
    const r = size / 2;
    let svg = '';
    svg += `<path d="M ${-r * 0.8} ${r * 0.6} L ${-r * 0.8} ${r * 0.2} L ${-r * 0.6} ${r * 0.2} L ${-r * 0.6} ${-r * 0.3} L ${-r * 0.5} ${-r * 0.45} L ${-r * 0.4} ${-r * 0.3} L ${-r * 0.4} ${r * 0.2} L ${-r * 0.3} ${r * 0.2} A ${r * 0.3} ${r * 0.3} 0 0 1 ${r * 0.3} ${r * 0.2} L ${r * 0.4} ${r * 0.2} L ${r * 0.4} ${-r * 0.3} L ${r * 0.5} ${-r * 0.45} L ${r * 0.6} ${-r * 0.3} L ${r * 0.6} ${r * 0.2} L ${r * 0.8} ${r * 0.2} L ${r * 0.8} ${r * 0.6} Z" fill="${color}"/>`;
    const cSize = r * 0.2;
    const cY = -r * 0.2;
    svg += `<path d="M ${-cSize * 0.3} ${cY - cSize} A ${cSize} ${cSize} 0 1 1 ${-cSize * 0.3} ${cY + cSize} A ${cSize * 0.7} ${cSize * 0.7} 0 1 0 ${-cSize * 0.3} ${cY - cSize}" fill="${color}"/>`;
    return svg;
};

const svgLanternRamadan = (size: number, color: string): string => {
    const r = size / 2;
    let svg = '';
    svg += `<path d="M ${-r * 0.12} ${-r * 0.85} A ${r * 0.12} ${r * 0.12} 0 0 1 ${r * 0.12} ${-r * 0.85}" fill="none" stroke="${color}" stroke-width="${Math.max(1.5, size / 18)}"/>`;
    svg += `<path d="M ${-r * 0.2} ${-r * 0.65} A ${r * 0.2} ${r * 0.2} 0 0 1 ${r * 0.2} ${-r * 0.65} L ${r * 0.2} ${-r * 0.55} L ${-r * 0.2} ${-r * 0.55} Z" fill="${color}"/>`;
    svg += `<path d="M ${-r * 0.2} ${-r * 0.55} C ${-r * 0.5} ${-r * 0.4} ${-r * 0.55} ${r * 0.1} ${-r * 0.35} ${r * 0.45} L ${-r * 0.15} ${r * 0.6} L ${r * 0.15} ${r * 0.6} L ${r * 0.35} ${r * 0.45} C ${r * 0.55} ${r * 0.1} ${r * 0.5} ${-r * 0.4} ${r * 0.2} ${-r * 0.55} Z" fill="${color}"/>`;
    return svg;
};

const svgKetupat = (size: number, color: string): string => {
    const r = size / 2;
    let svg = '';
    svg += `<rect x="${-r * 0.55}" y="${-r * 0.3}" width="${r * 1.1}" height="${r * 0.9}" rx="${r * 0.08}" fill="${color}"/>`;
    svg += `<rect x="${-r * 0.6}" y="${-r * 0.5}" width="${r * 1.2}" height="${r * 0.25}" rx="${r * 0.05}" fill="${adjustColorBrightness(color, 15)}"/>`;
    svg += `<rect x="${-r * 0.1}" y="${-r * 0.5}" width="${r * 0.2}" height="${r * 1.1}" fill="${adjustColorBrightness(color, -30)}"/>`;
    svg += `<ellipse cx="${-r * 0.25}" cy="${-r * 0.6}" rx="${r * 0.18}" ry="${r * 0.12}" transform="rotate(-17 ${-r * 0.25} ${-r * 0.6})" fill="${color}"/>`;
    svg += `<ellipse cx="${r * 0.25}" cy="${-r * 0.6}" rx="${r * 0.18}" ry="${r * 0.12}" transform="rotate(17 ${r * 0.25} ${-r * 0.6})" fill="${color}"/>`;
    svg += `<circle cx="0" cy="${-r * 0.55}" r="${r * 0.1}" fill="${color}"/>`;
    return svg;
};

const svgDates = (size: number, color: string): string => {
    const r = size / 2;
    let svg = '';
    const beadCount = 8;
    const beadRadius = r * 0.12;
    const circleRadius = r * 0.5;

    for (let i = 0; i < beadCount; i++) {
        const angle = (i / beadCount) * Math.PI * 2 - Math.PI / 2;
        const x = Math.cos(angle) * circleRadius;
        const y = Math.sin(angle) * circleRadius;
        svg += `<circle cx="${x}" cy="${y}" r="${beadRadius}" fill="${color}"/>`;
    }

    svg += `<ellipse cx="0" cy="${-r * 0.75}" rx="${beadRadius * 0.8}" ry="${beadRadius * 1.2}" fill="${color}"/>`;
    svg += `<line x1="0" y1="${-r * 0.88}" x2="0" y2="${-r * 0.98}" stroke="${color}" stroke-width="${Math.max(1, size / 30)}"/>`;
    return svg;
};

// ============ MAIN SVG DISPATCHER ============

export const getSeasonalShapeSVG = (
    type: SeasonalShapeType,
    size: number,
    color: string
): string => {
    switch (type) {
        // Christmas
        case 'snowflake': return svgSnowflake(size, color);
        case 'xmas-tree': return svgXmasTree(size, color);
        case 'gift': return svgGift(size, color);
        case 'bell': return svgBell(size, color);
        case 'candycane': return svgCandycane(size, color);
        case 'santa-hat': return svgSantaHat(size, color);

        // Valentine
        case 'heart': return svgHeart(size, color);
        case 'rose': return svgRose(size, color);
        case 'love-letter': return svgLoveLetter(size, color);
        case 'ring': return svgRing(size, color);

        // CNY
        case 'lantern': return svgLantern(size, color);
        case 'dragon': return svgDragon(size, color);
        case 'angpao': return svgAngpao(size, color);
        case 'cloud-cn': return svgCloudCN(size, color);
        case 'firecracker': return svgFirecracker(size, color);
        case 'fan': return svgFan(size, color);

        // New Year
        case 'firework': return svgFirework(size, color);
        case 'champagne': return svgChampagne(size, color);
        case 'clock-ny': return svgClockNY(size, color);
        case 'balloon': return svgBalloon(size, color);
        case 'party-hat': return svgPartyHat(size, color);
        case 'party-popper': return svgPartyPopper(size, color);
        case 'starburst': return svgStarburst(size, color);

        // Ramadan
        case 'crescent': return svgCrescent(size, color);
        case 'star-islamic': return svgStar(size, color, 8);
        case 'mosque': return svgMosque(size, color);
        case 'lantern-ramadan': return svgLanternRamadan(size, color);
        case 'ketupat': return svgKetupat(size, color);
        case 'dates': return svgDates(size, color);

        // Fallback for any unimplemented shapes
        default:
            return `<circle r="${size / 2}" fill="${color}"/>`;
    }
};

// Check if a shape type is seasonal
export const isSeasonalShape = (type: string): boolean => {
    return (SEASONAL_SHAPES as readonly string[]).includes(type);
};

