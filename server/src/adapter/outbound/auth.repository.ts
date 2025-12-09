import { Injectable } from '@nestjs/common';
import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';
import { InjectRepository } from '@mikro-orm/nestjs';

import { User } from '@/domain/entity/user.entity';
import { SocialProvider } from '@/domain/enum/social-provider.enum';
import { UserType } from '@/domain/enum/user-type.enum';
import { AuthServiceOutPort } from '@/port/outbound/auth-service.out-port';

@Injectable()
export class AuthRepository implements AuthServiceOutPort {
    constructor(
        private readonly em: EntityManager,
        @InjectRepository(User)
        private readonly userRepo: EntityRepository<User>,
    ) { }

    async findBySocialId(provider: SocialProvider, socialId: string): Promise<User | null> {
        return this.userRepo.findOne({
            socialProvider: provider,
            socialId: socialId,
        });
    }

    async createUser(data: {
        email: string;
        socialProvider: SocialProvider;
        socialId: string;
    }): Promise<User> {
        const user = new User();
        user.email = data.email;
        user.socialProvider = data.socialProvider;
        user.socialId = data.socialId;
        user.nickname = `user_${Date.now()}`;
        user.isOnboarded = false;

        this.em.persist(user);
        await this.em.flush();
        return user;
    }

    async updateOnboarding(userId: number, nickname: string, userType: UserType): Promise<User> {
        const user = await this.userRepo.findOneOrFail({ id: userId });
        user.nickname = nickname;
        user.userType = userType;
        user.isOnboarded = true;
        await this.em.flush();
        return user;
    }

    async findById(id: number): Promise<User | null> {
        return this.userRepo.findOne({ id });
    }
}
