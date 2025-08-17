import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
export class NotificationGateway implements OnGatewayInit {
  @WebSocketServer()
  server: Server;

  afterInit() {
    console.log('Notifications Gateway initialized');
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @MessageBody() userId: number,
    @ConnectedSocket() client: Socket,
  ) {
    await client.join(`user_${userId}`);
    console.log(`Client joined room for user ${userId}`);
  }

  notifyUser(userId: number, payload: any) {
    console.log(`Emitting notification to user ${userId}`);
    this.server.to(`user_${userId}`).emit('userNotification', payload);
  }

  notifyAdmins(payload: any) {
    console.log('Emitting notification to all admins');
    this.server.emit('adminNotification', payload);
  }
}
