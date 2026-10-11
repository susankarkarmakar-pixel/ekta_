export const themeColors: {
  primary: { light: string; dark: string };
  onPrimary: { light: string; dark: string };
  primaryContainer: { light: string; dark: string };
  onPrimaryContainer: { light: string; dark: string };
  secondary: { light: string; dark: string };
  onSecondary: { light: string; dark: string };
  background: { light: string; dark: string };
  surface: { light: string; dark: string };
  surfaceContainer: { light: string; dark: string };
  surfaceVariant: { light: string; dark: string };
  foreground: { light: string; dark: string };
  muted: { light: string; dark: string };
  outline: { light: string; dark: string };
  outlineVariant: { light: string; dark: string };
  border: { light: string; dark: string };
  success: { light: string; dark: string };
  warning: { light: string; dark: string };
  error: { light: string; dark: string };
};

declare const themeConfig: {
  themeColors: typeof themeColors;
};

export default themeConfig;
