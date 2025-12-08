// Facade for the new engine structure
export { getDimensions, safeMod, adjustColor } from './engine/math';
export { applyAnimation } from './engine/animator';
export { generateShapeData, getShapeAtPosition } from './engine/generators';
export { renderToCanvas, createNoisePattern, drawShape } from './engine/renderer';
export { generateSVG } from './engine/svg';
export type { ShapeData } from '../types';
