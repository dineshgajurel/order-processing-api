import { Type } from 'class-transformer';
import { IsEnum } from 'class-validator';
import { OrderStatus } from 'src/common/enums/common.enum';

import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  IsArray,
  ValidateNested,
} from 'class-validator';

export class OrderItemDto {
  @IsInt()
  id: number;

  @IsString()
  name: string;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}
export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
