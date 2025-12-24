// Hex pattern generator

import { ShapeData, LayerConfig } from '../../../types';
import { RNG } from '../../rng';
import { getStrokeValue } from './utils';

export const generateHex = (width: number, height: number, baseSize: number, config: LayerConfig, rng: RNG): ShapeData[] => {
    const shapes: ShapeData[] = [];
    const size = baseSize * 0.6;
    const hexH = size * 2;
    const hexW = Math.sqrt(3) * size;
    const vertDist = hexH * 0.75;
    const horizDist = hexW;
    const cols = Math.ceil(width / horizDist) + 2;
    const rows = Math.ceil(height / vertDist) + 2;
    let globalIndex = 0;

    for (let r = -1; r < rows; r++) {
        for (let c = -1; c < cols; c++) {
            const xOffset = (r % 2 !== 0) ? hexW / 2 : 0;
            const cx = c * horizDist + xOffset;
            const cy = r * vertDist;

            if (rng.nextFloat() > 0.7) { globalIndex++; continue; }

            shapes.push({
                index: globalIndex++,
                type: 'polygon',
                x: cx, y: cy,
                size: size * 1.8,
                rotation: 30,
                color: rng.nextItem(config.palette.colors),
                stroke: getStrokeValue(config.strokeMode, 'polygon', rng),
                points: 6,
                speedFactor: Math.floor(rng.nextRange(1, 4)),
                phaseOffset: (c + r) * 0.5
            });
        }
    }
    return shapes;
};
