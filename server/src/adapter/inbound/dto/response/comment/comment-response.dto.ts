import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class CommentResponseDto {
    @ApiProperty()
    @Expose()
    id!: number;

    @ApiProperty()
    @Expose()
    content!: string;

    @ApiProperty()
    @Expose()
    isAnonymous!: boolean;

    @ApiProperty()
    @Expose()
    authorNickname!: string;

    @ApiProperty()
    @Expose()
    createdAt!: Date;

    @ApiProperty()
    @Expose()
    updatedAt!: Date;
}

export class CommentListResponseDto {
    @ApiProperty({ type: [CommentResponseDto] })
    items!: CommentResponseDto[];

    @ApiProperty()
    total!: number;
}
