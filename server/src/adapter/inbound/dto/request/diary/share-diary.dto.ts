import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PostCategory } from '@/domain/enum/post-category.enum';

export class ShareDiaryDto {
    @ApiProperty({ description: '익명 여부', default: false })
    @IsBoolean()
    isAnonymous!: boolean;

    @ApiPropertyOptional({ description: '카테고리', enum: PostCategory })
    @IsEnum(PostCategory)
    @IsOptional()
    category?: PostCategory;
}
