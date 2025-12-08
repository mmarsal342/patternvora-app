import { ShapeData, PrimaryAnimationType, SecondaryAnimationType } from '../../types';
import { safeMod } from './math';

export const applyAnimation = (
    shape: ShapeData, 
    progress: number, 
    width: number, 
    height: number, 
    config: { 
        primary: PrimaryAnimationType, 
        secondary: SecondaryAnimationType, 
        intensity: number, 
        direction: 'normal' | 'reverse' 
    }
) => {
    // For seamless loops, we ensure that progress 1.0 is mathematically equivalent to 0.0
    // Math.sin(t) where t goes from 0 to 2PI is perfect loop.
    // If progress goes beyond 1 (e.g. 1.1), t goes beyond 2PI, which is fine for sin/cos.
    const t = progress * Math.PI * 2;
    const dir = config.direction === 'normal' ? 1 : -1;
    const phase = shape.phaseOffset;
    const intensityInt = Math.max(1, Math.round(config.intensity));

    if (shape.type === 'wave') {
        if (config.primary === 'float') {
             const amplitude = (height * 0.05) * config.intensity;
             shape.y += Math.sin(t * shape.speedFactor + phase) * amplitude;
        }
        if (config.secondary === 'pulse') {
             const scaleVar = 0.5 * config.intensity;
             const scaleMult = 1 + Math.sin(t * shape.speedFactor + phase) * scaleVar;
             shape.size *= Math.max(0.1, scaleMult);
        }
        return;
    }
    
    if (config.secondary === 'spin') {
        // Ensure integer cycles for perfect loop
        const cycles = intensityInt;
        const totalRotation = 360 * shape.speedFactor * cycles; 
        const currentRotOffset = totalRotation * progress * dir;
        shape.rotation += currentRotOffset;
    }
    
    if (config.secondary === 'pulse') {
        const baseScale = 1;
        const scaleVar = 0.3 * config.intensity; 
        const scaleMult = baseScale + Math.sin(t * shape.speedFactor + phase) * scaleVar;
        shape.size *= scaleMult;
    }

    if (config.primary === 'orbit') {
        const cx = width / 2;
        const cy = height / 2;
        const dx = shape.x - cx;
        const dy = shape.y - cy;
        const dist = Math.sqrt(dx*dx + dy*dy);
        const initialAngle = Math.atan2(dy, dx);
        
        // Integer cycles for orbit
        const totalAngle = Math.PI * 2 * shape.speedFactor * intensityInt;
        const angleOffset = totalAngle * progress * dir; 
        const currentAngle = initialAngle + angleOffset;

        shape.x = cx + Math.cos(currentAngle) * dist;
        shape.y = cy + Math.sin(currentAngle) * dist;
        
        if (config.secondary !== 'spin') {
             shape.rotation += (angleOffset * 180 / Math.PI);
        }
    }

    if (config.primary === 'float') {
        const amplitude = 50 * config.intensity;
        // Integer frequency multiplier for perfect loop
        const freqY = shape.speedFactor;
        const freqX = Math.ceil(shape.speedFactor * 0.5); 
        
        shape.y += Math.sin(t * freqY + phase) * amplitude;
        shape.x += Math.cos(t * freqX + phase) * (10 * config.intensity);
    }

    if (config.primary === 'scan') {
        const buffer = Math.max(shape.size * 2, width * 0.5); 
        const trackLength = width + (buffer * 2);
        const startX = shape.x + buffer; 
        const cycles = Math.max(1, Math.round(shape.speedFactor * config.intensity)); 
        const totalMove = trackLength * cycles;
        const moveOffset = totalMove * progress * dir;
        const currentPosInTrack = safeMod(startX + moveOffset, trackLength);
        shape.x = currentPosInTrack - buffer;
    }
};