import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';

import { CommentController } from '@/adapter/inbound/controller/comment.controller';
import { CommentRepository } from '@/adapter/outbound/comment.repository';
import { Comment } from '@/domain/entity/comment.entity';
import { CommentServiceInPort } from '@/port/inbound/comment-service.in-port';
import { CommentServiceOutPort } from '@/port/outbound/comment-service.out-port';
import { CommentService } from '@/port/service/comment.service';
import { PostModule } from './post.module';
import { DiaryModule } from './diary.module';

@Module({
    imports: [
        MikroOrmModule.forFeature([Comment]),
        PostModule,
        DiaryModule,
    ],
    controllers: [CommentController],
    providers: [
        {
            provide: CommentServiceInPort,
            useClass: CommentService,
        },
        {
            provide: CommentServiceOutPort,
            useClass: CommentRepository,
        },
    ],
    exports: [CommentServiceInPort],
})
export class CommentModule { }
