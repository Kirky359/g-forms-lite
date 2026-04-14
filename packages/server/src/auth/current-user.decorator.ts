import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import type { DecodedIdToken } from 'firebase-admin/auth';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): DecodedIdToken => {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext<{ req: { user: DecodedIdToken } }>().req.user;
  },
);