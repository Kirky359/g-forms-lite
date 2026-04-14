import 'reflect-metadata';
import { ResponseService } from '../response/response.service';
import type { PrismaService } from '../prisma/prisma.service';
import { QuestionType } from '@forms/shared';

// Build a minimal mock of PrismaService — only the methods under test matter
function buildMockPrisma(overrides: Record<string, unknown> = {}): PrismaService {
  return {
    form: { findUnique: jest.fn() },
    response: { create: jest.fn() },
    ...overrides,
  } as unknown as PrismaService;
}

// Helpers to build fixture objects matching the Prisma-generated shape
function makeQuestion(overrides: Record<string, unknown> = {}) {
  return {
    id: 'q1',
    formId: 'form1',
    type: QuestionType.TEXT as string,
    text: 'Q',
    options: [],
    required: false,
    order: 0,
    correctAnswer: null,
    ...overrides,
  };
}

function makeAnswer(questionId: string, value: string) {
  return { questionId, value };
}

// Access the private method via type cast
function calcScore(
  service: ResponseService,
  questions: ReturnType<typeof makeQuestion>[],
  answers: ReturnType<typeof makeAnswer>[],
): number | null {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (service as any).calculateScore(questions, answers) as number | null;
}

describe('ResponseService — calculateScore', () => {
  let service: ResponseService;

  beforeEach(() => {
    service = new ResponseService(buildMockPrisma());
  });

  // ── No quiz questions ────────────────────────────────────────
  it('returns null when no question has a correctAnswer', () => {
    const questions = [makeQuestion()];
    const answers = [makeAnswer('q1', 'anything')];
    expect(calcScore(service, questions, answers)).toBeNull();
  });

  // ── MULTIPLE_CHOICE ──────────────────────────────────────────
  describe('MULTIPLE_CHOICE', () => {
    const mcQuestion = makeQuestion({
      type: QuestionType.MULTIPLE_CHOICE,
      correctAnswer: 'Option A',
    });

    it('scores 1 on exact match', () => {
      expect(calcScore(service, [mcQuestion], [makeAnswer('q1', 'Option A')])).toBe(1);
    });

    it('scores 0 on wrong option', () => {
      expect(calcScore(service, [mcQuestion], [makeAnswer('q1', 'Option B')])).toBe(0);
    });

    it('scores 0 on case-different answer (exact match required)', () => {
      expect(calcScore(service, [mcQuestion], [makeAnswer('q1', 'option a')])).toBe(0);
    });
  });

  // ── CHECKBOX ─────────────────────────────────────────────────
  describe('CHECKBOX', () => {
    const cbQuestion = makeQuestion({
      type: QuestionType.CHECKBOX,
      correctAnswer: JSON.stringify(['A', 'B']),
    });

    it('scores 1 when selected set exactly matches', () => {
      const submitted = JSON.stringify(['A', 'B']);
      expect(calcScore(service, [cbQuestion], [makeAnswer('q1', submitted)])).toBe(1);
    });

    it('scores 1 regardless of selection order', () => {
      const submitted = JSON.stringify(['B', 'A']);
      expect(calcScore(service, [cbQuestion], [makeAnswer('q1', submitted)])).toBe(1);
    });

    it('scores 0 when a required option is missing', () => {
      const submitted = JSON.stringify(['A']);
      expect(calcScore(service, [cbQuestion], [makeAnswer('q1', submitted)])).toBe(0);
    });

    it('scores 0 when extra options are selected', () => {
      const submitted = JSON.stringify(['A', 'B', 'C']);
      expect(calcScore(service, [cbQuestion], [makeAnswer('q1', submitted)])).toBe(0);
    });
  });

  // ── TEXT / EMAIL / DATE ───────────────────────────────────────
  describe('TEXT (case-insensitive)', () => {
    const textQuestion = makeQuestion({ correctAnswer: 'Paris' });

    it('scores 1 on exact match', () => {
      expect(calcScore(service, [textQuestion], [makeAnswer('q1', 'Paris')])).toBe(1);
    });

    it('scores 1 on case-insensitive match', () => {
      expect(calcScore(service, [textQuestion], [makeAnswer('q1', 'paris')])).toBe(1);
    });

    it('scores 1 when whitespace is trimmed', () => {
      expect(calcScore(service, [textQuestion], [makeAnswer('q1', '  Paris  ')])).toBe(1);
    });

    it('scores 0 on wrong answer', () => {
      expect(calcScore(service, [textQuestion], [makeAnswer('q1', 'London')])).toBe(0);
    });
  });

  // ── Missing answer ────────────────────────────────────────────
  it('does not count a question when no answer was submitted for it', () => {
    const question = makeQuestion({ id: 'q1', correctAnswer: 'yes' });
    // submit answer for a different question id
    expect(calcScore(service, [question], [makeAnswer('q2', 'yes')])).toBe(0);
  });

  // ── Partial score ─────────────────────────────────────────────
  it('returns a partial score when only some answers are correct', () => {
    const questions = [
      makeQuestion({ id: 'q1', correctAnswer: 'right' }),
      makeQuestion({ id: 'q2', correctAnswer: 'right' }),
      makeQuestion({ id: 'q3', correctAnswer: 'right' }),
    ];
    const answers = [
      makeAnswer('q1', 'right'),  // correct
      makeAnswer('q2', 'wrong'), // wrong
      makeAnswer('q3', 'right'),  // correct
    ];
    expect(calcScore(service, questions, answers)).toBe(2);
  });

  // ── Mixed quiz + open questions ───────────────────────────────
  it('only counts questions that have a correctAnswer', () => {
    const questions = [
      makeQuestion({ id: 'q1', correctAnswer: 'yes' }), // quiz question
      makeQuestion({ id: 'q2', correctAnswer: null }),   // open question
    ];
    expect(
      calcScore(service, questions, [makeAnswer('q1', 'yes'), makeAnswer('q2', 'anything')]),
    ).toBe(1);
  });
});

// ─── toResponseEntity ─────────────────────────────────────────────────────────

describe('ResponseService — toResponseEntity', () => {
  let service: ResponseService;

  beforeEach(() => {
    service = new ResponseService(buildMockPrisma());
  });

  it('maps fields correctly including score', () => {
    const raw = {
      id: 'r1',
      formId: 'f1',
      score: 3,
      respondentEmail: null,
      createdAt: new Date(),
      answers: [
        { id: 'a1', responseId: 'r1', questionId: 'q1', value: 'hello' },
      ],
    };

    const entity = service.toResponseEntity(raw);

    expect(entity.id).toBe('r1');
    expect(entity.formId).toBe('f1');
    expect(entity.score).toBe(3);
    expect(entity.answers).toEqual([{ questionId: 'q1', value: 'hello' }]);
  });

  it('sets score to undefined when null in DB', () => {
    const raw = {
      id: 'r1',
      formId: 'f1',
      score: null,
      respondentEmail: null,
      createdAt: new Date(),
      answers: [],
    };

    const entity = service.toResponseEntity(raw);
    expect(entity.score).toBeUndefined();
  });
});