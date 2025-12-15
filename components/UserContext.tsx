
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

        console.log('[syncExportCount] Starting, current user.exportCount:', user?.exportCount);

        // Call backend to record export
        const result = await api.recordExport();

        console.log('[syncExportCount] API result:', result);

        if (result) {
            // Update local state
            console.log('[syncExportCount] Updating state with count:', result.count);
            setUser(prev => prev ? { ...prev, exportCount: result.count } : null);
            localStorage.setItem(STORAGE_KEY, String(result.count));

            // Check if user hit limit
            if (!result.canExport) {
                // Optional: Could show a modal here
                console.warn('Export limit reached!');
            }
        } else {
            // Fallback: increment locally when backend fails
            const currentCount = user?.exportCount || 0;
            const newCount = currentCount + 1;

            console.log('[syncExportCount] Backend failed, incrementing locally:', currentCount, '->', newCount);

            // Update user state so canExport() check works
            setUser(prev => prev ? { ...prev, exportCount: newCount } : null);
            localStorage.setItem(STORAGE_KEY, String(newCount));
        }
    };

    const isPro = user ? (
        // Lifetime users always have access
        user.tier === 'lifetime' || user.tier === 'ltd' ||
        // Pro users need valid (non-expired) subscription
        (user.tier === 'pro' && (!user.proExpiresAt || new Date(user.proExpiresAt) > new Date()))
    ) : false;
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
