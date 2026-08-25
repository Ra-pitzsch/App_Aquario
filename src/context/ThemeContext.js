import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { themes, darkTheme } from '../styles/theme';

const STORAGE_KEY = '@theme';

const ThemeContext = createContext({
  theme: 'dark',
  isDark: true,
  colors: darkTheme,
  toggleTheme: () => {},
  setTheme: () => {},
});

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState('dark');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSavedTheme() {
      try {
        const savedTheme = await AsyncStorage.getItem(STORAGE_KEY);
        if (savedTheme === 'light' || savedTheme === 'dark') {
          setThemeState(savedTheme);
        } else {
          setThemeState('dark');
        }
      } catch (error) {
        console.error('Erro ao carregar tema do AsyncStorage:', error);
      } finally {
        setLoading(false);
      }
    }

    loadSavedTheme();
  }, []);

  const setTheme = async (newTheme) => {
    if (newTheme !== 'light' && newTheme !== 'dark') return;
    try {
      setThemeState(newTheme);
      await AsyncStorage.setItem(STORAGE_KEY, newTheme);
    } catch (error) {
      console.error('Erro ao salvar tema no AsyncStorage:', error);
    }
  };

  const toggleTheme = async () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    await setTheme(nextTheme);
  };

  const currentColors = themes[theme] || darkTheme;
  const isDark = theme === 'dark';

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark,
        colors: currentColors,
        toggleTheme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
  }
  return context;
}

export default ThemeContext;
