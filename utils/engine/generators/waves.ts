// Wave pattern generator

import { ShapeData, LayerConfig } from '../../../types';
import { RNG } from '../../rng';

export const generateWaves = (width: number, height: number, config: LayerConfig, rng: RNG): ShapeData[] => {
    const shapes: ShapeData[] = [];
    const layerCount = Math.floor(config.complexity / 10) + 3;
    const step = height / layerCount;

    for (let i = 0; i < layerCount; i++) {
        shapes.push({
            index: i,
            type: 'wave',
            x: 0,
            y: i * step + step / 2,
            size: step * 2,
            rotation: 0,
            color: rng.nextItem(config.palette.colors),
            stroke: false,
            speedFactor: Math.floor(rng.nextRange(1, 4)),
            phaseOffset: rng.nextFloat() * Math.PI * 2,
            points: i
        });
    }
    return shapes;
};
