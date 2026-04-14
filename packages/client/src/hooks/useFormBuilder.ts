import { useState, useCallback } from "react";

export type QuestionTypeValue =
  | "TEXT"
  | "MULTIPLE_CHOICE"
  | "CHECKBOX"
  | "DATE"
  | "EMAIL";

const VALID_QUESTION_TYPES = new Set<QuestionTypeValue>([
  "TEXT",
  "MULTIPLE_CHOICE",
  "CHECKBOX",
  "DATE",
  "EMAIL",
]);

export function isQuestionTypeValue(value: string): value is QuestionTypeValue {
  return VALID_QUESTION_TYPES.has(value as QuestionTypeValue);
}

export interface FormBuilderQuestion {
  id: string;
  type: QuestionTypeValue;
  text: string;
  options: string[];
  required: boolean;
  correctAnswer?: string;
}

const generateId = (): string =>
  `q-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export interface FormBuilderInitial {
  title: string;
  description: string;
  requireEmail: boolean;
  questions: FormBuilderQuestion[];
}

export function useFormBuilder() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [requireEmail, setRequireEmail] = useState(false);
  const [questions, setQuestions] = useState<FormBuilderQuestion[]>([]);

  const initialize = useCallback((data: FormBuilderInitial) => {
    setTitle(data.title);
    setDescription(data.description);
    setRequireEmail(data.requireEmail);
    setQuestions(data.questions);
  }, []);

  const addQuestion = useCallback((type: QuestionTypeValue) => {
    const defaultOptions =
      type === "MULTIPLE_CHOICE" || type === "CHECKBOX" ? ["Option 1"] : [];
    setQuestions((prev) => [
      ...prev,
      {
        id: generateId(),
        type,
        text: "",
        options: defaultOptions,
        required: false,
      },
    ]);
  }, []);

  const updateQuestion = useCallback(
    (id: string, updates: Partial<FormBuilderQuestion>) => {
      setQuestions((prev) =>
        prev.map((q) => (q.id === id ? { ...q, ...updates } : q)),
      );
    },
    [],
  );

  const removeQuestion = useCallback((id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  }, []);

  const addOption = useCallback((questionId: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? { ...q, options: [...q.options, `Option ${q.options.length + 1}`] }
          : q,
      ),
    );
  }, []);

  const updateOption = useCallback(
    (questionId: string, index: number, value: string) => {
      setQuestions((prev) =>
        prev.map((q) => {
          if (q.id !== questionId) return q;
          const next = [...q.options];
          next[index] = value;
          return { ...q, options: next };
        }),
      );
    },
    [],
  );

  const removeOption = useCallback((questionId: string, index: number) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== questionId) return q;
        const next = q.options.filter((_, i) => i !== index);
        return { ...q, options: next };
      }),
    );
  }, []);

  const toMutationInput = useCallback(() => {
    return {
      title,
      description: description || undefined,
      requireEmail,
      questions: questions.map((q) => ({
        type: q.type,
        text: q.text,
        options: q.options.length > 0 ? q.options : undefined,
        required: q.required,
        correctAnswer: q.correctAnswer || undefined,
      })),
    };
  }, [title, description, requireEmail, questions]);

  const reset = useCallback(() => {
    setTitle("");
    setDescription("");
    setRequireEmail(false);
    setQuestions([]);
  }, []);

  return {
    title,
    setTitle,
    description,
    setDescription,
    requireEmail,
    setRequireEmail,
    questions,
    addQuestion,
    updateQuestion,
    removeQuestion,
    addOption,
    updateOption,
    removeOption,
    toMutationInput,
    reset,
    initialize,
  };
}