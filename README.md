# 🦒 기래프 (Giraffe) - Frontend

> **"매일의 감정을 마주하고 기록하는 감성 지향형 AI 마인드케어 다이어리 '기래프'의 프론트엔드 & 모바일 하이브리드 어플리케이션 저장소입니다."**

<p align="center">
  <img src="https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/react-19.2-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB" alt="React" />
  <img src="https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/tailwindcss-v4-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="TailwindCSS" />
  <img src="https://img.shields.io/badge/Capacitor-v6-119EFF?style=for-the-badge&logo=Capacitor&logoColor=white" alt="Capacitor" />
</p>

---

## 🌟 프로젝트 소개 및 디자인 철학

**'기래프 (내가 그린 기분 그래프)'** 프론트엔드는 눈의 피로를 최소화하는 아늑한 모바일 전용 해상도(`max-w-md`) 규격 속에서 **반투명 아크릴 유리 효과(Glassmorphism)**와 미려한 감성 HSL 컬러 테마 전환을 결합하여 감성적인 힐링 터치 스크린을 선사합니다.

### 🎨 핵심 비주얼 테마 시스템
사용자의 실시간 테마 상태 및 라이트/다크모드에 맞춰 슬라이더 트랙, 달력, 차트, 아이콘의 색상이 역동적으로 재구성됩니다.
* **차분한 라벤더 (`lavender`)** / **따스한 선셋 (`sunset`)** / **싱그러운 초록 (`forest`)** / **따스한 밀크티 (`milktea`)**
* **`☀️ 포근한 낮` (Light)**: 우윳빛 반투명 크리스탈 카드 톤 
* **`🌙 차분한 밤` (Dark)**: 우주 먼지처럼 부드러운 오로라 네온 톤

---

## 🧭 화면별 핵심 기능 정의 및 컴포넌트

### 1. 📝 기-log 탭 (감정 기록 홈)
* **테마 반응형 슬라이더 (`MoodSlider.tsx`)**: 0~100 범위 조절 시 기분 구간에 맞춰 **5가지 얼굴 표정(😭, 🥱, 🌾, 🌿, ✨)**이 실시간 반응하며, 채워진 트랙 바와 슬라이더 핸들이 선택된 HSL 테마색으로 정확히 변경됩니다.
* **소급 입력 코지 달력**: 달력의 특정 날짜 클릭 시 **'기분 조각 타임머신' 모달**을 작동하여 과거 기분을 저장/수정/삭제 가능합니다.

### 2. 📊 나의 감정 트렌드 탭 (`/graph`)
* **기린 도식화 차트 (`MoodChart.tsx`)**: 7일 보기 시 차트의 꼭짓점에 기린 얼굴이 그려지며, 막대차트에서는 기분 점수 높이만큼 노란 기린의 목이 늘어납니다.
* **배포용 횡스크롤 모던 차트**: 30일/전체 기간 조회 시 기린 형상을 간소화하여 세련된 모던 차트로 변환하며, 30일 폭 고정 스케일을 유지한 채 부드럽게 좌우로 횡스크롤되는 지능형 뷰어를 구동합니다.

### 3. 🧠 AI 마음 클리닉 탭 (`/analysis`)
* **시간여행 캘린더**: 처방전을 남길 날짜를 선택(미래일자는 클릭 방어)하면 해당 날짜 아래에 리포트 마크(`📋`)가 꽂힙니다.
* **3줄 핵심 요약 및 아코디언**: 복잡한 AI 심층 진단 원문 텍스트를 바쁜 유저를 위해 **핵심 3줄 요약본**으로 자동 요약하여 노출하며, 토글을 눌러 전문을 읽을 수 있습니다.
* **AI 카운셀러 챗봇 & 호흡 가이드**: 챗봇이 한동재님의 과거 극복 성공 내역을 칭찬하며 친절하게 대화를 시작하며, 4초 심호흡 애니메이션이 연동됩니다.

### 4. 📋 처방 다이어리 탭 (`/report`)
* 역대 저장된 AI 자가진단 리포트가 시간 역순 타임라인으로 표시되며, 개별 카드는 정규식 파서에 의해 **실시간 3줄 요약본** 아코디언 컴포넌트로 깔끔하게 조회됩니다.

### 5. ⏳ 마음 타임캡슐 탭 (`/capsule`)
* **과거 편지**: 정확히 2일 전 내가 기록한 일기 회상.
* **미래 편지**: 1주일/1달 기간 잠금 격리 보관.
* **AI 위로 편지**: 통계 지수를 은유 기법으로 연출한 스토리텔링 편지 및 3대 마음 수치(회복력, 안정성, 낙관도) 차트 가시화.

---

## 🛠️ 개발 환경 구축 및 로컬 실행

### 1. 웹 프론트엔드 가동 방법
```bash
# 1. 패키지 설치
npm install

# 2. 로컬 웹 개발 서버 실행
npm run dev
```

### 2. 스마트폰 안드로이드 앱 빌드 및 구동 (Capacitor)
* **감정 기록 빌드 및 동기화**:
  ```bash
  npm run mobile:build
  ```
  * Next.js 어플리케이션을 라이브 DB 연동 상태로 정적 컴파일(`npm run build`)한 후, 그 결과 에셋을 `Giraph/android/` 에셋 폴더로 일괄 전송(`npx cap sync`)합니다.
* **안드로이드 스튜디오 실행**:
  ```bash
  npm run mobile:open:android
  ```
  * 안드로이드 스튜디오를 즉각 구동하여 가상 에뮬레이터나 실물 스마트폰에 원클릭으로 설치 및 무선 디버깅을 실행합니다.

---

## 📁 디렉토리 구조

```
Frontend/
├── src/
│   ├── app/                # Next.js App Router (각 탭 화면 라우터)
│   │   ├── globals.css     # 전역 모드(Light/Dark) & HSL 테마 CSS 토큰 변수
│   │   ├── page.tsx        # 기-log 탭 본체
│   │   ├── graph/          # 기래프 트렌드 탭
│   │   ├── analysis/       # AI 처방 자가진단 탭
│   │   ├── report/         # 역대 처방 다이어리 탭
│   │   └── capsule/        # 타임캡슐 감성 통계 탭
│   ├── components/         # 공유 UI 컴포넌트 (기린 SVG, 슬라이더 등)
│   └── lib/                # 데이터 서비스 계층 (supabase.ts, moodService.ts)
└── README.md               # 프론트엔드 소개서 (본 파일)
```
