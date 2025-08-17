import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Patch,
  Query,
  UseGuards,
  Delete,
  ForbiddenException,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/order.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/role-guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserService } from 'src/user/user.service';
import { AuthUser } from 'src/auth/decorators/auth-user.decorator';
import type { JwtPayload } from 'src/common/interfaces/auth.interface';
import { UserRole } from 'src/common/enums/common.enum';
import { OrderQueryDto } from './dto/order-query.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrderController {
  constructor(
    private orderService: OrderService,
    private userService: UserService,
  ) {}

  @Post()
  async create(@AuthUser() authUser: JwtPayload, @Body() dto: CreateOrderDto) {
    const { userId } = authUser;
    // const user = await this.userService.findByEmail(email);
    const order = await this.orderService.create(userId, dto);
    return {
      message: 'Order created successfully',
      data: order,
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@AuthUser() authUser: JwtPayload, @Param('id') id: number) {
    const { role, email } = authUser;
    const order = await this.orderService.findOne(id);

    if (order.user.email !== email && role !== UserRole.ADMIN)
      throw new ForbiddenException('Access denied');

    return {
      message: 'order found',
      data: order,
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async findAll(
    @AuthUser() authUser: JwtPayload,
    @Query() queryDto: OrderQueryDto,
  ) {
    const { page, perPage, status } = queryDto;
    const orders = await this.orderService.findAll(page, perPage, status);

    return {
      message: 'fetched all orders',
      total: orders.total,
      page,
      perPage,
      data: orders.data,
    };
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: number,
    @Body() updateDto: UpdateOrderStatusDto,
  ) {
    const { status } = updateDto;
    const order = await this.orderService.updateStatus(id, status);

    return {
      message: `Order updated`,
      data: order,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  async softDelete(@Param('id') id: number) {
    const deletedOrder = await this.orderService.softDelete(id);
    return { message: `Order (soft)deleted`, data: deletedOrder };
  }
}
