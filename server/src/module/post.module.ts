import { Module, forwardRef } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';

import { PostController } from '@/adapter/inbound/controller/post.controller';
import { PostRepository } from '@/adapter/outbound/post.repository';
import { Post } from '@/domain/entity/post.entity';
import { User } from '@/domain/entity/user.entity';
import { PostServiceInPort } from '@/port/inbound/post-service.in-port';
import { PostServiceOutPort } from '@/port/outbound/post-service.out-port';
import { PostService } from '@/port/service/post.service';
import { DiaryModule } from './diary.module';

@Module({
    imports: [
        MikroOrmModule.forFeature([Post, User]),
        forwardRef(() => DiaryModule),
    ],
    controllers: [PostController],
    providers: [
        {
            provide: PostServiceInPort,
            useClass: PostService,
        },
        {
            provide: PostServiceOutPort,
            useClass: PostRepository,
        },
    ],
    exports: [PostServiceInPort, PostServiceOutPort],
})
export class PostModule { }
