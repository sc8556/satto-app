import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Colors, Fonts, Radius, Spacing } from '../constants/theme';
import { getUserProfile, getSavedResults, hasOnboarded, getCurrentLottoRound, formatDate, UserProfile, SavedResult } from '../utils/storage';
import { calculateSajuWeights } from '../utils/sajeEngine';
import { generateLottoNumbers } from '../utils/lottoEngine';
import LottoCard from '../components/LottoCard';
import FortuneScore from '../components/FortuneScore';

export default function HomeScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [recentResult, setRecentResult] = useState<SavedResult | null>(null);
  const [fortuneScore, setFortuneScore] = useState(0);
  const [luckyKeyword, setLuckyKeyword] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    const onboarded = await hasOnboarded();
    if (!onboarded) {
      router.replace('/onboarding');
      return;
    }
    const p = await getUserProfile();
    const results = await getSavedResults();
    setProfile(p);
    setRecentResult(results[0] || null);

    if (p) {
      const weights = calculateSajuWeights({
        birthYear: p.birthYear,
        birthMonth: p.birthMonth,
        birthDay: p.birthDay,
        birthHour: p.birthHour,
        gender: p.gender,
        isLunar: p.isLunar,
      });
      setFortuneScore(weights.dayFortune);
      setLuckyKeyword(weights.luckyKeyword);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleRecommend = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/result');
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: Colors.gold.primary, fontSize: 24, fontWeight: '800' }}>사또</Text>
      </View>
    );
  }

  const round = getCurrentLottoRound();
  const today = new Date();
  const weekday = ['일', '월', '화', '수', '목', '금', '토'][today.getDay()];

  return (
    <LinearGradient colors={[Colors.bg.primary, '#0A1520']} style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.gold.primary} />}
      >
        {/* 상단 헤더 */}
        <View style={styles.topBar}>
          <View>
            <Text style={styles.logo}>사또</Text>
            <Text style={styles.dateText}>
              {today.getMonth() + 1}월 {today.getDate()}일 ({weekday})  •  {round}회차
            </Text>
          </View>
          <TouchableOpacity style={styles.settingsBtn} onPress={() => router.push('/settings')}>
            <Text style={styles.settingsIcon}>⚙</Text>
          </TouchableOpacity>
        </View>

        {/* 복권운 카드 */}
        <LinearGradient
          colors={['#1A2E45', '#162540']}
          style={styles.fortuneCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.fortuneHeader}>
            <Text style={styles.fortuneTitle}>✨ 이번 주 행운 키워드</Text>
            <View style={styles.keywordBadge}>
              <Text style={styles.keywordText}>{luckyKeyword}</Text>
            </View>
          </View>
          <FortuneScore score={fortuneScore} />
        </LinearGradient>

        {/* 메인 추천 버튼 */}
        <TouchableOpacity onPress={handleRecommend} activeOpacity={0.85}>
          <LinearGradient
            colors={Colors.gold.gradient as [string, string]}
            style={styles.recommendBtn}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.recommendIcon}>🎰</Text>
            <View>
              <Text style={styles.recommendTitle}>내 사주 번호 추천받기</Text>
              <Text style={styles.recommendSub}>{round}회차 번호를 뽑아보세요</Text>
            </View>
            <Text style={styles.recommendArrow}>→</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* 최근 추천 */}
        {recentResult && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>최근 추천</Text>
              <TouchableOpacity onPress={() => router.push('/history')}>
                <Text style={styles.seeAll}>전체 보기</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.recentCard}>
              <Text style={styles.recentDate}>{formatDate(recentResult.date)}</Text>
              <View style={styles.recentNumbers}>
                {recentResult.numbers.map((n, i) => (
                  <View key={i} style={[styles.miniNum, { backgroundColor: getMiniColor(n) }]}>
                    <Text style={styles.miniNumText}>{n}</Text>
                  </View>
                ))}
                <Text style={styles.miniPlus}>+</Text>
                <View style={[styles.miniNum, { backgroundColor: '#C084FC' }]}>
                  <Text style={styles.miniNumText}>{recentResult.bonus}</Text>
                </View>
              </View>
              <Text style={styles.recentLabel}>{recentResult.label}</Text>
            </View>
          </View>
        )}

        {/* 하단 탭 */}
        <View style={styles.tabBar}>
          <TabBtn icon="🏠" label="홈" active onPress={() => {}} />
          <TabBtn icon="📋" label="히스토리" onPress={() => router.push('/history')} />
          <TabBtn icon="⚙" label="설정" onPress={() => router.push('/settings')} />
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

