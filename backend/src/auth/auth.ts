import 'dotenv/config';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from '@prisma/client';
import { allowedOrigins, resolveBaseUrl } from './origins';

const prisma = new PrismaClient();

export const auth = betterAuth({
  baseURL: resolveBaseUrl(),
  basePath: '/api/auth',
  secret: process.env.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
  },
  trustedOrigins: allowedOrigins(),
});

export type Auth = typeof auth;
