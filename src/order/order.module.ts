import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { UserModule } from 'src/user/user.module';
import { BullModule } from '@nestjs/bullmq';
import { OrdersProcessor } from './processors/order.processor';
import { NotificationsModule } from 'src/notification/notification.module';
import { CacheModule } from '@nestjs/cache-manager';
import { createKeyv } from '@keyv/redis';
import { CacheHelperService } from './CacheHelperService';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order]),
    UserModule,
    BullModule.registerQueue({
      name: 'orders',
    }),
    CacheModule.registerAsync({
      useFactory: async () => {
        return {
          stores: [createKeyv(process.env.REDIS_URL)],
          ttl: parseInt(process.env.REDIS_TTL || '3600000'),
        };
      },
    }),
    NotificationsModule,
  ],

  providers: [OrderService, OrdersProcessor, CacheHelperService],
  controllers: [OrderController],
})
export class OrderModule {}
