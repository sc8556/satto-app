// 사또 앱 디자인 토큰 - 딥네이비, 골드, 크림 계열
export const Colors = {
  // 배경
  bg: {
    primary: '#0D1B2A',       // 딥 네이비 (메인 배경)
    secondary: '#112233',     // 약간 밝은 네이비
    card: '#1A2E45',          // 카드 배경
    overlay: 'rgba(13,27,42,0.92)',
  },
  // 포인트
  gold: {
    primary: '#D4A843',       // 골드 포인트
    light: '#F0C96B',
    dark: '#A67C32',
    gradient: ['#D4A843', '#F0C96B'],
  },
  // 크림/아이보리
  cream: {
    primary: '#F5EDD6',
    secondary: '#EDE0C4',
  },
  // 텍스트
  text: {
    primary: '#F5EDD6',       // 크림 (메인 텍스트)
    secondary: '#A8BDD4',     // 연한 블루그레이
    muted: '#5A7A99',
    gold: '#D4A843',
  },
  // 번호 공 색상 (로또 색상 기반)
  ball: {
    yellow: '#F7B731',        // 1~10
    blue: '#4A90D9',          // 11~20
    red: '#E8453C',           // 21~30
    gray: '#8E9AAA',          // 31~40
    green: '#43B97F',         // 41~45
  },
  // 운세 점수 색상
  fortune: {
    high: '#43B97F',
    mid: '#D4A843',
    low: '#E8453C',
  },
  border: '#2A3F57',
  transparent: 'transparent',
};

export const Fonts = {
  sizes: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 18,
    xl: 22,
    xxl: 28,
    xxxl: 36,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};
