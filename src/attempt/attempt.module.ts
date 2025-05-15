import { Module } from '@nestjs/common';
import { AttemptService } from './attempt.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [AttemptService],
  exports: [AttemptService],
})
export class AttemptModule {}