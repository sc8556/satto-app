/**
 * 사주 기반 숫자 가중치 계산 엔진
 * 사주 정보를 바탕으로 번호 그룹별 가중치를 산출합니다.
 */

export type TianjinBranch = '자' | '축' | '인' | '묘' | '진' | '사' | '오' | '미' | '신' | '유' | '술' | '해';
export type HeavenlyStem = '갑' | '을' | '병' | '정' | '무' | '기' | '경' | '신' | '임' | '계';
export type Element = '목' | '화' | '토' | '금' | '수';

export interface SajuInput {
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  birthHour: number | null; // null = 모름
  gender: 'male' | 'female';
  isLunar: boolean;
}

export interface NumberWeights {
  // 1~45 각 번호의 가중치 (0.0 ~ 1.0)
  weights: number[];
  element: Element;
  favorableGroups: number[][];
  dayFortune: number; // 0~100 오늘의 복권운 점수
  luckyColor: string;
  luckyKeyword: string;
  recommendedHour: string;
}

// 천간 기반 오행 매핑
const stemElement: Record<HeavenlyStem, Element> = {
  갑: '목', 을: '목',
  병: '화', 정: '화',
  무: '토', 기: '토',
  경: '금', 신: '금',
  임: '수', 계: '수',
};

// 지지 기반 오행 매핑
const branchElement: Record<TianjinBranch, Element> = {
  자: '수', 축: '토', 인: '목', 묘: '목',
  진: '토', 사: '화', 오: '화', 미: '토',
  신: '금', 유: '금', 술: '토', 해: '수',
};

// 오행별 행운 색상
const elementColor: Record<Element, string> = {
  목: '초록',
  화: '빨강',
  토: '노랑',
  금: '흰색',
  수: '검정/파랑',
};

// 오행별 행운 키워드
const elementKeyword: Record<Element, string[]> = {
  목: ['성장', '새로운 시작', '생명력', '도전'],
  화: ['열정', '직감', '활기', '표현'],
  토: ['안정', '균형', '신뢰', '지속'],
  금: ['정확', '결단', '수확', '완성'],
  수: ['지혜', '흐름', '유연', '직관'],
};

// 오행별 추천 시간대
const elementHour: Record<Element, string> = {
  목: '오전 7~9시',
  화: '오후 1~3시',
  토: '오전 9~11시',
  금: '오후 3~5시',
  수: '오후 11시~오전 1시',
};

// 오행별 번호 그룹 가중치 성향
const elementNumberAffinity: Record<Element, number[]> = {
  목: [3, 4, 8, 9, 13, 14, 18, 19, 23, 24, 33, 38, 43],
  화: [2, 7, 12, 17, 22, 27, 32, 37, 42],
  토: [5, 10, 15, 20, 25, 30, 35, 40, 45],
  금: [4, 9, 14, 19, 24, 29, 34, 39, 44],
  수: [1, 6, 11, 16, 21, 26, 31, 36, 41],
};

function getStem(year: number): HeavenlyStem {
  const stems: HeavenlyStem[] = ['경', '신', '임', '계', '갑', '을', '병', '정', '무', '기'];
  return stems[year % 10];
}

function getBranch(year: number): TianjinBranch {
  const branches: TianjinBranch[] = ['신', '유', '술', '해', '자', '축', '인', '묘', '진', '사', '오', '미'];
  return branches[year % 12];
}

function getMonthElement(month: number): Element {
  const monthElements: Element[] = ['수', '목', '목', '화', '화', '토', '화', '토', '금', '금', '수', '수'];
  return monthElements[month - 1];
}

function getDayElement(day: number): Element {
  const elements: Element[] = ['목', '화', '토', '금', '수'];
  return elements[day % 5];
}

