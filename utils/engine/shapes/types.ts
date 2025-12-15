/**
 * Seasonal Shapes - Type Definitions
 * Central location for all shape type exports
 */

// CNY Shape Types
export const CNY_SHAPES = ['lantern', 'dragon', 'angpao', 'cloud-cn', 'firecracker', 'fan'] as const;
export type CNYShape = typeof CNY_SHAPES[number];

// Christmas Shape Types
export const CHRISTMAS_SHAPES = ['xmas-tree', 'gift', 'snowflake', 'bell', 'candycane', 'santa-hat'] as const;
export type ChristmasShape = typeof CHRISTMAS_SHAPES[number];

// New Year Shape Types
export const NEWYEAR_SHAPES = ['firework', 'champagne', 'clock-ny', 'balloon', 'party-hat', 'party-popper', 'starburst'] as const;
export type NewYearShape = typeof NEWYEAR_SHAPES[number];

// Valentine Shape Types
export const VALENTINE_SHAPES = ['heart', 'rose', 'love-letter', 'ring'] as const;
export type ValentineShape = typeof VALENTINE_SHAPES[number];

// Ramadan/Eid Shape Types
export const RAMADAN_SHAPES = ['crescent', 'star-islamic', 'mosque', 'lantern-ramadan', 'ketupat', 'dates'] as const;
export type RamadanShape = typeof RAMADAN_SHAPES[number];

// All seasonal shapes combined
export const SEASONAL_SHAPES = [...CNY_SHAPES, ...CHRISTMAS_SHAPES, ...NEWYEAR_SHAPES, ...VALENTINE_SHAPES, ...RAMADAN_SHAPES] as const;
export type SeasonalShape = typeof SEASONAL_SHAPES[number];

// Category type
export type SeasonalCategory = 'cny' | 'christmas' | 'newyear' | 'valentine' | 'ramadan';
