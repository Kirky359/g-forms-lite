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
              questions {
                id
                type
                text
                options
                required
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
              questions {
                id
                type
                text
                options
                required
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
        questions?: Array<{
          type: string;
          text: string;
          options?: string[];
          required?: boolean;
        }>;
      }
    >({
      query: (variables) => ({
        document: gql`
          mutation CreateForm(
            $title: String!
            $description: String
            $questions: [QuestionInputDto!]
          ) {
            createForm(
              title: $title
              description: $description
              questions: $questions
            ) {
              id
              title
              description
              questions {
                id
                type
                text
                options
                required
              }
            }
          }
        `,
        variables,
      }),
      invalidatesTags: ["Form"],
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
      { formId: string; answers: Array<{ questionId: string; value: string }> }
    >({
      query: (variables) => ({
        document: gql`
          mutation SubmitResponse(
            $formId: ID!
            $answers: [AnswerInputDto!]!
          ) {
            submitResponse(formId: $formId, answers: $answers) {
              id
              formId
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
  useDeleteFormMutation,
  useGetResponsesQuery,
  useSubmitResponseMutation,
} = formsApiEndpoints;
