import {
  Body,
  Controller,
  Get,
  Inject,
  Patch,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { FirebaseAuthGuard, type AuthenticatedRequest } from '../auth/firebase-auth.guard';
import { UsersService, type UserRecord } from './users.service';

interface UpdateMeBody {
  name?: string;
  fullName?: string | null;
}

@Controller('users')
@UseGuards(FirebaseAuthGuard)
export class UsersController {
  constructor(
    @Inject(UsersService) private readonly users: UsersService,
  ) {}

  @Get('me')
  async me(@Req() req: AuthenticatedRequest) {
    const user = await this.currentUser(req);
    return this.toResponse(user);
  }

  @Patch('me')
  async updateMe(
    @Req() req: AuthenticatedRequest,
    @Body() body: UpdateMeBody,
  ) {
    const current = await this.currentUser(req);
    const updated = await this.users.updateProfile(current.id, body);
    return this.toResponse(updated);
  }

  private async currentUser(req: AuthenticatedRequest): Promise<UserRecord> {
    const authUser = req.user;
    if (!authUser?.id) {
      throw new UnauthorizedException('Not authenticated');
    }
    const user = await this.users.findById(authUser.id, {
      email: authUser.email,
      name: authUser.name,
    });
    if (!user.isActive) {
      throw new UnauthorizedException('Inactive user');
    }
    return user;
  }

  private toResponse(user: UserRecord) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      full_name: user.fullName,
      is_active: user.isActive,
      is_superuser: user.isSuperuser,
      created_at: user.createdAt,
      updated_at: user.updatedAt,
    };
  }
}
