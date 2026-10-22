
import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from 'react';
import { useColorScheme } from 'nativewind';

type PreferencesContextType = {
  isDark: boolean;
  toggleTheme: () => void;
};

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export function PreferencesProvider({  children,}: {  children: ReactNode;}) {
  const { colorScheme, setColorScheme } = useColorScheme();

  const isDark = colorScheme === 'dark';

  const toggleTheme = () => {
    setColorScheme(isDark ? 'light' : 'dark');
  };

  return (
    <PreferencesContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);

  if (!context) {
    throw new Error(
      'usePreferences must be used inside PreferencesProvider'
    );
  }

  return context;
}
