import { useColorScheme as useNativeColorScheme } from 'react-native';

/** Native fallback; web uses use-color-scheme.web.ts through platform resolution. */
export function useColorScheme(): 'light' | 'dark' {
  return useNativeColorScheme() === 'dark' ? 'dark' : 'light';
}
