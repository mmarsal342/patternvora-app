/**
 * Seasonal Shape Definitions
 * Contains SVG-based drawing functions for seasonal themed patterns.
 * Each shape is designed to work with the existing canvas rendering engine.
 */

// Type for seasonal shape categories
export type SeasonalCategory = 'cny' | 'valentine' | 'halloween' | 'christmas';

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

// All seasonal shapes combined
export const SEASONAL_SHAPES = [...CNY_SHAPES, ...CHRISTMAS_SHAPES, ...NEWYEAR_SHAPES, ...VALENTINE_SHAPES] as const;
export type SeasonalShape = typeof SEASONAL_SHAPES[number];

/**
 * Draw a Chinese Lantern - Simple iconic shape
 * Clean oval body with cap and tassel
 */
export const drawLantern = (
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    size: number,
    color: string,
    stroke: boolean
) => {
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    const r = size / 2;
    ctx.lineWidth = Math.max(1, size / 20);

    // Main lantern body - simple rounded rectangle
    ctx.beginPath();
    ctx.roundRect(-r * 0.6, -r * 0.7, r * 1.2, r * 1.4, r * 0.3);
    stroke ? ctx.stroke() : ctx.fill();

    // Top cap - simple rectangle
    if (!stroke) {
        ctx.fillStyle = adjustColorBrightness(color, -30);
    }
    ctx.beginPath();
    ctx.roundRect(-r * 0.4, -r * 0.85, r * 0.8, r * 0.2, r * 0.05);
    stroke ? ctx.stroke() : ctx.fill();

    // Bottom cap
    ctx.beginPath();
    ctx.roundRect(-r * 0.35, r * 0.65, r * 0.7, r * 0.15, r * 0.05);
    stroke ? ctx.stroke() : ctx.fill();

    // Single tassel line
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, r * 0.8);
    ctx.lineTo(0, r * 1.1);
    ctx.stroke();
};

/**
 * Draw a Dragon - Abstract spiral design representing dragon luck/prosperity
 * Using a coin-like circular motif with decorative elements
 */
export const drawDragon = (
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    size: number,
    color: string,
    stroke: boolean
) => {
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    const r = size / 2;
    ctx.lineWidth = Math.max(2, size / 15);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Outer circle
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.85, 0, Math.PI * 2);
    stroke ? ctx.stroke() : ctx.fill();

    // Inner square hole (like Chinese coin - representing dragon prosperity)
    if (!stroke) {
        // Cut out center square
        ctx.save();
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.roundRect(-r * 0.25, -r * 0.25, r * 0.5, r * 0.5, r * 0.05);
        ctx.fill();
        ctx.restore();

        // Add decorative dots around (representing dragon scales)
        ctx.fillStyle = color;
        const dotCount = 8;
        const dotRadius = r * 0.08;
        const dotDistance = r * 0.6;
        for (let i = 0; i < dotCount; i++) {
            const angle = (i / dotCount) * Math.PI * 2;
            const x = Math.cos(angle) * dotDistance;
            const y = Math.sin(angle) * dotDistance;
            ctx.beginPath();
            ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
            ctx.fill();
        }
    }
};

/**
 * Draw an Angpao (Red Envelope) - Already acceptable, minor cleanup
 */
export const drawAngpao = (
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    size: number,
    color: string,
    stroke: boolean
) => {
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    const w = size * 0.65;
    const h = size * 0.85;
    ctx.lineWidth = Math.max(1, size / 25);

    // Main envelope body
    ctx.beginPath();
    ctx.roundRect(-w / 2, -h / 2, w, h, size * 0.06);
    stroke ? ctx.stroke() : ctx.fill();

    // Flap triangle at top
    if (!stroke) {
        ctx.fillStyle = adjustColorBrightness(color, -25);
        ctx.beginPath();
        ctx.moveTo(-w / 2, -h / 2);
        ctx.lineTo(0, -h * 0.05);
        ctx.lineTo(w / 2, -h / 2);
        ctx.closePath();
        ctx.fill();
    }

    // Gold circle decoration
    ctx.fillStyle = '#FFD700';
    ctx.strokeStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(0, h * 0.12, size * 0.12, 0, Math.PI * 2);
    stroke ? ctx.stroke() : ctx.fill();
};

/**
 * Draw a Chinese Cloud - Simple stylized cloud with swirl
 */
export const drawCloudCN = (
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    size: number,
    color: string,
    stroke: boolean
) => {
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    const r = size / 2;
    ctx.lineWidth = Math.max(1, size / 20);

    // Simple 3-bump cloud shape
    ctx.beginPath();

    // Left bump
    ctx.arc(-r * 0.45, 0, r * 0.4, Math.PI * 0.7, Math.PI * 1.9);
    // Center bump (bigger)
    ctx.arc(r * 0.1, -r * 0.1, r * 0.5, Math.PI * 1.1, Math.PI * 1.95);
    // Right bump
    ctx.arc(r * 0.55, r * 0.05, r * 0.35, Math.PI * 1.2, Math.PI * 0.3);
    // Bottom curve back
    ctx.quadraticCurveTo(r * 0.3, r * 0.4, -r * 0.1, r * 0.35);
    ctx.quadraticCurveTo(-r * 0.5, r * 0.35, -r * 0.7, r * 0.1);

    ctx.closePath();
    stroke ? ctx.stroke() : ctx.fill();
};

