import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Wallet, TrendingUp, Calendar, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { colors, commonStyles, typography } from '../../theme';
import { expenseApi } from '../../api/expenseApi';
import { ExpenseSummaryVModel, FoodCalendarDayVModel } from '../../types/expense.types';
import { formatCurrency, formatDate, getFullMediaUrl } from '../../utils/formatters';

export const ExpenseDashboardScreen = () => {
  const [summary, setSummary] = useState<ExpenseSummaryVModel | null>(null);
  const [calendarDays, setCalendarDays] = useState<FoodCalendarDayVModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [currentDate, setCurrentDate] = useState(new Date());

  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const loadData = async (refresh = false) => {
    if (refresh) setIsRefreshing(true);
    try {
      // Calculate first & last day of month
      const fromDate = new Date(currentYear, currentMonth - 1, 1).toISOString();
      const toDate = new Date(currentYear, currentMonth, 0, 23, 59, 59).toISOString();

      const [summaryRes, calendarRes] = await Promise.all([
        expenseApi.getSummary(fromDate, toDate),
        expenseApi.getFoodCalendar(currentYear, currentMonth),
      ]);

      if (summaryRes.IsSuccess && summaryRes.Data) {
        setSummary(summaryRes.Data);
      }
      if (calendarRes.IsSuccess && calendarRes.Data) {
        setCalendarDays(calendarRes.Data);
      }
    } catch (error) {
      console.warn('Failed to load expense summary:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentMonth, currentYear]);

  const onRefresh = useCallback(() => {
    loadData(true);
  }, [currentMonth, currentYear]);

  const changeMonth = (direction: -1 | 1) => {
    setCurrentDate((prev) => {
      const newD = new Date(prev);
      newD.setMonth(prev.getMonth() + direction);
      return newD;
    });
  };

  return (
    <SafeAreaView style={commonStyles.screenContainer} edges={['top']}>
      {/* Header with Month Selector */}
      <View style={styles.header}>
        <Text style={[typography.h2, { marginBottom: 10 }]}>Chi tiêu thị giác</Text>

        <View style={[commonStyles.rowBetween, styles.monthSelector]}>
          <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.arrowBtn}>
            <ChevronLeft color={colors.text} size={20} />
          </TouchableOpacity>
          <Text style={styles.monthText}>
            Tháng {currentMonth}/{currentYear}
          </Text>
          <TouchableOpacity onPress={() => changeMonth(1)} style={styles.arrowBtn}>
            <ChevronRight color={colors.text} size={20} />
          </TouchableOpacity>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={commonStyles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        >
          {/* Main Stats Card */}
          <View style={[commonStyles.card, { marginBottom: 20 }]}>
            <View style={[commonStyles.row, { marginBottom: 8 }]}>
              <View style={styles.statIconBadge}>
                <Wallet color={colors.primary} size={24} />
              </View>
              <Text style={styles.statSubtitle}>Tổng chi tiêu tháng</Text>
            </View>

            <Text style={styles.totalAmount}>
              {formatCurrency(summary?.TotalAmount || 0)}
            </Text>

            <View style={styles.statsDivider} />

            <View style={styles.statsRow}>
              <View style={styles.statCol}>
                <Text style={styles.statColLabel}>Trung bình / ngày</Text>
                <Text style={styles.statColValue}>
                  {formatCurrency(summary?.DailyAverage || 0)}
                </Text>
              </View>
              <View style={styles.statCol}>
                <Text style={styles.statColLabel}>Số lần chi</Text>
                <Text style={styles.statColValue}>{summary?.TotalExpenses || 0} lần</Text>
              </View>
            </View>
          </View>

          {/* Category Breakdown */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Phân bổ theo danh mục</Text>

            {summary?.Categories && Array.isArray(summary.Categories) && summary.Categories.length > 0 ? (
              summary.Categories.map((cat, idx) => (
                <View key={idx} style={styles.categoryItem}>
                  <View style={styles.categoryHeader}>
                    <View style={styles.categoryTitleRow}>
                      <Text style={styles.categoryIcon}>{cat.Icon || '🏷️'}</Text>
                      <Text style={styles.categoryName}>{cat.CategoryName}</Text>
                    </View>
                    <View style={styles.categoryAmountRow}>
                      <Text style={styles.categoryAmount}>
                        {formatCurrency(cat.TotalAmount)}
                      </Text>
                      <Text style={styles.categoryPercent}>
                        {cat.Percentage.toFixed(1)}%
                      </Text>
                    </View>
                  </View>

                  {/* Progress Bar */}
                  <View style={styles.progressBarBg}>
                    <View
                      style={[
                        styles.progressBarFill,
                        {
                          width: `${Math.min(cat.Percentage, 100)}%`,
                          backgroundColor: cat.Color || colors.primary,
                        },
                      ]}
                    />
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>Chưa có phát sinh chi tiêu trong tháng này.</Text>
            )}
          </View>

          {/* Recent Visual Expense Items */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Lịch sử món ăn & Snap chi tiêu</Text>

            {summary?.RecentExpenses && Array.isArray(summary.RecentExpenses) && summary.RecentExpenses.length > 0 ? (
              summary.RecentExpenses.map((item, idx) => {
                const thumb = item.ThumbnailUrl ? getFullMediaUrl(item.ThumbnailUrl) : null;
                return (
                  <View key={idx} style={styles.expenseItemRow}>
                    {thumb ? (
                      <Image source={{ uri: thumb }} style={styles.itemThumb} />
                    ) : (
                      <View style={[styles.itemThumb, styles.itemThumbPlaceholder]}>
                        <Text style={{ fontSize: 20 }}>{item.CategoryIcon || '🍽️'}</Text>
                      </View>
                    )}

                    <View style={styles.itemInfo}>
                      <Text style={styles.itemTitle} numberOfLines={1}>
                        {item.FoodName || item.Content || item.CategoryName || 'Chi tiêu'}
                      </Text>
                      <Text style={styles.itemDate}>
                        {new Date(item.CreatedDate).toLocaleDateString('vi-VN')} •{' '}
                        {item.CategoryName || 'Khác'}
                      </Text>
                    </View>

                    <Text style={styles.itemAmount}>
                      -{formatCurrency(item.Amount, item.Currency)}
                    </Text>
                  </View>
                );
              })
            ) : (
              <Text style={styles.emptyText}>Chưa có ảnh món ăn nào được ghi nhận.</Text>
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    width: '100%',
    maxWidth: 540,
    alignSelf: 'center',
  },
  monthSelector: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  arrowBtn: {
    padding: 4,
  },
  monthText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 200, 55, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  statSubtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  totalAmount: {
    fontSize: 34,
    fontWeight: '800',
    color: colors.primary,
    marginVertical: 4,
  },
  statsDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCol: {
    flex: 1,
  },
  statColLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: 4,
  },
  statColValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  categoryItem: {
    marginBottom: 14,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  categoryName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  categoryAmountRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryAmount: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
    marginRight: 6,
  },
  categoryPercent: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: colors.surfaceLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  expenseItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  itemThumb: {
    width: 48,
    height: 48,
    borderRadius: 12,
    marginRight: 12,
  },
  itemThumbPlaceholder: {
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemDate: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  itemAmount: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 16,
  },
});

