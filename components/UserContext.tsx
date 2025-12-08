
import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, UserProfile } from '../services/api';
import { STORAGE_KEY } from '../utils/gamification';

// TYPES
interface UserContextType {
    user: UserProfile | null;
    isLoading: boolean;
    login: (googleToken?: string) => Promise<void>;
    logout: () => void;
    isPro: boolean;
    syncExportCount: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) throw new Error("useUser must be used within UserProvider");
    return context;
};

// MOCK DATA FOR DEVELOPMENT (Until you connect real Antigravity URL)
// Set this to FALSE when your backend is ready!
const USE_MOCK_API = true;

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Initial Load
    useEffect(() => {
        const init = async () => {
            if (USE_MOCK_API) {
                // Check local storage for mock session
                const mockSession = localStorage.getItem('pv_mock_user');
                if (mockSession) {
                    const parsedUser = JSON.parse(mockSession);
                    // Sync local storage count
                    const localCount = parseInt(localStorage.getItem(STORAGE_KEY) || '0');
                    setUser({ ...parsedUser, exportCount: localCount });
                }
            } else {
                // Real API Call
                const profile = await api.getProfile();
                setUser(profile);
            }
            setIsLoading(false);
        };
        init();
    }, []);

    const login = async (googleToken?: string) => {
        setIsLoading(true);
        try {
            let profile: UserProfile;

            if (USE_MOCK_API) {
                // Simulate network delay
                await new Promise(r => setTimeout(r, 1000));
                
                const localCount = parseInt(localStorage.getItem(STORAGE_KEY) || '0');
                profile = {
                    id: 'user_mock_123',
                    email: 'demo@patternvora.com',
                    name: 'Demo Creator',
                    tier: 'free',
                    exportCount: localCount,
                    avatarUrl: 'https://ui-avatars.com/api/?name=Demo+User'
                };
                localStorage.setItem('pv_mock_user', JSON.stringify(profile));
            } else {
                if (!googleToken) throw new Error("Google Token required for real API");
                profile = await api.loginWithGoogle(googleToken);
            }

            setUser(profile);
        } catch (e) {
            console.error(e);
            alert("Login failed. Check console.");
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        if (USE_MOCK_API) {
            localStorage.removeItem('pv_mock_user');
        } else {
            api.logout();
        }
        setUser(null);
    };

    // Helper to sync local gamification with DB
    const syncExportCount = () => {
        if (user) {
            const currentLocal = parseInt(localStorage.getItem(STORAGE_KEY) || '0');
            const newCount = currentLocal + 1;
            
            // Update UI immediately
            setUser({ ...user, exportCount: newCount });
            
            // Sync Backend
            if (!USE_MOCK_API) {
                api.incrementExportCount(1);
            }
        }
    };

    const isPro = user ? (user.tier === 'pro' || user.tier === 'ltd') : false;

    return (
        <UserContext.Provider value={{ user, isLoading, login, logout, isPro, syncExportCount }}>
            {children}
        </UserContext.Provider>
    );
};
