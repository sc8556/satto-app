import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import LottoNumberBall from './LottoNumberBall';
import { LottoResult } from '../utils/lottoEngine';
import { Colors, Fonts, Radius, Spacing } from '../constants/theme';

interface Props {
  result: LottoResult;
  round?: number;
  size?: 'sm' | 'lg';
}

export default function LottoCard({ result, round, size = 'lg' }: Props) {
  const ballSize = size === 'lg' ? 'md' : 'sm';

  return (
    <LinearGradient
      colors={['#1A2E45', '#0D1B2A']}
      style={styles.card}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.header}>
        <View style={styles.labelBadge}>
          <Text style={styles.labelText}>{result.label}</Text>
        </View>
        {round && (
          <Text style={styles.roundText}>{round}회차</Text>
        )}
      </View>

      <View style={styles.numbersRow}>
        {result.numbers.map((n, i) => (
          <LottoNumberBall key={i} number={n} size={ballSize} />
        ))}
        <Text style={styles.plus}>+</Text>
        <LottoNumberBall number={result.bonus} size={ballSize} isBonus />
      </View>

      <Text style={styles.description}>{result.description}</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  labelBadge: {
    backgroundColor: 'rgba(212,168,67,0.2)',
    borderWidth: 1,
    borderColor: Colors.gold.primary,
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  labelText: {
    color: Colors.gold.primary,
    fontSize: Fonts.sizes.xs,
    fontWeight: Fonts.weights.semibold,
  },
  roundText: {
    color: Colors.text.muted,
    fontSize: Fonts.sizes.xs,
  },
  numbersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  plus: {
    color: Colors.text.muted,
    fontSize: Fonts.sizes.md,
    marginHorizontal: 2,
  },
  description: {
    color: Colors.text.secondary,
    fontSize: Fonts.sizes.sm,
    textAlign: 'center',
    lineHeight: 18,
  },
});
