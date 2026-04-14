import { Injectable } from '@nestjs/common';
import { getAuth } from 'firebase-admin/auth';
import './firebase-admin';

@Injectable()
export class AuthService {
  async checkMethods(email: string): Promise<string[]> {
    try {
      const user = await getAuth().getUserByEmail(email);
      return user.providerData.map((p) =>
        p.providerId === 'google.com' ? 'google' : 'password',
      );
    } catch {
      return [];
    }
  }
}