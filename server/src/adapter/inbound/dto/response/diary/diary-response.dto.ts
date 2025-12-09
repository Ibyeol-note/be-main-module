import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class DiaryResponseDto {
    @ApiProperty()
    @Expose()
    id!: number;

    @ApiProperty()
    @Expose()
    content!: string;

    @ApiProperty({ description: '감정 점수 (-100 ~ +100)' })
    @Expose()
    emotionScore!: number;

    @ApiProperty({ description: '감정 키워드', type: [String] })
    @Expose()
    emotionKeywords!: string[];

    @ApiPropertyOptional({ description: 'AI 위로 메시지' })
    @Expose()
    comfortMessage?: string;

    @ApiProperty({ description: '커뮤니티 공유 여부' })
    @Expose()
    isShared!: boolean;

    @ApiPropertyOptional({ description: '공유된 게시물 ID' })
    @Expose()
    postId?: number;

    @ApiProperty()
    @Expose()
    createdAt!: Date;

    @ApiProperty()
    @Expose()
    updatedAt!: Date;
}
