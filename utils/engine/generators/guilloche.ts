// Guilloché / Spirograph curve generator

import { ShapeData, LayerConfig } from '../../../types';
import { RNG } from '../../rng';

// Hypotrochoid: small circle rolling INSIDE large circle
const hypotrochoid = (t: number, R: number, r: number, d: number) => ({
    x: (R - r) * Math.cos(t) + d * Math.cos(((R - r) / r) * t),
    y: (R - r) * Math.sin(t) - d * Math.sin(((R - r) / r) * t)
});

// Epitrochoid: small circle rolling OUTSIDE large circle
const epitrochoid = (t: number, R: number, r: number, d: number) => ({
    x: (R + r) * Math.cos(t) - d * Math.cos(((R + r) / r) * t),
    y: (R + r) * Math.sin(t) - d * Math.sin(((R + r) / r) * t)
});

export const generateGuilloche = (width: number, height: number, config: LayerConfig, rng: RNG): ShapeData[] => {
    const shapes: ShapeData[] = [];

    // Get guilloche options with defaults
    const opts = config.guillocheOptions || {
        curveType: 'hypotrochoid',
        majorRadius: 100,
        minorRadius: 40,
        penDistance: 60,
        layerCount: 3,
        strokeWeight: 2
    };

    // Center of canvas
    const cx = width / 2;
    const cy = height / 2;

    // Scale factor to fit in canvas
    const maxRadius = Math.min(width, height) * 0.45;
    const scale = maxRadius / (opts.majorRadius + opts.penDistance);

    // Generate multiple layers with slight variations
    for (let layer = 0; layer < opts.layerCount; layer++) {
        // Vary parameters for each layer
        const layerRatio = layer / Math.max(1, opts.layerCount - 1);
        const R = opts.majorRadius * (1 - layerRatio * 0.3) * scale;
        const r = opts.minorRadius * (1 - layerRatio * 0.2) * scale;
        const d = opts.penDistance * (1 - layerRatio * 0.2) * scale;

        // Calculate number of revolutions needed for closed curve
        // Use ORIGINAL unscaled values for GCD (before layer variation)
        const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
        const originalR = Math.round(opts.majorRadius * (1 - layerRatio * 0.3));
        const originalr = Math.round(opts.minorRadius * (1 - layerRatio * 0.2));
        const revolutions = originalr / gcd(originalR, originalr);
        const maxT = 2 * Math.PI * revolutions;

        // Higher sampling for smooth curves that close properly
        const basePoints = Math.min(1000, Math.max(200, Math.round(revolutions * 100)));

        // Generate curve points
        const points: number[] = [];
        for (let i = 0; i <= basePoints; i++) {
            const t = (i / basePoints) * maxT;

            let pt: { x: number; y: number };

            // Select curve type
            if (opts.curveType === 'epitrochoid') {
                pt = epitrochoid(t, R, r, d);
            } else if (opts.curveType === 'mixed' && layer % 2 === 1) {
                pt = epitrochoid(t, R, r, d);
            } else {
                pt = hypotrochoid(t, R, r, d);
            }

            points.push(cx + pt.x, cy + pt.y);
        }

        // Add phase offset for variety
        const phaseOffset = layer * (Math.PI / opts.layerCount);

        // Get color from palette
        const color = config.palette.colors[layer % config.palette.colors.length];

        shapes.push({
            index: layer,
            type: 'guilloche-curve' as ShapeData['type'],
            x: cx,
            y: cy,
            size: maxRadius * 2,
            rotation: phaseOffset,
            color,
            stroke: true,
            speedFactor: 1 + layer * 0.1,
            phaseOffset: phaseOffset,
            points: points.length, // Store point count
            seed: opts.strokeWeight + (layer * 0.3), // Use seed for stroke weight per layer
            // Store the actual points in a custom way - we'll encode first few for rendering
            pointsData: points, // We'll handle this in renderer
        } as ShapeData & { pointsData: number[] });
    }

    return shapes;
};
