import { Global, Module } from '@nestjs/common';
import { CACHE_PROVIDER } from './cache.constants';
import { CacheService } from './cache.service';
import { InMemoryCacheProvider } from './in-memory.cache-provider';
import { RedisCacheProvider } from './redis.cache-provider';
import { PostgresCacheProvider } from './postgres.cache-provider';

@Global()
@Module({
  providers: [
    {
      provide: CACHE_PROVIDER,
      useFactory: async () => {
        const redisUrl = process.env.CACHE_REDIS_URL;
        if (redisUrl) {
          const provider = new RedisCacheProvider(redisUrl);
          await provider.connect();
          return provider;
        }

        const postgresUrl = process.env.CACHE_POSTGRES_URL;
        if (postgresUrl) {
          const provider = new PostgresCacheProvider(postgresUrl);
          await provider.init();
          return provider;
        }

        return new InMemoryCacheProvider();
      }
    },
    CacheService
  ],
  exports: [CacheService]
})
export class CacheModule {}
