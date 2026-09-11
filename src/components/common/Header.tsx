import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { colors, commonStyles, typography } from '../../theme';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onBack,
  rightAction,
}) => {
  return (
    <View style={commonStyles.screenHeader}>
      <View style={commonStyles.row}>
        {onBack && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ArrowLeft color={colors.text} size={24} />
          </TouchableOpacity>
        )}
        <View>
          <Text style={typography.h3}>{title}</Text>
          {subtitle && <Text style={typography.caption}>{subtitle}</Text>}
        </View>
      </View>

      {rightAction && <View style={commonStyles.row}>{rightAction}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  backButton: {
    marginRight: 12,
    padding: 4,
  },
});

