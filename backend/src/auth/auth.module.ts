import { Module } from '@nestjs/common';
import { NeonAuthService } from './neon-auth.service';

@Module({
  providers: [NeonAuthService],
  exports: [NeonAuthService],
})
export class AuthModule {}
