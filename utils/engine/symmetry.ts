// Wallpaper Symmetry Group Transforms
// Applies kaleidoscope/mirror effects to shape arrays

import { ShapeData } from '../../types';

/**
 * Mirror shapes across vertical axis (X reflection)
 */
export const mirrorX = (shapes: ShapeData[], centerX: number): ShapeData[] => {
    return shapes.map((s, idx) => ({
        ...s,
        index: s.index + shapes.length + idx,
        x: centerX + (centerX - s.x),
        rotation: -s.rotation,  // Flip rotation for mirrored shapes
    }));
};

/**
 * Mirror shapes across horizontal axis (Y reflection)
 */
export const mirrorY = (shapes: ShapeData[], centerY: number): ShapeData[] => {
    return shapes.map((s, idx) => ({
        ...s,
        index: s.index + shapes.length + idx,
        y: centerY + (centerY - s.y),
        rotation: Math.PI - s.rotation,  // Flip rotation
    }));
};

/**
 * Mirror shapes across both axes (XY reflection / 180° rotation)
 */
export const mirrorXY = (shapes: ShapeData[], centerX: number, centerY: number): ShapeData[] => {
    return shapes.map((s, idx) => ({
        ...s,
        index: s.index + shapes.length + idx,
        x: centerX + (centerX - s.x),
        y: centerY + (centerY - s.y),
        rotation: s.rotation + Math.PI,  // 180° rotation
    }));
};

/**
 * Rotate shapes around center point
 */
export const rotateShapes = (
    shapes: ShapeData[],
    angle: number,
    centerX: number,
    centerY: number,
    indexOffset: number
): ShapeData[] => {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    return shapes.map((s, idx) => {
        // Translate to origin, rotate, translate back
        const dx = s.x - centerX;
        const dy = s.y - centerY;

        return {
            ...s,
            index: s.index + indexOffset + idx,
            x: centerX + dx * cos - dy * sin,
            y: centerY + dx * sin + dy * cos,
            rotation: s.rotation + angle,
        };
    });
};

/**
 * Apply wallpaper symmetry group to shapes
 * 
 * pm: Mirror (2 copies - original + X-mirrored)
 * pmm: Double Mirror (4 copies - all quadrants)
 * p4m: Square Kaleidoscope (8 copies - 90° rotations + mirrors)
 */
export const applySymmetry = (
    shapes: ShapeData[],
    group: 'none' | 'pm' | 'pmm' | 'p4m',
    width: number,
    height: number
): ShapeData[] => {
    if (group === 'none' || shapes.length === 0) {
        return shapes;
    }

    const cx = width / 2;
    const cy = height / 2;
    const result: ShapeData[] = [];

    if (group === 'pm') {
        // pm: Original + X-mirror (2 copies)
        result.push(...shapes);
        result.push(...mirrorX(shapes, cx));
    }

    if (group === 'pmm') {
        // pmm: 4-quadrant mirror (4 copies)
        result.push(...shapes);
        result.push(...mirrorX(shapes, cx));
        result.push(...mirrorY(shapes, cy));
        result.push(...mirrorXY(shapes, cx, cy));
    }

    if (group === 'p4m') {
        // p4m: 8-way symmetry (90° rotations + mirrors)
        const angles = [0, Math.PI / 2, Math.PI, Math.PI * 1.5];
        let offset = 0;

        for (const angle of angles) {
            const rotated = angle === 0
                ? shapes
                : rotateShapes(shapes, angle, cx, cy, offset);
            result.push(...rotated);
            offset += shapes.length;

            // Mirror each rotated version
            const mirrored = mirrorX(rotated, cx);
            result.push(...mirrored.map((s, i) => ({ ...s, index: s.index + offset + i })));
            offset += shapes.length;
        }
    }

    // Re-index all shapes
    return result.map((s, i) => ({ ...s, index: i }));
};
