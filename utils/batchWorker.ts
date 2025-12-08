
import JSZip from 'jszip';
import { AppState } from '../types';
import { renderToCanvas, createNoisePattern } from './engine/renderer';
import { getDimensions } from './engine/math';
import { generateSVG } from './engine/svg';

// Worker Message Interface
interface BatchJob {
    type: 'START_BATCH';
    configs: { id: string; state: AppState; fileName: string }[];
    format: 'png' | 'jpg' | 'svg';
    size?: number; // Optional size parameter
    loadedImages: Record<string, ImageBitmap>; // Transferred ImageBitmaps
}

self.onmessage = async (e: MessageEvent<BatchJob>) => {
    const { type, configs, format, size, loadedImages } = e.data;

    if (type === 'START_BATCH') {
        try {
            const zip = new JSZip();
            const folder = zip.folder("patternvora-batch");
            // Default to 4K if no size provided
            const renderSize = size || 4096;
            
            for (let i = 0; i < configs.length; i++) {
                const config = configs[i];
                
                // Notify progress
                self.postMessage({ type: 'PROGRESS', value: ((i) / configs.length) * 100 });

                if (format === 'svg') {
                    // Render SVG
                    const dims = getDimensions(config.state.aspectRatio, 1000);
                    const svgString = await generateSVG(dims.width, dims.height, config.state, []);
                    folder?.file(`${config.fileName}.svg`, svgString);
                } else {
                    // Render Bitmap (Dynamic Size)
                    const dims = getDimensions(config.state.aspectRatio, renderSize);
                    const canvas = new OffscreenCanvas(dims.width, dims.height);
                    const ctx = canvas.getContext('2d');
                    
                    if (ctx) {
                        const noise = createNoisePattern(50);
                        const transparent = format === 'png';
                        
                        // Casting loadedImages to any because renderer accepts Record<string, HTMLImageElement | ImageBitmap>
                        renderToCanvas(
                            ctx, 
                            dims.width, 
                            dims.height, 
                            config.state, 
                            loadedImages, 
                            0, 
                            noise, 
                            transparent
                        );

                        const mime = format === 'png' ? 'image/png' : 'image/jpeg';
                        const blob = await canvas.convertToBlob({ type: mime, quality: 0.9 });
                        folder?.file(`${config.fileName}.${format === 'png' ? 'png' : 'jpg'}`, blob);
                    }
                }
            }

            self.postMessage({ type: 'PROGRESS', value: 95 });
            const content = await zip.generateAsync({ type: "blob" });
            
            self.postMessage({ type: 'DONE', blob: content });

        } catch (err) {
            console.error(err);
            self.postMessage({ type: 'ERROR', message: String(err) });
        }
    }
};
