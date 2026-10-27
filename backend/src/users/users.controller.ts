import { Body, Controller, Get, Inject, Patch, Req, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { auth } from '../auth/auth';
import { UsersService } from './users.service';

interface UpdateMeBody {
  name?: string;
  fullName?: string | null;
}

@Controller('users')
export class UsersController {
  constructor(@Inject(UsersService) private readonly users: UsersService) {}

  @Get('me')
  async me(@Req() req: Request) {
    const user = await this.currentUser(req);
    return this.toResponse(user);
  }

  @Patch('me')
  async updateMe(@Req() req: Request, @Body() body: UpdateMeBody) {
    const current = await this.currentUser(req);
    const updated = await this.users.updateProfile(current.id, body);
    return this.toResponse(updated);
  }

  private async currentUser(req: Request) {
    const session = await auth.api.getSession({
      headers: new Headers(req.headers as Record<string, string>),
    });
    if (!session) {
      throw new UnauthorizedException('Not authenticated');
    }
    const user = await this.users.findById(session.user.id);
    if (!user.isActive) {
      throw new UnauthorizedException('Inactive user');
    }
    return user;
  }

  private toResponse(user: {
    id: string;
    email: string;
    name: string;
    fullName: string | null;
    isActive: boolean;
    isSuperuser: boolean;
    createdAt: Date;
    updatedAt: Date;
  }) {
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
