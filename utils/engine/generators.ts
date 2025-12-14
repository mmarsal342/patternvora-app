

import { AppState, CompositionType, ShapeData, LayerConfig, CompositionOptions, StrokeMode } from '../../types';
import { RNG } from '../rng';

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
}

// --- SPECIFIC GENERATORS ---

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

    // Helper to get a random asset ID if available
    const getRandomAssetId = () => {
        if (config.customImage.assets.length > 0) {
            return rng.nextItem(config.customImage.assets).id;
        }
        return undefined;
    };

    // Filter allowed types for Grid if specified
    const getDefaultTypes = (): ShapeData['type'][] => ['circle', 'rect', 'triangle', 'polygon'];
    let allowedTypes = getDefaultTypes();
    if (config.styleOptions.shapeTypes.length > 0) {
        allowedTypes = allowedTypes.filter(t => config.styleOptions.shapeTypes.includes(t));
        if (allowedTypes.length === 0) allowedTypes = getDefaultTypes();
    }

    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            if (rng.nextFloat() > 0.8) { globalIndex++; continue; }

            const cx = i * (cellW + gap) + cellW / 2;
            const cy = j * (cellH + gap) + cellH / 2;

            shapes.push({
                index: globalIndex++,
                type: config.customImage.assets.length > 0 ? 'image' : rng.nextItem(allowedTypes),
                x: cx,
                y: cy,
                size: (Math.min(cellW, cellH) * config.scale) * rng.nextRange(0.2, 0.8),
                rotation: rng.nextRange(0, 360),
                color: rng.nextItem(config.palette.colors),
                stroke: getStrokeValue(config.strokeMode, config.customImage.assets.length > 0 ? 'image' : rng.nextItem(allowedTypes), rng),
                speedFactor: Math.floor(rng.nextRange(1, 4)),
                phaseOffset: rng.nextFloat() * Math.PI * 2,
                points: Math.floor(rng.nextRange(5, 8)),
                assetId: getRandomAssetId()
            });
        }
    }
    return shapes;
};

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

export const generateMosaic = (width: number, height: number, baseSize: number, config: LayerConfig, rng: RNG): ShapeData[] => {
    const shapes: ShapeData[] = [];
    const gridCount = Math.max(2, Math.ceil(Math.sqrt(config.complexity)));
    const cols = gridCount;
    const rows = gridCount;

    // Gap logic for Mosaic
    const gap = config.styleOptions.gridGap || 0;
    const totalGapX = (cols - 1) * gap;
    const totalGapY = (rows - 1) * gap;

    const cellW = (width - totalGapX) / cols;
    const cellH = (height - totalGapY) / rows;

    const occupied = new Set<string>();
    let globalIndex = 0;

    const getRandomAssetId = () => {
        if (config.customImage.assets.length > 0) {
            return rng.nextItem(config.customImage.assets).id;
        }
        return undefined;
    };

    // Filter Allowed Shapes
    const getDefaultTypes = (): ShapeData['type'][] => ['rect', 'circle', 'triangle'];
    let allowedTypes = getDefaultTypes();
    if (config.styleOptions.shapeTypes.length > 0) {
        allowedTypes = allowedTypes.filter(t => config.styleOptions.shapeTypes.includes(t));
        if (allowedTypes.length === 0) allowedTypes = getDefaultTypes();
    }

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            if (occupied.has(`${x},${y}`)) continue;

            let blockW = 1, blockH = 1;
            const r = rng.nextFloat();
            if (r > 0.85 && x < cols - 1 && y < rows - 1 && !occupied.has(`${x + 1},${y}`) && !occupied.has(`${x},${y + 1}`) && !occupied.has(`${x + 1},${y + 1}`)) {
                blockW = 2; blockH = 2;
            } else if (r > 0.70 && x < cols - 1 && !occupied.has(`${x + 1},${y}`)) {
                blockW = 2; blockH = 1;
            } else if (r > 0.55 && y < rows - 1 && !occupied.has(`${x},${y + 1}`)) {
                blockW = 1; blockH = 2;
            }

            for (let bx = 0; bx < blockW; bx++) for (let by = 0; by < blockH; by++) occupied.add(`${x + bx},${y + by}`);
            if (blockW === 1 && blockH === 1 && rng.nextFloat() > 0.75) { globalIndex++; continue; }

            const pixelW = (cellW * blockW) + ((blockW - 1) * gap);
            const pixelH = (cellH * blockH) + ((blockH - 1) * gap);
            const minDim = Math.min(pixelW, pixelH);

            const startX = x * (cellW + gap);
            const startY = y * (cellH + gap);

            shapes.push({
                index: globalIndex++,
                type: config.customImage.assets.length > 0 ? 'image' : rng.nextItem(allowedTypes),
                x: startX + (pixelW / 2),
                y: startY + (pixelH / 2),
                size: minDim * (config.scale > 1 ? 0.95 : config.scale * 0.9),
                rotation: blockW === blockH ? rng.nextItem([0, 90, 180, 270]) : 0,
                color: rng.nextItem(config.palette.colors),
                stroke: false,
                speedFactor: Math.floor(rng.nextRange(1, 4)),
                phaseOffset: rng.nextFloat() * Math.PI * 2,
                assetId: getRandomAssetId()
            });
        }
    }
    return shapes;
};

