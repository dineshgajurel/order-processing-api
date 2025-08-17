import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Redis } from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';

@Injectable()
export class HealthService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  async check() {
    const dbStatus = await this.checkDatabase();
    const redisStatus = await this.checkRedis();

    const allHealthy = dbStatus === 'up' && redisStatus === 'up';

    if (!allHealthy) {
      throw new HttpException(
        { status: 'error', db: dbStatus, redis: redisStatus },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    return {
      status: 'ok',
      db: dbStatus,
      redis: redisStatus,
      timestamp: new Date(),
    };
  }

  private async checkDatabase(): Promise<'up' | 'down'> {
    try {
      await this.dataSource.query('SELECT 1');
      return 'up';
    } catch (err) {
      console.error('Database health check failed:', err);
      return 'down';
    }
  }

  private async checkRedis(): Promise<'up' | 'down'> {
    try {
      const pong = await this.redis.ping();
      return pong === 'PONG' ? 'up' : 'down';
    } catch (err) {
      console.error('Redis health check failed:', err);
      return 'down';
    }
  }
}
