# 🦒 기래프 (Giraph) - Backend & Cloud Database

> **경북대학교 학우들의 소중한 감정 일기와 개인정보를 철저히 수호하는 Supabase 클라우드 기반 서버리스 백엔드**
> 
> 
> ❝ 데이터베이스 설계도와 보안 가이드라인 ❞
> 
> **자체 서버 구축의 비효율성을 완벽하게 날려버리다!** 단 한 줄의 자체 서버 코드 없이 Supabase와 PostgreSQL RLS 보안 기술로 설계된 초고효율 백엔드 시스템입니다👍
> 

---

## 🧭 프로젝트 개요
감정 일기와 마음 케어 진단 기록은 사용자의 개인정보 중 가장 민감하고 조심스러운 정보에 속합니다. 
기존의 백엔드 시스템들은:
- ❌ **자체 서버 호스팅 비용과 부하**: 24시간 서버 컴퓨터를 구동해야 해서 자원 낭비가 심함.
- ❌ **보안 정책의 취약성**: 데이터베이스 테이블에 별도 암호화나 세밀한 개인별 격리 자물쇠가 부재해 관리자나 해커가 유저 데이터를 엿볼 위험이 큼.
- ❌ **배포 및 이식의 복잡성**: 서버 환경 설정, 라우팅(API) 코딩, 데이터베이스 연결 등 수십 단계의 복잡한 절차 필요.

이러한 고질적인 문제들을 해소하기 위해 기래프 백엔드는 **서버리스(Serverless)** 및 **BaaS (Backend-as-a-Service)** 개념을 적극 도입하여, **Supabase 클라우드** 위에 고성능 관계형 데이터베이스 **PostgreSQL**과 강력한 개인정보 보호를 보장하는 **행 단위 보안 정책(RLS)**을 완벽히 구축했습니다.

---

## 🎯 프로젝트 목표
- **서버리스 비용 최소화**: 무거운 서버 컴퓨터를 띄우지 않고 클라우드 플랫폼의 자원을 유연하게 호출하여 극도의 경제성과 속도 달성.
- **해킹 원천 차단 (RLS)**: 데이터베이스 수준에서 사용자별로 엄격하게 칸막이를 치는 행 단위 보안 정책(Row-Level Security)을 실현하여 완벽한 사생활 수호.
- **초고속 데이터베이스 이식성**: 단 한 장의 데이터베이스 설계도(`schema.sql`)만으로 누구나 클릭 한 번에 동일한 백엔드 환경을 즉시 배포할 수 있는 고도의 표준화 구현.

---

## 🛠️ 사용 기술 스택 (Tech Stack)

### **Cloud Backend Platform**
<p align="left">
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
</p>

- **Supabase**: 가상 서버 호스팅 및 실시간 API 자동 생성(Auto-generated REST APIs) 엔진.

### **Database & Security**
<p align="left">
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/SQL-000000?style=for-the-badge&logo=databricks&logoColor=white" alt="SQL" />
</p>

- **PostgreSQL**: Supabase의 메인 데이터베이스 엔진으로, 트랜잭션 무결성을 보장하고 복잡한 일기 로그의 관계형 스토리지 역할을 완벽히 수행.
- **Row-Level Security (RLS)**: 데이터베이스 테이블에 설정하는 개인별 데이터 격리 자물쇠. 로그인한 사용자 본인의 데이터 이외에는 시스템 관리자조차 접근하지 못하도록 원천 차단하는 핵심 보안 장치.

---

## 🗄️ Database 구조 (ERD & Schema)

### **`mood_logs` 테이블 정의**
사용자의 일일 감정 점수 및 사유, 그리고 AI 극복 계기 데이터를 담는 주춧돌 테이블입니다.

