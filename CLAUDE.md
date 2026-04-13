# 사또 (Satto) - Claude Code 작업 기록

## 프로젝트 개요

**앱명**: 사또 (사주 + 로또)  
**설명**: 사용자의 사주 정보를 입력받아 개인화된 로또 번호를 추천하고, 운세 해석·저장·공유 경험을 제공하는 모바일 앱  
**포지셔닝**: `내 사주 흐름으로 뽑는, 가장 개인적인 로또 번호`

## 기술 스택

| 항목 | 기술 |
|------|------|
| 프레임워크 | React Native + Expo SDK 54 |
| 언어 | TypeScript |
| 네비게이션 | expo-router (파일 기반 라우팅) |
| 로컬 저장소 | @react-native-async-storage/async-storage |
| UI | expo-linear-gradient, @expo/vector-icons |
| 햅틱 피드백 | expo-haptics |
| 공유 | React Native Share API |

## 디렉토리 구조

```
satto-mobile/
├── app/
│   ├── _layout.tsx       # expo-router 루트 레이아웃 (딥네이비 테마)
│   ├── index.tsx         # 홈 화면 (복권운, 추천 버튼, 최근 기록)
│   ├── onboarding.tsx    # 온보딩 4단계 입력 (성별→생년월일→시간→확인)
│   ├── result.tsx        # 번호 결과 화면 (4개 조합 탭, 해석, 저장/공유)
│   ├── history.tsx       # 추천 히스토리 + 자주 받은 번호 통계
│   └── settings.tsx      # 설정, 면책 고지, 데이터 초기화
├── components/
│   ├── LottoNumberBall.tsx  # 로또 번호 공 컴포넌트 (색상 자동 구분)
│   ├── LottoCard.tsx        # 번호 조합 카드 컴포넌트
│   └── FortuneScore.tsx     # 복권운 점수 바 (애니메이션)
├── constants/
│   └── theme.ts          # 딥네이비/골드/크림 디자인 토큰
└── utils/
    ├── sajeEngine.ts     # 사주 기반 번호 가중치 계산 (천간지지, 오행)
    ├── lottoEngine.ts    # 가중치 기반 번호 생성 (4가지 조합 타입)
    └── storage.ts        # AsyncStorage CRUD + 통계 유틸리티
```

## 핵심 구현 사항

### 1. 사주 엔진 (`utils/sajeEngine.ts`)
- 생년월일 → 천간(天干)/지지(地支) 오행 계산
- 년간/년지/월/일/오늘 날짜 오행에 가중치 부여
- 성별에 따른 음양 보정
- 1~45번 각 번호에 0.1~1.0 가중치 산출
- 오늘의 복권운 점수, 행운 색상/키워드/구매 시간대 제공

### 2. 로또 번호 엔진 (`utils/lottoEngine.ts`)
- 가중치 기반 비복원 샘플링 (LCG 알고리즘)
- 4가지 조합 타입: 재물기회형 / 안정상승형 / 직감몰림형 / 균형흐름형
- 날짜 기반 시드로 매일 다른 결과, 같은 날은 일관성 유지
- 번호 밸런싱 (홀짝 비율, 번호대 분포)

### 3. 화면 구성 (MVP 완료)
- **온보딩**: 4단계 단계형 입력, 양력/음력 선택, 모름 옵션 포함
- **홈**: 이번 주 복권운, 추천 버튼, 최근 저장 기록
- **결과**: 4개 조합 탭 스위칭, 운세 해석 블록, 행운 정보
- **히스토리**: 날짜별 저장 기록, 자주 받은 번호 Top 7
- **설정**: 프로필 수정, 서비스 면책 고지, 데이터 초기화

### 4. 디자인 시스템
- 배경: `#0D1B2A` 딥 네이비
- 포인트: `#D4A843` 골드 / `#F0C96B` 라이트 골드
- 텍스트: `#F5EDD6` 크림 아이보리
- 번호 공 색상: 1-10 노랑, 11-20 파랑, 21-30 빨강, 31-40 회색, 41-45 초록

## 법적/정책 사항

- **면책 고지 필수 포함**: 오락용 콘텐츠, 당첨 보장 없음, 사용자 책임
- 실제 복권 구매 연동 없음
- 개인정보 로컬 저장 우선 정책

## 실행 방법

```bash
cd satto-mobile
npm start           # Expo Go 앱으로 테스트
npm run android     # Android 빌드
npm run ios         # iOS 빌드 (Mac 필요)
npm run web         # 웹 브라우저 테스트
```

## 개발 우선순위 (기획서 섹션 16 기준)

- [x] 1. 사주 정보 입력 플로우
- [x] 2. 번호 추천 엔진 구조
- [x] 3. 결과 화면 카드 UI
- [x] 4. 저장 및 히스토리 기능
- [x] 5. 공유 기능 (네이티브 Share API)
- [ ] 6. 광고 보상 및 부분 유료 연동 (2차)
- [ ] 7. 푸시 알림 및 재방문 장치 (2차)

## 향후 작업 (2차)

- expo-notifications 기반 회차별 푸시 알림
- react-native-view-shot 기반 이미지 공유 카드
- 인앱 결제 (expo-iap) 연동
- 광고 보상 시스템 (AdMob)
- 애니메이션 강화 (react-native-reanimated)

---

*Claude Code로 구현됨 — 2024년 기획, 2026년 4월 빌드*
