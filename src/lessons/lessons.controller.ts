// src/lessons/lessons.controller.ts
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';

import { LessonsService } from './lessons.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { JwtGuard } from 'src/auth/jwt.guard';

@ApiTags('lessons')
@Controller('lessons')
export class LessonsController {
  constructor(private lessons: LessonsService) {}

  /** создание теста / урока */
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @Post()
  @ApiOperation({
    summary: 'Создать тест или урок',
    description: 'Позволяет авторизованному преподавателю создать новый тест/урок с вопросами и опциями.',
  })
  @ApiBody({
    description: 'Данные для создания теста/урока',
    type: CreateLessonDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Тест/урок успешно создан',
    schema: {
      example: {
        id: 'uuid-урока',
        title: 'Заголовок',
        description: 'Описание (опционально)',
        duration: 45,
        requireEmail: true,
        isPublic: false,
        pdfUrl: null,
        ownerId: 'uuid-автора',
        questions: [
          {
            id: 1616161616161,
            type: 'single',
            text: 'Вопрос?',
            options: [
              { id: 1616161616162, text: 'Ответ 1', correct: true },
              { id: 1616161616163, text: 'Ответ 2', correct: false },
            ],
            correctAnswer: null,
            explanation: 'Пояснение',
          },
          // ...
        ],
        publicLink: {
          uuid: 'public-uuid',
          expiresAt: '2025-06-01T00:00:00.000Z'
        }
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden — недостаточно прав' })
  async create(
    @Body() dto: CreateLessonDto,
    @Req() req: Request,
  ) {
    const userId = req.user!['sub']; // id залогиненного автора
    return this.lessons.create(userId, dto);
  }
}
