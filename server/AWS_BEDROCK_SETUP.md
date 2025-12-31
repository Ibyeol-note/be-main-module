# AWS Bedrock 설정 가이드

이별 회복 지원 플랫폼의 감정 분석 AI를 AWS Bedrock으로 통합하는 가이드입니다.

## 📋 목차

1. [사전 준비](#사전-준비)
2. [AWS SDK 설치](#aws-sdk-설치)
3. [AWS 자격 증명 설정](#aws-자격-증명-설정)
4. [로컬 테스트](#로컬-테스트)
5. [프로덕션 배포](#프로덕션-배포)
6. [비용 관리](#비용-관리)
7. [트러블슈팅](#트러블슈팅)

---

## 사전 준비

### 1. AWS 계정 생성
- AWS 계정이 없다면 [AWS 가입](https://aws.amazon.com/)

### 2. AWS Bedrock 액세스 권한
- AWS Console → Bedrock → Model access 메뉴로 이동
- **Anthropic Claude 3.5 Sonnet** 모델 액세스 요청
- 승인까지 수 분~수 시간 소요

### 3. IAM 사용자 생성 (로컬 개발용)
```
1. AWS Console → IAM → Users → Add users
2. 사용자 이름 입력 (예: bedrock-dev-user)
3. Access key 생성 선택
4. 권한 정책 연결:
   - 기존 정책 직접 연결
   - BedrockFullAccess 또는 커스텀 정책
```

**커스텀 정책 예시 (최소 권한):**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel",
        "bedrock:InvokeModelWithResponseStream"
      ],
      "Resource": "arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-5-sonnet-20241022-v2:0"
    }
  ]
}
```

5. Access Key와 Secret Key 다운로드 (한 번만 표시됨!)

---

## AWS SDK 설치

### 1. 패키지 설치
```bash
cd be-main-module/server
npm install @aws-sdk/client-bedrock-runtime
```

✅ **이미 완료**: package.json에 추가되어 있습니다.

### 2. 설치 확인
```bash
npm list @aws-sdk/client-bedrock-runtime
```

---

## AWS 자격 증명 설정

### 방법 1: 환경 변수 (로컬 개발)

`.env.development` 파일에 AWS 자격 증명 추가:

```env
# AWS Bedrock Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
BEDROCK_MODEL_ID=anthropic.claude-3-5-sonnet-20241022-v2:0
BEDROCK_MAX_RETRIES=2
BEDROCK_TIMEOUT=10000
```

⚠️ **주의**: `.env.development` 파일은 Git에 커밋하지 마세요! (이미 .gitignore에 추가됨)

### 방법 2: AWS CLI 프로필 (선택사항)

```bash
# AWS CLI 설치
brew install awscli  # macOS
# 또는
pip install awscli   # Python

# 자격 증명 설정
aws configure
```

### 방법 3: IAM 역할 (프로덕션 권장)

EC2/ECS/Lambda에서 실행 시:
1. IAM 역할 생성
2. Bedrock 접근 권한 정책 연결
3. 인스턴스/서비스에 역할 할당
4. 환경 변수에서 AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY 제거

---

## 로컬 테스트

### 1. 데이터베이스 실행

```bash
# Docker로 PostgreSQL 실행
docker-compose up -d
```

### 2. 환경 변수 확인

```bash
# .env.development 파일 확인
cat .env.development

# AWS 자격 증명이 설정되어 있는지 확인
```

### 3. 서버 실행

```bash
npm run start:dev
```

**예상 로그:**
```
✅ AWS Bedrock Client 초기화 완료
✅ Database schema synchronized successfully
[NestApplication] Nest application successfully started
```

만약 AWS 자격 증명이 없으면:
```
⚠️  AWS 자격 증명이 없습니다. Mock 분석만 사용됩니다.
```

### 4. API 테스트

**일기 작성 API 호출:**
```bash
curl -X POST http://localhost:3000/diaries \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "content": "오늘은 정말 힘든 하루였어. 계속 그 사람 생각이 나서 아무것도 할 수가 없었어."
  }'
```

**예상 응답 (AWS Bedrock 사용 시):**
```json
{
  "id": 1,
  "content": "오늘은 정말 힘든 하루였어...",
  "emotionScore": -65,
  "emotionKeywords": ["슬픔", "그리움", "고통"],
  "comfortMessage": "지금 많이 힘드시죠. 그 마음 충분히 이해해요. 이별의 아픔은 시간이 필요한 법이에요. 지금은 그저 자신을 위로하고 보듬어주세요. 괜찮아요, 함께할게요. 💙",
  "isShared": false,
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

**서버 로그:**
```
🤖 AWS Bedrock으로 감정 분석 시작 (UserType: FORGET)
✅ AWS Bedrock 분석 완료 (감정점수: -65)
```

---

## 프로덕션 배포

### 1. 환경 변수 설정

`.env.production` 파일 생성:
```env
DB_HOST=your-rds-endpoint
DB_PORT=5432
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=ibyeol_note_prod

JWT_SECRET=your-production-jwt-secret

# IAM 역할 사용 시 아래는 제거
AWS_REGION=us-east-1
BEDROCK_MODEL_ID=anthropic.claude-3-5-sonnet-20241022-v2:0
BEDROCK_MAX_RETRIES=2
BEDROCK_TIMEOUT=10000

NODE_ENV=production
PORT=3000
```

### 2. IAM 역할 설정 (권장)

**EC2/ECS 인스턴스 역할:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel"
      ],
      "Resource": "arn:aws:bedrock:*::foundation-model/anthropic.claude-3-5-sonnet-20241022-v2:0"
    }
  ]
}
```

### 3. 빌드 및 배포

```bash
# 빌드
npm run build

