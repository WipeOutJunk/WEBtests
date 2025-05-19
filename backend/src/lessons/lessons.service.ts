// src/lessons/lessons.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';     //  ← добавили
import { randomUUID } from 'crypto';
import { addDays } from 'date-fns';
import { CreateLessonDto } from './dto/create-lesson.dto';

@Injectable()
export class LessonsService {
  constructor(private prisma: PrismaService) {}

  async create(ownerId: string, dto: CreateLessonDto) {
    const lesson = await this.prisma.lesson.create({
      data: {
        title:         dto.title,
        description:   dto.description,
        duration:      dto.duration,
        requireEmail:  dto.requireEmail,
        isPublic:      dto.isPublic,
        pdfUrl:        null,
        ownerId,
        /** 💡 просто кладём массив DTO-шек в JSON-поле */
        questions: dto.questions as unknown as Prisma.InputJsonValue,

      },
      include: { publicLink: true },
    });
  
    if (dto.isPublic) {
      await this.ensurePublicLink(lesson.id);
    }
  
    return lesson;
  }
  private async ensurePublicLink(lessonId: string) {
    const exist = await this.prisma.publicLink.findUnique({ where: { lessonId } });
    if (exist) return exist;

    return this.prisma.publicLink.create({
      data: {
        lessonId,
        uuid: randomUUID(),
        expiresAt: addDays(new Date(), 14),
      },
    });
  }
}
