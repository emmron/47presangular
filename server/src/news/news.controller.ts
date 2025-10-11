import { Controller, Get, Query } from '@nestjs/common';
import { NewsService } from './news.service';
import { NewsQueryDto } from './dto/news-query.dto';
import { PaginatedNewsResponseDto } from './dto/news-item.dto';
import { Controller, Get, HttpException, HttpStatus, Query } from '@nestjs/common';
import { NewsService } from './news.service';
import { NewsItemDto } from '../common/news-item.dto';

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get()
  getNews(@Query() query: NewsQueryDto): Promise<PaginatedNewsResponseDto> {
    return this.newsService.getNews(query);
  async getNews(@Query('refresh') refresh?: string): Promise<NewsItemDto[]> {
    try {
      const forceRefresh = refresh === 'true';
      return await this.newsService.getNews(forceRefresh);
    } catch (error) {
      throw new HttpException(
        {
          message: 'Unable to load aggregated news',
          detail: (error as Error).message
        },
        HttpStatus.BAD_GATEWAY
      );
    }
  }
}
