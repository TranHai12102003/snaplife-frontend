import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, Sparkles } from 'lucide-react-native';
import { PostCard } from '../../components/feed/PostCard';
import { postApi } from '../../api/postApi';
import { PostDetailVModel, ReactionType } from '../../types/post.types';
import { colors, commonStyles, typography } from '../../theme';

interface FeedScreenProps {
  navigation: any;
}

export const FeedScreen: React.FC<FeedScreenProps> = ({ navigation }) => {
  const [posts, setPosts] = useState<PostDetailVModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchFeed = async (pageNumber: number = 1, refresh: boolean = false) => {
    try {
      if (refresh) setIsRefreshing(true);
      const res = await postApi.getFeed({ PageNumber: pageNumber, PageSize: 10 });

      if (refresh || pageNumber === 1) {
        setPosts(res.Records || []);
      } else {
        setPosts((prev) => [...prev, ...(res.Records || [])]);
      }

      setHasMore((res.Records?.length || 0) >= 10);
      setPage(pageNumber);
    } catch (error) {
      console.warn('Failed to load feed:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFeed(1);
  }, []);

  const onRefresh = useCallback(() => {
    fetchFeed(1, true);
  }, []);

  const handleReact = async (postId: number, reactionType: ReactionType) => {
    try {
      // Optimistic update
      setPosts((prev) =>
        prev.map((p) => {
          if (p.Id === postId) {
            const wasReacted = !!p.UserReaction;
            return {
              ...p,
              UserReaction: reactionType,
              LikeCount: wasReacted ? p.LikeCount : p.LikeCount + 1,
            };
          }
          return p;
        })
      );

      await postApi.reactToPost(postId, reactionType);
    } catch (error) {
      console.warn('Failed to submit reaction:', error);
    }
  };

  const renderEmpty = () => {
    if (isLoading) return null;
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconContainer}>
          <Sparkles color={colors.primary} size={40} />
        </View>
        <Text style={styles.emptyTitle}>Chưa có khoảnh khắc nào!</Text>
        <Text style={styles.emptySubtitle}>
          Hãy chụp một bức ảnh khoảnh khắc hoặc món ăn cùng chi phí để chia sẻ với bạn bè.
        </Text>
        <TouchableOpacity
          style={styles.emptyButton}
          onPress={() => navigation.navigate('CameraTab')}
        >
          <Camera color="#000000" size={20} />
          <Text style={styles.emptyButtonText}>Chụp Snap đầu tiên</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={commonStyles.screenContainer} edges={['top']}>
      {/* Top Header */}
      <View style={commonStyles.screenHeader}>
        <Text style={[typography.h2, styles.headerTitle]}>SnapLife</Text>
        <TouchableOpacity
          style={styles.headerActionBtn}
          onPress={() => navigation.navigate('CameraTab')}
        >
          <Camera color={colors.text} size={24} />
        </TouchableOpacity>
      </View>

      {/* Feed List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.Id.toString()}
          renderItem={({ item }) => (
            <PostCard post={item} onReact={handleReact} />
          )}
          contentContainerStyle={commonStyles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={renderEmpty}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  headerTitle: {
    color: colors.primary,
    letterSpacing: 0.5,
  },
  headerActionBtn: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 14,
  },
  emptyButtonText: {
    color: '#000000',
    fontWeight: '700',
    fontSize: 15,
    marginLeft: 8,
  },
});

