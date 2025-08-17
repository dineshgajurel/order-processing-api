import { UserRole } from '../enums/common.enum';

export interface JwtPayload {
  sub: number;
  id: number;
  userId: number;
  email: string;
  role: UserRole;
}

export interface AuthRequest extends Request {
  user: JwtPayload;
}
