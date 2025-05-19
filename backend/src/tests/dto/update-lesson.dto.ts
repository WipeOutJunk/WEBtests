// src/tests/dto/update-lesson.dto.ts
import { IsString, IsBoolean, IsNumber, IsOptional, IsArray } from 'class-validator';

export class UpdateLessonDto {
  @IsString()  title: string;
  @IsOptional() @IsString() description?: string;

  @IsBoolean() isPublic: boolean;
  @IsBoolean() requireEmail: boolean;
  @IsBoolean() isQuiz: boolean;

  @IsNumber()  duration: number;

  @IsArray()   questions: any[];
  // lessonContent исключили, пока нет поля в БД
}
