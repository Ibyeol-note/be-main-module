import { IsBoolean, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
    @ApiProperty({ description: '댓글 내용' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(1000)
    content!: string;

    @ApiProperty({ description: '익명 여부', default: false })
    @IsBoolean()
    isAnonymous!: boolean;
}
