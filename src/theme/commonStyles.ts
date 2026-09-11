import { StyleSheet } from 'react-native';
import { colors } from './colors';
import { spacing } from './spacing';

export const commonStyles = StyleSheet.create({
  // Screen & Containers
  screenContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.base,
    paddingBottom: spacing.xxxl,
    width: '100%',
    maxWidth: 540,
    alignSelf: 'center',
  },
  authScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.xl,
    width: '100%',
    maxWidth: 460,
    alignSelf: 'center',
  },

  // Headers
  screenHeader: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    width: '100%',
    maxWidth: 540,
    alignSelf: 'center',
  },
  screenHeaderTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
  },

  // Cards & Surfaces
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardLight: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 16,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.border,
  },

  // Flex Utilities
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex1: {
    flex: 1,
  },

  // Feedback & Banners
  errorBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.base,
  },
  errorBannerText: {
    color: colors.error,
    fontSize: 13,
    lineHeight: 18,
  },

  // Badges & Pills
  pillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pillBadgeText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },

  // Dividers
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
});
