import { Catch, ArgumentsHost } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { GqlArgumentsHost } from '@nestjs/graphql';

/**
 * NestJS's default BaseExceptionFilter assumes an HTTP context and calls
 * response.header(...), which fails for GraphQL requests where no plain HTTP
 * response object is available.  This filter re-throws the exception for
 * GraphQL requests so Apollo can surface it as a proper GraphQLError, and
 * delegates everything else to the standard HTTP handler.
 */
@Catch()
export class GqlExceptionFilter extends BaseExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const gqlHost = GqlArgumentsHost.create(host);
    if ((gqlHost.getType() as string) === 'graphql') {
      throw exception;
    }
    super.catch(exception, host);
  }
}