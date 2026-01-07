
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
    tier: 'guest' | 'free' | 'pro' | 'ltd' | 'lifetime';
    exportCount: number;
    avatarUrl?: string;
    proExpiresAt?: string | null;
}

export const api = {
    // 1. AUTHENTICATION - OAuth Redirect Flow

    // Trigger Google OAuth redirect
    initiateGoogleLogin: () => {
        // Auto-detect redirect URL (localhost for dev, Vercel for prod)
        const redirectUrl = window.location.origin;
        window.location.href = `${API_BASE_URL}/auth/google?redirect_url=${encodeURIComponent(redirectUrl)}`;
    },

    // Handle callback - extract token from URL fragment (secure) or query param (legacy)
    handleAuthCallback: (): string | null => {
        // Try URL fragment first (new secure method: /#token=xxx)
        const hash = window.location.hash;
        let token: string | null = null;

        if (hash && hash.includes('token=')) {
            // Parse fragment as URLSearchParams (remove leading #)
            const fragmentParams = new URLSearchParams(hash.substring(1));
            token = fragmentParams.get('token');
        }

        // Fallback to query param for backward compatibility (?token=xxx)
        if (!token) {
            const queryParams = new URLSearchParams(window.location.search);
            token = queryParams.get('token');
        }

        if (token) {
            localStorage.setItem(AUTH_TOKEN_KEY, token);
            // Clean up URL (remove both fragment and query params)
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

            console.log('[API] getProfile response:', { email: userData.email, tier: userData.tier, export_count: userData.export_count });

            return {
                id: userData.id,
                email: userData.email,
                name: userData.name,
                tier: userData.tier || 'free',
                exportCount: userData.export_count || 0,
                avatarUrl: userData.avatar_url,
                proExpiresAt: userData.pro_expires_at || null
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
            console.log('[API recordExport] Raw response:', data);

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
            if (profile.tier === 'pro' || profile.tier === 'ltd' || profile.tier === 'lifetime') {
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
        },

        // Grant trial PRO access
        grantTrial: async (userId: string, duration: '12h' | '24h' | '3d' | '7d' | '14d' | '21d' | '30d'): Promise<{ pro_expires_at: string }> => {
            const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/grant-trial`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ duration })
            });
            if (!response.ok) throw new Error('Failed to grant trial');
            return response.json();
        },

        // Revoke PRO access
        revokePro: async (userId: string): Promise<void> => {
            const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/revoke-pro`, {
                method: 'POST',
                headers: getHeaders()
            });
            if (!response.ok) throw new Error('Failed to revoke PRO');
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
    pro_expires_at: string | null;
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

// Preset Types
export interface Preset {
    id: string;
    name: string;
    config: string;
    thumbnail?: string | null;
    created_at: string;
    updated_at?: string;
}

export interface PresetsResponse {
    presets: Preset[];
    count: number;
    limit: number;
}

// Presets API
export const presetsApi = {
    // List user's presets
    list: async (): Promise<PresetsResponse> => {
        const response = await fetch(`${API_BASE_URL}/presets`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to load presets');
        return response.json();
    },

    // Save a new preset
    save: async (name: string, config: string, thumbnail?: string): Promise<{ success: boolean; preset: Preset }> => {
        const response = await fetch(`${API_BASE_URL}/presets`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ name, config, thumbnail })
        });
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to save preset');
        }
        return response.json();
    },

    // Delete a preset
    delete: async (presetId: string): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/presets/${presetId}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to delete preset');
    }
};

