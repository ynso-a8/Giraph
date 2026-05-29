# 🦒 기래프 (Giraffe) - Backend

> **"매일의 기분 점수를 기록하고 AI 분석 처방전 및 시간여행 복구 스캔을 제어하는 '기래프'의 백엔드 & PostgreSQL 클라우드 데이터베이스 저장소입니다."**

<p align="center">
  <img src="https://img.shields.io/badge/Supabase-v2-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/JSON-000000?style=for-the-badge&logo=json&logoColor=white" alt="JSON" />
</p>

---

## ☁️ 시스템 아키텍처 개요

기래프의 백엔드는 자체 인프라 구축의 비효율성을 해소하기 위해 **서버리스(Serverless)** 아키텍처를 도입하여 클라우드 상에서 유연하게 작동하며, **Supabase 클라이언트 SDK**와 관계형 데이터베이스인 **PostgreSQL**이 핵심 저장소 역할을 수행합니다.

또한 오프라인 상황에서도 앱이 끊김 없이 정상 가동되는 **로컬 우선(Local-First) 하이브리드 싱크 엔진**을 탑재하여 모바일 환경에 가장 최적화되어 있습니다.

```
[모바일/웹 클라이언트 요청]
        │
        ├──> [Supabase SDK 유효성 및 네트워크 검사]
        │         ├──> 통과: 실시간 Supabase Cloud DB 트랜잭션 (보안 백업)
        │         └──> 실패: Transparent fallback ➡️ 브라우저 로컬 저장소 CRUD 수행
```

---

## 💾 데이터베이스 스키마 테이블 명세

기래프 백엔드는 기분 로그와 역대 AI 처방 다이어리 데이터 정합성을 보장하기 위해 다음과 같이 2개의 핵심 테이블 구조를 관리합니다.

### 1. 감정 로그 테이블 (`mood_logs`)
사용자가 작성한 당일의 기분 점수와 구체적인 하루 조각(원인)들이 기록되는 테이블입니다.

| 컬럼명 | 데이터 타입 | 설명 | 제약 조건 |
| :--- | :---: | :--- | :---: |
| **`id`** | `UUID` / `String` | 기분 기록 고유 식별자 | **PRIMARY KEY** |
| **`user_id`** | `UUID` | 로그인한 사용자 고유 ID | **FOREIGN KEY** (Auth) |
| **`mood_score`** | `Integer` | 당일의 기분 점수 (0 ~ 100) | **NOT NULL** |
| **`feeling`** | `VARCHAR` | 감정 범주 텍스트 (예: '좋음/만족함') | **NOT NULL** |
| **`reason`** | `TEXT` | 사용자가 직접 작성한 기분의 구체적 이유 | **NOT NULL** |
| **`change_reason`**| `TEXT` | 감정 변화의 상세 원인 세부 기술 | (선택 필드) |
| **`created_at`** | `TIMESTAMP` | 기분 로그가 등록된 시간 정보 | **DEFAULT now()** |

### 2. 처방전 히스토리 테이블 (`giraffe_analysis_history` - Local Metadata)
시간여행 AI 자가진단을 완수한 날짜별 AI 종합 소견 및 복구 팁들이 축적되는 테이블 스키마입니다.

| 필드명 | 데이터 타입 | 설명 | 제약 조건 |
| :--- | :---: | :--- | :---: |
| **`id`** | `String` | 처방전 고유 키 | **PRIMARY KEY** |
| **`date`** | `TIMESTAMP` | 처방전이 기록된 특정 캘린더 날짜 | **NOT NULL** |
| **`answers`** | `JSONB` | 자가진단 퀴즈 응답 객체 (영역, 강도, 반응, 처방 등) | **NOT NULL** |
| **`analysisText`** | `TEXT` | 시간여행 스캔으로 융합된 AI 최종 심층 소견 텍스트 | **NOT NULL** |
| **`actionTips`** | `JSONB` (Array) | AI 행동 조언 3선 리스트 (과거 성공 행동 포함) | **NOT NULL** |
| **`moodScore`** | `Integer` | 당시 측정된 감정 추정 수치 | **NOT NULL** |

---

## 🧠 시간여행 복구 스캔 핵심 알고리즘 로직

기래프 백엔드 브레인의 가장 강력한 특징인 **'시간여행 감정 복구 스캐너(Time-Travel Scanner)'**가 구동되는 상세 기술 논리입니다.

```
[1] 자가진단이 지정된 특정 선택일(selectedDate) 접수
     │
[2] created_at <= selectedDate 조건으로 역사적 기분 데이터만 메모리에 필터링 로드 (시간제약 격리)
     │
[3] 선택된 퀴즈 감정 영역(예: '대인관계')에 맞춰 형태소 매칭 한글 키워드 집합 로딩
     │
[4] 과거 로그에서 [기분 점수 <= 55] 였던 가장 힘든 고통의 날 탐색
     │
[5] 고통의 날 이후 3일 이내에 [기분 점수 상승폭 >= +10점]을 달성한 '마음 회복 구간' 추적
     │
[6] 해당 회복 성공일의 'reason' 컬럼 텍스트에서 한동재님만의 성공 비결 문장 추출
     │
[7] AI 처방전 본문에 융합 및 1순위 행동 솔루션 체크리스트에 동적 바인딩
```

---

## 🔑 프로덕션 환경 변수 및 설정 파일 (`.env`)

백엔드 데이터베이스 클라우드 자원을 안전하게 호출하기 위해 로컬 보안 환경 파일에 아래와 같이 실제 접속 credentials를 기재하여 Next.js 빌드 시 바인딩합니다. (보안을 위해 `.gitignore`에 자동 등록되어 레포지토리 외부 유출이 영구 방지됩니다.)

```env
NEXT_PUBLIC_SUPABASE_URL=https://icthqqocqiaqqkjvsmhm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljdGhxcW9jcWlhcXFranZzbWhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3ODUxNDAsImV4cCI6MjA5NTM2MTE0MH0.qQ4WrTfAQg1sXeRkmujPgxHFqg5TA3Fs3xUA7tT7u0c
```
