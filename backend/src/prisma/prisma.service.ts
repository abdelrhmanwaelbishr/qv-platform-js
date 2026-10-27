import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Prisma connects on the first query rather than in `onModuleInit`.
 *
 * Nest only calls `listen()` after module init hooks finish, and Vercel's
 * function runtime treats the HTTP server as missing if it has not started
 * listening yet. An eager `$connect()` therefore adds a full database round
 * trip (Neon can take seconds to wake) to every cold start, so it stays lazy.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
