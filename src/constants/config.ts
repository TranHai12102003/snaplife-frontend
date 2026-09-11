import { Platform } from 'react-native';
import Constants from 'expo-constants';

const getDevHost = (): string => {
  // 1. If running on Web browser (Chrome/Edge):
  if (Platform.OS === 'web') {
    return 'http://localhost:5000';
  }

  // 2. If running on Phone or Emulator via Expo Go:
  // Constants.expoConfig.hostUri will automatically contain your PC's Wi-Fi IP (e.g., 192.168.1.68:8081)
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    return `http://${ip}:5000`;
  }

  // 3. Fallbacks:
  // Android Emulator: 10.0.2.2
  // Physical Device fallback: Current Wi-Fi IP
  return Platform.OS === 'android' ? 'http://10.0.2.2:5000' : 'http://192.168.1.68:5000';
};

export const API_CONFIG = {
  BASE_URL: getDevHost(),
  API_PREFIX: '/api',
  TIMEOUT_MS: 15000,
  TOKEN_KEY: 'snaplife_jwt_token',
  USER_INFO_KEY: 'snaplife_user_info',
};
