import { Entity, PrimaryKey, Property, Enum } from '@mikro-orm/core';
import { BaseEntity } from './base.entity';
import { UserStatus } from '../enum/user-status.enum';
import { UserType } from '../enum/user-type.enum';
import { SocialProvider } from '../enum/social-provider.enum';

@Entity()
export class User extends BaseEntity {
    @PrimaryKey()
    id!: number;

    @Property({ length: 255, unique: true })
    email!: string;

    @Property({ length: 100 })
    nickname!: string;

    @Property({ length: 500, nullable: true })
    profileImage?: string;

    @Enum(() => UserType)
    userType: UserType = UserType.NEUTRAL;

    @Enum(() => SocialProvider)
    socialProvider!: SocialProvider;

    @Property({ length: 255 })
    socialId!: string;

    @Enum(() => UserStatus)
    status: UserStatus = UserStatus.ACTIVE;

    @Property({ default: false })
    isOnboarded: boolean = false;
}
