
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
            // Backend returns { user: {...}, subscription: {...} }
            const userData = data.user || data; // Fallback for backwards compatibility

            console.log('[API] getProfile response:', { email: userData.email, tier: userData.tier });

            return {
                id: userData.id,
                email: userData.email,
                name: userData.name,
                tier: userData.tier || 'free',
                exportCount: userData.export_count || 0,
                avatarUrl: userData.avatar_url
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
    },

    // 4. PROMO CODE REDEMPTION (User-facing)
    redeemPromoCode: async (code: string): Promise<{ success: boolean; message: string; tier?: string }> => {
        const response = await fetch(`${API_BASE_URL}/user/redeem-promo`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ code })
        });

        const data = await response.json();
        return {
            success: response.ok,
            message: data.message || (response.ok ? 'Code redeemed!' : 'Failed to redeem'),
            tier: data.tier
        };
    },

    // 5. ADMIN APIs (Protected by admin middleware on backend)
    admin: {
        // List all users
        listUsers: async (): Promise<AdminUser[]> => {
            const response = await fetch(`${API_BASE_URL}/admin/users`, {
                headers: getHeaders()
            });
            if (!response.ok) throw new Error('Failed to fetch users');
            const data = await response.json();
            return data.users || [];
        },

        // Upgrade user tier
        upgradeUser: async (userId: string, tier: string): Promise<void> => {
            const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/upgrade`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ tier })
            });
            if (!response.ok) throw new Error('Failed to upgrade user');
        },

        // Generate promo code
        generatePromoCode: async (params: { code: string; tier: string; maxUses: number }): Promise<PromoCode> => {
            const response = await fetch(`${API_BASE_URL}/admin/promo/generate`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(params)
            });
            if (!response.ok) throw new Error('Failed to generate code');
            return response.json();
        },

        // List all promo codes
        listPromoCodes: async (): Promise<PromoCode[]> => {
            const response = await fetch(`${API_BASE_URL}/admin/promo/list`, {
                headers: getHeaders()
            });
            if (!response.ok) throw new Error('Failed to fetch promo codes');
            const data = await response.json();
            return data.codes || [];
        },

        // Get analytics
        getAnalytics: async (): Promise<AdminAnalytics> => {
            const response = await fetch(`${API_BASE_URL}/admin/analytics`, {
                headers: getHeaders()
            });
            if (!response.ok) throw new Error('Failed to fetch analytics');
            return response.json();
        }
    }
};

// Admin Types
export interface AdminUser {
    id: string;
    email: string;
    name: string | null;
    avatar_url: string | null;
    tier: string;
    export_count: number;
    created_at: string;
}

export interface PromoCode {
    id: string;
    code: string;
    tier: string;
    max_uses: number;
    current_uses: number;
    redeemed_by: string | null;
    expires_at: string | null;
    created_at: string;
    created_by: string;
}

export interface AdminAnalytics {
    totalUsers: number;
    freeUsers: number;
    lifetimeUsers: number;
    totalExports: number;
    promoStats: {
        totalCodes: number;
        usedCodes: number;
        availableCodes: number;
    };
}
