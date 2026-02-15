/**
 * Authentication Utility Functions
 * Centralized auth state management for consistent behavior across the app
 */

/**
 * Clear all authentication state from localStorage.
 * Call this on logout or when session expires (401 errors).
 */
export const clearAuthState = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    localStorage.removeItem('phone');
    localStorage.removeItem('department');
};

/**
 * Check if user is authenticated (has a valid token in storage).
 * Note: This doesn't validate the token, just checks if it exists.
 */
export const isAuthenticated = () => {
    return !!localStorage.getItem('access');
};

/**
 * Get the current user's role from localStorage.
 */
export const getUserRole = () => {
    return localStorage.getItem('role');
};

/**
 * Handle 401 Unauthorized response.
 * Clears auth state and redirects to login.
 */
export const handleUnauthorized = () => {
    clearAuthState();
    window.location.href = '/login';
};
