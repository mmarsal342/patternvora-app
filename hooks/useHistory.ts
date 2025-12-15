import { useState, useCallback, useRef } from 'react';
import { AppState, HistoryItem } from '../types';
import { generateThumbnail } from '../utils/thumbnail';

const MAX_HISTORY = 20;

export const useHistory = (initialState: AppState) => {
    // Current live state (what user sees)
    const [state, setState] = useState<AppState>(initialState);
    
    // The History Stack
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [currentIndex, setCurrentIndex] = useState(-1);

    const isUndoRedoRef = useRef(false);

    // Helper to push new state to history
    // We pass loadedImage because renderToCanvas needs it for the thumbnail
    const pushState = useCallback((newState: AppState, loadedImages: Record<string, HTMLImageElement>) => {
        // Prevent pushing duplicate states (optimization)
        if (history[currentIndex] && JSON.stringify(history[currentIndex].state) === JSON.stringify(newState)) {
            return;
        }

        // Generate thumbnail synchronously (it's small, so it's fast)
        const thumb = generateThumbnail(newState, loadedImages);
        
        const newItem: HistoryItem = {
            id: Date.now().toString() + Math.random(),
            state: JSON.parse(JSON.stringify(newState)), // Deep copy to detach references
            thumbnail: thumb,
            timestamp: Date.now()
        };

        setHistory(prev => {
            // LOGIC CHANGE: NON-DESTRUCTIVE HISTORY
            // Instead of slicing the future (standard undo), we append the new state to the end.
            // This ensures users never lose generated patterns when they go back and edit.
            
            // Old Logic (Destructive):
            // const upToCurrent = prev.slice(0, currentIndex + 1);
            // const newHistory = [...upToCurrent, newItem];
            
            // New Logic (Append Only):
            const newHistory = [...prev, newItem];
            
            // Limit stack size (Remove from the START/OLDEST if full)
            if (newHistory.length > MAX_HISTORY) {
                return newHistory.slice(newHistory.length - MAX_HISTORY);
            }
            return newHistory;
        });

        // Always jump to the NEWEST item (the end of the list)
        setCurrentIndex(prev => {
            // Calculate new length based on previous length
            const predictedLength = history.length + 1; 
            // If we capped it, index is max-1, else it's length-1
            return predictedLength > MAX_HISTORY ? MAX_HISTORY - 1 : predictedLength - 1;
        });
    }, [history, currentIndex]);

    // Initial push on mount
    const initHistory = useCallback((s: AppState, imgs: Record<string, HTMLImageElement>) => {
        if (history.length === 0) {
            pushState(s, imgs);
        }
    }, [history.length, pushState]);

    const undo = useCallback(() => {
        if (currentIndex > 0) {
            isUndoRedoRef.current = true;
            const newIndex = currentIndex - 1;
            setCurrentIndex(newIndex);
            setState(history[newIndex].state);
            setTimeout(() => { isUndoRedoRef.current = false; }, 0);
        }
    }, [currentIndex, history]);

    const redo = useCallback(() => {
        if (currentIndex < history.length - 1) {
            isUndoRedoRef.current = true;
            const newIndex = currentIndex + 1;
            setCurrentIndex(newIndex);
            setState(history[newIndex].state);
            setTimeout(() => { isUndoRedoRef.current = false; }, 0);
        }
    }, [currentIndex, history]);

    const jumpTo = useCallback((index: number) => {
        if (index >= 0 && index < history.length) {
            isUndoRedoRef.current = true;
            setCurrentIndex(index);
            setState(history[index].state);
            setTimeout(() => { isUndoRedoRef.current = false; }, 0);
        }
    }, [history]);

    const updateStateDirectly = useCallback((updates: Partial<AppState>) => {
        setState(prev => ({ ...prev, ...updates }));
    }, []);

    return {
        state,
        history,
        currentIndex,
        pushState,
        undo,
        redo,
        jumpTo,
        updateStateDirectly, // Updates state WITHOUT pushing to history (for sliders)
        initHistory,
        canUndo: currentIndex > 0,
        canRedo: currentIndex < history.length - 1
    };
};