export type QuestionType = 'single' | 'multiple' | 'text';

export interface TestData {
  title: string;
  description?: string;
  isPublic: boolean;
  isQuiz: boolean;
  questions: Question[];
  lessonContent?: string;
}

export interface Question {
  id: number;
  type: QuestionType;
  text: string;
  options?: AnswerOption[];
  explanation?: string;
  points?: number;
}

export interface AnswerOption {
  id: number;
  text: string;
  correct: boolean;
}