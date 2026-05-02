import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.foodpronto.app',
  appName: 'Food Pronto',
  webDir: 'out',
  server: {
    url: 'https://www.foodpronto.com.br',
    cleartext: true,
    allowNavigation: ['*']
  }
};

export default config;
