import React, { useCallback, useState, useEffect } from 'react';
import { AppState, Preset } from '../types';
import { savePresetsToStorage, loadPresetsFromStorage } from '../utils/storage';
import { migrateToV2 } from '../utils/migration';

export interface UsePresetsOptions {
    state: AppState;
    loadedImages: Record<string, HTMLImageElement>;
    pushState: (state: AppState, images: Record<string, HTMLImageElement>) => void;
    updateStateDirectly: (updates: Partial<AppState>) => void;
}

export interface UsePresetsReturn {
    presets: Preset[];
    handleSavePreset: (name: string) => void;
    handleLoadPreset: (preset: Preset) => void;
    handleImportPreset: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleDeletePreset: (id: string) => void;
}

export function usePresets(options: UsePresetsOptions): UsePresetsReturn {
    const { state, loadedImages, pushState, updateStateDirectly } = options;

    const [presets, setPresets] = useState<Preset[]>([]);

    // Load presets from IndexedDB
    useEffect(() => {
        const load = async () => {
            const loaded = await loadPresetsFromStorage();
            setPresets(loaded);
        };
        load();
    }, []);

    // Save presets to IndexedDB when changed
    useEffect(() => {
        if (presets.length > 0) {
            savePresetsToStorage(presets);
        }
    }, [presets]);

    const handleSavePreset = useCallback((name: string) => {
        const newPreset: Preset = {
            id: Date.now().toString(),
            name,
            createdAt: Date.now(),
            state: state
        };
        setPresets(prev => [newPreset, ...prev]);
    }, [state]);

    const handleLoadPreset = useCallback((preset: Preset) => {
        pushState(preset.state, loadedImages);
        updateStateDirectly(preset.state);
    }, [pushState, updateStateDirectly, loadedImages]);

    const handleImportPreset = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                if (ev.target?.result) {
                    const imported = JSON.parse(ev.target.result as string) as Preset;
                    if (imported.state) {
                        const migratedState = migrateToV2(imported.state);
                        const finalPreset = { ...imported, state: migratedState };

                        setPresets(prev => [finalPreset, ...prev]);
                        pushState(migratedState, loadedImages);
                        updateStateDirectly(migratedState);
                    }
                }
            } catch (err) {
                alert("Invalid Preset JSON");
            }
        };
        reader.readAsText(file);
    }, [pushState, updateStateDirectly, loadedImages]);

    const handleDeletePreset = useCallback((id: string) => {
        setPresets(prev => prev.filter(p => p.id !== id));
    }, []);

    return {
        presets,
        handleSavePreset,
        handleLoadPreset,
        handleImportPreset,
        handleDeletePreset
    };
}
