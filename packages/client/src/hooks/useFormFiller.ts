import { useState, useCallback } from 'react';
import type { Question } from '@forms/shared';

export interface FormFillerAnswers {
  [questionId: string]: string | string[];
}

export function useFormFiller(questions: Question[]) {
  const [answers, setAnswers] = useState<FormFillerAnswers>({});

  const setAnswer = useCallback((questionId: string, value: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }, []);

  const toSubmitFormat = useCallback((): Array<{ questionId: string; value: string }> => {
    return questions.map((q) => {
      const val = answers[q.id];
      const str =
        Array.isArray(val) ? JSON.stringify(val) : (val as string) ?? '';
      return { questionId: q.id, value: str };
    });
  }, [questions, answers]);

  const validate = useCallback((): boolean => {
    for (const q of questions) {
      if (!q.required) continue;
      const val = answers[q.id];
      if (val === undefined || val === '') return false;
      if (Array.isArray(val) && val.length === 0) return false;
    }
    return true;
  }, [questions, answers]);

  return { answers, setAnswer, toSubmitFormat, validate };
}
