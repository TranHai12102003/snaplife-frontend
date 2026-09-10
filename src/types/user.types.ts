import { BaseFilterParams } from './common.types';

export interface UserProfileVModel {
  Id: string;
  UserName?: string;
  Email?: string;
  FirstName?: string;
  LastName?: string;
  FullName?: string;
  AvatarUrl?: string;
  CoverImageUrl?: string;
  Sex?: boolean | null;
  Birthday?: string | null;
  Address?: string | null;
  Bio?: string | null;
  IsPrivate: boolean;
  IsVerified: boolean;
  FollowersCount: number;
  FollowingCount: number;
  FriendsCount: number;
  PostsCount: number;
  CreatedDate?: string;

  // Trạng thái quan hệ với người dùng đang đăng nhập
  IsFollowing: boolean;
  IsFollowedBy: boolean;
  IsFriend: boolean;
  HasSentFriendRequest: boolean;
  HasReceivedFriendRequest: boolean;
  IsBlocked: boolean;
}

export interface UpdateProfileRequest {
  FirstName?: string;
  LastName?: string;
  Bio?: string;
  Address?: string;
  Sex?: boolean | null;
  Birthday?: string | null;
  IsPrivate?: boolean;
}

export interface UserSummaryVModel {
  Id: string;
  UserName?: string;
  FullName?: string;
  AvatarUrl?: string;
  Bio?: string;
  IsVerified: boolean;
  IsFollowing: boolean;
  IsFriend: boolean;
}

export interface UserSearchFilterVModel extends BaseFilterParams {
  Keyword?: string;
}

