import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { QuestionRenderer } from "../../components/QuestionRenderer";
import { useFormFiller } from "../../hooks/useFormFiller";
import {
  useGetFormQuery,
  useSubmitResponseMutation,
} from "../../store/formsApi.endpoints";
import { reportClientError, toErrorMessage } from "../../utils/error";
import styles from "./FormFillerPage.module.scss";

export function FormFillerPage() {
  const { id } = useParams<{ id: string }>();
  const [submitted, setSubmitted] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const { data, isLoading, error } = useGetFormQuery(
    { id: id ?? "" },
    { skip: !id },
  );
  const [submitResponse, { isLoading: isSubmitting }] =
    useSubmitResponseMutation();
  const form = data?.form;
  const filler = useFormFiller(form?.questions ?? []);

  if (!id || isLoading) {
    return <div className={styles.formFillerPage}>Loading form...</div>;
  }

  if (error || !form) {
    return (
      <div className={styles.formFillerPage}>
        <div className={styles.formFillerPage__card}>
          <p className={styles.formFillerPage__error}>Form not found.</p>
          <Link to="/" className={styles.formFillerPage__actionLink}>
            Back to main
          </Link>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className={styles.formFillerPage}>
        <div className={styles.formFillerPage__success}>
          <h2 className={styles.formFillerPage__successTitle}>
            Form submitted successfully!
          </h2>
          <Link to="/" className={styles.formFillerPage__actionLink}>
            Back to main
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    if (!filler.validate()) {
      setValidationError("Please fill in all required fields.");
      return;
    }
    try {
      await submitResponse({
        formId: id,
        answers: filler.toSubmitFormat(),
      }).unwrap();
      setSubmitted(true);
    } catch (requestError: unknown) {
      reportClientError("Failed to submit response", requestError);
      setValidationError(
        toErrorMessage(requestError, "Failed to submit form. Please try again."),
      );
    }
  };

  return (
    <div className={styles.formFillerPage}>
      <div className={styles.formFillerPage__card}>
        <div className={styles.formFillerPage__topActions}>
          <Link to="/" className={styles.formFillerPage__actionLink}>
            Back to main
          </Link>
        </div>
        <h1 className={styles.formFillerPage__cardTitle}>{form.title}</h1>
        {form.description && (
          <p className={styles.formFillerPage__cardDescription}>
            {form.description}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          {validationError && (
            <p className={styles.formFillerPage__error}>{validationError}</p>
          )}
          {form.questions.map((q) => (
            <QuestionRenderer
              key={q.id}
              question={q}
              value={filler.answers[q.id]}
              onChange={(val) => filler.setAnswer(q.id, val)}
            />
          ))}

          <button
            type="submit"
            disabled={isSubmitting}
            className={styles.formFillerPage__submitButton}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
}
