# 🦒 기래프 (Giraph) 루트 디렉토리 기술 스택 & 폴더 구조 정의서

**기래프(Giraph - 내가 그린 기분 그래프)**는 사용자의 매일 기분을 기록(기-log)하고 시각화(기래프)하며, 자가 진단을 통한 AI 기반 마인드케어 분석 리포트를 제공하는 모바일 및 웹 서비스입니다. 

본 문서는 프로젝트 루트 디렉토리(`d:\해달\2026 해달 해커톤\mood-tracker`)의 기술 스택 구성 및 디렉토리 구조(Capacitor 모바일 프로젝트인 `Giraph/` 폴더 제외)를 명확히 파악할 수 있도록 정리한 아키텍처 문서입니다.

---

## 🛠️ 기술 스택 (Technology Stack)

프로젝트 루트 레벨의 주요 프레임워크, 라이브러리 및 도구 명세입니다.

| 분류 | 기술 요소를 구성하는 항목 | 버전 / 세부 사항 | 설명 |
| :--- | :--- | :--- | :--- |
| **Core** | **Next.js** | `v16.2.6` (App Router) | React 기반 프레임워크로, 정적 내보내기(output: 'export')를 통한 모바일 리소스 연동 지원 |
| | **React** | `v19.2.4` | 사용자 인터페이스 렌더링 및 상태 관리의 핵심 라이브러리 |
| | **TypeScript** | `v5.x` | 정적 타입 지정을 통한 코드 안정성 확보 및 생산성 향상 |
| **Styling** | **Tailwind CSS** | `v4.0.0` (with PostCSS) | 유틸리티 퍼스트 CSS 프레임워크로 감성 테마별 반응형 UI 개발 |
| | **Google Fonts** | Outfit Font | 앱 전반에 걸친 모던하고 미려한 영문/숫자 타이포그래피 적용 |
| **Database** | **Supabase** | `@supabase/supabase-js` `v2.106.0` | PostgreSQL 기반 클라우드 DB 연동 및 행 수준 보안(RLS) 지원 |
| | **LocalStorage** | 브라우저 내장 API | Supabase 비활성화 시 자동 복구(Fallback)되어 동작하는 오프라인 모드 |
| **Visualization**| **Recharts** | `v3.8.1` | 기분 점수의 기간별(7일, 30일, 전체) 흐름을 선/막대 그래프로 시각화 |
| **Icons** | **Lucide React** | `v1.16.0` | 모던하고 일관된 모바일 스타일 아이콘 셋 제공 |

---

## 📂 폴더 구조도 (Directory Structure)

`Giraph/` 경로를 제외한 프로젝트 루트 디렉토리 및 주요 파일 목록입니다.

```text
mood-tracker (Root)
├── .git/                      # Git 버전 관리 정보
├── .gitignore                 # Git 제외 대상 목록 설정
├── .env.local                 # Supabase 연동 정보 및 환경 변수 키 설정 파일
├── AGENTS.md                  # Next.js 에이전트 개발 규칙 명세
├── CLAUDE.md                  # 개발 명령어 및 단축키 메모
├── convert_csv_to_sql.js      # CSV 형식 샘플 데이터를 SQL INSERT 문으로 변환하는 유틸리티 스크립트
├── specifications.md          # 🦒 기래프(GIRAFFE) 기능 명세서
├── next.config.ts             # Next.js 프레임워크 상세 설정
├── package.json               # 웹 프로젝트 의존성(Dependencies) 및 빌드 스크립트 정의
├── postcss.config.mjs         # Tailwind CSS v4 연동을 위한 PostCSS 설정
├── tsconfig.json              # TypeScript 컴파일 및 경로 별칭(Alias) 옵션 설정 (Capacitor 하위 모바일 프로젝트 'Giraph' 빌드 제외 설정 적용)
│
├── design/                    # 🎨 기래프 기획 및 UI 디자인 시안 에셋 폴더
│   ├── mood graph.png         # 마음 도식화(Recharts) 디자인 스크린샷 이미지
│   └── mood input.png         # 기-log 작성 및 입력 대시보드 디자인 스크린샷 이미지
│
├── public/                    # 파비콘 및 정적 에셋 폴더
│   └── favicon.ico            # 브라우저 탭 아이콘 파일
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
│   │   │   └── page.tsx       # [메뉴] 타임캡슐 페이지 (과거 감정 회상, 특정 날짜/기분 점수 조건 매칭 편지 예약 및 마음 건강 지수 제공)
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
└── supabase/                  # 🗄️ 백엔드 데이터베이스 설정 폴더
    ├── migrations/
    │   └── 00001_create_mood_logs_table.sql  # 테이블 스키마 구성, 체크 제약 조건 및 RLS 정책 정의
    └── samples.csv            # 초기 분석을 위한 샘플 감정 데이터 CSV 백업본
```

