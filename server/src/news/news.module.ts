import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NewsService } from './news.service';
import { NewsController } from './news.controller';
import { NewsIngestorService } from './news-ingestor.service';

@Module({
  imports: [ConfigModule],
  controllers: [NewsController],
  providers: [NewsService, NewsIngestorService],
})
export class NewsModule {}
