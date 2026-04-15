import { useNavigate } from 'react-router-dom';
import { FormBuilderForm } from '../../components/FormBuilderForm';
import { useFormBuilder } from '../../hooks/useFormBuilder';
import { useCreateFormMutation } from '../../store/formsApi.endpoints';
import { reportClientError, getRtkErrorMessage } from '../../utils/error';

export function FormBuilderPage() {
  const navigate = useNavigate();
  const [createForm, { isLoading, error }] = useCreateFormMutation();
  const builder = useFormBuilder();
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

  const errorMessage = getRtkErrorMessage(error);

  return (
    <FormBuilderForm
      builder={builder}
      pageTitle="Create New Form"
      saveLabel="Save Form"
      isSaving={isLoading}
      canSave={canSave}
      onSave={handleSave}
      onCancel={() => navigate('/')}
      error={errorMessage}
    />
  );
}