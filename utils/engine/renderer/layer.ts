// Layer rendering and text drawing

import { TextConfig, LayerConfig, ShapeData, ShapeOverride } from '../../../types';
import { generateShapeData, generateMosaicTextFill } from '../generators';
import { applyAnimation } from '../animator';
import { drawShape } from './shapes';

export const drawText = (
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    width: number,
    height: number,
    textConfig: TextConfig
) => {
    if (textConfig.enabled && textConfig.content) {
        ctx.save();
        const tx = (textConfig.x / 100) * width;
        const ty = (textConfig.y / 100) * height;

        const fontSizePx = textConfig.fontSize * (width / 1000);
        ctx.font = `bold ${fontSizePx}px ${textConfig.fontFamily}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.translate(tx, ty);

        if (textConfig.maskingMode === 'clip') {
            ctx.fillStyle = '#000000';
            ctx.globalAlpha = 1;
        } else {
            ctx.globalCompositeOperation = textConfig.blendMode;
            ctx.globalAlpha = textConfig.opacity;
            ctx.fillStyle = textConfig.color;
        }

        const lines = textConfig.content.split('\n');
        const lineHeight = fontSizePx * 1.2;
        const totalH = lines.length * lineHeight;
        lines.forEach((line, i) => {
            ctx.fillText(line, 0, (i * lineHeight) - (totalH / 2) + (lineHeight / 2));
        });
        ctx.restore();
    }
};

// Render Logic for a Single Layer
export const renderLayer = (
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    width: number,
    height: number,
    config: LayerConfig,
    loadedImages: Record<string, HTMLImageElement | ImageBitmap>,
    progress: number,
    noisePatternSource: HTMLCanvasElement | OffscreenCanvas | null,
    transientOverrides?: Record<number, Partial<ShapeOverride>>
) => {
    const shapes = generateShapeData(width, height, config);

    // SEAMLESS WRAPPING LOGIC
    // We iterate through shapes and check if they overlap the canvas edges.
    // If they do, we draw them again on the opposite side.
    const renderShapeWithWrapping = (shape: ShapeData) => {
        const stored = config.overrides[shape.index] || {};
        const trans = transientOverrides?.[shape.index] || {};
        const override = { ...stored, ...trans };

        if (override.hidden) return;

        // Apply overrides to a temporary working shape object for calculation
        // NOTE: We don't mutate original shape to keep generators pure
        const renderX = override.x !== undefined ? (override.x / 100) * width : shape.x;
        const renderY = override.y !== undefined ? (override.y / 100) * height : shape.y;
        const renderSize = override.size !== undefined ? shape.size * override.size : shape.size;

        // Mutate the shape object just for this render call context (it's safe as shapes are regenerated per frame)
        shape.x = renderX;
        shape.y = renderY;
        shape.size = renderSize;
        if (override.rotation !== undefined) shape.rotation = override.rotation;
        if (override.color !== undefined) shape.color = override.color;

        if (config.animation.enabled) {
            applyAnimation(shape, progress, width, height, config.animation);
        }

        // 1. Draw Original
        drawShape(ctx, shape, width, height, config, loadedImages, progress, 0, 0);

        // 2. Seamless Wrapping Checks
        // Only needed for scatter/random styles where shapes might cross edges arbitrarily.
        // Grid/Hex/Mosaic usually handle their own tiling, but wrapping them ensures perfect seams if they are offset.

        // Use a safe bounding radius. For waves, size is essentially the thickness.
        const radius = shape.type === 'wave' ? shape.size : Math.max(shape.size / 1.5, 1);

        const wrapsRight = shape.x + radius > width;
        const wrapsLeft = shape.x - radius < 0;
        const wrapsBottom = shape.y + radius > height;
        const wrapsTop = shape.y - radius < 0;

        // Horizontal Wrapping
        if (wrapsRight) drawShape(ctx, shape, width, height, config, loadedImages, progress, -width, 0);
        if (wrapsLeft) drawShape(ctx, shape, width, height, config, loadedImages, progress, width, 0);

        // Vertical Wrapping
        if (wrapsBottom) drawShape(ctx, shape, width, height, config, loadedImages, progress, 0, -height);
        if (wrapsTop) drawShape(ctx, shape, width, height, config, loadedImages, progress, 0, height);

        // Corner Wrapping (Diagonal overlap)
        if (wrapsRight && wrapsBottom) drawShape(ctx, shape, width, height, config, loadedImages, progress, -width, -height);
        if (wrapsRight && wrapsTop) drawShape(ctx, shape, width, height, config, loadedImages, progress, -width, height);
        if (wrapsLeft && wrapsBottom) drawShape(ctx, shape, width, height, config, loadedImages, progress, width, -height);
        if (wrapsLeft && wrapsTop) drawShape(ctx, shape, width, height, config, loadedImages, progress, width, height);
    };

    if (config.text.enabled && config.text.content && config.text.maskingMode === 'clip') {
        // --- CLIP MASKING MODE (pattern clipped to text) ---
        ctx.save();
        ctx.globalCompositeOperation = 'source-over';
        drawText(ctx, width, height, config.text);
        ctx.restore();

        ctx.globalCompositeOperation = 'source-in';
        ctx.fillStyle = config.palette.bg;
        ctx.fillRect(0, 0, width, height);

        ctx.globalCompositeOperation = 'source-atop';
        shapes.forEach(shape => renderShapeWithWrapping(shape));

        if (config.texture > 0 && noisePatternSource) {
            const noisePattern = ctx.createPattern(noisePatternSource, 'repeat');
            if (noisePattern) {
                ctx.save();
                ctx.globalAlpha = config.texture / 200;
                ctx.globalCompositeOperation = 'source-atop';
                ctx.fillStyle = noisePattern;
                ctx.fillRect(0, 0, width, height);
                ctx.restore();
            }
        }

    } else if (config.text.enabled && config.text.content && config.text.maskingMode === 'mosaic') {
        // --- MOSAIC MODE (shapes packed inside text) ---
        if (!config.transparentBackground) {
            ctx.fillStyle = config.palette.bg;
            ctx.fillRect(0, 0, width, height);
        }

        // Generate shapes that fill the text
        const mosaicShapes = generateMosaicTextFill(width, height, {
            text: {
                content: config.text.content,
                fontFamily: config.text.fontFamily,
                fontSize: config.text.fontSize,
                x: config.text.x,
                y: config.text.y
            },
            density: config.text.mosaicDensity,
            config
        });

        // Render mosaic shapes (they're already positioned inside text)
        mosaicShapes.forEach(shape => {
            if (config.animation.enabled) {
                applyAnimation(shape, progress, width, height, config.animation);
            }
            drawShape(ctx, shape, width, height, config, loadedImages, progress, 0, 0);
        });

        if (config.texture > 0 && noisePatternSource) {
            const noisePattern = ctx.createPattern(noisePatternSource, 'repeat');
            if (noisePattern) {
                ctx.save();
                ctx.globalAlpha = config.texture / 200;
                ctx.globalCompositeOperation = 'overlay';
                ctx.fillStyle = noisePattern;
                ctx.fillRect(0, 0, width, height);
                ctx.restore();
            }
        }

    } else {
        // --- STANDARD MODE (Layering) ---
        if (!config.transparentBackground) {
            ctx.fillStyle = config.palette.bg;
            ctx.fillRect(0, 0, width, height);
        }

        shapes.forEach(shape => renderShapeWithWrapping(shape));

        if (config.texture > 0 && noisePatternSource) {
            const noisePattern = ctx.createPattern(noisePatternSource, 'repeat');
            if (noisePattern) {
                ctx.save();
                ctx.globalAlpha = config.texture / 200;
                ctx.globalCompositeOperation = 'overlay';
                ctx.fillStyle = noisePattern;
                ctx.fillRect(0, 0, width, height);
                ctx.restore();
            }
        }

        if (config.text.enabled && config.text.content) {
            drawText(ctx, width, height, config.text);
        }
    }
};
