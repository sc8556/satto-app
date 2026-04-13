import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getBallColor } from '../utils/lottoEngine';

interface Props {
  number: number;
  size?: 'sm' | 'md' | 'lg';
  isBonus?: boolean;
}

const SIZES = {
  sm: { ball: 32, font: 12 },
  md: { ball: 44, font: 16 },
  lg: { ball: 56, font: 20 },
};

export default function LottoNumberBall({ number, size = 'md', isBonus = false }: Props) {
  const dim = SIZES[size];
  const color = isBonus ? '#C084FC' : getBallColor(number);

  return (
    <View
      style={[
        styles.ball,
        {
          width: dim.ball,
          height: dim.ball,
          borderRadius: dim.ball / 2,
          backgroundColor: color,
          shadowColor: color,
        },
      ]}
    >
      <Text style={[styles.text, { fontSize: dim.font }]}>{number}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  ball: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 4,
  },
  text: {
    color: '#fff',
    fontWeight: '800',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
