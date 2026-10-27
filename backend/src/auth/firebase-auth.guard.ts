import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { FirebaseService } from '../firebase/firebase.service';

export interface AuthenticatedUser {
  id: string;
  email?: string;
  name?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(
    @Inject(FirebaseService) private readonly firebaseService: FirebaseService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }

    const token = authHeader.substring(7).trim();
    if (!token) {
      throw new UnauthorizedException('Missing Bearer token');
    }

    try {
      const decoded = await this.firebaseService.auth.verifyIdToken(token);
      request.user = {
        id: decoded.uid,
        email: decoded.email,
        name: (decoded.name as string) || undefined,
      };
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid or expired token';
      throw new UnauthorizedException(`Authentication failed: ${message}`);
    }
  }
}
