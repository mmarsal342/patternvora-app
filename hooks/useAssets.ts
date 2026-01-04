import React, { useCallback, useState, useEffect } from 'react';
import { FontDef, CustomAsset, TextConfig, AppState } from '../types';

export interface UseAssetsOptions {
    state: AppState;
    isPro: boolean;
    onShowPricing: () => void;
    onUpdateText: (updates: Partial<TextConfig>) => void;
}

export interface UseAssetsReturn {
    loadedImages: Record<string, HTMLImageElement>;
    setLoadedImages: React.Dispatch<React.SetStateAction<Record<string, HTMLImageElement>>>;
    customFonts: FontDef[];
    handleFontUpload: (file: File) => Promise<void>;
}

export function useAssets(options: UseAssetsOptions): UseAssetsReturn {
    const { state, isPro, onShowPricing, onUpdateText } = options;

    const [loadedImages, setLoadedImages] = useState<Record<string, HTMLImageElement>>({});
    const [customFonts, setCustomFonts] = useState<FontDef[]>([]);

    // Handle Image Loading (Multi-Asset) - loads images from all layers
    useEffect(() => {
        const loadImages = async () => {
            const allAssets: CustomAsset[] = [];
            state.layers.forEach(layer => {
                // Add regular custom assets
                allAssets.push(...layer.config.customImage.assets);

                // Add Shape Fill source image if enabled
                if (layer.config.shapeFill?.enabled && layer.config.shapeFill?.sourceImage) {
                    allAssets.push({
                        id: `shape_fill_${layer.id}`,
                        src: layer.config.shapeFill.sourceImage
                    });
                }
            });

            if (allAssets.length === 0) {
                return;
            }


            const newImages: Record<string, HTMLImageElement> = { ...loadedImages };
            let hasChanges = false;

            const promises = allAssets.map(asset => new Promise<void>((resolve) => {
                if (newImages[asset.id]) {
                    resolve();
                    return;
                }
                hasChanges = true;
                const img = new Image();
                img.src = asset.src;
                // Enable CORS if needed (though usually data URLs or local blob URLs)
                img.crossOrigin = 'Anonymous';
                img.onload = () => {
                    newImages[asset.id] = img;
                    resolve();
                };
                img.onerror = (e) => {
                    resolve();
                };
            }));

            await Promise.all(promises);
            if (hasChanges) {
                setLoadedImages(newImages);
            }
        };

        loadImages();
    }, [state.layers]);

    // Handle custom font upload
    const handleFontUpload = useCallback(async (file: File) => {
        // Custom font upload is Pro only
        if (!isPro) {
            alert('Custom Font Upload is a Pro Feature. Upgrade to unlock!');
            onShowPricing();
            return;
        }

        try {
            const fontName = file.name.split('.')[0].replace(/[^a-zA-Z0-9]/g, '');
            const url = URL.createObjectURL(file);
            const fontFace = new FontFace(fontName, `url(${url})`);
            const loadedFace = await fontFace.load();
            document.fonts.add(loadedFace);

            const newFont: FontDef = {
                name: fontName,
                value: fontName,
                url: url,
                type: 'custom'
            };

            setCustomFonts(prev => [...prev, newFont]);
            onUpdateText({ fontFamily: fontName });

        } catch (err) {
            console.error("Font upload failed", err);
            alert("Failed to load custom font.");
        }
    }, [isPro, onShowPricing, onUpdateText]);

    return {
        loadedImages,
        setLoadedImages,
        customFonts,
        handleFontUpload
    };
}
