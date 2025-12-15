
import { get, set, del } from 'idb-keyval';
import { Preset } from '../types';
import { migrateToV2 } from './migration';

const PRESETS_KEY = 'patternvora-presets-v2';

export const savePresetsToStorage = async (presets: Preset[]) => {
    try {
        await set(PRESETS_KEY, presets);
    } catch (e) {
        console.error("Failed to save presets to IndexedDB", e);
    }
};

export const loadPresetsFromStorage = async (): Promise<Preset[]> => {
    try {
        // 1. Try loading from IndexedDB
        const stored = await get<Preset[]>(PRESETS_KEY);
        
        if (stored) {
            return stored;
        }

        // 2. Fallback: Migration from LocalStorage (Legacy)
        const local = localStorage.getItem('patternvora-presets');
        if (local) {
            try {
                const rawPresets = JSON.parse(local);
                const migrated = rawPresets.map((p: any) => ({
                    ...p,
                    state: migrateToV2(p.state)
                }));
                
                // Save to IDB immediately for next time
                await set(PRESETS_KEY, migrated);
                return migrated;
            } catch (e) {
                console.error("Migration failed", e);
            }
        }
        
        return [];
    } catch (e) {
        console.error("Failed to load presets", e);
        return [];
    }
};

export const clearPresetsStorage = async () => {
    await del(PRESETS_KEY);
};
