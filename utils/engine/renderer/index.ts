// Main renderer entry point

import { AppState, ShapeOverride } from '../../../types';
import { createOffscreenCanvas, createNoisePattern } from './utils';
import { drawShape } from './shapes';
import { renderLayer } from './layer';

// Re-export for external use
export { createNoisePattern, createOffscreenCanvas } from './utils';
export { drawShape } from './shapes';
export { drawText } from './layer';

export const renderToCanvas = (
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    width: number,
    height: number,
    state: AppState,
    loadedImages: Record<string, HTMLImageElement | ImageBitmap>,
    timestamp: number,
    noisePatternSource: HTMLCanvasElement | OffscreenCanvas | null,
    transparentBackground: boolean = false,
    tempCanvas: HTMLCanvasElement | OffscreenCanvas | null = null,
    transientOverrides?: Record<number, Partial<ShapeOverride>> // Added: Logic for optimized dragging
) => {
    if (width <= 0 || height <= 0) return;

    ctx.clearRect(0, 0, width, height);

    let layerCanvas = tempCanvas;
    if (!layerCanvas) {
        layerCanvas = createOffscreenCanvas(width, height);
    } else if (layerCanvas.width !== width || layerCanvas.height !== height) {
        layerCanvas.width = width;
        layerCanvas.height = height;
    }

    const layerCtx = layerCanvas.getContext('2d') as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

    state.layers.forEach((layer) => {
        if (!layer.visible) return;

        const durationMs = layer.config.animation.duration * 1000;
        const layerProgress = durationMs > 0 ? (timestamp % durationMs) / durationMs : 0;

        layerCtx.globalAlpha = 1;
        layerCtx.globalCompositeOperation = 'source-over';
        layerCtx.clearRect(0, 0, width, height);
        if (layerCtx.setTransform) layerCtx.setTransform(1, 0, 0, 1, 0, 0);
        if (layerCtx.filter) layerCtx.filter = 'none';

        // Pass transient overrides ONLY if this is the active layer (optimized for editing)
        const overridesForLayer = (layer.id === state.activeLayerId) ? transientOverrides : undefined;

        renderLayer(layerCtx, width, height, layer.config, loadedImages, layerProgress, noisePatternSource, overridesForLayer, layer.id);

        ctx.save();
        ctx.globalAlpha = layer.opacity;
        ctx.globalCompositeOperation = layer.blendMode;
        ctx.drawImage(layerCanvas as any, 0, 0);
        ctx.restore();
    });
};
