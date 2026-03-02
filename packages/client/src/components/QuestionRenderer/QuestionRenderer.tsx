import { useEffect, useRef } from 'react';
import type { Question } from '@forms/shared';
import { MAX_TEXT_LENGTH } from '@shared/constants';
import styles from './QuestionRenderer.module.scss';

interface QuestionRendererProps {
  question: Question;
  value: string | string[] | undefined;
  onChange: (value: string | string[]) => void;
}

export function QuestionRenderer({
  question,
  value,
  onChange,
}: QuestionRendererProps) {
  const { type, text, options = [], required } = question;
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const label = (
    <label className={styles.questionRenderer__label}>
      {text}
      {required && <span className={styles.questionRenderer__required}>*</span>}
    </label>
  );

  const valStr = typeof value === 'string' ? value : '';
  const valArr = Array.isArray(value) ? value : [];

  const resizeTextarea = (target: HTMLTextAreaElement): void => {
    target.style.height = 'auto';
    target.style.height = `${target.scrollHeight}px`;
  };

  useEffect(() => {
    if (type === 'TEXT' && textareaRef.current) {
      resizeTextarea(textareaRef.current);
    }
  }, [type, valStr]);

  switch (type) {
    case 'TEXT':
      return (
        <div className={styles.questionRenderer}>
          {label}
          <textarea
            ref={textareaRef}
            value={valStr}
            onChange={(e) => onChange(e.target.value.slice(0, MAX_TEXT_LENGTH))}
            onInput={(e) => resizeTextarea(e.currentTarget)}
            className={styles.questionRenderer__textarea}
            required={required}
            maxLength={MAX_TEXT_LENGTH}
            rows={1}
          />
        </div>
      );

    case 'DATE':
      return (
        <div className={styles.questionRenderer}>
          {label}
          <input
            type="date"
            value={valStr}
            onChange={(e) => onChange(e.target.value)}
            className={styles.questionRenderer__input}
            required={required}
          />
        </div>
      );

    case 'MULTIPLE_CHOICE':
      return (
        <div className={styles.questionRenderer}>
          {label}
          <div className={styles.questionRenderer__optionGroup}>
            {options.map((opt) => (
              <label key={opt} className={styles.questionRenderer__optionLabel}>
                <input
                  type="radio"
                  name={`q-${question.id}`}
                  value={opt}
                  checked={valStr === opt}
                  onChange={() => onChange(opt)}
                  required={required}
                />
                {opt}
              </label>
            ))}
          </div>
        </div>
      );

    case 'CHECKBOX':
      return (
        <div className={styles.questionRenderer}>
          {label}
          <div className={styles.questionRenderer__optionGroup}>
            {options.map((opt) => (
              <label key={opt} className={styles.questionRenderer__optionLabel}>
                <input
                  type="checkbox"
                  value={opt}
                  checked={valArr.includes(opt)}
                  onChange={(e) => {
                    const next = e.target.checked
                      ? [...valArr, opt]
                      : valArr.filter((o) => o !== opt);
                    onChange(next);
                  }}
                />
                {opt}
              </label>
            ))}
          </div>
        </div>
      );

    default:
      return null;
  }
}
