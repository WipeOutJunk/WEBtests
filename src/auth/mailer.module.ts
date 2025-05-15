// mailer.module.ts
import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: process.env.SMTP_USER,      
          pass: process.env.SMTP_PASS,
        },
      },
      defaults: {
        from: '"ПК-клуб Тактика" <no-reply@tactica.gg>',
      },
    }),
  ],
  exports: [MailerModule],
})
export class AppMailerModule {}
