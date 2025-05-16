import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats(userId: string) {
    const [
      totalTests,
      publishedTests,
      attempts24h,
      totalAttempts
    ] = await Promise.all([
      this.prisma.lesson.count({ where: { ownerId: userId } }),
      this.prisma.lesson.count({ 
        where: { ownerId: userId, isPublic: true }
      }),
      this.prisma.attempt.count({
        where: {
          lesson: { ownerId: userId },
          createdAt: { gte: new Date(Date.now() - 24 * 3600 * 1000) }
        }
      }),
      this.prisma.attempt.count({
        where: { lesson: { ownerId: userId } }
      })
    ]);
  
    return {
      totalTests,
      publishedTests,
      attempts24h,
      totalAttempts
    };
  }
}