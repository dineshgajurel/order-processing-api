import { registerAs } from '@nestjs/config';

export default registerAs('authConfig', () => ({
  jwtSecret: process.env.JWT_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  jwtExpiration: process.env.JWT_EXPIRATION,
  jwtRefreshExpiration: process.env.JWT_REFRESH_EXPIRATION,
  csrfToken: process.env.CSRF_TOKEN || 'csrfsecret',
}));
