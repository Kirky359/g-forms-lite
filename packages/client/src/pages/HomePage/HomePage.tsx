import { useState } from "react";
import { Link } from "react-router-dom";
import { useGetFormsQuery, useDeleteFormMutation } from "../../store/formsApi.endpoints";
import { useAuth } from "../../context/AuthContext";
import { toErrorMessage } from "../../utils/error";
import styles from "./HomePage.module.scss";

export function HomePage() {
  const { user, signOut } = useAuth();
  const { data, isLoading, error } = useGetFormsQuery();
  const [deleteForm, { isLoading: isDeleting }] = useDeleteFormMutation();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyLink = (id: string): void => {
    const url = `${window.location.origin}/forms/${id}/fill`;
    void navigator.clipboard.writeText(url).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const handleDeleteForm = async (id: string): Promise<void> => {
    const isConfirmed = window.confirm("Delete this form and remove it from the main menu?");
    if (!isConfirmed) {
      return;
    }
    try {
      await deleteForm({ id }).unwrap();
    } catch (requestError: unknown) {
      window.alert(toErrorMessage(requestError, "Failed to delete form."));
    }
  };

  return (
    <div className={styles.homePage}>
      <header className={styles.homePage__header}>
        <h1 className={styles.homePage__title}>Forms Lite</h1>
        <div className={styles.homePage__headerActions}>
          <span className={styles.homePage__userEmail}>{user?.email}</span>
          <Link to="/forms/new" className={styles.homePage__createButton}>
            Create New Form
          </Link>
          <button
            type="button"
            className={styles.homePage__signOutButton}
            onClick={() => void signOut()}
          >
            Sign Out
          </button>
        </div>
      </header>

      {isLoading && (
        <p className={styles.homePage__message}>Loading forms...</p>
      )}
      {error && (
        <p className={styles.homePage__error}>
          Failed to load forms:{" "}
          {toErrorMessage(error, "Unknown error")}
        </p>
      )}

      {data?.forms && data.forms.length === 0 && (
        <p className={styles.homePage__message}>
          No forms yet. Create your first form!
        </p>
      )}

      {data?.forms && data.forms.length > 0 && (
        <ul className={styles.homePage__formList}>
          {data.forms.map((form) => (
            <li key={form.id} className={styles.homePage__formCard}>
              <h2 className={styles.homePage__formCardTitle}>{form.title}</h2>
              {form.description && (
                <p className={styles.homePage__formCardDescription}>
                  {form.description}
                </p>
              )}
              <div className={styles.homePage__formCardActions}>
                <Link
                  to={`/forms/${form.id}/fill`}
                  className={styles.homePage__actionLink}
                >
                  View Form
                </Link>
                <button
                  type="button"
                  className={`${styles.homePage__copyButton} ${copiedId === form.id ? styles["homePage__copyButton--copied"] : ""}`}
                  onClick={() => handleCopyLink(form.id)}
                >
                  {copiedId === form.id ? "Copied!" : "Copy Link"}
                </button>
                <Link
                  to={`/forms/${form.id}/edit`}
                  className={styles.homePage__actionLink}
                >
                  Edit
                </Link>
                <Link
                  to={`/forms/${form.id}/responses`}
                  className={styles.homePage__actionLink}
                >
                  View Responses
                </Link>
                <button
                  type="button"
                  className={styles.homePage__deleteButton}
                  onClick={() => void handleDeleteForm(form.id)}
                  disabled={isDeleting}
                >
                  Delete Form
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
