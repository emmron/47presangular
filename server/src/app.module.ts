import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import configuration from './config/configuration';
import { PrismaModule } from './prisma/prisma.module';
import { NewsModule } from './news/news.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    NewsModule,
  ],
import { ScheduleModule } from '@nestjs/schedule';
import { NewsModule } from './news/news.module';
import { CacheModule } from './cache/cache.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    CacheModule,
    NewsModule,
    HealthModule
  ]
})
export class AppModule {}
