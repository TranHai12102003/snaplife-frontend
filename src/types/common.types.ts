export interface ResponseResult<T = any> {
  IsSuccess: boolean;
  Message?: string | null;
  Data?: T;
}

export interface PaginationModel<T> {
  TotalRecords: number;
  Records: T[];
}

export interface BaseFilterParams {
  PageNumber?: number;
  PageSize?: number;
  Search?: string;
  SortBy?: string;
  IsAscending?: boolean;
}

