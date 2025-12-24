// Radial burst pattern generator

import { ShapeData, LayerConfig } from '../../../types';
import { RNG } from '../../rng';
import { getStrokeValue } from './utils';

export const generateRadial = (width: number, height: number, baseSize: number, config: LayerConfig, rng: RNG): ShapeData[] => {
    const shapes: ShapeData[] = [];
    const cx = width / 2;
    const cy = height / 2;
    const maxDist = Math.sqrt(width * width + height * height) / 2;
    const rings = Math.floor(config.complexity / 10) + 2;
    let globalIndex = 0;

    const getDefaultTypes = (): ShapeData['type'][] => ['arc', 'donut', 'star', 'circle', 'polygon', 'spiral', 'semicircle', 'thin-ring'];
    // User selection OVERRIDES style defaults
    let allowedTypes: ShapeData['type'][] = config.styleOptions.shapeTypes.length > 0
        ? config.styleOptions.shapeTypes as ShapeData['type'][]
        : getDefaultTypes();

    for (let r = 0; r < rings; r++) {
        const radius = (r / rings) * maxDist;
        const itemsInRing = Math.floor(r * 3) + 4;

        for (let i = 0; i < itemsInRing; i++) {
            if (rng.nextFloat() > 0.8) { globalIndex++; continue; }
            const angle = (i / itemsInRing) * Math.PI * 2 + (r * 0.2);
            shapes.push({
                index: globalIndex++,
                type: rng.nextItem(allowedTypes),
                x: cx + Math.cos(angle) * radius,
                y: cy + Math.sin(angle) * radius,
                size: baseSize * rng.nextRange(0.5, 1.5) * (1 + r / rings),
                rotation: (angle * 180 / Math.PI) + 90,
                color: rng.nextItem(config.palette.colors),
                stroke: getStrokeValue(config.strokeMode, rng.nextItem(allowedTypes), rng, 0.6),
                speedFactor: Math.floor(rng.nextRange(1, 4)),
                phaseOffset: rng.nextFloat() * Math.PI * 2
            });
        }
    }
    return shapes;
};
