import axios from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

function getBaseUrl(): string {
  // If explicitly overridden via .env
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // Running on Web (Browser on your laptop/desktop)
  if (Platform.OS === 'web') {
    return 'http://localhost:3000/api/v1';
  }

  // Running on Mobile (Expo Go / Physical Device / Emulator)
  // 1. Try to auto-detect the dev machine host IP that Expo bundler connects to
  const hostUri = Constants.expoConfig?.hostUri || (Constants as any).manifest2?.extra?.expoGo?.debuggerHost;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    if (ip) {
      return `http://${ip}:3000/api/v1`;
    }
  }

  // 2. Default LAN IP for physical mobile devices on your local network
  return 'http://10.34.30.153:3000/api/v1';
}

export const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 10000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
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