/**
 * Draw a Firecracker - Cleaner cylinder with fuse
 */
export const drawFirecracker = (
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    size: number,
    color: string,
    stroke: boolean
) => {
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    const w = size * 0.28;
    const h = size * 0.75;
    ctx.lineWidth = Math.max(1, size / 25);

    // Main cylinder body
    ctx.beginPath();
    ctx.roundRect(-w / 2, -h / 2, w, h, w * 0.15);
    stroke ? ctx.stroke() : ctx.fill();

    // Top band
    if (!stroke) {
        ctx.fillStyle = adjustColorBrightness(color, 40);
    }
    ctx.beginPath();
    ctx.rect(-w * 0.6, -h / 2 - h * 0.02, w * 1.2, h * 0.12);
    stroke ? ctx.stroke() : ctx.fill();

    // Bottom band
    ctx.beginPath();
    ctx.rect(-w * 0.6, h / 2 - h * 0.1, w * 1.2, h * 0.12);
    stroke ? ctx.stroke() : ctx.fill();

    // Fuse - simple curved line
    ctx.strokeStyle = adjustColorBrightness(color, -40);
    ctx.lineWidth = Math.max(1, size / 30);
    ctx.beginPath();
    ctx.moveTo(0, -h / 2);
    ctx.quadraticCurveTo(w * 0.8, -h * 0.65, w * 0.3, -h * 0.8);
    ctx.stroke();

    // Spark dot
    if (!stroke) {
        ctx.fillStyle = '#FFEB3B';
        ctx.beginPath();
        ctx.arc(w * 0.3, -h * 0.8, size * 0.05, 0, Math.PI * 2);
        ctx.fill();
    }
};

/**
 * Draw a Chinese Folding Fan
 */
export const drawFan = (
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    size: number,
    color: string,
    stroke: boolean
) => {
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    const r = size / 2;

    // Fan arc (semi-circle with ribs)
    ctx.beginPath();
    ctx.moveTo(0, r * 0.3);
    ctx.arc(0, r * 0.3, r * 0.9, Math.PI * 1.2, Math.PI * 1.8);
    ctx.lineTo(0, r * 0.3);
    ctx.closePath();
    stroke ? ctx.stroke() : ctx.fill();

    // Handle
    ctx.beginPath();
    ctx.rect(-size * 0.04, r * 0.2, size * 0.08, r * 0.5);
    ctx.fill();

    // Rib lines
    ctx.lineWidth = Math.max(1, size / 40);
    ctx.beginPath();
    const ribCount = 7;
    for (let i = 0; i <= ribCount; i++) {
        const angle = Math.PI * 1.2 + (i / ribCount) * Math.PI * 0.6;
        ctx.moveTo(0, r * 0.3);
        ctx.lineTo(
            Math.cos(angle) * r * 0.85,
            r * 0.3 + Math.sin(angle) * r * 0.85
        );
    }
    ctx.stroke();
};

// ============================================
// CHRISTMAS SHAPES
// ============================================

/**
 * Draw Christmas Tree - Simple triangle with trunk
 */
export const drawXmasTree = (
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    size: number,
    color: string,
    stroke: boolean
) => {
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    const r = size / 2;
    ctx.lineWidth = Math.max(1, size / 20);

    // Tree triangle
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.9);
    ctx.lineTo(r * 0.7, r * 0.5);
    ctx.lineTo(-r * 0.7, r * 0.5);
    ctx.closePath();
    stroke ? ctx.stroke() : ctx.fill();

    // Trunk
    if (!stroke) {
        ctx.fillStyle = adjustColorBrightness(color, -50);
    }
    ctx.beginPath();
    ctx.rect(-r * 0.15, r * 0.5, r * 0.3, r * 0.35);
    stroke ? ctx.stroke() : ctx.fill();

    // Star on top
    if (!stroke) {
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(0, -r * 0.85, r * 0.12, 0, Math.PI * 2);
        ctx.fill();
    }
};

/**
 * Draw Gift Box - Simple box with ribbon cross
 */
