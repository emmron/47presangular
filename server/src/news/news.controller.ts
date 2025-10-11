import { Controller, Get, Query } from '@nestjs/common';
import { NewsService } from './news.service';
import { NewsQueryDto } from './dto/news-query.dto';
import { PaginatedNewsResponseDto } from './dto/news-item.dto';

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get()
  getNews(@Query() query: NewsQueryDto): Promise<PaginatedNewsResponseDto> {
    return this.newsService.getNews(query);
  }
}
