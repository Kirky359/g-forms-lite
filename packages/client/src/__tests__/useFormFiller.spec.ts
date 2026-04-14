import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QuestionType } from '@forms/shared';
import type { Question } from '@forms/shared';
import { useFormFiller } from '../hooks/useFormFiller';

const q = (overrides: Partial<Question> = {}): Question => ({
  id: 'q1',
  type: QuestionType.TEXT,
  text: 'Question',
  required: false,
  ...overrides,
});

// ─── validate ────────────────────────────────────────────────────────────────

describe('useFormFiller — validate', () => {
  it('returns true when form has no required questions', () => {
    const { result } = renderHook(() => useFormFiller([q()]));
    expect(result.current.validate()).toBe(true);
  });

  it('returns false when a required text question is unanswered', () => {
    const { result } = renderHook(() => useFormFiller([q({ required: true })]));
    expect(result.current.validate()).toBe(false);
  });

  it('returns true once the required question is answered', () => {
    const { result } = renderHook(() => useFormFiller([q({ required: true })]));

    act(() => result.current.setAnswer('q1', 'hello'));

    expect(result.current.validate()).toBe(true);
  });

  it('returns false when a required checkbox question has no selections', () => {
    const { result } = renderHook(() =>
      useFormFiller([q({ type: QuestionType.CHECKBOX, required: true })]),
    );
    act(() => result.current.setAnswer('q1', []));

    expect(result.current.validate()).toBe(false);
  });

  it('returns true when required checkbox has at least one selection', () => {
    const { result } = renderHook(() =>
      useFormFiller([q({ type: QuestionType.CHECKBOX, required: true })]),
    );
    act(() => result.current.setAnswer('q1', ['Option A']));

    expect(result.current.validate()).toBe(true);
  });

  it('returns false for invalid email format', () => {
    const { result } = renderHook(() =>
      useFormFiller([q({ type: QuestionType.EMAIL })]),
    );
    act(() => result.current.setAnswer('q1', 'not-an-email'));

    expect(result.current.validate()).toBe(false);
  });

  it('returns true for a valid email', () => {
    const { result } = renderHook(() =>
      useFormFiller([q({ type: QuestionType.EMAIL })]),
    );
    act(() => result.current.setAnswer('q1', 'user@example.com'));

    expect(result.current.validate()).toBe(true);
  });

  it('ignores empty optional email (does not validate format)', () => {
    const { result } = renderHook(() =>
      useFormFiller([q({ type: QuestionType.EMAIL, required: false })]),
    );
    // no answer set — empty email is fine if not required
    expect(result.current.validate()).toBe(true);
  });
});

// ─── toSubmitFormat ───────────────────────────────────────────────────────────

describe('useFormFiller — toSubmitFormat', () => {
  it('maps string answers to { questionId, value }', () => {
    const { result } = renderHook(() => useFormFiller([q()]));
    act(() => result.current.setAnswer('q1', 'hello'));

    const formatted = result.current.toSubmitFormat();
    expect(formatted).toEqual([{ questionId: 'q1', value: 'hello' }]);
  });

  it('JSON-stringifies array answers (CHECKBOX)', () => {
    const { result } = renderHook(() =>
      useFormFiller([q({ type: QuestionType.CHECKBOX })]),
    );
    act(() => result.current.setAnswer('q1', ['A', 'B']));

    const formatted = result.current.toSubmitFormat();
    expect(formatted[0].value).toBe('["A","B"]');
  });

  it('returns empty string for unanswered questions', () => {
    const { result } = renderHook(() => useFormFiller([q()]));

    const formatted = result.current.toSubmitFormat();
    expect(formatted[0].value).toBe('');
  });

  it('preserves question order across multiple questions', () => {
    const questions = [
      q({ id: 'q1', text: 'First' }),
      q({ id: 'q2', text: 'Second' }),
    ];
    const { result } = renderHook(() => useFormFiller(questions));
    act(() => {
      result.current.setAnswer('q1', 'one');
      result.current.setAnswer('q2', 'two');
    });

    const formatted = result.current.toSubmitFormat();
    expect(formatted[0]).toEqual({ questionId: 'q1', value: 'one' });
    expect(formatted[1]).toEqual({ questionId: 'q2', value: 'two' });
  });
});