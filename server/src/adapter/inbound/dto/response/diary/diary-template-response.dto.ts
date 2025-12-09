import { ApiProperty } from '@nestjs/swagger';

export class DiaryTemplateResponseDto {
    @ApiProperty({ description: '템플릿 타입', example: 'POSITIVE' })
    templateType!: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';

    @ApiProperty({ description: '플레이스홀더 텍스트' })
    placeholder!: string;

    @ApiProperty({ description: '격려 문구' })
    encouragement!: string;

    @ApiProperty({ description: '평균 감정 점수' })
    averageEmotionScore!: number;
}
