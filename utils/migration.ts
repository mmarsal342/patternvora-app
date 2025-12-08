

import { AppState, Layer, LayerConfig, TextConfig, StyleOptions, CompositionOptions } from '../types';
import { PALETTES } from './palettes';

export const DEFAULT_TEXT_CONFIG: TextConfig = {
    enabled: false,
    content: "PATTERN\nVORA",
    fontFamily: "'Inter', sans-serif",
    fontSize: 150,
    color: '#ffffff',
    x: 50,
    y: 50,
    opacity: 1,
    blendMode: 'source-over',
    renderMode: 'font',
    masking: false
};

export const DEFAULT_STYLE_OPTIONS: StyleOptions = {
    shapeTypes: [], // Empty implies "All Default Shapes for this Style"
    gridGap: 0
};

export const DEFAULT_COMPOSITION_OPTIONS: CompositionOptions = {
    direction: 'tl-br',
    margin: 25 // 25% margin default
};

// Initial Layer Config for new layers
export const DEFAULT_LAYER_CONFIG: LayerConfig = {
    seed: 12345,
    style: 'geometric',
    composition: 'random',
    complexity: 50,
    scale: 1,
    palette: PALETTES[0],
    strokeWidth: 2,
    texture: 0,
    customImage: { assets: [], originalColors: false },
    animation: {
        enabled: false,
        primary: 'orbit',
        secondary: 'none',
        duration: 5,
        speed: 1,
        resolution: 'HD',
        intensity: 1,
        direction: 'normal'
    },
    text: { ...DEFAULT_TEXT_CONFIG },
    transparentBackground: false,
    overrides: {},
    styleOptions: DEFAULT_STYLE_OPTIONS,
    compositionOptions: DEFAULT_COMPOSITION_OPTIONS
};

export const INITIAL_V2_STATE: AppState = {
    version: 2,
    aspectRatio: '1:1',
    layers: [
        {
            id: 'layer-1',
            name: 'Base Layer',
            visible: true,
            locked: false,
            blendMode: 'source-over',
            opacity: 1,
            config: { ...DEFAULT_LAYER_CONFIG }
        }
    ],
    activeLayerId: 'layer-1'
};

export const migrateToV2 = (oldState: any): AppState => {
    // If it's already V2, return as is (but ensure transparency, text, and new options prop exists)
    if (oldState.version === 2 && Array.isArray(oldState.layers)) {
        // Hotfix for existing V2 states that might miss the new props
        const layers = oldState.layers.map((l: Layer) => ({
            ...l,
            config: {
                ...l.config,
                transparentBackground: l.config.transparentBackground ?? false,
                text: l.config.text || { ...DEFAULT_TEXT_CONFIG },
                styleOptions: l.config.styleOptions || { ...DEFAULT_STYLE_OPTIONS },
                compositionOptions: l.config.compositionOptions || { ...DEFAULT_COMPOSITION_OPTIONS }
            }
        }));
        
        const { text, ...rest } = oldState;
        return { ...rest, layers };
    }

    console.log("Migrating state to V2 (Layers)...");

    // Extract global props
    const aspectRatio = oldState.aspectRatio || '1:1';
    
    // Extract global text from V1 or use default
    const textConfig = oldState.text || DEFAULT_TEXT_CONFIG;

    // Extract pattern props into Layer 1
    const layerConfig: LayerConfig = {
        seed: oldState.seed ?? 12345,
        style: oldState.style ?? 'geometric',
        composition: oldState.composition ?? 'random',
        complexity: oldState.complexity ?? 50,
        scale: oldState.scale ?? 1,
        palette: oldState.palette ?? PALETTES[0],
        strokeWidth: oldState.strokeWidth ?? 2,
        texture: oldState.texture ?? 0,
        customImage: oldState.customImage ?? { assets: [], originalColors: false },
        animation: oldState.animation ?? DEFAULT_LAYER_CONFIG.animation,
        text: textConfig, // Move global text to Layer 1
        transparentBackground: false,
        overrides: oldState.overrides ?? {},
        styleOptions: oldState.styleOptions ?? DEFAULT_STYLE_OPTIONS,
        compositionOptions: oldState.compositionOptions ?? DEFAULT_COMPOSITION_OPTIONS
    };

    return {
        version: 2,
        aspectRatio,
        layers: [
            {
                id: 'layer-1',
                name: 'Base Layer',
                visible: true,
                locked: false,
                blendMode: 'source-over',
                opacity: 1,
                config: layerConfig
            }
        ],
        activeLayerId: 'layer-1'
    };
};