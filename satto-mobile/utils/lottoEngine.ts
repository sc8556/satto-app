/**
 * 사주 기반 로또 번호 추천 엔진
 * 가중치 기반 샘플링으로 번호를 생성합니다.
 */

import { NumberWeights } from './sajeEngine';

export interface LottoResult {
  numbers: number[];      // 메인 6개
  bonus: number;          // 보너스 1개
  label: string;          // 조합 라벨
  description: string;    // 추천 이유
  avoidNote: string;      // 피해야 할 기운
  fortuneMessage: string; // 오늘의 운세 메시지
}

export type CombinationType = '재물기회형' | '안정상승형' | '직감몰림형' | '균형흐름형';

const COMBINATION_LABELS: Record<CombinationType, { label: string; description: string }> = {
  재물기회형: {
    label: '재물 기회형',
    description: '재물 기운이 강하게 흐르는 날, 과감한 선택이 결실을 맺을 수 있습니다.',
  },
  안정상승형: {
    label: '안정 상승형',
    description: '무리하지 않는 안정감 속에서 서서히 올라오는 흐름입니다.',
  },
  직감몰림형: {
    label: '직감 몰림형',
    description: '직감이 빛나는 날입니다. 첫 번째 느낌을 믿어보세요.',
  },
  균형흐름형: {
    label: '균형 흐름형',
    description: '한쪽에 치우치지 않는 균형 잡힌 흐름이 복을 부릅니다.',
  },
};

const FORTUNE_MESSAGES = [
  '오늘은 강한 한방보다 균형 있는 조합이 잘 맞는 흐름입니다.',
  '무리한 기대보다 자연스럽게 들어오는 운을 잡는 날입니다.',
  '직감형 숫자보다 안정형 숫자대에서 흐름이 살아납니다.',
  '이번 주 흐름은 차분하게 준비한 사람에게 유리합니다.',
  '오늘의 기운은 새로운 변화를 받아들이는 데 열려 있습니다.',
  '작은 기대가 큰 기쁨으로 돌아오는 날의 흐름입니다.',
];

const AVOID_NOTES = [
  '너무 높은 번호대에 집중하는 것을 피하세요.',
  '연속된 숫자에 지나치게 의존하지 마세요.',
  '오늘은 충동적인 선택보다 직관적인 선택이 더 잘 맞습니다.',
  '무리하게 새로운 패턴을 강요하기보다 자연스러운 흐름을 따르세요.',
  '이번 주는 이미 정해진 숫자보다 가중치 높은 숫자를 선택하는 것이 좋습니다.',
];

/**
 * 가중치 기반 랜덤 샘플링 (비복원)
 */
function weightedSample(weights: number[], count: number, seed: number): number[] {
  const remainWeights = [...weights];
  const selected: number[] = [];
  let rng = seed;

  const nextRandom = () => {
    rng = (rng * 1664525 + 1013904223) & 0xffffffff;
    return Math.abs(rng) / 0x7fffffff;
  };

  const maxAttempts = count * 10;
  let attempts = 0;

  while (selected.length < count && attempts < maxAttempts) {
    attempts++;
    const totalWeight = remainWeights.reduce((a, b) => a + b, 0);
    if (totalWeight <= 0) break;

    let r = nextRandom() * totalWeight;
    for (let i = 0; i < remainWeights.length; i++) {
      r -= remainWeights[i];
      if (r <= 0) {
        selected.push(i + 1);
        remainWeights[i] = 0;
        break;
      }
    }
  }

  // 부족한 경우 남은 번호에서 순차 보충
  if (selected.length < count) {
    const remaining = Array.from({ length: 45 }, (_, i) => i + 1)
      .filter(n => !selected.includes(n));
    for (let i = 0; i < remaining.length && selected.length < count; i++) {
      selected.push(remaining[i]);
    }
  }

  return selected;
}

/**
 * 번호를 로또 스타일로 검증/조정 (홀짝 균형 등)
 */
