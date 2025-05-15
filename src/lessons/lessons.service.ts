import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { PublishLessonDto } from './dto/publish-lesson.dto';
import { LessonResponse, PublicLinkResponse } from './dto/lesson-response.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LessonsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateLessonDto, ownerId: string): Promise<LessonResponse> {
    const lesson = await this.prisma.lesson.create({
      data: {
        ...dto,
        pdfUrl: dto.pdfUrl || null,
        ownerId,
      },
    });
    return this.toLessonResponse(lesson);
  }

  async publish(id: string, { expiresAt }: PublishLessonDto, userId: string): Promise<PublicLinkResponse> {
    await this.validateOwnership(id, userId);
    const expiresAtValue = expiresAt !== undefined ? expiresAt : null;
    const publicLink = await this.prisma.publicLink.upsert({
      where: { lessonId: id },
      create: {
        uuid: uuidv4(),
        expiresAt: expiresAtValue,
        lessonId: id,
      },
      update: {
        expiresAt: expiresAtValue,
      },
    });
    return this.toPublicLinkResponse(publicLink);
  }

  private toLessonResponse(lesson: any): LessonResponse {
    return {
      id: lesson.id,
      title: lesson.title,
      description: lesson.description,
      content: lesson.content,
      pdfUrl: lesson.pdfUrl,
      isPublic: lesson.isPublic,
      createdAt: lesson.createdAt,
    };
  }

  private toPublicLinkResponse(publicLink: any): PublicLinkResponse {
    return {
      id: publicLink.id,
      uuid: publicLink.uuid,
      expiresAt: publicLink.expiresAt || undefined, 
      createdAt: publicLink.createdAt,
    };
  }

  private async validateOwnership(lessonId: string, userId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
    });
    if (!lesson) throw new NotFoundException('Тест не найден');
    if (lesson.ownerId !== userId) throw new ForbiddenException('Вы не являетесь владельцем этого теста');
  }
}