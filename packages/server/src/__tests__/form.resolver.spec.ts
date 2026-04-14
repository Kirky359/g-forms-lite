import 'reflect-metadata';
import { FormResolver } from '../form/form.resolver';
import { FormService } from '../form/form.service';
import type { DecodedIdToken } from 'firebase-admin/auth';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildMockService(): jest.Mocked<FormService> {
  return {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    deleteById: jest.fn(),
    toFormEntity: jest.fn(),
    toPublicFormEntity: jest.fn(),
  } as unknown as jest.Mocked<FormService>;
}

const MOCK_USER = { uid: 'user-1' } as DecodedIdToken;

function makeDbForm(overrides: Record<string, unknown> = {}) {
  return {
    id: 'f1',
    userId: 'user-1',
    title: 'Test Form',
    description: null,
    requireEmail: false,
    createdAt: new Date(),
    questions: [],
    ...overrides,
  };
}

function makeFormEntity(overrides: Record<string, unknown> = {}) {
  return {
    id: 'f1',
    title: 'Test Form',
    description: undefined,
    requireEmail: false,
    questions: [],
    ...overrides,
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('FormResolver — forms', () => {
  let resolver: FormResolver;
  let service: jest.Mocked<FormService>;

  beforeEach(() => {
    service = buildMockService();
    resolver = new FormResolver(service);
  });

  it('calls findAll with the user uid and returns mapped entities', async () => {
    const dbForm = makeDbForm();
    const entity = makeFormEntity();
    service.findAll.mockResolvedValue([dbForm] as never);
    service.toFormEntity.mockReturnValue(entity as never);

    const result = await resolver.forms(MOCK_USER);

    expect(service.findAll).toHaveBeenCalledWith('user-1');
    expect(service.toFormEntity).toHaveBeenCalledWith(dbForm);
    expect(result).toEqual([entity]);
  });

  it('returns an empty array when the user has no forms', async () => {
    service.findAll.mockResolvedValue([]);

    const result = await resolver.forms(MOCK_USER);

    expect(result).toEqual([]);
    expect(service.toFormEntity).not.toHaveBeenCalled();
  });

  it('maps multiple forms preserving order', async () => {
    const db1 = makeDbForm({ id: 'f1', title: 'First' });
    const db2 = makeDbForm({ id: 'f2', title: 'Second' });
    const e1 = makeFormEntity({ id: 'f1', title: 'First' });
    const e2 = makeFormEntity({ id: 'f2', title: 'Second' });

    service.findAll.mockResolvedValue([db1, db2] as never);
    service.toFormEntity.mockReturnValueOnce(e1 as never).mockReturnValueOnce(e2 as never);

    const result = await resolver.forms(MOCK_USER);

    expect(result[0].title).toBe('First');
    expect(result[1].title).toBe('Second');
  });
});

describe('FormResolver — form (public query)', () => {
  let resolver: FormResolver;
  let service: jest.Mocked<FormService>;

  beforeEach(() => {
    service = buildMockService();
    resolver = new FormResolver(service);
  });

  it('returns null when the form does not exist', async () => {
    service.findById.mockResolvedValue(null);

    const result = await resolver.form('missing-id');

    expect(service.findById).toHaveBeenCalledWith('missing-id');
    expect(result).toBeNull();
  });

  it('returns the public entity (correct answers stripped) when form is found', async () => {
    const dbForm = makeDbForm();
    const publicEntity = makeFormEntity();
    service.findById.mockResolvedValue(dbForm as never);
    service.toPublicFormEntity.mockReturnValue(publicEntity as never);

    const result = await resolver.form('f1');

    expect(service.findById).toHaveBeenCalledWith('f1');
    // Must call the public variant, NOT toFormEntity
    expect(service.toPublicFormEntity).toHaveBeenCalledWith(dbForm);
    expect(service.toFormEntity).not.toHaveBeenCalled();
    expect(result).toEqual(publicEntity);
  });
});

describe('FormResolver — createForm', () => {
  let resolver: FormResolver;
  let service: jest.Mocked<FormService>;

  beforeEach(() => {
    service = buildMockService();
    resolver = new FormResolver(service);
  });

  it('passes all arguments to service.create and returns the mapped entity', async () => {
    const dbForm = makeDbForm();
    const entity = makeFormEntity();
    service.create.mockResolvedValue(dbForm as never);
    service.toFormEntity.mockReturnValue(entity as never);

    const result = await resolver.createForm(MOCK_USER, 'New Form', 'A description', true, []);

    expect(service.create).toHaveBeenCalledWith(
      { title: 'New Form', description: 'A description', requireEmail: true, questions: [] },
      'user-1',
    );
    expect(result).toEqual(entity);
  });

  it('defaults questions to [] when the argument is omitted', async () => {
    service.create.mockResolvedValue(makeDbForm() as never);
    service.toFormEntity.mockReturnValue(makeFormEntity() as never);

    await resolver.createForm(MOCK_USER, 'Form', undefined, undefined, undefined);

    expect(service.create).toHaveBeenCalledWith(
      expect.objectContaining({ questions: [] }),
      'user-1',
    );
  });
});

describe('FormResolver — deleteForm', () => {
  let resolver: FormResolver;
  let service: jest.Mocked<FormService>;

  beforeEach(() => {
    service = buildMockService();
    resolver = new FormResolver(service);
  });

  it('calls deleteById with the form id and user uid, returns true on success', async () => {
    service.deleteById.mockResolvedValue(true);

    const result = await resolver.deleteForm('f1', MOCK_USER);

    expect(service.deleteById).toHaveBeenCalledWith('f1', 'user-1');
    expect(result).toBe(true);
  });

  it('returns false when form is not found or not owned by the user', async () => {
    service.deleteById.mockResolvedValue(false);

    const result = await resolver.deleteForm('unknown', MOCK_USER);

    expect(result).toBe(false);
  });
});