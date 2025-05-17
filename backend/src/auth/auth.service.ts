// auth.service.ts
import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { MailerService } from '@nestjs-modules/mailer';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ConfirmDto } from './dto/confirm.dto';
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
    const defaultName = dto.email.split('@')[0] || 'Anonymous';

    const user = await this.users.create({
      email: dto.email,
      fullName: dto.fullName?.trim() || defaultName,
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

    const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            .container { 
                max-width: 400px; 
                display: flex;
                align-items:center;
                margin: 0 auto; 
                background: #1A0B2E; 
                border-radius: 12px; 
                padding: 32px;
                font-family: 'Segoe UI', system-ui, sans-serif;
            }
            .content {
				
            }
            .logo {
                color: #7C3AED;
                font-size: 47px;
                font-weight: 700;
                margin-bottom: 24px;
                text-align: center;
            }
            .code-box {
                background: #2D0A57;
                padding: 24px;
                border-radius: 8px;
                text-align: center;
                margin: 24px 0;
            }
            .code {
                color: #A78BFA;
                font-size: 42px;
                letter-spacing: 8px;
                font-weight: 600;
            }
            .footer {
                color: #6B46C1;
                font-size: 12px;
                text-align: center;
                margin-top: 32px;
            }
        </style>
    </head>
    <body style="background: #0F0523; padding: 70px; height: 800px; display: flex;  ">
        <div class="container">
        <div class="content">
         <div class="logo">intelliTest</div>
            
            <p style="color: #E9D5FF; line-height: 1.6; ">
                Спасибо за регистрацию! Для активации вашего аккаунта 
                используйте следующий код подтверждения:
            </p>
    
            <div class="code-box">
                <div class="code">${code}</div>
            </div>
    
            <p style="color: #C4B5FD; font-size: 14px;">
                ⏳ Код действителен в течение 15 минут<br>
                🔒 Никому не сообщайте этот код
            </p>
    
            <div class="footer">
                С уважением, команда intelliTest<br>
                <span style="font-size: 10px; opacity: 0.8;">Это автоматическое письмо, не отвечайте на него</span>
            </div>
        <div/>
        
        </div>
    </body>
    </html>
    `;

    await this.mailer.sendMail({
      to: user.email,
      subject: '🔒 Код подтверждения для intelliTest',
      html: htmlTemplate,
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
    try {
      const payload = this.jwt.verify(refreshToken, {
        secret: this.cfg.get('JWT_REFRESH_SECRET'),
      }) as { sub: string; email: string; jti: string };
      console.log("Извлечённый payload:", payload);
  
      const stored = await this.prisma.refreshToken.findUnique({
        where: { id: payload.jti },
      });
      console.log("Найденный refreshToken в базе:", stored);
  
      if (!stored) {
        console.log("Токен не найден в базе для jti:", payload.jti);
        throw new UnauthorizedException('Refresh token not found');
      }
      if (stored.expiresAt < new Date()) {
        console.log("Токен истёк для jti:", payload.jti);
        throw new UnauthorizedException('Refresh token expired');
      }
  
      await this.prisma.refreshToken.delete({ where: { id: stored.id } });
      return this.issueTokenPair(payload.sub, payload.email);
    } catch (error) {
      console.error("Ошибка при обновлении токена:", error);
      throw new UnauthorizedException('Invalid refresh token');
    }
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
