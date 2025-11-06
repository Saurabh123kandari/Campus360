# Typography System Guide

## Overview

The Padmai app uses a centralized typography system for consistent styling across all screens and roles (Admin, Teacher, Parent). This system ensures visual hierarchy, legibility, and brand consistency while maintaining high performance and accessibility.

## Typography Scale

The typography system defines a consistent scale of text styles:

### Headings
- **Display**: 32px, Bold (700) - For hero sections and main titles
- **H1**: 28px, Bold (700) - For major page headings
- **H2**: 24px, Semibold (600) - For section headings
- **H3**: 20px, Semibold (600) - For subsection titles
- **H4**: 18px, Semibold (600) - For card titles and smaller headings
- **H5**: 16px, Semibold (600) - For list item titles
- **H6**: 14px, Semibold (600) - For small headings

### Body Text
- **Body Large**: 16px, Regular (400) - For primary body text
- **Body**: 14px, Regular (400) - For standard text content
- **Body Small**: 12px, Regular (400) - For secondary text

### Labels & Captions
- **Label**: 12px, Medium (500) - For form labels and tags
- **Caption**: 10px, Medium (500) - For small labels and metadata

### Buttons
- **Button**: 16px, Semibold (600) - For primary button text
- **Button Small**: 14px, Semibold (600) - For secondary button text

## Usage

### Using Typography Utilities

Import the utility function in your component:

```typescript
import { createTypographyStyle } from '../utils/typography';
```

Then use it in your StyleSheet:

```typescript
const styles = StyleSheet.create({
  title: {
    ...createTypographyStyle('h2'),
    color: '#333',
    marginBottom: 16,
  },
  body: {
    ...createTypographyStyle('body'),
    color: '#666',
  },
});
```

### Using Typography Components

For reusable text components, import from the Typography component:

```typescript
import { Heading2, BodyText, Caption } from '../components/Typography';

// In your JSX:
<Heading2 color="#333">Section Title</Heading2>
<BodyText color="#666">This is body text</BodyText>
<Caption color="#999">Small label</Caption>
```

### Customizing Typography Styles

You can override specific properties:

```typescript
const styles = StyleSheet.create({
  customHeading: {
    ...createTypographyStyle('h3', { fontWeight: '700' }),
    color: '#2F6FED',
  },
});
```

## Font Configuration

### Current Font Setup

- **Primary Font**: Poppins (configured but using system fonts as fallback)
- **Fallback**: System fonts (San Francisco on iOS, Roboto on Android)

### Adding Custom Fonts

To add Poppins or another custom font:

1. **Add font files** to `src/assets/fonts/`:
   - `Poppins-Regular.ttf`
   - `Poppins-Medium.ttf`
   - `Poppins-SemiBold.ttf`
   - `Poppins-Bold.ttf`

2. **Update `react-native.config.js`** (already configured):
   ```javascript
   assets: ['./src/assets/fonts/'],
   ```

3. **Link fonts** (run after adding fonts):
   ```bash
   npx react-native-asset
   ```

4. **For iOS**, update `ios/Padmai/Info.plist`:
   ```xml
   <key>UIAppFonts</key>
   <array>
     <string>Poppins-Regular.ttf</string>
     <string>Poppins-Medium.ttf</string>
     <string>Poppins-SemiBold.ttf</string>
     <string>Poppins-Bold.ttf</string>
   </array>
   ```

5. **Update `src/utils/typography.ts`**:
   Change `getFontFamily()` to return the actual font name instead of system fonts.

## Swapping Font Families

To change the primary font family:

1. **Update `src/theme/typography.ts`**:
   ```typescript
   export const FONT_FAMILY_PRIMARY = 'Inter'; // or 'Roboto', etc.
   ```

2. **Add the new font files** following the steps above.

3. **Update font weights** if needed in `FONT_WEIGHTS` constant.

## Accessibility

### Font Scaling

All typography styles support system font scaling by default (`allowFontScaling: true`). This ensures text scales properly for users who have increased font sizes in their device settings.

### Minimum Sizes

- Minimum font size: **10px** (caption)
- Recommended minimum for body text: **12px** (bodySmall)
- All sizes meet WCAG AA contrast requirements

### Contrast Ratios

Ensure text colors meet accessibility standards:
- **Body text**: Minimum 4.5:1 contrast ratio
- **Large text** (18px+): Minimum 3:1 contrast ratio

## Best Practices

1. **Use semantic variants**: Choose typography variants based on content hierarchy, not just size.
2. **Maintain consistency**: Use the same variant for similar content across screens.
3. **Respect hierarchy**: Use larger, bolder variants for more important content.
4. **Test accessibility**: Verify contrast ratios and font scaling on different devices.
5. **Keep it simple**: Don't mix too many variants on a single screen.

## Examples

### Login Screen
```typescript
title: createTypographyStyle('display')      // Main app title
subtitle: createTypographyStyle('bodyLarge') // Subtitle text
label: createTypographyStyle('h5')           // Form labels
button: createTypographyStyle('button')      // Button text
```

### Dashboard Screen
```typescript
sectionTitle: createTypographyStyle('h3')    // Section headings
cardTitle: createTypographyStyle('h6')         // Card titles
body: createTypographyStyle('body')          // Card content
caption: createTypographyStyle('caption')     // Metadata
```

## Troubleshooting

### Fonts not loading
- Check font file paths in `react-native.config.js`
- Run `npx react-native-asset` to link fonts
- For iOS, verify `Info.plist` includes font names
- For Android, check fonts are in `android/app/src/main/assets/fonts/`

### Typography styles not applying
- Ensure you're using the spread operator: `...createTypographyStyle('h2')`
- Check that the variant name matches exactly (case-sensitive)
- Verify the import path is correct

### Performance issues
- Custom fonts add to bundle size - consider using system fonts for better performance
- Limit the number of font weights you include
- Use font subsetting if possible

## License Notes

- **Google Fonts** (Poppins, Inter, Roboto): Free for commercial use
- **System Fonts**: No license required
- For paid fonts, ensure license allows mobile app distribution and keep license files in repo

