import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { UserType } from '@/domain/enum/user-type.enum';
import { SocialProvider } from '@/domain/enum/social-provider.enum';

export class UserResponseDto {
    @ApiProperty()
    @Expose()
    id!: number;

    @ApiProperty()
    @Expose()
    email!: string;

    @ApiProperty()
    @Expose()
    nickname!: string;

    @ApiPropertyOptional()
    @Expose()
    profileImage?: string;

    @ApiProperty({ enum: UserType })
    @Expose()
    userType!: UserType;

    @ApiProperty({ enum: SocialProvider })
    @Expose()
    socialProvider!: SocialProvider;

    @ApiProperty()
    @Expose()
    isOnboarded!: boolean;

    @ApiProperty()
    @Expose()
    createdAt!: Date;
}
