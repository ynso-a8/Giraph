# 🦒 기래프 (내가 그린 기분 그래프) - Frontend & App

> **경북대학교 학우들의 마음 건강과 일상 스트레스 치유를 위한 실시간 AI 마인드케어 다이어리**
> 
> 
> ❝ 매일의 감정을 기린의 목처럼 가시화하고, 과거 극복 사례로 스스로 치유하는 시간 ❞
> 
> **더 이상 우울감에 방치되지 마세요!** 나만의 과거 회복 경험을 기반으로 한 똑똑한 처방을 만날 시간입니다👍
> 

---

## 🧭 프로젝트 개요
바쁜 대학 생활 속에서 매일같이 겪는 일상 스트레스, 불안감, 우울감을 방치하면 마음 건강에 심각한 적신호가 켜집니다. 기존 일기 앱들은 단순 텍스트 기록에 그치거나, 불필요하게 무겁고 사생활 보호가 취약한 단점이 있었습니다.

- 😭 **기분 변화의 원인 파악 어려움**: 내 기분이 언제 나아졌고, 무엇이 도움이 되었는지 흐름을 알아채기 힘듦.
- 📉 **시각적 흥미 결여**: 복잡한 그래프 분석은 보기에 지루하고 와닿지 않음.
- 🧠 **실질적 대안 부재**: 우울감에 대처하기 위한 나만의 행동 팁이나 AI 처방전이 부족함.
- 🔒 **개인정보 유출 우려**: 나의 가장 민감한 일기와 감정 정보가 외부 서버에 무방비하게 쌓임.

이러한 문제를 해결하기 위해,
경북대학교 학우들을 위한 **감성 지향형 AI 마인드케어 다이어리 '기래프'**를 개발했습니다.

본 서비스는 **Next.js & Capacitor 하이브리드 앱 환경**과 **Supabase 실시간 클라우드 DB**, 그리고 기기의 리소스를 최대한 활용하는 **온디바이스 감정 회복 스캐너 알고리즘**을 기반으로 안전하고 역동적인 마음 치유를 제공합니다.

---

## 🎯 프로젝트 목표
- **감성적 기분 시각화**: 기린 도식을 활용한 재치 있는 차트로 일상의 기분 변화를 기분 좋게 확인.
- **온디바이스 AI 맞춤형 처방**: 외부 유출 없이 내 기기 안에서 과거 극복 사례를 찾아내어 제공하는 지능형 피드백.
- **오프라인 동작 완비 (Local-First)**: 인터넷이 끊겨도 로컬 저장소에 정상 기록되고, 연결 시 실시간 클라우드 동기화.
- **원클릭 스마트폰 앱 배포**: 브라우저를 넘어 실제 안드로이드 모바일 디바이스로 즉각 패키징 및 배포.

---

## 👥 팀 소개 – 12색조 (기래프 분과)
> **팀 이름: 12색조**
> *특징: 팀원 모두 각기 다른 매력과 능력을 가짐. 겹치지 않는 팔방미인 팀 ..!*

| 이름 | 역할 | 담당 업무 및 기술 범위 |
| :--- | :--- | :--- |
| **한동재** | **기래프 전담 개발자** | **FE / App / AI Algorithm Developer**<br>- Next.js 기반 아크릴 유리 효과(Glassmorphism) UI/UX 설계<br>- 온디바이스 연대기적 감정 회복 스캐너 알고리즘 구현<br>- Capacitor v6 엔진 적용 Android 실물 디바이스 빌드 파이프라인 구축<br>- Supabase DB 및 RLS 보안 설계 바인딩 |

---

## ✨ 핵심 기능 상세 소개

### 1. 🦒 기분구간 반응형 슬라이더 & 기린 얼굴 (`src/components/MoodSlider.tsx`)
* **5가지 감정 상태 표정 피드백**: 슬라이더로 0점부터 100점까지 기분 점수를 조절하면, 점수 구간에 맞춰 **5가지 얼굴 표정(😭, 😕, 😐, 🙂, ✨)**이 실시간 반응합니다.
* **테마 연동 HSL 트랙바**: 사용자가 선택한 감성 HSL 테마 컬러가 슬라이더 트랙 바와 핸들에 역동적으로 녹아듭니다.