export const drawGift = (
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    size: number,
    color: string,
    stroke: boolean
) => {
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    const r = size / 2;
    ctx.lineWidth = Math.max(1, size / 20);

    // Box body
    ctx.beginPath();
    ctx.roundRect(-r * 0.7, -r * 0.5, r * 1.4, r * 1.1, r * 0.08);
    stroke ? ctx.stroke() : ctx.fill();

    // Lid top
    if (!stroke) {
        ctx.fillStyle = adjustColorBrightness(color, -20);
    }
    ctx.beginPath();
    ctx.roundRect(-r * 0.75, -r * 0.7, r * 1.5, r * 0.25, r * 0.05);
    stroke ? ctx.stroke() : ctx.fill();

    // Ribbon vertical
    ctx.fillStyle = '#FFD700';
    ctx.strokeStyle = '#FFD700';
    ctx.beginPath();
    ctx.rect(-r * 0.1, -r * 0.7, r * 0.2, r * 1.3);
    stroke ? ctx.stroke() : ctx.fill();

    // Ribbon horizontal
    ctx.beginPath();
    ctx.rect(-r * 0.7, -r * 0.15, r * 1.4, r * 0.2);
    stroke ? ctx.stroke() : ctx.fill();
};

/**
 * Draw Snowflake - 6-pointed symmetrical design
 */
export const drawSnowflake = (
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    size: number,
    color: string,
    stroke: boolean
) => {
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    const r = size / 2;
    ctx.lineWidth = Math.max(2, size / 12);
    ctx.lineCap = 'round';

    // 6 main spokes
    for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(angle) * r * 0.8, Math.sin(angle) * r * 0.8);
        ctx.stroke();

        // Small branches on each spoke
        const branchLen = r * 0.25;
        const branchPos = r * 0.5;
        const branchAngle = Math.PI / 6;

        const bx = Math.cos(angle) * branchPos;
        const by = Math.sin(angle) * branchPos;

        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(bx + Math.cos(angle + branchAngle) * branchLen, by + Math.sin(angle + branchAngle) * branchLen);
        ctx.moveTo(bx, by);
        ctx.lineTo(bx + Math.cos(angle - branchAngle) * branchLen, by + Math.sin(angle - branchAngle) * branchLen);
        ctx.stroke();
    }

    // Center dot
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.1, 0, Math.PI * 2);
    ctx.fill();
};

/**
 * Draw Bell - Simple bell shape with clapper INSIDE
 */
