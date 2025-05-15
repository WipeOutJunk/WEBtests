import { Module } from '@nestjs/common';
import { StatsService } from './stats.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [StatsService],
})
export class StatsModule {}