import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.ade06b52b0914f31abbee61bf97ff696',
  appName: 'ToothyQuest',
  webDir: 'dist',
  server: {
    // For development: enables hot-reload from sandbox
    // Comment out for production builds
    url: 'https://ade06b52-b091-4f31-abbe-e61bf97ff696.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
    scheme: 'ToothyQuest',
    backgroundColor: '#FEF3E2'
  },
  android: {
    backgroundColor: '#FEF3E2'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#FEF3E2',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#2AAAA5'
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true
    }
  }
};

export default config;
