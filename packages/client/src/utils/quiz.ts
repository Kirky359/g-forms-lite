import type { Question } from '@forms/shared';

export function isAnswerCorrect(q: Question, rawValue: string): boolean {
  if (!q.correctAnswer || rawValue === '') return false;

  if (q.type === 'CHECKBOX') {
    try {
      const submitted = (JSON.parse(rawValue) as string[]).slice().sort();
      const correct = (JSON.parse(q.correctAnswer) as string[]).slice().sort();
      return submitted.join('\0') === correct.join('\0');
    } catch {
      return false;
    }
  }

  if (q.type === 'MULTIPLE_CHOICE') {
    return rawValue === q.correctAnswer;
  }

  // TEXT, EMAIL, DATE — case-insensitive trimmed match
  return rawValue.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
}

export function formatDisplayValue(q: Question, rawValue: string): string {
  if (rawValue === '') return '(no answer)';

  if (q.type === 'CHECKBOX') {
    try {
      const arr = JSON.parse(rawValue) as string[];
      return Array.isArray(arr) && arr.length > 0 ? arr.join(', ') : '(no answer)';
    } catch {
      return rawValue;
    }
  }

  return rawValue;
}

export function formatCorrectAnswer(q: Question): string {
  if (!q.correctAnswer) return '';

  if (q.type === 'CHECKBOX') {
    try {
      return (JSON.parse(q.correctAnswer) as string[]).join(', ');
    } catch {
      return q.correctAnswer;
    }
  }

  return q.correctAnswer;
}