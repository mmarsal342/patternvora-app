
// SERVICES/API.TS - Cloudflare Workers Backend Integration

// Cloudflare Workers API URL
const API_BASE_URL = 'https://patternvora-api.patternvora-api.workers.dev';

// Token storage key (matches backend convention)
const AUTH_TOKEN_KEY = 'auth_token';

// Helper for Auth Headers
const getHeaders = () => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

export interface UserProfile {
    id: string;
    email: string;
    name: string;
    tier: 'guest' | 'free' | 'pro' | 'ltd';
    exportCount: number;
    avatarUrl?: string;
}

export const api = {
    // 1. AUTHENTICATION - OAuth Redirect Flow

    // Trigger Google OAuth redirect
    initiateGoogleLogin: () => {
        // Auto-detect redirect URL (localhost for dev, Vercel for prod)
        const redirectUrl = window.location.origin;
        window.location.href = `${API_BASE_URL}/auth/google?redirect_url=${encodeURIComponent(redirectUrl)}`;
    },

    // Handle callback - extract token from URL and store it
    handleAuthCallback: (): string | null => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');

        if (token) {
            localStorage.setItem(AUTH_TOKEN_KEY, token);
            // Clean up URL
            window.history.replaceState({}, document.title, window.location.pathname);
            return token;
        }
        return null;
    },

    // Check if user has valid auth token
    hasAuthToken: (): boolean => {
        return !!localStorage.getItem(AUTH_TOKEN_KEY);
    },

    getProfile: async (): Promise<UserProfile | null> => {
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        if (!token) return null;

        try {
            const response = await fetch(`${API_BASE_URL}/user/profile`, {
                headers: getHeaders()
            });

            if (!response.ok) {
                // Token expired or invalid
                localStorage.removeItem(AUTH_TOKEN_KEY);
                return null;
            }

            const data = await response.json();
            return {
                id: data.id,
                email: data.email,
                name: data.name,
                tier: data.tier || 'free',
                exportCount: data.export_count || 0,
                avatarUrl: data.avatar_url
            };
        } catch (e) {
            console.error('Failed to fetch profile', e);
            return null;
        }
    },

    logout: () => {
        localStorage.removeItem(AUTH_TOKEN_KEY);
    },

    // 2. EXPORT USAGE TRACKING
    recordExport: async () => {
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        if (!token) return null;

        try {
            const response = await fetch(`${API_BASE_URL}/user/export`, {
                method: 'POST',
                headers: getHeaders()
            });

            if (!response.ok) return null;

            const data = await response.json();
            return {
                canExport: data.can_export,
                count: data.count,
                limit: data.limit,
                resetsAt: data.resets_at
            };
        } catch (e) {
            console.error("Failed to record export", e);
            return null;
        }
    },

    // Check export limits before export
    checkExportLimit: async (): Promise<{ canExport: boolean; count: number; limit: number | null; resetsAt: string | null }> => {
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        if (!token) {
            // Guest user - no tracking
            return { canExport: true, count: 0, limit: null, resetsAt: null };
        }

        try {
            const profile = await api.getProfile();
            if (!profile) return { canExport: true, count: 0, limit: null, resetsAt: null };

            // Pro/LTD users have no limits
            if (profile.tier === 'pro' || profile.tier === 'ltd') {
                return { canExport: true, count: profile.exportCount, limit: null, resetsAt: null };
            }

            // Free users have 10 exports per 30 days
            const limit = 10;
            return {
                canExport: profile.exportCount < limit,
                count: profile.exportCount,
                limit,
                resetsAt: null // TODO: Get from backend
            };
        } catch (e) {
            return { canExport: true, count: 0, limit: null, resetsAt: null };
        }
    },

    // 3. PAYMENTS (Mayar Integration)
    createCheckoutSession: async (planId: string, currency: 'USD' | 'IDR') => {
        const response = await fetch(`${API_BASE_URL}/payments/create-session`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ planId, currency })
        });

        if (!response.ok) throw new Error('Failed to init checkout');

        const data = await response.json();
        return data.checkoutUrl;
    }
};
