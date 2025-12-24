// Truchet maze tile generator

import { ShapeData, LayerConfig } from '../../../types';
import { RNG } from '../../rng';

export const generateTruchet = (width: number, height: number, config: LayerConfig, rng: RNG): ShapeData[] => {
    const shapes: ShapeData[] = [];

    // Get truchet options with defaults
    const truchetOpts = config.truchetOptions || { mazeDensity: 10, arcWeight: 5, concentricCount: 1, doubleStroke: false };

    // Grid size based on mazeDensity (4-20) - use square cells always!
    const mazeDensity = Math.max(4, Math.min(20, truchetOpts.mazeDensity || 10));

    // Calculate square cell size based on shorter dimension
    const minDim = Math.min(width, height);
    const cellSize = minDim / mazeDensity;

    // Calculate how many cells fit in each dimension
    const colCount = Math.ceil(width / cellSize);
    const rowCount = Math.ceil(height / cellSize);

    // Extract options
    const arcWeight = truchetOpts.arcWeight || 5;
    const concentricCount = truchetOpts.concentricCount || 1;
    const doubleStroke = truchetOpts.doubleStroke || false;

    // Pre-allocate tile grid for neighbor-aware connected mode
    // arc-a: N↔E, S↔W (exits at all 4 edges, but pairs are: top-right, bottom-left)
    // arc-b: N↔W, E↔S (exits at all 4 edges, but pairs are: top-left, bottom-right)
    const tileGrid: ('arc-a' | 'arc-b')[][] = [];
    for (let r = 0; r < rowCount; r++) {
        tileGrid[r] = [];
    }

    let globalIndex = 0;

    // Place tiles with neighbor-matching for connected paths
    for (let row = 0; row < rowCount; row++) {
        for (let col = 0; col < colCount; col++) {
            let selectedTile: 'arc-a' | 'arc-b';

            // For connected mode: match with left and top neighbors
            const leftTile = col > 0 ? tileGrid[row][col - 1] : null;
            const topTile = row > 0 ? tileGrid[row - 1][col] : null;

            // Scoring: prefer tiles that match neighbor directions
            let arcAScore = 1;
            let arcBScore = 1;

            if (leftTile) {
                // Left tile's right exit should match our left entry
                if (leftTile === 'arc-a') {
                    // arc-a exits to E at top → need arc-b (N↔W)
                    arcBScore += 10;
                } else {
                    // arc-b exits to E at bottom → need arc-a (S↔W)
                    arcAScore += 10;
                }
            }

            if (topTile) {
                // Top tile's bottom exit should match our top entry
                if (topTile === 'arc-a') {
                    // arc-a exits to S at left → need arc-b (N↔W)
                    arcBScore += 10;
                } else {
                    // arc-b exits to S at right → need arc-a (N↔E)
                    arcAScore += 10;
                }
            }

            // Weighted selection based on scores
            const totalScore = arcAScore + arcBScore;
            const roll = rng.nextFloat() * totalScore;
            selectedTile = roll < arcAScore ? 'arc-a' : 'arc-b';

            tileGrid[row][col] = selectedTile;

            // Cell center (using square cellSize)
            const cx = col * cellSize + cellSize / 2;
            const cy = row * cellSize + cellSize / 2;

            const color = rng.nextItem(config.palette.colors);

            // Encode: points = tileCode (1=arc-a, 2=arc-b)
            // Encode: seed = packed data: doubleStroke(1 bit) + arcWeight(4 bits) + concentricCount(2 bits)
            const tileCode = selectedTile === 'arc-a' ? 1 : 2;
            const packedSeed = (doubleStroke ? 64 : 0) + (arcWeight * 4) + concentricCount;

            shapes.push({
                index: globalIndex++,
                type: 'truchet-tile' as ShapeData['type'],
                x: cx,
                y: cy,
                size: cellSize * (config.scale / 1.2),
                rotation: 0,
                color,
                stroke: true,
                speedFactor: 1,
                phaseOffset: rng.nextFloat() * Math.PI * 2,
                points: tileCode,
                seed: packedSeed,
            });
        }
    }

    return shapes;
};
