import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  GestureResponderEvent,
} from 'react-native';
import { Image } from 'expo-image';
import { MapPin, MessageCircle, Heart } from 'lucide-react-native';
import { PostDetailVModel, ReactionType } from '../../types/post.types';
import { colors, commonStyles, typography } from '../../theme';
import { formatCurrency, formatRelativeTime, getFullMediaUrl } from '../../utils/formatters';
import { ReactionPickerBar } from './ReactionPickerBar';

export interface PostCardProps {
  post: PostDetailVModel;
  onReact: (postId: number, reactionType: ReactionType) => void;
  onCommentPress?: (postId: number) => void;
  onReactionPress?: (postId: number) => void;
}

export const REACTION_EMOJIS: { type: ReactionType; emoji: string; label: string }[] = [
  { type: ReactionType.Like, emoji: '❤️', label: 'Yêu thích' },
  { type: ReactionType.Haha, emoji: '😂', label: 'Haha' },
  { type: ReactionType.Love, emoji: '🤤', label: 'Thèm quá' },
  { type: ReactionType.Wow, emoji: '🔥', label: 'Tuyệt đỉnh' },
  { type: ReactionType.Sad, emoji: '😮', label: 'Bất ngờ' },
  { type: ReactionType.Angry, emoji: '😢', label: 'Buồn' },
];

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onReact,
  onCommentPress,
  onReactionPress,
}) => {
  const [showReactions, setShowReactions] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(-1);
  const hoveredIndexRef = useRef(-1);
  const isHolding = useRef(false);
  const isBarOpen = useRef(false);
  const startTouch = useRef({ x: 0, y: 0 });
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const barLayout = useRef<{ pageX: number; pageY: number; width: number; height: number } | null>(null);

  // Button catch/pop animation
  const buttonScale = useRef(new Animated.Value(1)).current;

  const mediaUrl = post.Medias?.[0]?.FileUrl ? getFullMediaUrl(post.Medias[0].FileUrl) : null;
  const authorAvatar = post.Author?.AvatarUrl ? getFullMediaUrl(post.Author.AvatarUrl) : null;

  const currentEmoji = REACTION_EMOJIS.find((r) => r.type === post.UserReaction);

  const triggerButtonPop = () => {
    Animated.sequence([
      Animated.timing(buttonScale, { toValue: 0.72, duration: 70, useNativeDriver: true }),
      Animated.spring(buttonScale, { toValue: 1.35, friction: 3, tension: 160, useNativeDriver: true }),
      Animated.spring(buttonScale, { toValue: 1.0, friction: 5, useNativeDriver: true }),
    ]).start();
  };

  const openBar = () => {
    setShowReactions(true);
    isBarOpen.current = true;
  };

  const closeBar = () => {
    setShowReactions(false);
    isBarOpen.current = false;
    setHoveredIndex(-1);
    hoveredIndexRef.current = -1;
  };

  const handleSelectReaction = (type: ReactionType) => {
    closeBar();
    onReact(post.Id, type);
    triggerButtonPop();
  };

  const handlePressReact = () => {
    if (post.UserReaction) {
      // Bấm lại để hủy thả biểu cảm (Toggle off)
      onReact(post.Id, post.UserReaction);
    } else {
      // Mặc định thả Yêu thích (❤️)
      onReact(post.Id, ReactionType.Like);
    }
  };

  const handleTouchStart = (e: GestureResponderEvent) => {
    isHolding.current = true;
    startTouch.current = { x: e.nativeEvent.pageX, y: e.nativeEvent.pageY };

    if (isBarOpen.current) return;

    longPressTimer.current = setTimeout(() => {
      if (isHolding.current) {
        openBar();
      }
    }, 220);
  };

  const handleTouchMove = (e: GestureResponderEvent) => {
    const { pageX, pageY } = e.nativeEvent;

    if (!isBarOpen.current) {
      const dx = Math.abs(pageX - startTouch.current.x);
      const dy = Math.abs(pageY - startTouch.current.y);
      if (dy > 10 || dx > 12) {
        if (longPressTimer.current) clearTimeout(longPressTimer.current);
        isHolding.current = false;
      }
      return;
    }

    // When bar is open, determine which emoji is hovered based on layout
    const layout = barLayout.current || {
      pageX: Math.max(8, startTouch.current.x - 40),
      pageY: startTouch.current.y - 70,
      width: 260,
      height: 50,
    };

    const isNearY = pageY >= layout.pageY - 50 && pageY <= layout.pageY + layout.height + 50;

    if (isNearY) {
      const relativeX = pageX - layout.pageX;
      const slotW = layout.width / REACTION_EMOJIS.length;
      const index = Math.floor(relativeX / slotW);

      if (index >= 0 && index < REACTION_EMOJIS.length) {
        if (hoveredIndexRef.current !== index) {
          hoveredIndexRef.current = index;
          setHoveredIndex(index);
        }
        return;
      }
    }

    if (hoveredIndexRef.current !== -1) {
      hoveredIndexRef.current = -1;
      setHoveredIndex(-1);
    }
  };

  const handleTouchEnd = () => {
    isHolding.current = false;
    if (longPressTimer.current) clearTimeout(longPressTimer.current);

    if (!isBarOpen.current) {
      // Single tap: default Like or unreact
      handlePressReact();
      triggerButtonPop();
    } else {
      if (hoveredIndexRef.current !== -1) {
        const selectedType = REACTION_EMOJIS[hoveredIndexRef.current].type;
        handleSelectReaction(selectedType);
      } else {
        // Finger lifted without selecting an emoji: keep bar open for direct tap
        setHoveredIndex(-1);
        hoveredIndexRef.current = -1;
      }
    }
  };

  const handleTouchCancel = () => {
    isHolding.current = false;
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    if (isBarOpen.current) {
      closeBar();
    }
  };

  const getDisplayReactions = (): string[] => {
    const result: string[] = [];
    if (post.TopReactions && post.TopReactions.length > 0) {
      post.TopReactions.forEach((type) => {
        const found = REACTION_EMOJIS.find((r) => r.type === type);
        if (found && !result.includes(found.emoji)) {
          result.push(found.emoji);
        }
      });
    } else if (post.UserReaction) {
      const found = REACTION_EMOJIS.find((r) => r.type === post.UserReaction);
      if (found) result.push(found.emoji);
    } else if (post.LikeCount > 0) {
      result.push('❤️');
    }
    return result.slice(0, 3);
  };

  const displayReactions = getDisplayReactions();

  return (
    <View style={[commonStyles.card, styles.card]}>
      {/* Header: Author & Timestamp */}
      <View style={styles.header}>
        <View style={styles.authorRow}>
          {authorAvatar ? (
            <Image source={{ uri: authorAvatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarInitial}>
                {post.Author?.FullName?.[0] || post.Author?.UserName?.[0] || 'S'}
              </Text>
            </View>
          )}

          <View style={styles.authorInfo}>
            <Text style={styles.authorName}>
              {post.Author?.FullName || post.Author?.UserName || 'Snap Friend'}
            </Text>
            <View style={styles.subHeaderRow}>
              <Text style={styles.timeText}>{formatRelativeTime(post.CreatedDate)}</Text>
              {post.LocationName ? (
                <>
                  <Text style={styles.dotSeparator}>•</Text>
                  <MapPin color={colors.textSecondary} size={11} />
                  <Text style={styles.locationText} numberOfLines={1}>
                    {post.LocationName}
                  </Text>
                </>
              ) : null}
            </View>
          </View>
        </View>
      </View>

      {/* Snap Photo (Locket style rounded square) */}
      <View style={styles.imageContainer}>
        {mediaUrl ? (
          <Image
            source={{ uri: mediaUrl }}
            style={styles.image}
            contentFit="cover"
            transition={300}
          />
        ) : (
          <View style={[styles.image, styles.noImage]}>
            <Text style={styles.noImageText}>📷 Snap moment</Text>
          </View>
        )}

        {/* Expense Badge Overlay if IsExpense */}
        {post.IsExpense && post.ShowAmountToFriends ? (
          <View style={styles.expenseBadge}>
            <Text style={styles.expenseBadgeText}>
              {post.FoodName || post.ExpenseCategoryName || 'Chi tiêu'}:{' '}
              <Text style={styles.expenseAmountText}>
                {formatCurrency(post.Amount, post.Currency)}
              </Text>
            </Text>
          </View>
        ) : null}
      </View>

      {/* Caption Content */}
      {post.Content ? (
        <View style={styles.contentContainer}>
          <Text style={styles.contentText}>
            <Text style={styles.authorNameInCaption}>
              {post.Author?.UserName || 'user'}{' '}
            </Text>
            {post.Content}
          </Text>
        </View>
      ) : null}

      {/* Footer Actions */}
      <View style={styles.footer}>
        {/* Floating Quick Reaction Picker Bar */}
        <ReactionPickerBar
          visible={showReactions}
          hoveredIndex={hoveredIndex}
          postReaction={post.UserReaction}
          onSelectEmoji={handleSelectReaction}
          onClose={closeBar}
          onLayoutBar={(layout) => {
            barLayout.current = layout;
          }}
        />

        <View style={styles.footerLeft}>
          {/* User Reaction Button with gesture drag support */}
          <View
            style={styles.actionBtn}
            onStartShouldSetResponder={() => true}
            onMoveShouldSetResponder={() => true}
            onResponderTerminationRequest={() => !isBarOpen.current}
            onResponderGrant={handleTouchStart}
            onResponderMove={handleTouchMove}
            onResponderRelease={handleTouchEnd}
            onResponderTerminate={handleTouchCancel}
          >
            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              {currentEmoji ? (
                <View style={styles.activeEmojiBadge}>
                  <Text style={styles.activeEmojiText}>{currentEmoji.emoji}</Text>
                </View>
              ) : (
                <Heart color={colors.text} size={22} />
              )}
            </Animated.View>
          </View>

          {/* Social Overlapping Badges & Like Count */}
          <TouchableOpacity
            style={styles.reactionCountContainer}
            onPress={() => onReactionPress && onReactionPress(post.Id)}
            activeOpacity={post.LikeCount > 0 ? 0.6 : 1}
            disabled={post.LikeCount === 0}
          >
            {displayReactions.length > 0 && post.LikeCount > 0 ? (
              <View style={styles.reactionStack}>
                {displayReactions.map((emoji, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.reactionBadge,
                      {
                        zIndex: 10 - idx,
                        marginLeft: idx > 0 ? -6 : 0,
                      },
                    ]}
                  >
                    <Text style={styles.reactionBadgeText}>{emoji}</Text>
                  </View>
                ))}
              </View>
            ) : null}
            <Text
              style={[
                styles.actionCount,
                post.UserReaction ? styles.actionCountActive : null,
              ]}
            >
              {post.LikeCount}
            </Text>
          </TouchableOpacity>

          {/* Comments Button */}
          <TouchableOpacity
            style={[styles.actionBtn, styles.commentBtn]}
            onPress={() => onCommentPress && onCommentPress(post.Id)}
            activeOpacity={0.7}
          >
            <MessageCircle color={colors.text} size={22} />
            <Text style={styles.actionCount}>{post.CommentCount}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 20,
    overflow: 'visible',
    padding: 0,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginRight: 12,
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
  authorInfo: {
    flex: 1,
  },
  authorName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  subHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  timeText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  dotSeparator: {
    color: colors.textSecondary,
    marginHorizontal: 6,
    fontSize: 10,
  },
  locationText: {
    color: colors.textSecondary,
    fontSize: 12,
    marginLeft: 4,
    maxWidth: 150,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    position: 'relative',
    backgroundColor: '#000000',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  noImage: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceLight,
  },
  noImageText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  expenseBadge: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 200, 55, 0.3)',
  },
  expenseBadgeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  expenseAmountText: {
    color: colors.primary,
    fontWeight: '800',
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  contentText: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  authorNameInCaption: {
    fontWeight: '700',
    color: colors.text,
  },
  footer: {
    position: 'relative',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    zIndex: 100,
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  activeEmojiBadge: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeEmojiText: {
    fontSize: 20,
  },
  reactionCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 4,
    marginRight: 16,
  },
  reactionStack: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 4,
  },
  reactionBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.surface,
  },
  reactionBadgeText: {
    fontSize: 10,
    lineHeight: 12,
  },
  actionCount: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  actionCountActive: {
    color: colors.text,
    fontWeight: '700',
  },
  commentBtn: {
    marginLeft: 4,
  },
});
