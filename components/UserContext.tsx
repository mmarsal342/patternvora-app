
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, UserProfile } from '../services/api';
import { STORAGE_KEY } from '../utils/gamification';

// TYPES
interface UserContextType {
    user: UserProfile | null;
    isLoading: boolean;
    login: () => void;
    logout: () => void;
    isPro: boolean;
    isGuest: boolean;
    syncExportCount: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) throw new Error("useUser must be used within UserProvider");
    return context;
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch user profile from backend
    const fetchProfile = useCallback(async () => {
        const profile = await api.getProfile();
        if (profile) {
            setUser(profile);
            // Sync local storage for gamification display
            localStorage.setItem(STORAGE_KEY, String(profile.exportCount));
        }
        return profile;
    }, []);

    // Initial Load - Check for auth callback token or existing session
    useEffect(() => {
        const init = async () => {
            // 1. Check if this is an OAuth callback (has ?token= in URL)
            const callbackToken = api.handleAuthCallback();

            if (callbackToken) {
                // Token was found in URL and saved, now fetch profile
                await fetchProfile();
            } else if (api.hasAuthToken()) {
                // Existing session - try to load profile
                await fetchProfile();
            }
            // Otherwise user is a guest (no token)

            setIsLoading(false);
        };

        init();
    }, [fetchProfile]);

    // Trigger Google OAuth redirect
    const login = () => {
        api.initiateGoogleLogin();
    };

    const logout = () => {
        api.logout();
        setUser(null);
        localStorage.removeItem(STORAGE_KEY);
    };

    // Refresh profile from backend
    const refreshProfile = async () => {
        await fetchProfile();
    };

    // Sync export count with backend
    const syncExportCount = async () => {
        if (!user) return;

        // Call backend to record export
        const result = await api.recordExport();

        if (result) {
            // Update local state
            setUser(prev => prev ? { ...prev, exportCount: result.count } : null);
            localStorage.setItem(STORAGE_KEY, String(result.count));

            // Check if user hit limit
            if (!result.canExport) {
                // Optional: Could show a modal here
                console.warn('Export limit reached!');
            }
        } else {
            // Fallback: increment locally for guests
            const currentLocal = parseInt(localStorage.getItem(STORAGE_KEY) || '0');
            const newCount = currentLocal + 1;
            localStorage.setItem(STORAGE_KEY, String(newCount));
        }
    };

    const isPro = user ? (user.tier === 'pro' || user.tier === 'ltd') : false;
    const isGuest = !user || user.tier === 'guest';

    return (
        <UserContext.Provider value={{
            user,
            isLoading,
            login,
            logout,
            isPro,
            isGuest,
            syncExportCount,
            refreshProfile
        }}>
            {children}
        </UserContext.Provider>
    );
};
