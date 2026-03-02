import type { FormBuilderQuestion } from '../../hooks/useFormBuilder';
import { MAX_TEXT_LENGTH } from '@shared/constants';
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
  const hasOptions =
    question.type === 'MULTIPLE_CHOICE' || question.type === 'CHECKBOX';

  const handleAutoGrow = (event: React.FormEvent<HTMLTextAreaElement>): void => {
    const target = event.currentTarget;
    target.style.height = 'auto';
    target.style.height = `${target.scrollHeight}px`;
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
          onClick={onRemove}
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
          <span className={styles.questionEditor__optionsLabel}>Options:</span>
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
    </div>
  );
}
