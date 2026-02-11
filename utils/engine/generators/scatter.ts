// Scatter pattern generator - for geometric, organic, bauhaus, confetti, memphis, typo, seasonal styles

import { ShapeData, LayerConfig } from '../../../types';
import { RNG } from '../../rng';
import { getStrokeValue, getPosition } from './utils';

export const generateStandardScatter = (width: number, height: number, baseSize: number, config: LayerConfig, rng: RNG): ShapeData[] => {
    const shapes: ShapeData[] = [];

    // Determine allowed shapes based on Style and StyleOptions
    let allowedTypes: ShapeData['type'][] = ['circle'];

    if (config.style === 'geometric') allowedTypes = ['polygon', 'star', 'cross', 'donut', 'circle', 'rect', 'triangle', 'diamond', 'hexagon', 'thin-ring'];
    else if (config.style === 'organic') allowedTypes = ['blob', 'pill', 'arc', 'circle', 'semicircle', 'spiral', 'squiggle'];
    else if (config.style === 'bauhaus') allowedTypes = ['arc', 'circle', 'rect', 'line', 'triangle', 'semicircle'];
    else if (config.style === 'confetti') allowedTypes = ['star', 'zigzag', 'circle', 'triangle', 'arrow', 'squiggle'];
    else if (config.style === 'memphis') allowedTypes = ['circle', 'rect', 'triangle', 'zigzag', 'cross', 'donut', 'pill', 'star', 'arrow', 'squiggle'];
    else if (config.style === 'typo') allowedTypes = ['char'];
    // Seasonal Styles
    else if ((config.style as string) === 'seasonal-cny') allowedTypes = ['lantern', 'dragon', 'angpao', 'cloud-cn', 'firecracker', 'fan'];
    else if ((config.style as string) === 'seasonal-christmas') allowedTypes = ['xmas-tree', 'gift', 'snowflake', 'bell', 'candycane', 'santa-hat'];
    else if ((config.style as string) === 'seasonal-newyear') allowedTypes = ['firework', 'champagne', 'clock-ny', 'balloon', 'party-hat', 'party-popper', 'starburst'];
    else if ((config.style as string) === 'seasonal-valentine') allowedTypes = ['heart', 'rose', 'love-letter', 'ring'];
    else if ((config.style as string) === 'seasonal-ramadan') allowedTypes = ['crescent', 'star-islamic', 'mosque', 'lantern-ramadan', 'ketupat', 'dates'];

    // Filter if user has selected specific shapes
    // User selection OVERRIDES style defaults (not intersection)
    if (config.styleOptions.shapeTypes.length > 0) {
        allowedTypes = config.styleOptions.shapeTypes as ShapeData['type'][];
    }

    for (let i = 0; i < config.complexity; i++) {
        const { x, y } = getPosition(config.composition, width, height, rng, config.compositionOptions);
        let type: ShapeData['type'] = 'circle';
        let assetId: string | undefined;

        const activeAssets = config.customImage.assets.filter(a => a.enabled !== false);
        if (activeAssets.length > 0) {
            type = 'image';
            // Pick a random asset from the available (enabled) list
            assetId = rng.nextItem(activeAssets).id;
        } else {
            type = rng.nextItem(allowedTypes);
        }

        shapes.push({
            index: i,
            type,
            x, y,
            size: baseSize * rng.nextRange(0.5, 2.0),
            rotation: rng.nextRange(0, 360),
            color: rng.nextItem(config.palette.colors),
            stroke: getStrokeValue(config.strokeMode, type, rng, 0.6),
            speedFactor: Math.floor(rng.nextRange(1, 4)),
            phaseOffset: rng.nextFloat() * Math.PI * 2,
            points: Math.floor(rng.nextRange(3, 8)),
            seed: rng.nextRange(0, 1000),
            char: config.style === 'typo' ? rng.nextItem("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".split('')) : undefined,
            assetId
        });
    }
    return shapes;
};
