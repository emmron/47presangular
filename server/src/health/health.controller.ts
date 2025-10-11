import { Controller, Get } from '@nestjs/common';
import { NewsService } from '../news/news.service';

@Controller('health')
export class HealthController {
  constructor(private readonly newsService: NewsService) {}

  @Get()
  async status(): Promise<{ status: string; lastUpdated: string | null }> {
    const cached = await this.newsService.getNews();
    const lastUpdated = cached.length ? cached[0].pubDate : null;
    return {
      status: 'ok',
      lastUpdated
    };
  }
}
