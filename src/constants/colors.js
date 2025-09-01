// Dark Theme (Current)
export const darkBlue = "#0D1B2A";
export const yellow = "#FFD60A";

// Light Theme
export const lightBlue = "#E8F4FD";
export const darkYellow = "#E6C200";

// New Classic Dark Theme
export const darkClassic = {
  background: "#0B0F14",
  surface: "#121417",
  card: "#161A20",
  border: "#232A33",
  textPrimary: "#E6E8EB",
  textSecondary: "#AAB2BD",
  muted: "#6B7280",
  accent: "#4F9CF9",
  success: "#22C55E",
  warning: "#F59E0B",
  danger: "#EF4444"
};

export const themes = {
  dark: {
    primary: darkBlue,
    accent: yellow,
    background: darkBlue,
    text: yellow,
    card: "rgba(255, 214, 10, 0.1)",
    border: "rgba(255, 214, 10, 0.2)",
    input: "#fff",
    inputText: darkBlue,
  },
  light: {
    primary: "#fff",
    accent: darkYellow,
    background: "#f5f5f5",
    text: darkBlue,
    card: "rgba(13, 27, 42, 0.05)",
    border: "rgba(13, 27, 42, 0.1)",
    input: "#fff",
    inputText: darkBlue,
  },
  // Add the classic dark theme with standardized properties
  darkClassic: {
    primary: darkClassic.surface,
    accent: darkClassic.accent,
    background: darkClassic.background,
    text: darkClassic.textPrimary,
    card: darkClassic.card,
    border: darkClassic.border,
    input: darkClassic.surface,
    inputText: darkClassic.textPrimary,
    // Extended properties for the new theme
    textSecondary: darkClassic.textSecondary,
    muted: darkClassic.muted,
    success: darkClassic.success,
    warning: darkClassic.warning,
    danger: darkClassic.danger,
  },
};
