import { Injectable } from '@nestjs/common';

import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

@Injectable()
export class CacheHelperService {
  constructor(@InjectRedis() private readonly redisClient: Redis) {}

  async invalidateBulkCache(pattern: string): Promise<void> {
    let cursor = '0';
    do {
      const [nextCursor, keys] = await this.redisClient.scan(
        cursor,
        'MATCH',
        pattern,
        'COUNT',
        100,
      );

      if (keys.length > 0) {
        await this.redisClient.del(...keys);
        console.log(`Invalidated order list cache keys`, keys);
      }

      cursor = nextCursor;
    } while (cursor !== '0');
  }
}
