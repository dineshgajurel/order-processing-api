import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { AuthRequest } from '../../common/interfaces/auth.interface';
import { UserRole } from 'src/common/enums/common.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    console.log('requiredRoles', requiredRoles);
    if (!requiredRoles) return true;
    const request = context.switchToHttp().getRequest<AuthRequest>();
    const user = request.user;

    if (!user) return false;

    return requiredRoles.includes(user.role);
  }
}
