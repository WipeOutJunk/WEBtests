import { IsString, IsBoolean } from 'class-validator';

export class AnswerOptionDto {
  @IsString()
  text: string;

  @IsBoolean()
  correct: boolean;
}
