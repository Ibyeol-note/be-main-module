import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MikroOrmModule } from '@mikro-orm/nestjs';

import { AuthController } from '@/adapter/inbound/controller/auth.controller';
import { AuthRepository } from '@/adapter/outbound/auth.repository';
import { User } from '@/domain/entity/user.entity';
import { AuthServiceInPort } from '@/port/inbound/auth-service.in-port';
import { AuthServiceOutPort } from '@/port/outbound/auth-service.out-port';
import { AuthService } from '@/port/service/auth.service';
import { JwtStrategy } from '@/adapter/inbound/auth/jwt.strategy';

@Module({
    imports: [
        MikroOrmModule.forFeature([User]),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET') || 'default-secret-key',
                signOptions: {
                    expiresIn: '7d' as const,
                },
            }),
            inject: [ConfigService],
        }),
    ],
    controllers: [AuthController],
    providers: [
        JwtStrategy,
        {
            provide: AuthServiceInPort,
            useClass: AuthService,
        },
        {
            provide: AuthServiceOutPort,
            useClass: AuthRepository,
        },
    ],
    exports: [AuthServiceInPort, JwtStrategy, PassportModule],
})
export class AuthModule { }
