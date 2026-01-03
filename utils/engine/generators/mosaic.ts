// Mosaic pattern generator + Mosaic text fill

import { ShapeData, LayerConfig } from '../../../types';
import { RNG } from '../../rng';
import { getStrokeValue, createOffscreenCanvas } from './utils';

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

    const getDefaultTypes = (): ShapeData['type'][] => ['rect', 'polygon', 'circle', 'triangle', 'hexagon'];
    // User selection OVERRIDES style defaults
    let allowedTypes: ShapeData['type'][] = config.styleOptions.shapeTypes.length > 0
        ? config.styleOptions.shapeTypes as ShapeData['type'][]
        : getDefaultTypes();

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

// --- MOSAIC TEXT FILL GENERATOR ---
// Generates shapes that are packed tightly inside text boundaries
// Uses canvas hit-testing to determine which points fall inside the text

export interface MosaicTextFillParams {
    text: {
        content: string;
        fontFamily: string;
        fontSize: number;
        x: number; // percentage 0-100
        y: number; // percentage 0-100
    };
    density: number; // 0.5 - 2.0
    config: LayerConfig;
}

export const generateMosaicTextFill = (
    width: number,
    height: number,
    params: MosaicTextFillParams
): ShapeData[] => {
    const { text, density, config } = params;
    const rng = new RNG(config.seed);

    // Create offscreen canvas for text hit-testing
    const hitCanvas = createOffscreenCanvas(width, height);
    const hitCtx = hitCanvas.getContext('2d') as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
    if (!hitCtx) return [];

    // Calculate text positioning
    const tx = (text.x / 100) * width;
    const ty = (text.y / 100) * height;
    const fontSizePx = text.fontSize * (width / 1000);

    // Draw text as solid black shape for hit-testing
    hitCtx.fillStyle = '#000000';
    hitCtx.font = `bold ${fontSizePx}px ${text.fontFamily}`;
    hitCtx.textAlign = 'center';
    hitCtx.textBaseline = 'middle';

    const lines = text.content.split('\n');
    const lineHeight = fontSizePx * 1.2;
    const totalH = lines.length * lineHeight;
    lines.forEach((line, i) => {
        hitCtx.fillText(line, tx, ty + (i * lineHeight) - (totalH / 2) + (lineHeight / 2));
    });

    // Get pixel data for hit-testing
    const imageData = hitCtx.getImageData(0, 0, width, height);
    const pixels = imageData.data;

    // Function to check if a point is inside the text
    const isInsideText = (x: number, y: number): boolean => {
        const px = Math.floor(x);
        const py = Math.floor(y);
        if (px < 0 || px >= width || py < 0 || py >= height) return false;
        const idx = (py * width + px) * 4;
        // Check alpha channel (opaque = inside text)
        return pixels[idx + 3] > 128;
    };

    // Helper to get random asset ID if custom assets are available
    const getRandomAssetId = () => {
        if (config.customImage.assets.length > 0) {
            return rng.nextItem(config.customImage.assets).id;
        }
        return undefined;
    };

    // Determine shape types based on style
    let allowedTypes: ShapeData['type'][] = ['circle', 'rect', 'triangle'];

    if (config.style === 'geometric') allowedTypes = ['polygon', 'circle', 'rect', 'triangle', 'diamond', 'hexagon'];
    else if (config.style === 'organic') allowedTypes = ['blob', 'circle', 'semicircle'];
    else if (config.style === 'bauhaus') allowedTypes = ['arc', 'circle', 'rect', 'triangle', 'semicircle'];
    else if (config.style === 'confetti') allowedTypes = ['star', 'circle', 'triangle'];
    else if (config.style === 'memphis') allowedTypes = ['circle', 'rect', 'triangle', 'cross', 'star'];

    // Override with user selection if specified
    if (config.styleOptions.shapeTypes.length > 0) {
        allowedTypes = config.styleOptions.shapeTypes as ShapeData['type'][];
    }

    const shapes: ShapeData[] = [];

    // Calculate base shape size based on font size and density
    // Smaller fontsize = smaller shapes, higher density = smaller shapes
    const baseShapeSize = Math.max(8, (fontSizePx / 15) / density);
    const gridStep = baseShapeSize * 0.8; // Overlap slightly for better coverage

    // Estimate grid bounds from text position
    const textWidth = fontSizePx * 4; // Rough estimate
    const startX = Math.max(0, tx - textWidth);
    const endX = Math.min(width, tx + textWidth);
    const startY = Math.max(0, ty - totalH);
    const endY = Math.min(height, ty + totalH);

    let index = 0;

    // Grid-based sampling with jitter
    for (let y = startY; y < endY; y += gridStep) {
        for (let x = startX; x < endX; x += gridStep) {
            // Add random jitter for organic look
            const jitterX = (rng.nextFloat() - 0.5) * gridStep * 0.6;
            const jitterY = (rng.nextFloat() - 0.5) * gridStep * 0.6;
            const sampleX = x + jitterX;
            const sampleY = y + jitterY;

            // Check if center point is inside text
            if (!isInsideText(sampleX, sampleY)) continue;

            // Random chance to skip for variation
            if (rng.nextFloat() > 0.85) continue;

            const shapeType = config.customImage.assets.length > 0 ? 'image' : rng.nextItem(allowedTypes);
            const sizeVariation = rng.nextRange(0.6, 1.2);

            shapes.push({
                index: index++,
                type: shapeType,
                x: sampleX,
                y: sampleY,
                size: baseShapeSize * sizeVariation * config.scale,
                rotation: rng.nextRange(0, 360),
                color: rng.nextItem(config.palette.colors),
                stroke: getStrokeValue(config.strokeMode, shapeType, rng, 0.7),
                speedFactor: Math.floor(rng.nextRange(1, 3)),
                phaseOffset: rng.nextFloat() * Math.PI * 2,
                points: Math.floor(rng.nextRange(4, 7)),
                seed: rng.nextRange(0, 1000),
                assetId: getRandomAssetId()
            });
        }
    }

    return shapes;
};