### 2. 📊 기린 테마 감정 트렌드 시각화 차트 (`src/components/MoodChart.tsx`)
* **기린 목 늘리기 막대 차트**: 7일 간의 기분 변화 추이에서 기분 점수 높이만큼 노란 기린의 목이 부드럽게 늘어납니다. 꼭짓점에는 귀여운 기린 얼굴이 도식화되어 나타납니다.
* **30일/전체 기간 가로스크롤 모던 차트**: 긴 시간대의 데이터는 스케일을 유지한 채 부드럽게 좌우로 횡스크롤되는 지능형 모던 뷰어로 설계하여 대량의 데이터도 세련되게 조회합니다.

### 3. 🧠 AI 시간여행 진단 및 3줄 요약 (`src/app/analysis/page.tsx`)
* **온디바이스 타임머신 스캐너**: 달력의 특정 날짜를 클릭하면 해당 날짜 시점으로 시간여행을 떠납니다. 
* **감정 회복 감지 휴리스틱**: 과거 우울했던 기분(40점 이하)에서 평온한 기분(50점 이상)으로 성공적으로 탈출했던 시점의 로그를 역순으로 추적해, 무엇이 유저를 도왔는지 분석합니다.
* **아코디언 요약 처방**: 복잡한 AI 자가진단 분석 결과지를 바쁜 유저를 위해 정규식 파서가 **3줄 요약본**으로 자동 압축하고, 더 자세한 전문은 아코디언 토글을 눌러 읽을 수 있게 제공합니다.

### 4. 🧘 AI 카운셀러 챗봇 & 4초 심호흡 훈련 (`src/app/help/page.tsx`)
* **과거 성공 칭찬 챗봇**: AI 상담사가 한동재님의 과거 극복 내역(예: "동재님, 지난번에 산책하기로 우울감을 극복하셨던 기억이 나네요!")을 칭찬하며 친절하게 심리 치료 대화를 제안합니다.
* **4초 호흡 애니메이션**: 들이마시기(4초) ➡️ 멈추기(4초) ➡️ 내쉬기(4초) 순으로 역동적으로 팽창 및 수축하는 그래픽과 타이머로 신경계 안정을 지원합니다.

### 5. ⏳ 마음 타임캡슐 & 감성 지수 차트 (`src/app/capsule/page.tsx`)
* **과거의 나 회상**: 정확히 2일 전 내가 기록한 감정 상태를 되돌아보는 과거 편지 기능.
* **미래의 나에게**: 1주일/1달 단위로 보관되어 기한이 지나야만 오픈할 수 있는 격리 보관 미래 편지 기능.
* **마음 3대 지수 은유 스토리**: 회복력, 안정성, 낙관도 지수를 이쁘게 수치화하여 AI가 은유 기법으로 위로해 주는 스토리텔링 요약 카드.

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

---

## 🚀 개발 환경 구축 및 가동 가이드

### 1. 로컬 웹 개발 서버 가동 방법
```bash
# 1. 의존성 패키지 설치
npm install

# 2. 실시간 핫리로드 로컬 웹 서버 실행
npm run dev
```

### 2. 안드로이드 모바일 실물 디바이스 빌드 방법 (Capacitor)
```bash
# 1. Next.js 소스코드 정적 빌드 및 모바일 자산 동기화
npm run mobile:build

# 2. 안드로이드 스튜디오 즉각 실행 및 실물 기기 설치 테스트
npm run mobile:open:android
```
안드로이드 스튜디오가 실행되면 기기가 연결된 상태에서 단축키 `Shift + F10` 혹은 상단 재생 버튼을 누르시면 연결된 스마트폰에 **"기래프 (내가 그린 기분 그래프)"** 모바일 정식 앱이 즉시 컴파일되어 완벽하게 설치 및 구동됩니다.
