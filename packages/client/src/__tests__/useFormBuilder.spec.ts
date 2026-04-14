import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFormBuilder } from '../hooks/useFormBuilder';

// ─── addQuestion ──────────────────────────────────────────────────────────────

describe('useFormBuilder — addQuestion', () => {
  it('appends a TEXT question with empty options', () => {
    const { result } = renderHook(() => useFormBuilder());
    act(() => result.current.addQuestion('TEXT'));

    expect(result.current.questions).toHaveLength(1);
    expect(result.current.questions[0].type).toBe('TEXT');
    expect(result.current.questions[0].options).toEqual([]);
    expect(result.current.questions[0].required).toBe(false);
  });

  it('gives MULTIPLE_CHOICE a default Option 1', () => {
    const { result } = renderHook(() => useFormBuilder());
    act(() => result.current.addQuestion('MULTIPLE_CHOICE'));

    expect(result.current.questions[0].options).toEqual(['Option 1']);
  });

  it('gives CHECKBOX a default Option 1', () => {
    const { result } = renderHook(() => useFormBuilder());
    act(() => result.current.addQuestion('CHECKBOX'));

    expect(result.current.questions[0].options).toEqual(['Option 1']);
  });

  it('adds multiple questions in order', () => {
    const { result } = renderHook(() => useFormBuilder());
    act(() => {
      result.current.addQuestion('TEXT');
      result.current.addQuestion('EMAIL');
    });

    expect(result.current.questions).toHaveLength(2);
    expect(result.current.questions[0].type).toBe('TEXT');
    expect(result.current.questions[1].type).toBe('EMAIL');
  });
});

// ─── removeQuestion ───────────────────────────────────────────────────────────

describe('useFormBuilder — removeQuestion', () => {
  it('removes the question with the matching id', () => {
    const { result } = renderHook(() => useFormBuilder());
    act(() => {
      result.current.addQuestion('TEXT');
      result.current.addQuestion('EMAIL');
    });
    const idToRemove = result.current.questions[0].id;

    act(() => result.current.removeQuestion(idToRemove));

    expect(result.current.questions).toHaveLength(1);
    expect(result.current.questions[0].type).toBe('EMAIL');
  });
});

// ─── updateQuestion ───────────────────────────────────────────────────────────

describe('useFormBuilder — updateQuestion', () => {
  it('updates text of the target question', () => {
    const { result } = renderHook(() => useFormBuilder());
    act(() => result.current.addQuestion('TEXT'));
    const id = result.current.questions[0].id;

    act(() => result.current.updateQuestion(id, { text: 'New text' }));

    expect(result.current.questions[0].text).toBe('New text');
  });

  it('sets correctAnswer without touching other fields', () => {
    const { result } = renderHook(() => useFormBuilder());
    act(() => result.current.addQuestion('TEXT'));
    const id = result.current.questions[0].id;

    act(() => result.current.updateQuestion(id, { correctAnswer: 'Paris' }));

    expect(result.current.questions[0].correctAnswer).toBe('Paris');
    expect(result.current.questions[0].type).toBe('TEXT');
  });

  it('does not modify other questions', () => {
    const { result } = renderHook(() => useFormBuilder());
    act(() => {
      result.current.addQuestion('TEXT');
      result.current.addQuestion('EMAIL');
    });
    const firstId = result.current.questions[0].id;

    act(() => result.current.updateQuestion(firstId, { text: 'Changed' }));

    expect(result.current.questions[1].text).toBe('');
  });
});

// ─── addOption / updateOption / removeOption ──────────────────────────────────

describe('useFormBuilder — option management', () => {
  it('addOption appends a new option', () => {
    const { result } = renderHook(() => useFormBuilder());
    act(() => result.current.addQuestion('MULTIPLE_CHOICE'));
    const id = result.current.questions[0].id;

    act(() => result.current.addOption(id));

    expect(result.current.questions[0].options).toHaveLength(2);
    expect(result.current.questions[0].options[1]).toBe('Option 2');
  });

  it('updateOption replaces the value at the given index', () => {
    const { result } = renderHook(() => useFormBuilder());
    act(() => result.current.addQuestion('MULTIPLE_CHOICE'));
    const id = result.current.questions[0].id;

    act(() => result.current.updateOption(id, 0, 'Yes'));

    expect(result.current.questions[0].options[0]).toBe('Yes');
  });

  it('removeOption removes by index', () => {
    const { result } = renderHook(() => useFormBuilder());
    act(() => {
      result.current.addQuestion('MULTIPLE_CHOICE');
    });
    const id = result.current.questions[0].id;
    act(() => result.current.addOption(id)); // now ['Option 1', 'Option 2']

    act(() => result.current.removeOption(id, 0));

    expect(result.current.questions[0].options).toEqual(['Option 2']);
  });
});

// ─── toMutationInput ─────────────────────────────────────────────────────────

describe('useFormBuilder — toMutationInput', () => {
  it('omits options when empty', () => {
    const { result } = renderHook(() => useFormBuilder());
    act(() => {
      result.current.setTitle('My form');
      result.current.addQuestion('TEXT');
    });

    const input = result.current.toMutationInput();
    expect(input.questions[0].options).toBeUndefined();
  });

  it('includes options when non-empty', () => {
    const { result } = renderHook(() => useFormBuilder());
    act(() => result.current.addQuestion('MULTIPLE_CHOICE'));

    const input = result.current.toMutationInput();
    expect(input.questions[0].options).toEqual(['Option 1']);
  });

  it('includes correctAnswer when set', () => {
    const { result } = renderHook(() => useFormBuilder());
    act(() => result.current.addQuestion('TEXT'));
    const id = result.current.questions[0].id;
    act(() => result.current.updateQuestion(id, { correctAnswer: 'Paris' }));

    const input = result.current.toMutationInput();
    expect(input.questions[0].correctAnswer).toBe('Paris');
  });

  it('omits description when empty', () => {
    const { result } = renderHook(() => useFormBuilder());
    act(() => result.current.setTitle('Form'));

    const input = result.current.toMutationInput();
    expect(input.description).toBeUndefined();
  });
});

// ─── initialize / reset ───────────────────────────────────────────────────────

describe('useFormBuilder — initialize and reset', () => {
  it('initialize populates title, description, and questions', () => {
    const { result } = renderHook(() => useFormBuilder());

    act(() =>
      result.current.initialize({
        title: 'Loaded',
        description: 'Desc',
        requireEmail: false,
        questions: [
          { id: 'q1', type: 'TEXT', text: 'Q1', options: [], required: true, correctAnswer: 'ans' },
        ],
      }),
    );

    expect(result.current.title).toBe('Loaded');
    expect(result.current.description).toBe('Desc');
    expect(result.current.questions).toHaveLength(1);
    expect(result.current.questions[0].correctAnswer).toBe('ans');
  });

  it('reset clears all state', () => {
    const { result } = renderHook(() => useFormBuilder());
    act(() => {
      result.current.setTitle('Something');
      result.current.addQuestion('TEXT');
    });

    act(() => result.current.reset());

    expect(result.current.title).toBe('');
    expect(result.current.questions).toHaveLength(0);
  });
});