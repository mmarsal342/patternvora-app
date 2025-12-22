

import { AppState, CompositionType, ShapeData, LayerConfig, CompositionOptions, StrokeMode } from '../../types';
import { RNG } from '../rng';
import { applySymmetry } from './symmetry';

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
    else if ((config.style as string) === 'seasonal-ramadan') allowedTypes = ['crescent', 'star-islamic', 'mosque', 'lantern-ramadan', 'ketupat', 'dates'];

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

// --- TRUCHET TILES GENERATOR (CONNECTOR-BASED MAZE) ---
// Generates TRUE maze patterns where tiles connect at edges
// Each tile type defines edge connections (N/E/S/W)

export type TruchetTileType = 'arc-a' | 'arc-b' | 'diagonal-a' | 'diagonal-b' | 'straight-a' | 'straight-b' | 'zigzag-a' | 'zigzag-b';

// Tile connectivity definitions
// Edges: N=0, E=1, S=2, W=3
// Each tile connects pairs of edges
const TILE_CONNECTIONS: Record<TruchetTileType, [number, number][]> = {
    'arc-a': [[0, 1], [2, 3]],      // N↔E, S↔W (quarter arcs)
    'arc-b': [[0, 3], [1, 2]],      // N↔W, E↔S (mirrored arcs)
    'diagonal-a': [[0, 1], [2, 3]], // N↔E, S↔W (diagonal lines)
    'diagonal-b': [[0, 3], [1, 2]], // N↔W, E↔S (diagonal lines mirrored)
    'straight-a': [[0, 2]],         // N↔S (vertical through-line)
    'straight-b': [[1, 3]],         // E↔W (horizontal through-line)
    'zigzag-a': [[0, 1], [2, 3]],   // N↔E, S↔W but with stepped zigzag
    'zigzag-b': [[0, 3], [1, 2]],   // N↔W, E↔S but with stepped zigzag
};

// Get opposite edge (for neighbor matching)
const getOppositeEdge = (edge: number): number => (edge + 2) % 4;

// Check if tile has connection at specified edge
const hasEdgeConnection = (tileType: TruchetTileType, edge: number): boolean => {
    const connections = TILE_CONNECTIONS[tileType];
    return connections.some(([a, b]) => a === edge || b === edge);
};

