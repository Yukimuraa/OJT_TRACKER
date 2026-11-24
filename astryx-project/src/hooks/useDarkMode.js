import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'ojt_dark_mode';
const THEME_CHANGE_EVENT = 'ojt_theme_mode_change';

function getStoredDarkMode() {
  if (typeof window === 'undefined') return false;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    // Strictly require explicit 'true'. Default is ALWAYS false (light theme).
    return stored === 'true';
  } catch {
    return false;
  }
}

function applyThemeToDom(isDark) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const body = document.body;
  if (isDark) {
    root.setAttribute('data-theme', 'dark');
    root.classList.add('dark');
    if (body) body.classList.add('dark');
  } else {
    root.removeAttribute('data-theme');
    root.classList.remove('dark');
    if (body) {
      body.classList.remove('dark');
      body.removeAttribute('data-theme');
    }
  }
}

// Immediate eager execution to prevent any flash of dark mode on page load
if (typeof document !== 'undefined') {
  applyThemeToDom(getStoredDarkMode());
}

export function useDarkMode() {
  const [isDarkMode, setIsDarkMode] = useState(getStoredDarkMode);

  // Sync state and DOM on mount and when external events fire
  useEffect(() => {
    applyThemeToDom(isDarkMode);

    const handleThemeChange = (e) => {
      const next = typeof e.detail === 'boolean' ? e.detail : getStoredDarkMode();
      setIsDarkMode(next);
      applyThemeToDom(next);
    };

    const handleStorage = (e) => {
      if (e.key === STORAGE_KEY) {
        const next = e.newValue === 'true';
        setIsDarkMode(next);
        applyThemeToDom(next);
      }
    };

    window.addEventListener(THEME_CHANGE_EVENT, handleThemeChange);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener(THEME_CHANGE_EVENT, handleThemeChange);
      window.removeEventListener('storage', handleStorage);
    };
  }, [isDarkMode]);

  const setDarkMode = useCallback((value) => {
    const isDark = Boolean(value);
    try {
      localStorage.setItem(STORAGE_KEY, String(isDark));
    } catch {}
    setIsDarkMode(isDark);
    applyThemeToDom(isDark);
    window.dispatchEvent(new CustomEvent(THEME_CHANGE_EVENT, { detail: isDark }));
  }, []);

  const toggleDarkMode = useCallback(() => {
    setDarkMode(!getStoredDarkMode());
  }, [setDarkMode]);

  return { isDarkMode, toggleDarkMode, setDarkMode };
}

export default useDarkMode;
