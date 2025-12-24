// Structure post-processing for shape data
// Applies regularity, size consistency, rotation lock, distribution, spacing, and color distribution

import { ShapeData, StructureConfig, RotationLock, LayerConfig, DistributionMode, ColorDistribution } from '../../../types';
import { RNG } from '../../rng';

/**
 * Apply structure controls to an array of shapes
 * This is a post-processing step that modifies shape positions, sizes, rotations, and colors
 * based on the structure configuration
 */
export const applyStructureControls = (
    shapes: ShapeData[],
    config: LayerConfig,
    width: number,
    height: number,
    rng: RNG
): ShapeData[] => {
    const structure = config.structure;
    if (!structure) return shapes;

    // Skip for styles that manage their own structure
    const skipStyles = ['truchet', 'guilloche', 'herringbone', 'waves', 'isometric', 'grid', 'hex', 'mosaic'];
    if (skipStyles.includes(config.style)) {
        return shapes;
    }

    // First pass: apply distribution mode
    let processedShapes = applyDistributionMode(shapes, structure.distributionMode, width, height, rng);

    // Second pass: apply individual shape transforms + color distribution
    processedShapes = processedShapes.map((shape, index) => {
        const processed = { ...shape };

        // 1. Apply Regularity (position snapping to grid)
        processed.x = applyRegularity(shape.x, width, structure.regularity, rng, index, 'x');
        processed.y = applyRegularity(shape.y, height, structure.regularity, rng, index, 'y');

        // 2. Apply Size Variation Control
        processed.size = applySizeVariation(shape.size, config.scale, structure.sizeVariation, rng);

        // 3. Apply Rotation Lock
        processed.rotation = applyRotationLock(shape.rotation, structure.rotationLock);

        // 4. Apply Color Distribution
        processed.color = applyColorDistribution(
            config.palette.colors,
            index,
            processedShapes.length,
            processed.x,
            processed.y,
            width,
            height,
            structure.colorDistribution,
            rng
        );

        return processed;
    });

    // Third pass: apply minimum spacing (collision avoidance)
    if (structure.minSpacing > 0) {
        processedShapes = applyMinSpacing(processedShapes, structure.minSpacing, width, height);
    }

    return processedShapes;
};

/**
 * Apply distribution mode to reposition shapes
 */
const applyDistributionMode = (
    shapes: ShapeData[],
    mode: DistributionMode,
    width: number,
    height: number,
    rng: RNG
): ShapeData[] => {
    if (mode === 'scatter') return shapes; // Default behavior

    const centerX = width / 2;
    const centerY = height / 2;

    return shapes.map((shape, index) => {
        const processed = { ...shape };
        const t = index / Math.max(1, shapes.length - 1); // 0 to 1

        switch (mode) {
            case 'flow': {
                // Shapes flow from left to right with vertical variation
                const flowX = t * width;
                const flowY = centerY + Math.sin(t * Math.PI * 3) * (height * 0.3);
                // Blend with original position
                processed.x = shape.x * 0.3 + flowX * 0.7;
                processed.y = shape.y * 0.3 + flowY * 0.7;
                break;
            }

            case 'cluster': {
                // Shapes cluster toward center with falloff
                const distToCenter = Math.sqrt(
                    Math.pow(shape.x - centerX, 2) + Math.pow(shape.y - centerY, 2)
                );
                const maxDist = Math.sqrt(centerX * centerX + centerY * centerY);
                const clusterStrength = 0.6;
                const factor = 1 - (distToCenter / maxDist) * clusterStrength;
                processed.x = centerX + (shape.x - centerX) * factor;
                processed.y = centerY + (shape.y - centerY) * factor;
                break;
            }

            case 'wave': {
                // Shapes arranged in horizontal waves
                const waveCount = 4;
                const waveY = (index % waveCount) / waveCount * height;
                const waveOffset = Math.sin(t * Math.PI * 2) * (height * 0.1);
                processed.x = shape.x; // Keep horizontal position
                processed.y = shape.y * 0.4 + (waveY + waveOffset) * 0.6;
                break;
            }

            case 'spiral': {
                // Shapes spiral outward from center
                const angle = t * Math.PI * 6; // 3 rotations
                const radius = t * Math.min(width, height) * 0.45;
                const spiralX = centerX + Math.cos(angle) * radius;
                const spiralY = centerY + Math.sin(angle) * radius;
                // Blend with original
                processed.x = shape.x * 0.2 + spiralX * 0.8;
                processed.y = shape.y * 0.2 + spiralY * 0.8;
                break;
            }
        }

        return processed;
    });
};

/**
 * Apply regularity to a position value
 * 0% = original random position
 * 100% = perfect grid alignment
 */
const applyRegularity = (
    originalPos: number,
    canvasSize: number,
    regularity: number,
    rng: RNG,
    index: number,
    axis: 'x' | 'y'
): number => {
    if (regularity === 0) return originalPos;

    // Calculate grid cell size based on a reasonable grid
    const gridSize = Math.max(8, Math.sqrt(100)); // ~10x10 grid
    const cellSize = canvasSize / gridSize;

    // Find nearest grid point
    const gridIndex = Math.round(originalPos / cellSize);
    const gridPos = gridIndex * cellSize + cellSize / 2; // Center of cell

    // Interpolate between original and grid position based on regularity
    const t = regularity / 100;
    return originalPos * (1 - t) + gridPos * t;
};

