# 🦒 기래프 (Giraph) 프로젝트 기술 스택 & 폴더 구조 정의서

**기래프(Giraph - 내가 그린 기분 그래프)**는 사용자의 매일 기분을 기록(기-log)하고 시각화(기래프)하며, 자가 진단을 통한 AI 기반 마인드케어 분석 리포트를 제공하는 하이브리드 모바일 및 웹 서비스입니다. 

본 문서는 프로젝트의 전체 기술 스택 구성 및 디렉토리 구조를 명확히 파악할 수 있도록 정리한 아키텍처 문서입니다.

---

## 🛠️ 기술 스택 (Technology Stack)

프로젝트에 사용된 주요 프레임워크, 라이브러리 및 도구의 명세입니다.

| 분류 | 기술 요소를 구성하는 항목 | 버전 / 세부 사항 | 설명 |
| :--- | :--- | :--- | :--- |
| **Core** | **Next.js** | `v16.2.6` (App Router) | React 기반의 프레임워크로, 유연한 라우팅과 최적화 환경 제공 |
| | **React** | `v19.2.4` | 사용자 인터페이스 렌더링 및 상태 관리의 핵심 라이브러리 |
| | **TypeScript** | `v5.x` | 정적 타입 지정을 통한 코드 안정성 확보 및 생산성 향상 |
| **Styling** | **Tailwind CSS** | `v4.0.0` (with PostCSS) | 유틸리티 퍼스트 CSS 프레임워크로 감성 테마별 반응형 UI 개발 |
| | **Google Fonts** | Outfit Font | 앱 전반에 걸친 모던하고 미려한 영문/숫자 타이포그래피 적용 |
| **Database** | **Supabase** | `@supabase/supabase-js` `v2.106.0` | PostgreSQL 기반 클라우드 DB 연동 및 행 수준 보안(RLS) 지원 |
| | **LocalStorage** | 브라우저 내장 API | Supabase 비활성화 시 자동 복구(Fallback)되어 동작하는 오프라인 모드 |
| **Visualization**| **Recharts** | `v3.8.1` | 기분 점수의 기간별(7일, 30일, 전체) 흐름을 선/막대 그래프로 시각화 |
| **Mobile** | **Capacitor** | `v6.0.0` | 웹 소스를 빌드하여 안드로이드 네이티브 앱(APK)으로 패키징하는 래퍼 |
| **Icons** | **Lucide React** | `v1.16.0` | 모던하고 일관된 모바일 스타일 아이콘 셋 제공 |

---

## 📂 폴더 구조도 (Directory Structure)

전체 프로젝트 디렉토리 및 주요 파일 목록입니다.

```text
Giraph (Root)
├── .git/                      # Git 버전 관리 정보
├── .gitignore                 # Git 제외 대상 목록 설정
├── AGENTS.md                  # Next.js 에이전트 개발 규칙 명세
├── CLAUDE.md                  # 개발 명령어 및 단축키 메모
├── next.config.ts             # Next.js 프레임워크 상세 설정
├── package.json               # 웹 프로젝트 의존성(Dependencies) 및 빌드 스크립트 정의
├── postcss.config.mjs         # Tailwind CSS v4 연동을 위한 PostCSS 설정
├── tsconfig.json              # TypeScript 컴파일 및 경로 별칭(Alias) 옵션 설정
│
├── src/                       # 🌟 메인 애플리케이션 소스 코드
│   ├── app/                   # Next.js App Router 기반 라우팅 및 페이지 컴포넌트
│   │   ├── globals.css        # 테마 변수(Theme Variables), 키프레임 애니메이션 및 전역 스타일
│   │   ├── layout.tsx         # 전역 레이아웃 (테마 상태 주입, 백그라운드 빛무리 및 모바일 프레임 적용)
│   │   ├── page.tsx           # [메인] 기-log 페이지 (기분 슬라이더 입력, 캘린더 피드 및 최근 기록 조회)
│   │   ├── graph/
│   │   │   └── page.tsx       # [메뉴] 기래프 시각화 페이지 (Recharts 활용한 감정 흐름 추적)
│   │   ├── analysis/
│   │   │   └── page.tsx       # [메뉴] AI 분석 페이지 (자가진단 문항 제출, 4초 복식호흡 가이드, 해결 솔루션 AI 챗봇)
│   │   ├── report/
│   │   │   └── page.tsx       # [메뉴] 리포트 페이지 (날짜별 AI 처방 리포트 이력 및 누적 통계 피드백)
│   │   ├── capsule/
│   │   │   └── page.tsx       # [메뉴] 타임캡슐 페이지 (과거 감정 회상, 배송 조건부(지정일/기분 점수 매칭) 편지 예약 및 마음 건강 지수 제공)
│   │   └── help/
│   │       └── page.tsx       # [가이드] 기래프 사용 팁 정보 페이지
│   │
│   ├── components/            # 공통 및 화면 조립용 프리미엄 UI 컴포넌트
│   │   ├── AnalysisCard.tsx   # 감정 상태별 행동 팁 카드뉴스 슬라이드
│   │   ├── BottomNav.tsx      # 하단 플로팅 글래스모피즘 네비게이션 바
│   │   ├── ChatInterface.tsx  # 고민 상담용 1:1 대화 인터페이스 공통 컴포넌트
│   │   ├── GiraffeFace.tsx    # 기분 점수에 맞게 눈물, 땀, 별빛, 귀 각도가 변하는 인터랙티브 SVG 기린 얼굴
│   │   ├── MoodChart.tsx      # Recharts 그래프 래핑 컴포넌트 (기린 머리 도트 & 기린 목 길이 막대 그래프 커스텀)
│   │   └── MoodSlider.tsx     # 0~100 사이의 직관적인 기분 점수 스크롤 슬라이더
│   │
│   └── lib/                   # 외부 API 연동 및 비즈니스 로직 유틸리티
│       ├── moodService.ts     # 기분 기록 데이터 CRUD 및 자가진단 분석 내역 관리 (Supabase & LocalStorage Fallback)
│       └── supabase.ts        # Supabase 클라이언트 연결 설정 및 인증 초기화
│
├── Giraph/                    # 📱 Capacitor 모바일 앱 패키징 폴더
│   ├── android/               # 안드로이드 스튜디오 네이티브 빌드 파일 프로젝트 소스
│   ├── capacitor.config.ts    # Capacitor 설정 파일 (웹 배포 디렉토리 '../out' 매핑)
│   ├── package.json           # 모바일 환경 전용 Capacitor CLI 의존성 및 빌드 스크립트
│   └── package-lock.json      # 모바일 패키지 잠금 파일
│
└── supabase/                  # 🗄️ 백엔드 데이터베이스 설정 폴더
    ├── migrations/
    │   └── 00001_create_mood_logs_table.sql  # 테이블 스키마 구성, 체크 제약 조건 및 RLS 정책 정의
    └── samples.csv            # 초기 분석을 위한 샘플 감정 데이터 CSV 백업본
```

