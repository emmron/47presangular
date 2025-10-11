import { CacheProvider } from './cache-provider.interface';

type CacheValue = {
  expiresAt: number;
  payload: unknown;
};

export class InMemoryCacheProvider implements CacheProvider {
  private readonly store = new Map<string, CacheValue>();

  async get<T>(key: string): Promise<T | null> {
    const record = this.store.get(key);
    if (!record) {
      return null;
    }

    if (Date.now() > record.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return record.payload as T;
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.store.set(key, { payload: value, expiresAt });
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }
}