/**
 * Apply size variation control
 * 0% = uniform size (all shapes same size)
 * 100% = maximum variation (original behavior)
 */
const applySizeVariation = (
    originalSize: number,
    baseScale: number,
    sizeVariation: number,
    rng: RNG
): number => {
    if (sizeVariation >= 100) return originalSize;

    // Calculate base uniform size (average size based on scale)
    const baseSize = baseScale * 30; // Reference size

    // Interpolate between uniform and original
    const t = sizeVariation / 100;
    return baseSize * (1 - t) + originalSize * t;
};

/**
 * Apply rotation lock to snap rotation to specific angles
 */
const applyRotationLock = (
    originalRotation: number,
    rotationLock: RotationLock
): number => {
    if (rotationLock === 'free') return originalRotation;

    // Normalize rotation to 0-360
    let normalized = originalRotation % 360;
    if (normalized < 0) normalized += 360;

    if (rotationLock === '90deg') {
        // Snap to 0, 90, 180, 270
        const angles = [0, 90, 180, 270];
        return findClosestAngle(normalized, angles);
    }

    if (rotationLock === '45deg') {
        // Snap to 0, 45, 90, 135, 180, 225, 270, 315
        const angles = [0, 45, 90, 135, 180, 225, 270, 315];
        return findClosestAngle(normalized, angles);
    }

    return originalRotation;
};

const findClosestAngle = (normalized: number, angles: number[]): number => {
    let closest = 0;
    let minDiff = 360;

    for (const angle of angles) {
        const diff = Math.abs(normalized - angle);
        const diffWrapped = Math.min(diff, 360 - diff);
        if (diffWrapped < minDiff) {
            minDiff = diffWrapped;
            closest = angle;
        }
    }
    return closest;
};

/**
 * Apply color distribution based on position or index
 */
const applyColorDistribution = (
    palette: string[],
    index: number,
    totalShapes: number,
    x: number,
    y: number,
    width: number,
    height: number,
    mode: ColorDistribution,
    rng: RNG
): string => {
    if (palette.length === 0) return '#000000';
    if (palette.length === 1 || mode === 'random') {
        return palette[Math.floor(rng.nextFloat() * palette.length)];
    }

    const paletteLen = palette.length;
    let colorIndex: number;

    switch (mode) {
        case 'gradient-h': {
            // Horizontal gradient (left to right)
            const t = x / width;
            colorIndex = Math.floor(t * paletteLen);
            break;
        }

        case 'gradient-v': {
            // Vertical gradient (top to bottom)
            const t = y / height;
            colorIndex = Math.floor(t * paletteLen);
            break;
        }

        case 'gradient-radial': {
            // Radial gradient from center
            const cx = width / 2, cy = height / 2;
            const maxDist = Math.sqrt(cx * cx + cy * cy);
            const dist = Math.sqrt(Math.pow(x - cx, 2) + Math.pow(y - cy, 2));
            const t = dist / maxDist;
            colorIndex = Math.floor(t * paletteLen);
            break;
        }

        case 'zones': {
            // Divide canvas into zones based on palette colors
            const cols = Math.ceil(Math.sqrt(paletteLen));
            const rows = Math.ceil(paletteLen / cols);
            const colIndex = Math.floor((x / width) * cols);
            const rowIndex = Math.floor((y / height) * rows);
            colorIndex = (rowIndex * cols + colIndex) % paletteLen;
            break;
        }

        case 'alternating': {
            // Alternate colors by shape index
            colorIndex = index % paletteLen;
            break;
        }

        default:
            colorIndex = Math.floor(rng.nextFloat() * paletteLen);
    }

    return palette[Math.min(colorIndex, paletteLen - 1)];
};

/**
 * Apply minimum spacing to push overlapping shapes apart
 */
const applyMinSpacing = (
    shapes: ShapeData[],
    minSpacingPercent: number,
    width: number,
    height: number
): ShapeData[] => {
    // Convert percentage to actual spacing factor
    const spacingFactor = minSpacingPercent / 100;

    // Simple collision avoidance - push overlapping shapes apart
    const result = shapes.map(s => ({ ...s }));

    // Multiple passes for better separation
    for (let pass = 0; pass < 3; pass++) {
        for (let i = 0; i < result.length; i++) {
            for (let j = i + 1; j < result.length; j++) {
                const a = result[i];
                const b = result[j];

                const dx = b.x - a.x;
                const dy = b.y - a.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                // Minimum distance based on both shapes' sizes
                const minDist = (a.size + b.size) * 0.5 * (1 + spacingFactor);

                if (dist < minDist && dist > 0) {
                    // Push apart
                    const overlap = minDist - dist;
                    const pushX = (dx / dist) * overlap * 0.5;
                    const pushY = (dy / dist) * overlap * 0.5;

                    result[i].x -= pushX;
                    result[i].y -= pushY;
                    result[j].x += pushX;
                    result[j].y += pushY;

                    // Keep within bounds
                    result[i].x = Math.max(0, Math.min(width, result[i].x));
                    result[i].y = Math.max(0, Math.min(height, result[i].y));
                    result[j].x = Math.max(0, Math.min(width, result[j].x));
                    result[j].y = Math.max(0, Math.min(height, result[j].y));
                }
            }
        }
    }

    return result;
};
