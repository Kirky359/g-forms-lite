import { gql } from "graphql-tag";
import { formsApi } from "./api";
import type { Form, Response } from "@forms/shared";

export const formsApiEndpoints = formsApi.injectEndpoints({
  endpoints: (builder) => ({
    getForms: builder.query<{ forms: Form[] }, void>({
      query: () => ({
        document: gql`
          query Forms {
            forms {
              id
              title
              description
              requireEmail
              questions {
                id
                type
                text
                options
                required
                correctAnswer
              }
            }
          }
        `,
      }),
      providesTags: ["Form"],
    }),
    getForm: builder.query<{ form: Form | null }, { id: string }>({
      query: (variables) => ({
        document: gql`
          query Form($id: ID!) {
            form(id: $id) {
              id
              title
              description
              requireEmail
              questions {
                id
                type
                text
                options
                required
                correctAnswer
              }
            }
          }
        `,
        variables,
      }),
      providesTags: (_result, _error, { id }) => [{ type: "Form", id }],
    }),
    createForm: builder.mutation<
      { createForm: Form },
      {
        title: string;
        description?: string;
        requireEmail?: boolean;
        questions?: Array<{
          type: string;
          text: string;
          options?: string[];
          required?: boolean;
          correctAnswer?: string;
        }>;
      }
    >({
      query: (variables) => ({
        document: gql`
          mutation CreateForm(
            $title: String!
            $description: String
            $requireEmail: Boolean
            $questions: [QuestionInputDto!]
          ) {
            createForm(
              title: $title
              description: $description
              requireEmail: $requireEmail
              questions: $questions
            ) {
              id
              title
              description
              requireEmail
              questions {
                id
                type
                text
                options
                required
                correctAnswer
              }
            }
          }
        `,
        variables,
      }),
      invalidatesTags: ["Form"],
    }),
    updateForm: builder.mutation<
      { updateForm: Form },
      {
        id: string;
        title: string;
        description?: string;
        requireEmail?: boolean;
        questions: Array<{
          type: string;
          text: string;
          options?: string[];
          required?: boolean;
          correctAnswer?: string;
        }>;
      }
    >({
      query: (variables) => ({
        document: gql`
          mutation UpdateForm(
            $id: ID!
            $title: String!
            $description: String
            $requireEmail: Boolean
            $questions: [QuestionInputDto!]!
          ) {
            updateForm(
              id: $id
              title: $title
              description: $description
              requireEmail: $requireEmail
              questions: $questions
            ) {
              id
              title
              description
              requireEmail
              questions {
                id
                type
                text
                options
                required
                correctAnswer
              }
            }
          }
        `,
        variables,
      }),
      invalidatesTags: (_result, _error, { id }) => ['Form', { type: 'Form', id }],
    }),
    deleteForm: builder.mutation<{ deleteForm: boolean }, { id: string }>({
      query: (variables) => ({
        document: gql`
          mutation DeleteForm($id: ID!) {
            deleteForm(id: $id)
          }
        `,
        variables,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        "Form",
        { type: "Responses", id },
      ],
    }),
    getResponses: builder.query<{ responses: Response[] }, { formId: string }>({
      query: (variables) => ({
        document: gql`
          query Responses($formId: ID!) {
            responses(formId: $formId) {
              id
              formId
              respondentEmail
              score
              answers {
                questionId
                value
              }
            }
          }
        `,
        variables,
      }),
      providesTags: (_result, _error, { formId }) => [
        { type: "Responses", id: formId },
      ],
    }),
    submitResponse: builder.mutation<
      { submitResponse: Response },
      {
        formId: string;
        answers: Array<{ questionId: string; value: string }>;
        respondentEmail?: string;
      }
    >({
      query: (variables) => ({
        document: gql`
          mutation SubmitResponse(
            $formId: ID!
            $answers: [AnswerInputDto!]!
            $respondentEmail: String
          ) {
            submitResponse(
              formId: $formId
              answers: $answers
              respondentEmail: $respondentEmail
            ) {
              id
              formId
              respondentEmail
              score
              answers {
                questionId
                value
              }
            }
          }
        `,
        variables,
      }),
      invalidatesTags: (_result, _error, { formId }) => [
        { type: "Responses", id: formId },
      ],
    }),
  }),
});

export const {
  useGetFormsQuery,
  useGetFormQuery,
  useCreateFormMutation,
  useUpdateFormMutation,
  useDeleteFormMutation,
  useGetResponsesQuery,
  useSubmitResponseMutation,
} = formsApiEndpoints;