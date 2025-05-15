import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { AttemptModule } from './attempt/attempt.module';
import { LessonsModule } from './lessons/lessons.module';
import { PublicModule } from './public/public.module';
import { StatsModule } from './stats/stats.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UsersModule,
    AuthModule,
    AttemptModule,
    LessonsModule,
    PublicModule,
    StatsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
