
// SERVICES/API.TS - The Bridge between React and Antigravity Backend

// Change this to your Antigravity production URL later
const API_BASE_URL = 'http://localhost:8000/api'; 

// Helper for Auth Headers
const getHeaders = () => {
    const token = localStorage.getItem('pv_auth_token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

export interface UserProfile {
    id: string;
    email: string;
    name: string;
    tier: 'free' | 'pro' | 'ltd';
    exportCount: number;
    avatarUrl?: string;
}

export const api = {
    // 1. AUTHENTICATION
    loginWithGoogle: async (googleToken: string): Promise<UserProfile> => {
        // In a real Antigravity setup, you send the Google ID Token to the backend
        // The backend verifies it, creates/updates the user, and returns a Session JWT
        const response = await fetch(`${API_BASE_URL}/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: googleToken })
        });

        if (!response.ok) throw new Error('Login failed');

        const data = await response.json();
        
        // Save the backend's JWT/Session token
        localStorage.setItem('pv_auth_token', data.token);
        
        return data.user;
    },

    getProfile: async (): Promise<UserProfile | null> => {
        const token = localStorage.getItem('pv_auth_token');
        if (!token) return null;

        try {
            const response = await fetch(`${API_BASE_URL}/users/me`, {
                headers: getHeaders()
            });
            
            if (!response.ok) {
                // Token expired
                localStorage.removeItem('pv_auth_token');
                return null;
            }

            const data = await response.json();
            return data;
        } catch (e) {
            return null;
        }
    },

    logout: () => {
        localStorage.removeItem('pv_auth_token');
    },

    // 2. GAMIFICATION SYNC
    incrementExportCount: async (amount: number = 1) => {
        const token = localStorage.getItem('pv_auth_token');
        if (!token) return; // If offline/free guest, we don't sync to DB yet

        try {
            await fetch(`${API_BASE_URL}/gamification/increment`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ amount })
            });
        } catch (e) {
            console.error("Failed to sync stats", e);
        }
    },

    // 3. PAYMENTS (Checkout Session)
    createCheckoutSession: async (planId: string, currency: 'USD' | 'IDR') => {
        const response = await fetch(`${API_BASE_URL}/payments/create-session`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ planId, currency })
        });

        if (!response.ok) throw new Error('Failed to init checkout');

        const data = await response.json();
        // Return the Redirect URL (Stripe Checkout or Mayar Payment Page)
        return data.checkoutUrl;
    }
};