function balanceNumbers(nums: number[], weights: number[], type: CombinationType, seed: number): number[] {
  let result = [...nums].sort((a, b) => a - b);

  if (type === '균형흐름형') {
    // 홀짝 3:3 목표
    const odds = result.filter(n => n % 2 !== 0);
    const evens = result.filter(n => n % 2 === 0);
    if (odds.length > 4 || evens.length > 4) {
      // 재샘플링
      result = weightedSample(weights, 6, seed + 1).sort((a, b) => a - b);
    }
  }

  if (type === '안정상승형') {
    // 낮은 번호대(1~22) 선호
    const lowCount = result.filter(n => n <= 22).length;
    if (lowCount < 3) {
      // 낮은 번호대로 교체
      const highNums = result.filter(n => n > 22);
      const highWeights = [...weights];
      for (let i = 22; i < 45; i++) highWeights[i] = 0.01;
      const replacement = weightedSample(highWeights, highNums.length, seed + 2);
      result = [...result.filter(n => n <= 22), ...replacement].sort((a, b) => a - b);
    }
  }

  return [...new Set(result)].slice(0, 6).sort((a, b) => a - b);
}

/**
 * 날짜 기반 시드 생성 (매일 새로운 결과, 같은 날은 일관성 있는 결과)
 */
function getDailySeed(birthYear: number, birthMonth: number, birthDay: number, variation: number = 0): number {
  const today = new Date();
  return birthYear * 366 + birthMonth * 31 + birthDay + today.getFullYear() * 100
    + today.getMonth() * 10 + today.getDate() + variation * 1337;
}

export function generateLottoNumbers(
  weights: NumberWeights,
  birthYear: number,
  birthMonth: number,
  birthDay: number,
  type: CombinationType = '재물기회형',
  variation: number = 0
): LottoResult {
  const seed = getDailySeed(birthYear, birthMonth, birthDay, variation);

  // 타입별 가중치 조정
  const adjustedWeights = [...weights.weights];

  if (type === '직감몰림형') {
    // 랜덤성 증가: 가중치 평탄화 후 일부 증폭
    for (let i = 0; i < adjustedWeights.length; i++) {
      adjustedWeights[i] = adjustedWeights[i] * 0.5 + 0.5;
    }
    // 5의 배수 번호에 추가 가중치 (직감적 느낌)
    [5, 10, 15, 20, 25, 30, 35, 40, 45].forEach(n => {
      adjustedWeights[n - 1] *= 1.3;
    });
  } else if (type === '재물기회형') {
    // 높은 가중치 번호 더 강조
    for (let i = 0; i < adjustedWeights.length; i++) {
      adjustedWeights[i] = Math.pow(adjustedWeights[i], 1.5);
    }
  }

  const sampled = weightedSample(adjustedWeights, 7, seed);
  const mainNumbers = balanceNumbers(sampled.slice(0, 6), adjustedWeights, type, seed);
  const bonus = sampled[6] || weightedSample(adjustedWeights, 1, seed + 999)[0];

  const msgIdx = (seed + variation) % FORTUNE_MESSAGES.length;
  const avoidIdx = (seed + variation + 2) % AVOID_NOTES.length;

  return {
    numbers: mainNumbers,
    bonus,
    label: COMBINATION_LABELS[type].label,
    description: COMBINATION_LABELS[type].description,
    avoidNote: AVOID_NOTES[avoidIdx],
    fortuneMessage: FORTUNE_MESSAGES[msgIdx],
  };
}

export function generateAllCombinations(
  weights: NumberWeights,
  birthYear: number,
  birthMonth: number,
  birthDay: number
): LottoResult[] {
  const types: CombinationType[] = ['재물기회형', '안정상승형', '직감몰림형', '균형흐름형'];
  return types.map((type, i) =>
    generateLottoNumbers(weights, birthYear, birthMonth, birthDay, type, i)
  );
}

export function getBallColor(number: number): string {
  if (number <= 10) return '#F7B731';
  if (number <= 20) return '#4A90D9';
  if (number <= 30) return '#E8453C';
  if (number <= 40) return '#8E9AAA';
  return '#43B97F';
}
