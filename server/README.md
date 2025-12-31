# 이별 회복 지원 플랫폼 - Backend Server

이별을 경험한 사람들이 감정을 기록하고, AI를 통한 위로를 받으며, 커뮤니티를 통해 공감과 지지를 얻을 수 있는 모바일 플랫폼의 백엔드 서버입니다.

## 🚀 기술 스택

- **Framework**: NestJS 10
- **Language**: TypeScript 5
- **Database**: PostgreSQL
- **ORM**: MikroORM 5
- **AI**: AWS Bedrock (Claude 3.5 Sonnet)
- **Authentication**: JWT + Passport

## 📋 주요 기능

### 1. 이별노트 (일기)
- 일기 작성 및 CRUD
- **AWS Bedrock 감정 분석**
  - 감정 점수 (-100 ~ +100)
  - 감정 키워드 추출
  - AI 위로 메시지 생성
- 커뮤니티 공유 기능

### 2. 커뮤니티
- 게시판 (잊고파/잡고파/중립)
- 댓글 기능
- 익명/공개 선택

### 3. 사용자 관리
- 소셜 로그인 (Google/Kakao/Apple)
- 프로필 관리
- 감정 변화 그래프

## 🛠 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.development` 파일 생성:

```bash
cp .env.example .env.development
```

필수 환경 변수:
- `DB_*`: PostgreSQL 연결 정보
- `JWT_SECRET`: JWT 시크릿 키
- `AWS_*`: AWS Bedrock 자격 증명 (선택사항)

### 3. 데이터베이스 실행

```bash
docker-compose up -d
```

### 4. 개발 서버 실행

```bash
npm run start:dev
```

서버가 `http://localhost:3000`에서 실행됩니다.

## 🤖 AWS Bedrock 설정

AWS Bedrock을 사용한 AI 감정 분석 기능을 활성화하려면:

1. **[AWS_BEDROCK_SETUP.md](./AWS_BEDROCK_SETUP.md) 가이드 참조**
2. AWS 자격 증명 설정
3. `.env.development`에 AWS 정보 입력

**AWS 설정 없이도 동작**: Mock 분석 기능으로 자동 전환됩니다.

## 📁 프로젝트 구조

```
src/
├── adapter/           # Hexagonal Architecture - Adapters
│   ├── inbound/      # Controllers, DTOs, Guards
│   └── outbound/     # Repositories
├── port/             # Hexagonal Architecture - Ports
│   ├── inbound/      # Service Interfaces
│   ├── outbound/     # Repository Interfaces
│   └── service/      # Service Implementations
│       └── emotion-analysis.service.ts  # 🎯 AWS Bedrock 통합
├── domain/           # Domain Models
│   ├── entity/       # Database Entities
│   └── enum/         # Enums
├── module/           # NestJS Modules
├── config/           # Configuration
└── main.ts           # Application Entry Point
```

## 🧪 테스트

```bash
# 유닛 테스트
npm run test

# E2E 테스트
npm run test:e2e

# 테스트 커버리지
npm run test:cov
```

## 📚 API 문서

서버 실행 후 Swagger 문서 확인:
```
http://localhost:3000/api
```

### 주요 엔드포인트

**인증**
- `POST /auth/social-login` - 소셜 로그인
- `POST /auth/signup` - 회원가입

**일기**
- `POST /diaries` - 일기 작성 (AI 분석 포함)
- `GET /diaries` - 일기 목록
- `GET /diaries/:id` - 일기 상세
- `POST /diaries/:id/share` - 커뮤니티 공유

**커뮤니티**
- `GET /posts` - 게시물 목록
- `POST /posts/:id/comments` - 댓글 작성

**사용자**
- `GET /users/me` - 내 프로필
- `GET /users/me/emotion-graph` - 감정 변화 그래프

## 🏗 아키텍처

### Hexagonal Architecture (Port & Adapter)

```
┌─────────────────────────────────────┐
│        Inbound Adapters             │
│   (Controllers, DTOs, Guards)       │
└──────────────┬──────────────────────┘
               │
       ┌───────▼────────┐
       │  Inbound Ports │
       │  (Interfaces)  │
       └───────┬────────┘
               │
       ┌───────▼────────┐
       │    Services    │ ◄──── AWS Bedrock
       │  (Use Cases)   │
       └───────┬────────┘
               │
       ┌───────▼────────┐
       │ Outbound Ports │
       │  (Interfaces)  │
       └───────┬────────┘
               │
┌──────────────▼──────────────────────┐
│       Outbound Adapters             │
│    (Repositories, External APIs)    │
└─────────────────────────────────────┘
```

## 🔒 보안

- JWT 기반 인증
- 환경 변수를 통한 시크릿 관리
- AWS IAM 역할 사용 (프로덕션)
- SQL Injection 방지 (ORM 사용)

## 🚀 배포

### 프로덕션 빌드

```bash
npm run build
```

### 프로덕션 실행

```bash
NODE_ENV=production npm run start:prod
```

## 📊 모니터링

### 로깅

- NestJS Logger 사용
- AWS Bedrock 호출 로그
- 에러 로그

### 메트릭

- API 응답 시간
- Bedrock 호출 횟수
- 에러율

## 💰 비용 관리

### AWS Bedrock 예상 비용

- Claude 3.5 Sonnet: 일기 1건당 약 $0.006 (8원)
- 월 1,000명 사용 시: 약 $180 (24만원)

자세한 내용은 [AWS_BEDROCK_SETUP.md](./AWS_BEDROCK_SETUP.md) 참조

## 📝 라이선스

UNLICENSED - Private Project

## 👥 기여

이 프로젝트는 PoC(Proof of Concept) 단계입니다.

---

**문서:**
- [AWS Bedrock 설정 가이드](./AWS_BEDROCK_SETUP.md)
- [PRD 문서](./prd.md)
