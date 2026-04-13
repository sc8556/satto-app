/**
 * 로컬 저장소 유틸리티
 * AsyncStorage 기반으로 사용자 정보와 추천 히스토리를 관리합니다.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserProfile {
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  birthHour: number | null;
  gender: 'male' | 'female';
  isLunar: boolean;
  createdAt: string;
}

export interface SavedResult {
  id: string;
  date: string;           // ISO 날짜 문자열
  lottoRound?: number;    // 회차 (옵션)
  numbers: number[];
  bonus: number;
  label: string;
  description: string;
  fortuneMessage: string;
  fortuneScore: number;
  luckyKeyword: string;
  luckyColor: string;
  recommendedHour: string;
}

const KEYS = {
  USER_PROFILE: '@satto_user_profile',
  SAVED_RESULTS: '@satto_saved_results',
  HAS_ONBOARDED: '@satto_has_onboarded',
};

// 사용자 프로필
export async function saveUserProfile(profile: UserProfile): Promise<void> {
  await AsyncStorage.setItem(KEYS.USER_PROFILE, JSON.stringify(profile));
}

export async function getUserProfile(): Promise<UserProfile | null> {
  const raw = await AsyncStorage.getItem(KEYS.USER_PROFILE);
  return raw ? JSON.parse(raw) : null;
}

// 온보딩 완료 여부
export async function setOnboarded(): Promise<void> {
  await AsyncStorage.setItem(KEYS.HAS_ONBOARDED, 'true');
}

export async function hasOnboarded(): Promise<boolean> {
  const val = await AsyncStorage.getItem(KEYS.HAS_ONBOARDED);
  return val === 'true';
}

// 결과 저장
export async function saveResult(result: Omit<SavedResult, 'id' | 'date'>): Promise<SavedResult> {
  const existing = await getSavedResults();
  const newResult: SavedResult = {
    ...result,
    id: Date.now().toString(),
    date: new Date().toISOString(),
  };
  const updated = [newResult, ...existing].slice(0, 50); // 최대 50개
  await AsyncStorage.setItem(KEYS.SAVED_RESULTS, JSON.stringify(updated));
  return newResult;
}

export async function getSavedResults(): Promise<SavedResult[]> {
  const raw = await AsyncStorage.getItem(KEYS.SAVED_RESULTS);
  return raw ? JSON.parse(raw) : [];
}

export async function deleteResult(id: string): Promise<void> {
  const existing = await getSavedResults();
  const updated = existing.filter(r => r.id !== id);
  await AsyncStorage.setItem(KEYS.SAVED_RESULTS, JSON.stringify(updated));
}

export async function clearAllData(): Promise<void> {
  await AsyncStorage.multiRemove(Object.values(KEYS));
}

// 자주 받은 번호 통계
export async function getFrequentNumbers(): Promise<{ number: number; count: number }[]> {
  const results = await getSavedResults();
  const counts: Record<number, number> = {};
  results.forEach(r => {
    r.numbers.forEach(n => {
      counts[n] = (counts[n] || 0) + 1;
    });
  });
  return Object.entries(counts)
    .map(([n, count]) => ({ number: Number(n), count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

// 현재 로또 회차 계산 (2002년 12월 7일 1회차 기준)
export function getCurrentLottoRound(): number {
  const baseDate = new Date('2002-12-07');
  const today = new Date();
  const diffMs = today.getTime() - baseDate.getTime();
  const diffWeeks = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));
  return diffWeeks + 1;
}

export function formatDate(isoString: string): string {
  const d = new Date(isoString);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}
