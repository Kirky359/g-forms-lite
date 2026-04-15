import { useState } from 'react';
import type { FormBuilderQuestion } from '../../hooks';
import { MAX_TEXT_LENGTH } from '@forms/shared';
import styles from './QuestionEditor.module.scss';

interface QuestionEditorProps {
  question: FormBuilderQuestion;
  onUpdate: (updates: Partial<FormBuilderQuestion>) => void;
  onRemove: () => void;
  onAddOption: () => void;
  onUpdateOption: (index: number, value: string) => void;
  onRemoveOption: (index: number) => void;
}

export function QuestionEditor({
  question,
  onUpdate,
  onRemove,
  onAddOption,
  onUpdateOption,
  onRemoveOption,
}: QuestionEditorProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const hasOptions =
    question.type === 'MULTIPLE_CHOICE' || question.type === 'CHECKBOX';
  const hasTextAnswer =
    question.type === 'TEXT' ||
    question.type === 'EMAIL' ||
    question.type === 'DATE';

  const handleAutoGrow = (event: React.FormEvent<HTMLTextAreaElement>): void => {
    const target = event.currentTarget;
    target.style.height = 'auto';
    target.style.height = `${target.scrollHeight}px`;
  };

  const correctAnswerArr: string[] = (() => {
    if (question.type !== 'CHECKBOX') return [];
    try {
      const parsed = JSON.parse(question.correctAnswer ?? '[]') as unknown;
      return Array.isArray(parsed) ? (parsed as string[]) : [];
    } catch {
      return [];
    }
  })();

  const handleCheckboxCorrectToggle = (opt: string, checked: boolean) => {
    const next = checked
      ? [...correctAnswerArr, opt]
      : correctAnswerArr.filter((o) => o !== opt);
    onUpdate({ correctAnswer: next.length > 0 ? JSON.stringify(next) : undefined });
  };

  return (
    <div className={styles.questionEditor}>
      <div className={styles.questionEditor__row}>
        <textarea
          placeholder="Question text"
          value={question.text}
          onChange={(e) => onUpdate({ text: e.target.value.slice(0, MAX_TEXT_LENGTH) })}
          onInput={handleAutoGrow}
          className={styles.questionEditor__textarea}
          maxLength={MAX_TEXT_LENGTH}
          rows={1}
        />
        <button
          type="button"
          onClick={() => setShowDeleteModal(true)}
          className={styles.questionEditor__removeBtn}
          aria-label="Remove question"
        >
          Remove
        </button>
      </div>

      <label className={styles.questionEditor__checkbox}>
        <input
          type="checkbox"
          checked={question.required}
          onChange={(e) => onUpdate({ required: e.target.checked })}
        />
        Required
      </label>

      {hasOptions && (
        <div className={styles.questionEditor__options}>
          <div className={styles.questionEditor__optionsHeader}>
            <span className={styles.questionEditor__optionsLabel}>Options</span>
            <span className={styles.questionEditor__correctLabel}>Correct answer</span>
          </div>
          {question.options.map((opt, i) => (
            <div key={i} className={styles.questionEditor__optionRow}>
              <input
                type="text"
                value={opt}
                onChange={(e) => onUpdateOption(i, e.target.value.slice(0, MAX_TEXT_LENGTH))}
                className={styles.questionEditor__optionInput}
                placeholder={`Option ${i + 1}`}
                maxLength={MAX_TEXT_LENGTH}
              />
              {question.type === 'MULTIPLE_CHOICE' ? (
                <label
                  className={`${styles.questionEditor__correctMark} ${question.correctAnswer === opt ? styles['questionEditor__correctMark--active'] : ''}`}
                  title="Mark as correct answer"
                >
                  <input
                    type="radio"
                    name={`correct-${question.id}`}
                    checked={question.correctAnswer === opt}
                    onChange={() => onUpdate({ correctAnswer: opt })}
                    className={styles.questionEditor__correctInput}
                  />
                  ✓
                </label>
              ) : (
                <label
                  className={`${styles.questionEditor__correctMark} ${correctAnswerArr.includes(opt) ? styles['questionEditor__correctMark--active'] : ''}`}
                  title="Mark as correct answer"
                >
                  <input
                    type="checkbox"
                    checked={correctAnswerArr.includes(opt)}
                    onChange={(e) => handleCheckboxCorrectToggle(opt, e.target.checked)}
                    className={styles.questionEditor__correctInput}
                  />
                  ✓
                </label>
              )}
              <button
                type="button"
                onClick={() => onRemoveOption(i)}
                className={styles.questionEditor__removeOptionBtn}
                aria-label={`Remove option ${i + 1}`}
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={onAddOption}
            className={styles.questionEditor__addOption}
          >
            Add option
          </button>
        </div>
      )}

      {hasTextAnswer && (
        <div className={styles.questionEditor__correctAnswerField}>
          <label className={styles.questionEditor__correctAnswerLabel}>
            Correct answer <span className={styles.questionEditor__correctAnswerHint}>(optional — leave blank to skip scoring)</span>
          </label>
          <input
            type={question.type === 'DATE' ? 'date' : question.type === 'EMAIL' ? 'email' : 'text'}
            value={question.correctAnswer ?? ''}
            onChange={(e) => onUpdate({ correctAnswer: e.target.value || undefined })}
            className={styles.questionEditor__correctAnswerInput}
            placeholder={question.type === 'DATE' ? '' : 'Enter correct answer'}
          />
        </div>
      )}
      {showDeleteModal && (
        <div className={styles.questionEditor__modalOverlay} role="dialog" aria-modal="true">
          <div className={styles.questionEditor__modal}>
            <p className={styles.questionEditor__modalText}>Remove this question?</p>
            <div className={styles.questionEditor__modalActions}>
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className={styles.questionEditor__modalCancel}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => { setShowDeleteModal(false); onRemove(); }}
                className={styles.questionEditor__modalConfirm}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}