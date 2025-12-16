import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class DiaryListResponseDto {
    @ApiProperty()
    @Expose()
    id!: number;

    @ApiProperty({ description: '일기 미리보기 (첫 100자)' })
    @Expose()
    contentPreview!: string;

    @ApiProperty({ description: '감정 점수 (-100 ~ +100)' })
    @Expose()
    emotionScore!: number;

    @ApiProperty({ description: '감정 키워드', type: [String] })
    @Expose()
    emotionKeywords!: string[];

    @ApiProperty({ description: '커뮤니티 공유 여부' })
    @Expose()
    isShared!: boolean;

    @ApiProperty()
    @Expose()
    createdAt!: Date;
}

export class DiaryListPaginatedResponseDto {
    @ApiProperty({ type: [DiaryListResponseDto] })
    items!: DiaryListResponseDto[];

    @ApiProperty()
    total!: number;

    @ApiProperty()
    page!: number;

    @ApiProperty()
    limit!: number;

    @ApiProperty()
    totalPages!: number;
}
