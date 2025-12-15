
import React, { createContext, useContext, useMemo } from 'react';
import { AppState, TextConfig, CustomImageConfig, AnimationConfig, Preset, FontDef, LayerConfig } from '../../types';

export interface SidebarContextType {
  state: AppState; // Raw Global State
  activeLayerConfig: LayerConfig; // Derived Config for Active Layer
  updateState: (updates: Partial<LayerConfig> | Partial<AppState>, immediate?: boolean) => void;
  updateStateDirectly: (updates: Partial<AppState>) => void; // Bypass active layer logic (for global props)
  updateText: (updates: Partial<TextConfig>) => void;
  updateCustomImage: (updates: Partial<CustomImageConfig>) => void;
  updateAnimation: (updates: Partial<AnimationConfig>) => void;
  onGenerate: () => void;
  onExtractPalette: (file: File) => void;
  onSavePreset: (name: string) => void;
  onLoadPreset: (preset: Preset) => void;
  presets: Preset[];
  onImportPreset: (e: React.ChangeEvent<HTMLInputElement>) => void;
  customFonts: FontDef[];
  onUploadFont: (file: File) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useSidebar = () => {
    const context = useContext(SidebarContext);
    if (!context) {
        throw new Error("useSidebar must be used within a SidebarProvider");
    }
    return context;
};

interface SidebarProviderProps {
    value: Omit<SidebarContextType, 'state' | 'activeLayerConfig' | 'updateState' | 'updateStateDirectly'> & { 
        state: AppState;
        updateState: (updates: Partial<AppState>, immediate?: boolean) => void; 
    };
    children: React.ReactNode;
}

export const SidebarProvider: React.FC<SidebarProviderProps> = ({ value, children }) => {
    // Determine active layer config
    const activeLayer = value.state.layers.find(l => l.id === value.state.activeLayerId);
    
    // Fallback if ID not found (safety)
    const activeLayerConfig = activeLayer ? activeLayer.config : value.state.layers[0].config;

    // Smart Update Function: Route updates to Active Layer OR Global State depending on property
    const smartUpdateState = (updates: any, immediate?: boolean) => {
        // List of keys that belong to Global AppState (Updated: removed text)
        const globalKeys = ['aspectRatio', 'activeLayerId', 'layers'];
        
        // Check if any update key is global
        const isGlobalUpdate = Object.keys(updates).some(key => globalKeys.includes(key));

        if (isGlobalUpdate) {
            value.updateState(updates, immediate);
        } else {
            // It's a layer update
            const newLayers = value.state.layers.map(layer => {
                if (layer.id === value.state.activeLayerId) {
                    return { ...layer, config: { ...layer.config, ...updates } };
                }
                return layer;
            });
            value.updateState({ layers: newLayers }, immediate);
        }
    };

    const contextValue: SidebarContextType = {
        ...value,
        updateState: smartUpdateState,
        updateStateDirectly: (updates) => value.updateState(updates, true),
        activeLayerConfig,
        // Override component-specific updaters to target Active Layer
        updateCustomImage: (updates) => {
            const newConfig = { ...activeLayerConfig.customImage, ...updates };
            smartUpdateState({ customImage: newConfig }, true);
        },
        updateAnimation: (updates) => {
            const newConfig = { ...activeLayerConfig.animation, ...updates };
            smartUpdateState({ animation: newConfig }, false);
        },
        updateText: (updates) => {
             const newConfig = { ...activeLayerConfig.text, ...updates };
             smartUpdateState({ text: newConfig }, false); 
        }
    };

    return (
        <SidebarContext.Provider value={contextValue}>
            {children}
        </SidebarContext.Provider>
    );
};
