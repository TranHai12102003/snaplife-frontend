import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { Image } from 'expo-image';
import { X } from 'lucide-react-native';
import { postApi } from '../../api/postApi';
import { ReactionType, ReactionUserItem } from '../../types/post.types';
import { colors, typography } from '../../theme';
import { getFullMediaUrl } from '../../utils/formatters';
import { REACTION_EMOJIS } from './PostCard';

interface ReactionListModalProps {
  visible: boolean;
  postId: number | null;
  onClose: () => void;
}

export const ReactionListModal: React.FC<ReactionListModalProps> = ({
  visible,
  postId,
  onClose,
}) => {
  const [reactions, setReactions] = useState<ReactionUserItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState<number | 'all'>('all');

  useEffect(() => {
    if (visible && postId) {
      fetchReactions(postId);
    } else {
      setReactions([]);
      setSelectedTab('all');
    }
  }, [visible, postId]);

  const fetchReactions = async (id: number) => {
    setIsLoading(true);
    try {
      const data = await postApi.getPostReactions(id);
      setReactions(data || []);
    } catch (error) {
      console.warn('Failed to load reactions list:', error);
      setReactions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Group reaction counts by type
  const reactionCounts = reactions.reduce<Record<number, number>>((acc, item) => {
    acc[item.Type] = (acc[item.Type] || 0) + 1;
    return acc;
  }, {});

  // Active filter tabs (only include types that have at least 1 reaction)
  const activeTabs: { key: number | 'all'; label: string; count: number }[] = [
    { key: 'all', label: 'Tất cả', count: reactions.length },
    ...REACTION_EMOJIS.filter((r) => (reactionCounts[r.type] || 0) > 0).map((r) => ({
      key: r.type,
      label: r.emoji,
      count: reactionCounts[r.type],
    })),
  ];

  const filteredReactions =
    selectedTab === 'all'
      ? reactions
      : reactions.filter((item) => item.Type === selectedTab);

  const renderItem = ({ item }: { item: ReactionUserItem }) => {
    const avatarUrl = item.User?.AvatarUrl ? getFullMediaUrl(item.User.AvatarUrl) : null;
    const emojiInfo = REACTION_EMOJIS.find((r) => r.type === item.Type);

    return (
      <View style={styles.userRow}>
        <View style={styles.avatarWrapper}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarInitial}>
                {item.User?.FullName?.[0] || item.User?.UserName?.[0] || 'U'}
              </Text>
            </View>
          )}
          {/* Reaction Badge at bottom-right of avatar */}
          <View style={styles.userReactionBadge}>
            <Text style={styles.userReactionEmoji}>{emojiInfo?.emoji || '❤️'}</Text>
          </View>
        </View>

        <View style={styles.userInfo}>
          <Text style={styles.userName} numberOfLines={1}>
            {item.User?.FullName || item.User?.UserName || 'Người dùng'}
          </Text>
          {item.User?.UserName ? (
            <Text style={styles.userHandle} numberOfLines={1}>
              @{item.User.UserName}
            </Text>
          ) : null}
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Biểu cảm</Text>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X color={colors.textSecondary} size={20} />
            </TouchableOpacity>
          </View>

          {/* Filter Tabs */}
          <View style={styles.tabsContainer}>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={activeTabs}
              keyExtractor={(item) => item.key.toString()}
              contentContainerStyle={styles.tabsScroll}
              renderItem={({ item }) => {
                const isActive = selectedTab === item.key;
                return (
                  <TouchableOpacity
                    style={[styles.tabItem, isActive && styles.tabItemActive]}
                    onPress={() => setSelectedTab(item.key)}
                  >
                    <Text
                      style={[styles.tabLabel, isActive && styles.tabLabelActive]}
                    >
                      {item.label} {item.count}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          </View>

          {/* Content List */}
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={colors.primary} size="small" />
            </View>
          ) : (
            <FlatList
              data={filteredReactions}
              keyExtractor={(item, index) => item.Id?.toString() || index.toString()}
              renderItem={renderItem}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>Chưa có biểu cảm nào</Text>
                </View>
              }
            />
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
    minHeight: 320,
    paddingBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    ...typography.h3,
    color: colors.text,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: colors.surfaceLight,
  },
  tabsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabsScroll: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  tabItem: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.surfaceLight,
  },
  tabItemActive: {
    backgroundColor: colors.primary,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabLabelActive: {
    color: '#000000',
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 14,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarPlaceholder: {
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatarInitial: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 16,
  },
  userReactionBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: colors.surface,
    borderRadius: 10,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.surface,
  },
  userReactionEmoji: {
    fontSize: 10,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  userHandle: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
});

