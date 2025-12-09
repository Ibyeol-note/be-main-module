import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PostCategory } from '@/domain/enum/post-category.enum';

export class CreatePostDto {
    @ApiPropertyOptional({ description: '제목', example: '오늘의 이야기' })
    @IsString()
    @IsOptional()
    @MaxLength(200)
    title?: string;

    @ApiProperty({ description: '본문 내용' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(10000)
    content!: string;

    @ApiProperty({ description: '카테고리', enum: PostCategory })
    @IsEnum(PostCategory)
    @IsNotEmpty()
    category!: PostCategory;

    @ApiProperty({ description: '익명 여부', default: false })
    @IsBoolean()
    isAnonymous!: boolean;
}
