import { GraphQLClient } from "graphql-request";

function getGraphQLUrl(): string {
  if (import.meta.env.VITE_API_URL) {
    return `${import.meta.env.VITE_API_URL}/graphql`;
  }
  if (typeof window === "undefined") {
    return "http://localhost:4000/graphql";
  }
  return `${window.location.origin}/graphql`;
}

export const graphqlClient = new GraphQLClient(getGraphQLUrl());
