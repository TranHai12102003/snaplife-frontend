import { apiClient } from './client';
import {
  ExpenseCategoryVModel,
  ExpenseCategoryCreateRequest,
  ExpenseSummaryVModel,
  ExpenseFilterParams,
  ExpenseItemVModel,
  FoodCalendarDayVModel,
} from '../types/expense.types';
import { PaginationModel, ResponseResult } from '../types/common.types';

export const expenseApi = {
  getCategories: async (): Promise<ExpenseCategoryVModel[]> => {
    const response = await apiClient.get<ResponseResult<ExpenseCategoryVModel[]>>('/api/Expense/Categories');
    const data = response.data;
    if (Array.isArray(data)) {
      return data;
    }
    return data?.Data || [];
  },

  createCategory: async (data: ExpenseCategoryCreateRequest): Promise<ResponseResult> => {
    const response = await apiClient.post<ResponseResult>('/api/Expense/Category', data);
    return response.data;
  },

  deleteCategory: async (id: number): Promise<ResponseResult> => {
    const response = await apiClient.delete<ResponseResult>(`/api/Expense/Category/${id}`);
    return response.data;
  },

  getHistory: async (
    params?: ExpenseFilterParams
  ): Promise<PaginationModel<ExpenseItemVModel>> => {
    const response = await apiClient.get<PaginationModel<ExpenseItemVModel>>(
      '/api/Expense/History',
      { params }
    );
    return response.data;
  },

  getSummary: async (
    fromDate?: string,
    toDate?: string
  ): Promise<ResponseResult<ExpenseSummaryVModel>> => {
    const response = await apiClient.get<ResponseResult<ExpenseSummaryVModel>>(
      '/api/Expense/Summary',
      {
        params: { fromDate, toDate },
      }
    );
    return response.data;
  },

  getFoodCalendar: async (
    year?: number,
    month?: number
  ): Promise<ResponseResult<FoodCalendarDayVModel[]>> => {
    const response = await apiClient.get<ResponseResult<FoodCalendarDayVModel[]>>(
      '/api/Expense/Calendar',
      {
        params: { year, month },
      }
    );
    return response.data;
  },
};

