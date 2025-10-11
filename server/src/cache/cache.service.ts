import { Inject, Injectable, Logger } from '@nestjs/common';
import { CACHE_PROVIDER } from './cache.constants';
import { CacheProvider } from './cache-provider.interface';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  constructor(
    @Inject(CACHE_PROVIDER)
    private readonly provider: CacheProvider
  ) {}

  async get<T>(key: string): Promise<T | null> {
    return this.provider.get<T>(key);
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    await this.provider.set<T>(key, value, ttlSeconds);
  }

  async delete(key: string): Promise<void> {
    await this.provider.delete(key);
  }

  async onModuleDestroy(): Promise<void> {
    if (this.provider.close) {
      try {
        await this.provider.close();
      } catch (error) {
        this.logger.warn(`Unable to close cache provider cleanly: ${error}`);
      }
    }
  }
}
