import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import {
  LogOut,
  Sparkles,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react-native';
import { colors } from '../../constants/colors';
import { useAuthStore } from '../../stores/useAuthStore';
import { postApi } from '../../api/postApi';
import { PostDetailVModel } from '../../types/post.types';
import { getFullMediaUrl } from '../../utils/formatters';

const { width } = Dimensions.get('window');
// Padding ngoài scrollContent (16*2=32) + padding trong gridSection (16*2=32) + 2 khoảng gap giữa 3 ảnh (8*2=16) = 80px
const HORIZONTAL_PADDING = 32 + 32;
const GAP_SIZE = 8;
const GRID_ITEM_SIZE = Math.floor((width - HORIZONTAL_PADDING - GAP_SIZE * 2) / 3);
const PAGE_SIZE = 9; // Bố cục 3x3: tối đa 9 tấm ảnh / trang

export const ProfileScreen = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const refreshProfile = useAuthStore((state) => state.refreshProfile);

  const [myPosts, setMyPosts] = useState<PostDetailVModel[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);

  const totalPages = Math.ceil(totalRecords / PAGE_SIZE) || 1;

  useEffect(() => {
    refreshProfile();
    if (user?.Id) {
      loadMyPosts(user.Id, 1);
    }
  }, [user?.Id]);

  const loadMyPosts = async (userId: string, page: number = 1) => {
    setIsLoadingPosts(true);
    try {
      const res = await postApi.getUserPosts(userId, {
        PageNumber: page,
        PageSize: PAGE_SIZE,
      });
      setMyPosts(res.Records || []);
      setTotalRecords(res.TotalRecords || 0);
      setCurrentPage(page);
    } catch (e) {
      console.warn('Failed to load user posts:', e);
    } finally {
      setIsLoadingPosts(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất khỏi SnapLife?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Đăng xuất', style: 'destructive', onPress: () => logout() },
    ]);
  };

  const avatarUrl = user?.AvatarUrl ? getFullMediaUrl(user.AvatarUrl) : null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top Bar */}
      <View style={styles.header}>
        <Text style={styles.headerUsername}>@{user?.UserName || 'snapuser'}</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <LogOut color={colors.error} size={22} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Card */}
        <View style={styles.profileSection}>
          <View style={styles.avatarWrapper}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarText}>
                  {user?.FullName?.[0] || user?.UserName?.[0] || 'S'}
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.fullName}>{user?.FullName || user?.UserName || 'Người dùng Snap'}</Text>
          <Text style={styles.emailText}>{user?.Email}</Text>

          {user?.Bio ? <Text style={styles.bioText}>{user.Bio}</Text> : null}

          {/* Counts */}
          <View style={styles.statsCard}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{totalRecords}</Text>
              <Text style={styles.statLabel}>Snaps</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>Bạn thân</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>0 ₫</Text>
              <Text style={styles.statLabel}>Hôm nay</Text>
            </View>
          </View>
        </View>

        {/* My Snaps Gallery Grid 3x3 */}
        <View style={styles.gridSection}>
          <View style={styles.gridHeader}>
            <View style={styles.gridTitleWrapper}>
              <ImageIcon color={colors.primary} size={18} />
              <Text style={styles.gridTitle}>Bộ sưu tập ảnh ({totalRecords})</Text>
            </View>
            {totalPages > 1 && (
              <View style={styles.pageBadge}>
                <Text style={styles.pageBadgeText}>
                  Trang {currentPage}/{totalPages}
                </Text>
              </View>
            )}
          </View>

          {isLoadingPosts ? (
            <View style={styles.loadingWrapper}>
              <ActivityIndicator color={colors.primary} size="small" />
            </View>
          ) : myPosts.length > 0 ? (
            <>
              <View style={styles.grid}>
                {myPosts.map((item) => {
                  const img = item.Medias?.[0]?.FileUrl
                    ? getFullMediaUrl(item.Medias[0].FileUrl)
                    : null;
                  return (
                    <View key={item.Id} style={styles.gridItem}>
                      {img ? (
                        <Image source={{ uri: img }} style={styles.gridImage} />
                      ) : (
                        <View style={[styles.gridImage, styles.gridPlaceholder]}>
                          <Sparkles color={colors.textSecondary} size={20} />
                        </View>
                      )}
                      {item.IsExpense && (
                        <View style={styles.gridExpenseBadge}>
                          <Text style={styles.gridExpenseText}>💰</Text>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <View style={styles.paginationRow}>
                  <TouchableOpacity
                    style={[styles.pageBtn, currentPage <= 1 && styles.pageBtnDisabled]}
                    disabled={currentPage <= 1 || isLoadingPosts}
                    onPress={() => user?.Id && loadMyPosts(user.Id, currentPage - 1)}
                  >
                    <ChevronLeft
                      color={currentPage <= 1 ? colors.textMuted : colors.text}
                      size={18}
                    />
                    <Text
                      style={[
                        styles.pageBtnText,
                        currentPage <= 1 && styles.pageBtnTextDisabled,
                      ]}
                    >
                      Trước
                    </Text>
                  </TouchableOpacity>

                  <Text style={styles.paginationIndicator}>
                    {currentPage} / {totalPages}
                  </Text>

                  <TouchableOpacity
                    style={[
                      styles.pageBtn,
                      currentPage >= totalPages && styles.pageBtnDisabled,
                    ]}
                    disabled={currentPage >= totalPages || isLoadingPosts}
                    onPress={() => user?.Id && loadMyPosts(user.Id, currentPage + 1)}
                  >
                    <Text
                      style={[
                        styles.pageBtnText,
                        currentPage >= totalPages && styles.pageBtnTextDisabled,
                      ]}
                    >
                      Sau
                    </Text>
                    <ChevronRight
                      color={currentPage >= totalPages ? colors.textMuted : colors.text}
                      size={18}
                    />
                  </TouchableOpacity>
                </View>
              )}
            </>
          ) : (
            <View style={styles.emptyGrid}>
              <Text style={styles.emptyGridText}>Bạn chưa đăng khoảnh khắc nào.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerUsername: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  logoutBtn: {
    padding: 6,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarWrapper: {
    marginBottom: 14,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  avatarPlaceholder: {
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.primary,
  },
  fullName: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  emailText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  bioText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 24,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 20,
    width: '100%',
    marginTop: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
    height: '100%',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  gridSection: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  gridHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  gridTitleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gridTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 8,
  },
  pageBadge: {
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pageBadgeText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  loadingWrapper: {
    paddingVertical: 36,
    alignItems: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP_SIZE,
  },
  gridItem: {
    width: GRID_ITEM_SIZE,
    height: GRID_ITEM_SIZE,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: colors.surfaceLight,
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  gridPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridExpenseBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 8,
    padding: 3,
  },
  gridExpenseText: {
    fontSize: 12,
  },
  emptyGrid: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyGridText: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  pageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pageBtnDisabled: {
    opacity: 0.4,
  },
  pageBtnText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
    marginHorizontal: 4,
  },
  pageBtnTextDisabled: {
    color: colors.textMuted,
  },
  paginationIndicator: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
});
