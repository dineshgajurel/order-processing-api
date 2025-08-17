import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from 'src/user/user.service';
import { RegisterDto } from './dto/auth.dto';
import { User } from 'src/user/entities/user.entity';
import authConfig from './config/auth.config';
import type { ConfigType } from '@nestjs/config';
import { JwtPayload } from 'src/common/interfaces/auth.interface';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,

    @Inject(authConfig.KEY)
    private readonly authConfiguration: ConfigType<typeof authConfig>,
  ) {}

  async register(registerDto: RegisterDto) {
    const { password } = registerDto;

    const hashedPassword = await bcrypt.hash(password, 10);
    return this.userService.create({
      ...registerDto,
      password: hashedPassword,
    });
  }

  async login(email: string, password: string) {
    const user = await this._validateUser(email, password);
    return this._getTokens(user);
  }

  private async _validateUser(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    const matchPassword = await bcrypt.compare(password, user.password);

    if (!matchPassword) throw new UnauthorizedException('Invalid credentials');
    return user;
  }

  private _getTokens(user: User) {
    const payload = {
      sub: user.id,
      id: user.id,
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.authConfiguration.jwtSecret,
      expiresIn: this.authConfiguration.jwtExpiration,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.authConfiguration.jwtRefreshSecret,
      expiresIn: this.authConfiguration.jwtRefreshExpiration,
    });

    return { accessToken, refreshToken };
  }

  refreshAccessToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: this.authConfiguration.jwtRefreshSecret,
      });

      const accessToken = this.jwtService.sign(
        { sub: payload.sub, role: payload.role },
        {
          secret: process.env.JWT_SECRET,
          expiresIn: this.authConfiguration.jwtExpiration,
        },
      );

      return { accessToken };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   *
   * @TODO
   * actual logout implementation
   * for now token will expire natuarally
   * we can implement db/redis based token revocation
   */
  logout(authUser: JwtPayload) {
    console.log(authUser);
    // TODO: implement actual logout
  }
}
