import { BaseFilterParams } from './common.types';

export interface ExpenseCategoryVModel {
  Id: number;
  Name: string;
  Icon?: string;
  Color?: string;
  IsDefault: boolean;
  CanDelete: boolean;
  DisplayOrder: number;
}

export interface ExpenseCategoryCreateRequest {
  Name: string;
  Icon?: string;
  Color?: string;
  DisplayOrder?: number;
}

export interface ExpenseCategoryBreakdownVModel {
  CategoryId?: number | null;
  CategoryName: string;
  Icon?: string;
  Color?: string;
  TotalAmount: number;
  Percentage: number;
  ExpenseCount: number;
}

export interface ExpenseItemVModel {
  PostId: number;
  Content?: string;
  FoodName?: string;
  Amount: number;
  Currency: string;
  CategoryId?: number | null;
  CategoryName?: string;
  CategoryIcon?: string;
  CategoryColor?: string;
  ThumbnailUrl?: string;
  LocationName?: string;
  CreatedDate: string;
}

export interface FoodCalendarDayVModel {
  Date: string;
  TotalAmount: number;
  Currency: string;
  Count: number;
  ThumbnailUrl?: string;
  FoodNames: string[];
}

export interface ExpenseSummaryVModel {
  Period: string;
  TotalAmount: number;
  Currency: string;
  TotalExpenses: number;
  DailyAverage: number;
  Categories: ExpenseCategoryBreakdownVModel[];
  RecentExpenses: ExpenseItemVModel[];
}

export interface ExpenseFilterParams extends BaseFilterParams {
  CategoryId?: number;
  FromDate?: string;
  ToDate?: string;
  MinAmount?: number;
  MaxAmount?: number;
}

