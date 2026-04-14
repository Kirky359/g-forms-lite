import { useParams, Link } from "react-router-dom";
import {
  useGetFormQuery,
  useGetResponsesQuery,
} from "../../store/formsApi.endpoints";
import type { Form, Response } from "@forms/shared";
import { isAnswerCorrect, formatDisplayValue, formatCorrectAnswer } from "../../utils/quiz";
import styles from "./FormResponsesPage.module.scss";

export function FormResponsesPage() {
  const { id } = useParams<{ id: string }>();
  const { data: formData } = useGetFormQuery({ id: id ?? "" }, { skip: !id });
  const {
    data: responsesData,
    isLoading,
    error,
  } = useGetResponsesQuery({ formId: id ?? "" }, { skip: !id });

  const form = formData?.form;
  const responses = responsesData?.responses ?? [];

  if (!id) {
    return (
      <div className={styles.formResponsesPage}>
        <div className={styles.formResponsesPage__shell}>
          <p className={styles.formResponsesPage__error}>Invalid form ID.</p>
        </div>
      </div>
    );
  }

  if (!form && !isLoading && !error) {
    return (
      <div className={styles.formResponsesPage}>
        <div className={styles.formResponsesPage__shell}>
          <p className={styles.formResponsesPage__error}>Form not found.</p>
          <Link to="/" className={styles.formResponsesPage__actionLink}>
            Back to forms
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading || !form) {
    return (
      <div className={styles.formResponsesPage}>
        <div className={styles.formResponsesPage__shell}>
          <p className={styles.formResponsesPage__empty}>Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.formResponsesPage}>
        <div className={styles.formResponsesPage__shell}>
          <p className={styles.formResponsesPage__error}>
            Failed to load responses.
          </p>
          <Link to="/" className={styles.formResponsesPage__actionLink}>
            Back to forms
          </Link>
        </div>
      </div>
    );
  }

  const totalPoints = form.questions.filter((q) => q.correctAnswer).length;

  return (
    <div className={styles.formResponsesPage}>
      <div className={styles.formResponsesPage__shell}>
        <header className={styles.formResponsesPage__header}>
          <h1 className={styles.formResponsesPage__title}>
            Responses: {form.title}
          </h1>
          <div className={styles.formResponsesPage__actions}>
            <Link
              to={`/forms/${id}/fill`}
              className={styles.formResponsesPage__actionLink}
            >
              Fill form
            </Link>
            <Link to="/" className={styles.formResponsesPage__actionLink}>
              Back to main
            </Link>
          </div>
        </header>

        {responses.length === 0 ? (
          <p className={styles.formResponsesPage__empty}>No responses yet.</p>
        ) : (
          <div className={styles.formResponsesPage__responses}>
            {responses.map((response, idx) => (
              <ResponseCard
                key={response.id}
                response={response}
                form={form}
                index={idx}
                totalPoints={totalPoints}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ResponseCard({
  response,
  form,
  index,
  totalPoints,
}: {
  response: Response;
  form: Form;
  index: number;
  totalPoints: number;
}) {
  return (
    <div className={styles.formResponsesPage__responseCard}>
      <div className={styles.formResponsesPage__responseCardHeader}>
        <div>
          <h3 className={styles.formResponsesPage__responseCardTitle}>
            Response #{index + 1}
          </h3>
          {response.respondentEmail && (
            <p className={styles.formResponsesPage__respondentEmail}>
              {response.respondentEmail}
            </p>
          )}
        </div>
        {response.score !== undefined && response.score !== null && totalPoints > 0 && (
          <span className={styles.formResponsesPage__responseScore}>
            Score: {response.score} / {totalPoints} ({Math.round((response.score / totalPoints) * 100)}%)
          </span>
        )}
      </div>

      <div className={styles.formResponsesPage__answerList}>
        {form.questions.map((q, qIdx) => {
          const answer = response.answers.find((a) => a.questionId === q.id);
          const rawValue = answer?.value ?? "";
          const displayValue = formatDisplayValue(q, rawValue);
          const hasCorrect = Boolean(q.correctAnswer);
          const correct = hasCorrect && isAnswerCorrect(q, rawValue);

          return (
            <div key={q.id} className={styles.formResponsesPage__answerRow}>
              <div className={styles.formResponsesPage__answerLeft}>
                <p className={styles.formResponsesPage__answerQuestion}>
                  <span className={styles.formResponsesPage__answerNum}>{qIdx + 1}.</span>
                  {q.text || <em>Untitled question</em>}
                </p>
                <p className={styles.formResponsesPage__answerValue}>
                  {displayValue}
                </p>
                {hasCorrect && !correct && (
                  <p className={styles.formResponsesPage__answerHint}>
                    Correct answer: {formatCorrectAnswer(q)}
                  </p>
                )}
              </div>
              {hasCorrect && (
                <span
                  className={`${styles.formResponsesPage__answerMark} ${correct ? styles["formResponsesPage__answerMark--correct"] : styles["formResponsesPage__answerMark--wrong"]}`}
                  aria-label={correct ? "Correct" : "Incorrect"}
                >
                  {correct ? "✓" : "✗"}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}