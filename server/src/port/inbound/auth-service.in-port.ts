import { SocialLoginDto } from '@/adapter/inbound/dto/request/auth/social-login.dto';
import { SignupDto } from '@/adapter/inbound/dto/request/auth/signup.dto';
import { AuthResponseDto } from '@/adapter/inbound/dto/response/auth/auth-response.dto';

export abstract class AuthServiceInPort {
    abstract socialLogin(dto: SocialLoginDto): Promise<AuthResponseDto>;
    abstract signup(userId: number, dto: SignupDto): Promise<AuthResponseDto>;
}
