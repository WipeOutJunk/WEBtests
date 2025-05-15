import { Module } from '@nestjs/common';
import { PublicService } from './public.service';
import { PublicController } from './public.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AttemptModule } from '../attempt/attempt.module';

@Module({
  imports: [PrismaModule, AttemptModule],
  providers: [PublicService],
  controllers: [PublicController],
  exports: [PublicService],
})
export class PublicModule {}