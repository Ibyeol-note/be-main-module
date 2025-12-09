import { Module, forwardRef } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';

import { DiaryController } from '@/adapter/inbound/controller/diary.controller';
import { DiaryRepository } from '@/adapter/outbound/diary.repository';
import { Diary } from '@/domain/entity/diary.entity';
import { User } from '@/domain/entity/user.entity';
import { DiaryServiceInPort } from '@/port/inbound/diary-service.in-port';
import { DiaryServiceOutPort } from '@/port/outbound/diary-service.out-port';
import { DiaryService } from '@/port/service/diary.service';
import { EmotionAnalysisService } from '@/port/service/emotion-analysis.service';
import { PostModule } from './post.module';

@Module({
    imports: [
        MikroOrmModule.forFeature([Diary, User]),
        forwardRef(() => PostModule),
    ],
    controllers: [DiaryController],
    providers: [
        EmotionAnalysisService,
        {
            provide: DiaryServiceInPort,
            useClass: DiaryService,
        },
        {
            provide: DiaryServiceOutPort,
            useClass: DiaryRepository,
        },
    ],
    exports: [DiaryServiceInPort, DiaryServiceOutPort],
})
export class DiaryModule { }
