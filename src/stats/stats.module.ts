import { Module } from '@nestjs/common';
import { StatsService } from './stats.service';
import { PrismaModule } from '../prisma/prisma.module';
import { StatsController } from './stats.controller';

@Module({
  imports: [PrismaModule],
  providers: [StatsService],
  controllers: [StatsController],
})
export class StatsModule {}