export const drawBell = (
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    size: number,
    color: string,
    stroke: boolean
) => {
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    const r = size / 2;
    ctx.lineWidth = Math.max(1, size / 20);

    // Clapper FIRST (so it's behind the bell)
    if (!stroke) {
        ctx.fillStyle = adjustColorBrightness(color, -40);
        ctx.beginPath();
        ctx.arc(0, r * 0.25, r * 0.12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = color;
    }

    // Bell body
    ctx.beginPath();
    ctx.moveTo(-r * 0.6, r * 0.4);
    ctx.quadraticCurveTo(-r * 0.6, -r * 0.3, -r * 0.2, -r * 0.6);
    ctx.quadraticCurveTo(0, -r * 0.75, r * 0.2, -r * 0.6);
    ctx.quadraticCurveTo(r * 0.6, -r * 0.3, r * 0.6, r * 0.4);
    ctx.lineTo(-r * 0.6, r * 0.4);
    ctx.closePath();
    stroke ? ctx.stroke() : ctx.fill();

    // Bell bottom rim
    ctx.beginPath();
    ctx.ellipse(0, r * 0.4, r * 0.65, r * 0.15, 0, 0, Math.PI * 2);
    stroke ? ctx.stroke() : ctx.fill();

    // Top loop
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(2, size / 15);
    ctx.beginPath();
    ctx.arc(0, -r * 0.7, r * 0.12, Math.PI, 0);
    ctx.stroke();
};

/**
 * Draw Candy Cane - J-shaped with horizontal spiral stripes
 */
export const drawCandycane = (
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    size: number,
    color: string,
    stroke: boolean
) => {
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    const r = size / 2;
    const thickness = Math.max(3, size / 6);
    ctx.lineWidth = thickness;
    ctx.lineCap = 'round';

    // Main cane shape (J curve) - base color
    ctx.beginPath();
    ctx.moveTo(r * 0.15, r * 0.9);
    ctx.lineTo(r * 0.15, -r * 0.2);
    ctx.arc(-r * 0.25, -r * 0.2, r * 0.4, 0, Math.PI, true);
    ctx.stroke();

    // Add diagonal stripes along the cane
    if (!stroke) {
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = thickness * 0.35;
        ctx.lineCap = 'butt';

        // Stripes on the straight part (diagonal lines)
        const stripeGap = size / 7;
        for (let y = r * 0.85; y > -r * 0.15; y -= stripeGap) {
            ctx.beginPath();
            ctx.moveTo(r * 0.15 - thickness / 2.5, y);
            ctx.lineTo(r * 0.15 + thickness / 2.5, y - stripeGap * 0.6);
            ctx.stroke();
        }

        // Stripes on the curved hook (perpendicular to curve)
        const hookRadius = r * 0.4;
        const hookCenter = { x: -r * 0.25, y: -r * 0.2 };
        for (let angle = 0.15; angle < Math.PI - 0.1; angle += 0.35) {
            // Point on the curve
            const cx = hookCenter.x + Math.cos(angle) * hookRadius;
            const cy = hookCenter.y - Math.sin(angle) * hookRadius;

            // Perpendicular direction (tangent rotated 90deg)
            const perpX = Math.sin(angle);
            const perpY = Math.cos(angle);

            // Draw stripe across the cane width
            const halfWidth = thickness / 2.5;
            ctx.beginPath();
            ctx.moveTo(cx - perpX * halfWidth, cy - perpY * halfWidth);
            ctx.lineTo(cx + perpX * halfWidth, cy + perpY * halfWidth);
            ctx.stroke();
        }
    }
};

/**
 * Draw Santa Hat - Iconic curved triangle with pom pom
 */
export const drawSantaHat = (
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    size: number,
    color: string,
    stroke: boolean
) => {
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    const r = size / 2;
    ctx.lineWidth = Math.max(1, size / 20);

    // Main hat body - curved triangle
    ctx.beginPath();
    // Start at bottom left
    ctx.moveTo(-r * 0.7, r * 0.5);
    // Left edge curving up to tip
    ctx.quadraticCurveTo(-r * 0.3, -r * 0.2, r * 0.5, -r * 0.7);
    // Tip curves down to right side
    ctx.quadraticCurveTo(r * 0.6, -r * 0.5, r * 0.7, r * 0.1);
    // Right side down to bottom
    ctx.lineTo(r * 0.7, r * 0.5);
    // Bottom edge
    ctx.lineTo(-r * 0.7, r * 0.5);
    ctx.closePath();
    stroke ? ctx.stroke() : ctx.fill();

    // White fur trim at bottom
    if (!stroke) {
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.roundRect(-r * 0.75, r * 0.35, r * 1.5, r * 0.25, r * 0.1);
        ctx.fill();
    }

    // White pom pom at tip
    if (!stroke) {
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(r * 0.55, -r * 0.65, r * 0.2, 0, Math.PI * 2);
        ctx.fill();
    }
};

// ============================================
// NEW YEAR SHAPES
// ============================================

/**
 * Draw Firework - Radial burst pattern
 */
export const drawFirework = (
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    size: number,
    color: string,
    stroke: boolean
) => {
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    const r = size / 2;
    ctx.lineWidth = Math.max(2, size / 15);
    ctx.lineCap = 'round';

    // Radial burst lines
    const rays = 12;
    for (let i = 0; i < rays; i++) {
        const angle = (i / rays) * Math.PI * 2;
        const innerR = r * 0.15;
        const outerR = r * (0.7 + Math.random() * 0.25);

        ctx.beginPath();
        ctx.moveTo(Math.cos(angle) * innerR, Math.sin(angle) * innerR);
        ctx.lineTo(Math.cos(angle) * outerR, Math.sin(angle) * outerR);
        ctx.stroke();
    }

    // Center glow
    if (!stroke) {
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.15, 0, Math.PI * 2);
        ctx.fill();
    }

    // Sparkle dots at tips
    if (!stroke) {
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2 + Math.PI / 8;
            const dist = r * 0.85;
            ctx.beginPath();
            ctx.arc(Math.cos(angle) * dist, Math.sin(angle) * dist, r * 0.06, 0, Math.PI * 2);
            ctx.fill();
        }
    }
};

/**
 * Draw Champagne Glass - Flute with bubbles
 */
