import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LessonResponse {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: 'Основы TypeScript' })
  title: string;

  @ApiPropertyOptional({ example: 'Базовые концепты TS' })
  description?: string;

  @ApiProperty({ example: { questions: [] } })
  content: object;

  @ApiPropertyOptional({ example: 'https://example.com/test.pdf' })
  pdfUrl?: string;

  @ApiProperty({ example: false })
  isPublic: boolean;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;
}

export class PublicLinkResponse {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  uuid: string;

  @ApiPropertyOptional({ example: '2025-01-01T00:00:00.000Z' })
  expiresAt?: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;
}