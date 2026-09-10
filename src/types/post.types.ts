import { BaseFilterParams } from './common.types';

export enum PrivacyLevel {
  Public = 0,
  Friends = 1,
  Private = 2,
}

export enum ReactionType {
  Like = 1,
  Love = 2,
  Haha = 3,
  Wow = 4,
  Sad = 5,
  Angry = 6,
}

export interface UserSummary {
  Id: string;
  UserName?: string;
  FullName?: string;
  AvatarUrl?: string;
  Bio?: string;
  IsVerified: boolean;
  IsFollowing: boolean;
  IsFriend: boolean;
}

export interface PostMedia {
  Id: number;
  FileId: number;
  FileUrl: string;
  ThumbnailUrl?: string;
  MediaType?: string;
  DisplayOrder: number;
}

export interface PostDetailVModel {
  Id: number;
  Content?: string;
  LocationName?: string;
  Latitude?: number;
  Longitude?: number;
  Privacy: PrivacyLevel;
  IsPinned: boolean;
  CreatedDate?: string;
  Author: UserSummary;
  Medias: PostMedia[];
  Hashtags: string[];
  IsExpense: boolean;
  Amount?: number;
  Currency?: string;
  FoodName?: string;
  ExpenseCategoryId?: number;
  ExpenseCategoryName?: string;
  ShowAmountToFriends: boolean;
  GroupId?: number;
  LikeCount: number;
  CommentCount: number;
  ShareCount: number;
  IsOwner: boolean;
  UserReaction?: ReactionType | null;
}

export interface PostCreateRequest {
  Content?: string;
  LocationName?: string;
  Latitude?: number;
  Longitude?: number;
  MediaFileIds: number[];
  Privacy?: PrivacyLevel;
  IsExpense?: boolean;
  Amount?: number;
  Currency?: string;
  FoodName?: string;
  ExpenseCategoryId?: number;
  ShowAmountToFriends?: boolean;
  GroupId?: number;
}

export interface PostFilterParams extends BaseFilterParams {
  AuthorId?: string;
  Hashtag?: string;
  IsExpenseOnly?: boolean;
  FromDate?: string;
  ToDate?: string;
}

