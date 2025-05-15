import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Lesson, PublicLink } from '@prisma/client';

@Injectable()
export class PublicService {
  constructor(private prisma: PrismaService) {}

  async validatePublicLink(uuid: string): Promise<Lesson> {
    const publicLink = await this.prisma.publicLink.findUnique({
      where: { uuid },
      include: { lesson: true },
    });
    if (!publicLink || this.isLinkExpired(publicLink)) {
      throw new NotFoundException('Тест не найден или ссылка истекла');
    }
    return publicLink.lesson;
  }

  private isLinkExpired(link: PublicLink): boolean {
    if (!link.expiresAt) return false;
    return link.expiresAt < new Date();
  }

  sanitizeLesson(lesson: Lesson) {
    const { ownerId, pdfUrl, ...sanitized } = lesson;
    return sanitized;
  }
}