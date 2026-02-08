export const tokens = {
  colors: {
    // Backgrounds
    bg: "#0e0e10",
    bgElevated: "#18181c",
    card: "#0b0b0c",
    hover: "#101014",
    
    // Text
    text: "#f5f5f5",
    textMuted: "#bcbcbc",
    textInverted: "#0e0e10",
    muted: "#bcbcbc", // keep for backward compatibility
    
    // Borders
    border: "#ffffff",
    borderSubtle: "rgba(255, 255, 255, 0.1)",
    
    // Accents
    accent: "#5a3fd1",
    accentHover: "#6d4fe6",
    accentActive: "#4a2fb8",
    
    // Grays
    gray100: "#f5f5f5",
    gray200: "#e0e0e0",
    gray300: "#bcbcbc",
    gray400: "#8a8a8a",
    gray500: "#5a5a5a",
    gray600: "#3a3a3a",
    gray700: "#2a2a2a",
    gray800: "#18181c",
    gray900: "#0e0e10",
    
    // States
    success: "#4ade80",
    warning: "#fbbf24",
    error: "#ef4444",
    info: "#60a5fa",
  },
  
  radius: {
    none: 0,
    sm: 0,
    md: 0,
    lg: 0,
    full: 9999,
  },
  
  spacing: {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 20,
    xl: 28,
    xxl: 40,
  },
  
  stroke: {
    thin: 2,
    thick: 4,
  },
  
  shadow: {
    offset: 8,
  },
  
  motion: {
    dur: 180,
  },
  
  typography: {
    fontFamily: "DMMono_400Regular",
    fontFamilyStrong: "DMMono_500Medium",
    letterSpacing: 0.2,
    fontSize: 14,
    h1: 24,
    h2: 20,
    h3: 18,
    small: 12,
    version: 12,
  },
} as const;