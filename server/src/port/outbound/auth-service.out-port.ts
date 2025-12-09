import { User } from '@/domain/entity/user.entity';
import { SocialProvider } from '@/domain/enum/social-provider.enum';
import { UserType } from '@/domain/enum/user-type.enum';

export abstract class AuthServiceOutPort {
    abstract findBySocialId(provider: SocialProvider, socialId: string): Promise<User | null>;
    abstract createUser(data: {
        email: string;
        socialProvider: SocialProvider;
        socialId: string;
    }): Promise<User>;
    abstract updateOnboarding(userId: number, nickname: string, userType: UserType): Promise<User>;
    abstract findById(id: number): Promise<User | null>;
}
