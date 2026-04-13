import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Colors, Fonts } from '../constants/theme';

interface Props {
  score: number; // 0~100
  showLabel?: boolean;
}

function getScoreColor(score: number): string {
  if (score >= 70) return Colors.fortune.high;
  if (score >= 45) return Colors.fortune.mid;
  return Colors.fortune.low;
}

function getScoreLabel(score: number): string {
  if (score >= 85) return '대길';
  if (score >= 70) return '길';
  if (score >= 55) return '중길';
  if (score >= 40) return '평';
  return '소';
}

export default function FortuneScore({ score, showLabel = true }: Props) {
  const animWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animWidth, {
      toValue: score,
      duration: 1200,
      useNativeDriver: false,
    }).start();
  }, [score]);

  const color = getScoreColor(score);
  const label = getScoreLabel(score);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>오늘의 복권운</Text>
        <Text style={[styles.score, { color }]}>
          {score}점
          {showLabel && <Text style={[styles.label, { color }]}> {label}</Text>}
        </Text>
      </View>
      <View style={styles.barBg}>
        <Animated.View
          style={[
            styles.barFill,
            {
              backgroundColor: color,
              width: animWidth.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              }),
              shadowColor: color,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    color: Colors.text.secondary,
    fontSize: Fonts.sizes.sm,
    fontWeight: Fonts.weights.medium,
  },
  score: {
    fontSize: Fonts.sizes.lg,
    fontWeight: Fonts.weights.bold,
  },
  label: {
    fontSize: Fonts.sizes.sm,
    fontWeight: Fonts.weights.medium,
  },
  barBg: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
});
