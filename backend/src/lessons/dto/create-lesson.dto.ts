import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  Min,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { QuestionDto } from './question.dto';

export class CreateLessonDto {
  /* ---------- базовые поля ---------- */
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  /** длительность (мин), 0 = без ограничения */
  @IsOptional()
  @IsInt()
  @Min(0)
  duration?: number;

  /** публичен ли тест */
  @IsBoolean()
  isPublic: boolean;

  /** обязательно ли вводить email учащемуся */
  @IsBoolean()
  requireEmail: boolean;

  /* ---------- вопросы ---------- */
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionDto)
  questions: QuestionDto[];
}