export const drawChampagne = (
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    size: number,
    color: string,
    stroke: boolean
) => {
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    const r = size / 2;
    ctx.lineWidth = Math.max(1, size / 20);

    // Glass bowl (flute shape)
    ctx.beginPath();
    ctx.moveTo(-r * 0.35, -r * 0.5);
    ctx.quadraticCurveTo(-r * 0.4, r * 0.1, -r * 0.08, r * 0.2);
    ctx.lineTo(-r * 0.08, r * 0.2);
    ctx.lineTo(r * 0.08, r * 0.2);
    ctx.quadraticCurveTo(r * 0.4, r * 0.1, r * 0.35, -r * 0.5);
    ctx.lineTo(-r * 0.35, -r * 0.5);
    ctx.closePath();
    stroke ? ctx.stroke() : ctx.fill();

    // Stem
    ctx.beginPath();
    ctx.rect(-r * 0.04, r * 0.2, r * 0.08, r * 0.45);
    stroke ? ctx.stroke() : ctx.fill();

    // Base
    ctx.beginPath();
    ctx.ellipse(0, r * 0.7, r * 0.2, r * 0.08, 0, 0, Math.PI * 2);
    stroke ? ctx.stroke() : ctx.fill();

    // Bubbles
    if (!stroke) {
        ctx.fillStyle = '#FFFFFF';
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.arc(-r * 0.12, -r * 0.2, r * 0.05, 0, Math.PI * 2);
        ctx.arc(r * 0.08, -r * 0.35, r * 0.04, 0, Math.PI * 2);
        ctx.arc(-r * 0.05, 0, r * 0.03, 0, Math.PI * 2);
        ctx.arc(r * 0.15, -r * 0.1, r * 0.035, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
};

/**
 * Draw Clock - Midnight clock face
 */
export const drawClockNY = (
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    size: number,
    color: string,
    stroke: boolean
) => {
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    const r = size / 2;
    ctx.lineWidth = Math.max(2, size / 15);

    // Clock face circle
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.85, 0, Math.PI * 2);
    stroke ? ctx.stroke() : ctx.fill();

    // Inner circle (clock face)
    if (!stroke) {
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.7, 0, Math.PI * 2);
        ctx.fill();
    }

    // Hour marks
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(1, size / 25);
    for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle) * r * 0.55, Math.sin(angle) * r * 0.55);
        ctx.lineTo(Math.cos(angle) * r * 0.65, Math.sin(angle) * r * 0.65);
        ctx.stroke();
    }

    // Clock hands pointing to 12
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(2, size / 12);
    ctx.lineCap = 'round';
    // Hour hand
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -r * 0.35);
    ctx.stroke();
    // Minute hand
    ctx.lineWidth = Math.max(1, size / 18);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -r * 0.5);
    ctx.stroke();
};

/**
 * Draw Balloon - Party balloon with string
 */
export const drawBalloon = (
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    size: number,
    color: string,
    stroke: boolean
) => {
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    const r = size / 2;
    ctx.lineWidth = Math.max(1, size / 20);

    // Balloon body (oval)
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.15, r * 0.55, r * 0.7, 0, 0, Math.PI * 2);
    stroke ? ctx.stroke() : ctx.fill();

    // Balloon knot (small triangle)
    ctx.beginPath();
    ctx.moveTo(-r * 0.1, r * 0.5);
    ctx.lineTo(0, r * 0.65);
    ctx.lineTo(r * 0.1, r * 0.5);
    ctx.closePath();
    stroke ? ctx.stroke() : ctx.fill();

    // String
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(1, size / 30);
    ctx.beginPath();
    ctx.moveTo(0, r * 0.65);
    ctx.quadraticCurveTo(r * 0.15, r * 0.8, -r * 0.1, r * 0.95);
    ctx.stroke();

    // Highlight
    if (!stroke) {
        ctx.fillStyle = '#FFFFFF';
        ctx.globalAlpha = 0.4;
        ctx.beginPath();
        ctx.ellipse(-r * 0.2, -r * 0.35, r * 0.12, r * 0.2, -0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
};

/**
 * Draw Party Hat - Cone with decorations
 */
export const drawPartyHat = (
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    size: number,
    color: string,
    stroke: boolean
) => {
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    const r = size / 2;
    ctx.lineWidth = Math.max(1, size / 20);

    // Cone body - simple clean triangle
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.8);
    ctx.lineTo(r * 0.55, r * 0.55);
    ctx.lineTo(-r * 0.55, r * 0.55);
    ctx.closePath();
    stroke ? ctx.stroke() : ctx.fill();

    // Polka dots instead of stripes (cleaner)
    if (!stroke) {
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(-r * 0.15, r * 0.1, r * 0.08, 0, Math.PI * 2);
        ctx.arc(r * 0.1, r * 0.3, r * 0.07, 0, Math.PI * 2);
        ctx.arc(-r * 0.05, r * 0.45, r * 0.06, 0, Math.PI * 2);
        ctx.arc(r * 0.2, r * 0.05, r * 0.05, 0, Math.PI * 2);
        ctx.fill();
    }

    // Pom pom at top
    if (!stroke) {
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(0, -r * 0.8, r * 0.18, 0, Math.PI * 2);
        ctx.fill();
    }

    // Elastic band at bottom rim
    if (!stroke) {
        ctx.fillStyle = adjustColorBrightness(color, -30);
        ctx.beginPath();
        ctx.ellipse(0, r * 0.55, r * 0.55, r * 0.08, 0, 0, Math.PI * 2);
        ctx.fill();
    }
};

/**
 * Draw Party Popper - Cone with confetti burst
 */