// --- MOSAIC SHAPE FILL GENERATOR ---
// Generates shapes that are packed inside a PNG silhouette
// Colors are sampled from the original image pixels

export interface MosaicShapeFillParams {
    imageData: ImageData;  // Pre-loaded image data from source PNG
    imageWidth: number;    // Original image dimensions
    imageHeight: number;
    density: number;       // 0.5 - 2.0
    colorMode: 'raw' | 'palette';
    config: LayerConfig;
}

export const generateMosaicShapeFill = (
    width: number,
    height: number,
    params: MosaicShapeFillParams
): ShapeData[] => {
    const { imageData, imageWidth, imageHeight, density, colorMode, config } = params;
    const rng = new RNG(config.seed);
    const pixels = imageData.data;

    // Calculate scaling to fit image within canvas (centered)
    const scaleX = width / imageWidth;
    const scaleY = height / imageHeight;
    const scale = Math.min(scaleX, scaleY) * 0.8; // 80% of available space

    const scaledWidth = imageWidth * scale;
    const scaledHeight = imageHeight * scale;
    const offsetX = (width - scaledWidth) / 2;
    const offsetY = (height - scaledHeight) / 2;

    // Function to check if a point (in canvas coords) is inside the shape
    // and get the color at that point
    const getPixelInfo = (canvasX: number, canvasY: number): { inside: boolean; color: string } => {
        // Convert canvas coords to image coords
        const imgX = Math.floor((canvasX - offsetX) / scale);
        const imgY = Math.floor((canvasY - offsetY) / scale);

        if (imgX < 0 || imgX >= imageWidth || imgY < 0 || imgY >= imageHeight) {
            return { inside: false, color: '#000000' };
        }

        const idx = (imgY * imageWidth + imgX) * 4;
        const alpha = pixels[idx + 3];

        if (alpha <= 128) {
            return { inside: false, color: '#000000' };
        }

        // Get RGB color
        const r = pixels[idx];
        const g = pixels[idx + 1];
        const b = pixels[idx + 2];
        const color = `rgb(${r},${g},${b})`;

        return { inside: true, color };
    };

    // Determine shape types based on style
    let allowedTypes: ShapeData['type'][] = ['circle', 'rect', 'triangle'];

    if (config.style === 'geometric') allowedTypes = ['polygon', 'circle', 'rect', 'triangle', 'diamond', 'hexagon'];
    else if (config.style === 'organic') allowedTypes = ['blob', 'circle', 'semicircle'];
    else if (config.style === 'bauhaus') allowedTypes = ['arc', 'circle', 'rect', 'triangle', 'semicircle'];
    else if (config.style === 'confetti') allowedTypes = ['star', 'circle', 'triangle'];
    else if (config.style === 'memphis') allowedTypes = ['circle', 'rect', 'triangle', 'cross', 'star'];

    // Override with user selection if specified
    if (config.styleOptions.shapeTypes.length > 0) {
        allowedTypes = config.styleOptions.shapeTypes as ShapeData['type'][];
    }

    const shapes: ShapeData[] = [];

    // Calculate base shape size based on image size and density
    const avgDimension = (scaledWidth + scaledHeight) / 2;
    const baseShapeSize = Math.max(8, (avgDimension / 30) / density);
    const gridStep = baseShapeSize * 0.75; // Slight overlap for coverage

    let index = 0;

    // Grid-based sampling with jitter
    for (let y = offsetY; y < offsetY + scaledHeight; y += gridStep) {
        for (let x = offsetX; x < offsetX + scaledWidth; x += gridStep) {
            // Add random jitter for organic look
            const jitterX = (rng.nextFloat() - 0.5) * gridStep * 0.5;
            const jitterY = (rng.nextFloat() - 0.5) * gridStep * 0.5;
            const sampleX = x + jitterX;
            const sampleY = y + jitterY;

            // Check if point is inside shape and get color
            const pixelInfo = getPixelInfo(sampleX, sampleY);
            if (!pixelInfo.inside) continue;

            // Random chance to skip for variation
            if (rng.nextFloat() > 0.85) continue;

            const shapeType = rng.nextItem(allowedTypes);
            const sizeVariation = rng.nextRange(0.6, 1.2);

            // Determine color based on mode
            const shapeColor = colorMode === 'raw'
                ? pixelInfo.color
                : rng.nextItem(config.palette.colors);

            shapes.push({
                index: index++,
                type: shapeType,
                x: sampleX,
                y: sampleY,
                size: baseShapeSize * sizeVariation * config.scale,
                rotation: rng.nextRange(0, 360),
                color: shapeColor,
                stroke: getStrokeValue(config.strokeMode, shapeType, rng, 0.7),
                speedFactor: Math.floor(rng.nextRange(1, 3)),
                phaseOffset: rng.nextFloat() * Math.PI * 2,
                points: Math.floor(rng.nextRange(4, 7)),
                seed: rng.nextRange(0, 1000)
            });
        }
    }

    return shapes;
};
