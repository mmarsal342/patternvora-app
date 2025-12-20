// FFmpeg Video Encoder Worker
// Runs in background thread to keep UI responsive

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL, fetchFile } from '@ffmpeg/util';
import type { EncodeMessage, WorkerMessage } from './videoEncoder.types';
import type { AppState } from '../types';
import { renderToCanvas, getDimensions, createNoisePattern } from '../utils/drawingEngine';

let ffmpeg: FFmpeg | null = null;
let isFFmpegLoaded = false;

// Initialize FFmpeg (lazy load from CDN)
async function initializeFFmpeg() {
    if (isFFmpegLoaded && ffmpeg) return ffmpeg;

    ffmpeg = new FFmpeg();

    // Use self-hosted FFmpeg files (fixes CORS blocking from CDN)
    // Files served from /public/ffmpeg/ directory
    const baseURL = '/ffmpeg';

    await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });

    isFFmpegLoaded = true;
    return ffmpeg;
}

// Convert ImageData to PNG Blob
async function imageDataToBlob(imageData: ImageData): Promise<Blob> {
    const canvas = new OffscreenCanvas(imageData.width, imageData.height);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get canvas context');

    ctx.putImageData(imageData, 0, 0);
    return await canvas.convertToBlob({ type: 'image/png' });
}

// Load images from base64 strings
async function loadImages(imageMap: Record<string, string>): Promise<Record<string, HTMLImageElement>> {
    const loaded: Record<string, HTMLImageElement> = {};

    for (const [id, src] of Object.entries(imageMap)) {
        const img = new Image();
        img.src = src;
        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
        });
        loaded[id] = img;
    }

    return loaded;
}

// Main encoding function
self.onmessage = async (e: MessageEvent<EncodeMessage>) => {
    const { state, loadedImages, duration, fps, resolution, width, height } = e.data;

    try {
        // Send initial progress
        const sendProgress = (phase: 'rendering' | 'encoding', percent: number, message: string) => {
            const msg: WorkerMessage = { type: 'progress', phase, percent, message };
            self.postMessage(msg);
        };

        sendProgress('rendering', 0, 'Initializing...');

        // Load FFmpeg
        const ffmpegInstance = await initializeFFmpeg();
        sendProgress('rendering', 5, 'FFmpeg loaded');

        // Load images
        const images = await loadImages(loadedImages);
        sendProgress('rendering', 10, 'Images loaded');

        // Create noise pattern
        const noisePattern = createNoisePattern(50);

        // Render all frames
        const totalFrames = Math.floor(duration * fps);
        const canvas = new OffscreenCanvas(width, height);
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Failed to get canvas context');

        sendProgress('rendering', 15, `Rendering ${totalFrames} frames...`);

        for (let frame = 0; frame < totalFrames; frame++) {
            // CRITICAL FIX: Map frame [0, N-1] to progress [0, 1) for seamless looping
            // This ensures frame N-1 approaches progress=1 but never reaches it,
            // making it visually identical to frame 0 when the loop restarts
            // Formula: timeMs = (frame / totalFrames) * duration * 1000
            const progress = frame / totalFrames;
            const timeMs = progress * duration * 1000;

            // Render frame to canvas
            renderToCanvas(ctx, width, height, state, images, timeMs, noisePattern, false, null);

            // Extract ImageData
            const imageData = ctx.getImageData(0, 0, width, height);

            // Convert to PNG blob
            const blob = await imageDataToBlob(imageData);

            // Write to FFmpeg virtual filesystem
            const fileName = `frame${frame.toString().padStart(5, '0')}.png`;
            await ffmpegInstance.writeFile(fileName, await fetchFile(blob));

            // Update progress (15-50% for rendering)
            const renderProgress = 15 + (frame / totalFrames) * 35;
            if (frame % 10 === 0 || frame === totalFrames - 1) {
                sendProgress('rendering', renderProgress, `Rendered ${frame + 1}/${totalFrames} frames`);
            }
        }

        sendProgress('encoding', 50, 'Starting video encoding...');

        // Encode with FFmpeg
        await ffmpegInstance.exec([
            '-framerate', String(fps),
            '-i', 'frame%05d.png',
            '-c:v', 'libx264',
            '-preset', 'medium',  // medium = good balance of speed/quality
            '-crf', '18',         // 18 = visually lossless
            '-pix_fmt', 'yuv420p',
            '-movflags', '+faststart', // Enable streaming
            'output.mp4'
        ]);

        sendProgress('encoding', 90, 'Encoding complete, reading file...');

        // Read encoded file
        const data = await ffmpegInstance.readFile('output.mp4');
        // Convert FileData to Uint8Array for Blob compatibility (double assertion for strict types)
        const blob = new Blob([data as unknown as Uint8Array], { type: 'video/mp4' });

        // Clean up virtual filesystem
        for (let frame = 0; frame < totalFrames; frame++) {
            const fileName = `frame${frame.toString().padStart(5, '0')}.png`;
            try {
                await ffmpegInstance.deleteFile(fileName);
            } catch (e) {
                // Ignore cleanup errors
            }
        }
        try {
            await ffmpegInstance.deleteFile('output.mp4');
        } catch (e) {
            // Ignore
        }

        sendProgress('encoding', 100, 'Complete!');

        // Send result
        const completeMsg: WorkerMessage = { type: 'complete', blob };
        self.postMessage(completeMsg);

    } catch (error) {
        const errorMsg: WorkerMessage = {
            type: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
        };
        self.postMessage(errorMsg);
    }
};
