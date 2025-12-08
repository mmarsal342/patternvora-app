
import { AppState, ShapeData, LayerConfig, TextConfig, ShapeOverride } from '../../types';
import { adjustColor } from './math';
import { generateShapeData } from './generators';
import { applyAnimation } from './animator';

// Helper to create canvas in any environment (Browser or Worker)
const createOffscreenCanvas = (width: number, height: number): OffscreenCanvas | HTMLCanvasElement => {
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

export const drawShape = (
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    shape: ShapeData,
    width: number,
    height: number,
    config: LayerConfig,
    loadedImages: Record<string, HTMLImageElement | ImageBitmap>,
    progress: number,
    offsetX: number = 0,
    offsetY: number = 0
) => {
    ctx.save();
    
    // Check if wave (waves generally handle their own full-width drawing, but might need offset if vertical wrapping needed)
    if (shape.type === 'wave') {
        ctx.translate(offsetX, offsetY);
        
        ctx.fillStyle = shape.color;
        let speedMultiplier = 1;
        const anim = config.animation;

        if (anim.enabled && (anim.primary === 'orbit' || anim.primary === 'scan')) {
             speedMultiplier = Math.max(1, Math.round(anim.intensity));
        }

        const direction = anim.direction === 'normal' ? 1 : -1;
        const t = (anim.enabled ? progress * Math.PI * 2 : 0) * shape.speedFactor * speedMultiplier * direction;
        
        let amplitude = shape.size * 0.3; 
        if (anim.enabled && anim.secondary === 'pulse') {
             const pulseScale = 1 + Math.sin(t + shape.phaseOffset) * (0.3 * anim.intensity);
             amplitude *= pulseScale;
        }

        // --- SEAMLESS WAVE LOGIC ---
        // Calculate Integer Cycles for Seamless Loop based on Scale
        const baseCycles = 3; 
        const cycles = Math.max(1, Math.round(baseCycles * config.scale));
        // Frequency: ensures exactly 'cycles' sine waves fit in 'width'
        // Formula: width * freq = cycles * 2PI  => freq = (cycles * 2PI) / width
        const frequency = (cycles * Math.PI * 2) / width;
        const baseY = shape.y; 

        ctx.beginPath();
        // Extend drawing slightly beyond bounds to prevent gaps
        const startX = -50;
        const endX = width + 50;
        const step = 10;
        
        // Ribbon Thickness
        const thickness = shape.size; 

        // 1. Draw Top Curve (Forward)
        ctx.moveTo(startX, baseY + Math.sin(startX * frequency + shape.phaseOffset + t) * amplitude);
        for (let x = startX; x <= endX; x += step) {
            const y = baseY + Math.sin(x * frequency + shape.phaseOffset + t) * amplitude;
            ctx.lineTo(x, y);
        }

        // 2. Draw Bottom Curve (Backward) to create a closed ribbon shape
        for (let x = endX; x >= startX; x -= step) {
            const y = baseY + Math.sin(x * frequency + shape.phaseOffset + t) * amplitude + thickness;
            ctx.lineTo(x, y);
        }

        ctx.closePath();
        ctx.fill();
        
    } else {
        // Apply Wrapping Offset + Shape Position
        ctx.translate(shape.x + offsetX, shape.y + offsetY);
        ctx.rotate(shape.rotation * Math.PI / 180);
        
        ctx.fillStyle = shape.color;
        ctx.strokeStyle = shape.color;
        ctx.lineWidth = config.strokeWidth * (width / 1000); 

        const size = shape.size;
        
        if (shape.type === 'circle') {
            ctx.beginPath();
            ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
            shape.stroke ? ctx.stroke() : ctx.fill();
        } else if (shape.type === 'rect') {
            if (shape.stroke) {
                ctx.strokeRect(-size / 2, -size / 2, size, size);
            } else {
                ctx.fillRect(-size / 2, -size / 2, size, size);
            }
        } else if (shape.type === 'triangle') {
            ctx.beginPath();
            ctx.moveTo(0, -size / 2);
            ctx.lineTo(size / 2, size / 2);
            ctx.lineTo(-size / 2, size / 2);
            ctx.closePath();
            shape.stroke ? ctx.stroke() : ctx.fill();
        } else if (shape.type === 'image' && shape.assetId && loadedImages[shape.assetId]) {
            try {
                const img = loadedImages[shape.assetId];
                if (config.customImage.originalColors) {
                    ctx.drawImage(img as any, -size/2, -size/2, size, size);
                } else {
                    const tempCanvas = createOffscreenCanvas(size, size);
                    const tempCtx = tempCanvas.getContext('2d') as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
                    if (tempCtx) {
                        tempCtx.drawImage(img as any, 0, 0, size, size);
                        tempCtx.globalCompositeOperation = 'source-in';
                        tempCtx.fillStyle = shape.color;
                        tempCtx.fillRect(0, 0, size, size);
                        ctx.drawImage(tempCanvas, -size/2, -size/2);
                    }
                }
            } catch(e) {}
        } else if (shape.type === 'arc') {
            ctx.beginPath();
            ctx.arc(0, 0, size/2, 0, Math.PI, false); 
            shape.stroke ? ctx.stroke() : ctx.fill();
        } else if (shape.type === 'line') {
            ctx.beginPath();
            ctx.moveTo(-size/2, 0);
            ctx.lineTo(size/2, 0);
            ctx.lineWidth = Math.max(2, config.strokeWidth * 2);
            ctx.stroke();
        } else if (shape.type === 'star') {
            const spikes = 5;
            const outerRadius = size / 2;
            const innerRadius = size / 4;
            ctx.beginPath();
            for(let i=0; i<spikes*2; i++){
                const r = (i % 2 === 0) ? outerRadius : innerRadius;
                const a = (i / (spikes*2)) * Math.PI * 2 - Math.PI/2;
                ctx.lineTo(Math.cos(a)*r, Math.sin(a)*r);
            }
            ctx.closePath();
            shape.stroke ? ctx.stroke() : ctx.fill();
        } else if (shape.type === 'polygon') {
            const sides = shape.points || 6;
            const radius = size / 2;
            ctx.beginPath();
            for(let i=0; i<sides; i++) {
                const angle = (i / sides) * Math.PI * 2 - (Math.PI / 2);
                ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
            }
            ctx.closePath();
            shape.stroke ? ctx.stroke() : ctx.fill();
        } else if (shape.type === 'blob') {
            const r = size/2;
            ctx.beginPath();
            ctx.moveTo(r, 0);
            ctx.bezierCurveTo(r, r*0.5, r*0.5, r, 0, r);
            ctx.bezierCurveTo(-r*0.5, r, -r, r*0.5, -r, 0);
            ctx.bezierCurveTo(-r, -r*0.5, -r*0.5, -r, 0, -r);
            ctx.bezierCurveTo(r*0.5, -r, r, -r*0.5, r, 0);
            ctx.fill();
        } else if (shape.type === 'char') {
            ctx.font = `bold ${size}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(shape.char || 'A', 0, 0);
        } else if (shape.type === 'cube') {
             const r = size / 2;
             const angle30 = Math.PI / 6;
             const dx = Math.cos(angle30) * r;
             const dy = Math.sin(angle30) * r;
             ctx.beginPath();
             ctx.moveTo(0, -r);
             ctx.lineTo(dx, -dy);
             ctx.lineTo(0, 0);
             ctx.lineTo(-dx, -dy);
             ctx.closePath();
             ctx.fillStyle = adjustColor(shape.color, 40); 
             ctx.fill();

             ctx.beginPath();
             ctx.moveTo(0, 0);
             ctx.lineTo(dx, -dy);
             ctx.lineTo(dx, r - dy);
             ctx.lineTo(0, r);
             ctx.closePath();
             ctx.fillStyle = shape.color; 
             ctx.fill();

             ctx.beginPath();
             ctx.moveTo(0, 0);
             ctx.lineTo(-dx, -dy);
             ctx.lineTo(-dx, r - dy);
             ctx.lineTo(0, r);
             ctx.closePath();
             ctx.fillStyle = adjustColor(shape.color, -40); 
             ctx.fill();
        } else if (shape.type === 'zigzag') {
             ctx.beginPath();
             const w = size;
             const h = size/3;
             ctx.moveTo(-w/2, 0);
             const zigs = 4;
             const step = w / zigs;
             for(let i=0; i<zigs; i++) {
                 const x = -w/2 + step * i;
                 ctx.lineTo(x + step/2, (i%2===0) ? -h : h);
                 ctx.lineTo(x + step, 0);
             }
             ctx.lineCap = 'round';
             ctx.lineJoin = 'round';
             ctx.lineWidth = Math.max(2, size/10);
             ctx.stroke();
        } else if (shape.type === 'cross') {
             const thick = size / 3;
             ctx.fillStyle = shape.color;
             ctx.beginPath();
             ctx.rect(-thick/2, -size/2, thick, size);
             ctx.rect(-size/2, -thick/2, size, thick);
             ctx.fill();
        } else if (shape.type === 'donut') {
             ctx.beginPath();
             ctx.arc(0, 0, size/2, 0, Math.PI * 2);
             ctx.lineWidth = size/4;
             ctx.stroke();
        } else if (shape.type === 'pill') {
             const w = size;
             const h = size/2;
             const r = h/2;
             ctx.beginPath();
             ctx.moveTo(-w/2 + r, -h/2);
             ctx.lineTo(w/2 - r, -h/2);
             ctx.arc(w/2 - r, 0, r, -Math.PI/2, Math.PI/2);
             ctx.lineTo(-w/2 + r, h/2);
             ctx.arc(-w/2 + r, 0, r, Math.PI/2, -Math.PI/2);
             ctx.closePath();
             shape.stroke ? ctx.stroke() : ctx.fill();
        }
    }
    ctx.restore();
}

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

        if (textConfig.masking) {
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
            ctx.fillText(line, 0, (i * lineHeight) - (totalH/2) + (lineHeight/2));
        });
        ctx.restore();
    }
}

// Render Logic for a Single Layer
const renderLayer = (
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

    if (config.text.enabled && config.text.content && config.text.masking) {
        // --- MASKING MODE ---
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
}

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

      renderLayer(layerCtx, width, height, layer.config, loadedImages, layerProgress, noisePatternSource, overridesForLayer);

      ctx.save();
      ctx.globalAlpha = layer.opacity;
      ctx.globalCompositeOperation = layer.blendMode;
      ctx.drawImage(layerCanvas as any, 0, 0);
      ctx.restore();
  });
};
