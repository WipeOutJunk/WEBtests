import { Module } from '@nestjs/common';
import { AttemptService } from './attempt.service';

import { PrismaModule } from '../prisma/prisma.module';
import { AttemptController } from './attempt.controller';

@Module({
  imports: [PrismaModule],
  providers: [AttemptService],
  controllers: [AttemptController],
  exports: [AttemptService],
})
export class AttemptsModule {}