export const generateTruchet = (width: number, height: number, config: LayerConfig, rng: RNG): ShapeData[] => {
    const shapes: ShapeData[] = [];

    // Get truchet options with defaults
    const truchetOpts = config.truchetOptions || { mazeDensity: 10, arcWeight: 5, concentricCount: 1, doubleStroke: false };

    // Grid size based on mazeDensity (4-20) - use square cells always!
    const mazeDensity = Math.max(4, Math.min(20, truchetOpts.mazeDensity || 10));

    // Calculate square cell size based on shorter dimension
    const minDim = Math.min(width, height);
    const cellSize = minDim / mazeDensity;

    // Calculate how many cells fit in each dimension
    const colCount = Math.ceil(width / cellSize);
    const rowCount = Math.ceil(height / cellSize);

    // Extract options
    const arcWeight = truchetOpts.arcWeight || 5;
    const concentricCount = truchetOpts.concentricCount || 1;
    const doubleStroke = truchetOpts.doubleStroke || false;

    // Pre-allocate tile grid for neighbor-aware connected mode
    // arc-a: N↔E, S↔W (exits at all 4 edges, but pairs are: top-right, bottom-left)
    // arc-b: N↔W, E↔S (exits at all 4 edges, but pairs are: top-left, bottom-right)
    const tileGrid: ('arc-a' | 'arc-b')[][] = [];
    for (let r = 0; r < rowCount; r++) {
        tileGrid[r] = [];
    }

    let globalIndex = 0;

    // Place tiles with neighbor-matching for connected paths
    for (let row = 0; row < rowCount; row++) {
        for (let col = 0; col < colCount; col++) {
            let selectedTile: 'arc-a' | 'arc-b';

            // For connected mode: match with left and top neighbors
            const leftTile = col > 0 ? tileGrid[row][col - 1] : null;
            const topTile = row > 0 ? tileGrid[row - 1][col] : null;

            // Scoring: prefer tiles that match neighbor directions
            let arcAScore = 1;
            let arcBScore = 1;

            if (leftTile) {
                // Left tile's right exit should match our left entry
                if (leftTile === 'arc-a') {
                    // arc-a exits to E at top → need arc-b (N↔W)
                    arcBScore += 10;
                } else {
                    // arc-b exits to E at bottom → need arc-a (S↔W)
                    arcAScore += 10;
                }
            }

            if (topTile) {
                // Top tile's bottom exit should match our top entry
                if (topTile === 'arc-a') {
                    // arc-a exits to S at left → need arc-b (N↔W)
                    arcBScore += 10;
                } else {
                    // arc-b exits to S at right → need arc-a (N↔E)
                    arcAScore += 10;
                }
            }

            // Weighted selection based on scores
            const totalScore = arcAScore + arcBScore;
            const roll = rng.nextFloat() * totalScore;
            selectedTile = roll < arcAScore ? 'arc-a' : 'arc-b';

            tileGrid[row][col] = selectedTile;

            // Cell center (using square cellSize)
            const cx = col * cellSize + cellSize / 2;
            const cy = row * cellSize + cellSize / 2;

            const color = rng.nextItem(config.palette.colors);

            // Encode: points = tileCode (1=arc-a, 2=arc-b)
            // Encode: seed = packed data: doubleStroke(1 bit) + arcWeight(4 bits) + concentricCount(2 bits)
            const tileCode = selectedTile === 'arc-a' ? 1 : 2;
            const packedSeed = (doubleStroke ? 64 : 0) + (arcWeight * 4) + concentricCount;

            shapes.push({
                index: globalIndex++,
                type: 'truchet-tile' as ShapeData['type'],
                x: cx,
                y: cy,
                size: cellSize * (config.scale / 1.2),
                rotation: 0,
                color,
                stroke: true,
                speedFactor: 1,
                phaseOffset: rng.nextFloat() * Math.PI * 2,
                points: tileCode,
                seed: packedSeed,
            });
        }
    }

    return shapes;
};

// --- GUILLOCHÉ / SPIROGRAPH GENERATOR ---
// Creates luxury banknote-style patterns using parametric curves

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

// --- HERRINGBONE / CHEVRON GENERATOR ---
// Creates classic tile patterns: herringbone, chevron, basket-weave

