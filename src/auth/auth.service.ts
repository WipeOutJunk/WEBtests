import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { addSeconds } from 'date-fns';     
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private users: UsersService,
    private jwt: JwtService,
    private cfg: ConfigService,
    private prisma: PrismaService,         
  ) {}

  async register(dto: RegisterDto) {
    if (await this.users.findByEmail(dto.email))
      throw new ConflictException('Email already registered');

    const hash = await bcrypt.hash(dto.password, +this.cfg.get('SALT_ROUNDS') || 10);
    const user = await this.users.create({
      email: dto.email,
      fullName: dto.fullName,
      passwordHash: hash,
    });

    return this.issueTokenPair(user.id, user.email);
  }

  async login(dto: LoginDto) {
    const user = await this.users.findByEmail(dto.email);
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash)))
      throw new UnauthorizedException('Invalid credentials');

    return this.issueTokenPair(user.id, user.email);
  }

  async refresh(refreshToken: string) {
    const payload = this.jwt.verify(refreshToken, {
      secret: this.cfg.get('JWT_REFRESH_SECRET'),
    }) as { sub: string; email: string; jti: string };

    // проверяем в БД, что такой refresh ещё валиден
    const stored = await this.prisma.refreshToken.findUnique({ where: { id: payload.jti } });
    if (!stored || stored.expiresAt < new Date())
      throw new UnauthorizedException('Refresh token expired / revoked');

    // ротация: помечаем старый как удалённый и выдаём новый
    await this.prisma.refreshToken.delete({ where: { id: stored.id } });

    return this.issueTokenPair(payload.sub, payload.email);
  }
  async logout(refreshToken: string) {
    // Проверяем валидность и извлекаем JTI
    const payload = this.jwt.verify(refreshToken, {
      secret: this.cfg.get<string>('JWT_REFRESH_SECRET')!,
    }) as { sub: string; email: string; jti: string };
  
    // Удаляем запись из БД (если нет — выбросит ошибку)
    await this.prisma.refreshToken.delete({
      where: { id: payload.jti },
    });
  
    return { ok: true };
  }
  /* ---------- helpers ---------- */

  private async issueTokenPair(userId: string, email: string) {
    const accessTtl  = +this.cfg.get('ACCESS_TTL')  || 900;      // в секундах
    const refreshTtl = +this.cfg.get('REFRESH_TTL') || 1209600;  // в секундах

    // 1) Генерируем уникальный ID для refresh (JTI)
    const refreshId = crypto.randomUUID();

    // 2) Формируем JWT
    const accessToken = this.jwt.sign(
      { sub: userId, email },
      { secret: this.cfg.get<string>('JWT_SECRET')!, expiresIn: accessTtl },
    );
    const refreshToken = this.jwt.sign(
      { sub: userId, email, jti: refreshId },
      { secret: this.cfg.get<string>('JWT_REFRESH_SECRET')!, expiresIn: refreshTtl },
    );

    // 3) Удаляем все старые записи для этого пользователя
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });

    // 4) Сохраняем новый refresh-токен
    await this.prisma.refreshToken.create({
      data: {
        id:        refreshId,
        token:     refreshToken,
        userId:    userId,
        expiresAt: addSeconds(new Date(), refreshTtl),
      },
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: accessTtl,
    };
  }
}
