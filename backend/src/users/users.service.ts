import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';

export interface UserRecord {
  id: string;
  email: string;
  name: string;
  fullName: string | null;
  isActive: boolean;
  isSuperuser: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileInput {
  name?: string;
  fullName?: string | null;
}

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @Inject(FirebaseService) private readonly firebase: FirebaseService,
  ) {}

  private get collection() {
    return this.firebase.firestore.collection('users');
  }

  async findById(
    id: string,
    fallbackUser?: { email?: string; name?: string },
  ): Promise<UserRecord> {
    try {
      const docRef = this.collection.doc(id);
      const snap = await docRef.get();

      if (snap.exists) {
        const data = snap.data()!;
        return {
          id,
          email: data.email || '',
          name: data.name || data.fullName || data.email?.split('@')[0] || 'User',
          fullName: data.fullName ?? data.full_name ?? null,
          isActive: data.isActive ?? data.is_active ?? true,
          isSuperuser: data.isSuperuser ?? data.is_superuser ?? false,
          createdAt: data.createdAt || data.created_at || new Date().toISOString(),
          updatedAt: data.updatedAt || data.updated_at || new Date().toISOString(),
        };
      }

      // Auto-provision from Firebase Auth if document does not exist yet
      try {
        const authUser = await this.firebase.auth.getUser(id);
        const now = new Date().toISOString();
        const newUser: UserRecord = {
          id,
          email: authUser.email || '',
          name: authUser.displayName || authUser.email?.split('@')[0] || 'User',
          fullName: authUser.displayName || null,
          isActive: !authUser.disabled,
          isSuperuser: false,
          createdAt: authUser.metadata.creationTime || now,
          updatedAt: now,
        };

        await docRef.set({
          email: newUser.email,
          name: newUser.name,
          fullName: newUser.fullName,
          isActive: newUser.isActive,
          isSuperuser: newUser.isSuperuser,
          createdAt: newUser.createdAt,
          updatedAt: newUser.updatedAt,
        });

        return newUser;
      } catch {
        // Fall through to fallbackUser
      }
    } catch (firestoreErr) {
      this.logger.warn(`Firestore read failed, falling back to verified token payload: ${firestoreErr}`);
    }

    if (fallbackUser) {
      const now = new Date().toISOString();
      return {
        id,
        email: fallbackUser.email || '',
        name: fallbackUser.name || fallbackUser.email?.split('@')[0] || 'User',
        fullName: fallbackUser.name || null,
        isActive: true,
        isSuperuser: false,
        createdAt: now,
        updatedAt: now,
      };
    }

    throw new NotFoundException('User not found');
  }

  async updateProfile(id: string, input: UpdateProfileInput): Promise<UserRecord> {
    const existing = await this.findById(id);
    const now = new Date().toISOString();

    try {
      const docRef = this.collection.doc(id);
      const updates: Record<string, unknown> = {
        updatedAt: now,
      };

      if (input.name !== undefined) {
        updates.name = input.name;
      }
      if (input.fullName !== undefined) {
        updates.fullName = input.fullName;
      }

      await docRef.set(updates, { merge: true });
    } catch (err) {
      this.logger.warn(`Firestore write failed: ${err}`);
    }

    return {
      ...existing,
      name: input.name ?? existing.name,
      fullName: input.fullName !== undefined ? input.fullName : existing.fullName,
      updatedAt: now,
    };
  }
}
