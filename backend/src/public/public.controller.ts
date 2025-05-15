import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PublicService } from './public.service';
import { AttemptService } from '../attempt/attempt.service';
import { CreateAttemptDto } from '../attempt/dto/create-attempt.dto';

@Controller('public')
export class PublicController {
  constructor(
    private readonly publicService: PublicService,
    private readonly attemptService: AttemptService,
  ) {}

  @Get(':uuid')
  async getTest(@Param('uuid') uuid: string) {
    const lesson = await this.publicService.validatePublicLink(uuid);
    return this.publicService.sanitizeLesson(lesson);
  }

  @Post(':uuid/answers')
  async submitAnswers(@Param('uuid') uuid: string, @Body() createAttemptDto: CreateAttemptDto) {
    const lesson = await this.publicService.validatePublicLink(uuid);
    return this.attemptService.create(lesson.id, createAttemptDto);
  }
}