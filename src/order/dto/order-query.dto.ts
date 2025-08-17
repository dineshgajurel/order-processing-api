import { IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { OrderStatus } from 'src/common/enums/common.enum';

export class OrderQueryDto extends PaginationDto {
  @IsOptional()
  status?: OrderStatus;
}
