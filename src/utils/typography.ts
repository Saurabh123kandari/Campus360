/**
 * Typography Utility Functions
 * 
 * Helper functions to apply typography styles consistently across components.
 */

import { Platform, TextStyle } from 'react-native';
import { TYPOGRAPHY_SCALE, FONT_FAMILY_PRIMARY, FONT_FAMILY_FALLBACK, getTypographyStyle } from '../theme/typography';

/**
 * Get font family with platform-specific fallback
 */
export const getFontFamily = (fontName: string = FONT_FAMILY_PRIMARY): string => {
  // For now, use system fonts. When custom fonts are added, this will use the fontName
  // Custom fonts need to be properly linked in react-native.config.js and native projects
  if (fontName === FONT_FAMILY_PRIMARY) {
    // Return system font for now - will be replaced when Poppins is properly installed
    return Platform.select({
      ios: FONT_FAMILY_FALLBACK.ios,
      android: FONT_FAMILY_FALLBACK.android,
      default: 'System',
    }) || 'System';
  }
  return fontName;
};

/**
 * Create a typography style object
 */
export const createTypographyStyle = (
  variant: keyof typeof TYPOGRAPHY_SCALE,
  overrides?: Partial<TextStyle>
): TextStyle => {
  const baseStyle = getTypographyStyle(variant, {
    fontFamily: getFontFamily(),
    allowFontScaling: true,
  });

  return {
    ...baseStyle,
    ...overrides,
  };
};

/**
 * Typography style presets for common use cases
 */
export const typographyStyles = {
  // Headings
  display: createTypographyStyle('display'),
  h1: createTypographyStyle('h1'),
  h2: createTypographyStyle('h2'),
  h3: createTypographyStyle('h3'),
  h4: createTypographyStyle('h4'),
  h5: createTypographyStyle('h5'),
  h6: createTypographyStyle('h6'),
  
  // Body
  bodyLarge: createTypographyStyle('bodyLarge'),
  body: createTypographyStyle('body'),
  bodySmall: createTypographyStyle('bodySmall'),
  
  // Labels & Captions
  caption: createTypographyStyle('caption'),
  label: createTypographyStyle('label'),
  
  // Buttons
  button: createTypographyStyle('button'),
  buttonSmall: createTypographyStyle('buttonSmall'),
};

/**
 * Helper to combine typography style with custom styles
 */
export const combineTypographyStyle = (
  variant: keyof typeof TYPOGRAPHY_SCALE,
  customStyle?: TextStyle
): TextStyle => {
  return {
    ...createTypographyStyle(variant),
    ...customStyle,
  };
};


