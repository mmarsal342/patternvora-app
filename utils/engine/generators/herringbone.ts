// Herringbone / Chevron / Basket-weave tile pattern generator

import { ShapeData, LayerConfig } from '../../../types';
import { RNG } from '../../rng';

export const generateHerringbone = (width: number, height: number, config: LayerConfig, rng: RNG): ShapeData[] => {
    const shapes: ShapeData[] = [];

    const opts = config.herringboneOptions || {
        pattern: 'herringbone',
        tileRatio: 2.5,
        groutSize: 2,
        colorMode: 'alternating'
    };

    // Base tile size from complexity/scale
    const baseSize = Math.min(width, height) / (config.complexity / 10);
    const tileWidth = baseSize;
    const tileHeight = baseSize * opts.tileRatio;
    const grout = opts.groutSize;

    const colors = config.palette.colors;
    let index = 0;

    if (opts.pattern === 'herringbone') {
        // Classic herringbone: alternating V pattern
        const stepX = tileHeight + grout;
        const stepY = tileWidth + grout;

        for (let row = -1; row < Math.ceil(height / stepY) + 1; row++) {
            for (let col = -1; col < Math.ceil(width / stepX) + 1; col++) {
                const isEven = (row + col) % 2 === 0;
                const x = col * stepX + (isEven ? 0 : tileWidth / 2);
                const y = row * stepY + (isEven ? 0 : tileWidth / 2);

                // Get color based on mode
                let color: string;
                if (opts.colorMode === 'mono') {
                    color = colors[0];
                } else if (opts.colorMode === 'alternating') {
                    color = colors[isEven ? 0 : 1 % colors.length];
                } else {
                    color = colors[Math.floor(rng.nextFloat() * colors.length)];
                }

                shapes.push({
                    index: index++,
                    type: 'rect' as ShapeData['type'],
                    x: x + tileHeight / 2,
                    y: y + tileWidth / 2,
                    size: tileWidth,
                    rotation: isEven ? Math.PI / 4 : -Math.PI / 4,
                    color,
                    stroke: false,
                    speedFactor: 1,
                    phaseOffset: 0,
                    points: Math.round(opts.tileRatio * 10), // Encode ratio for rendering
                });
            }
        }
    } else if (opts.pattern === 'chevron') {
        // Chevron: V formation pointing up
        const stepX = tileWidth * 2 + grout;
        const stepY = tileHeight / 2 + grout;

        for (let row = -1; row < Math.ceil(height / stepY) + 2; row++) {
            for (let col = -1; col < Math.ceil(width / stepX) + 1; col++) {
                const baseX = col * stepX;
                const baseY = row * stepY;
                const offsetX = (row % 2) * (stepX / 2);

                // Left tile of V
                let color = opts.colorMode === 'mono' ? colors[0] :
                    opts.colorMode === 'alternating' ? colors[row % colors.length] :
                        colors[Math.floor(rng.nextFloat() * colors.length)];

                shapes.push({
                    index: index++,
                    type: 'rect' as ShapeData['type'],
                    x: baseX + offsetX + tileWidth / 2,
                    y: baseY + tileHeight / 4,
                    size: tileWidth,
                    rotation: Math.PI / 4,
                    color,
                    stroke: false,
                    speedFactor: 1,
                    phaseOffset: 0,
                    points: Math.round(opts.tileRatio * 10),
                });

                // Right tile of V
                shapes.push({
                    index: index++,
                    type: 'rect' as ShapeData['type'],
                    x: baseX + offsetX + tileWidth * 1.5,
                    y: baseY + tileHeight / 4,
                    size: tileWidth,
                    rotation: -Math.PI / 4,
                    color,
                    stroke: false,
                    speedFactor: 1,
                    phaseOffset: 0,
                    points: Math.round(opts.tileRatio * 10),
                });
            }
        }
    } else if (opts.pattern === 'basket-weave') {
        // Basket weave: alternating 2x horizontal / 2x vertical
        const cellSize = tileHeight + grout;

        for (let row = -1; row < Math.ceil(height / cellSize) + 1; row++) {
            for (let col = -1; col < Math.ceil(width / cellSize) + 1; col++) {
                const isHorizontal = (row + col) % 2 === 0;
                const baseX = col * cellSize;
                const baseY = row * cellSize;

                let color = opts.colorMode === 'mono' ? colors[0] :
                    opts.colorMode === 'alternating' ? colors[(row + col) % colors.length] :
                        colors[Math.floor(rng.nextFloat() * colors.length)];

                if (isHorizontal) {
                    // Two horizontal tiles
                    for (let i = 0; i < 2; i++) {
                        shapes.push({
                            index: index++,
                            type: 'rect' as ShapeData['type'],
                            x: baseX + tileHeight / 2,
                            y: baseY + tileWidth / 2 + i * (tileWidth + grout / 2),
                            size: tileWidth,
                            rotation: 0,
                            color,
                            stroke: false,
                            speedFactor: 1,
                            phaseOffset: 0,
                            points: Math.round(opts.tileRatio * 10),
                        });
                    }
                } else {
                    // Two vertical tiles
                    for (let i = 0; i < 2; i++) {
                        shapes.push({
                            index: index++,
                            type: 'rect' as ShapeData['type'],
                            x: baseX + tileWidth / 2 + i * (tileWidth + grout / 2),
                            y: baseY + tileHeight / 2,
                            size: tileWidth,
                            rotation: Math.PI / 2,
                            color,
                            stroke: false,
                            speedFactor: 1,
                            phaseOffset: 0,
                            points: Math.round(opts.tileRatio * 10),
                        });
                    }
                }
            }
        }
    }

    return shapes;
};
