'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

export const THEMES = [
  { id: 'dark', name: 'Dark', group: 'Dark' },
  { id: 'light', name: 'Light', group: 'Light' },
  { id: 'system', name: 'System', group: 'Auto' },
  { id: 'monokai', name: 'Monokai', group: 'Dark' },
  { id: 'dracula', name: 'Dracula', group: 'Dark' },
  { id: 'nord', name: 'Nord', group: 'Dark' },
  { id: 'github-dark', name: 'GitHub Dark', group: 'Dark' },
  { id: 'solarized-dark', name: 'Solarized Dark', group: 'Dark' },
  { id: 'solarized-light', name: 'Solarized Light', group: 'Light' },
  { id: 'high-contrast', name: 'High Contrast', group: 'Dark' },
] as const;

export type ThemeId = typeof THEMES[number]['id'];

interface ThemeContextType {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
  resolvedTheme: string; // actual applied theme (resolves 'system')
}

const ThemeContext = createContext<ThemeContextType | null>(null);

function getSystemTheme(): string {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

export function ThemeProvider({ children, initialTheme }: { children: ReactNode; initialTheme?: string }) {
  const [theme, setThemeState] = useState<ThemeId>((initialTheme as ThemeId) || 'dark');
  const [resolved, setResolved] = useState<string>('dark');

  const applyTheme = useCallback((themeId: ThemeId) => {
    const actual = themeId === 'system' ? getSystemTheme() : themeId;
    setResolved(actual);
    document.documentElement.setAttribute('data-theme', actual);
  }, []);

  const setTheme = useCallback((newTheme: ThemeId) => {
    setThemeState(newTheme);
    localStorage.setItem('flashread-theme', newTheme);
    applyTheme(newTheme);
  }, [applyTheme]);

  // On mount, read from localStorage or preferences
  useEffect(() => {
    const saved = localStorage.getItem('flashread-theme') as ThemeId | null;
    if (saved) {
      setThemeState(saved);
      applyTheme(saved);
    } else {
      applyTheme(theme);
    }
  }, []);

  // Listen for system theme changes when in 'system' mode
  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: light)');
    const handler = () => applyTheme('system');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme, applyTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme: resolved }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
