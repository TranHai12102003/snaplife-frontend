import { Platform } from 'react-native';

// In development:
// Android Emulator uses 10.0.2.2 to point to host machine localhost
// iOS Simulator and Web use localhost
// Physical devices can change this to your machine's LAN IP (e.g., 192.168.1.X)
const DEV_HOST = Platform.OS === 'android' ? 'http://10.0.2.2:5000' : 'http://localhost:5000';

export const API_CONFIG = {
  BASE_URL: DEV_HOST,
  API_PREFIX: '/api',
  TIMEOUT_MS: 15000,
  TOKEN_KEY: 'snaplife_jwt_token',
  USER_INFO_KEY: 'snaplife_user_info',
};

