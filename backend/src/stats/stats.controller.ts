import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { StatsService } from './stats.service';
import { JwtGuard } from '../auth/jwt.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

interface RequestWithUser extends Request {
  user: { userId: string; email: string; role: string };
}

@ApiTags('Stats')
@ApiBearerAuth()
@Controller('dashboard')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('stats')
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Получение статистики дашборда' })
  @ApiResponse({ status: 200, description: 'Статистика успешно получена', type: Object })
  @ApiResponse({ status: 401, description: 'Неавторизован' })
  async getStats(@Req() req: RequestWithUser) {
    const userId = req.user.userId;
    return this.statsService.getDashboardStats(userId);
  }
}