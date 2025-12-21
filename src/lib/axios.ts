/**
 * Axios instance with automatic JWT refresh
 * 
 * Features:
 * - Automatically adds Authorization header
 * - Auto-refreshes expired tokens (401 errors)
 * - Sends cookies for refresh token
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// API base URL
const API_BASE_URL = 'https://patternvora-api.patternvora-api.workers.dev';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // Important: sends httpOnly cookies (refresh_token)
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor: Add access token to headers
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('access_token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor: Auto-refresh on 401
api.interceptors.response.use(
    (response) => response, // Success - just return
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // If 401 Unauthorized and not already retried
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                console.log('[Auth] Access token expired, refreshing...');

                // Call refresh endpoint (uses refresh_token cookie)
                const { data } = await axios.post(
                    `${API_BASE_URL}/auth/refresh`,
                    {},
                    { withCredentials: true }
                );

                console.log('[Auth] ✅ Token refreshed successfully');

                // Save new access token
                localStorage.setItem('access_token', data.token);

                // Update Authorization header with new token
                if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${data.token}`;
                }

                // Retry original request with new token
                return api(originalRequest);
            } catch (refreshError) {
                console.error('[Auth] ❌ Token refresh failed:', refreshError);

                // Refresh failed - clear tokens and redirect to login
                localStorage.removeItem('access_token');

                // Redirect to home (will trigger Google OAuth)
                window.location.href = '/';

                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
