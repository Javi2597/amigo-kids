import type { CapacitorConfig } from '@capacitor/cli';

const APP_URL = process.env.APP_URL?.trim() || '';

const config: CapacitorConfig = {
  appId: 'io.tinoto.app',
  appName: 'Tino el Zorrito',
  webDir: 'web',
  server: APP_URL ? { url: APP_URL, cleartext: false } : undefined,
  android: {
    allowMixedContent: false,
  },
  ios: {
    contentInset: 'automatic',
  },
};

export default config;