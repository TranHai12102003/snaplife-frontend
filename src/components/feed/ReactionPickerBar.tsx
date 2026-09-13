import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { ReactionType } from '../../types/post.types';
import { colors } from '../../theme';
import { REACTION_EMOJIS } from './PostCard';

export interface ReactionPickerBarProps {
  visible: boolean;
  hoveredIndex: number;
  postReaction?: ReactionType | null;
  onSelectEmoji: (type: ReactionType) => void;
  onClose: () => void;
  onLayoutBar?: (layout: { pageX: number; pageY: number; width: number; height: number }) => void;
}

export const ReactionPickerBar: React.FC<ReactionPickerBarProps> = ({
  visible,
  hoveredIndex,
  postReaction,
  onSelectEmoji,
  onClose,
  onLayoutBar,
}) => {
  // Bar animation (open/close)
  const barScale = useRef(new Animated.Value(0.3)).current;
  const barOpacity = useRef(new Animated.Value(0)).current;
  const barTranslateY = useRef(new Animated.Value(15)).current;

  // Individual emoji animations: scale, translateY, opacity
  const emojiAnims = useRef(
    REACTION_EMOJIS.map(() => ({
      scale: new Animated.Value(1),
      translateY: new Animated.Value(0),
      opacity: new Animated.Value(1),
    }))
  ).current;

  const barRef = useRef<View>(null);

  useEffect(() => {
    if (visible) {
      // Reset all emoji states
      emojiAnims.forEach((anim) => {
        anim.scale.setValue(1);
        anim.translateY.setValue(0);
        anim.opacity.setValue(1);
      });

      // Animate bar entrance with spring
      Animated.parallel([
        Animated.spring(barScale, {
          toValue: 1,
          friction: 6,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.timing(barOpacity, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.spring(barTranslateY, {
          toValue: 0,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animate bar exit
      Animated.parallel([
        Animated.timing(barScale, {
          toValue: 0.4,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.timing(barOpacity, {
          toValue: 0,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.timing(barTranslateY, {
          toValue: 10,
          duration: 120,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  // React to hoveredIndex change during drag
  useEffect(() => {
    if (!visible) return;

    emojiAnims.forEach((anim, idx) => {
      if (idx === hoveredIndex) {
        // Hovered emoji: Scale up & float upwards
        Animated.parallel([
          Animated.spring(anim.scale, {
            toValue: 1.55,
            friction: 4,
            tension: 140,
            useNativeDriver: true,
          }),
          Animated.spring(anim.translateY, {
            toValue: -16,
            friction: 4,
            tension: 140,
            useNativeDriver: true,
          }),
        ]).start();
      } else {
        // Non-hovered emojis: slightly shrink if any is hovered, else return to normal
        const targetScale = hoveredIndex !== -1 ? 0.92 : 1;
        Animated.parallel([
          Animated.spring(anim.scale, {
            toValue: targetScale,
            friction: 6,
            useNativeDriver: true,
          }),
          Animated.spring(anim.translateY, {
            toValue: 0,
            friction: 6,
            useNativeDriver: true,
          }),
        ]).start();
      }
    });
  }, [hoveredIndex, visible]);

  // Handler for direct tap on an emoji
  const handleEmojiPress = (index: number) => {
    const anim = emojiAnims[index];
    const reaction = REACTION_EMOJIS[index];

    // Nảy lên rồi rơi xuống (Bounce & drop)
    Animated.sequence([
      Animated.spring(anim.translateY, {
        toValue: -30,
        friction: 3,
        tension: 150,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(anim.translateY, {
          toValue: 35,
          duration: 160,
          useNativeDriver: true,
        }),
        Animated.timing(anim.scale, {
          toValue: 0.7,
          duration: 160,
          useNativeDriver: true,
        }),
        Animated.timing(anim.opacity, {
          toValue: 0,
          duration: 160,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      onSelectEmoji(reaction.type);
    });
  };

  const measureBar = () => {
    if (barRef.current) {
      barRef.current.measureInWindow((pageX, pageY, width, height) => {
        if (pageX !== undefined && width > 0) {
          onLayoutBar?.({ pageX, pageY, width, height });
        }
      });
    }
  };

  if (!visible) return null;

  const currentHoveredEmoji = hoveredIndex >= 0 && hoveredIndex < REACTION_EMOJIS.length
    ? REACTION_EMOJIS[hoveredIndex]
    : null;

  return (
    <View style={styles.overlayContainer} pointerEvents="box-none">
      {/* Invisible backdrop to dismiss if tapped outside */}
      <Pressable style={styles.backdrop} onPress={onClose} />

      <Animated.View
        ref={barRef}
        onLayout={measureBar}
        style={[
          styles.container,
          {
            opacity: barOpacity,
            transform: [
              { scale: barScale },
              { translateY: barTranslateY },
            ],
          },
        ]}
      >
        {/* Tooltip label above hovered emoji */}
        {currentHoveredEmoji && (
          <View
            style={[
              styles.tooltipContainer,
              { left: 16 + hoveredIndex * 42 },
            ]}
          >
            <Text style={styles.tooltipText}>{currentHoveredEmoji.label}</Text>
          </View>
        )}

        <View style={styles.emojisRow}>
          {REACTION_EMOJIS.map((r, index) => {
            const anim = emojiAnims[index];
            const isCurrentSelected = postReaction === r.type;

            return (
              <TouchableOpacity
                key={r.type}
                style={styles.emojiSlot}
                onPress={() => handleEmojiPress(index)}
                activeOpacity={0.8}
              >
                <Animated.View
                  style={[
                    styles.emojiWrapper,
                    {
                      opacity: anim.opacity,
                      transform: [
                        { scale: anim.scale },
                        { translateY: anim.translateY },
                      ],
                    },
                  ]}
                >
                  <Text style={styles.emojiText}>{r.emoji}</Text>
                  {isCurrentSelected && hoveredIndex !== index && (
                    <View style={styles.selectedDot} />
                  )}
                </Animated.View>
              </TouchableOpacity>
            );
          })}
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlayContainer: {
    position: 'absolute',
    bottom: 50,
    left: 8,
    zIndex: 9999,
  },
  backdrop: {
    position: 'absolute',
    top: -500,
    left: -500,
    right: -500,
    bottom: -500,
  },
  container: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 32,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  tooltipContainer: {
    position: 'absolute',
    top: -34,
    backgroundColor: 'rgba(15, 15, 18, 0.92)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  tooltipText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  emojisRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emojiSlot: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiText: {
    fontSize: 26,
    lineHeight: 32,
  },
  selectedDot: {
    position: 'absolute',
    bottom: -4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
});
