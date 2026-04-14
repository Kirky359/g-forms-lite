import { describe, it, expect } from 'vitest';
import { QuestionType } from '@forms/shared';
import type { Question } from '@forms/shared';
import {
  isAnswerCorrect,
  formatDisplayValue,
  formatCorrectAnswer,
} from '../utils/quiz';

const q = (overrides: Partial<Question> = {}): Question => ({
  id: 'q1',
  type: QuestionType.TEXT,
  text: 'Q',
  ...overrides,
});

// ─── isAnswerCorrect ──────────────────────────────────────────────────────────

describe('isAnswerCorrect', () => {
  describe('no correctAnswer set', () => {
    it('returns false even when answer matches a value', () => {
      expect(isAnswerCorrect(q({ correctAnswer: undefined }), 'hello')).toBe(false);
    });
  });

  describe('empty answer', () => {
    it('returns false when rawValue is empty string', () => {
      expect(isAnswerCorrect(q({ correctAnswer: 'hello' }), '')).toBe(false);
    });
  });

  describe('MULTIPLE_CHOICE', () => {
    const mc = (correctAnswer: string) =>
      q({ type: QuestionType.MULTIPLE_CHOICE, correctAnswer });

    it('returns true on exact match', () => {
      expect(isAnswerCorrect(mc('Option A'), 'Option A')).toBe(true);
    });

    it('returns false on wrong option', () => {
      expect(isAnswerCorrect(mc('Option A'), 'Option B')).toBe(false);
    });

    it('returns false on case mismatch (exact match required)', () => {
      expect(isAnswerCorrect(mc('Option A'), 'option a')).toBe(false);
    });
  });

  describe('CHECKBOX', () => {
    const cb = (correctAnswer: string) =>
      q({ type: QuestionType.CHECKBOX, correctAnswer });

    it('returns true when selected set matches exactly', () => {
      const correct = JSON.stringify(['A', 'B']);
      const submitted = JSON.stringify(['A', 'B']);
      expect(isAnswerCorrect(cb(correct), submitted)).toBe(true);
    });

    it('returns true regardless of selection order', () => {
      const correct = JSON.stringify(['A', 'B']);
      const submitted = JSON.stringify(['B', 'A']);
      expect(isAnswerCorrect(cb(correct), submitted)).toBe(true);
    });

    it('returns false when a required option is missing', () => {
      const correct = JSON.stringify(['A', 'B']);
      const submitted = JSON.stringify(['A']);
      expect(isAnswerCorrect(cb(correct), submitted)).toBe(false);
    });

    it('returns false when an extra option is selected', () => {
      const correct = JSON.stringify(['A']);
      const submitted = JSON.stringify(['A', 'B']);
      expect(isAnswerCorrect(cb(correct), submitted)).toBe(false);
    });

    it('returns false on malformed JSON', () => {
      expect(isAnswerCorrect(cb('["A","B"]'), 'not-json')).toBe(false);
    });
  });

  describe('TEXT', () => {
    it('returns true on exact match', () => {
      expect(isAnswerCorrect(q({ correctAnswer: 'Paris' }), 'Paris')).toBe(true);
    });

    it('is case-insensitive', () => {
      expect(isAnswerCorrect(q({ correctAnswer: 'Paris' }), 'paris')).toBe(true);
    });

    it('trims surrounding whitespace', () => {
      expect(isAnswerCorrect(q({ correctAnswer: 'Paris' }), '  Paris  ')).toBe(true);
    });

    it('returns false on wrong answer', () => {
      expect(isAnswerCorrect(q({ correctAnswer: 'Paris' }), 'London')).toBe(false);
    });
  });

  describe('EMAIL / DATE', () => {
    it('EMAIL: case-insensitive match', () => {
      expect(
        isAnswerCorrect(
          q({ type: QuestionType.EMAIL, correctAnswer: 'test@example.com' }),
          'TEST@EXAMPLE.COM',
        ),
      ).toBe(true);
    });

    it('DATE: exact match', () => {
      expect(
        isAnswerCorrect(
          q({ type: QuestionType.DATE, correctAnswer: '2024-01-15' }),
          '2024-01-15',
        ),
      ).toBe(true);
    });
  });
});

// ─── formatDisplayValue ───────────────────────────────────────────────────────

describe('formatDisplayValue', () => {
  it('returns "(no answer)" for empty string', () => {
    expect(formatDisplayValue(q(), '')).toBe('(no answer)');
  });

  it('returns plain value for TEXT', () => {
    expect(formatDisplayValue(q(), 'hello world')).toBe('hello world');
  });

  it('joins CHECKBOX array values with comma', () => {
    expect(
      formatDisplayValue(
        q({ type: QuestionType.CHECKBOX }),
        JSON.stringify(['A', 'B', 'C']),
      ),
    ).toBe('A, B, C');
  });

  it('returns "(no answer)" for empty CHECKBOX array', () => {
    expect(
      formatDisplayValue(q({ type: QuestionType.CHECKBOX }), JSON.stringify([])),
    ).toBe('(no answer)');
  });

  it('returns raw value when CHECKBOX JSON is malformed', () => {
    expect(
      formatDisplayValue(q({ type: QuestionType.CHECKBOX }), 'not-json'),
    ).toBe('not-json');
  });
});

// ─── formatCorrectAnswer ──────────────────────────────────────────────────────

describe('formatCorrectAnswer', () => {
  it('returns empty string when no correct answer', () => {
    expect(formatCorrectAnswer(q())).toBe('');
  });

  it('returns plain value for non-CHECKBOX types', () => {
    expect(formatCorrectAnswer(q({ correctAnswer: 'Paris' }))).toBe('Paris');
  });

  it('joins CHECKBOX correct answers with comma', () => {
    expect(
      formatCorrectAnswer(
        q({
          type: QuestionType.CHECKBOX,
          correctAnswer: JSON.stringify(['A', 'B']),
        }),
      ),
    ).toBe('A, B');
  });

  it('falls back to raw value on malformed CHECKBOX JSON', () => {
    expect(
      formatCorrectAnswer(
        q({ type: QuestionType.CHECKBOX, correctAnswer: 'bad-json' }),
      ),
    ).toBe('bad-json');
  });
});