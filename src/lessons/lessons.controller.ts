import { Body, Controller, Post, Patch, Param, UseGuards, Req } from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { JwtGuard } from '../auth/jwt.guard';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { PublishLessonDto } from './dto/publish-lesson.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiParam } from '@nestjs/swagger';

interface RequestWithUser extends Request {
  user: { id: string; email: string; role: string };
}

@ApiTags('Tests Management')
@ApiBearerAuth()
@Controller('tests')
export class LessonsController {
  constructor(private lessonsService: LessonsService) {}

  @Post()
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Создание нового теста' })
  @ApiBody({ type: CreateLessonDto })
  @ApiResponse({ status: 201, description: 'Тест успешно создан' })
  async create(@Body() dto: CreateLessonDto, @Req() req: RequestWithUser) {
    return this.lessonsService.create(dto, req.user.id);
  }

  @Patch(':id/publish')
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Публикация теста' })
  @ApiParam({ name: 'id', description: 'UUID теста' })
  @ApiBody({ type: PublishLessonDto })
  @ApiResponse({ status: 200, description: 'Публичная ссылка создана/обновлена' })
  async publish(@Param('id') id: string, @Body() dto: PublishLessonDto, @Req() req: RequestWithUser) {
    return this.lessonsService.publish(id, dto, req.user.id);
  }
}