import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Image } from 'expo-image';
import { MapPin, MessageCircle, Heart } from 'lucide-react-native';
import { PostDetailVModel, ReactionType } from '../../types/post.types';
import { colors } from '../../constants/colors';
import { formatCurrency, formatRelativeTime, getFullMediaUrl } from '../../utils/formatters';

interface PostCardProps {
  post: PostDetailVModel;
  onReact: (postId: number, reactionType: ReactionType) => void;
  onCommentPress?: (postId: number) => void;
}

const REACTION_EMOJIS: { type: ReactionType; emoji: string }[] = [
  { type: ReactionType.Like, emoji: '❤️' },
  { type: ReactionType.Haha, emoji: '😂' },
  { type: ReactionType.Love, emoji: '🤤' }, // Food craving
  { type: ReactionType.Wow, emoji: '🔥' },
  { type: ReactionType.Sad, emoji: '😮' },
  { type: ReactionType.Angry, emoji: '😢' },
];

export const PostCard: React.FC<PostCardProps> = ({ post, onReact, onCommentPress }) => {
  const [showReactions, setShowReactions] = useState(false);
  const mediaUrl = post.Medias?.[0]?.FileUrl ? getFullMediaUrl(post.Medias[0].FileUrl) : null;
  const authorAvatar = post.Author?.AvatarUrl ? getFullMediaUrl(post.Author.AvatarUrl) : null;

  return (
    <View style={styles.card}>
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

      {/* Quick Reaction Bar */}
      {showReactions ? (
        <View style={styles.emojiPicker}>
          {REACTION_EMOJIS.map((r) => (
            <TouchableOpacity
              key={r.type}
              style={styles.emojiButton}
              onPress={() => {
                onReact(post.Id, r.type);
                setShowReactions(false);
              }}
            >
              <Text style={styles.emojiText}>{r.emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : null}

      {/* Footer Actions */}
      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => setShowReactions(!showReactions)}
          >
            <Heart
              color={post.UserReaction ? colors.secondary : colors.text}
              fill={post.UserReaction ? colors.secondary : 'transparent'}
              size={22}
            />
            <Text style={styles.actionCount}>{post.LikeCount}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => onCommentPress && onCommentPress(post.Id)}
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
    backgroundColor: colors.surface,
    borderRadius: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    width: '100%',
    maxWidth: 540,
    alignSelf: 'center',
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
  emojiPicker: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceLight,
    marginHorizontal: 16,
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 30,
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: colors.border,
  },
  emojiButton: {
    padding: 4,
  },
  emojiText: {
    fontSize: 22,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  actionCount: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
});