| 컬럼명 | 데이터 타입 | 제약 조건 | 설명 |
| :--- | :--- | :--- | :--- |
| **`id`** | `UUID` | `PRIMARY KEY` | 감정 로그 기록의 고유식별자 |
| **`user_id`** | `UUID` | `DEFAULT auth.uid()` | 기록을 작성한 로그인된 사용자의 고유 ID (보안 키) |
| **`mood_score`** | `INTEGER` | `CHECK (0 <= score <= 100)` | 0~100 사이로 입력된 유저의 기분 수치 점수 |
| **`feeling`** | `TEXT` | `NOT NULL` | 사용자의 핵심 감정 텍스트 (예: 우울함, 보통) |
| **`reason`** | `TEXT` | `NOT NULL` | 감정을 느낀 구체적인 원인 일기 텍스트 |
| **`change_reason`** | `TEXT` | `DEFAULT ''` | 기분이 5점이라도 나아진 경우 기록하는 AI 처방 극복 계기 메모 |
| **`created_at`** | `TIMESTAMPTZ` | `DEFAULT timezone('utc', now())` | 로그가 기록된 정확한 날짜 및 타임스탬프 |

---

## 🛡️ Row-Level Security (RLS) 보안 정책

기래프 백엔드의 가장 강력한 장점으로, 데이터베이스 단에서 **행 단위 보안(RLS)**을 가동하여 사용자 데이터를 타인으로부터 완벽히 보호합니다.

### 📝 적용된 3대 핵심 SQL 보안 정책
1. **데이터 생성 권한 (`INSERT`)**:
   * *조건*: 오직 로그인하여 학생 인증을 완료한 유저 본인의 `user_id`를 가졌을 때만 새로운 행을 추가할 수 있습니다.
2. **데이터 조회 권한 (`SELECT`)**:
   * *조건*: `auth.uid() = user_id` 조건이 참인 행만 유저 화면에 로드됩니다. 다른 유저의 일기 기록은 API 호출을 통해 조회를 시도해도 빈 배열로 반환됩니다.
3. **데이터 삭제 권한 (`DELETE`)**:
   * *조건*: 오직 본인이 작성한 감정 로그의 고유 `id`에 매칭될 때만 레코드를 물리적으로 영구 파기할 수 있습니다.

---

## 📁 디렉토리 구조 (Directory Tree)
백엔드 구성 파일은 상위 감싸기 폴더 없이 **백엔드 저장소 루트**에 다음과 같이 정밀하게 나누어 배포되어 있습니다.

```
Backend/ (백엔드 저장소 루트)
├── .env.example       # 프론트엔드가 내 데이터베이스와 접속할 때 쓰는 접속 환경변수 템플릿
├── schema.sql         # Supabase에 붙여넣기만 하면 1초 만에 DB를 만들어주는 핵심 마이그레이션 설계도
└── README.md          # 백엔드 데이터베이스 공식 명세서 (본 파일)
```

---

## 🚀 백엔드 원격 배포 및 연결 가이드

본 저장소의 설계도를 사용해 1초 만에 백엔드를 원격 클라우드로 가동하는 순서입니다.

### 1단계: Supabase 프로젝트 생성
1. [Supabase 공식 홈페이지](https://supabase.com/)에 접속하여 로그인합니다.
2. **`New Project`**를 눌러 새 프로젝트를 생성하고 데이터베이스 비밀번호를 안전하게 보관합니다.

### 2단계: 데이터베이스 설계도 반영
1. 생성된 프로젝트 대시보드 좌측 메뉴에서 **`SQL Editor`**에 들어갑니다.
2. **`New Query`**를 생성하고, 본 저장소 루트에 위치한 **`schema.sql`** 파일의 전체 코드를 복사하여 붙여넣습니다.
3. 우측 하단의 **`Run`** 버튼을 누르면, 기래프 데이터베이스 구조와 보안 RLS 자물쇠 세팅이 1초 만에 클라우드에 자동 구축됩니다.

### 3단계: 프론트엔드 연동
1. Supabase 대시보드의 `Settings ➡️ API` 메뉴에서 `Project URL`과 `Anon Key`를 복제합니다.
2. 본 저장소의 `.env.example` 파일을 참고하여 프론트엔드 최상위 디렉토리에 **`.env.local`** 파일을 만든 뒤 해당 열쇠 값들을 입력해 주면 기래프 앱과 클라우드 백엔드의 실시간 연동이 정상 완료됩니다!
