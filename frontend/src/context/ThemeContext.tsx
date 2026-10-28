import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeType = 'sunset' | 'royal' | 'emerald' | 'cyber';

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (t: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeType>(() => {
    return (localStorage.getItem('polarise_theme') as ThemeType) || 'royal';
  });

  const setTheme = (t: ThemeType) => {
    setThemeState(t);
    localStorage.setItem('polarise_theme', t);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
