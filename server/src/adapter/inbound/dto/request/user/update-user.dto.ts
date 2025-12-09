import { IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserType } from '@/domain/enum/user-type.enum';

export class UpdateUserDto {
    @ApiPropertyOptional({ description: '닉네임' })
    @IsString()
    @IsOptional()
    @MinLength(2)
    @MaxLength(20)
    nickname?: string;

    @ApiPropertyOptional({ description: '프로필 이미지 URL' })
    @IsString()
    @IsOptional()
    @MaxLength(500)
    profileImage?: string;

    @ApiPropertyOptional({ description: '사용자 타입', enum: UserType })
    @IsEnum(UserType)
    @IsOptional()
    userType?: UserType;
}
