import { IsEnum, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserType } from '@/domain/enum/user-type.enum';

export class SignupDto {
    @ApiProperty({ description: '닉네임', example: '희망찬하루' })
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(20)
    nickname!: string;

    @ApiProperty({ description: '사용자 타입', enum: UserType })
    @IsEnum(UserType)
    @IsNotEmpty()
    userType!: UserType;
}
