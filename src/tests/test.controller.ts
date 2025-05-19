// src/tests/tests.controller.ts
import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  UseGuards,
  Req,
  NotFoundException,
} from '@nestjs/common';
import { JwtGuard } from '../auth/jwt.guard';
import { TestsService } from './tests.service';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { Request } from 'express';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

interface RequestWithUser extends Request {
  user: { userId: string; email: string; role: string };
}

@ApiTags('Tests')
@ApiBearerAuth()
@UseGuards(JwtGuard) 
@Controller('tests')
export class TestsController {
  constructor(private readonly testsService: TestsService) {}

  /** Получение списка тестов текущего пользователя */
  @Get()
  @ApiOperation({ summary: 'Получение списка тестов' })
  @ApiResponse({ status: 200, description: 'OK', type: Array })
  async getTests(@Req() req: RequestWithUser) {
    // теперь req.user.id всегда будет задан
    const userId = req.user.userId;
    const tests = await this.testsService.getTests(userId);
    return tests.map(t => ({
      id: t.id,
      title: t.title,
      status: t.isPublic ? 'published' : 'draft',
      isPublic: t.isPublic,
      publicLink: t.publicLink ? `/p/${t.publicLink.uuid}` : null,
      attemptsCount: t._count.attempts,
      createdAt: t.createdAt.toISOString(),
    }));
  }

  /** Получение одного теста по id (для редактирования) */
  @Get(':id')
  @ApiOperation({ summary: 'Получить тест по id' })
  @ApiResponse({ status: 200, description: 'Тест найден' })
  @ApiResponse({ status: 404, description: 'Не найден' })
  async one(@Param('id') id: string, @Req() req: RequestWithUser) {
    const userId = req.user.userId;
    const lesson = await this.testsService.getTestById(userId, id);
    if (!lesson) {
      throw new NotFoundException('Тест не найден или нет доступа');
    }
    return lesson;
  }

  /** Обновление теста */
  @Put(':id')
  @ApiOperation({ summary: 'Обновить тест' })
  @ApiResponse({ status: 200, description: 'Тест обновлён' })
  @ApiResponse({ status: 403, description: 'Нет доступа' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateLessonDto,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.userId;
    return this.testsService.updateTest(userId, id, dto);
  }
}
