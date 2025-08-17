import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RefreshTokenDto, RegisterDto } from './dto/auth.dto';
import { LoginDto } from './dto/auth.dto';
// import { Request } from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ThrottlerGuard } from '@nestjs/throttler';
import { CsrfGuard } from './guards/csrf.guard';
import { AuthUser } from './decorators/auth-user.decorator';
import type { JwtPayload } from 'src/common/interfaces/auth.interface';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    const user = await this.authService.register(registerDto);
    return {
      message: 'User registered',
      data: user,
    };
  }

  @Post('login')
  @UseGuards(ThrottlerGuard)
  async login(@Body() loginDto: LoginDto) {
    const { email, password } = loginDto;

    const login = await this.authService.login(email, password);
    return {
      message: 'User logged in',
      data: login,
    };
  }

  @Post('refresh')
  @UseGuards(CsrfGuard)
  refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    const { refreshToken } = refreshTokenDto;

    const accessToken = this.authService.refreshAccessToken(refreshToken);
    return {
      message: 'Access token refreshed',
      data: accessToken,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@AuthUser() authUser: JwtPayload) {
    this.authService.logout(authUser);
    return { message: 'Logged out' };
  }
}
