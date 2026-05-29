import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.moodtracker.giraph',
  appName: '기래프',
  webDir: '../out',
  server: {
    androidScheme: 'https'
  }
};

export default config;