---

## 🎨 주요 디렉토리 및 특화 파일 상세 설명

### 1. 루트 특화 파일 및 기획 폴더
* **`convert_csv_to_sql.js`**: `supabase/samples.csv`에 명시된 원본 데이터 행들을 읽어와서 SQL INSERT 구문인 `supabase/insert_samples.sql` 파일로 변환해 주는 Node.js 유틸리티 스크립트입니다. 수작업 데이터 입력 단계를 단축하고 테스트 환경을 일치시키기 위해 특수 구현되었습니다.
* **`specifications.md`**: 해커톤 기획 단계에서 수립된 기능적 기능 명세서로, 주요 페이지별 동작 기준과 시스템 디자인, 하이브리드 데이터 아키텍처 규칙이 총망라되어 보존되어 있습니다.
* **`design/`**: UI/UX 디자인 에셋 및 완성 뷰포트 시안 스크린샷(`.png`)을 포함하고 있어, 개발자가 프론트엔드를 구성할 때 참고할 레이아웃 가이드를 제공합니다.
* **`.env.local`**: 로컬 서버 가동 시 Supabase 서비스 자격증명(`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)을 연동하기 위해 저장된 설정 파일입니다.

### 2. `src/app` (Next.js 애플리케이션 레이어)
App Router 방식을 기반으로 최적화된 모바일 전용 SPA 화면 레이아웃과 개별 페이지들로 이루어져 있습니다.
* **`layout.tsx`**: 기래프의 시각적 통일성을 위해 중앙 고정 `max-w-md` 규격의 **프리미엄 모바일 프레임**을 주입하고, 감성 테마별로 전환되는 배경 그라데이션 빛무리 효과를 렌더링합니다.
* **`page.tsx`**: "기-log" 홈 화면으로, 감정 상태 슬라이더, 캘린더 피드 및 최근 작성된 감정 로그 조회를 통합 제어합니다.
* **`analysis/` & `report/` & `capsule/`**: AI 진단 챗봇, 호흡 유도 가이드, 마음 보고서 일지 아카이빙, 배송 조건부(지정일 도달 vs 특정 기분 점수 매칭 중 택일) 타임캡슐 편지 예약 및 개봉 기능, 그리고 마음 건강 계측 프로그레스 바 등을 구현하여 다차원적인 마음케어 기능을 제공합니다.

### 3. `src/components` (상호작용형 UI 컴포넌트)
* **`GiraffeFace.tsx`**: 기분 점수와 카테고리에 반응해 귀와 얼굴 구조를 렌더링하고, 눈물 애니메이션과 반짝이는 파티클들을 SVG로 시각화해 줍니다.
* **`MoodChart.tsx`**: 기린 캐릭터를 재해석한 Recharts 차트로서 기린 점수와 목의 상승/하락 형태를 막대로 직접 렌더링하는 기린형 맞춤 그래프 컴포넌트입니다.

### 4. `supabase/` (데이터 모델 구조)
* **`migrations/00001_create_mood_logs_table.sql`**: RLS 정책과 기분 수치 무결성을 감증하는 제약 조건이 작성된 데이터베이스 마이그레이션 모듈입니다.

---
*본 아키텍처 문서는 Capacitor 래퍼를 제외한 웹 및 데이터베이스 기반의 기래프 단독 시스템 구조와 유틸리티 명세를 나타냅니다.*
