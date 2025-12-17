// Conditional Logger - Only logs in development mode
// Production-safe logging utility

const isDev = typeof import.meta !== 'undefined' && import.meta.env?.DEV;

export const logger = {
    /**
     * Debug logs - only shown in development
     * Use for: API responses, state changes, debugging info
     */
    debug: (...args: any[]) => {
        if (isDev) {
            console.log(...args);
        }
    },

    /**
     * Info logs - only shown in development
     * Use for: User actions, navigation, non-critical info
     */
    info: (...args: any[]) => {
        if (isDev) {
            console.info(...args);
        }
    },

    /**
     * Warning logs - always shown
     * Use for: Deprecated features, potential issues
     */
    warn: (...args: any[]) => {
        console.warn(...args);
    },

    /**
     * Error logs - always shown
     * Use for: Errors, exceptions, critical failures
     */
    error: (...args: any[]) => {
        console.error(...args);
    },
};
