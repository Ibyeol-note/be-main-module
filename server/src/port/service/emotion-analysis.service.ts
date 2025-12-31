import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    BedrockRuntimeClient,
    InvokeModelCommand,
    InvokeModelCommandInput,
} from '@aws-sdk/client-bedrock-runtime';
import { UserType } from '@/domain/enum/user-type.enum';

export interface EmotionAnalysisResult {
    emotionScore: number;
    emotionKeywords: string[];
    comfortMessage: string;
}

@Injectable()
export class EmotionAnalysisService {
    private readonly logger = new Logger(EmotionAnalysisService.name);
    private readonly bedrockClient: BedrockRuntimeClient;
    private readonly modelId: string;
    private readonly maxRetries: number;
    private readonly timeout: number;

    constructor(private readonly configService: ConfigService) {
        const region = this.configService.get('AWS_REGION', 'us-east-1');
        const accessKeyId = this.configService.get('AWS_ACCESS_KEY_ID');
        const secretAccessKey = this.configService.get('AWS_SECRET_ACCESS_KEY');

        // AWS 자격 증명이 있는 경우에만 BedrockClient 초기화
        if (accessKeyId && secretAccessKey) {
            this.bedrockClient = new BedrockRuntimeClient({
                region,
                credentials: {
                    accessKeyId,
                    secretAccessKey,
                },
            });
            this.logger.log('✅ AWS Bedrock Client 초기화 완료');
        } else {
            this.logger.warn('⚠️  AWS 자격 증명이 없습니다. Mock 분석만 사용됩니다.');
        }

        this.modelId = this.configService.get(
            'BEDROCK_MODEL_ID',
            'anthropic.claude-3-5-sonnet-20241022-v2:0',
        );
        this.maxRetries = parseInt(this.configService.get('BEDROCK_MAX_RETRIES', '2'));
        this.timeout = parseInt(this.configService.get('BEDROCK_TIMEOUT', '10000'));
    }

    /**
     * 일기 내용을 분석하여 감정 점수, 키워드, 위로 메시지를 생성합니다.
     * AWS Bedrock이 설정된 경우 실제 AI 분석을 수행하고, 그렇지 않으면 Mock을 사용합니다.
     */
    async analyze(content: string, userType: UserType): Promise<EmotionAnalysisResult> {
        // AWS Bedrock이 초기화되어 있으면 실제 분석 시도
        if (this.bedrockClient) {
            try {
                this.logger.log(`🤖 AWS Bedrock으로 감정 분석 시작 (UserType: ${userType})`);
                const result = await this.analyzeWithBedrock(content, userType);
                this.logger.log(`✅ AWS Bedrock 분석 완료 (감정점수: ${result.emotionScore})`);
                return result;
            } catch (error) {
                this.logger.error(`❌ AWS Bedrock 분석 실패, Fallback 사용: ${error.message}`);
                return this.getFallbackAnalysis(content, userType);
            }
        }

        // AWS 설정이 없으면 Mock 분석 사용
        this.logger.log('📝 Mock 감정 분석 사용');
        return this.getMockAnalysis(content, userType);
    }

    /**
     * AWS Bedrock을 사용한 실제 감정 분석
     */
    private async analyzeWithBedrock(
        content: string,
        userType: UserType,
    ): Promise<EmotionAnalysisResult> {
        const prompt = this.buildPrompt(content, userType);

        for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
            try {
                const response = await this.invokeBedrockModel(prompt);
                return this.parseBedrockResponse(response);
            } catch (error) {
                if (attempt === this.maxRetries) {
                    throw error;
                }
                this.logger.warn(`⚠️  Bedrock 호출 재시도 ${attempt + 1}/${this.maxRetries}`);
                await this.delay(1000 * (attempt + 1)); // 지수 백오프
            }
        }

