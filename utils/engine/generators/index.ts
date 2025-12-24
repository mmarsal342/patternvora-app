// Main generator dispatcher
// This file orchestrates all pattern generators and exports the main API

import { AppState, ShapeData, LayerConfig } from '../../../types';
import { RNG } from '../../rng';
import { applySymmetry } from '../symmetry';

// Import all generators
import { generateGrid } from './grid';
import { generateHex } from './hex';
import { generateIsometric } from './isometric';
import { generateRadial } from './radial';
import { generateStandardScatter } from './scatter';
import { generateWaves } from './waves';
import { generateMosaic, generateMosaicTextFill, MosaicTextFillParams } from './mosaic';
import { generateTruchet } from './truchet';
import { generateGuilloche } from './guilloche';
import { generateHerringbone } from './herringbone';
import { applyStructureControls } from './structure';

// Re-export utilities for external use
export { getStrokeValue, getPosition } from './utils';
export { generateMosaicTextFill } from './mosaic';
export type { MosaicTextFillParams } from './mosaic';
export type { TruchetTileType } from './types';

// Generates the abstract data model for the pattern
export const generateShapeData = (width: number, height: number, config: LayerConfig): ShapeData[] => {
    const rng = new RNG(config.seed);
    const baseSize = Math.min(width, height) * (config.scale / 10);

    let shapes: ShapeData[];

    if (config.style === 'isometric') shapes = generateIsometric(width, height, baseSize, config, rng);
    else if (config.style === 'grid') shapes = generateGrid(width, height, baseSize, config, rng);
    else if (config.style === 'hex') shapes = generateHex(width, height, baseSize, config, rng);
    else if (config.style === 'waves') shapes = generateWaves(width, height, config, rng);
    else if (config.style === 'mosaic') shapes = generateMosaic(width, height, baseSize, config, rng);
    else if (config.style === 'radial') shapes = generateRadial(width, height, baseSize, config, rng);
    else if (config.style === 'truchet') shapes = generateTruchet(width, height, config, rng);
    else if (config.style === 'guilloche') shapes = generateGuilloche(width, height, config, rng);
    else if (config.style === 'herringbone') shapes = generateHerringbone(width, height, config, rng);
    else shapes = generateStandardScatter(width, height, baseSize, config, rng);

    // Apply structure controls (regularity, size variation, rotation lock) as post-process
    // This happens BEFORE symmetry so the structure is applied to the base shapes
    if (config.structure) {
        shapes = applyStructureControls(shapes, config, width, height, rng);
    }

    // Apply symmetry transformation as post-process
    const symmetryGroup = config.symmetryGroup || 'none';
    if (symmetryGroup !== 'none') {
        shapes = applySymmetry(shapes, symmetryGroup, width, height);
    }

    return shapes;
};

// Hit Testing - Updated to loop through LAYERS (Reverse order for Z-index)
export const getShapeAtPosition = (
    x: number,
    y: number,
    width: number,
    height: number,
    state: AppState
): ShapeData & { layerId: string } | null => {

    // Check layers from Top to Bottom
    for (let l = state.layers.length - 1; l >= 0; l--) {
        const layer = state.layers[l];
        if (!layer.visible || layer.locked) continue;

        const shapes = generateShapeData(width, height, layer.config);

        for (let i = shapes.length - 1; i >= 0; i--) {
            const shape = shapes[i];
            const override = layer.config.overrides[shape.index] || {};
            if (override.hidden) continue;

            let shapeX = shape.x;
            let shapeY = shape.y;
            let shapeSize = shape.size;

            if (override.x !== undefined) shapeX = (override.x / 100) * width;
            if (override.y !== undefined) shapeY = (override.y / 100) * height;
            if (override.size !== undefined) shapeSize = shape.size * override.size;

            const hitRadius = Math.max(shapeSize / 1.4, 20);

            const dx = x - shapeX;
            const dy = y - shapeY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < hitRadius) return { ...shape, layerId: layer.id };
            if (shape.type === 'wave') {
                if (Math.abs(y - shapeY) < Math.max(shapeSize / 2, 20)) return { ...shape, layerId: layer.id };
            }
            if (shape.type === 'cube') {
                if (Math.abs(dx) < Math.max(shapeSize, 20) && Math.abs(dy) < Math.max(shapeSize * 0.7, 20)) return { ...shape, layerId: layer.id };
            }
        }
    }
    return null;
};
