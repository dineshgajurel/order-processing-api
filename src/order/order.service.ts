import {
  Injectable,
  NotFoundException,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { CreateOrderDto } from './dto/order.dto';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { NotificationGateway } from 'src/notification/notification.gateway';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { OrderStatus } from 'src/common/enums/common.enum';
import { CacheHelperService } from './CacheHelperService';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,

    @InjectQueue('orders')
    private readonly ordersQueue: Queue,

    private readonly notificationGateway: NotificationGateway,

    @Inject(CACHE_MANAGER) private cacheManager: Cache,

    private readonly cacheHelperService: CacheHelperService,
  ) {}

  async create(userId: number, dto: CreateOrderDto): Promise<Order> {
    try {
      const order = this.orderRepo.create({
        userId,
        items: dto.items,
        status: OrderStatus.PENDING,
      });

      const saveOrder = await this.orderRepo.save(order);

      await this.cacheHelperService.invalidateBulkCache('orders:list*');

      await this.ordersQueue.add('processOrder', { orderId: saveOrder.id });

      console.log('Order created and added to queue:', saveOrder.id);

      return saveOrder;
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Error while creating new user');
    }
  }

  async findOne(orderId: number): Promise<Order> {
    const cacheKey = `order:${orderId}`;

    let order = await this.cacheManager.get<Order>(cacheKey);

    if (!order) {
      const foundOrder = await this.orderRepo.findOne({
        where: { id: orderId },
      });
      order = foundOrder ?? undefined;
      if (!order) throw new NotFoundException('Order not found');
      await this.cacheManager.set(cacheKey, order);
    }

    if (!order) throw new NotFoundException('Order not found');

    return order;
  }

  // async findOnebyID(orderId: number) {
  //   const order = await this.orderRepo.findOne({ where: { id: orderId } });
  //   return order;
  // }

  async findAll(
    page = 1,
    perPage = 10,
    status?: OrderStatus,
  ): Promise<{ data: Order[]; total: number }> {
    const skip = (page - 1) * perPage;
    const take = perPage;
    const cacheKey = `orders:list:${status ?? 'all'}_${skip}_${take}`;

    let result = await this.cacheManager.get<{
      data: Order[];
      total: number;
    }>(cacheKey);

    console.log(result);

    if (!result) {
      const [data, total] = await this.orderRepo.findAndCount({
        where: status ? { status } : {},
        skip,
        take,
      });
      result = { data, total };
      await this.cacheManager.set(cacheKey, result);
    }
    return result;
  }

  async updateStatus(orderId: number, status: OrderStatus): Promise<Order> {
    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');

    try {
      order.status = status;
      const updateOrder = await this.orderRepo.save({
        ...order,
        status,
      });

      await this.cacheManager.del(`order:${orderId}`);

      await this.cacheHelperService.invalidateBulkCache('orders:list*');

      this.notificationGateway.notifyUser(updateOrder.user.id, {
        message: `Your order ${updateOrder.id} is updated`,
        data: updateOrder,
      });

      return updateOrder;
    } catch (error) {
      console.log(error);
      throw new Error('Error while updating');
    }
  }

  async softDelete(id: number): Promise<Order> {
    const order = await this.orderRepo.findOneBy({ id });

    if (!order) {
      throw new NotFoundException('order not found.');
    }
    const deletedOrder = await this.orderRepo.softDelete(id);
    if (deletedOrder.affected !== 1) {
      throw new InternalServerErrorException('Failed to delete order');
    }

    await this.cacheManager.del(`order:${id}`);

    await this.cacheHelperService.invalidateBulkCache('orders:list*');

    this.notificationGateway.notifyUser(order.user.id, {
      message: `Your order ${order.id} is (soft)-deleted`,
      data: order,
    });

    return order;
  }
}
