import { API_CONFIG } from '../constants/config';

/**
 * Format currency to Vietnamese standard or specified currency
 * e.g., 50000 -> 50.000 ₫
 */
export const formatCurrency = (amount?: number | null, currency: string = 'VND'): string => {
  if (amount === undefined || amount === null) return '0 ₫';
  
  if (currency === 'VND') {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

/**
 * Format full media URL if backend returns relative path (e.g. /uploads/images/abc.jpg)
 */
export const getFullMediaUrl = (url?: string | null): string => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  const baseUrl = API_CONFIG.BASE_URL.replace(/\/$/, '');
  const relativePath = url.startsWith('/') ? url : `/${url}`;
  return `${baseUrl}${relativePath}`;
};

/**
 * Format relative time for posts/comments (e.g., "5 phút trước", "2 giờ trước")
 */
export const formatRelativeTime = (dateStr?: string | null): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Vừa xong';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} giờ trước`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} ngày trước`;

  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

/**
 * Format Date object or ISO string to dd/MM/yyyy
 */
export const formatDate = (dateInput?: string | Date | null): string => {
  if (!dateInput) return '';
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

