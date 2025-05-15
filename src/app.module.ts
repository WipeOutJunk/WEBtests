import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { AttemptsModule } from './attempt/attempt.module';
import { LessonsModule } from './lessons/lessons.module';
import { PublicModule } from './public/public.module';
import { StatsModule } from './stats/stats.module';
import { TestsModule } from './tests/tests.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UsersModule,
    AuthModule,
    AttemptsModule,
    LessonsModule,
    PublicModule,
    StatsModule,
    TestsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
