import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLessonDto {
  @ApiProperty({ example: 'Основы TypeScript', description: 'Название теста' })
  title: string;

  @ApiPropertyOptional({
    example: 'Базовые концепты TypeScript',
    description: 'Описание теста',
  })
  description?: string;

  @ApiProperty({
    example: { questions: [] },
    description: 'Структура теста в JSON-формате',
  })
  content: any;

  @ApiPropertyOptional({
    example: 'https://example.com/test.pdf',
    description: 'Ссылка на PDF-материал',
  })
  pdfUrl?: string;
}