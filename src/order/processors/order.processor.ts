import { NotificationGateway } from '../../notification/notification.gateway';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { OrderService } from '../order.service';
import { OrderStatus } from 'src/common/enums/common.enum';

@Processor('orders')
export class OrdersProcessor extends WorkerHost {
  constructor(
    private readonly orderService: OrderService,
    private readonly notificationGateway: NotificationGateway,
  ) {
    super();
  }

  async process(job: Job<{ orderId: number }, any, string>): Promise<any> {
    switch (job.name) {
      case 'processOrder': {
        const orderId = job.data.orderId;

        // const order await this.orderService.findOneByID(orderId);
        const order = await this.orderService.findOne(orderId);

        if (order) {
          this.notificationGateway.notifyAdmins({
            message: 'New order created',
            orderId: order.id,
            userId: order.user.id,
            items: order.items,
          });
        }

        console.log('Processing order:', job.data);

        await new Promise((resolve) => setTimeout(resolve, 5000));

        // Update status to PROCESSING for testing
        await this.orderService.updateStatus(orderId, OrderStatus.PROCESSING);

        if (order) {
          this.notificationGateway.notifyUser(+order.user.id, {
            message: `Your order ${orderId} is updated`,
            status: order.status,
            data: order,
          });
        }

        console.log(`Order ${orderId} processed!`);
        return {};
      }
    }
  }
}
