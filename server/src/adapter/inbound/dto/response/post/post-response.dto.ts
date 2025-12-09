import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { PostCategory } from '@/domain/enum/post-category.enum';

export class PostResponseDto {
    @ApiProperty()
    @Expose()
    id!: number;

    @ApiPropertyOptional()
    @Expose()
    title?: string;

    @ApiProperty()
    @Expose()
    content!: string;

    @ApiProperty({ enum: PostCategory })
    @Expose()
    category!: PostCategory;

    @ApiProperty()
    @Expose()
    isAnonymous!: boolean;

    @ApiProperty()
    @Expose()
    authorNickname!: string;

    @ApiProperty()
    @Expose()
    commentCount!: number;

    @ApiProperty()
    @Expose()
    createdAt!: Date;

    @ApiProperty()
    @Expose()
    updatedAt!: Date;
}

export class PostListResponseDto {
    @ApiProperty()
    @Expose()
    id!: number;

    @ApiPropertyOptional()
    @Expose()
    title?: string;

    @ApiProperty({ description: '본문 미리보기 (150자)' })
    @Expose()
    contentPreview!: string;

    @ApiProperty({ enum: PostCategory })
    @Expose()
    category!: PostCategory;

    @ApiProperty()
    @Expose()
    authorNickname!: string;

    @ApiProperty()
    @Expose()
    commentCount!: number;

    @ApiProperty()
    @Expose()
    createdAt!: Date;
}

export class PostListPaginatedResponseDto {
    @ApiProperty({ type: [PostListResponseDto] })
    items!: PostListResponseDto[];

    @ApiProperty()
    total!: number;

    @ApiProperty()
    page!: number;

    @ApiProperty()
    limit!: number;

    @ApiProperty()
    totalPages!: number;
}
