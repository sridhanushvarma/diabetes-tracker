import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface ThemeToggleProps {
  theme?: 'light' | 'dark';
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme: themeProp }) => {
  const themeContext = useTheme();
  const theme = themeProp || themeContext.theme;
  const toggleTheme = themeContext.toggleTheme;
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2 rounded-lg bg-white/10 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all duration-300 hover:scale-110 active:scale-95 overflow-hidden group"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <span className="absolute inset-0 bg-gradient-to-br from-amber-300/0 to-amber-300/0 group-hover:from-amber-300/20 group-hover:to-primary-400/20 transition-all duration-500" />
      <span className="relative block w-5 h-5">
        {/* Sun */}
        <svg
          className={`absolute inset-0 w-5 h-5 text-white transition-all duration-500 ${
            isDark ? 'opacity-0 -rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'
          }`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        {/* Moon */}
        <svg
          className={`absolute inset-0 w-5 h-5 text-white transition-all duration-500 ${
            isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-50'
          }`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      </span>
    </button>
  );
};

export default ThemeToggle;
