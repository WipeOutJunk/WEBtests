import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { TestsService } from './tests.service';
import { JwtGuard } from '../auth/jwt.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

interface RequestWithUser extends Request {
  user: { id: string; email: string; role: string };
}

@ApiTags('Tests')
@ApiBearerAuth()
@Controller('tests')
export class TestsController {
  constructor(private readonly testsService: TestsService) {}

  @Get()
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Получение списка тестов' })
  @ApiResponse({ status: 200, description: 'Список тестов успешно получен', type: Array })
  @ApiResponse({ status: 401, description: 'Неавторизован' })
  async getTests(@Req() req: RequestWithUser) {
    const userId = req.user.id;
    const tests = await this.testsService.getTests(userId);
    // Форматируем данные для соответствия фронтенду
    return tests.map(test => ({
      id: test.id,
      title: test.title,
      status: test.isPublic ? 'published' : 'draft',
      createdAt: test.createdAt.toISOString(),
    }));
  }
}