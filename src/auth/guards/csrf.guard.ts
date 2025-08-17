import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { Request } from 'express';

@Injectable()
export class CsrfGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const csrfToken = request.headers['x-csrf-token'] as string | undefined;

    if (!csrfToken || csrfToken !== process.env.CSRF_TOKEN) {
      throw new UnauthorizedException('Invalid CSRF token');
    }
    return true;
  }
}
