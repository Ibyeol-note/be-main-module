import { Injectable } from '@nestjs/common';
import { UserType } from '@/domain/enum/user-type.enum';

export interface EmotionAnalysisResult {
    emotionScore: number;
    emotionKeywords: string[];
    comfortMessage: string;
}

@Injectable()
export class EmotionAnalysisService {
    /**
     * 일기 내용을 분석하여 감정 점수, 키워드, 위로 메시지를 생성합니다.
     * 현재는 Mock 구현이며, 추후 AWS Bedrock으로 대체됩니다.
     */
    async analyze(content: string, userType: UserType): Promise<EmotionAnalysisResult> {
        // Mock 구현: 간단한 감정 분석 로직
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
        // 간단한 키워드 기반 감정 점수 계산
        const positiveWords = ['행복', '좋아', '기뻐', '웃음', '희망', '사랑', '감사', '행운'];
        const negativeWords = ['슬퍼', '힘들', '아파', '눈물', '그리워', '미련', '후회', '외로워'];

        let score = 0;
        positiveWords.forEach(word => {
            if (content.includes(word)) score += 15;
        });
        negativeWords.forEach(word => {
            if (content.includes(word)) score -= 15;
        });

        // -100 ~ +100 범위로 제한
        return Math.max(-100, Math.min(100, score));
    }

    private extractMockKeywords(content: string): string[] {
        const keywords: string[] = [];
        const keywordMap: Record<string, string> = {
            '슬퍼': '슬픔',
            '눈물': '슬픔',
            '그리워': '그리움',
            '보고싶': '그리움',
            '화나': '분노',
            '짜증': '분노',
            '희망': '희망',
            '기대': '희망',
            '외로워': '외로움',
            '혼자': '외로움',
            '행복': '행복',
            '좋아': '기쁨',
        };

        Object.entries(keywordMap).forEach(([word, keyword]) => {
            if (content.includes(word) && !keywords.includes(keyword)) {
                keywords.push(keyword);
            }
        });

        // 키워드가 없으면 기본값 추가
        if (keywords.length === 0) {
            keywords.push('감정 정리 중');
        }

        return keywords.slice(0, 3);
    }

    private generateMockComfortMessage(emotionScore: number, userType: UserType): string {
        const typeContext = {
            [UserType.FORGET]: {
                positive: '정말 잘하고 계세요! 새로운 시작을 향해 한 걸음씩 나아가고 있네요. 오늘의 긍정적인 마음을 잘 기억해두세요. 앞으로도 이렇게 조금씩 나아지는 자신을 응원해주세요. ✨',
                neutral: '하루하루가 쉽지 않죠. 하지만 이렇게 감정을 기록하는 것만으로도 큰 용기입니다. 천천히, 자신만의 속도로 나아가면 됩니다. 오늘도 수고했어요.',
                negative: '지금 많이 힘드시죠. 그 마음 충분히 이해해요. 이별의 아픔은 시간이 필요한 법이에요. 지금은 그저 자신을 위로하고 보듬어주세요. 괜찮아요, 함께할게요. 💙',
            },
            [UserType.HOLD]: {
                positive: '오늘은 마음이 한결 편안해 보이네요. 어떤 결정을 하든, 지금 느끼는 감정을 소중히 여기세요. 당신의 마음이 가리키는 곳으로 천천히 걸어가세요.',
                neutral: '아직 마음이 복잡하시죠. 미련이 남는 건 자연스러운 감정이에요. 급하게 결정할 필요 없어요. 지금 이 순간의 감정을 있는 그대로 받아들여보세요.',
                negative: '그 사람이 많이 그립고, 마음이 아프시죠. 그 감정을 억누르지 않아도 돼요. 충분히 슬퍼해도 괜찮아요. 당신의 감정은 모두 소중해요. 💜',
            },
            [UserType.NEUTRAL]: {
                positive: '오늘은 좋은 하루였나봐요. 어떤 길을 선택하든 당신의 선택을 응원합니다. 지금 이 순간을 즐기세요.',
                neutral: '마음을 정하는 건 쉬운 일이 아니에요. 천천히 자신의 감정을 들여다보세요. 답은 이미 당신 안에 있을 거예요.',
                negative: '지금은 많은 것들이 뒤섞여 힘드시죠. 괜찮아요, 시간을 두고 천천히 정리해도 됩니다. 오늘 하루도 고생 많았어요.',
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
}
