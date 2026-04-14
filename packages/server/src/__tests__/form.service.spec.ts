import 'reflect-metadata';
import { FormService } from '../form/form.service';
import type { PrismaService } from '../prisma/prisma.service';
import { QuestionType } from '@forms/shared';

function buildMockPrisma(): PrismaService {
  return {
    form: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  } as unknown as PrismaService;
}

function makeDbQuestion(overrides: Record<string, unknown> = {}) {
  return {
    id: 'q1',
    formId: 'f1',
    type: QuestionType.TEXT,
    text: 'Question text',
    options: [],
    required: false,
    order: 0,
    correctAnswer: null,
    ...overrides,
  };
}

function makeDbForm(overrides: Record<string, unknown> = {}) {
  return {
    id: 'f1',
    userId: 'u1',
    title: 'Test Form',
    description: null,
    requireEmail: false,
    createdAt: new Date(),
    questions: [],
    ...overrides,
  };
}

describe('FormService — toFormEntity', () => {
  let service: FormService;

  beforeEach(() => {
    service = new FormService(buildMockPrisma());
  });

  it('maps id, title, and questions', () => {
    const form = makeDbForm({
      questions: [makeDbQuestion({ text: 'Q1' })],
    });

    const entity = service.toFormEntity(form as Parameters<typeof service.toFormEntity>[0]);

    expect(entity.id).toBe('f1');
    expect(entity.title).toBe('Test Form');
    expect(entity.questions).toHaveLength(1);
    expect(entity.questions[0].text).toBe('Q1');
  });

  it('maps description when present', () => {
    const form = makeDbForm({ description: 'A description', questions: [] });
    const entity = service.toFormEntity(form as Parameters<typeof service.toFormEntity>[0]);
    expect(entity.description).toBe('A description');
  });

  it('sets description to undefined when null', () => {
    const form = makeDbForm({ description: null, questions: [] });
    const entity = service.toFormEntity(form as Parameters<typeof service.toFormEntity>[0]);
    expect(entity.description).toBeUndefined();
  });

  it('maps correctAnswer on a question when set', () => {
    const form = makeDbForm({
      questions: [makeDbQuestion({ correctAnswer: 'Paris' })],
    });

    const entity = service.toFormEntity(form as Parameters<typeof service.toFormEntity>[0]);
    expect(entity.questions[0].correctAnswer).toBe('Paris');
  });

  it('sets correctAnswer to undefined when null in DB', () => {
    const form = makeDbForm({
      questions: [makeDbQuestion({ correctAnswer: null })],
    });

    const entity = service.toFormEntity(form as Parameters<typeof service.toFormEntity>[0]);
    expect(entity.questions[0].correctAnswer).toBeUndefined();
  });

  it('returns options as undefined when the DB array is empty', () => {
    const form = makeDbForm({
      questions: [makeDbQuestion({ options: [] })],
    });

    const entity = service.toFormEntity(form as Parameters<typeof service.toFormEntity>[0]);
    expect(entity.questions[0].options).toBeUndefined();
  });

  it('returns options array when non-empty', () => {
    const form = makeDbForm({
      questions: [makeDbQuestion({ options: ['A', 'B'] })],
    });

    const entity = service.toFormEntity(form as Parameters<typeof service.toFormEntity>[0]);
    expect(entity.questions[0].options).toEqual(['A', 'B']);
  });

  it('maps multiple questions in order', () => {
    const form = makeDbForm({
      questions: [
        makeDbQuestion({ id: 'q1', text: 'First', order: 0 }),
        makeDbQuestion({ id: 'q2', text: 'Second', order: 1 }),
      ],
    });

    const entity = service.toFormEntity(form as Parameters<typeof service.toFormEntity>[0]);
    expect(entity.questions[0].text).toBe('First');
    expect(entity.questions[1].text).toBe('Second');
  });
});