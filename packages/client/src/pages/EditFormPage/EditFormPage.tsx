import { useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { FormBuilderForm } from '../../components/FormBuilderForm';
import { useFormBuilder, isQuestionTypeValue } from '../../hooks/useFormBuilder';
import { useGetFormQuery, useUpdateFormMutation } from '../../store/formsApi.endpoints';
import { reportClientError, getRtkErrorMessage } from '../../utils/error';
import styles from '../FormBuilderPage/FormBuilderPage.module.scss';

export function EditFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading } = useGetFormQuery({ id: id ?? '' }, { skip: !id });
  const [updateForm, { isLoading: isSaving, error }] = useUpdateFormMutation();
  const builder = useFormBuilder();
  const initialized = useRef(false);

  useEffect(() => {
    if (data?.form && !initialized.current) {
      initialized.current = true;
      builder.initialize({
        title: data.form.title,
        description: data.form.description ?? '',
        requireEmail: data.form.requireEmail,
        questions: data.form.questions.map((q) => ({
          id: q.id,
          type: isQuestionTypeValue(q.type) ? q.type : 'TEXT',
          text: q.text,
          options: q.options ?? [],
          required: q.required ?? false,
          correctAnswer: q.correctAnswer ?? undefined,
        })),
      });
    }
  }, [data?.form, builder.initialize]);

  const canSave = builder.title.trim().length > 0 && builder.questions.length > 0;

  const handleSave = async () => {
    if (!id || !canSave) return;
    try {
      await updateForm({ id, ...builder.toMutationInput() }).unwrap();
      navigate(`/forms/${id}/fill`);
    } catch (requestError: unknown) {
      reportClientError('Failed to update form', requestError);
    }
  };

  if (isLoading) {
    return <div className={styles.formBuilderPage}>Loading form...</div>;
  }

  if (!data?.form) {
    return (
      <div className={styles.formBuilderPage}>
        <p>Form not found. <Link to="/">Back to home</Link></p>
      </div>
    );
  }

  const errorMessage = getRtkErrorMessage(error);

  return (
    <FormBuilderForm
      builder={builder}
      pageTitle="Edit Form"
      saveLabel="Save Changes"
      isSaving={isSaving}
      canSave={canSave}
      onSave={handleSave}
      onCancel={() => navigate(`/forms/${id}/fill`)}
      error={errorMessage}
    />
  );
}