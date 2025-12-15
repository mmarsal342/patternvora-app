import LZString from 'lz-string';
import { AppState, Layer } from '../types';

// Serialize State to URL-safe string
export const serializeState = (state: AppState): string | null => {
    try {
        // Deep copy to avoid mutating original
        const stateToSave = JSON.parse(JSON.stringify(state));
        
        // V2 Logic: Check layers for custom images
        if (stateToSave.layers && Array.isArray(stateToSave.layers)) {
            const hasCustomImages = stateToSave.layers.some((layer: Layer) => 
                layer.config.customImage?.assets?.length > 0
            );

            if (hasCustomImages) {
                console.warn("Cannot share state with custom images via URL");
                return null;
            }
        } else {
             // Fallback for V1
             if (stateToSave.customImage?.assets?.length > 0) {
                 return null;
             }
        }

        const jsonString = JSON.stringify(stateToSave);
        
        // SWITCH TO BASE64 + ENCODE URI COMPONENT
        // 'compressToEncodedURIComponent' creates strings containing '+' which URLSearchParams interprets as spaces.
        // Using standard Base64 and encoding it ensures data integrity across all browsers/servers.
        const compressed = LZString.compressToBase64(jsonString);
        return encodeURIComponent(compressed);
    } catch (e) {
        console.error("Serialization failed", e);
        return null;
    }
};

// Deserialize String back to State
export const deserializeState = (encoded: string, fallbackState: AppState): AppState | null => {
    try {
        if (!encoded) return null;
        
        // 1. Try Base64 Decompression (New Format)
        // URLSearchParams automatically decodes the URI component, returning the raw Base64 string.
        let jsonString = LZString.decompressFromBase64(encoded);

        // 2. Fallback: Try 'EncodedURIComponent' format (Legacy/Broken Links)
        // If the link was generated with the old method, 'encoded' might contain spaces where '+' should be.
        if (!jsonString) {
             // Heuristic: If it looks like LZString's uri-safe format (has -$ but no = or / usually)
             // We fix the spaces (which were + converted by browser) and try decompressing.
             const fixedEncoded = encoded.replace(/ /g, '+');
             jsonString = LZString.decompressFromEncodedURIComponent(fixedEncoded);
             
             // If that fails, try raw just in case (if browser didn't convert space)
             if (!jsonString) {
                 jsonString = LZString.decompressFromEncodedURIComponent(encoded);
             }
        }

        if (!jsonString) return null;

        const parsed = JSON.parse(jsonString);

        // Basic merge with fallback to ensure structure
        const result = {
            ...fallbackState,
            ...parsed
        };

        // Safety cleanup for V2 Layers if they exist
        if (result.layers && Array.isArray(result.layers)) {
            result.layers = result.layers.map((l: Layer) => ({
                ...l,
                config: {
                    ...l.config,
                    // Ensure custom images are cleared from URL state to prevent issues
                    customImage: { assets: [], originalColors: false }
                }
            }));
        }

        return result;
    } catch (e) {
        console.error("Deserialization failed", e);
        return null;
    }
};