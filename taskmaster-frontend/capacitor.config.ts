import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.taskmaster.app',
  appName: 'TaskMaster',
  webDir: 'dist/taskmaster-frontend/browser',
  server: {
    // This tells Capacitor to run the internal frontend as http://localhost
    // instead of https://localhost, allowing it to talk to your http:// backend.
    androidScheme: 'http', 
    cleartext: true
  },
  android: {
    // This is the Capacitor 6 way to allow insecure requests
    allowMixedContent: true
  }
};

export default config;
