import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FormBuilderForm } from '../components/FormBuilderForm';
import type { useFormBuilder } from '../hooks';

// QuestionEditor is a complex child — mock it to keep these tests focused on
// FormBuilderForm's own rendering and event-wiring logic.
vi.mock('../components/QuestionEditor', () => ({
  QuestionEditor: () => null,
}));

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeBuilder(
  overrides: Partial<ReturnType<typeof useFormBuilder>> = {},
): ReturnType<typeof useFormBuilder> {
  return {
    title: '',
    setTitle: vi.fn(),
    description: '',
    setDescription: vi.fn(),
    requireEmail: false,
    setRequireEmail: vi.fn(),
    questions: [],
    addQuestion: vi.fn(),
    updateQuestion: vi.fn(),
    removeQuestion: vi.fn(),
    addOption: vi.fn(),
    updateOption: vi.fn(),
    removeOption: vi.fn(),
    toMutationInput: vi.fn(),
    reset: vi.fn(),
    initialize: vi.fn(),
    ...overrides,
  };
}

type FormBuilderFormProps = Parameters<typeof FormBuilderForm>[0];

function renderForm(overrides: Partial<FormBuilderFormProps> = {}) {
  const defaults: FormBuilderFormProps = {
    builder: makeBuilder(),
    pageTitle: 'Create Form',
    saveLabel: 'Save',
    isSaving: false,
    canSave: true,
    onSave: vi.fn(),
  };
  return render(<FormBuilderForm {...defaults} {...overrides} />);
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('FormBuilderForm — rendering', () => {
  it('renders the page title', () => {
    renderForm({ pageTitle: 'Create New Form' });
    expect(screen.getByRole('heading', { name: 'Create New Form' })).toBeInTheDocument();
  });

  it('renders the title input with the current builder value', () => {
    renderForm({ builder: makeBuilder({ title: 'My Survey' }) });
    expect(screen.getByRole('textbox', { name: /form title/i })).toHaveValue('My Survey');
  });

  it('renders the description textarea with the current builder value', () => {
    renderForm({ builder: makeBuilder({ description: 'Helpful context' }) });
    expect(screen.getByRole('textbox', { name: /description/i })).toHaveValue('Helpful context');
  });

  it('renders add-question buttons for all 4 question types', () => {
    renderForm();
    expect(screen.getByRole('button', { name: 'Add Text' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add Multiple Choice' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add Checkbox' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add Date' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Add Email' })).not.toBeInTheDocument();
  });

  it('renders the "Collect respondent email" checkbox unchecked by default', () => {
    renderForm({ builder: makeBuilder({ requireEmail: false }) });
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });

  it('renders the checkbox as checked when requireEmail is true', () => {
    renderForm({ builder: makeBuilder({ requireEmail: true }) });
    expect(screen.getByRole('checkbox')).toBeChecked();
  });
});

describe('FormBuilderForm — save button', () => {
  it('shows the saveLabel text', () => {
    renderForm({ saveLabel: 'Publish' });
    expect(screen.getByRole('button', { name: 'Publish' })).toBeInTheDocument();
  });

  it('is disabled when canSave is false', () => {
    renderForm({ canSave: false });
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  it('shows "Saving..." and is disabled when isSaving is true', () => {
    renderForm({ isSaving: true });
    expect(screen.getByRole('button', { name: 'Saving...' })).toBeDisabled();
  });

  it('calls onSave when clicked', () => {
    const onSave = vi.fn();
    renderForm({ onSave });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(onSave).toHaveBeenCalledOnce();
  });
});

describe('FormBuilderForm — cancel button', () => {
  it('is not rendered when onCancel is not provided', () => {
    renderForm({ onCancel: undefined });
    expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument();
  });

  it('is rendered when onCancel is provided', () => {
    renderForm({ onCancel: vi.fn() });
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('calls onCancel when clicked', () => {
    const onCancel = vi.fn();
    renderForm({ onCancel });
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalledOnce();
  });
});

describe('FormBuilderForm — error display', () => {
  it('shows no error message by default', () => {
    renderForm();
    expect(screen.queryByText(/failed to save/i)).not.toBeInTheDocument();
  });

  it('shows the error message when the error prop is set', () => {
    renderForm({ error: 'Network timeout' });
    expect(screen.getByText(/failed to save: Network timeout/i)).toBeInTheDocument();
  });
});

describe('FormBuilderForm — interactions', () => {
  it('calls builder.setTitle when the title input changes', () => {
    const setTitle = vi.fn();
    renderForm({ builder: makeBuilder({ setTitle }) });
    fireEvent.change(screen.getByRole('textbox', { name: /form title/i }), {
      target: { value: 'Updated Title' },
    });
    expect(setTitle).toHaveBeenCalled();
  });

  it('calls builder.setDescription when the description textarea changes', () => {
    const setDescription = vi.fn();
    renderForm({ builder: makeBuilder({ setDescription }) });
    fireEvent.change(screen.getByRole('textbox', { name: /description/i }), {
      target: { value: 'New description' },
    });
    expect(setDescription).toHaveBeenCalled();
  });

  it('calls builder.addQuestion("TEXT") when "Add Text" is clicked', () => {
    const addQuestion = vi.fn();
    renderForm({ builder: makeBuilder({ addQuestion }) });
    fireEvent.click(screen.getByRole('button', { name: 'Add Text' }));
    expect(addQuestion).toHaveBeenCalledWith('TEXT');
  });

  it('calls builder.addQuestion("MULTIPLE_CHOICE") when "Add Multiple Choice" is clicked', () => {
    const addQuestion = vi.fn();
    renderForm({ builder: makeBuilder({ addQuestion }) });
    fireEvent.click(screen.getByRole('button', { name: 'Add Multiple Choice' }));
    expect(addQuestion).toHaveBeenCalledWith('MULTIPLE_CHOICE');
  });

  it('calls builder.setRequireEmail when the checkbox is toggled', () => {
    const setRequireEmail = vi.fn();
    renderForm({ builder: makeBuilder({ setRequireEmail }) });
    fireEvent.click(screen.getByRole('checkbox'));
    expect(setRequireEmail).toHaveBeenCalled();
  });
});