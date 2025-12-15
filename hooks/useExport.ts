import { useCallback, useState } from 'react';
import { AppState, FontDef, DEFAULT_FONTS } from '../types';
import { renderToCanvas, generateSVG, getDimensions, createNoisePattern } from '../utils/drawingEngine';

export interface UseExportOptions {
    state: AppState;
    loadedImages: Record<string, HTMLImageElement>;
    customFonts: FontDef[];
    user: { exportCount?: number; tier?: string } | null;
    isPro: boolean;
    isGuest: boolean;
    onLogin: () => void;
    onShowPricing: () => void;
    onExportComplete: () => void;
}

export interface UseExportReturn {
    // States
    isExportingPNG: boolean;
    isExportingJPG: boolean;
    isGeneratingSVG: boolean;

    // Export functions
    handleDownloadPNG: (size: number) => void;
    handleDownloadJPG: (size: number) => void;
    handleDownloadSVG: () => Promise<void>;

    // Utility functions
    canExport: () => { allowed: boolean; reason?: string };
    checkTierAccess: (feature: '4k' | 'svg' | 'video' | 'batch' | 'custom_font' | 'custom_asset') => boolean;
    getExportSize: (requestedSize: number) => number;
}

const FREE_EXPORT_LIMIT = 10;
const FREE_MAX_SIZE = 720;

