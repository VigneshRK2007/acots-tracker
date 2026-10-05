import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
type ThemeContextValue = { dark: boolean; toggleTheme: () => void };
const ThemeContext = createContext<ThemeContextValue | null>(null);
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [dark, setDark] = useState(false);
  useEffect(() => { const saved = localStorage.getItem('acots-theme') === 'dark'; setDark(saved); document.documentElement.classList.toggle('dark', saved); }, []);
  const toggleTheme = () => setDark(value => { const next = !value; document.documentElement.classList.toggle('dark', next); localStorage.setItem('acots-theme', next ? 'dark' : 'light'); return next; });
  return <ThemeContext.Provider value={{ dark, toggleTheme }}>{children}</ThemeContext.Provider>;
}
export function useTheme() { const value = useContext(ThemeContext); if (!value) throw new Error('Theme context missing'); return value; }
