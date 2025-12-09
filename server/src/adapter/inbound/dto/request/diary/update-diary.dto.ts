import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateDiaryDto {
    @ApiPropertyOptional({ description: '일기 내용' })
    @IsString()
    @IsOptional()
    @MaxLength(10000)
    content?: string;
}
