import {
  Body,
  Controller,
  Post,
  HttpCode,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { LogoutDto } from './dto/logout.dto';
import { RefreshDto } from './dto/refresh.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Регистрация' })
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Post('login')
  @HttpCode(200)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response, // ← здесь
  ) {
    const { accessToken, refreshToken, expiresIn } = await this.auth.login(dto);
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      path: '/auth/refresh',
      maxAge: expiresIn * 1000 * 7,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    return { accessToken, expiresIn };
  }

  @Post('refresh')
  @HttpCode(200)
  async refresh(
    @Req() req: Request, 
    @Res({ passthrough: true }) res: Response,
  ) {
    const cookie = req.cookies['refreshToken'];
    if (!cookie) throw new UnauthorizedException('Refresh token not found');
    const { accessToken, refreshToken, expiresIn } =
      await this.auth.refresh(cookie);
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      path: '/auth/refresh',
      maxAge: expiresIn * 1000 * 7,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    return { accessToken, expiresIn };
  }

  @Post('logout')
  @HttpCode(200)
  async logout(
    @Body() dto: LogoutDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.auth.logout(dto.refreshToken);
    res.clearCookie('refreshToken', { path: '/auth/refresh' });
    return { ok: true };
  }
}
