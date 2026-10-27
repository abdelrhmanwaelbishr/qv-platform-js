import { Module } from '@nestjs/common';
import { FirebaseAuthGuard } from './firebase-auth.guard';
import { NeonAuthService } from './neon-auth.service';

@Module({
  providers: [FirebaseAuthGuard, NeonAuthService],
  exports: [FirebaseAuthGuard, NeonAuthService],
})
export class AuthModule {}