export const generateRadial = (width: number, height: number, baseSize: number, config: LayerConfig, rng: RNG): ShapeData[] => {
    const shapes: ShapeData[] = [];
    const cx = width / 2;
    const cy = height / 2;
    const maxDist = Math.sqrt(width * width + height * height) / 2;
    const rings = Math.floor(config.complexity / 10) + 2;
    let globalIndex = 0;

    // Filter Allowed Shapes
    const getDefaultTypes = (): ShapeData['type'][] => ['circle', 'rect', 'star', 'polygon'];
    let allowedTypes = getDefaultTypes();
    if (config.styleOptions.shapeTypes.length > 0) {
        allowedTypes = allowedTypes.filter(t => config.styleOptions.shapeTypes.includes(t));
        if (allowedTypes.length === 0) allowedTypes = getDefaultTypes();
    }

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

export const generateStandardScatter = (width: number, height: number, baseSize: number, config: LayerConfig, rng: RNG): ShapeData[] => {
    const shapes: ShapeData[] = [];

    // Determine allowed shapes based on Style and StyleOptions
    let allowedTypes: ShapeData['type'][] = ['circle'];

    if (config.style === 'geometric') allowedTypes = ['circle', 'rect', 'triangle', 'polygon', 'star', 'line'];
    else if (config.style === 'organic') allowedTypes = ['blob', 'circle'];
    else if (config.style === 'bauhaus') allowedTypes = ['rect', 'circle', 'arc', 'line', 'triangle'];
    else if (config.style === 'confetti') allowedTypes = ['circle', 'rect', 'triangle', 'line', 'star'];
    else if (config.style === 'memphis') allowedTypes = ['circle', 'rect', 'triangle', 'zigzag', 'cross', 'donut', 'pill', 'star'];
    else if (config.style === 'typo') allowedTypes = ['char'];
    // Seasonal Styles
    else if ((config.style as string) === 'seasonal-cny') allowedTypes = ['lantern', 'dragon', 'angpao', 'cloud-cn', 'firecracker', 'fan'];
    else if ((config.style as string) === 'seasonal-christmas') allowedTypes = ['xmas-tree', 'gift', 'snowflake', 'bell', 'candycane', 'santa-hat'];
    else if ((config.style as string) === 'seasonal-newyear') allowedTypes = ['firework', 'champagne', 'clock-ny', 'balloon', 'party-hat', 'party-popper', 'starburst'];
    else if ((config.style as string) === 'seasonal-valentine') allowedTypes = ['heart', 'rose', 'love-letter', 'ring'];

    // Filter if user has selected specific shapes
    if (config.styleOptions.shapeTypes.length > 0) {
        const filtered = allowedTypes.filter(t => config.styleOptions.shapeTypes.includes(t));
        if (filtered.length > 0) allowedTypes = filtered;
    }

    for (let i = 0; i < config.complexity; i++) {
        const { x, y } = getPosition(config.composition, width, height, rng, config.compositionOptions);
        let type: ShapeData['type'] = 'circle';
        let assetId: string | undefined;

        if (config.customImage.assets.length > 0) {
            type = 'image';
            // Pick a random asset from the available list
            assetId = rng.nextItem(config.customImage.assets).id;
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
}

// Generates the abstract data model for the pattern
export const generateShapeData = (width: number, height: number, config: LayerConfig): ShapeData[] => {
    const rng = new RNG(config.seed);
    const baseSize = Math.min(width, height) * (config.scale / 10);

    if (config.style === 'isometric') return generateIsometric(width, height, baseSize, config, rng);
    if (config.style === 'grid') return generateGrid(width, height, baseSize, config, rng);
    if (config.style === 'hex') return generateHex(width, height, baseSize, config, rng);
    if (config.style === 'waves') return generateWaves(width, height, config, rng);
    if (config.style === 'mosaic') return generateMosaic(width, height, baseSize, config, rng);
    if (config.style === 'radial') return generateRadial(width, height, baseSize, config, rng);

    // Default Scatter Styles
    return generateStandardScatter(width, height, baseSize, config, rng);
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
}