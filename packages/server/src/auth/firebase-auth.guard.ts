import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { getAuth } from 'firebase-admin/auth';
import './firebase-admin';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const req = ctx.getContext<{ req: Record<string, unknown> }>().req;
    const authHeader = (req.headers as Record<string, string>)['authorization'];
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      throw new UnauthorizedException('Missing auth token');
    }

    try {
      req['user'] = await getAuth().verifyIdToken(token);
      return true;
    } catch {
      throw new UnauthorizedException('Invalid auth token');
    }
  }
}