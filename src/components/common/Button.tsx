import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors } from '../../constants/colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  isLoading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}) => {
  const isInteractive = !disabled && !isLoading;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={isInteractive ? onPress : undefined}
      style={[
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        disabled && styles.disabled,
        style,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator
          color={variant === 'outline' || variant === 'ghost' ? colors.primary : '#000000'}
          size="small"
        />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.textBase,
              styles[`text_${variant}`],
              styles[`textSize_${size}`],
              icon ? { marginLeft: 8 } : undefined,
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.surfaceLight,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  size_small: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  size_medium: {
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  size_large: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 18,
  },
  disabled: {
    opacity: 0.5,
  },
  textBase: {
    fontWeight: '700',
    textAlign: 'center',
  },
  text_primary: {
    color: '#000000',
  },
  text_secondary: {
    color: colors.text,
  },
  text_outline: {
    color: colors.primary,
  },
  text_ghost: {
    color: colors.textSecondary,
  },
  textSize_small: {
    fontSize: 13,
  },
  textSize_medium: {
    fontSize: 15,
  },
  textSize_large: {
    fontSize: 17,
  },
});

