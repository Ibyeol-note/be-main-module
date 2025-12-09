import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import axios from 'axios';

import { SocialLoginDto } from '@/adapter/inbound/dto/request/auth/social-login.dto';
import { SignupDto } from '@/adapter/inbound/dto/request/auth/signup.dto';
import { AuthResponseDto } from '@/adapter/inbound/dto/response/auth/auth-response.dto';
import { SocialProvider } from '@/domain/enum/social-provider.enum';
import { AuthServiceInPort } from '@/port/inbound/auth-service.in-port';
import { AuthServiceOutPort } from '@/port/outbound/auth-service.out-port';
import { JwtPayload } from '@/adapter/inbound/auth/jwt.strategy';

interface SocialUserInfo {
    email: string;
    socialId: string;
}

@Injectable()
export class AuthService implements AuthServiceInPort {
    constructor(
        private readonly authRepository: AuthServiceOutPort,
        private readonly jwtService: JwtService,
    ) { }

    async socialLogin(dto: SocialLoginDto): Promise<AuthResponseDto> {
        // 소셜 로그인 토큰으로 사용자 정보 조회
        const socialUserInfo = await this.getSocialUserInfo(dto.provider, dto.accessToken);

        // 기존 사용자 조회
        let user = await this.authRepository.findBySocialId(dto.provider, socialUserInfo.socialId);

        // 신규 사용자인 경우 생성
        if (!user) {
            user = await this.authRepository.createUser({
                email: socialUserInfo.email,
                socialProvider: dto.provider,
                socialId: socialUserInfo.socialId,
            });
        }

        // JWT 토큰 생성
        const accessToken = this.generateToken(user.id, user.email, user.isOnboarded);

        return {
            accessToken,
            isOnboarded: user.isOnboarded,
            userId: user.id,
        };
    }

    async signup(userId: number, dto: SignupDto): Promise<AuthResponseDto> {
        const user = await this.authRepository.updateOnboarding(
            userId,
            dto.nickname,
            dto.userType,
        );

        const accessToken = this.generateToken(user.id, user.email, true);

        return {
            accessToken,
            isOnboarded: true,
            userId: user.id,
        };
    }

    private async getSocialUserInfo(provider: SocialProvider, accessToken: string): Promise<SocialUserInfo> {
        try {
            switch (provider) {
                case SocialProvider.GOOGLE:
                    return await this.getGoogleUserInfo(accessToken);
                case SocialProvider.KAKAO:
                    return await this.getKakaoUserInfo(accessToken);
                default:
                    throw new UnauthorizedException('지원하지 않는 소셜 로그인 제공자입니다.');
            }
        } catch (error) {
            throw new UnauthorizedException('소셜 로그인 정보를 가져오는데 실패했습니다.');
        }
    }

    private async getGoogleUserInfo(accessToken: string): Promise<SocialUserInfo> {
        const response = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        return {
            email: response.data.email,
            socialId: response.data.id,
        };
    }

    private async getKakaoUserInfo(accessToken: string): Promise<SocialUserInfo> {
        const response = await axios.get('https://kapi.kakao.com/v2/user/me', {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        return {
            email: response.data.kakao_account?.email || `kakao_${response.data.id}@kakao.local`,
            socialId: String(response.data.id),
        };
    }

    private generateToken(userId: number, email: string, isOnboarded: boolean): string {
        const payload: JwtPayload = {
            sub: userId,
            email,
            isOnboarded,
        };
        return this.jwtService.sign(payload);
    }
}
