import { create } from 'zustand';
import { ExpenseCategoryVModel } from '../types/expense.types';
import { expenseApi } from '../api/expenseApi';

interface ExpenseState {
  categories: ExpenseCategoryVModel[];
  selectedCategoryId: number | null;
  selectedMonth: number;
  selectedYear: number;
  isLoadingCategories: boolean;

  fetchCategories: () => Promise<void>;
  setSelectedCategory: (id: number | null) => void;
  setSelectedMonthYear: (month: number, year: number) => void;
}

export const useExpenseStore = create<ExpenseState>((set) => ({
  categories: [],
  selectedCategoryId: null,
  selectedMonth: new Date().getMonth() + 1,
  selectedYear: new Date().getFullYear(),
  isLoadingCategories: false,

  fetchCategories: async () => {
    set({ isLoadingCategories: true });
    try {
      const data = await expenseApi.getCategories();
      set({ categories: data, isLoadingCategories: false });
    } catch (error) {
      console.warn('Failed to fetch expense categories:', error);
      set({ isLoadingCategories: false });
    }
  },

  setSelectedCategory: (id: number | null) => {
    set({ selectedCategoryId: id });
  },

  setSelectedMonthYear: (month: number, year: number) => {
    set({ selectedMonth: month, selectedYear: year });
  },
}));

