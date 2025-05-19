import {
    IsString,
    IsEnum,
    IsOptional,
    IsArray,
    ValidateNested,
  } from 'class-validator';
  import { Type } from 'class-transformer';
  import { AnswerOptionDto } from './answer-option.dto';
  
  export enum QuestionTypeEnum {
    SINGLE   = 'single',
    MULTIPLE = 'multiple',
    TEXT     = 'text',
  }
  
  export class QuestionDto {
    @IsEnum(QuestionTypeEnum)
    type: QuestionTypeEnum;
  
    @IsString()
    text: string;
  
    /** Заполняется ТОЛЬКО для текстовых вопросов */
    @IsOptional()
    @IsString()
    correctAnswer?: string;
  
    @IsOptional()
    @IsString()
    explanation?: string;
  
    /** Массив вариантов – только для single/multiple */
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AnswerOptionDto)
    options?: AnswerOptionDto[];
  }
  