function calculateDayFortune(input: SajuInput, today: Date): number {
  const seed = (input.birthYear * 31 + input.birthMonth * 7 + input.birthDay * 3
    + today.getFullYear() * 13 + today.getMonth() * 5 + today.getDate() * 11)
    % 100;
  // 40~95 사이로 매핑 (너무 낮거나 너무 높지 않게)
  return 40 + Math.floor((seed / 100) * 55);
}

export function calculateSajuWeights(input: SajuInput): NumberWeights {
  const today = new Date();

  // 년간/지지 오행 계산
  const yearStem = getStem(input.birthYear);
  const yearBranch = getBranch(input.birthYear);
  const yearElement = stemElement[yearStem];
  const yearBranchElement = branchElement[yearBranch];

  // 월/일 오행
  const monthElement = getMonthElement(input.birthMonth);
  const dayElement = getDayElement(input.birthDay);

  // 오늘 날짜 기반 운 오행
  const todayElement = getDayElement(today.getDate());

  // 주도적인 오행 결정 (년지 60%, 월 20%, 일 20%)
  const elementScores: Record<Element, number> = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };
  elementScores[yearElement] += 3;
  elementScores[yearBranchElement] += 2;
  elementScores[monthElement] += 2;
  elementScores[dayElement] += 2;
  elementScores[todayElement] += 1;

  // 성별 보정 (음양)
  if (input.gender === 'male') {
    // 양: 목, 화, 토 강화
    elementScores['목'] += 1;
    elementScores['화'] += 1;
  } else {
    // 음: 금, 수 강화
    elementScores['금'] += 1;
    elementScores['수'] += 1;
  }

  // 주 오행 결정
  const dominantElement = (Object.entries(elementScores) as [Element, number][])
    .sort((a, b) => b[1] - a[1])[0][0];

  // 번호 가중치 계산 (1~45)
  const weights = new Array(45).fill(0.3); // 기본 가중치

  // 주 오행 번호군 강화
  const primaryNums = elementNumberAffinity[dominantElement];
  primaryNums.forEach(n => {
    if (n >= 1 && n <= 45) weights[n - 1] += 0.5;
  });

  // 보조 오행 (2위) 번호군 약하게 강화
  const secondElement = (Object.entries(elementScores) as [Element, number][])
    .sort((a, b) => b[1] - a[1])[1][0];
  const secondaryNums = elementNumberAffinity[secondElement];
  secondaryNums.forEach(n => {
    if (n >= 1 && n <= 45) weights[n - 1] += 0.2;
  });

  // 생일 날짜 기반 미세 조정
  const dayBonus = [input.birthDay, (input.birthDay + 6) % 45 + 1, (input.birthDay * 2) % 45 + 1];
  dayBonus.forEach(n => {
    if (n >= 1 && n <= 45) weights[n - 1] += 0.15;
  });

  // 월 기반 미세 조정
  const monthBonus = [input.birthMonth, input.birthMonth + 12, input.birthMonth + 24, input.birthMonth + 33];
  monthBonus.forEach(n => {
    if (n >= 1 && n <= 45) weights[n - 1] += 0.1;
  });

  // 가중치 정규화 (0.1 ~ 1.0 범위)
  const maxW = Math.max(...weights);
  const minW = Math.min(...weights);
  const normalizedWeights = weights.map(w =>
    0.1 + ((w - minW) / (maxW - minW)) * 0.9
  );

  // 오늘의 복권운 점수
  const dayFortune = calculateDayFortune(input, today);

  // 행운 키워드 (오늘 날짜 기반으로 변화)
  const keywords = elementKeyword[dominantElement];
  const keyword = keywords[today.getDate() % keywords.length];

  return {
    weights: normalizedWeights,
    element: dominantElement,
    favorableGroups: [primaryNums.slice(0, 6), secondaryNums.slice(0, 6)],
    dayFortune,
    luckyColor: elementColor[dominantElement],
    luckyKeyword: keyword,
    recommendedHour: elementHour[dominantElement],
  };
}
