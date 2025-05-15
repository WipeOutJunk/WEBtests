import { Module } from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { LessonsController } from './lessons.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { PublicModule } from '../public/public.module';

@Module({
  imports: [PrismaModule, PublicModule],
  providers: [LessonsService],
  controllers: [LessonsController],
})
export class LessonsModule {}