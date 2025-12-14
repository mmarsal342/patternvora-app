/**
 * Seasonal Shapes - Main Entry Point
 * 
 * This module exports all seasonal shape types and the main dispatcher.
 * 
 * To add a new seasonal event:
 * 1. Create a new file (e.g., halloween.ts) with draw functions
 * 2. Add shape types to types.ts
 * 3. Import and add cases to drawSeasonalShape below
 */

// Re-export types
export * from './types';

// Re-export helpers
export { adjustColorBrightness } from './helpers';

// Import shape drawing functions
import { drawLantern, drawDragon, drawAngpao, drawCloudCN, drawFirecracker, drawFan } from './cny';
import { drawXmasTree, drawGift, drawSnowflake, drawBell, drawCandycane, drawSantaHat } from './christmas';
import { drawFirework, drawChampagne, drawClockNY, drawBalloon, drawPartyHat, drawPartyPopper, drawStarburst } from './newyear';
import { drawHeart, drawRose, drawLoveLetter, drawRing } from './valentine';
import { drawCrescent, drawStarIslamic, drawMosque, drawLanternRamadan, drawKetupat, drawDates } from './ramadan';
import { SeasonalShape } from './types';

// Re-export individual draw functions for direct use
export {
    // CNY
    drawLantern, drawDragon, drawAngpao, drawCloudCN, drawFirecracker, drawFan,
    // Christmas
    drawXmasTree, drawGift, drawSnowflake, drawBell, drawCandycane, drawSantaHat,
    // New Year
    drawFirework, drawChampagne, drawClockNY, drawBalloon, drawPartyHat, drawPartyPopper, drawStarburst,
    // Valentine
    drawHeart, drawRose, drawLoveLetter, drawRing,
    // Ramadan
    drawCrescent, drawStarIslamic, drawMosque, drawLanternRamadan, drawKetupat, drawDates
};

/**
 * Main dispatcher to draw any seasonal shape by type
 */
export const drawSeasonalShape = (
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    type: SeasonalShape,
    size: number,
    color: string,
    stroke: boolean
) => {
    switch (type) {
        // CNY
        case 'lantern': drawLantern(ctx, size, color, stroke); break;
        case 'dragon': drawDragon(ctx, size, color, stroke); break;
        case 'angpao': drawAngpao(ctx, size, color, stroke); break;
        case 'cloud-cn': drawCloudCN(ctx, size, color, stroke); break;
        case 'firecracker': drawFirecracker(ctx, size, color, stroke); break;
        case 'fan': drawFan(ctx, size, color, stroke); break;
        // Christmas
        case 'xmas-tree': drawXmasTree(ctx, size, color, stroke); break;
        case 'gift': drawGift(ctx, size, color, stroke); break;
        case 'snowflake': drawSnowflake(ctx, size, color, stroke); break;
        case 'bell': drawBell(ctx, size, color, stroke); break;
        case 'candycane': drawCandycane(ctx, size, color, stroke); break;
        case 'santa-hat': drawSantaHat(ctx, size, color, stroke); break;
        // New Year
        case 'firework': drawFirework(ctx, size, color, stroke); break;
        case 'champagne': drawChampagne(ctx, size, color, stroke); break;
        case 'clock-ny': drawClockNY(ctx, size, color, stroke); break;
        case 'balloon': drawBalloon(ctx, size, color, stroke); break;
        case 'party-hat': drawPartyHat(ctx, size, color, stroke); break;
        case 'party-popper': drawPartyPopper(ctx, size, color, stroke); break;
        case 'starburst': drawStarburst(ctx, size, color, stroke); break;
        // Valentine
        case 'heart': drawHeart(ctx, size, color, stroke); break;
        case 'rose': drawRose(ctx, size, color, stroke); break;
        case 'love-letter': drawLoveLetter(ctx, size, color, stroke); break;
        case 'ring': drawRing(ctx, size, color, stroke); break;
        // Ramadan
        case 'crescent': drawCrescent(ctx, size, color, stroke); break;
        case 'star-islamic': drawStarIslamic(ctx, size, color, stroke); break;
        case 'mosque': drawMosque(ctx, size, color, stroke); break;
        case 'lantern-ramadan': drawLanternRamadan(ctx, size, color, stroke); break;
        case 'ketupat': drawKetupat(ctx, size, color, stroke); break;
        case 'dates': drawDates(ctx, size, color, stroke); break;
    }
};
