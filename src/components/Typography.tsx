/**
 * Typography Components
 * 
 * Reusable Text components with consistent typography styling.
 * Use these components instead of plain Text for better consistency.
 */

import React from 'react';
import { Text, TextProps, TextStyle, Platform } from 'react-native';
import { createTypographyStyle, getFontFamily } from '../utils/typography';
import { TYPOGRAPHY_SCALE, FONT_FAMILY_PRIMARY } from '../theme/typography';

interface TypographyProps extends TextProps {
  variant?: keyof typeof TYPOGRAPHY_SCALE;
  color?: string;
  allowFontScaling?: boolean;
  style?: TextStyle | TextStyle[];
}

/**
 * Base Typography component
 */
export const Typography: React.FC<TypographyProps> = ({
  variant = 'body',
  color,
  allowFontScaling = true,
  style,
  children,
  ...props
}) => {
  const typographyStyle = createTypographyStyle(variant, {
    color,
    allowFontScaling,
  });

  return (
    <Text
      style={[typographyStyle, style]}
      allowFontScaling={allowFontScaling}
      {...props}
    >
      {children}
    </Text>
  );
};

/**
 * Predefined Typography Components
 */
export const Display: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="display" {...props} />
);

export const Heading1: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="h1" {...props} />
);

export const Heading2: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="h2" {...props} />
);

export const Heading3: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="h3" {...props} />
);

export const Heading4: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="h4" {...props} />
);

export const Heading5: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="h5" {...props} />
);

export const Heading6: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="h6" {...props} />
);

export const BodyText: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="body" {...props} />
);

export const BodyLarge: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="bodyLarge" {...props} />
);

export const BodySmall: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="bodySmall" {...props} />
);

export const Caption: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="caption" {...props} />
);

export const Label: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="label" {...props} />
);

export default Typography;


