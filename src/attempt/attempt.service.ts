import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAttemptDto } from './dto/create-attempt.dto';

@Injectable()
export class AttemptService {
  constructor(private prisma: PrismaService) {}

  async create(lessonId: string, dto: CreateAttemptDto) {
    return this.prisma.attempt.create({
      data: {
        lessonId,
        participant: dto.participantName || 'Аноним',
        answers: dto.answers,
      },
    });
  }
  async getAttempts(limit: number, userId: string) {
    return this.prisma.attempt.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      where: {
        lesson: { ownerId: userId }, // Фильтруем попытки по урокам, принадлежащим пользователю
      },
      include: {
        lesson: { select: { title: true } }, // Получаем название урока
      },
    });
  }
}