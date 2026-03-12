/**
 * Authentication Utility Functions
 * Centralized auth state management for consistent behavior across the app.
 */

import API_BASE_URL from '../config';

let refreshPromise = null;
let interceptorInstalled = false;

/**
 * Clear all authentication state from localStorage.
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
 * Check if user is authenticated based on presence of an access token.
 */
export const isAuthenticated = () => !!localStorage.getItem('access');

/**
 * Get the current user's role from localStorage.
 */
export const getUserRole = () => localStorage.getItem('role');

/**
 * Handle unauthorized state by clearing auth and redirecting to login.
 */
export const handleUnauthorized = () => {
  clearAuthState();
  window.location.href = '/login';
};

/**
 * Refresh access token once and share in-flight refresh call across requests.
 */
export const refreshAccessToken = async () => {
  if (refreshPromise) return refreshPromise;

  const refresh = localStorage.getItem('refresh');
  if (!refresh) return null;

  refreshPromise = fetch(`${API_BASE_URL}/api/users/token/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
  })
    .then(async (res) => {
      if (!res.ok) return null;
      const data = await res.json();
      if (data.access) {
        localStorage.setItem('access', data.access);
        if (data.refresh) localStorage.setItem('refresh', data.refresh);
        return data.access;
      }
      return null;
    })
    .catch(() => null)
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
};

/**
 * API wrapper with automatic Bearer token attachment + token refresh/retry on 401.
 */
export const apiFetch = async (url, options = {}) => {
  const opts = { ...options, headers: { ...(options.headers || {}) } };
  const access = localStorage.getItem('access');
  if (access && !opts.headers.Authorization) {
    opts.headers.Authorization = `Bearer ${access}`;
  }

  let response = await fetch(url, opts);
  if (response.status !== 401) return response;

  const newAccess = await refreshAccessToken();
  if (!newAccess) {
    handleUnauthorized();
    return response;
  }

  const retryOptions = {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${newAccess}`,
    },
  };
  response = await fetch(url, retryOptions);
  if (response.status === 401) {
    handleUnauthorized();
  }
  return response;
};

/**
 * Monkey-patch window.fetch so existing raw fetch calls gain auto-refresh behavior.
 */
export const installApiFetchInterceptor = () => {
  if (interceptorInstalled || typeof window === 'undefined') return;
  interceptorInstalled = true;

  const nativeFetch = window.fetch.bind(window);
  window.fetch = async (input, init = {}) => {
    const url = typeof input === 'string' ? input : input.url;
    const options = { ...init };

    const access = localStorage.getItem('access');
    const headers = new Headers(options.headers || (input instanceof Request ? input.headers : {}));
    if (access && !headers.has('Authorization') && `${url}`.includes('/api/')) {
      headers.set('Authorization', `Bearer ${access}`);
    }
    options.headers = headers;

    let response = await nativeFetch(input, options);
    if (response.status !== 401 || !`${url}`.includes('/api/')) return response;

    const newAccess = await refreshAccessToken();
    if (!newAccess) {
      handleUnauthorized();
      return response;
    }

    headers.set('Authorization', `Bearer ${newAccess}`);
    response = await nativeFetch(input, { ...options, headers });
    if (response.status === 401) handleUnauthorized();
    return response;
  };
};
