import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
    @ApiProperty({ description: 'JWT 액세스 토큰' })
    accessToken!: string;

    @ApiProperty({ description: '온보딩 완료 여부' })
    isOnboarded!: boolean;

    @ApiProperty({ description: '사용자 ID' })
    userId!: number;
}
