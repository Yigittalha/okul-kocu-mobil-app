import React, { createContext, useContext, useState, useEffect } from "react";
import { setTheme as saveTheme, getTheme } from "../lib/storage";
import { themes } from "../constants/colors";

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(true); // Default to dark mode
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await getTheme();
        if (savedTheme !== null) {
          setIsDark(savedTheme === "dark");
        }
      } catch (error) {
        // Theme load error - use default theme
      } finally {
        setLoading(false);
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    await saveTheme(newTheme ? "dark" : "light");
  };

  // Use darkClassic theme when in dark mode instead of the regular dark theme
  const theme = isDark ? themes.darkClassic : themes.light;

  return (
    <ThemeContext.Provider
      value={{
        isDark,
        theme,
        toggleTheme,
        loading,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
