import { Platform } from 'react-native';

// In development:
// - Web preview (Chrome/Edge): http://localhost:5000
// - Android Emulator: http://10.0.2.2:5000
// - Physical device (Expo Go on phone): http://10.20.206.114:5000 (Your local PC IP)
const DEV_HOST = Platform.OS === 'android' ? 'http://10.0.2.2:5000' : 'http://localhost:5000';
// Bật dòng bên dưới nếu bạn test trực tiếp bằng điện thoại thật qua Expo Go:
// const DEV_HOST = 'http://10.20.206.114:5000';

export const API_CONFIG = {
  BASE_URL: DEV_HOST,
  API_PREFIX: '/api',
  TIMEOUT_MS: 15000,
  TOKEN_KEY: 'snaplife_jwt_token',
  USER_INFO_KEY: 'snaplife_user_info',
};