---

## 🎨 주요 디렉토리별 기능 상세 설명

### 1. `src/app` (라우팅 및 구조 관리)
Next.js 16의 App Router 방식을 충실히 따르고 있으며, 단일 페이지 애플리케이션(SPA)의 라우팅 구조를 구현했습니다.
* **`layout.tsx`**: 기래프의 시각적 완성도를 결정짓는 핵심 파일입니다. 테마(`data-theme` - 라벤더, 선셋, 초록, 밀크티)와 라이트/다크 모드(`data-theme-mode`)를 LocalStorage로부터 읽어 로딩 전 렌더링 지연이 없도록 처리합니다. 또한, 화면 중앙에 `max-w-md` 규격의 **프리미엄 모바일 프레임**을 씌우고 배경에 흐릿하게 일렁이는 **그라데이션 빛무리(Glow Elements)** 효과를 주어 앱처럼 느껴지는 고급스러운 비주얼을 제공합니다.
* **`globals.css`**: Tailwind v4 문법을 기본으로 하면서, 각 감성 테마에 매핑된 CSS 변수토큰 정의와 애니메이션(`giraffe`, `fade-in` 등)을 선언했습니다.

### 2. `src/components` (상호작용형 UI 컴포넌트)
화면의 시각적 요소와 감정 피드백을 전달하는 핵심 요소들입니다.
* **`GiraffeFace.tsx`**: 기분 점수 구간별(0~20: 우울, 21~40: 지침, 41~60: 평온, 61~80: 좋음, 81~100: 최고)로 기린의 표정이 동적으로 변화합니다. 귀의 각도가 아래로 쳐지거나 위로 쫑긋 서고, 슬플 땐 뚝뚝 떨어지는 눈물방울 애니메이션을, 최고일 땐 머리 주변에 반짝이는 황금빛 별 가루들을 SVG 코드로 직접 렌더링합니다.
* **`MoodChart.tsx`**: 단순한 Recharts 그래프를 탈피하여, 선그래프 노드를 기린 머리 아이콘으로 대체하고, 막대그래프를 기분 점수(목의 높이)에 따라 쭉 늘어나는 **기린 목 형태의 컬럼(Column)**으로 커스텀 개발하여 기래프의 아이덴티티를 가장 잘 드러내는 심미적 시각화를 선보입니다.

### 3. `src/lib` (핵심 비즈니스 로직)
* **`moodService.ts`**: 데이터 저장 및 조회 로직을 제어합니다. Supabase 서버 연결 상태를 감지하여 연결 불가 시 LocalStorage로 투명하게 전환하는 Fallback 로직이 내장되어 있습니다.

### 4. `Giraph/` (Capacitor 네이티브 패키징)
* Next.js의 정적 파일 내보내기(`next export` 결과물로 빌드된 `out/` 폴더)를 활용해 웹 브라우저 코드를 그대로 모바일 앱 환경으로 래핑합니다. `capacitor.config.ts`에서 빌드 출력 디렉토리를 `../out`으로 타겟팅하여 안드로이드 디렉토리인 `android/` 환경과 즉시 동기화(Sync)할 수 있습니다.

### 5. `supabase/` (데이터 모델 설계)
* 데이터베이스 마이그레이션 스크립트를 관리합니다. `mood_logs` 테이블의 생성 쿼리가 있으며, 기분 점수가 항상 `0 이상 100 이하`여야 한다는 데이터 정결성 보장용 `CHECK (mood_score >= 0 AND mood_score <= 100)` 제약 조건이 선언되어 있습니다. 보안 강화를 위해 행 수준 보안 정책(Row Level Security - RLS) 정책을 명문화해 두었습니다.

---
*본 아키텍처와 폴더 구조도는 기래프 서비스의 높은 유지 보수성과 확장성 있는 하이브리드 앱 아키텍처를 증명합니다.*
