import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TestsService {
  constructor(private prisma: PrismaService) {}

  async getTests(userId: string) {
    return this.prisma.lesson.findMany({
        where: { ownerId: userId },
        include: {
          _count: {
            select: { attempts: true }
          }
        }
      });
  }
}