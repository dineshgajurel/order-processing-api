import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm.config';
import { OrderModule } from './order/order.module';
// import { QueueModule } from './queue/queue.module';
import { BullModule } from '@nestjs/bullmq';
import { NotificationsModule } from './notification/notification.module';
import { HealthModule } from './health/health.module';
@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD || '',
      },
    }),

    AuthModule,
    UserModule,
    OrderModule,
    NotificationsModule,
    HealthModule,
    // QueueModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
