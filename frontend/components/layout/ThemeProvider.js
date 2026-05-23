"use client";

import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext({ isDark: false, toggleDark: () => {} });

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);

  // On mount, read saved preference
  useEffect(() => {
    const saved = localStorage.getItem('xsplit-theme');
    if (saved === 'dark') {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDark = () => {
    setIsDark(prev => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('xsplit-theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('xsplit-theme', 'light');
      }
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
