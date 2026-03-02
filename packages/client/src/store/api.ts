import { createApi, BaseQueryFn, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { print } from 'graphql';
import type { DocumentNode } from 'graphql';
import { graphqlClient } from '../services/graphql';

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
    const result = await graphqlClient.request(
      print(document),
      variables as Record<string, unknown>
    );
    return { data: result };
  } catch (error) {
    return {
      error: {
        status: 'CUSTOM_ERROR',
        error: error instanceof Error ? error.message : 'Unknown error',
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
