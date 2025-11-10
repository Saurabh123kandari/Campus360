# Fonts Directory

This directory is for custom font files (e.g., Poppins, Inter, Roboto).

## Adding Custom Fonts

### Step 1: Download Font Files
Download the font files you need (e.g., from Google Fonts):
- `Poppins-Regular.ttf`
- `Poppins-Medium.ttf`
- `Poppins-SemiBold.ttf`
- `Poppins-Bold.ttf`

### Step 2: Place Font Files
Copy the `.ttf` files into this directory.

### Step 3: Link Fonts
Run the following command to link fonts:
```bash
npx react-native-asset
```

### Step 4: iOS Configuration
Update `ios/Padmai/Info.plist` to include font names:
```xml
<key>UIAppFonts</key>
<array>
  <string>Poppins-Regular.ttf</string>
  <string>Poppins-Medium.ttf</string>
  <string>Poppins-SemiBold.ttf</string>
  <string>Poppins-Bold.ttf</string>
</array>
```

### Step 5: Update Typography Config
Update `src/utils/typography.ts` in the `getFontFamily()` function to return the actual font name instead of system fonts.

## Font Licensing

- **Google Fonts** (Poppins, Inter, Roboto): Free for commercial use
- For paid fonts, ensure license allows mobile app distribution
- Keep license files in this directory if required

## Current Status

Currently using system fonts (San Francisco on iOS, Roboto on Android) as fallback. Custom fonts can be added following the steps above.




