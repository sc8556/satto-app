import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  TextInput, Platform, KeyboardAvoidingView, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Colors, Fonts, Radius, Spacing } from '../constants/theme';
import { saveUserProfile, setOnboarded } from '../utils/storage';

const { width } = Dimensions.get('window');

type Step = 0 | 1 | 2 | 3;

interface FormState {
  birthYear: string;
  birthMonth: string;
  birthDay: string;
  birthHour: string | null; // null = 모름
  gender: 'male' | 'female' | null;
  isLunar: boolean;
}

const HOURS = [
  '모름', '자시(23~01)', '축시(01~03)', '인시(03~05)', '묘시(05~07)',
  '진시(07~09)', '사시(09~11)', '오시(11~13)', '미시(13~15)',
  '신시(15~17)', '유시(17~19)', '술시(19~21)', '해시(21~23)',
];

const HOUR_VALUES: (number | null)[] = [
  null, 0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22,
];

export default function OnboardingScreen() {
  const [step, setStep] = useState<Step>(0);
  const [form, setForm] = useState<FormState>({
    birthYear: '',
    birthMonth: '',
    birthDay: '',
    birthHour: null,
    gender: null,
    isLunar: false,
  });

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step < 3) setStep((step + 1) as Step);
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step > 0) setStep((step - 1) as Step);
  };

  const canProceed = (): boolean => {
    if (step === 0) return form.gender !== null;
    if (step === 1) {
      const y = parseInt(form.birthYear);
      const m = parseInt(form.birthMonth);
      const d = parseInt(form.birthDay);
      return y >= 1900 && y <= 2010 && m >= 1 && m <= 12 && d >= 1 && d <= 31;
    }
    if (step === 2) return true; // 시간은 선택 (모름 포함)
    return true;
  };

  const handleFinish = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await saveUserProfile({
      birthYear: parseInt(form.birthYear),
      birthMonth: parseInt(form.birthMonth),
      birthDay: parseInt(form.birthDay),
      birthHour: form.birthHour === null ? null : Number(form.birthHour),
      gender: form.gender!,
      isLunar: form.isLunar,
      createdAt: new Date().toISOString(),
    });
    await setOnboarded();
    router.replace('/');
  };

  return (
    <LinearGradient colors={[Colors.bg.primary, '#0A1520']} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* 헤더 */}
          <View style={styles.header}>
            <Text style={styles.logo}>사또</Text>
            <Text style={styles.subtitle}>내 사주 흐름으로 뽑는{'\n'}가장 개인적인 로또 번호</Text>
          </View>

          {/* 진행 표시 */}
          <View style={styles.steps}>
            {[0, 1, 2, 3].map(i => (
              <View
                key={i}
                style={[styles.stepDot, i <= step && styles.stepDotActive]}
              />
            ))}
          </View>

          {/* Step 0: 성별 */}
          {step === 0 && (
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>성별을 선택해주세요</Text>
              <Text style={styles.stepHint}>사주 계산에 사용됩니다</Text>
              <View style={styles.genderRow}>
                {(['male', 'female'] as const).map(g => (
                  <TouchableOpacity
                    key={g}
                    style={[styles.genderBtn, form.gender === g && styles.genderBtnActive]}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setForm({ ...form, gender: g });
                    }}
                  >
                    <Text style={styles.genderIcon}>{g === 'male' ? '♂' : '♀'}</Text>
                    <Text style={[styles.genderLabel, form.gender === g && styles.genderLabelActive]}>
                      {g === 'male' ? '남성' : '여성'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Step 1: 생년월일 */}
          {step === 1 && (
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>생년월일을 입력해주세요</Text>
              <View style={styles.calendarToggle}>
                {(['양력', '음력'] as const).map((label, i) => (
                  <TouchableOpacity
                    key={label}
                    style={[styles.toggleBtn, form.isLunar === (i === 1) && styles.toggleBtnActive]}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setForm({ ...form, isLunar: i === 1 });
                    }}
                  >
                    <Text style={[styles.toggleLabel, form.isLunar === (i === 1) && styles.toggleLabelActive]}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.dateRow}>
                <View style={styles.inputWrap}>
                  <TextInput
                    style={styles.input}
                    placeholder="년도"
                    placeholderTextColor={Colors.text.muted}
                    keyboardType="number-pad"
                    maxLength={4}
                    value={form.birthYear}
                    onChangeText={t => setForm({ ...form, birthYear: t })}
                  />
                  <Text style={styles.inputLabel}>년</Text>
                </View>
                <View style={styles.inputWrap}>
                  <TextInput
                    style={styles.input}
                    placeholder="월"
                    placeholderTextColor={Colors.text.muted}
                    keyboardType="number-pad"
                    maxLength={2}
                    value={form.birthMonth}
                    onChangeText={t => setForm({ ...form, birthMonth: t })}
                  />
                  <Text style={styles.inputLabel}>월</Text>
                </View>
                <View style={styles.inputWrap}>
                  <TextInput
                    style={styles.input}
                    placeholder="일"
                    placeholderTextColor={Colors.text.muted}
                    keyboardType="number-pad"
                    maxLength={2}
                    value={form.birthDay}
                    onChangeText={t => setForm({ ...form, birthDay: t })}
                  />
                  <Text style={styles.inputLabel}>일</Text>
                </View>
              </View>
            </View>
          )}

          {/* Step 2: 태어난 시간 */}
          {step === 2 && (
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>태어난 시간을 선택해주세요</Text>
              <Text style={styles.stepHint}>모르셔도 괜찮아요</Text>
              <View style={styles.hoursGrid}>
                {HOURS.map((label, i) => (
                  <TouchableOpacity
                    key={label}
                    style={[
                      styles.hourBtn,
                      form.birthHour === String(HOUR_VALUES[i]) && styles.hourBtnActive,
                      HOUR_VALUES[i] === null && form.birthHour === null && styles.hourBtnActive,
                    ]}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setForm({ ...form, birthHour: HOUR_VALUES[i] === null ? null : String(HOUR_VALUES[i]) });
                    }}
                  >
                    <Text style={[
                      styles.hourLabel,
                      (form.birthHour === String(HOUR_VALUES[i]) ||
                        (HOUR_VALUES[i] === null && form.birthHour === null)) && styles.hourLabelActive,
                    ]}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Step 3: 확인 */}
          {step === 3 && (
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>모든 준비가 완료됐어요!</Text>
              <Text style={styles.stepHint}>나만의 사주 로또 번호를 추천해 드릴게요</Text>
              <View style={styles.summaryCard}>
                <SummaryRow label="성별" value={form.gender === 'male' ? '남성' : '여성'} />
                <SummaryRow
                  label="생년월일"
                  value={`${form.birthYear}년 ${form.birthMonth}월 ${form.birthDay}일 (${form.isLunar ? '음력' : '양력'})`}
                />
                <SummaryRow
                  label="태어난 시간"
                  value={form.birthHour === null ? '모름' : HOURS[HOUR_VALUES.indexOf(Number(form.birthHour))]}
                />
              </View>
              <Text style={styles.disclaimer}>
                본 서비스는 오락 및 참고용 콘텐츠입니다.{'\n'}
                특정 당첨 결과를 보장하지 않습니다.
              </Text>
            </View>
          )}

          {/* 버튼 영역 */}
          <View style={styles.buttonRow}>
            {step > 0 && (
              <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
                <Text style={styles.backBtnText}>이전</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.nextBtn, !canProceed() && styles.nextBtnDisabled]}
              onPress={step === 3 ? handleFinish : handleNext}
              disabled={!canProceed()}
            >
              <LinearGradient
                colors={canProceed() ? Colors.gold.gradient as [string, string] : ['#2A3F57', '#2A3F57']}
                style={styles.nextBtnGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={[styles.nextBtnText, !canProceed() && styles.nextBtnTextDisabled]}>
                  {step === 3 ? '번호 추천 받기' : '다음'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, padding: Spacing.lg },
  header: { alignItems: 'center', marginTop: Spacing.xxl, marginBottom: Spacing.xl },
  logo: {
    fontSize: 48,
    fontWeight: '800',
    color: Colors.gold.primary,
    letterSpacing: 4,
    marginBottom: 12,
  },
  subtitle: {
    color: Colors.text.secondary,
    fontSize: Fonts.sizes.md,
    textAlign: 'center',
    lineHeight: 24,
  },
  steps: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: Spacing.xl,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  stepDotActive: { backgroundColor: Colors.gold.primary, width: 24 },
  stepContent: { flex: 1, marginBottom: Spacing.xl },
  stepTitle: {
    color: Colors.text.primary,
    fontSize: Fonts.sizes.xl,
    fontWeight: Fonts.weights.bold,
    marginBottom: 8,
  },
  stepHint: {
    color: Colors.text.muted,
    fontSize: Fonts.sizes.sm,
    marginBottom: Spacing.lg,
  },
  // 성별
  genderRow: { flexDirection: 'row', gap: 16, marginTop: Spacing.md },
  genderBtn: {
    flex: 1,
    aspectRatio: 1.2,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bg.card,
  },
  genderBtnActive: { borderColor: Colors.gold.primary, backgroundColor: 'rgba(212,168,67,0.1)' },
  genderIcon: { fontSize: 40, marginBottom: 8 },
  genderLabel: { color: Colors.text.secondary, fontSize: Fonts.sizes.lg, fontWeight: Fonts.weights.medium },
  genderLabelActive: { color: Colors.gold.primary, fontWeight: Fonts.weights.bold },
  // 양력/음력
  calendarToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.bg.card,
    borderRadius: Radius.md,
    padding: 4,
    marginBottom: Spacing.md,
    alignSelf: 'flex-start',
  },
  toggleBtn: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: Radius.sm,
  },
  toggleBtnActive: { backgroundColor: Colors.gold.primary },
  toggleLabel: { color: Colors.text.secondary, fontSize: Fonts.sizes.sm, fontWeight: Fonts.weights.medium },
  toggleLabelActive: { color: '#0D1B2A', fontWeight: Fonts.weights.bold },
  // 날짜 입력
  dateRow: { flexDirection: 'row', gap: 12 },
  inputWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4 },
  input: {
    flex: 1,
    backgroundColor: Colors.bg.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: 14,
    color: Colors.text.primary,
    fontSize: Fonts.sizes.lg,
    fontWeight: Fonts.weights.medium,
    textAlign: 'center',
  },
  inputLabel: { color: Colors.text.muted, fontSize: Fonts.sizes.sm },
  // 시간 선택
  hoursGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  hourBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bg.card,
  },
  hourBtnActive: { borderColor: Colors.gold.primary, backgroundColor: 'rgba(212,168,67,0.15)' },
  hourLabel: { color: Colors.text.secondary, fontSize: Fonts.sizes.xs, fontWeight: Fonts.weights.medium },
  hourLabelActive: { color: Colors.gold.primary },
  // 요약
  summaryCard: {
    backgroundColor: Colors.bg.card,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
    gap: 12,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { color: Colors.text.muted, fontSize: Fonts.sizes.sm },
  summaryValue: { color: Colors.text.primary, fontSize: Fonts.sizes.md, fontWeight: Fonts.weights.medium },
  disclaimer: {
    color: Colors.text.muted,
    fontSize: Fonts.sizes.xs,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 8,
  },
  // 버튼
  buttonRow: { flexDirection: 'row', gap: 12 },
  backBtn: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
  },
  backBtnText: { color: Colors.text.secondary, fontSize: Fonts.sizes.md, fontWeight: Fonts.weights.medium },
  nextBtn: { flex: 1, borderRadius: Radius.lg, overflow: 'hidden' },
  nextBtnDisabled: { opacity: 0.5 },
  nextBtnGradient: { paddingVertical: 16, alignItems: 'center' },
  nextBtnText: {
    color: '#0D1B2A',
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.bold,
  },
  nextBtnTextDisabled: { color: Colors.text.muted },
});
