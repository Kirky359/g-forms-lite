import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../../context";
import { isValidEmail } from "@forms/shared";
import { QuestionRenderer } from "../../components/QuestionRenderer";
import { useFormFiller } from "../../hooks";
import {
  useGetFormQuery,
  useSubmitResponseMutation,
} from "../../store/formsApi.endpoints";
import { reportClientError, toErrorMessage } from "../../utils";
import styles from "./FormFillerPage.module.scss";

export function FormFillerPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [respondentEmail, setRespondentEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
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
          {user && (
            <Link to="/" className={styles.formFillerPage__actionLink}>
              Back to main
            </Link>
          )}
        </div>
      </div>
    );
  }

  const validateEmail = (value: string): string | null => {
    if (!value.trim()) return "Email address is required.";
    if (!isValidEmail(value)) return "Enter a valid email address (e.g. name@example.com).";
    return null;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRespondentEmail(e.target.value);
    if (emailError) setEmailError(validateEmail(e.target.value));
  };

  const handleEmailBlur = () => {
    if (respondentEmail) setEmailError(validateEmail(respondentEmail));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (form.requireEmail) {
      const err = validateEmail(respondentEmail);
      if (err) {
        setEmailError(err);
        return;
      }
      setEmailError(null);
    }

    if (!filler.validate()) {
      setValidationError("Please fill in all required fields.");
      return;
    }

    try {
      await submitResponse({
        formId: id,
        answers: filler.toSubmitFormat(),
        respondentEmail: form.requireEmail ? respondentEmail : undefined,
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
        {user && (
          <div className={styles.formFillerPage__topActions}>
            <Link to="/" className={styles.formFillerPage__actionLink}>
              Back to main
            </Link>
          </div>
        )}
        <h1 className={styles.formFillerPage__cardTitle}>{form.title}</h1>
        {form.description && (
          <p className={styles.formFillerPage__cardDescription}>
            {form.description}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          {form.requireEmail && (
            <div className={styles.formFillerPage__emailSection}>
              <label
                htmlFor="respondent-email"
                className={styles.formFillerPage__emailLabel}
              >
                Your email address <span className={styles.formFillerPage__required}>*</span>
              </label>
              <input
                id="respondent-email"
                type="email"
                value={respondentEmail}
                onChange={handleEmailChange}
                onBlur={handleEmailBlur}
                placeholder="you@example.com"
                autoComplete="email"
                className={`${styles.formFillerPage__emailInput} ${emailError ? styles["formFillerPage__emailInput--error"] : ""}`}
              />
              {emailError && (
                <span className={styles.formFillerPage__emailError}>
                  {emailError}
                </span>
              )}
            </div>
          )}

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