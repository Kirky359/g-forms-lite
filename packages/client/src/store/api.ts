import { createApi, BaseQueryFn, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { print } from 'graphql';
import type { DocumentNode } from 'graphql';
import { graphqlClient, auth } from '../services';
import { toErrorMessage } from '../utils';

type GraphQLQueryArg = {
  document: DocumentNode;
  variables?: Record<string, unknown>;
};

const graphqlBaseQuery: BaseQueryFn<
  GraphQLQueryArg,
  unknown,
  FetchBaseQueryError
> = async ({ document, variables }) => {
  try {
    const token = await auth.currentUser?.getIdToken();
    const requestHeaders: Record<string, string> = token
      ? { Authorization: `Bearer ${token}` }
      : {};

    const result = await graphqlClient.request(
      print(document),
      variables as Record<string, unknown>,
      requestHeaders,
    );
    return { data: result };
  } catch (error) {
    return {
      error: {
        status: 'CUSTOM_ERROR',
        error: toErrorMessage(error, 'Unknown error'),
      } as FetchBaseQueryError,
    };
  }
};

export const formsApi = createApi({
  reducerPath: 'formsApi',
  baseQuery: graphqlBaseQuery,
  tagTypes: ['Form', 'Responses'],
  endpoints: () => ({}),
});
