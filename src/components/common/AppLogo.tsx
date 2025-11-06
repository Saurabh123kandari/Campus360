import React from 'react';
import { View, Text, Image, StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface AppLogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  textStyle?: TextStyle;
  containerStyle?: ViewStyle;
}

const AppLogo: React.FC<AppLogoProps> = ({
  size = 'medium',
  showText = true,
  textStyle,
  containerStyle,
}) => {
  const logoSize = size === 'small' ? 32 : size === 'large' ? 64 : 44;
  const borderRadius = logoSize / 2;
  const fontSize = size === 'small' ? 16 : size === 'large' ? 24 : 18;
  const lineHeight = size === 'small' ? 20 : size === 'large' ? 28 : 22;
  const gap = size === 'small' ? 8 : size === 'large' ? 16 : 12;

  return (
    <View
      style={[
        styles.logoContainer,
        { gap },
        containerStyle,
      ]}
      accessibilityLabel="Kilbil High School logo"
    >
      <Image
        source={require('../../assets/images/kilbil-logo.png')}
        style={[
          styles.logo,
          {
            width: logoSize,
            height: logoSize,
            borderRadius,
          },
        ]}
        resizeMode="contain"
        accessibilityLabel="Kilbil High School logo"
      />
      {showText && (
        <Text
          style={[
            styles.logoText,
            {
              fontSize,
              lineHeight,
            },
            textStyle,
          ]}
        >
          KILBIL HIGH SCHOOL
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  logo: {
    overflow: 'hidden',
  },
  logoText: {
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.3,
    flexShrink: 1,
  },
});

export default AppLogo;

