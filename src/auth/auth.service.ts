// auth.service.ts
import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { MailerService } from '@nestjs-modules/mailer';
import { RegisterDto } from './dto/register.dto';
import { LoginDto }    from './dto/login.dto';
import { ConfirmDto }  from './dto/confirm.dto';
import { addSeconds, isAfter } from 'date-fns';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private users: UsersService,
    private jwt: JwtService,
    private cfg: ConfigService,
    private prisma: PrismaService,
    private mailer: MailerService,
  ) {}

  async register(dto: RegisterDto) {
    if (await this.users.findByEmail(dto.email))
      throw new ConflictException('Email already registered');

    const hash = await bcrypt.hash(
      dto.password,
      +this.cfg.get('SALT_ROUNDS') || 10,
    );
    const user = await this.users.create({
      email: dto.email,
      fullName: dto.fullName,
      passwordHash: hash,
    });

    // генерируем 6-значный код
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const ttl = 900; // 15 минут

    await this.prisma.emailVerification.create({
      data: {
        code,
        userId: user.id,
        expiresAt: addSeconds(new Date(), ttl),
      },
    });

    await this.mailer.sendMail({
      to: user.email,
      subject: 'Код подтверждения',
      html: `
      <p>Ваш код подтверждения для ПК-клуба «Тактика»:</p>
      <h2 style="letter-spacing:3px">${code}</h2>
      <p>Код действителен 15 минут.</p>
    `,
    });

    return { message: 'verification_sent' };
  }
  /* ------------------ CONFIRMATION ------------------ */
  async confirmEmail(dto: ConfirmDto) {
    const user = await this.users.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('User not found');

    const record = await this.prisma.emailVerification.findFirst({
      where: { userId: user.id, code: dto.code },
      orderBy: { createdAt: 'desc' },
    });

    if (!record || isAfter(new Date(), record.expiresAt))
      throw new UnauthorizedException('Code invalid / expired');

    // помечаем email как подтверждённый
    await this.prisma.user.update({
      where: { id: user.id },
      data: { isEmailConfirmed: true },
    });

    // удаляем использованный код
    await this.prisma.emailVerification.delete({ where: { id: record.id } });

    return this.issueTokenPair(user.id, user.email);
  }
  async login(dto: LoginDto) {
    const user = await this.users.findByEmail(dto.email);
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash)))
      throw new UnauthorizedException('Invalid credentials');

    if (!user.isEmailConfirmed)
      throw new UnauthorizedException('E-mail not confirmed');

    return this.issueTokenPair(user.id, user.email);
  }

  async refresh(refreshToken: string) {
    const payload = this.jwt.verify(refreshToken, {
      secret: this.cfg.get('JWT_REFRESH_SECRET'),
    }) as { sub: string; email: string; jti: string };

    // проверяем в БД, что такой refresh ещё валиден
    const stored = await this.prisma.refreshToken.findUnique({
      where: { id: payload.jti },
    });
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
    const accessTtl = +this.cfg.get('ACCESS_TTL') || 900;
    const refreshTtl = +this.cfg.get('REFRESH_TTL') || 1209600;
    const refreshId = crypto.randomUUID();

    const accessToken = this.jwt.sign(
      { sub: userId, email },
      { secret: this.cfg.get<string>('JWT_SECRET'), expiresIn: accessTtl },
    );
    const refreshToken = this.jwt.sign(
      { sub: userId, email, jti: refreshId },
      {
        secret: this.cfg.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: refreshTtl,
      },
    );

    await this.prisma.refreshToken.deleteMany({ where: { userId } });
    await this.prisma.refreshToken.create({
      data: {
        id: refreshId,
        token: refreshToken,
        userId,
        expiresAt: addSeconds(new Date(), refreshTtl),
      },
    });

    return { accessToken, refreshToken, expiresIn: accessTtl };
  }
}
