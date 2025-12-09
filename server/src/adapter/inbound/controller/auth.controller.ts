import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { AuthServiceInPort } from '@/port/inbound/auth-service.in-port';
import { SocialLoginDto } from '@/adapter/inbound/dto/request/auth/social-login.dto';
import { SignupDto } from '@/adapter/inbound/dto/request/auth/signup.dto';
import { AuthResponseDto } from '@/adapter/inbound/dto/response/auth/auth-response.dto';
import { JwtAuthGuard } from '@/adapter/inbound/auth/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '@/adapter/inbound/auth/current-user.decorator';

@ApiTags('인증')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthServiceInPort) { }

    @Post('social-login')
    @ApiOperation({ summary: '소셜 로그인', description: 'Google 또는 Kakao 소셜 로그인' })
    @ApiResponse({ status: 200, description: '로그인 성공', type: AuthResponseDto })
    @ApiResponse({ status: 401, description: '인증 실패' })
    async socialLogin(@Body() dto: SocialLoginDto): Promise<AuthResponseDto> {
        return this.authService.socialLogin(dto);
    }

    @Post('signup')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: '회원가입 (온보딩)', description: '닉네임과 사용자 타입 설정' })
    @ApiResponse({ status: 200, description: '온보딩 완료', type: AuthResponseDto })
    @ApiResponse({ status: 401, description: '인증 필요' })
    async signup(
        @CurrentUser() user: CurrentUserPayload,
        @Body() dto: SignupDto,
    ): Promise<AuthResponseDto> {
        return this.authService.signup(user.userId, dto);
    }

    @Post('logout')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: '로그아웃', description: '클라이언트에서 토큰 삭제' })
    @ApiResponse({ status: 200, description: '로그아웃 성공' })
    async logout(): Promise<{ message: string }> {
        // JWT는 서버에서 무효화할 수 없으므로 클라이언트에서 토큰 삭제 처리
        return { message: '로그아웃 되었습니다.' };
    }
}
