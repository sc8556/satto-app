import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, FlatList,
  Alert, RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Colors, Fonts, Radius, Spacing } from '../constants/theme';
import { getSavedResults, deleteResult, getFrequentNumbers, formatDate, SavedResult } from '../utils/storage';
import { getBallColor } from '../utils/lottoEngine';

export default function HistoryScreen() {
  const [results, setResults] = useState<SavedResult[]>([]);
  const [frequentNums, setFrequentNums] = useState<{ number: number; count: number }[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    const r = await getSavedResults();
    const f = await getFrequentNumbers();
    setResults(r);
    setFrequentNums(f);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleDelete = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('삭제', '이 추천 기록을 삭제할까요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제', style: 'destructive', onPress: async () => {
          await deleteResult(id);
          loadData();
        }
      },
    ]);
  };

  return (
    <LinearGradient colors={[Colors.bg.primary, '#0A1520']} style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>추천 히스토리</Text>
        <Text style={styles.count}>{results.length}개</Text>
      </View>

      {/* 자주 받은 번호 */}
      {frequentNums.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⭐ 자주 받은 번호</Text>
          <View style={styles.frequentRow}>
            {frequentNums.slice(0, 7).map(({ number, count }) => (
              <View key={number} style={styles.frequentItem}>
                <View style={[styles.freqBall, { backgroundColor: getBallColor(number) }]}>
                  <Text style={styles.freqBallText}>{number}</Text>
                </View>
                <Text style={styles.freqCount}>{count}회</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* 결과 목록 */}
      {results.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={styles.emptyText}>저장된 번호가 없어요</Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={() => router.replace('/')}>
            <Text style={styles.emptyBtnText}>번호 추천받기</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.gold.primary} />
          }
          renderItem={({ item }) => (
            <ResultItem item={item} onDelete={() => handleDelete(item.id)} />
          )}
        />
      )}
    </LinearGradient>
  );
}

function ResultItem({ item, onDelete }: { item: SavedResult; onDelete: () => void }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.cardDate}>{formatDate(item.date)}</Text>
          {item.lottoRound && (
            <Text style={styles.cardRound}>{item.lottoRound}회차</Text>
          )}
        </View>
        <View style={styles.cardRight}>
          <View style={styles.cardLabelBadge}>
            <Text style={styles.cardLabelText}>{item.label}</Text>
          </View>
          <TouchableOpacity onPress={onDelete} style={styles.deleteBtn}>
            <Text style={styles.deleteIcon}>✕</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.numbersRow}>
        {item.numbers.map((n, i) => (
          <View key={i} style={[styles.numBall, { backgroundColor: getBallColor(n) }]}>
            <Text style={styles.numText}>{n}</Text>
          </View>
        ))}
        <Text style={styles.plus}>+</Text>
        <View style={[styles.numBall, { backgroundColor: '#C084FC' }]}>
          <Text style={styles.numText}>{item.bonus}</Text>
        </View>
      </View>

      <Text style={styles.cardMessage} numberOfLines={2}>{item.fortuneMessage}</Text>

      <View style={styles.cardFooter}>
        <View style={styles.scoreRow}>
          <Text style={styles.scoreLabel}>복권운</Text>
          <Text style={[styles.scoreVal, { color: getScoreColor(item.fortuneScore) }]}>
            {item.fortuneScore}점
          </Text>
        </View>
        <Text style={styles.cardKeyword}>✨ {item.luckyKeyword}</Text>
      </View>
    </View>
  );
}

function getScoreColor(s: number): string {
  if (s >= 70) return Colors.fortune.high;
  if (s >= 45) return Colors.fortune.mid;
  return Colors.fortune.low;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  title: { flex: 1, color: Colors.text.primary, fontSize: Fonts.sizes.lg, fontWeight: Fonts.weights.bold },
  count: { color: Colors.text.muted, fontSize: Fonts.sizes.sm },
  // 자주 받은 번호
  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    color: Colors.text.secondary,
    fontSize: Fonts.sizes.sm,
    fontWeight: Fonts.weights.semibold,
    marginBottom: 10,
  },
  frequentRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  frequentItem: { alignItems: 'center', gap: 4 },
  freqBall: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  freqBallText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  freqCount: { color: Colors.text.muted, fontSize: 9 },
  // 빈 상태
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  emptyIcon: { fontSize: 48 },
  emptyText: { color: Colors.text.secondary, fontSize: Fonts.sizes.md },
  emptyBtn: {
    backgroundColor: Colors.gold.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: Radius.lg,
  },
  emptyBtnText: { color: '#0D1B2A', fontWeight: Fonts.weights.bold, fontSize: Fonts.sizes.md },
  // 목록
  list: { paddingHorizontal: Spacing.lg, paddingBottom: 40, gap: 12 },
  // 카드
  card: {
    backgroundColor: Colors.bg.card,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardDate: { color: Colors.text.primary, fontSize: Fonts.sizes.sm, fontWeight: Fonts.weights.medium },
  cardRound: { color: Colors.text.muted, fontSize: Fonts.sizes.xs },
  cardRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardLabelBadge: {
    backgroundColor: 'rgba(212,168,67,0.1)',
    borderWidth: 1,
    borderColor: Colors.gold.dark,
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  cardLabelText: { color: Colors.gold.primary, fontSize: 10, fontWeight: Fonts.weights.semibold },
  deleteBtn: { padding: 4 },
  deleteIcon: { color: Colors.text.muted, fontSize: 14 },
  // 번호
  numbersRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  numBall: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  numText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  plus: { color: Colors.text.muted, fontSize: 12 },
  // 메시지
  cardMessage: {
    color: Colors.text.secondary,
    fontSize: Fonts.sizes.xs,
    lineHeight: 16,
  },
  // 푸터
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  scoreLabel: { color: Colors.text.muted, fontSize: Fonts.sizes.xs },
  scoreVal: { fontSize: Fonts.sizes.sm, fontWeight: Fonts.weights.semibold },
  cardKeyword: { color: Colors.text.muted, fontSize: Fonts.sizes.xs },
});
