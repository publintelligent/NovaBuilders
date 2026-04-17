import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Modal,
} from 'react-native';
import {COLORS} from '../utils/theme';

interface Props {
  visible: boolean;
  title?: string;
  subtitle?: string;
  showProgress?: boolean;
}

export default function LoadingOverlay({
  visible,
  title = 'Analyzing plans...',
  subtitle = 'Reading dimensions, materials & scope',
  showProgress = true,
}: Props) {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;

    const animDot = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {toValue: -10, duration: 300, useNativeDriver: true}),
          Animated.timing(dot, {toValue: 0, duration: 300, useNativeDriver: true}),
          Animated.delay(600),
        ]),
      );

    const d1 = animDot(dot1, 0);
    const d2 = animDot(dot2, 200);
    const d3 = animDot(dot3, 400);
    const prog = Animated.timing(progress, {
      toValue: 0.92,
      duration: 3800,
      useNativeDriver: false,
    });

    d1.start();
    d2.start();
    d3.start();
    prog.start();

    return () => {
      d1.stop();
      d2.stop();
      d3.stop();
      prog.stop();
      progress.setValue(0);
    };
  }, [visible]);

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.icon}>🤖</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>

          <View style={styles.dots}>
            {[dot1, dot2, dot3].map((dot, i) => (
              <Animated.View
                key={i}
                style={[styles.dot, {transform: [{translateY: dot}]}]}
              />
            ))}
          </View>

          {showProgress && (
            <View style={styles.progressTrack}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    width: progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                  },
                ]}
              />
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
  },
  icon: {fontSize: 48, marginBottom: 16},
  title: {
    fontSize: 18,
    fontWeight: '500',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.gold,
  },
  progressTrack: {
    width: '100%',
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.gold,
    borderRadius: 2,
  },
});
