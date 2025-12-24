// Shared utilities for generators

import { CompositionType, ShapeData, CompositionOptions, StrokeMode } from '../../../types';
import { RNG } from '../../rng';

// Shapes that cannot be stroke-only (always force fill)
const FILL_ONLY_SHAPES = ['image', 'char', 'wave', 'zigzag', 'blob'];

// Helper to determine stroke value based on strokeMode and shape type
export const getStrokeValue = (
    strokeMode: StrokeMode,
    shapeType: string,
    rng: RNG,
    randomThreshold: number = 0.7
): boolean => {
    // Some shapes can't be stroke - always return false
    if (FILL_ONLY_SHAPES.includes(shapeType)) {
        return false;
    }

    switch (strokeMode) {
        case 'fill':
            return false;
        case 'stroke':
            return true;
        case 'random':
        default:
            return rng.nextFloat() > randomThreshold;
    }
};

// Composition Algorithms
export const getPosition = (
    type: CompositionType,
    width: number,
    height: number,
    rng: RNG,
    options: CompositionOptions
): { x: number, y: number } => {
    switch (type) {
        case 'center': {
            let u = 0, v = 0;
            while (u === 0) u = rng.nextFloat();
            while (v === 0) v = rng.nextFloat();
            const z1 = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
            const z2 = Math.sqrt(-2.0 * Math.log(u)) * Math.sin(2.0 * Math.PI * v);
            const spread = 0.2;
            let x = width * (0.5 + z1 * spread);
            let y = height * (0.5 + z2 * spread);
            return { x, y };
        }
        case 'frame': {
            // Respect Margin Option (defaults to 25 -> 0.25)
            const marginPct = (options.margin || 25) / 100;
            const marginX = width * marginPct;
            const marginY = height * marginPct;

            const side = Math.floor(rng.nextFloat() * 4);
            let x, y;
            if (side === 0) { x = rng.nextRange(0, width); y = rng.nextRange(0, marginY); }
            else if (side === 1) { x = rng.nextRange(width - marginX, width); y = rng.nextRange(0, height); }
            else if (side === 2) { x = rng.nextRange(0, width); y = rng.nextRange(height - marginY, height); }
            else { x = rng.nextRange(0, marginX); y = rng.nextRange(0, height); }
            return { x, y };
        }
        case 'diagonal': {
            const x = rng.nextRange(0, width);
            const direction = options.direction || 'tl-br';

            let idealY;
            if (direction === 'tl-br') {
                // Top-Left to Bottom-Right
                idealY = x * (height / width);
            } else {
                // Top-Right to Bottom-Left
                idealY = height - (x * (height / width));
            }

            const noise = (rng.nextFloat() - 0.5) * height * 0.5;
            return { x, y: idealY + noise };
        }
        case 'thirds': {
            const xRegion = rng.nextFloat() > 0.5 ? 0.33 : 0.66;
            const yRegion = rng.nextFloat() > 0.5 ? 0.33 : 0.66;
            const spread = 0.15;
            const x = width * (xRegion + (rng.nextFloat() - 0.5) * spread * 2);
            const y = height * (yRegion + (rng.nextFloat() - 0.5) * spread * 2);
            return { x, y };
        }
        case 'bottom': {
            const x = rng.nextRange(0, width);
            const bias = Math.pow(rng.nextFloat(), 0.5);
            const y = height * bias;
            return { x, y };
        }
        case 'cross': {
            const isHorizontal = rng.nextFloat() > 0.5;
            const thickness = 0.2;
            if (isHorizontal) {
                const x = rng.nextRange(0, width);
                const midY = height / 2;
                const y = rng.nextRange(midY - height * thickness, midY + height * thickness);
                return { x, y };
            } else {
                const y = rng.nextRange(0, height);
                const midX = width / 2;
                const x = rng.nextRange(midX - width * thickness, midX + width * thickness);
                return { x, y };
            }
        }
        case 'x-shape': {
            const isDiag1 = rng.nextFloat() > 0.5;
            const t = rng.nextFloat();
            const spread = 0.15;
            if (isDiag1) {
                const x = width * (t + (rng.nextFloat() - 0.5) * spread);
                const y = height * (t + (rng.nextFloat() - 0.5) * spread);
                return { x, y };
            } else {
                const x = width * (1 - t + (rng.nextFloat() - 0.5) * spread);
                const y = height * (t + (rng.nextFloat() - 0.5) * spread);
                return { x, y };
            }
        }
        case 'ring': {
            const cx = width / 2;
            const cy = height / 2;
            const minRadius = Math.min(width, height) * 0.25;
            const maxRadius = Math.min(width, height) * 0.45;
            const angle = rng.nextFloat() * Math.PI * 2;
            const r = rng.nextRange(minRadius, maxRadius);
            return { x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r };
        }
        case 'split-v': return { x: rng.nextRange(width * 0.5, width), y: rng.nextRange(0, height) };
        case 'split-h': return { x: rng.nextRange(0, width), y: rng.nextRange(height * 0.5, height) };
        case 'corners': {
            const corner = Math.floor(rng.nextFloat() * 4);
            const margin = Math.min(width, height) * 0.25;
            if (corner === 0) return { x: rng.nextRange(0, margin), y: rng.nextRange(0, margin) };
            if (corner === 1) return { x: rng.nextRange(width - margin, width), y: rng.nextRange(0, margin) };
            if (corner === 2) return { x: rng.nextRange(width - margin, width), y: rng.nextRange(height - margin, height) };
            return { x: rng.nextRange(0, margin), y: rng.nextRange(height - margin, height) };
        }
        case 'random': default: return { x: rng.nextRange(0, width), y: rng.nextRange(0, height) };
    }
};

// Helper to create offscreen canvas
export const createOffscreenCanvas = (width: number, height: number): OffscreenCanvas | HTMLCanvasElement => {
    const safeWidth = Math.max(1, Math.ceil(width));
    const safeHeight = Math.max(1, Math.ceil(height));

    if (typeof OffscreenCanvas !== 'undefined') {
        return new OffscreenCanvas(safeWidth, safeHeight);
    } else if (typeof document !== 'undefined') {
        const c = document.createElement('canvas');
        c.width = safeWidth;
        c.height = safeHeight;
        return c;
    }
    throw new Error('Canvas not supported in this environment');
};
