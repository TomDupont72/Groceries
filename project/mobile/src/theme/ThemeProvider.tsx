import React, { createContext, useContext, useState, ReactNode } from "react";
import { createTheme, Theme, ThemeMode, AccentColor } from "./theme";

interface ThemeContextType {
  theme: Theme;
  mode: ThemeMode;
  accentColor: AccentColor;
  setTheme: (mode: ThemeMode, accent: AccentColor) => void;
  toggleMode: () => void;
  setAccentColor: (accent: AccentColor) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({
  children,
  initialMode = "dark",
  initialAccent = "yellow",
}: {
  children: ReactNode;
  initialMode?: ThemeMode;
  initialAccent?: AccentColor;
}) {
  const [mode, setMode] = useState<ThemeMode>(initialMode);
  const [accentColor, setAccentColorState] = useState<AccentColor>(initialAccent);
  const [theme, setThemeState] = useState<Theme>(createTheme(initialMode, initialAccent));

  const setTheme = (newMode: ThemeMode, newAccent: AccentColor) => {
    setMode(newMode);
    setAccentColorState(newAccent);
    setThemeState(createTheme(newMode, newAccent));
  };

  const toggleMode = () => {
    const newMode = mode === "dark" ? "light" : "dark";
    setTheme(newMode, accentColor);
  };

  const setAccentColor = (newAccent: AccentColor) => {
    setTheme(mode, newAccent);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        mode,
        accentColor,
        setTheme,
        toggleMode,
        setAccentColor,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}