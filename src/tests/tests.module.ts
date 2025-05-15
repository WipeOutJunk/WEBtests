import { Module } from '@nestjs/common';
import { TestsService } from './tests.service';
import { TestsController } from './test.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [TestsService],
  controllers: [TestsController],
})
export class TestsModule {}