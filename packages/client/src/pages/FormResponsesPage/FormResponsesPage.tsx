import { useParams, Link } from "react-router-dom";
import {
  useGetFormQuery,
  useGetResponsesQuery,
} from "../../store/formsApi.endpoints";
import type { Form, Response } from "@forms/shared";
import { reportClientError } from "../../utils/error";
import styles from "./FormResponsesPage.module.scss";

function getQuestionById(form: Form, questionId: string) {
  return form.questions.find((q) => q.id === questionId);
}

function formatAnswerValue(value: string): string {
  try {
    const parsed = JSON.parse(value) as unknown;
    if (Array.isArray(parsed)) {
      return parsed.join(", ");
    }
  } catch (parseError: unknown) {
    reportClientError("Failed to parse response answer value", parseError);
  }
  return value;
}

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
}: {
  response: Response;
  form: Form;
  index: number;
}) {
  return (
    <div className={styles.formResponsesPage__responseCard}>
      <h3 className={styles.formResponsesPage__responseCardTitle}>
        Response #{index + 1}
      </h3>
      <dl className={styles.formResponsesPage__answerList}>
        {response.answers.map((answer) => {
          const question = getQuestionById(form, answer.questionId);
          const label = question?.text ?? answer.questionId;
          const value = formatAnswerValue(answer.value);
          return (
            <div
              key={answer.questionId}
              className={styles.formResponsesPage__answerRow}
            >
              <dt className={styles.formResponsesPage__answerTerm}>{label}</dt>
              <dd className={styles.formResponsesPage__answerDesc}>
                {value || "(empty)"}
              </dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}
