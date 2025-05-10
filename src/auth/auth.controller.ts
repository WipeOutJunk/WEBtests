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
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
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
  @ApiOperation({ summary: 'Обновление access + refresh токенов' })
  @ApiBody({ type: RefreshDto })
  @HttpCode(200)
  async refresh(
    @Body('refreshToken') bodyToken: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {

    const token = bodyToken ?? req.cookies['refreshToken'];
    if (!token) {
      throw new UnauthorizedException('Refresh token not provided');
    }

    const { accessToken, refreshToken, expiresIn } = await this.auth.refresh(token);

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