# 프로덕션 실행
NODE_ENV=production npm run start:prod
```

---

## 비용 관리

### Bedrock 요금 구조

**Claude 3.5 Sonnet 가격:**
- 입력: $3.00 / 1M tokens
- 출력: $15.00 / 1M tokens

### 예상 비용 계산

**일기 1건당:**
- 입력 토큰: ~500 tokens (프롬프트 + 일기 내용)
- 출력 토큰: ~300 tokens (감정 분석 결과)
- **비용: 약 $0.006 (약 8원)**

**월 사용량 예상:**
| 사용자 수 | 일 평균 일기 | 월 일기 수 | 월 비용 (USD) | 월 비용 (원) |
|----------|-------------|-----------|--------------|-------------|
| 100명    | 1건         | 3,000건   | $18          | 24,000원    |
| 500명    | 1건         | 15,000건  | $90          | 120,000원   |
| 1,000명  | 1건         | 30,000건  | $180         | 240,000원   |

### 비용 최적화 팁

1. **프롬프트 최적화**
   - 불필요한 설명 제거
   - 토큰 수 최소화

2. **캐싱 전략**
   - 동일한 일기 재분석 방지
   - Redis 캐싱 고려

3. **max_tokens 조정**
   ```typescript
   max_tokens: 512  // 기본 1024에서 줄임
   ```

4. **AWS 프리티어 활용**
   - 신규 계정 크레딧 활용

---

## 트러블슈팅

### 1. "AWS 자격 증명이 없습니다" 경고

**증상:**
```
⚠️  AWS 자격 증명이 없습니다. Mock 분석만 사용됩니다.
```

**해결:**
- `.env.development` 파일에 `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` 설정 확인
- 환경 변수가 올바르게 로드되는지 확인

### 2. "Model not found" 에러

**증상:**
```
❌ AWS Bedrock 분석 실패: Model not found
```

**해결:**
- AWS Console → Bedrock → Model access에서 Claude 3.5 Sonnet 액세스 승인 확인
- `BEDROCK_MODEL_ID` 환경 변수 확인
- 리전이 올바른지 확인 (us-east-1 권장)

### 3. "Access Denied" 에러

**증상:**
```
❌ AWS Bedrock 분석 실패: AccessDeniedException
```

**해결:**
- IAM 사용자/역할에 Bedrock 권한 확인
- 정책에 `bedrock:InvokeModel` 권한 있는지 확인

### 4. "Bedrock 호출 타임아웃" 에러

**증상:**
```
❌ AWS Bedrock 분석 실패, Fallback 사용: Bedrock 호출 타임아웃
```

**해결:**
- `BEDROCK_TIMEOUT` 값 증가 (기본 10000ms)
- 네트워크 연결 확인
- AWS 리전 변경 고려

### 5. JSON 파싱 에러

**증상:**
```
❌ Bedrock 응답 파싱 실패: JSON 형식을 찾을 수 없습니다
```

**해결:**
- 프롬프트가 명확한 JSON 형식 요청하는지 확인
- temperature 값 조정 (낮추면 더 일관성 있음)
- 로그에서 실제 응답 확인

---

## 다음 단계

- [x] ✅ AWS SDK 설치
- [x] ✅ 환경 변수 설정
- [x] ✅ EmotionAnalysisService 구현
- [ ] ⏳ 로컬 테스트 진행
- [ ] ⏳ 실제 AWS 자격 증명 설정
- [ ] ⏳ 프로덕션 배포 준비

---

## 참고 자료

- [AWS Bedrock 공식 문서](https://docs.aws.amazon.com/bedrock/)
- [Anthropic Claude 모델 가이드](https://docs.anthropic.com/claude/docs)
- [AWS SDK for JavaScript v3](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/)
- [NestJS ConfigModule](https://docs.nestjs.com/techniques/configuration)

---

## 문의 및 지원

문제가 발생하면 다음을 확인하세요:
1. 서버 로그 (`npm run start:dev` 콘솔 출력)
2. AWS CloudWatch Logs (프로덕션)
3. `.env` 파일 설정 검증
