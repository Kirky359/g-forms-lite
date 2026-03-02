export enum QuestionType {
  TEXT = "TEXT",
  MULTIPLE_CHOICE = "MULTIPLE_CHOICE",
  CHECKBOX = "CHECKBOX",
  DATE = "DATE",
}

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  options?: string[];
  required?: boolean;
}

export interface Form {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
}

export interface Answer {
  questionId: string;
  value: string;
}

export interface Response {
  id: string;
  formId: string;
  answers: Answer[];
}

export interface QuestionInput {
  type: QuestionType;
  text: string;
  options?: string[];
  required?: boolean;
}

export interface AnswerInput {
  questionId: string;
  value: string;
}
