export interface MeVModel {
  Id: string;
  UserName?: string;
  Email?: string;
  FirstName?: string;
  LastName?: string;
  FullName?: string;
  AvatarUrl?: string;
  Sex?: boolean | null;
  Birthday?: string | null;
  Address?: string | null;
  Bio?: string | null;
  IsActive?: boolean;
  CreatedDate?: string;
  Roles?: string[];
}

export interface LoginRequest {
  Email: string;
  Password: string;
}

export interface RegisterRequest {
  Email: string;
  Password: string;
  ConfirmPassword: string;
  UserName?: string;
  FirstName?: string;
  LastName?: string;
}

export interface LoginResponse {
  Token?: string;
  Message?: string;
  IsSuccess: boolean;
  User?: MeVModel;
}

export interface RegisterResponse {
  Message?: string;
  IsSuccess: boolean;
  User?: MeVModel;
}

