import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { AttemptService } from './attempt.service';
import { JwtGuard } from '../auth/jwt.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';

interface RequestWithUser extends Request {
  user: { id: string; email: string; role: string };
}

@ApiTags('Attempts')
@ApiBearerAuth()
@Controller('attempts')
export class AttemptController {
  constructor(private readonly attemptsService: AttemptService) {}

  @Get()
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Получение списка попыток' })
  @ApiQuery({ name: 'limit', type: Number, description: 'Лимит записей' })
  @ApiResponse({ status: 200, description: 'Список попыток успешно получен', type: Array })
  @ApiResponse({ status: 401, description: 'Неавторизован' })
  async getAttempts(@Query('limit') limit: string, @Req() req: RequestWithUser) {
    const limitNum = parseInt(limit, 10) || 10;
    const userId = req.user.id;
    const attempts = await this.attemptsService.getAttempts(limitNum, userId);
    // Форматируем данные для соответствия фронтенду
    return attempts.map(attempt => ({
      id: attempt.id,
      title: attempt.lesson.title,
      date: attempt.createdAt.toISOString(),
      participant: attempt.participant,
      score: null, // Если у вас нет баллов в модели, оставляем null
    }));
  }
}