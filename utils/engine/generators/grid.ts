// Grid pattern generator

import { ShapeData, LayerConfig } from '../../../types';
import { RNG } from '../../rng';
import { getStrokeValue } from './utils';

export const generateGrid = (width: number, height: number, baseSize: number, config: LayerConfig, rng: RNG): ShapeData[] => {
    const shapes: ShapeData[] = [];
    const cols = Math.ceil(Math.sqrt(config.complexity));
    const rows = cols;

    // Apply Grid Gap
    const gap = config.styleOptions.gridGap || 0;
    const totalGapX = (cols - 1) * gap;
    const totalGapY = (rows - 1) * gap;

    const cellW = (width - totalGapX) / cols;
    const cellH = (height - totalGapY) / rows;

    let globalIndex = 0;

    // Filter to only enabled assets
    const activeAssets = config.customImage.assets.filter(a => a.enabled !== false);

    // Helper to get a random asset ID if available
    const getRandomAssetId = () => {
        if (activeAssets.length > 0) {
            return rng.nextItem(activeAssets).id;
        }
        return undefined;
    };

    const getDefaultTypes = (): ShapeData['type'][] => ['rect', 'polygon', 'cross', 'circle', 'diamond', 'hexagon'];
    // User selection OVERRIDES style defaults
    let allowedTypes: ShapeData['type'][] = config.styleOptions.shapeTypes.length > 0
        ? config.styleOptions.shapeTypes as ShapeData['type'][]
        : getDefaultTypes();

    // Single display mode: just one asset, centered
    if (activeAssets.length > 0 && config.customImage.displayMode === 'single') {
        shapes.push({
            index: 0, type: 'image',
            x: width / 2, y: height / 2,
            size: Math.min(width, height) * config.scale * 0.6,
            rotation: 0, color: rng.nextItem(config.palette.colors),
            stroke: false, speedFactor: 1, phaseOffset: 0, points: 0,
            seed: rng.nextRange(0, 1000),
            assetId: rng.nextItem(activeAssets).id
        });
        return shapes;
    }

    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            if (rng.nextFloat() > 0.8) { globalIndex++; continue; }

            const cx = i * (cellW + gap) + cellW / 2;
            const cy = j * (cellH + gap) + cellH / 2;

            shapes.push({
                index: globalIndex++,
                type: activeAssets.length > 0 ? 'image' : rng.nextItem(allowedTypes),
                x: cx,
                y: cy,
                size: (Math.min(cellW, cellH) * config.scale) * rng.nextRange(0.2, 0.8),
                rotation: rng.nextRange(0, 360),
                color: rng.nextItem(config.palette.colors),
                stroke: getStrokeValue(config.strokeMode, activeAssets.length > 0 ? 'image' : rng.nextItem(allowedTypes), rng),
                speedFactor: Math.floor(rng.nextRange(1, 4)),
                phaseOffset: rng.nextFloat() * Math.PI * 2,
                points: Math.floor(rng.nextRange(5, 8)),
                assetId: getRandomAssetId()
            });
        }
    }
    return shapes;
};
