import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_CONFIG } from '../constants/config';
import { Platform } from 'react-native';

export const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Attach JWT token if present
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      let token: string | null = null;
      if (Platform.OS === 'web') {
        token = localStorage.getItem(API_CONFIG.TOKEN_KEY);
      } else {
        token = await SecureStore.getItemAsync(API_CONFIG.TOKEN_KEY);
      }

      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn('Error reading token from SecureStore:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Global error handler
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Clear token when session expires
      try {
        if (Platform.OS === 'web') {
          localStorage.removeItem(API_CONFIG.TOKEN_KEY);
          localStorage.removeItem(API_CONFIG.USER_INFO_KEY);
        } else {
          await SecureStore.deleteItemAsync(API_CONFIG.TOKEN_KEY);
          await SecureStore.deleteItemAsync(API_CONFIG.USER_INFO_KEY);
        }
      } catch (e) {
        console.warn('Error clearing expired token:', e);
      }
    }
    return Promise.reject(error);
  }
);