export function useExport(options: UseExportOptions): UseExportReturn {
    const {
        state,
        loadedImages,
        customFonts,
        user,
        isPro,
        isGuest,
        onLogin,
        onShowPricing,
        onExportComplete
    } = options;

    const [isExportingPNG, setIsExportingPNG] = useState(false);
    const [isExportingJPG, setIsExportingJPG] = useState(false);
    const [isGeneratingSVG, setIsGeneratingSVG] = useState(false);

    // Check if user can export based on tier
    const canExport = useCallback((): { allowed: boolean; reason?: string } => {
        // Guest cannot export at all
        if (isGuest) {
            return {
                allowed: false,
                reason: "Please sign in with Google to export your creations. It's free!"
            };
        }

        // Pro/LTD can always export
        if (isPro) {
            return { allowed: true };
        }

        // Free user - check export limit
        const currentCount = user?.exportCount || 0;
        if (currentCount >= FREE_EXPORT_LIMIT) {
            return {
                allowed: false,
                reason: `You've reached your free limit of ${FREE_EXPORT_LIMIT} exports this month. Upgrade to Pro for unlimited exports!`
            };
        }

        return { allowed: true };
    }, [isGuest, isPro, user]);

    // Check tier access for specific premium features
    const checkTierAccess = useCallback((feature: '4k' | 'svg' | 'video' | 'batch' | 'custom_font' | 'custom_asset'): boolean => {
        const featureNames: Record<string, string> = {
            '4k': '4K Export',
            'svg': 'SVG Export',
            'video': 'Video Export',
            'batch': 'Batch Export',
            'custom_font': 'Custom Font Upload',
            'custom_asset': 'Custom Asset Upload'
        };

        if (!isPro) {
            alert(`${featureNames[feature]} is a Pro Feature. Upgrade to unlock!`);
            onShowPricing();
            return false;
        }
        return true;
    }, [isPro, onShowPricing]);

    // Clamp export size for free users
    const getExportSize = useCallback((requestedSize: number): number => {
        if (isPro) return requestedSize;
        return Math.min(requestedSize, FREE_MAX_SIZE);
    }, [isPro]);

    // Download PNG
    const handleDownloadPNG = useCallback((size: number) => {
        const exportCheck = canExport();
        if (!exportCheck.allowed) {
            alert(exportCheck.reason);
            if (isGuest) {
                onLogin();
            } else {
                onShowPricing();
            }
            return;
        }

        if (size > 2000 && !checkTierAccess('4k')) return;

        const actualSize = getExportSize(size);

        setIsExportingPNG(true);
        setTimeout(() => {
            try {
                const canvas = document.createElement('canvas');
                const dims = getDimensions(state.aspectRatio, actualSize);
                canvas.width = dims.width;
                canvas.height = dims.height;
                const ctx = canvas.getContext('2d');
                const noisePattern = createNoisePattern(50);

                if (ctx) {
                    renderToCanvas(ctx, dims.width, dims.height, state, loadedImages, 0, noisePattern, true);

                    // Watermark for Free Users
                    if (!isPro) {
                        ctx.save();
                        ctx.font = `bold ${actualSize * 0.03}px sans-serif`;
                        ctx.fillStyle = 'rgba(0,0,0,0.3)';
                        ctx.textAlign = 'right';
                        ctx.textBaseline = 'bottom';
                        ctx.fillText('Made with PatternVora (Free)', dims.width - 20, dims.height - 20);
                        ctx.restore();
                    }

                    const link = document.createElement('a');
                    link.download = `patternvora-${Date.now()}.png`;
                    link.href = canvas.toDataURL('image/png');
                    link.click();
                    onExportComplete();
                }
            } catch (e) {
                console.error("Export failed", e);
                alert("Failed to export image.");
            } finally {
                setIsExportingPNG(false);
            }
        }, 100);
    }, [state, loadedImages, isPro, isGuest, canExport, checkTierAccess, getExportSize, onLogin, onShowPricing, onExportComplete]);

    // Download JPG
    const handleDownloadJPG = useCallback((size: number) => {
        const exportCheck = canExport();
        if (!exportCheck.allowed) {
            alert(exportCheck.reason);
            if (isGuest) {
                onLogin();
            } else {
                onShowPricing();
            }
            return;
        }

        if (size > 2000 && !checkTierAccess('4k')) return;

        const actualSize = getExportSize(size);

        setIsExportingJPG(true);
        setTimeout(() => {
            try {
                const canvas = document.createElement('canvas');
                const dims = getDimensions(state.aspectRatio, actualSize);
                canvas.width = dims.width;
                canvas.height = dims.height;
                const ctx = canvas.getContext('2d');
                const noisePattern = createNoisePattern(50);

                if (ctx) {
                    renderToCanvas(ctx, dims.width, dims.height, state, loadedImages, 0, noisePattern);

                    // Watermark for Free Users
                    if (!isPro) {
                        ctx.save();
                        ctx.font = `bold ${actualSize * 0.03}px sans-serif`;
                        ctx.fillStyle = 'rgba(0,0,0,0.3)';
                        ctx.textAlign = 'right';
                        ctx.textBaseline = 'bottom';
                        ctx.fillText('Made with PatternVora (Free)', dims.width - 20, dims.height - 20);
                        ctx.restore();
                    }

                    const link = document.createElement('a');
                    link.download = `patternvora-${Date.now()}.jpg`;
                    link.href = canvas.toDataURL('image/jpeg', 0.95);
                    link.click();
                    onExportComplete();
                }
            } catch (e) {
                console.error("Export failed", e);
                alert("Failed to export JPG.");
            } finally {
                setIsExportingJPG(false);
            }
        }, 100);
    }, [state, loadedImages, isPro, isGuest, canExport, checkTierAccess, getExportSize, onLogin, onShowPricing, onExportComplete]);

    // Download SVG
    const handleDownloadSVG = useCallback(async () => {
        if (!checkTierAccess('svg')) return;

        setIsGeneratingSVG(true);
        try {
            const dims = getDimensions(state.aspectRatio, 1000);
            const allFonts = [...DEFAULT_FONTS, ...customFonts];
            const svgString = await generateSVG(dims.width, dims.height, state, allFonts);
            const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `patternvora-${Date.now()}.svg`;
            link.click();
            onExportComplete();
        } catch (error) {
            console.error("Failed to generate SVG", error);
        } finally {
            setIsGeneratingSVG(false);
        }
    }, [state, customFonts, checkTierAccess, onExportComplete]);

    return {
        isExportingPNG,
        isExportingJPG,
        isGeneratingSVG,
        handleDownloadPNG,
        handleDownloadJPG,
        handleDownloadSVG,
        canExport,
        checkTierAccess,
        getExportSize
    };
}

export { FREE_EXPORT_LIMIT };
