import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.foodpronto.app',
  appName: 'Food Pronto',
  webDir: 'out',
  server: {
    url: 'https://www.foodpronto.com.br',
    cleartext: true,
    androidScheme: 'https',
    allowNavigation: [
      'www.foodpronto.com.br',
      'foodpronto.com.br',
      '*.foodpronto.com.br',
      '*.convex.cloud',
      '*.clerk.accounts.dev'
    ]
  }
};

export default config;
