
import { AppState, FontDef, LayerConfig, TextConfig, ShapeData } from '../../types';
import { generateShapeData, generateMosaicTextFill } from './generators';
import { adjustColor } from './math';
import { getSeasonalShapeSVG, isSeasonalShape } from './shapes/svg';

const getSVGTextNodes = (width: number, height: number, textConfig: TextConfig, forceColor?: string): string => {
    if (!textConfig.enabled || !textConfig.content) return '';

    const tx = (textConfig.x / 100) * width;
    const ty = (textConfig.y / 100) * height;
    const fontSizePx = textConfig.fontSize * (width / 1000);
    const fontFamily = textConfig.fontFamily.replace(/['"]/g, '');
    const color = forceColor || textConfig.color;
    const lines = textConfig.content.split('\n');
    const lineHeight = fontSizePx * 1.2;
    const totalH = lines.length * lineHeight;

    const startY = ty - (totalH / 2) + (lineHeight / 2);

    const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    let nodes = `<text x="${tx}" y="${startY}" font-family="${fontFamily}" font-size="${fontSizePx}" fill="${color}" text-anchor="middle" font-weight="bold" dominant-baseline="middle">`;

    lines.forEach((line, i) => {
        const lineY = startY + (i * lineHeight);
        if (lines.length > 0) {
            nodes += `<tspan x="${tx}" y="${lineY}">${escape(line)}</tspan>`;
        } else {
            nodes += escape(line);
        }
    });

    nodes += `</text>`;
    return nodes;
}

// Generates SVG string for a single shape instance
// Updated to accept width/height for wave calculations
const getSingleShapeSVG = (
    shape: ShapeData,
    config: LayerConfig,
    width: number,
    height: number,
    offsetX: number = 0,
    offsetY: number = 0
): string => {

    // WAVE HANDLING
    // Waves are special because they are generated paths based on width, not simple transforms
    if (shape.type === 'wave') {
        const amplitude = shape.size * 0.3;

        // --- SEAMLESS WAVE CALCULATIONS ---
        const baseCycles = 3;
        const cycles = Math.max(1, Math.round(baseCycles * config.scale));
        const frequency = (cycles * Math.PI * 2) / width;
        // ----------------------------------

        // Adjust base Y by offset (for wrapping)
        const baseY = shape.y + offsetY;

        // Extend slightly beyond bounds for safety 
        // Note: For wrapping to work perfectly with waves, the 'offsetX' is handled by the loop construction, 
        // but 'offsetY' simply shifts the wave up/down.
        const startX = -10 + offsetX;
        const endX = width + 10 + offsetX;
        const step = Math.max(10, width / 50);

        // Use Ribbon/Band Style to match Canvas
        const thickness = shape.size;

        // Top Curve
        let d = `M ${startX} ${baseY + Math.sin(startX * frequency + shape.phaseOffset) * amplitude}`;
        for (let x = startX; x <= endX; x += step) {
            const y = baseY + Math.sin(x * frequency + shape.phaseOffset) * amplitude;
            d += ` L ${x} ${y}`;
        }

        // Bottom Curve (Backward)
        for (let x = endX; x >= startX; x -= step) {
            const y = baseY + Math.sin(x * frequency + shape.phaseOffset) * amplitude + thickness;
            d += ` L ${x} ${y}`;
        }

        d += ` Z`;
        return `<path d="${d}" fill="${shape.color}" />`;
    }

    // STANDARD SHAPE HANDLING
    const color = shape.color;
    const cx = shape.x + offsetX;
    const cy = shape.y + offsetY;
    const size = shape.size;
    const rot = shape.rotation;
    const isStroke = shape.stroke;
    const strokeWidth = config.strokeWidth * (1000 / 1000); // Normalized stroke width

    const transform = `transform="translate(${cx}, ${cy}) rotate(${rot})"`;

    // Helper for fill vs stroke attributes
    const getFillOrStroke = () => isStroke
        ? `fill="none" stroke="${color}" stroke-width="${Math.max(2, strokeWidth * 2)}"`
        : `fill="${color}"`;

    let content = '';

    if (shape.type === 'circle') {
        content += `<circle r="${size / 2}" ${getFillOrStroke()} />`;
    } else if (shape.type === 'rect') {
        content += `<rect x="${-size / 2}" y="${-size / 2}" width="${size}" height="${size}" ${getFillOrStroke()} />`;
    } else if (shape.type === 'triangle') {
        const h = size * Math.sqrt(3) / 2;
        content += `<polygon points="0,${-h / 2} ${size / 2},${h / 2} ${-size / 2},${h / 2}" ${getFillOrStroke()} />`;
    } else if (shape.type === 'polygon') {
        const sides = shape.points || 6;
        const radius = size / 2;
        let points = "";
        for (let i = 0; i < sides; i++) {
            const angle = (i / sides) * Math.PI * 2 - (Math.PI / 2);
            points += `${Math.cos(angle) * radius},${Math.sin(angle) * radius} `;
        }
        content += `<polygon points="${points.trim()}" ${getFillOrStroke()} />`;
    } else if (shape.type === 'donut') {
        content += `<circle r="${size / 2}" fill="none" stroke="${color}" stroke-width="${size / 4}" />`;
    } else if (shape.type === 'cross') {
        const thick = size / 3;
        content += `<rect x="${-thick / 2}" y="${-size / 2}" width="${thick}" height="${size}" ${getFillOrStroke()} />`;
        content += `<rect x="${-size / 2}" y="${-thick / 2}" width="${size}" height="${thick}" ${getFillOrStroke()} />`;
    } else if (shape.type === 'pill') {
        const w = size;
        const h = size / 2;
        content += `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="${h / 2}" ${getFillOrStroke()} />`;
    } else if (shape.type === 'cube') {
        const r = size / 2;
        const angle30 = Math.PI / 6;
        const dx = Math.cos(angle30) * r;
        const dy = Math.sin(angle30) * r;
        content += `<polygon points="0,${-r} ${dx},${-dy} 0,0 ${-dx},${-dy}" fill="${adjustColor(color, 40)}" />`;
        content += `<polygon points="0,0 ${dx},${-dy} ${dx},${r - dy} 0,${r}" fill="${color}" />`;
        content += `<polygon points="0,0 ${-dx},${-dy} ${-dx},${r - dy} 0,${r}" fill="${adjustColor(color, -40)}" />`;
    } else if (shape.type === 'zigzag') {
        const w = size;
        const h = size / 3;
        const zigs = 4;
        const step = w / zigs;
        let d = `M ${-w / 2} 0`;
        for (let i = 0; i < zigs; i++) {
            const x = -w / 2 + step * i;
            d += ` L ${x + step / 2} ${(i % 2 === 0) ? -h : h} L ${x + step} 0`;
        }
        content += `<path d="${d}" fill="none" stroke="${color}" stroke-width="${Math.max(2, size / 10)}" stroke-linecap="round" stroke-linejoin="round" />`;
    } else if (shape.type === 'char') {
        // Typo style - render character as text element
        const char = shape.char || 'A';
        content += `<text font-family="sans-serif" font-size="${size}" font-weight="bold" fill="${color}" text-anchor="middle" dominant-baseline="central">${char}</text>`;
    } else if (shape.type === 'arc') {
        // Half-circle arc
        const r = size / 2;
        content += isStroke
            ? `<path d="M ${-r} 0 A ${r} ${r} 0 0 1 ${r} 0" fill="none" stroke="${color}" stroke-width="${Math.max(2, strokeWidth * 2)}" />`
            : `<path d="M ${-r} 0 A ${r} ${r} 0 0 1 ${r} 0 Z" fill="${color}" />`;
    } else if (shape.type === 'line') {
        // Simple horizontal line
        content += `<line x1="${-size / 2}" y1="0" x2="${size / 2}" y2="0" stroke="${color}" stroke-width="${Math.max(2, strokeWidth * 2)}" stroke-linecap="round" />`;
    } else if (shape.type === 'star') {
        // 5-pointed star
        const spikes = 5;
        const outerRadius = size / 2;
        const innerRadius = size / 4;
        let points = "";
        for (let i = 0; i < spikes * 2; i++) {
            const r = (i % 2 === 0) ? outerRadius : innerRadius;
            const angle = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
            points += `${Math.cos(angle) * r},${Math.sin(angle) * r} `;
        }
        content += `<polygon points="${points.trim()}" ${getFillOrStroke()} />`;
    } else if (shape.type === 'blob') {
        // Organic blob shape using bezier curves
        const r = size / 2;
        const d = `M ${r} 0 C ${r} ${r * 0.5} ${r * 0.5} ${r} 0 ${r} C ${-r * 0.5} ${r} ${-r} ${r * 0.5} ${-r} 0 C ${-r} ${-r * 0.5} ${-r * 0.5} ${-r} 0 ${-r} C ${r * 0.5} ${-r} ${r} ${-r * 0.5} ${r} 0 Z`;
        content += `<path d="${d}" fill="${color}" />`;
    } else if (shape.type === 'image' && shape.assetId) {
        const asset = config.customImage.assets.find(a => a.id === shape.assetId);
        if (asset) {
            content += `<image href="${asset.src}" x="${-size / 2}" y="${-size / 2}" width="${size}" height="${size}" />`;
        }
    } else if (shape.type === 'truchet-tile') {
        // CONNECTOR-BASED TRUCHET TILES SVG
        // Tile types: 1=arc-a, 2=arc-b, 3=diag-a, 4=diag-b, 5=straight-a (N↔S), 6=straight-b (E↔W)
        const tileType = shape.points || 1;
        const r = size / 2;
        const strokeWidth = Math.max(4, config.strokeWidth * 2.5);
        const strokeProps = `fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round"`;

        if (tileType === 1) {
            // Arc-A: N↔E and S↔W
            content += `<path d="M 0 ${-r} A ${r} ${r} 0 0 1 ${r} 0" ${strokeProps} />`;
            content += `<path d="M 0 ${r} A ${r} ${r} 0 0 1 ${-r} 0" ${strokeProps} />`;
        } else if (tileType === 2) {
            // Arc-B: N↔W and E↔S
            content += `<path d="M 0 ${-r} A ${r} ${r} 0 0 0 ${-r} 0" ${strokeProps} />`;
            content += `<path d="M ${r} 0 A ${r} ${r} 0 0 1 0 ${r}" ${strokeProps} />`;
        } else if (tileType === 3) {
            // Diagonal-A: N↔E and S↔W
            content += `<line x1="0" y1="${-r}" x2="${r}" y2="0" ${strokeProps} />`;
            content += `<line x1="0" y1="${r}" x2="${-r}" y2="0" ${strokeProps} />`;
        } else if (tileType === 4) {
            // Diagonal-B: N↔W and E↔S
            content += `<line x1="0" y1="${-r}" x2="${-r}" y2="0" ${strokeProps} />`;
            content += `<line x1="${r}" y1="0" x2="0" y2="${r}" ${strokeProps} />`;
        } else if (tileType === 5) {
            // Straight-A: N↔S (vertical)
            content += `<line x1="0" y1="${-r}" x2="0" y2="${r}" ${strokeProps} />`;
        } else if (tileType === 6) {
            // Straight-B: E↔W (horizontal)
            content += `<line x1="${-r}" y1="0" x2="${r}" y2="0" ${strokeProps} />`;
        } else if (tileType === 7) {
            // Zigzag-A: N↔E and S↔W with stepped pattern
            content += `<polyline points="0,${-r} ${r * 0.5},${-r * 0.5} ${r},0" ${strokeProps} />`;
            content += `<polyline points="0,${r} ${-r * 0.5},${r * 0.5} ${-r},0" ${strokeProps} />`;
        } else if (tileType === 8) {
            // Zigzag-B: N↔W and E↔S with stepped pattern
            content += `<polyline points="0,${-r} ${-r * 0.5},${-r * 0.5} ${-r},0" ${strokeProps} />`;
            content += `<polyline points="${r},0 ${r * 0.5},${r * 0.5} 0,${r}" ${strokeProps} />`;
        }
    } else if (shape.type === 'guilloche-curve') {
        // Render guilloche curve as SVG polyline
        const pointsData = (shape as any).pointsData as number[] | undefined;
        if (pointsData && pointsData.length >= 4) {
            const strokeWeight = shape.seed || 2;
            const pointsStr = [];
            for (let i = 0; i < pointsData.length; i += 2) {
                pointsStr.push(`${pointsData[i].toFixed(2)},${pointsData[i + 1].toFixed(2)}`);
            }
            // Use polyline (not polygon) to avoid auto-closing straight line
            return `<polyline points="${pointsStr.join(' ')}" fill="none" stroke="${color}" stroke-width="${strokeWeight}" stroke-linecap="round" stroke-linejoin="round"/>`;
        }
    } else if (isSeasonalShape(shape.type)) {
        // Handle seasonal shapes (Christmas, CNY, Valentine, etc.)
        content += getSeasonalShapeSVG(shape.type as any, size, color);
    }

    return `<g ${transform}>${content}</g>`;
};

const generateLayerSVG = (width: number, height: number, config: LayerConfig, layerId: string): string => {
    let content = '';

    // Background Rect for Layer (not for clip mode)
    if (!config.transparentBackground && config.text.maskingMode !== 'clip') {
        content += `<rect width="100%" height="100%" fill="${config.palette.bg}"/>`;
    }

    const shapes = generateShapeData(width, height, config);

    for (const shape of shapes) {
        const override = config.overrides[shape.index] || {};
        if (override.hidden) continue;

        if (override.x !== undefined) shape.x = (override.x / 100) * width;
        if (override.y !== undefined) shape.y = (override.y / 100) * height;
        if (override.size !== undefined) shape.size *= override.size;
        if (override.rotation !== undefined) shape.rotation = override.rotation;
        if (override.color !== undefined) shape.color = override.color;

        // 1. Draw Original
        // Passing width/height now allows waves to render correctly here
        content += getSingleShapeSVG(shape, config, width, height, 0, 0);

        // 2. Wrapping Checks
        const radius = shape.type === 'wave' ? shape.size : Math.max(shape.size / 1.5, 1);

        const wrapsRight = shape.x + radius > width;
        const wrapsLeft = shape.x - radius < 0;
        const wrapsBottom = shape.y + radius > height;
        const wrapsTop = shape.y - radius < 0;

        if (wrapsRight) content += getSingleShapeSVG(shape, config, width, height, -width, 0);
        if (wrapsLeft) content += getSingleShapeSVG(shape, config, width, height, width, 0);
        if (wrapsBottom) content += getSingleShapeSVG(shape, config, width, height, 0, -height);
        if (wrapsTop) content += getSingleShapeSVG(shape, config, width, height, 0, height);

        // Corners
        if (wrapsRight && wrapsBottom) content += getSingleShapeSVG(shape, config, width, height, -width, -height);
        if (wrapsRight && wrapsTop) content += getSingleShapeSVG(shape, config, width, height, -width, height);
        if (wrapsLeft && wrapsBottom) content += getSingleShapeSVG(shape, config, width, height, width, -height);
        if (wrapsLeft && wrapsTop) content += getSingleShapeSVG(shape, config, width, height, width, height);
    }

    // --- PER LAYER TEXT SYSTEM (SVG) ---
    if (config.text.enabled && config.text.content) {
        if (config.text.maskingMode === 'clip') {
            // CLIP MODE: Pattern clipped to text shape
            const maskId = `textMask-${layerId}`;
            const maskDef = `
                <defs>
                    <mask id="${maskId}" maskUnits="userSpaceOnUse">
                         <rect width="100%" height="100%" fill="black" />
                         ${getSVGTextNodes(width, height, config.text, 'white')}
                    </mask>
                </defs>
            `;
            const backgroundRect = `<rect width="100%" height="100%" fill="${config.palette.bg}"/>`;
            return `${maskDef}<g mask="url(#${maskId})">${backgroundRect}${content}</g>`;
        } else if (config.text.maskingMode === 'mosaic') {
            // MOSAIC MODE: Individual shapes forming text
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

            for (const shape of mosaicShapes) {
                content += getSingleShapeSVG(shape, config, width, height, 0, 0);
            }
        } else {
            // NORMAL MODE: Text on top
            content += getSVGTextNodes(width, height, config.text);
        }
    }

    return content;
}

export const generateSVG = async (
    width: number,
    height: number,
    state: AppState,
    fonts: FontDef[],
    clipToCanvas: boolean = false
): Promise<string> => {
    // Build defs section for clipPath if needed
    const defsContent = clipToCanvas
        ? `<defs><clipPath id="canvas-clip"><rect x="0" y="0" width="${width}" height="${height}"/></clipPath></defs>`
        : '';

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">${defsContent}`;

    // Add global background from first visible layer (prevents black bars in viewers)
    const firstVisibleLayer = state.layers.find(l => l.visible);
    if (firstVisibleLayer && !firstVisibleLayer.config.transparentBackground) {
        svg += `<rect width="100%" height="100%" fill="${firstVisibleLayer.config.palette.bg}"/>`;
    }

    // Wrap content in clip group if clipToCanvas is enabled
    if (clipToCanvas) {
        svg += `<g clip-path="url(#canvas-clip)">`;
    }

    // Iterate Layers
    state.layers.forEach(layer => {
        if (!layer.visible) return;

        const opacity = layer.opacity !== 1 ? `opacity="${layer.opacity}"` : '';
        const blend = layer.blendMode !== 'source-over' ? `style="mix-blend-mode: ${layer.blendMode}"` : '';

        svg += `<g id="${layer.id}" ${opacity} ${blend}>`;
        svg += generateLayerSVG(width, height, layer.config, layer.id);
        svg += `</g>`;
    });

    // Close clip group if enabled
    if (clipToCanvas) {
        svg += `</g>`;
    }

    svg += `</svg>`;
    return svg;
};
