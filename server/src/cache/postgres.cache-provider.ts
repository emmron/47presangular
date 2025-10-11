import { Pool } from 'pg';
import { CacheProvider } from './cache-provider.interface';

export class PostgresCacheProvider implements CacheProvider {
  private readonly pool: Pool;
  private readonly tableName: string;

  constructor(connectionString: string, tableName = 'news_cache') {
    this.pool = new Pool({ connectionString });
    this.tableName = tableName;
  }

  async init(): Promise<void> {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS ${this.tableName} (
        cache_key TEXT PRIMARY KEY,
        payload JSONB NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL
      )
    `);
    await this.pool.query(`CREATE INDEX IF NOT EXISTS ${this.tableName}_expires_idx ON ${this.tableName} (expires_at)`);
  }

  async get<T>(key: string): Promise<T | null> {
    const result = await this.pool.query(
      `SELECT payload FROM ${this.tableName} WHERE cache_key = $1 AND expires_at > NOW()`,
      [key]
    );

    if (result.rowCount === 0) {
      return null;
    }

    return result.rows[0].payload as T;
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    await this.pool.query(
      `INSERT INTO ${this.tableName} (cache_key, payload, expires_at)
       VALUES ($1, $2, NOW() + $3 * INTERVAL '1 second')
       ON CONFLICT (cache_key) DO UPDATE SET
         payload = EXCLUDED.payload,
         expires_at = EXCLUDED.expires_at`,
      [key, value, ttlSeconds]
    );
  }

  async delete(key: string): Promise<void> {
    await this.pool.query(`DELETE FROM ${this.tableName} WHERE cache_key = $1`, [key]);
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}
