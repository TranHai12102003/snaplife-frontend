import { apiClient } from './client';
import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse, MeVModel } from '../types/auth.types';
import { ResponseResult } from '../types/common.types';

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/api/Auth/Login', data);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    const response = await apiClient.post<RegisterResponse>('/api/Auth/Register', data);
    return response.data;
  },

  getMe: async (): Promise<ResponseResult<MeVModel>> => {
    const response = await apiClient.get<ResponseResult<MeVModel>>('/api/Auth/Me');
    return response.data;
  },

  updateAvatar: async (fileId: number): Promise<ResponseResult> => {
    const response = await apiClient.put<ResponseResult>('/api/Auth/UpdateAvatar', { FileId: fileId });
    return response.data;
  },

  updateCover: async (fileId: number): Promise<ResponseResult> => {
    const response = await apiClient.put<ResponseResult>('/api/Auth/UpdateCover', { FileId: fileId });
    return response.data;
  },
};

