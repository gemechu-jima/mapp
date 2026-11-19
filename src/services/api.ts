import axios from 'axios';

const RENDER_API_URL = 'https://bbackend-f1hk.onrender.com/api/v1';

function getBaseUrl(): string {
  const envUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (envUrl) {
    return envUrl.replace(/\/$/, '');
  }

  // In local/dev runs prefer local backend unless EXPO_PUBLIC_API_URL overrides it.
  if (__DEV__) {
    return 'http://localhost:3000/api/v1';
  }

  return RENDER_API_URL;
}

export const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 60000, // 60s timeout so Render free-tier cold starts don't fail
  headers: {
    Accept: 'application/json',
    "Content-Type": "application/json",

  },
});
export const uploadApi = axios.create({
  baseURL: getBaseUrl(),
  timeout: 60000, // 60s timeout so Render free-tier cold starts don't fail
  headers: {
    Accept: 'application/json',
  },
});
/** Call this after login to attach the Bearer token to every subsequent request. */
export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
}