function TabBtn({ icon, label, active, onPress }: {
  icon: string; label: string; active?: boolean; onPress: () => void
}) {
  return (
    <TouchableOpacity style={styles.tabBtn} onPress={onPress}>
      <Text style={[styles.tabIcon, active && { opacity: 1 }]}>{icon}</Text>
      <Text style={[styles.tabLabel, active && { color: Colors.gold.primary }]}>{label}</Text>
    </TouchableOpacity>
  );
}

function getMiniColor(n: number): string {
  if (n <= 10) return '#F7B731';
  if (n <= 20) return '#4A90D9';
  if (n <= 30) return '#E8453C';
  if (n <= 40) return '#8E9AAA';
  return '#43B97F';
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 90 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: 60,
    paddingBottom: Spacing.md,
  },
  logo: { fontSize: 28, fontWeight: '800', color: Colors.gold.primary, letterSpacing: 2 },
  dateText: { color: Colors.text.muted, fontSize: Fonts.sizes.xs, marginTop: 2 },
  settingsBtn: { padding: 8 },
  settingsIcon: { fontSize: 22, color: Colors.text.secondary },
  // 복권운 카드
  fortuneCard: {
    marginHorizontal: Spacing.lg,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  fortuneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  fortuneTitle: { color: Colors.text.secondary, fontSize: Fonts.sizes.sm, fontWeight: Fonts.weights.medium },
  keywordBadge: {
    backgroundColor: 'rgba(212,168,67,0.15)',
    borderWidth: 1,
    borderColor: Colors.gold.primary,
    borderRadius: Radius.full,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  keywordText: { color: Colors.gold.primary, fontSize: Fonts.sizes.xs, fontWeight: Fonts.weights.semibold },
  // 추천 버튼
  recommendBtn: {
    marginHorizontal: Spacing.lg,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: Spacing.lg,
  },
  recommendIcon: { fontSize: 32 },
  recommendTitle: { color: '#0D1B2A', fontSize: Fonts.sizes.md, fontWeight: Fonts.weights.bold },
  recommendSub: { color: 'rgba(13,27,42,0.6)', fontSize: Fonts.sizes.xs },
  recommendArrow: { marginLeft: 'auto', fontSize: 20, color: '#0D1B2A', fontWeight: '800' },
  // 섹션
  section: { marginHorizontal: Spacing.lg, marginBottom: Spacing.lg },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { color: Colors.text.primary, fontSize: Fonts.sizes.md, fontWeight: Fonts.weights.semibold },
  seeAll: { color: Colors.gold.primary, fontSize: Fonts.sizes.xs },
  // 최근 추천 카드
  recentCard: {
    backgroundColor: Colors.bg.card,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  recentDate: { color: Colors.text.muted, fontSize: Fonts.sizes.xs, marginBottom: 10 },
  recentNumbers: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  miniNum: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  miniNumText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  miniPlus: { color: Colors.text.muted, fontSize: 12 },
  recentLabel: { color: Colors.text.muted, fontSize: Fonts.sizes.xs },
  // 탭바
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: Colors.bg.secondary,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingBottom: 20,
    paddingTop: 10,
  },
  tabBtn: { flex: 1, alignItems: 'center', gap: 4 },
  tabIcon: { fontSize: 20, opacity: 0.5 },
  tabLabel: { color: Colors.text.muted, fontSize: 10, fontWeight: Fonts.weights.medium },
});
