import { useEffect, useRef } from 'react';
import { QuestionEditor } from '../QuestionEditor';
import { type QuestionTypeValue, type useFormBuilder } from '../../hooks/useFormBuilder';
import { MAX_TEXT_LENGTH } from '@forms/shared';
import styles from '../../pages/FormBuilderPage/FormBuilderPage.module.scss';

const QUESTION_TYPES: QuestionTypeValue[] = ['TEXT', 'MULTIPLE_CHOICE', 'CHECKBOX', 'DATE'];

function formatQuestionType(value: string): string {
  return value
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

interface FormBuilderFormProps {
  builder: ReturnType<typeof useFormBuilder>;
  pageTitle: string;
  saveLabel: string;
  isSaving: boolean;
  canSave: boolean;
  onSave: () => void;
  onCancel?: () => void;
  error?: string;
}

export function FormBuilderForm({
  builder,
  pageTitle,
  saveLabel,
  isSaving,
  canSave,
  onSave,
  onCancel,
  error,
}: FormBuilderFormProps) {
  const descriptionRef = useRef<HTMLTextAreaElement | null>(null);

  const resizeTextarea = (target: HTMLTextAreaElement): void => {
    target.style.height = 'auto';
    target.style.height = `${target.scrollHeight}px`;
  };

  useEffect(() => {
    if (descriptionRef.current) {
      resizeTextarea(descriptionRef.current);
    }
  }, [builder.description]);

  return (
    <div className={styles.formBuilderPage}>
      <header className={styles.formBuilderPage__header}>
        <h1 className={styles.formBuilderPage__title}>{pageTitle}</h1>
      </header>

      <div className={styles.formBuilderPage__form}>
        <div className={styles.formBuilderPage__field}>
          <label htmlFor="title" className={styles.formBuilderPage__fieldLabel}>
            Form Title
          </label>
          <input
            id="title"
            type="text"
            value={builder.title}
            onChange={(e) => builder.setTitle(e.target.value.slice(0, MAX_TEXT_LENGTH))}
            placeholder="Untitled form"
            className={styles.formBuilderPage__fieldInput}
            maxLength={MAX_TEXT_LENGTH}
          />
        </div>

        <div className={styles.formBuilderPage__field}>
          <label htmlFor="description" className={styles.formBuilderPage__fieldLabel}>
            Description (optional)
          </label>
          <textarea
            ref={descriptionRef}
            id="description"
            value={builder.description}
            onChange={(e) => builder.setDescription(e.target.value.slice(0, MAX_TEXT_LENGTH))}
            onInput={(e) => resizeTextarea(e.currentTarget)}
            placeholder="Form description"
            className={styles.formBuilderPage__fieldTextarea}
            maxLength={MAX_TEXT_LENGTH}
            rows={2}
          />
          <span className={styles.formBuilderPage__fieldMeta}>
            {builder.description.length}/{MAX_TEXT_LENGTH}
          </span>
        </div>

        {/* ── Settings ──────────────────────────────────────────── */}
        <div className={styles.formBuilderPage__settingsSection}>
          <h2 className={styles.formBuilderPage__questionsTitle}>Settings</h2>

          <label className={styles.formBuilderPage__toggleLabel}>
            <input
              type="checkbox"
              className={styles.formBuilderPage__toggleInput}
              checked={builder.requireEmail}
              onChange={(e) => builder.setRequireEmail(e.target.checked)}
            />
            <span className={styles.formBuilderPage__toggleText}>
              Collect respondent email
              <span className={styles.formBuilderPage__toggleHint}>
                Respondents must enter their email address before submitting.
                Prevents duplicate submissions from the same address.
              </span>
            </span>
          </label>
        </div>

        <div className={styles.formBuilderPage__questionsSection}>
          <h2 className={styles.formBuilderPage__questionsTitle}>Questions</h2>
          <div className={styles.formBuilderPage__addButtons}>
            {QUESTION_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => builder.addQuestion(type)}
                className={styles.formBuilderPage__addBtn}
              >
                Add {formatQuestionType(type)}
              </button>
            ))}
          </div>

          {builder.questions.map((q) => (
            <div key={q.id} className={styles.formBuilderPage__questionWrapper}>
              <span className={styles.formBuilderPage__questionType}>
                {formatQuestionType(q.type)}
              </span>
              <QuestionEditor
                question={q}
                onUpdate={(updates) => builder.updateQuestion(q.id, updates)}
                onRemove={() => builder.removeQuestion(q.id)}
                onAddOption={() => builder.addOption(q.id)}
                onUpdateOption={(i, v) => builder.updateOption(q.id, i, v)}
                onRemoveOption={(i) => builder.removeOption(q.id, i)}
              />
            </div>
          ))}
        </div>

        {error && (
          <p className={styles.formBuilderPage__error}>
            Failed to save: {error}
          </p>
        )}

        <div className={styles.formBuilderPage__actions}>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSaving}
              className={styles.formBuilderPage__cancelButton}
            >
              Cancel
            </button>
          )}
          <button
            type="button"
            onClick={onSave}
            disabled={isSaving || !canSave}
            className={`${styles.formBuilderPage__saveButton} ${
              isSaving || !canSave ? styles.formBuilderPage__saveButtonDisabled : ''
            }`}
          >
            {isSaving ? 'Saving...' : saveLabel}
          </button>
        </div>
      </div>
    </div>
  );
}