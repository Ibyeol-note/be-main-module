import { ApiProperty } from '@nestjs/swagger';

export class EmotionGraphDataPoint {
    @ApiProperty({ description: '날짜' })
    date!: string;

    @ApiProperty({ description: '감정 점수' })
    emotionScore!: number;
}

export class EmotionGraphResponseDto {
    @ApiProperty({ type: [EmotionGraphDataPoint], description: '감정 점수 데이터 포인트' })
    dataPoints!: EmotionGraphDataPoint[];

    @ApiProperty({ description: '전체 기간 평균' })
    averageScore!: number;

    @ApiProperty({ description: '기간 내 최고 점수' })
    maxScore!: number;

    @ApiProperty({ description: '기간 내 최저 점수' })
    minScore!: number;

    @ApiProperty({ description: '가장 좋았던 날', required: false })
    bestDay?: string;

    @ApiProperty({ description: '가장 힘들었던 날', required: false })
    worstDay?: string;

    @ApiProperty({ description: '이전 기간 대비 변화' })
    changeFromPrevious!: number;
}