export const drawPartyPopper = (
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    size: number,
    color: string,
    stroke: boolean
) => {
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    const r = size / 2;
    ctx.lineWidth = Math.max(1, size / 20);

    // Popper cone body (proper cone shape)
    ctx.beginPath();
    ctx.moveTo(0, r * 0.9);               // Bottom point
    ctx.lineTo(-r * 0.35, -r * 0.1);      // Left top
    ctx.lineTo(r * 0.35, -r * 0.1);       // Right top
    ctx.closePath();
    stroke ? ctx.stroke() : ctx.fill();

    // Cone rim at top
    if (!stroke) {
        ctx.fillStyle = adjustColorBrightness(color, -30);
        ctx.beginPath();
        ctx.ellipse(0, -r * 0.1, r * 0.38, r * 0.1, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    // Explosion burst from top (fixed positions - not random!)
    if (!stroke) {
        // Burst rays
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = Math.max(2, size / 12);
        ctx.lineCap = 'round';

        // Fixed burst lines
        const burstAngles = [-2.5, -2.0, -1.5, -1.0, -0.5];
        burstAngles.forEach((angle, i) => {
            const len = r * (0.35 + (i % 2) * 0.15);
            ctx.strokeStyle = ['#FFD700', '#FF6B6B', '#4ECDC4', '#A855F7', '#FF6B6B'][i];
            ctx.beginPath();
            ctx.moveTo(0, -r * 0.2);
            ctx.lineTo(Math.cos(angle) * len, -r * 0.2 + Math.sin(angle) * len);
            ctx.stroke();
        });

        // Confetti dots at fixed positions
        const confetti = [
            { x: -r * 0.5, y: -r * 0.5, c: '#FFD700' },
            { x: r * 0.4, y: -r * 0.4, c: '#FF6B6B' },
            { x: -r * 0.2, y: -r * 0.7, c: '#4ECDC4' },
            { x: r * 0.15, y: -r * 0.65, c: '#A855F7' },
            { x: -r * 0.4, y: -r * 0.3, c: '#FFFFFF' },
            { x: r * 0.5, y: -r * 0.6, c: '#FFD700' },
        ];

        confetti.forEach(c => {
            ctx.fillStyle = c.c;
            ctx.beginPath();
            ctx.arc(c.x, c.y, r * 0.06, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    // Band decoration on cone
    if (!stroke) {
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = Math.max(1, size / 20);
        ctx.beginPath();
        ctx.moveTo(-r * 0.22, r * 0.35);
        ctx.lineTo(r * 0.22, r * 0.35);
        ctx.stroke();
    }
};

/**
 * Draw Starburst - Radiating celebration star
 */
export const drawStarburst = (
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    size: number,
    color: string,
    stroke: boolean
) => {
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    const r = size / 2;
    ctx.lineWidth = Math.max(1, size / 20);

    // Multi-pointed star burst
    const points = 8;
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
        const angle = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
        const radius = i % 2 === 0 ? r * 0.9 : r * 0.4;
        if (i === 0) {
            ctx.moveTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
        } else {
            ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
        }
    }
    ctx.closePath();
    stroke ? ctx.stroke() : ctx.fill();

    // Inner glow circle
    if (!stroke) {
        ctx.fillStyle = '#FFFFFF';
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
};

// ============================================
// VALENTINE SHAPES
// ============================================

/**
 * Draw Heart - Classic love heart shape
 */
export const drawHeart = (
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    size: number,
    color: string,
    stroke: boolean
) => {
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    const r = size / 2;
    ctx.lineWidth = Math.max(2, size / 15);

    // Heart shape using bezier curves
    ctx.beginPath();
    ctx.moveTo(0, r * 0.3);
    // Left curve
    ctx.bezierCurveTo(-r * 0.5, -r * 0.3, -r * 0.9, r * 0.1, -r * 0.5, r * 0.5);
    // Bottom point
    ctx.quadraticCurveTo(-r * 0.2, r * 0.75, 0, r * 0.9);
    // Right side
    ctx.quadraticCurveTo(r * 0.2, r * 0.75, r * 0.5, r * 0.5);
    ctx.bezierCurveTo(r * 0.9, r * 0.1, r * 0.5, -r * 0.3, 0, r * 0.3);
    ctx.closePath();
    stroke ? ctx.stroke() : ctx.fill();

    // Highlight
    if (!stroke) {
        ctx.fillStyle = '#FFFFFF';
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.ellipse(-r * 0.25, r * 0.15, r * 0.12, r * 0.18, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
};

/**
 * Draw Rose - Simple rose flower
 */
export const drawRose = (
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    size: number,
    color: string,
    stroke: boolean
) => {
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    const r = size / 2;
    ctx.lineWidth = Math.max(1, size / 20);

    // Outer petals (5 overlapping circles)
    const petalCount = 5;
    for (let i = 0; i < petalCount; i++) {
        const angle = (i / petalCount) * Math.PI * 2;
        const px = Math.cos(angle) * r * 0.35;
        const py = Math.sin(angle) * r * 0.35;

        ctx.beginPath();
        ctx.ellipse(px, py, r * 0.45, r * 0.35, angle, 0, Math.PI * 2);
        stroke ? ctx.stroke() : ctx.fill();
    }

    // Center spiral
    if (!stroke) {
        ctx.fillStyle = adjustColorBrightness(color, -40);
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.25, 0, Math.PI * 2);
        ctx.fill();

        // Inner swirl
        ctx.strokeStyle = adjustColorBrightness(color, -60);
        ctx.lineWidth = Math.max(1, size / 25);
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.12, 0, Math.PI * 1.5);
        ctx.stroke();
    }
};

/**
 * Draw Love Letter - Envelope with heart seal
 */
export const drawLoveLetter = (
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    size: number,
    color: string,
    stroke: boolean
) => {
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    const r = size / 2;
    ctx.lineWidth = Math.max(1, size / 20);

    // Envelope body
    ctx.beginPath();
    ctx.roundRect(-r * 0.7, -r * 0.45, r * 1.4, r * 1.0, r * 0.05);
    stroke ? ctx.stroke() : ctx.fill();

    // Envelope flap (triangle)
    if (!stroke) {
        ctx.fillStyle = adjustColorBrightness(color, -20);
    }
    ctx.beginPath();
    ctx.moveTo(-r * 0.7, -r * 0.45);
    ctx.lineTo(0, r * 0.15);
    ctx.lineTo(r * 0.7, -r * 0.45);
    ctx.closePath();
    stroke ? ctx.stroke() : ctx.fill();

    // Heart seal
    if (!stroke) {
        ctx.fillStyle = '#E91E63';
        ctx.beginPath();
        ctx.moveTo(0, -r * 0.15);
        ctx.bezierCurveTo(-r * 0.12, -r * 0.28, -r * 0.25, -r * 0.18, -r * 0.12, -r * 0.05);
        ctx.quadraticCurveTo(-r * 0.05, r * 0.02, 0, r * 0.1);
        ctx.quadraticCurveTo(r * 0.05, r * 0.02, r * 0.12, -r * 0.05);
        ctx.bezierCurveTo(r * 0.25, -r * 0.18, r * 0.12, -r * 0.28, 0, -r * 0.15);
        ctx.fill();
    }
};

/**
 * Draw Cupid Arrow - Simple arrow with heart tip
 */
export const drawCupidArrow = (
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    size: number,
    color: string,
    stroke: boolean
) => {
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    const r = size / 2;
    ctx.lineWidth = Math.max(2, size / 15);
    ctx.lineCap = 'round';

    // Arrow shaft (horizontal)
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = Math.max(2, size / 15);
    ctx.beginPath();
    ctx.moveTo(-r * 0.85, 0);
    ctx.lineTo(r * 0.5, 0);
    ctx.stroke();

    // Heart as arrow tip (pointing right)
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(r * 0.85, 0);
    ctx.bezierCurveTo(r * 0.85, -r * 0.2, r * 0.55, -r * 0.35, r * 0.55, -r * 0.15);
    ctx.bezierCurveTo(r * 0.55, -r * 0.05, r * 0.65, r * 0.0, r * 0.85, r * 0.0);
    ctx.bezierCurveTo(r * 0.65, r * 0.0, r * 0.55, r * 0.05, r * 0.55, r * 0.15);
    ctx.bezierCurveTo(r * 0.55, r * 0.35, r * 0.85, r * 0.2, r * 0.85, 0);
    ctx.closePath();
    stroke ? ctx.stroke() : ctx.fill();

    // Feathers at back
    if (!stroke) {
        ctx.fillStyle = '#FF69B4';
        ctx.beginPath();
        ctx.moveTo(-r * 0.85, 0);
        ctx.lineTo(-r * 0.65, -r * 0.25);
        ctx.lineTo(-r * 0.55, 0);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(-r * 0.85, 0);
        ctx.lineTo(-r * 0.65, r * 0.25);
        ctx.lineTo(-r * 0.55, 0);
        ctx.closePath();
        ctx.fill();
    }
};

/**
 * Draw Bow - Simple gift ribbon bow
 */
export const drawBow = (
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    size: number,
    color: string,
    stroke: boolean
) => {
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    const r = size / 2;
    ctx.lineWidth = Math.max(1, size / 20);

    // Left loop (figure-8 style)
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-r * 0.3, -r * 0.2, -r * 0.7, -r * 0.5, -r * 0.5, -r * 0.7);
    ctx.bezierCurveTo(-r * 0.3, -r * 0.85, -r * 0.1, -r * 0.6, 0, -r * 0.3);
    ctx.closePath();
    stroke ? ctx.stroke() : ctx.fill();

    // Right loop
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(r * 0.3, -r * 0.2, r * 0.7, -r * 0.5, r * 0.5, -r * 0.7);
    ctx.bezierCurveTo(r * 0.3, -r * 0.85, r * 0.1, -r * 0.6, 0, -r * 0.3);
    ctx.closePath();
    stroke ? ctx.stroke() : ctx.fill();

    // Center knot
    if (!stroke) {
        ctx.fillStyle = adjustColorBrightness(color, -40);
    }
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.15, r * 0.15, r * 0.2, 0, 0, Math.PI * 2);
    stroke ? ctx.stroke() : ctx.fill();

    // Left tail
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(-r * 0.1, r * 0.05);
    ctx.quadraticCurveTo(-r * 0.35, r * 0.4, -r * 0.5, r * 0.8);
    ctx.lineTo(-r * 0.35, r * 0.75);
    ctx.quadraticCurveTo(-r * 0.2, r * 0.4, 0, r * 0.1);
    ctx.closePath();
    stroke ? ctx.stroke() : ctx.fill();

    // Right tail
    ctx.beginPath();
    ctx.moveTo(r * 0.1, r * 0.05);
    ctx.quadraticCurveTo(r * 0.35, r * 0.4, r * 0.5, r * 0.8);
    ctx.lineTo(r * 0.35, r * 0.75);
    ctx.quadraticCurveTo(r * 0.2, r * 0.4, 0, r * 0.1);
    ctx.closePath();
    stroke ? ctx.stroke() : ctx.fill();
};

/**
 * Draw Ring - Gold band with flat-top diamond
 */
export const drawRing = (
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    size: number,
    _color: string, // Ignored - using hardcoded gold
    stroke: boolean
) => {
    const r = size / 2;

    // Gold ring band (proportional thickness)
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = Math.max(2, size / 10);
    ctx.beginPath();
    ctx.arc(0, r * 0.2, r * 0.45, 0, Math.PI * 2);
    ctx.stroke();

    // Flat-top diamond (emerald cut style)
    if (!stroke) {
        ctx.fillStyle = '#87CEEB';
        ctx.beginPath();
        // Flat top
        ctx.moveTo(-r * 0.2, -r * 0.7);
        ctx.lineTo(r * 0.2, -r * 0.7);
        // Right side angle down
        ctx.lineTo(r * 0.25, -r * 0.5);
        // Bottom point
        ctx.lineTo(0, -r * 0.2);
        // Left side angle up
        ctx.lineTo(-r * 0.25, -r * 0.5);
        ctx.closePath();
        ctx.fill();

        // Diamond highlight
        ctx.fillStyle = '#FFFFFF';
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.moveTo(-r * 0.12, -r * 0.65);
        ctx.lineTo(r * 0.08, -r * 0.65);
        ctx.lineTo(r * 0.1, -r * 0.5);
        ctx.lineTo(-r * 0.1, -r * 0.5);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;
    }
};

// Helper to adjust color brightness
function adjustColorBrightness(color: string, amount: number): string {
    // Simple brightness adjustment for hex colors
    if (color.startsWith('#')) {
        let hex = color.slice(1);
        if (hex.length === 3) {
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        }
        const num = parseInt(hex, 16);
        let r = Math.min(255, Math.max(0, (num >> 16) + amount));
        let g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
        let b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
        return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
    }
    return color;
}

/**
 * Main entry point to draw any seasonal shape
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
        case 'lantern':
            drawLantern(ctx, size, color, stroke);
            break;
        case 'dragon':
            drawDragon(ctx, size, color, stroke);
            break;
        case 'angpao':
            drawAngpao(ctx, size, color, stroke);
            break;
        case 'cloud-cn':
            drawCloudCN(ctx, size, color, stroke);
            break;
        case 'firecracker':
            drawFirecracker(ctx, size, color, stroke);
            break;
        case 'fan':
            drawFan(ctx, size, color, stroke);
            break;
        // Christmas
        case 'xmas-tree':
            drawXmasTree(ctx, size, color, stroke);
            break;
        case 'gift':
            drawGift(ctx, size, color, stroke);
            break;
        case 'snowflake':
            drawSnowflake(ctx, size, color, stroke);
            break;
        case 'bell':
            drawBell(ctx, size, color, stroke);
            break;
        case 'candycane':
            drawCandycane(ctx, size, color, stroke);
            break;
        case 'santa-hat':
            drawSantaHat(ctx, size, color, stroke);
            break;
        // New Year
        case 'firework':
            drawFirework(ctx, size, color, stroke);
            break;
        case 'champagne':
            drawChampagne(ctx, size, color, stroke);
            break;
        case 'clock-ny':
            drawClockNY(ctx, size, color, stroke);
            break;
        case 'balloon':
            drawBalloon(ctx, size, color, stroke);
            break;
        case 'party-hat':
            drawPartyHat(ctx, size, color, stroke);
            break;
        case 'party-popper':
            drawPartyPopper(ctx, size, color, stroke);
            break;
        case 'starburst':
            drawStarburst(ctx, size, color, stroke);
            break;
        // Valentine
        case 'heart':
            drawHeart(ctx, size, color, stroke);
            break;
        case 'rose':
            drawRose(ctx, size, color, stroke);
            break;
        case 'love-letter':
            drawLoveLetter(ctx, size, color, stroke);
            break;
        case 'ring':
            drawRing(ctx, size, color, stroke);
            break;
    }
};
