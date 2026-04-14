import { ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { Request, Response } from 'express';

/**
 * Extends the default ThrottlerGuard to work with the GraphQL execution context.
 * NestJS's default guard reads from the HTTP context; GraphQL wraps it one level
 * deeper, so we must extract req/res from the GQL context manually.
 */
@Injectable()
export class GqlThrottlerGuard extends ThrottlerGuard {
  getRequestResponse(context: ExecutionContext): { req: Request; res: Response } {
    const gqlCtx = GqlExecutionContext.create(context);
    const ctx = gqlCtx.getContext<{ req: Request; res: Response }>();
    return { req: ctx.req, res: ctx.res };
  }
}