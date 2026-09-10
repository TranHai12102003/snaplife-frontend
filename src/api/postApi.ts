import { apiClient } from './client';
import {
  PostDetailVModel,
  PostCreateRequest,
  PostFilterParams,
  ReactionType,
} from '../types/post.types';
import { PaginationModel, ResponseResult } from '../types/common.types';

export const postApi = {
  getFeed: async (params?: PostFilterParams): Promise<PaginationModel<PostDetailVModel>> => {
    const response = await apiClient.get<PaginationModel<PostDetailVModel>>('/api/Post/Feed', {
      params,
    });
    return response.data;
  },

  getById: async (id: number): Promise<PostDetailVModel> => {
    const response = await apiClient.get<PostDetailVModel>(`/api/Post/${id}`);
    return response.data;
  },

  createPost: async (payload: PostCreateRequest): Promise<ResponseResult> => {
    const response = await apiClient.post<ResponseResult>('/api/Post/Create', payload);
    return response.data;
  },

  deletePost: async (id: number): Promise<ResponseResult> => {
    const response = await apiClient.delete<ResponseResult>(`/api/Post/Delete/${id}`);
    return response.data;
  },

  togglePin: async (id: number): Promise<ResponseResult> => {
    const response = await apiClient.post<ResponseResult>(`/api/Post/TogglePin/${id}`);
    return response.data;
  },

  getUserPosts: async (
    userId: string,
    params?: PostFilterParams
  ): Promise<PaginationModel<PostDetailVModel>> => {
    const response = await apiClient.get<PaginationModel<PostDetailVModel>>(
      `/api/Post/User/${userId}`,
      { params }
    );
    return response.data;
  },

  reactToPost: async (
    postId: number,
    reactionType: ReactionType
  ): Promise<ResponseResult> => {
    const response = await apiClient.post<ResponseResult>(`/api/Reaction/React/${postId}`, {
      Type: reactionType,
    });
    return response.data;
  },
};

