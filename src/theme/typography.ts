import { TextStyle } from 'react-native';
import { colors } from './colors';

export const typography: Record<string, TextStyle> = {
  h1: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: 0.5,
  },
  h2: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
  },
  h3: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  body: {
    fontSize: 14,
    color: colors.text,
  },
  bodyBold: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  bodyMuted: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  caption: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  captionBold: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
};
