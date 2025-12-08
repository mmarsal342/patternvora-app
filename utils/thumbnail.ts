
import { AppState } from "../types";
import { getDimensions, renderToCanvas, createNoisePattern } from "./drawingEngine";

// Generates a small JPEG base64 string for the history film strip
export const generateThumbnail = (state: AppState, loadedImages: Record<string, HTMLImageElement>): string => {
    const thumbSize = 100; // Small size for performance
    const canvas = document.createElement('canvas');
    
    // Maintain aspect ratio in thumbnail
    const dims = getDimensions(state.aspectRatio, thumbSize);
    
    // Fit into 100x100 box
    const scale = Math.min(thumbSize / dims.width, thumbSize / dims.height);
    canvas.width = dims.width * scale;
    canvas.height = dims.height * scale;

    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    // Create a mini noise pattern buffer (standard 50% opacity source, renderer handles scaling per layer)
    const noise = createNoisePattern(50);

    renderToCanvas(ctx, canvas.width, canvas.height, state, loadedImages, 0, noise);

    // Export as Low Quality JPEG to save RAM
    return canvas.toDataURL('image/jpeg', 0.7);
};
