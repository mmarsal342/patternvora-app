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

// ============ SVG SHAPE GENERATORS ============

const svgSnowflake = (size: number, color: string): string => {
    const r = size / 2;
    const strokeWidth = Math.max(2, size / 12);
    let paths = '';

    // 6 main arms with branches
    for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const endX = cos * r * 0.8;
        const endY = sin * r * 0.8;

        // Main arm
        paths += `<line x1="0" y1="0" x2="${endX}" y2="${endY}" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round"/>`;

        // Branches
        const branchLen = r * 0.25;
        const branchPos = r * 0.5;
        const branchAngle = Math.PI / 6;
        const bx = cos * branchPos;
        const by = sin * branchPos;

        paths += `<line x1="${bx}" y1="${by}" x2="${bx + Math.cos(angle + branchAngle) * branchLen}" y2="${by + Math.sin(angle + branchAngle) * branchLen}" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round"/>`;
        paths += `<line x1="${bx}" y1="${by}" x2="${bx + Math.cos(angle - branchAngle) * branchLen}" y2="${by + Math.sin(angle - branchAngle) * branchLen}" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round"/>`;
    }

    // Center circle
    paths += `<circle cx="0" cy="0" r="${r * 0.1}" fill="${color}"/>`;

    return paths;
};

const svgHeart = (size: number, color: string): string => {
    const r = size / 2;
    // SVG heart using bezier curves
    const d = `M 0 ${r * 0.3} 
               C ${-r * 0.5} ${-r * 0.3}, ${-r} ${-r * 0.3}, ${-r} ${r * 0.1}
               C ${-r} ${r * 0.6}, 0 ${r}, 0 ${r}
               C 0 ${r}, ${r} ${r * 0.6}, ${r} ${r * 0.1}
               C ${r} ${-r * 0.3}, ${r * 0.5} ${-r * 0.3}, 0 ${r * 0.3} Z`;
    return `<path d="${d}" fill="${color}"/>`;
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

const svgXmasTree = (size: number, color: string): string => {
    const r = size / 2;
    let svg = '';

    // Triangle tree
    svg += `<polygon points="0,${-r * 0.9} ${r * 0.7},${r * 0.5} ${-r * 0.7},${r * 0.5}" fill="${color}"/>`;

    // Trunk
    svg += `<rect x="${-r * 0.15}" y="${r * 0.5}" width="${r * 0.3}" height="${r * 0.35}" fill="${adjustColorBrightness(color, -50)}"/>`;

    // Star
    svg += `<circle cx="0" cy="${-r * 0.85}" r="${r * 0.12}" fill="#FFD700"/>`;

    return svg;
};

const svgGift = (size: number, color: string): string => {
    const r = size / 2;
    let svg = '';

    // Main box
    svg += `<rect x="${-r * 0.7}" y="${-r * 0.5}" width="${r * 1.4}" height="${r * 1.1}" rx="${r * 0.08}" fill="${color}"/>`;

    // Lid
    svg += `<rect x="${-r * 0.75}" y="${-r * 0.7}" width="${r * 1.5}" height="${r * 0.25}" rx="${r * 0.05}" fill="${adjustColorBrightness(color, -20)}"/>`;

    // Ribbon vertical
    svg += `<rect x="${-r * 0.1}" y="${-r * 0.7}" width="${r * 0.2}" height="${r * 1.3}" fill="#FFD700"/>`;

    // Ribbon horizontal
    svg += `<rect x="${-r * 0.7}" y="${-r * 0.15}" width="${r * 1.4}" height="${r * 0.2}" fill="#FFD700"/>`;

    return svg;
};

const svgCrescent = (size: number, color: string): string => {
    const r = size / 2;
    // Crescent moon using two overlapping circles
    return `<path d="M 0 ${-r} A ${r} ${r} 0 1 1 0 ${r} A ${r * 0.7} ${r * 0.7} 0 1 0 0 ${-r}" fill="${color}"/>`;
};

const svgLantern = (size: number, color: string): string => {
    const r = size / 2;
    let svg = '';

    // Main body (ellipse)
    svg += `<ellipse cx="0" cy="0" rx="${r * 0.6}" ry="${r * 0.8}" fill="${color}"/>`;

    // Top cap
    svg += `<rect x="${-r * 0.3}" y="${-r * 0.9}" width="${r * 0.6}" height="${r * 0.15}" fill="${adjustColorBrightness(color, -30)}"/>`;

    // Bottom cap
    svg += `<rect x="${-r * 0.3}" y="${r * 0.75}" width="${r * 0.6}" height="${r * 0.15}" fill="${adjustColorBrightness(color, -30)}"/>`;

    // Tassel lines at bottom
    svg += `<line x1="0" y1="${r * 0.9}" x2="0" y2="${r}" stroke="${adjustColorBrightness(color, -50)}" stroke-width="2"/>`;

    return svg;
};

const svgBalloon = (size: number, color: string): string => {
    const r = size / 2;
    let svg = '';

    // Balloon body
    svg += `<ellipse cx="0" cy="${-r * 0.2}" rx="${r * 0.6}" ry="${r * 0.7}" fill="${color}"/>`;

    // Knot
    svg += `<polygon points="${-r * 0.08},${r * 0.45} ${r * 0.08},${r * 0.45} 0,${r * 0.55}" fill="${adjustColorBrightness(color, -30)}"/>`;

    // String
    svg += `<path d="M 0 ${r * 0.55} Q ${r * 0.1} ${r * 0.75} 0 ${r}" fill="none" stroke="#666" stroke-width="1"/>`;

    return svg;
};

const svgFirework = (size: number, color: string): string => {
    const r = size / 2;
    let svg = '';
    const rays = 12;

    for (let i = 0; i < rays; i++) {
        const angle = (i / rays) * Math.PI * 2;
        const innerR = r * 0.2;
        const outerR = r * (0.6 + Math.random() * 0.3);
        const x1 = Math.cos(angle) * innerR;
        const y1 = Math.sin(angle) * innerR;
        const x2 = Math.cos(angle) * outerR;
        const y2 = Math.sin(angle) * outerR;

        svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="2" stroke-linecap="round"/>`;

        // Sparkle at end
        svg += `<circle cx="${x2}" cy="${y2}" r="${r * 0.05}" fill="${color}"/>`;
    }

    // Center
    svg += `<circle cx="0" cy="0" r="${r * 0.15}" fill="${color}"/>`;

    return svg;
};

const svgStarburst = (size: number, color: string): string => {
    return svgStar(size, color, 8);
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

        // Valentine
        case 'heart': return svgHeart(size, color);

        // CNY
        case 'lantern': return svgLantern(size, color);

        // New Year
        case 'firework': return svgFirework(size, color);
        case 'balloon': return svgBalloon(size, color);
        case 'starburst': return svgStarburst(size, color);

        // Ramadan
        case 'crescent': return svgCrescent(size, color);
        case 'star-islamic': return svgStar(size, color, 8);

        // Fallback for unimplemented shapes - render as circle
        default:
            return `<circle r="${size / 2}" fill="${color}"/>`;
    }
};

// Check if a shape type is seasonal
export const isSeasonalShape = (type: string): boolean => {
    return (SEASONAL_SHAPES as readonly string[]).includes(type);
};
