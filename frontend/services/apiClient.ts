/**
 * Centralized Axios HTTP client for SegueEMR frontend.
 *
 * Features:
 * - JWT token automatically attached to every request
 * - 401 response → session cleared → redirect to root (login page)
 * - All errors mapped to user-friendly messages (no raw "AxiosError", no stack traces)
 * - Single place to change API base URL, timeouts, retries
 */

import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const isStaffRoute = () => {
  if (typeof window === 'undefined') return false;
  const path = window.location.pathname;
  if (path.startsWith('/staff')) return true;
  if (path.startsWith('/dashboard') && !path.startsWith('/dashboard/patient')) return true;
  return false;
};

// ─── User-friendly error messages ─────────────────────────────────────────────
const HTTP_ERROR_MESSAGES: Record<number, string> = {
  400: 'The request was invalid. Please check your input.',
  401: 'Your session has expired. Please sign in again.',
  403: 'You do not have permission to perform this action.',
  404: 'The requested resource could not be found.',
  409: 'A conflict occurred. This record may already exist.',
  422: 'The provided data is invalid.',
  429: 'Too many requests. Please wait a moment before trying again.',
  500: "We're experiencing a temporary issue. Please try again shortly.",
  502: 'The server is temporarily unavailable. Please try again.',
  503: 'The service is temporarily unavailable. Please try again shortly.',
};

const NETWORK_ERROR_MESSAGE = 'Unable to connect to the server. Please check your internet connection.';
const DEFAULT_ERROR_MESSAGE  = 'Something went wrong. Please try again.';

// ─── Axios instance ────────────────────────────────────────────────────────────
export const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 30_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request Interceptor — attach JWT ─────────────────────────────────────────
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const tokenKey = isStaffRoute() ? 'segue_token_staff' : 'segue_token_patient';
      const token = localStorage.getItem(tokenKey);
      if (token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// ─── Response Interceptor — map errors to user-friendly messages ──────────────
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<{ message?: string; code?: string; error?: string }>) => {
    // Network failure (no response received)
    if (!error.response) {
      return Promise.reject(new Error(NETWORK_ERROR_MESSAGE));
    }

    const { status, data } = error.response;

    // Session expired — clear storage and redirect to login
    if (status === 401) {
      if (typeof window !== 'undefined') {
        const tokenKey = isStaffRoute() ? 'segue_token_staff' : 'segue_token_patient';
        const userKey = isStaffRoute() ? 'segue_user_staff' : 'segue_user_patient';
        localStorage.removeItem(tokenKey);
        localStorage.removeItem(userKey);
        // Soft redirect — Next.js router will handle it on next render cycle
        window.location.href = isStaffRoute() ? '/staff/login' : '/';
      }
      return Promise.reject(new Error(HTTP_ERROR_MESSAGES[401]));
    }

    // Use server-provided message if it's safe and non-technical.
    // Backend uses { success: false, error: "..." } — check both `message` and `error` fields.
    const rawServerMessage = data?.error || data?.message;
    const isServerMessageSafe =
      rawServerMessage &&
      typeof rawServerMessage === 'string' &&
      rawServerMessage.length < 300 &&
      !rawServerMessage.toLowerCase().includes('prisma') &&
      !rawServerMessage.toLowerCase().includes('sql') &&
      !rawServerMessage.toLowerCase().includes('stack') &&
      !rawServerMessage.toLowerCase().includes('at ');

    const userMessage = isServerMessageSafe
      ? rawServerMessage
      : (HTTP_ERROR_MESSAGES[status] ?? DEFAULT_ERROR_MESSAGE);

    // In development, log full error for debugging — skip 404s (expected "not found" responses)
    if (process.env.NODE_ENV === 'development' && status !== 404) {
      console.error('[API Error]', { status, data, url: error.config?.url, userMessage });
    }

    return Promise.reject(new Error(userMessage));
  }
);

export default apiClient;
