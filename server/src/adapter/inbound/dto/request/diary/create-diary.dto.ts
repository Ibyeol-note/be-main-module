import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDiaryDto {
    @ApiProperty({ description: '일기 내용', example: '오늘 하루도 힘들었다...' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(10000)
    content!: string;
}
