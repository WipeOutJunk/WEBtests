import { ApiPropertyOptional } from '@nestjs/swagger';

export class PublishLessonDto {
  @ApiPropertyOptional({
    example: '2024-12-31T23:59:59Z',
    description: 'Дата истечения срока ссылки в формате ISO',
  })
  expiresAt?: Date;
}