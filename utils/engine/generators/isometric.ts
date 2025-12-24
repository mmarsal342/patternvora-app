// Isometric cubes generator

import { ShapeData, LayerConfig } from '../../../types';
import { RNG } from '../../rng';

export const generateIsometric = (width: number, height: number, baseSize: number, config: LayerConfig, rng: RNG): ShapeData[] => {
    const shapes: ShapeData[] = [];
    const tileWidth = baseSize * 2;
    const tileHeight = baseSize;
    const cols = Math.ceil(width / tileWidth) + 2;
    const rows = Math.ceil(height / (tileHeight / 2)) + 4;
    let globalIndex = 0;

    for (let r = -2; r < rows; r++) {
        for (let c = -1; c < cols; c++) {
            const xOffset = (r % 2 !== 0) ? tileWidth / 2 : 0;
            const cx = c * tileWidth + xOffset;
            const cy = r * (tileHeight * 0.5);

            if (rng.nextFloat() > 0.8) { globalIndex++; continue; }

            shapes.push({
                index: globalIndex++,
                type: 'cube',
                x: cx, y: cy,
                size: baseSize * 1.05,
                rotation: 0,
                color: rng.nextItem(config.palette.colors),
                stroke: false,
                speedFactor: Math.floor(rng.nextRange(1, 4)),
                phaseOffset: (c + r) * 0.5
            });
        }
    }
    return shapes;
};
