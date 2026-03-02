import { useState, useCallback } from "react";

export type QuestionTypeValue =
  | "TEXT"
  | "MULTIPLE_CHOICE"
  | "CHECKBOX"
  | "DATE";

export interface FormBuilderQuestion {
  id: string;
  type: QuestionTypeValue;
  text: string;
  options: string[];
  required: boolean;
}

const generateId = (): string =>
  `q-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export function useFormBuilder() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<FormBuilderQuestion[]>([]);

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
      questions: questions.map((q) => ({
        type: q.type,
        text: q.text,
        options: q.options.length > 0 ? q.options : undefined,
        required: q.required,
      })),
    };
  }, [title, description, questions]);

  const reset = useCallback(() => {
    setTitle("");
    setDescription("");
    setQuestions([]);
  }, []);

  return {
    title,
    setTitle,
    description,
    setDescription,
    questions,
    addQuestion,
    updateQuestion,
    removeQuestion,
    addOption,
    updateOption,
    removeOption,
    toMutationInput,
    reset,
  };
}