        throw new Error('Bedrock 호출 최대 재시도 초과');
    }

    /**
     * Bedrock 모델 호출
     */
    private async invokeBedrockModel(prompt: string): Promise<any> {
        const requestBody = {
            anthropic_version: 'bedrock-2023-05-31',
            max_tokens: 1024,
            messages: [
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            temperature: 0.7,
        };

        const input: InvokeModelCommandInput = {
            modelId: this.modelId,
            contentType: 'application/json',
            accept: 'application/json',
            body: JSON.stringify(requestBody),
        };

        const command = new InvokeModelCommand(input);

        const response = await Promise.race([
            this.bedrockClient.send(command),
            this.timeoutPromise(this.timeout),
        ]);

        const responseBody = JSON.parse(new TextDecoder().decode(response.body));
        return responseBody;
    }

    /**
     * Bedrock용 프롬프트 생성
     */
    private buildPrompt(content: string, userType: UserType): string {
        const typeContext = {
            [UserType.FORGET]: '사용자는 이별을 받아들이고 새로운 시작을 원합니다.',
            [UserType.HOLD]: '사용자는 관계 회복을 원하거나 아직 미련이 남아있습니다.',
            [UserType.NEUTRAL]: '사용자는 아직 마음을 정하지 못한 상태입니다.',
        };

        return `당신은 이별을 경험한 사람을 공감하고 위로하는 심리 상담사입니다.

사용자 상태: ${typeContext[userType]}
일기 내용: ${content}

다음 형식의 JSON으로만 응답해주세요. 다른 설명은 포함하지 마세요:
{
  "emotionScore": (number, -100 ~ +100 범위의 정수),
  "emotionKeywords": (array of 2-3 strings, 예: ["슬픔", "그리움"]),
  "comfortMessage": (string, 200-300자의 위로 메시지)
}

위로 메시지 작성 규칙:
1. 사용자의 감정을 먼저 인정하고 공감하세요
2. 사용자의 상태에 맞는 톤으로 작성하세요
   - 잊고파: 앞으로 나아가는 응원
   - 잡고파: 마음을 이해하고 지지
   - 중립: 자신의 선택을 존중
3. 구체적이고 개인화된 메시지를 제공하세요
4. 희망적이되 강요하지 않는 톤을 유지하세요
5. 한국어로 작성하세요`;
    }

    /**
     * Bedrock 응답 파싱
     */
    private parseBedrockResponse(response: any): EmotionAnalysisResult {
        try {
            const content = response.content[0].text;

            // JSON 추출 (코드 블록이나 마크다운으로 감싸진 경우 처리)
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('JSON 형식을 찾을 수 없습니다');
            }

            const parsed = JSON.parse(jsonMatch[0]);

            return {
                emotionScore: this.clampScore(parsed.emotionScore),
                emotionKeywords: this.validateKeywords(parsed.emotionKeywords),
                comfortMessage: this.validateMessage(parsed.comfortMessage),
            };
        } catch (error) {
            this.logger.error(`❌ Bedrock 응답 파싱 실패: ${error.message}`);
            throw new Error('AI 응답 파싱 실패');
        }
    }

    /**
     * 감정 점수를 -100 ~ +100 범위로 제한
     */
    private clampScore(score: number): number {
        const num = parseInt(String(score), 10);
        return Math.max(-100, Math.min(100, isNaN(num) ? 0 : num));
    }

    /**
     * 감정 키워드 유효성 검사
     */
    private validateKeywords(keywords: any): string[] {
        if (!Array.isArray(keywords)) {
            return ['감정 분석 중'];
        }
        const filtered = keywords.filter((k) => typeof k === 'string').slice(0, 3);
        return filtered.length > 0 ? filtered : ['감정 분석 중'];
    }

    /**
     * 위로 메시지 유효성 검사
     */
    private validateMessage(message: any): string {
        if (typeof message !== 'string' || message.trim().length === 0) {
            return '당신의 마음을 이해합니다. 힘든 시간을 보내고 계시는군요. 천천히 나아가도 괜찮아요.';
        }
        return message.trim();
    }

    /**
     * Bedrock 실패 시 사용할 Fallback 분석 (Mock과 동일)
     */
    private getFallbackAnalysis(content: string, userType: UserType): EmotionAnalysisResult {
        return {
            emotionScore: 0,
            emotionKeywords: ['감정 분석 중'],
            comfortMessage:
                '당신의 마음을 이해합니다. 힘든 시간을 보내고 계시는군요. 천천히 나아가도 괜찮아요.',
        };
    }

    /**
     * Mock 감정 분석 (AWS 설정이 없을 때 사용)
     */
    private getMockAnalysis(content: string, userType: UserType): EmotionAnalysisResult {
        const emotionScore = this.calculateMockEmotionScore(content);
        const emotionKeywords = this.extractMockKeywords(content);
        const comfortMessage = this.generateMockComfortMessage(emotionScore, userType);

        return {
            emotionScore,
            emotionKeywords,
            comfortMessage,
        };
    }

    private calculateMockEmotionScore(content: string): number {
        const positiveWords = ['행복', '좋아', '기뻐', '웃음', '희망', '사랑', '감사', '행운'];
        const negativeWords = [
            '슬퍼',
            '힘들',
            '아파',
            '눈물',
            '그리워',
            '미련',
            '후회',
            '외로워',
        ];

        let score = 0;
        positiveWords.forEach((word) => {
            if (content.includes(word)) score += 15;
        });
        negativeWords.forEach((word) => {
            if (content.includes(word)) score -= 15;
        });

        return Math.max(-100, Math.min(100, score));
    }

    private extractMockKeywords(content: string): string[] {
        const keywords: string[] = [];
        const keywordMap: Record<string, string> = {
            슬퍼: '슬픔',
            눈물: '슬픔',
            그리워: '그리움',
            보고싶: '그리움',
            화나: '분노',
            짜증: '분노',
            희망: '희망',
            기대: '희망',
            외로워: '외로움',
            혼자: '외로움',
            행복: '행복',
            좋아: '기쁨',
        };

        Object.entries(keywordMap).forEach(([word, keyword]) => {
            if (content.includes(word) && !keywords.includes(keyword)) {
                keywords.push(keyword);
            }
        });

        if (keywords.length === 0) {
            keywords.push('감정 정리 중');
        }

        return keywords.slice(0, 3);
    }

    private generateMockComfortMessage(emotionScore: number, userType: UserType): string {
        const typeContext = {
            [UserType.FORGET]: {
                positive:
                    '정말 잘하고 계세요! 새로운 시작을 향해 한 걸음씩 나아가고 있네요. 오늘의 긍정적인 마음을 잘 기억해두세요. 앞으로도 이렇게 조금씩 나아지는 자신을 응원해주세요. ✨',
                neutral:
                    '하루하루가 쉽지 않죠. 하지만 이렇게 감정을 기록하는 것만으로도 큰 용기입니다. 천천히, 자신만의 속도로 나아가면 됩니다. 오늘도 수고했어요.',
                negative:
                    '지금 많이 힘드시죠. 그 마음 충분히 이해해요. 이별의 아픔은 시간이 필요한 법이에요. 지금은 그저 자신을 위로하고 보듬어주세요. 괜찮아요, 함께할게요. 💙',
            },
            [UserType.HOLD]: {
                positive:
                    '오늘은 마음이 한결 편안해 보이네요. 어떤 결정을 하든, 지금 느끼는 감정을 소중히 여기세요. 당신의 마음이 가리키는 곳으로 천천히 걸어가세요.',
                neutral:
                    '아직 마음이 복잡하시죠. 미련이 남는 건 자연스러운 감정이에요. 급하게 결정할 필요 없어요. 지금 이 순간의 감정을 있는 그대로 받아들여보세요.',
                negative:
                    '그 사람이 많이 그립고, 마음이 아프시죠. 그 감정을 억누르지 않아도 돼요. 충분히 슬퍼해도 괜찮아요. 당신의 감정은 모두 소중해요. 💜',
            },
            [UserType.NEUTRAL]: {
                positive:
                    '오늘은 좋은 하루였나봐요. 어떤 길을 선택하든 당신의 선택을 응원합니다. 지금 이 순간을 즐기세요.',
                neutral:
                    '마음을 정하는 건 쉬운 일이 아니에요. 천천히 자신의 감정을 들여다보세요. 답은 이미 당신 안에 있을 거예요.',
                negative:
                    '지금은 많은 것들이 뒤섞여 힘드시죠. 괜찮아요, 시간을 두고 천천히 정리해도 됩니다. 오늘 하루도 고생 많았어요.',
            },
        };

        const context = typeContext[userType];
        if (emotionScore >= 30) {
            return context.positive;
        } else if (emotionScore <= -30) {
            return context.negative;
        }
        return context.neutral;
    }

    /**
     * 지연 유틸리티
     */
    private async delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    /**
     * 타임아웃 Promise
     */
    private async timeoutPromise(ms: number): Promise<never> {
        return new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Bedrock 호출 타임아웃')), ms),
        );
    }
}
