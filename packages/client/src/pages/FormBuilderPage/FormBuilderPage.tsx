import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { QuestionEditor } from '../../components/QuestionEditor';
import { useFormBuilder } from '../../hooks/useFormBuilder';
import { useCreateFormMutation } from '../../store/formsApi.endpoints';
import { reportClientError } from '../../utils/error';
import { MAX_TEXT_LENGTH } from '@shared/constants';
import styles from './FormBuilderPage.module.scss';

function formatQuestionType(value: string): string {
  return value
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function FormBuilderPage() {
  const navigate = useNavigate();
  const [createForm, { isLoading, error }] = useCreateFormMutation();
  const builder = useFormBuilder();
  const descriptionRef = useRef<HTMLTextAreaElement | null>(null);
  const canSave = builder.title.trim().length > 0 && builder.questions.length > 0;

  const handleSave = async () => {
    if (!canSave) return;
    try {
      const result = await createForm(builder.toMutationInput()).unwrap();
      builder.reset();
      navigate(`/forms/${result.createForm.id}/fill`);
    } catch (requestError: unknown) {
      reportClientError('Failed to create form', requestError);
    }
  };

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
        <h1 className={styles.formBuilderPage__title}>Create New Form</h1>
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

        <div className={styles.formBuilderPage__questionsSection}>
          <h2 className={styles.formBuilderPage__questionsTitle}>Questions</h2>
          <div className={styles.formBuilderPage__addButtons}>
            <button
              type="button"
              onClick={() => builder.addQuestion('TEXT')}
              className={styles.formBuilderPage__addBtn}
            >
              Add Text
            </button>
            <button
              type="button"
              onClick={() => builder.addQuestion('MULTIPLE_CHOICE')}
              className={styles.formBuilderPage__addBtn}
            >
              Add Multiple Choice
            </button>
            <button
              type="button"
              onClick={() => builder.addQuestion('CHECKBOX')}
              className={styles.formBuilderPage__addBtn}
            >
              Add Checkbox
            </button>
            <button
              type="button"
              onClick={() => builder.addQuestion('DATE')}
              className={styles.formBuilderPage__addBtn}
            >
              Add Date
            </button>
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
            Failed to save: {error && 'error' in error ? String(error.error) : 'Unknown error'}
          </p>
        )}

        <button
          type="button"
          onClick={handleSave}
          disabled={isLoading || !canSave}
          className={`${styles.formBuilderPage__saveButton} ${
            isLoading || !canSave ? styles.formBuilderPage__saveButtonDisabled : ''
          }`}
        >
          {isLoading ? 'Saving...' : 'Save Form'}
        </button>
      </div>
    </div>
  );
}
