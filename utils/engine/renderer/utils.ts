// Renderer utility functions

// Helper to create canvas in any environment (Browser or Worker)
export const createOffscreenCanvas = (width: number, height: number): OffscreenCanvas | HTMLCanvasElement => {
    const safeWidth = Math.max(1, Math.ceil(width));
    const safeHeight = Math.max(1, Math.ceil(height));

    if (typeof OffscreenCanvas !== 'undefined') {
        return new OffscreenCanvas(safeWidth, safeHeight);
    } else if (typeof document !== 'undefined') {
        const c = document.createElement('canvas');
        c.width = safeWidth;
        c.height = safeHeight;
        return c;
    }
    throw new Error('Canvas not supported in this environment');
};

export const createNoisePattern = (opacity: number): HTMLCanvasElement | OffscreenCanvas | null => {
    if (opacity <= 0) return null;

    // Create pattern canvas
    const canvas = createOffscreenCanvas(200, 200);
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
    if (!ctx) return null;

    const imageData = ctx.createImageData(200, 200);
    const buffer = new Uint32Array(imageData.data.buffer);

    for (let i = 0; i < buffer.length; i++) {
        const val = Math.random() * 255;
        buffer[i] = (255 << 24) | (val << 16) | (val << 8) | val;
    }
    ctx.putImageData(imageData, 0, 0);

    return canvas;
};
