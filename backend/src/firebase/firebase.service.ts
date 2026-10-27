import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { App, cert, getApps, initializeApp } from 'firebase-admin/app';
import { Auth, getAuth } from 'firebase-admin/auth';
import { Firestore, getFirestore } from 'firebase-admin/firestore';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name);
  private app: App | null = null;
  private isConfigured = false;

  onModuleInit() {
    this.initFirebase();
  }

  private initFirebase() {
    const existingApps = getApps();
    if (existingApps.length > 0) {
      this.app = existingApps[0]!;
      this.isConfigured = true;
      return;
    }

    const keyPath =
      process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH ||
      process.env.GOOGLE_APPLICATION_CREDENTIALS ||
      path.resolve(process.cwd(), 'serviceAccountKey.json');

    if (fs.existsSync(keyPath)) {
      try {
        const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
        this.app = initializeApp({
          credential: cert(serviceAccount),
        });
        this.isConfigured = true;
        this.logger.log(`Initialized Firebase Admin SDK from key file: ${keyPath}`);
        return;
      } catch (err) {
        this.logger.error(`Failed to read Firebase service account key from ${keyPath}`, err);
      }
    }

    const projectId = process.env.FIREBASE_PROJECT_ID || 'qv-platform';
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (projectId && clientEmail && privateKey) {
      this.app = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      this.isConfigured = true;
      this.logger.log(`Initialized Firebase Admin SDK for project ${projectId}`);
      return;
    }

    if (projectId) {
      try {
        this.app = initializeApp({ projectId });
        this.isConfigured = true;
        this.logger.log(`Initialized Firebase Admin SDK with Project ID: ${projectId}`);
        return;
      } catch (err) {
        this.logger.warn(`Could not initialize with projectId ${projectId}: ${err}`);
      }
    }

    try {
      this.app = initializeApp();
      this.isConfigured = true;
      this.logger.log('Initialized Firebase Admin with default application credentials');
    } catch {
      this.logger.warn(
        'Firebase credentials not configured. Please set FIREBASE_PROJECT_ID in backend/.env',
      );
    }
  }

  get auth(): Auth {
    if (!this.app || !this.isConfigured) {
      throw new Error(
        'Firebase Auth is not configured. Please provide Firebase credentials in backend/.env',
      );
    }
    return getAuth(this.app);
  }

  get firestore(): Firestore {
    if (!this.app || !this.isConfigured) {
      throw new Error(
        'Cloud Firestore is not configured. Please provide Firebase credentials in backend/.env',
      );
    }
    return getFirestore(this.app);
  }

  get ready(): boolean {
    return this.isConfigured && this.app !== null;
  }
}
