import { ApiProperty } from '@nestjs/swagger';

export class UserStatsResponseDto {
    @ApiProperty({ description: '작성한 일기 총 개수' })
    diaryCount!: number;

    @ApiProperty({ description: '커뮤니티 게시물 수' })
    postCount!: number;

    @ApiProperty({ description: '댓글 수' })
    commentCount!: number;
}
