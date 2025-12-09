import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MikroOrmModule } from '@mikro-orm/nestjs';

import mikroOrmConfig from '@/config/mikro-orm.config';
import { AuthModule } from '@/module/auth.module';
import { UserModule } from '@/module/user.module';
import { DiaryModule } from '@/module/diary.module';
import { PostModule } from '@/module/post.module';
import { CommentModule } from '@/module/comment.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),
    MikroOrmModule.forRoot(mikroOrmConfig),
    AuthModule,
    UserModule,
    DiaryModule,
    PostModule,
    CommentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
