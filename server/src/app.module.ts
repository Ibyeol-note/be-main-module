import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import * as path from 'path';

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
    MikroOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        driver: PostgreSqlDriver,
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 5432),
        user: configService.get('DB_USER', 'postgres'),
        password: configService.get('DB_PASSWORD', 'postgres'),
        dbName: configService.get('DB_NAME', 'be_main_module'),
        entities: [path.join(__dirname, 'domain', 'entity', '*.entity.js')],
        entitiesTs: process.env.NODE_ENV === 'development' ? ['src/**/*.entity.ts'] : [],
        debug: true,
        allowGlobalContext: true,
        ensureDatabase: true,
        schemaGenerator: {
          disableForeignKeys: false,
          createForeignKeyConstraints: true,
          ignoreSchema: [],
          updateSchema: true,
        },
        driverOptions: {
          connection: {
            ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
          },
        },
      }),
    }),
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
