import {
  Controller,
  Delete,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/role-guard';
import { AuthUser } from 'src/auth/decorators/auth-user.decorator';
import type { JwtPayload } from 'src/common/interfaces/auth.interface';
import { PaginationDto } from '../common/dto/pagination.dto';
import { UserRole } from 'src/common/enums/common.enum';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@AuthUser() authUser: JwtPayload) {
    const { email } = authUser;
    const user = await this.userService.findByEmail(email);
    return {
      message: 'user found',
      data: user,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  async getAll(@AuthUser() user: JwtPayload, @Query() queryDto: PaginationDto) {
    const { page, perPage } = queryDto;
    const users = await this.userService.findAll(page, perPage);

    return {
      message: 'fetched all users',
      total: users.total,
      page,
      perPage,
      data: users.data,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  async softDelete(@AuthUser() user: JwtPayload, @Param('id') id: number) {
    const deletedUser = await this.userService.softDelete(id);
    return { message: `User ${id} soft-deleted`, data: deletedUser };
  }
}
