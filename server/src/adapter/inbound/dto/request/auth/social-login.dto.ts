import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SocialProvider } from '@/domain/enum/social-provider.enum';

export class SocialLoginDto {
    @ApiProperty({ description: '소셜 로그인 제공자', enum: SocialProvider })
    @IsEnum(SocialProvider)
    @IsNotEmpty()
    provider!: SocialProvider;

    @ApiProperty({ description: '소셜 로그인 액세스 토큰' })
    @IsString()
    @IsNotEmpty()
    accessToken!: string;
}
