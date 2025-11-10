/**
 * Typography System Configuration
 * 
 * Centralized typography definitions for consistent styling across the app.
 * Easy to swap fonts or adjust scale by modifying constants below.
 */

// Font Family Configuration
// To swap fonts, change these constants
export const FONT_FAMILY_PRIMARY = 'Poppins'; // Primary font family
export const FONT_FAMILY_FALLBACK = {
  ios: 'System', // San Francisco on iOS
  android: 'Roboto', // Roboto on Android
};

// Font Weights
export const FONT_WEIGHTS = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

// Typography Scale
export const TYPOGRAPHY_SCALE = {
  // Display/Headings
  display: {
    fontSize: 32,
    fontWeight: FONT_WEIGHTS.bold,
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  h1: {
    fontSize: 28,
    fontWeight: FONT_WEIGHTS.bold,
    lineHeight: 36,
    letterSpacing: -0.3,
  },
  h2: {
    fontSize: 24,
    fontWeight: FONT_WEIGHTS.semibold,
    lineHeight: 32,
    letterSpacing: -0.2,
  },
  h3: {
    fontSize: 20,
    fontWeight: FONT_WEIGHTS.semibold,
    lineHeight: 28,
    letterSpacing: 0,
  },
  h4: {
    fontSize: 18,
    fontWeight: FONT_WEIGHTS.semibold,
    lineHeight: 24,
    letterSpacing: 0,
  },
  h5: {
    fontSize: 16,
    fontWeight: FONT_WEIGHTS.semibold,
    lineHeight: 22,
    letterSpacing: 0.1,
  },
  h6: {
    fontSize: 14,
    fontWeight: FONT_WEIGHTS.semibold,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  // Body Text
  bodyLarge: {
    fontSize: 16,
    fontWeight: FONT_WEIGHTS.regular,
    lineHeight: 24,
    letterSpacing: 0,
  },
  body: {
    fontSize: 14,
    fontWeight: FONT_WEIGHTS.regular,
    lineHeight: 20,
    letterSpacing: 0,
  },
  bodySmall: {
    fontSize: 12,
    fontWeight: FONT_WEIGHTS.regular,
    lineHeight: 18,
    letterSpacing: 0.1,
  },
  // Captions & Labels
  caption: {
    fontSize: 10,
    fontWeight: FONT_WEIGHTS.medium,
    lineHeight: 14,
    letterSpacing: 0.2,
  },
  label: {
    fontSize: 12,
    fontWeight: FONT_WEIGHTS.medium,
    lineHeight: 16,
    letterSpacing: 0.1,
  },
  // Button Text
  button: {
    fontSize: 16,
    fontWeight: FONT_WEIGHTS.semibold,
    lineHeight: 20,
    letterSpacing: 0.2,
  },
  buttonSmall: {
    fontSize: 14,
    fontWeight: FONT_WEIGHTS.semibold,
    lineHeight: 18,
    letterSpacing: 0.1,
  },
};

// Typography Style Helper
// Returns style object with font family and typography scale
export const getTypographyStyle = (
  variant: keyof typeof TYPOGRAPHY_SCALE,
  options?: {
    fontFamily?: string;
    color?: string;
    allowFontScaling?: boolean;
  }
) => {
  const baseStyle = TYPOGRAPHY_SCALE[variant];
  const fontFamily = options?.fontFamily || FONT_FAMILY_PRIMARY;

  return {
    fontFamily,
    fontSize: baseStyle.fontSize,
    fontWeight: baseStyle.fontWeight,
    lineHeight: baseStyle.lineHeight,
    letterSpacing: baseStyle.letterSpacing,
    color: options?.color,
    // Enable system font scaling for accessibility
    allowFontScaling: options?.allowFontScaling !== false,
  };
};

// Typography Configuration Interface
export interface TypographyConfig {
  fontFamily: string;
  scale: typeof TYPOGRAPHY_SCALE;
  weights: typeof FONT_WEIGHTS;
}

// Export default typography config
export const typographyConfig: TypographyConfig = {
  fontFamily: FONT_FAMILY_PRIMARY,
  scale: TYPOGRAPHY_SCALE,
  weights: FONT_WEIGHTS,
};




