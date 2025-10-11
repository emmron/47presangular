import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { NewsService } from './news.service';

@Injectable()
export class NewsScheduler implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(NewsScheduler.name);
  private readonly refreshIntervalMs = parseInt(
    process.env.NEWS_REFRESH_INTERVAL_MS ?? '300000',
    10
  );

  constructor(
    private readonly newsService: NewsService,
    private readonly schedulerRegistry: SchedulerRegistry
  ) {
    this.registerInterval();
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.newsService.refreshCache();
      this.logger.log('News cache primed on startup.');
    } catch (error) {
      this.logger.error('Failed to seed news cache on startup', error as Error);
    }
  }

  onModuleDestroy(): void {
    try {
      this.schedulerRegistry.deleteInterval('news-refresh');
    } catch (error) {
      this.logger.warn(`Unable to clear news-refresh interval: ${error}`);
    }
  }

  private registerInterval(): void {
    const interval = setInterval(async () => {
      await this.refreshSafely();
    }, this.refreshIntervalMs);

    this.schedulerRegistry.addInterval('news-refresh', interval);
  }

  private async refreshSafely(): Promise<void> {
    try {
      await this.newsService.refreshCache();
      this.logger.debug('News cache refreshed');
    } catch (error) {
      this.logger.error('Scheduled news refresh failed', error as Error);
    }
  }
}
