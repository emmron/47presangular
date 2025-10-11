import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NewsService } from './news.service';
import { NewsController } from './news.controller';
import { NewsIngestorService } from './news-ingestor.service';

@Module({
  imports: [ConfigModule],
  controllers: [NewsController],
  providers: [NewsService, NewsIngestorService],
import { NewsService } from './news.service';
import { NewsController } from './news.controller';
import { CacheModule } from '../cache/cache.module';
import { NewsScheduler } from './news.scheduler';

@Module({
  imports: [CacheModule],
  controllers: [NewsController],
  providers: [NewsService, NewsScheduler],
  exports: [NewsService]
})
export class NewsModule {}
