# 🦒 기래프 (Giraph) - Backend & Cloud Database

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

## 📁 디렉토리 구조 (Directory Tree)
백엔드 구성 파일은 상위 감싸기 폴더 없이 **백엔드 저장소 루트**에 다음과 같이 정밀하게 나누어 배포되어 있습니다.

```
Backend/ (백엔드 저장소 루트)
├── .env.example       # 프론트엔드가 내 데이터베이스와 접속할 때 쓰는 접속 환경변수 템플릿
├── schema.sql         # Supabase에 붙여넣기만 하면 1초 만에 DB를 만들어주는 핵심 마이그레이션 설계도
└── README.md          # 백엔드 데이터베이스 공식 명세서 (본 파일)
```

---

## 백엔드 분량이 적은 이유: Supabase(BaaS) 기반의 서버리스 아키텍처

별도의 백엔드 폴더나 API 서버 코드가 거의 없는 이유는 Supabase를 연동해 사용하고 있기 때문입니다.

BaaS (Backend as a Service): 직접 Spring, Express, Django 같은 백엔드 웹 서버를 구축하는 대신, 데이터베이스 저장·사용자 인증·파일 업로드 등의 백엔드 기능을 클라이언트(React/Next.js)에서 SDK(@supabase/supabase-js)로 직접 호출하여 처리합니다.
SQL 마이그레이션: 데이터 모델 스키마와 데이터 접근 권한(보안)은 supabase/migrations/ 폴더 안의 SQL 파일에만 정의되어 있고, 실제 연동 및 비즈니스 로직은 클라이언트의 src/lib/moodService.ts 등에서 직접 수행합니다.
로컬 Fallback: 오프라인 모드나 서버가 없을 때는 브라우저의 LocalStorage가 백엔드 역할을 즉각 대체하므로 복잡한 서버 가동 과정이 불필요합니다.
결과적으로 백엔드 구축 부담을 없앤 초경량 서버리스 구조이기 때문에 백엔드 코드 분량이 극히 적어 보입니다.
