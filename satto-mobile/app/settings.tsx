import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Colors, Fonts, Radius, Spacing } from '../constants/theme';
import { getUserProfile, clearAllData, UserProfile } from '../utils/storage';

export default function SettingsScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    getUserProfile().then(setProfile);
  }, []);

  const handleEditProfile = () => {
    Alert.alert(
      '정보 수정',
      '사주 정보를 다시 입력하시겠어요?',
      [
        { text: '취소', style: 'cancel' },
        { text: '확인', onPress: () => router.replace('/onboarding') },
      ]
    );
  };

  const handleClearData = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert(
      '데이터 초기화',
      '저장된 모든 번호와 프로필이 삭제됩니다.\n이 작업은 되돌릴 수 없어요.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '초기화', style: 'destructive', onPress: async () => {
            await clearAllData();
            router.replace('/onboarding');
          }
        },
      ]
    );
  };

  const genderLabel = profile?.gender === 'male' ? '남성' : profile?.gender === 'female' ? '여성' : '-';
  const calLabel = profile?.isLunar ? '음력' : '양력';

  return (
    <LinearGradient colors={[Colors.bg.primary, '#0A1520']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>설정</Text>
        </View>

        {/* 프로필 카드 */}
        {profile && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>내 사주 정보</Text>
            <TouchableOpacity style={styles.profileCard} onPress={handleEditProfile} activeOpacity={0.7}>
              <LinearGradient
                colors={['#1A2E45', '#0F2030']}
                style={styles.profileCardInner}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.profileIconWrap}>
                  <Text style={styles.profileIcon}>{profile.gender === 'male' ? '♂' : '♀'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.profileName}>
                    {profile.birthYear}년 {profile.birthMonth}월 {profile.birthDay}일 ({calLabel})
                  </Text>
                  <Text style={styles.profileSub}>
                    {genderLabel}  •  {profile.birthHour === null ? '시간 모름' : `${profile.birthHour}시`}
                  </Text>
                </View>
                <Text style={styles.editArrow}>수정 →</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* 앱 정보 */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>앱 정보</Text>
          <View style={styles.menuList}>
            <MenuItem
              icon="📱"
              label="앱 버전"
              value="1.0.0"
            />
            <MenuItem
              icon="🎰"
              label="서비스 소개"
              value="사주 기반 번호 추천"
            />
          </View>
        </View>

        {/* 법적 고지 */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>법적 고지</Text>
          <View style={styles.disclaimerCard}>
            <Text style={styles.disclaimerTitle}>⚖️ 서비스 면책 고지</Text>
            <Text style={styles.disclaimerText}>
              본 서비스 '사또'는 오락 및 참고용 콘텐츠입니다.{'\n\n'}
              • 특정 당첨 결과를 보장하지 않습니다.{'\n'}
              • 복권 구매 및 사용 판단의 책임은 사용자 본인에게 있습니다.{'\n'}
              • 사주 해석은 전통 방식을 참고한 엔터테인먼트 콘텐츠입니다.{'\n'}
              • 실제 금전 베팅 기능은 제공하지 않습니다.{'\n\n'}
              건강하고 즐거운 방식으로 이용해 주세요.
            </Text>
          </View>
        </View>

        {/* 개인정보 원칙 */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>개인정보 처리</Text>
          <View style={styles.privacyCard}>
            <Text style={styles.privacyItem}>• 출생 정보는 기기 내 로컬 저장소에만 저장됩니다</Text>
            <Text style={styles.privacyItem}>• 서버에 개인정보를 전송하지 않습니다</Text>
            <Text style={styles.privacyItem}>• 언제든지 데이터를 초기화할 수 있습니다</Text>
          </View>
        </View>

        {/* 위험 구역 */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: Colors.fortune.low }]}>데이터 관리</Text>
          <TouchableOpacity style={styles.dangerBtn} onPress={handleClearData}>
            <Text style={styles.dangerBtnText}>⚠ 모든 데이터 초기화</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.copyright}>
          사또 (Satto) ©2024{'\n'}
          내 사주 흐름으로 뽑는, 가장 개인적인 로또 번호
        </Text>
      </ScrollView>
    </LinearGradient>
  );
}

function MenuItem({ icon, label, value }: { icon: string; label: string; value?: string }) {
  return (
    <View style={styles.menuItem}>
      <Text style={styles.menuIcon}>{icon}</Text>
      <Text style={styles.menuLabel}>{label}</Text>
      {value && <Text style={styles.menuValue}>{value}</Text>}
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
  title: { color: Colors.text.primary, fontSize: Fonts.sizes.lg, fontWeight: Fonts.weights.bold },
  // 섹션
  section: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.lg },
  sectionLabel: {
    color: Colors.text.muted,
    fontSize: Fonts.sizes.xs,
    fontWeight: Fonts.weights.semibold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  // 프로필 카드
  profileCard: { borderRadius: Radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border },
  profileCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: 12,
  },
  profileIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(212,168,67,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileIcon: { fontSize: 22 },
  profileName: { color: Colors.text.primary, fontSize: Fonts.sizes.md, fontWeight: Fonts.weights.medium },
  profileSub: { color: Colors.text.muted, fontSize: Fonts.sizes.xs, marginTop: 2 },
  editArrow: { color: Colors.gold.primary, fontSize: Fonts.sizes.xs },
  // 메뉴
  menuList: {
    backgroundColor: Colors.bg.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuIcon: { fontSize: 18 },
  menuLabel: { flex: 1, color: Colors.text.primary, fontSize: Fonts.sizes.md },
  menuValue: { color: Colors.text.muted, fontSize: Fonts.sizes.sm },
  // 면책
  disclaimerCard: {
    backgroundColor: 'rgba(26,46,69,0.8)',
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  disclaimerTitle: {
    color: Colors.gold.primary,
    fontSize: Fonts.sizes.sm,
    fontWeight: Fonts.weights.semibold,
    marginBottom: 10,
  },
  disclaimerText: {
    color: Colors.text.secondary,
    fontSize: Fonts.sizes.xs,
    lineHeight: 20,
  },
  // 개인정보
  privacyCard: {
    backgroundColor: Colors.bg.card,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  privacyItem: { color: Colors.text.secondary, fontSize: Fonts.sizes.xs, lineHeight: 18 },
  // 위험 버튼
  dangerBtn: {
    borderWidth: 1,
    borderColor: Colors.fortune.low,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
  },
  dangerBtnText: { color: Colors.fortune.low, fontSize: Fonts.sizes.md, fontWeight: Fonts.weights.medium },
  copyright: {
    color: Colors.text.muted,
    fontSize: Fonts.sizes.xs,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
  },
});
