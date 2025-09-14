import { ExpoConfig } from '@expo/config-types';

export default (): ExpoConfig => ({
  name: 'GLOUP',
  slug: 'gloup',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#0F1B2E'
  },
  updates: {
    fallbackToCacheTimeout: 0,
    url: 'https://u.expo.dev/YOUR_EAS_PROJECT_ID'
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.gloup.app'
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#0F1B2E'
    },
    package: 'com.gloup.app'
  },
  web: {
    favicon: './assets/favicon.png'
  },
  plugins: [
    'expo-router',
    'expo-av',
    'expo-image-picker',
    'expo-haptics',
    'expo-linear-gradient'
  ],
  extra: {
    eas: {
      projectId: 'YOUR_EAS_PROJECT_ID'
    }
  }
});