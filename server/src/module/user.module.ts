import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';

import { UserController } from '@/adapter/inbound/controller/user.controller';
import { UserRepository } from '@/adapter/outbound/user.repository';
import { User } from '@/domain/entity/user.entity';
import { UserServiceInPort } from '@/port/inbound/user-service.in-port';
import { UserServiceOutPort } from '@/port/outbound/user-service.out-port';
import { UserService } from '@/port/service/user.service';

@Module({
    imports: [MikroOrmModule.forFeature([User])],
    controllers: [UserController],
    providers: [
        {
            provide: UserServiceInPort,
            useClass: UserService,
        },
        {
            provide: UserServiceOutPort,
            useClass: UserRepository,
        },
    ],
    exports: [UserServiceInPort, UserServiceOutPort],
})
export class UserModule { }
