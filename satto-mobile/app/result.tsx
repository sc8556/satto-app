import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  Animated, Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Colors, Fonts, Radius, Spacing } from '../constants/theme';
import { getUserProfile } from '../utils/storage';
import { saveResult, getCurrentLottoRound } from '../utils/storage';
import { calculateSajuWeights } from '../utils/sajeEngine';
import { generateAllCombinations, LottoResult, getBallColor } from '../utils/lottoEngine';
import FortuneScore from '../components/FortuneScore';
import LottoNumberBall from '../components/LottoNumberBall';


export default function ResultScreen() {
  const [results, setResults] = useState<LottoResult[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [fortuneScore, setFortuneScore] = useState(0);
  const [fortuneData, setFortuneData] = useState<{
    luckyColor: string;
    luckyKeyword: string;
    recommendedHour: string;
    element: string;
  } | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    const init = async () => {
      const p = await getUserProfile();
      if (!p) { router.back(); return; }

      const weights = calculateSajuWeights({
        birthYear: p.birthYear,
        birthMonth: p.birthMonth,
        birthDay: p.birthDay,
        birthHour: p.birthHour,
        gender: p.gender,
        isLunar: p.isLunar,
      });

      const combos = generateAllCombinations(weights, p.birthYear, p.birthMonth, p.birthDay);
      setResults(combos);
      setFortuneScore(weights.dayFortune);
      setFortuneData({
        luckyColor: weights.luckyColor,
        luckyKeyword: weights.luckyKeyword,
        recommendedHour: weights.recommendedHour,
        element: weights.element,
      });
      setLoading(false);

      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
      ]).start();
    };
    init();
  }, []);

  const handleSave = async () => {
    if (saved) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const r = results[activeIdx];
    await saveResult({
      numbers: r.numbers,
      bonus: r.bonus,
      label: r.label,
      description: r.description,
      fortuneMessage: r.fortuneMessage,
      fortuneScore,
      luckyKeyword: fortuneData?.luckyKeyword || '',
      luckyColor: fortuneData?.luckyColor || '',
      recommendedHour: fortuneData?.recommendedHour || '',
      lottoRound: getCurrentLottoRound(),
    });
    setSaved(true);
  };

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const r = results[activeIdx];
    const text = `🎰 사또 - 내 사주 로또 번호\n\n📌 ${r.label}\n✨ ${r.numbers.join(' • ')}  +  ${r.bonus}\n\n${r.fortuneMessage}\n\n복권운 ${fortuneScore}점 | 행운 키워드: ${fortuneData?.luckyKeyword}\n\n본 서비스는 오락 및 참고용입니다.`;
    await Share.share({ message: text });
  };

  const handleTabChange = (idx: number) => {
    if (idx === activeIdx) return;
    Haptics.selectionAsync();
    setActiveIdx(idx);
    // 슬라이드 애니메이션
    slideAnim.setValue(20);
    fadeAnim.setValue(0.5);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: Colors.gold.primary, fontSize: 24 }}>번호 계산 중...</Text>
      </View>
    );
  }

  const current = results[activeIdx];
  const round = getCurrentLottoRound();

  return (
    <LinearGradient colors={[Colors.bg.primary, '#0A1520']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>번호 추천 결과</Text>
          <Text style={styles.roundBadge}>{round}회차</Text>
        </View>

        {/* 복권운 */}
        <View style={styles.section}>
          <FortuneScore score={fortuneScore} />
        </View>

        {/* 조합 탭 */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll}>
          <View style={styles.tabs}>
            {results.map((r, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.tab, activeIdx === i && styles.tabActive]}
                onPress={() => handleTabChange(i)}
              >
                <Text style={[styles.tabText, activeIdx === i && styles.tabTextActive]}>
                  {r.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* 메인 번호 카드 */}
        <Animated.View
          style={[
            styles.mainCard,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <LinearGradient
            colors={['#1A2E45', '#0F2030']}
            style={styles.mainCardInner}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.labelRow}>
              <View style={styles.labelBadge}>
                <Text style={styles.labelBadgeText}>{current.label}</Text>
              </View>
              {saved && <Text style={styles.savedBadge}>✓ 저장됨</Text>}
            </View>

            {/* 번호 공 */}
            <View style={styles.ballsRow}>
              {current.numbers.map((n, i) => (
                <LottoNumberBall key={i} number={n} size="lg" />
              ))}
            </View>
            <View style={styles.bonusRow}>
              <Text style={styles.bonusLabel}>보너스</Text>
              <LottoNumberBall number={current.bonus} size="md" isBonus />
            </View>
          </LinearGradient>
        </Animated.View>

        {/* 해석 블록 */}
        <View style={styles.section}>
          <InterpretCard
            title="추천 이유"
            content={current.description}
            icon="💫"
          />
          <InterpretCard
            title="오늘의 운세"
            content={current.fortuneMessage}
            icon="🔮"
          />
          <InterpretCard
            title="피해야 할 기운"
            content={current.avoidNote}
            icon="⚠️"
          />
        </View>

        {/* 행운 정보 */}
        {fortuneData && (
          <View style={styles.luckyRow}>
            <LuckyItem icon="🎨" label="행운 색상" value={fortuneData.luckyColor} />
            <LuckyItem icon="✨" label="행운 키워드" value={fortuneData.luckyKeyword} />
            <LuckyItem icon="⏰" label="추천 구매 시간" value={fortuneData.recommendedHour} />
          </View>
        )}

        {/* 버튼 */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.saveBtn, saved && styles.saveBtnDone]}
            onPress={handleSave}
          >
            <Text style={styles.saveBtnText}>{saved ? '✓ 저장됨' : '저장하기'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
            <LinearGradient
              colors={Colors.gold.gradient as [string, string]}
              style={styles.shareBtnGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.shareBtnText}>공유하기</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* 면책 고지 */}
        <Text style={styles.disclaimer}>
          본 서비스는 오락 및 참고용 콘텐츠입니다.{'\n'}
          특정 당첨 결과를 보장하지 않으며, 복권 구매 여부는 사용자 본인의 판단입니다.
        </Text>
      </ScrollView>
    </LinearGradient>
  );
}

function InterpretCard({ title, content, icon }: { title: string; content: string; icon: string }) {
  return (
    <View style={styles.interpretCard}>
      <View style={styles.interpretHeader}>
        <Text style={styles.interpretIcon}>{icon}</Text>
        <Text style={styles.interpretTitle}>{title}</Text>
      </View>
      <Text style={styles.interpretContent}>{content}</Text>
    </View>
  );
}

function LuckyItem({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.luckyItem}>
      <Text style={styles.luckyIcon}>{icon}</Text>
      <Text style={styles.luckyLabel}>{label}</Text>
      <Text style={styles.luckyValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: 56,
    paddingBottom: Spacing.md,
    gap: 12,
  },
  backBtn: { padding: 4 },
  backIcon: { color: Colors.text.primary, fontSize: 22 },
  headerTitle: { flex: 1, color: Colors.text.primary, fontSize: Fonts.sizes.lg, fontWeight: Fonts.weights.bold },
  roundBadge: {
    color: Colors.text.muted,
    fontSize: Fonts.sizes.xs,
    backgroundColor: Colors.bg.card,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  section: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.md },
  // 탭
  tabsScroll: { marginBottom: Spacing.md },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bg.card,
  },
  tabActive: { borderColor: Colors.gold.primary, backgroundColor: 'rgba(212,168,67,0.15)' },
  tabText: { color: Colors.text.muted, fontSize: Fonts.sizes.xs, fontWeight: Fonts.weights.medium },
  tabTextActive: { color: Colors.gold.primary, fontWeight: Fonts.weights.semibold },
  // 메인 카드
  mainCard: { marginHorizontal: Spacing.lg, marginBottom: Spacing.md },
  mainCardInner: {
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: Spacing.lg,
  },
  labelBadge: {
    backgroundColor: 'rgba(212,168,67,0.15)',
    borderWidth: 1,
    borderColor: Colors.gold.primary,
    borderRadius: Radius.full,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  labelBadgeText: { color: Colors.gold.primary, fontSize: Fonts.sizes.sm, fontWeight: Fonts.weights.semibold },
  savedBadge: { color: Colors.fortune.high, fontSize: Fonts.sizes.sm },
  ballsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: Spacing.lg,
  },
  bonusRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  bonusLabel: { color: Colors.text.muted, fontSize: Fonts.sizes.xs },
  // 해석
  interpretCard: {
    backgroundColor: Colors.bg.card,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 10,
  },
  interpretHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  interpretIcon: { fontSize: 16 },
  interpretTitle: { color: Colors.gold.primary, fontSize: Fonts.sizes.sm, fontWeight: Fonts.weights.semibold },
  interpretContent: {
    color: Colors.text.secondary,
    fontSize: Fonts.sizes.sm,
    lineHeight: 20,
  },
  // 행운 정보
  luckyRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    gap: 10,
    marginBottom: Spacing.lg,
  },
  luckyItem: {
    flex: 1,
    backgroundColor: Colors.bg.card,
    borderRadius: Radius.md,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    gap: 4,
  },
  luckyIcon: { fontSize: 20 },
  luckyLabel: { color: Colors.text.muted, fontSize: 9, textAlign: 'center' },
  luckyValue: { color: Colors.text.primary, fontSize: Fonts.sizes.xs, fontWeight: Fonts.weights.semibold, textAlign: 'center' },
  // 액션
  actionRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    gap: 12,
    marginBottom: Spacing.md,
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.gold.primary,
    alignItems: 'center',
  },
  saveBtnDone: { borderColor: Colors.fortune.high },
  saveBtnText: { color: Colors.gold.primary, fontSize: Fonts.sizes.md, fontWeight: Fonts.weights.semibold },
  shareBtn: { flex: 1, borderRadius: Radius.lg, overflow: 'hidden' },
  shareBtnGradient: { paddingVertical: 16, alignItems: 'center' },
  shareBtnText: { color: '#0D1B2A', fontSize: Fonts.sizes.md, fontWeight: Fonts.weights.bold },
  disclaimer: {
    color: Colors.text.muted,
    fontSize: Fonts.sizes.xs,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
  },
});
