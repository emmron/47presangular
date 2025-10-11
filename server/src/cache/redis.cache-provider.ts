import IORedis, { Redis } from 'ioredis';
import { CacheProvider } from './cache-provider.interface';

export class RedisCacheProvider implements CacheProvider {
  private readonly client: Redis;

  constructor(url: string) {
    this.client = new IORedis(url, {
      lazyConnect: true
    });
  }

  async connect(): Promise<void> {
    if (this.client.status === 'end') {
      await this.client.connect();
    } else if (this.client.status === 'wait') {
      await this.client.connect();
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const value = await this.client.get(key);
    if (!value) {
      return null;
    }
    return JSON.parse(value) as T;
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  }

  async delete(key: string): Promise<void> {
    await this.client.del(key);
  }

  async close(): Promise<void> {
    await this.client.quit();
  }
}