export const generateHerringbone = (width: number, height: number, config: LayerConfig, rng: RNG): ShapeData[] => {
    const shapes: ShapeData[] = [];

    const opts = config.herringboneOptions || {
        pattern: 'herringbone',
        tileRatio: 2.5,
        groutSize: 2,
        colorMode: 'alternating'
    };

    // Base tile size from complexity/scale
    const baseSize = Math.min(width, height) / (config.complexity / 10);
    const tileWidth = baseSize;
    const tileHeight = baseSize * opts.tileRatio;
    const grout = opts.groutSize;

    const colors = config.palette.colors;
    let index = 0;

    if (opts.pattern === 'herringbone') {
        // Classic herringbone: alternating V pattern
        const stepX = tileHeight + grout;
        const stepY = tileWidth + grout;

        for (let row = -1; row < Math.ceil(height / stepY) + 1; row++) {
            for (let col = -1; col < Math.ceil(width / stepX) + 1; col++) {
                const isEven = (row + col) % 2 === 0;
                const x = col * stepX + (isEven ? 0 : tileWidth / 2);
                const y = row * stepY + (isEven ? 0 : tileWidth / 2);

                // Get color based on mode
                let color: string;
                if (opts.colorMode === 'mono') {
                    color = colors[0];
                } else if (opts.colorMode === 'alternating') {
                    color = colors[isEven ? 0 : 1 % colors.length];
                } else {
                    color = colors[Math.floor(rng.nextFloat() * colors.length)];
                }

                shapes.push({
                    index: index++,
                    type: 'rect' as ShapeData['type'],
                    x: x + tileHeight / 2,
                    y: y + tileWidth / 2,
                    size: tileWidth,
                    rotation: isEven ? Math.PI / 4 : -Math.PI / 4,
                    color,
                    stroke: false,
                    speedFactor: 1,
                    phaseOffset: 0,
                    points: Math.round(opts.tileRatio * 10), // Encode ratio for rendering
                });
            }
        }
    } else if (opts.pattern === 'chevron') {
        // Chevron: V formation pointing up
        const stepX = tileWidth * 2 + grout;
        const stepY = tileHeight / 2 + grout;

        for (let row = -1; row < Math.ceil(height / stepY) + 2; row++) {
            for (let col = -1; col < Math.ceil(width / stepX) + 1; col++) {
                const baseX = col * stepX;
                const baseY = row * stepY;
                const offsetX = (row % 2) * (stepX / 2);

                // Left tile of V
                let color = opts.colorMode === 'mono' ? colors[0] :
                    opts.colorMode === 'alternating' ? colors[row % colors.length] :
                        colors[Math.floor(rng.nextFloat() * colors.length)];

                shapes.push({
                    index: index++,
                    type: 'rect' as ShapeData['type'],
                    x: baseX + offsetX + tileWidth / 2,
                    y: baseY + tileHeight / 4,
                    size: tileWidth,
                    rotation: Math.PI / 4,
                    color,
                    stroke: false,
                    speedFactor: 1,
                    phaseOffset: 0,
                    points: Math.round(opts.tileRatio * 10),
                });

                // Right tile of V
                shapes.push({
                    index: index++,
                    type: 'rect' as ShapeData['type'],
                    x: baseX + offsetX + tileWidth * 1.5,
                    y: baseY + tileHeight / 4,
                    size: tileWidth,
                    rotation: -Math.PI / 4,
                    color,
                    stroke: false,
                    speedFactor: 1,
                    phaseOffset: 0,
                    points: Math.round(opts.tileRatio * 10),
                });
            }
        }
    } else if (opts.pattern === 'basket-weave') {
        // Basket weave: alternating 2x horizontal / 2x vertical
        const cellSize = tileHeight + grout;

        for (let row = -1; row < Math.ceil(height / cellSize) + 1; row++) {
            for (let col = -1; col < Math.ceil(width / cellSize) + 1; col++) {
                const isHorizontal = (row + col) % 2 === 0;
                const baseX = col * cellSize;
                const baseY = row * cellSize;

                let color = opts.colorMode === 'mono' ? colors[0] :
                    opts.colorMode === 'alternating' ? colors[(row + col) % colors.length] :
                        colors[Math.floor(rng.nextFloat() * colors.length)];

                if (isHorizontal) {
                    // Two horizontal tiles
                    for (let i = 0; i < 2; i++) {
                        shapes.push({
                            index: index++,
                            type: 'rect' as ShapeData['type'],
                            x: baseX + tileHeight / 2,
                            y: baseY + tileWidth / 2 + i * (tileWidth + grout / 2),
                            size: tileWidth,
                            rotation: 0,
                            color,
                            stroke: false,
                            speedFactor: 1,
                            phaseOffset: 0,
                            points: Math.round(opts.tileRatio * 10),
                        });
                    }
                } else {
                    // Two vertical tiles
                    for (let i = 0; i < 2; i++) {
                        shapes.push({
                            index: index++,
                            type: 'rect' as ShapeData['type'],
                            x: baseX + tileWidth / 2 + i * (tileWidth + grout / 2),
                            y: baseY + tileHeight / 2,
                            size: tileWidth,
                            rotation: Math.PI / 2,
                            color,
                            stroke: false,
                            speedFactor: 1,
                            phaseOffset: 0,
                            points: Math.round(opts.tileRatio * 10),
                        });
                    }
                }
            }
        }
    }

    return shapes;
};

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
}