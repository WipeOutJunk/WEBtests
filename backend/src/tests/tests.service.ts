// src/tests/tests.service.ts
import { Injectable, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateLessonDto } from './dto/update-lesson.dto';

@Injectable()
export class TestsService {
  private readonly logger = new Logger(TestsService.name);

  constructor(private prisma: PrismaService) {}

  /** Получение списка тестов */
  async getTests(ownerId: string) {
    this.logger.log(`getTests called by ownerId=${ownerId}`);
    const results = await this.prisma.lesson.findMany({
      where: { ownerId },
      include: {
        publicLink: true,
        _count: { select: { attempts: true } },
      },
    });
    this.logger.log(`getTests returned ${results.length} lessons`);
    return results;
  }

  /** Получить один тест по id */
  async getTestById(ownerId: string, id: string) {
    this.logger.log(`getTestById called with ownerId=${ownerId}, id=${id}`);
    const lesson = await this.prisma.lesson.findUnique({ where: { id } });
    if (!lesson) {
      this.logger.warn(`Lesson with id=${id} not found`);
      return null;
    }
    if (lesson.ownerId !== ownerId) {
      this.logger.warn(`Owner mismatch: lesson.ownerId=${lesson.ownerId} ≠ caller=${ownerId}`);
      return null;
    }
    this.logger.log(`Lesson found and access granted: ${JSON.stringify({ id: lesson.id, title: lesson.title })}`);
    return lesson;
  }

  /** Обновление теста */
  async updateTest(ownerId: string, id: string, dto: UpdateLessonDto) {
    this.logger.log(`updateTest called with ownerId=${ownerId}, id=${id}, dto=${JSON.stringify(dto)}`);
    const lesson = await this.prisma.lesson.findUnique({ where: { id } });
    if (!lesson || lesson.ownerId !== ownerId) {
      this.logger.error(`Access denied or lesson not found for id=${id}, ownerId=${ownerId}`);
      throw new ForbiddenException('Нет доступа');
    }

    const updated = await this.prisma.lesson.update({
      where: { id },
      data: {
        title:        dto.title,
        description:  dto.description,
        duration:     dto.duration,
        requireEmail: dto.requireEmail,
        isPublic:     dto.isPublic,
        questions:    dto.questions as any, // JSON-массив
      },
    });
    this.logger.log(`Lesson updated successfully: id=${id}`);
    return updated;
  }
}
