export enum QuestionType {
  TEXT = "TEXT",
  MULTIPLE_CHOICE = "MULTIPLE_CHOICE",
  CHECKBOX = "CHECKBOX",
  DATE = "DATE",
  EMAIL = "EMAIL",
}

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  options?: string[];
  required?: boolean;
  correctAnswer?: string;
}

export interface Form {
  id: string;
  title: string;
  description?: string;
  requireEmail: boolean;
  questions: Question[];
}

export interface Answer {
  questionId: string;
  value: string;
}

export interface Response {
  id: string;
  formId: string;
  respondentEmail?: string;
  answers: Answer[];
  score?: number;
}

export interface QuestionInput {
  type: QuestionType;
  text: string;
  options?: string[];
  required?: boolean;
  correctAnswer?: string;
}

export interface AnswerInput {
  questionId: string;
  value: string;
}

export const MAX_TEXT_LENGTH = 1000;