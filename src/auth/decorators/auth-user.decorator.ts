import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthRequest } from '../../common/interfaces/auth.interface';

export const AuthUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<AuthRequest>();
    return request.user;
  },
);
