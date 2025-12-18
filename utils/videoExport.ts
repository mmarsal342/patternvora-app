// Video Export Service
// Handles both MediaRecorder (fast) and FFmpeg (quality) export modes

import type { AppState, VideoExportMode } from '../types';
import type { EncodeMessage, WorkerMessage } from '../workers/videoEncoder.types';
import { getDimensions } from './drawingEngine';

export interface ExportConfig {
    state: AppState;
    loadedImages: Record<string, HTMLImageElement>;
    mode: VideoExportMode;
    resolution: 'SD' | 'HD' | '4K';
    duration: number;
    fps: number;
    onProgress?: (percent: number, message: string) => void;
}

export interface ExportResult {
    blob: Blob;
    mode: VideoExportMode;
    resolution: string;
    duration: number;
}

export class VideoExportService {
    private worker: Worker | null = null;
    private mediaRecorder: MediaRecorder | null = null;
    private chunks: Blob[] = [];

    async export(config: ExportConfig): Promise<ExportResult> {
        if (config.mode === 'fast') {
            return this.exportWithMediaRecorder(config);
        } else {
            return this.exportWithFFmpeg(config);
        }
    }

    private async exportWithFFmpeg(config: ExportConfig): Promise<ExportResult> {
        return new Promise((resolve, reject) => {
            // Terminate any existing worker
            this.terminateWorker();

            // Convert loaded images to base64 strings for worker
            const imageMap: Record<string, string> = {};
            for (const [id, img] of Object.entries(config.loadedImages)) {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(img, 0, 0);
                    imageMap[id] = canvas.toDataURL();
                }
            }

            // Calculate dimensions
            const baseSize = config.resolution === 'SD' ? 1280 : config.resolution === '4K' ? 3840 : 1920;
            const dims = getDimensions(config.state.aspectRatio, baseSize);

            // Ensure even dimensions for video encoding
            const width = dims.width % 2 === 0 ? dims.width : dims.width - 1;
            const height = dims.height % 2 === 0 ? dims.height : dims.height - 1;

            // Create worker
            this.worker = new Worker(
                new URL('../workers/videoEncoder.worker.ts', import.meta.url),
                { type: 'module' }
            );

            // Handle worker messages
            this.worker.onmessage = (e: MessageEvent<WorkerMessage>) => {
                const msg = e.data;

                if (msg.type === 'progress') {
                    config.onProgress?.(msg.percent, msg.message);
                } else if (msg.type === 'complete') {
                    this.terminateWorker();
                    resolve({
                        blob: msg.blob,
                        mode: 'quality',
                        resolution: config.resolution,
                        duration: config.duration
                    });
                } else if (msg.type === 'error') {
                    this.terminateWorker();
                    reject(new Error(`FFmpeg encoding failed: ${msg.error}`));
                }
            };

            this.worker.onerror = (error) => {
                this.terminateWorker();
                reject(error);
            };

            // Send encode message
            const message: EncodeMessage = {
                type: 'encode',
                state: config.state,
                loadedImages: imageMap,
                duration: config.duration,
                fps: config.fps,
                resolution: config.resolution,
                width,
                height
            };

            this.worker.postMessage(message);
        });
    }

    private async exportWithMediaRecorder(config: ExportConfig): Promise<ExportResult> {
        // This will be implemented by integrating existing MediaRecorder code
        // For now, throw error to indicate not yet implemented
        throw new Error('MediaRecorder export not yet integrated - use quality mode');
    }

    private terminateWorker() {
        if (this.worker) {
            this.worker.terminate();
            this.worker = null;
        }
    }

    cleanup() {
        this.terminateWorker();
        if (this.mediaRecorder) {
            if (this.mediaRecorder.state === 'recording') {
                this.mediaRecorder.stop();
            }
            this.mediaRecorder = null;
        }
        this.chunks = [];
    }
}

// Singleton instance
let serviceInstance: VideoExportService | null = null;

export function getVideoExportService(): VideoExportService {
    if (!serviceInstance) {
        serviceInstance = new VideoExportService();
    }
    return serviceInstance;
}
