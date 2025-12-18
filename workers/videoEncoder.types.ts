// Video Export Worker Types
import type { AppState } from '../types';

export type VideoExportMode = 'fast' | 'quality';

export interface EncodeMessage {
    type: 'encode';
    state: AppState;
    loadedImages: Record<string, string>; // base64 encoded images
    duration: number;
    fps: number;
    resolution: 'SD' | 'HD' | '4K';
    width: number;
    height: number;
}

export interface ProgressMessage {
    type: 'progress';
    phase: 'rendering' | 'encoding';
    percent: number;
    message: string;
}

export interface CompleteMessage {
    type: 'complete';
    blob: Blob;
}

export interface ErrorMessage {
    type: 'error';
    error: string;
}

export type WorkerMessage = ProgressMessage | CompleteMessage | ErrorMessage;
