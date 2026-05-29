# 🦒 기래프 (내가 그린 기분 그래프) - Frontend & App

---

## 🛠️ 사용 기술 스택 (Tech Stack)

### **Frontend & Client**
<p align="left">
  <img src="https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/react-19.2-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB" alt="React" />
  <img src="https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/tailwindcss-v4-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="TailwindCSS" />
</p>

- **Next.js (v15)** 및 **React (v19)**: 고해상도 모바일 모던 컴포넌트 모델 설계.
- **TypeScript**: 런타임 오류 제로 지향형 정적 타입 가드 바인딩.
- **Tailwind CSS (v4)**: 우윳빛 크리스탈 다크/라이트 테마의 글래스모피즘(Glassmorphism) 구현.
- **Recharts**: 기린 캐릭터 목 늘리기 모션이 탑재된 동적 차트 그래픽 구현.

### **Mobile Packaging**
<p align="left">
  <img src="https://img.shields.io/badge/Capacitor-v6-119EFF?style=for-the-badge&logo=Capacitor&logoColor=white" alt="Capacitor" />
  <img src="https://img.shields.io/badge/Android-3DDC84?style=for-the-badge&logo=android&logoColor=white" alt="Android" />
</p>

- **Capacitor (v6)**: 단일 프론트엔드 빌드 아티팩트를 안드로이드 스튜디오 네이티브 프로젝트로 랩핑하여 스마트폰 전용 무선 디버깅 및 APK 배포 최적화.

### **Cloud Backend Integration**
<p align="left">
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
</p>

- **Supabase JS Client**: 프론트엔드와 실시간 원격 DB를 직접 바인딩하여 복잡한 수동 서버 서버 컴퓨터 구축 없이 안정적인 저장소 아키텍처 실현.
- **Local-First Sync Engine**: 오프라인 상태 시 브라우저 `localStorage`에 자동 보존되며, 서버 접속 감지 시 실시간 동기화 병합 작동.

---

## 📁 디렉토리 구조 (Directory Tree)
프론트엔드 핵심 소스코드는 상위 감싸기 폴더 없이 **저장소 루트**에 다음과 같이 일목요연하게 설계되어 있습니다.

```
Frontend/ (프론트엔드 저장소 루트)
├── public/                  # 아이콘, 파비콘 및 기본 에셋 폴더
├── src/
│   ├── app/                 # Next.js App Router 기반 5대 탭 화면 라우터
│   │   ├── globals.css      # HSL 테마 CSS 토큰 및 전역 모드 설정
│   │   ├── layout.tsx       # 모바일 공통 레이아웃 및 뷰포트
│   │   ├── page.tsx         # [1] 기-log 기록 홈 화면 (테스트 세더 버튼 제외 완료)
│   │   ├── graph/           # [2] 기래프 트렌드 그래프 화면
│   │   ├── analysis/        # [3] AI 마음 클리닉 진단 화면
│   │   ├── help/            # [4] AI 마음 치유 챗봇 및 호흡 가이드 화면
│   │   └── report/          # [5] 역대 처방 다이어리 타임라인 화면
│   ├── components/          # 공통 UI 컴포넌트
│   │   ├── MoodSlider.tsx   # 감정 슬라이더 조절기
│   │   ├── MoodChart.tsx    # 기린 동적 그래프 컴포넌트
│   │   ├── GiraffeFace.tsx  # 감정별 기린 표정 애니메이션
│   │   ├── ChatInterface.tsx # AI 챗봇 컴포넌트
│   │   ├── AnalysisCard.tsx  # 리포트 요약 카드
│   │   └── BottomNav.tsx    # 반투명 하단 탭바
│   └── lib/                 # 핵심 데이터 핸들링 서비스 계층
│       ├── moodService.ts   # 온디바이스 회복 감지 알고리즘 및 CRUD 서비스
│       └── supabase.ts      # Supabase 실시간 연동 클라이언트 인스턴스
├── Giraph/                  # [Capacitor 모바일 어플리케이션 디렉토리]
│   ├── android/             # 안드로이드 스튜디오 배포 프로젝트 전체 코드
│   ├── capacitor.config.ts  # Capacitor 앱 메타데이터 및 에셋 매핑 설정
│   └── package.json         # 모바일 안드로이드 구동용 스크립트 정의
├── package.json             # 웹 및 모바일 통합 구동 스크립트 의존성 정의
├── tsconfig.json            # 모바일 서브폴더 체크 제외 및 컴파일러 설정
├── next.config.ts           # 모바일 배포용 정적 내보내기(Export) 최적화 설정
└── README.md                # 프론트엔드 공식 안내서 (본 파일)
```

# 2. 안드로이드 스튜디오 즉각 실행 및 실물 기기 설치 테스트
npm run mobile:open:android
```
안드로이드 스튜디오가 실행되면 기기가 연결된 상태에서 단축키 `Shift + F10` 혹은 상단 재생 버튼을 누르시면 연결된 스마트폰에 **"기래프 (내가 그린 기분 그래프)"** 모바일 정식 앱이 즉시 컴파일되어 완벽하게 설치 및 구동됩니다.
