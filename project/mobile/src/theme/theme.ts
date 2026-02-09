// Base token values that don't change
export const baseTokens = {
  radius: {
    none: 0,
    sm: 0,
    md: 0,
    lg: 4,      // Very subtle, only for cards
    xl: 0,
    full: 9999,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  fontSize: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  fontFamily: {
    mono: {
        sm: "DMMono_400Regular",
        md: "DMMono_500Medium",
        lg: "DMMono_500Medium",
    },
    },
  fontWeight: {
    normal: "400" as const,
    medium: "500" as const,
    semibold: "600" as const,
    bold: "700" as const,
  },
  borderWidth: {
    thin: 2,        // Thick borders like in image
    default: 2,
    thick: 3,
  },
  shadow: {
    offset: 4,      // Hard shadow offset
  },
} as const;

// Accent color presets
export const accentColors = {
  yellow: {
    main: "#f4d03f",
    light: "#f9e076",
    dark: "#d4b72e",
    contrast: "#1a1a1a",
  },
  purple: {
    main: "#8b7cff",
    light: "#a89fff",
    dark: "#6b5ce6",
    contrast: "#ffffff",
  },
  blue: {
    main: "#4a9eff",
    light: "#6fb3ff",
    dark: "#3380e6",
    contrast: "#ffffff",
  },
  green: {
    main: "#4ade80",
    light: "#6ee89f",
    dark: "#38b764",
    contrast: "#1a1a1a",
  },
  red: {
    main: "#ef4444",
    light: "#f76b6b",
    dark: "#dc2626",
    contrast: "#ffffff",
  },
  pink: {
    main: "#ec4899",
    light: "#f472b6",
    dark: "#db2777",
    contrast: "#ffffff",
  },
  orange: {
    main: "#f97316",
    light: "#fb923c",
    dark: "#ea580c",
    contrast: "#ffffff",
  },
} as const;

// Theme color schemes
export const themes = {
  dark: {
    // Backgrounds
    bg: "#0B0C10",         // charbon
    bgElevated: "#12141A", // surface légèrement plus claire
    bgCard: "#141720",     // cards
    bgHover: "#1B1F2A",
    bgInput: "#0F1118",

    // Text
    text: "#F3F4F6",         // quasi blanc
    textSecondary: "#C7CAD1",
    textMuted: "#8B909B",

    // Borders (clairs, comme sur ton screenshot)
    border: "#000000",
    borderCard: "#ffffff",
    borderLight: "#2A2F3A",
    borderStrong: "#FFFFFF",

    // Shadows
    shadow: "#2E2E32",

    // States
    success: "#4ade80",
    warning: "#fbbf24",
    error: "#ef4444",
    info: "#60a5fa",
  },

  light: {
    bg: "#ffffff",
    bgElevated: "#f5f5f5",
    bgCard: "#ffffff",
    bgHover: "#f0f0f0",
    bgInput: "#ffffff",

    text: "#1a1a1a",
    textSecondary: "#666666",
    textMuted: "#999999",

    shadow: "#3A3A3A",

    border: "#000000",
    borderCard: "#000000",
    borderLight: "#e0e0e0",
    borderStrong: "#000000",

    success: "#22c55e",
    warning: "#f59e0b",
    error: "#ef4444",
    info: "#3b82f6",
  },
} as const;

// Create a complete theme
export const createTheme = (
  mode: "dark" | "light",
  accentColor: keyof typeof accentColors
) => {
  const baseColors = themes[mode];
  const accent = accentColors[accentColor];

  return {
    mode,
    colors: {
      ...baseColors,
      accent: accent.main,
      accentLight: accent.light,
      accentDark: accent.dark,
      accentContrast: accent.contrast,
    },
    ...baseTokens,
  };
};

// Default themes
export const darkYellowTheme = createTheme("dark", "yellow");
export const lightPurpleTheme = createTheme("light", "purple");
export const darkPurpleTheme = createTheme("dark", "purple");
export const lightBlueTheme = createTheme("light", "blue");

export type Theme = ReturnType<typeof createTheme>;
export type ThemeMode = "dark" | "light";
export type AccentColor = keyof typeof accentColors;