import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { MeVModel } from '../types/auth.types';
import { API_CONFIG } from '../constants/config';
import { authApi } from '../api/authApi';

interface AuthState {
  token: string | null;
  user: MeVModel | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  initAuth: () => Promise<void>;
  setAuth: (token: string, user?: MeVModel) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const saveStorageItem = async (key: string, value: string) => {
  if (Platform.OS === 'web') {
    localStorage.setItem(key, value);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
};

const getStorageItem = async (key: string): Promise<string | null> => {
  if (Platform.OS === 'web') {
    return localStorage.getItem(key);
  }
  return await SecureStore.getItemAsync(key);
};

const removeStorageItem = async (key: string) => {
  if (Platform.OS === 'web') {
    localStorage.removeItem(key);
  } else {
    await SecureStore.deleteItemAsync(key);
  }
};

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  isLoading: true,
  isAuthenticated: false,

  initAuth: async () => {
    try {
      const storedToken = await getStorageItem(API_CONFIG.TOKEN_KEY);
      const storedUserJson = await getStorageItem(API_CONFIG.USER_INFO_KEY);

      if (storedToken) {
        let parsedUser: MeVModel | null = null;
        if (storedUserJson) {
          try {
            parsedUser = JSON.parse(storedUserJson);
          } catch (e) {
            console.warn('Failed to parse cached user json');
          }
        }

        set({
          token: storedToken,
          user: parsedUser,
          isAuthenticated: true,
          isLoading: false,
        });

        // Silently fetch fresh profile in background
        get().refreshProfile();
      } else {
        set({ token: null, user: null, isAuthenticated: false, isLoading: false });
      }
    } catch (error) {
      console.error('Failed to initialize auth state:', error);
      set({ token: null, user: null, isAuthenticated: false, isLoading: false });
    }
  },

  setAuth: async (token: string, user?: MeVModel) => {
    await saveStorageItem(API_CONFIG.TOKEN_KEY, token);
    if (user) {
      await saveStorageItem(API_CONFIG.USER_INFO_KEY, JSON.stringify(user));
    }
    set({
      token,
      user: user || null,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  logout: async () => {
    await removeStorageItem(API_CONFIG.TOKEN_KEY);
    await removeStorageItem(API_CONFIG.USER_INFO_KEY);
    set({
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  refreshProfile: async () => {
    try {
      const res = await authApi.getMe();
      if (res.IsSuccess && res.Data) {
        await saveStorageItem(API_CONFIG.USER_INFO_KEY, JSON.stringify(res.Data));
        set({ user: res.Data });
      }
    } catch (error) {
      console.warn('Failed to refresh profile:', error);
    }
  },
}));

